/**
 * Minipower — trace:check (ADR-020 QĐ-5 · C8). Chạy trong CI dự án đích.
 *
 * Kiểm **xương sống trace** `UC → FR → AC → Test` bằng ID ổn định. Đây là điều
 * kiện cứng DUY NHẤT nằm ở CI thay vì hook — vì nó cần đọc cả cây `docs/`, quá
 * đắt để chạy mỗi prompt.
 *
 * Ranh giới cố ý:
 *   FAIL — ID **trỏ sai** (tham chiếu tới ID không tồn tại) hoặc **khai trùng**
 *          ở hai chỗ. Hai lỗi này máy chắc chắn đúng, và im lặng thì trace mục nát.
 *   WARN — FR chưa có AC, AC chưa có Test. Đây là *chưa làm*, không phải *làm sai*.
 *
 * **Không phạt vì tài liệu chưa viết.** Tài liệu xây dần theo tiến trình, thiếu DOC là bình thường (QĐ-2).
 * Module chưa có DOC-07 thì không cảnh báo "FR thiếu AC" — cảnh báo đó chỉ nói lại
 * điều `doc-debt.md` đã ghi, và cảnh báo lặp là cách nhanh nhất khiến người ta
 * thôi đọc cảnh báo.
 *
 * @typedef {{id:string, file:string, line:number}} Decl
 * @typedef {{level:"fail"|"warn", code:string, message:string, file?:string, line?:number}} Finding
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

import {
  closeDb,
  dumpMarkdownIndex,
  findingsFromSqlite,
  openTraceDb,
  shouldDumpLocalDocs,
  sqliteDatabaseSync,
  upsertFaceBindings,
} from "./trace-store.js"

/** `ORD-FR-001`. Bỏ qua placeholder `{MOD}-FR-001` trong template. */
const ID_RE = /(?<!\{)\b([A-Z][A-Z0-9]{1,5})-(UC|FR|BR|AC|NFR|TC)-(\d{2,4})\b/g

/** Thư mục không tính: snapshot đã ký, khung mẫu, code cũ. */
const SKIP_DIR = new Set(["02-baseline", "_template", "_legacy", "node_modules", ".git"])

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue
      walk(join(dir, e.name), out)
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      out.push(join(dir, e.name))
    }
  }
  return out
}

/**
 * ID được **khai** ở đây không? Khai = đứng đầu một ô bảng, hoặc trong heading.
 * Nhắc giữa câu văn chỉ là **tham chiếu**.
 */
function isDeclaration(line, id) {
  const t = line.trim()
  if (/^#{1,6}\s/.test(t) && t.includes(id)) return true
  if (t.startsWith("|")) {
    const first = t.slice(1).split("|")[0].trim().replace(/\*\*/g, "")
    return first === id
  }
  return false
}

/**
 * @param {string} root project root
 * @returns {{findings: Finding[], stats: {files:number, ids:number, fails:number, warns:number}}}
 */
export function traceCheck(root) {
  /** @type {Finding[]} */
  const findings = []
  const docs = join(root, "docs")
  if (!existsSync(docs)) {
    return { findings, stats: { files: 0, ids: 0, fails: 0, warns: 0 } }
  }

  const files = walk(docs)
  /** @type {Map<string, Decl[]>} */
  const declared = new Map()
  /** @type {Map<string, {file:string,line:number}[]>} */
  const referenced = new Map()
  /** @type {Map<string, Set<string>>} id → tập ID cùng file (gộp mọi file) */
  const coFile = new Map()
  /** @type {Map<string, Set<string>>} file rel → ID trong file */
  const idsByFile = new Map()

  for (const file of files) {
    let text
    try {
      text = readFileSync(file, "utf8")
    } catch {
      continue
    }
    const rel = relative(root, file).split(sep).join("/")
    const lines = text.split(/\r?\n/)
    const idsInFile = new Set()

    lines.forEach((line, i) => {
      ID_RE.lastIndex = 0
      let m
      while ((m = ID_RE.exec(line))) {
        const id = m[0]
        idsInFile.add(id)
        if (isDeclaration(line, id)) {
          if (!declared.has(id)) declared.set(id, [])
          declared.get(id).push({ id, file: rel, line: i + 1 })
        } else {
          if (!referenced.has(id)) referenced.set(id, [])
          referenced.get(id).push({ file: rel, line: i + 1 })
        }
      }
    })
    for (const id of idsInFile) {
      if (!coFile.has(id)) coFile.set(id, new Set())
      for (const x of idsInFile) coFile.get(id).add(x)
    }
    idsByFile.set(rel, idsInFile)
  }

  // ── FAIL 1 — khai trùng ở hai file khác nhau ────────────────────────────
  for (const [id, decls] of declared) {
    const files_ = [...new Set(decls.map((d) => d.file))]
    if (files_.length > 1) {
      findings.push({
        level: "fail",
        code: "duplicate-id",
        message: `${id} khai ở ${files_.length} nơi: ${files_.join(" · ")}`,
        file: files_[0],
        line: decls[0].line,
      })
    }
  }

  // ── FAIL 2 — tham chiếu tới ID chưa khai ở đâu cả ───────────────────────
  for (const [id, refs] of referenced) {
    if (declared.has(id)) continue
    const r = refs[0]
    findings.push({
      level: "fail",
      code: "unknown-id",
      message: `${id} được nhắc nhưng không khai ở đâu (trace đứt)`,
      file: r.file,
      line: r.line,
    })
  }

  // ── WARN — FR chưa có AC, AC chưa có Test ───────────────────────────────
  // Chỉ cảnh báo khi tài liệu hạ nguồn ĐÃ TỒN TẠI. Chưa viết ≠ viết sai.
  const allIds = new Set([...declared.keys(), ...referenced.keys()])
  const hasKind = (kind) => [...allIds].some((id) => id.includes(`-${kind}-`))
  const acExists = hasKind("AC")
  const tcExists = hasKind("TC")

  const linkedTo = (id, kind) => {
    const near = coFile.get(id)
    if (near) {
      for (const other of near) if (other.includes(`-${kind}-`)) return true
    }
    for (const [otherId, refs] of referenced) {
      if (!otherId.includes(`-${kind}-`)) continue
      for (const r of refs) {
        const decls = declared.get(id) || []
        if (decls.some((d) => d.file === r.file)) return true
      }
    }
    return false
  }

  if (acExists) {
    for (const [id, decls] of declared) {
      if (!id.includes("-FR-")) continue
      if (linkedTo(id, "AC")) continue
      findings.push({
        level: "warn",
        code: "fr-no-ac",
        message: `${id} chưa thấy AC nào nối vào`,
        file: decls[0].file,
        line: decls[0].line,
      })
    }
  }

  if (tcExists) {
    for (const [id, decls] of declared) {
      if (!id.includes("-AC-")) continue
      if (linkedTo(id, "TC")) continue
      findings.push({
        level: "warn",
        code: "ac-no-test",
        message: `${id} chưa thấy Test nào nối vào`,
        file: decls[0].file,
        line: decls[0].line,
      })
    }
  }

  mergeSqlite(root, declared, idsByFile, findings)

  const fails = findings.filter((f) => f.level === "fail").length
  return {
    findings,
    stats: { files: files.length, ids: allIds.size, fails, warns: findings.length - fails },
  }
}

/**
 * Đổ markdown → SQLite khi docs=local; luôn đọc DB nếu đã có (T4: thiếu link FR→AC).
 * @param {string} root
 * @param {Map<string, {id:string, file:string, line:number}[]>} declared
 * @param {Map<string, Set<string>>} idsByFile
 * @param {Finding[]} findings
 */
function mergeSqlite(root, declared, idsByFile, findings) {
  if (!sqliteDatabaseSync()) return
  const dbFile = join(root, "memory", "trace.db")
  const dump = shouldDumpLocalDocs(root)
  if (!dump && !existsSync(dbFile)) return

  let db
  try {
    db = openTraceDb(root)
    if (!db) return
    upsertFaceBindings(db, root)
    if (dump) {
      const decls = [...declared.values()].flat()
      dumpMarkdownIndex(db, decls, idsByFile)
    }
    const extra = findingsFromSqlite(db)
    const seen = new Set(findings.map((f) => `${f.code}|${f.message}`))
    for (const f of extra) {
      const k = `${f.code}|${f.message}`
      if (seen.has(k)) continue
      seen.add(k)
      findings.push(f)
    }
  } catch {
    // SQLite experimental / schema lệch: không phá markdown check.
  } finally {
    closeDb(db)
  }
}

/** Báo cáo cho người đọc trong log CI. */
export function formatReport(result) {
  const { findings, stats } = result
  if (!findings.length) {
    return `[trace:check] OK — ${stats.ids} ID trong ${stats.files} file, không lỗi.`
  }
  const line = (f) =>
    `  ${f.level === "fail" ? "✖" : "⚠"} [${f.code}] ${f.message}` +
    (f.file ? `\n      ${f.file}:${f.line}` : "")
  const fails = findings.filter((f) => f.level === "fail")
  const warns = findings.filter((f) => f.level === "warn")
  const out = [`[trace:check] ${stats.ids} ID trong ${stats.files} file.`]
  if (fails.length) out.push(`FAIL (${fails.length}) — ID sai, phải sửa:`, ...fails.map(line))
  if (warns.length) out.push(`WARN (${warns.length}) — chưa nối đủ, không chặn:`, ...warns.map(line))
  return out.join("\n")
}
