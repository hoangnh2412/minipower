/**
 * Minipower — prereq gate @ UserPromptSubmit (ADR-020 C2 · QĐ-11d · QĐ-13).
 * SSOT: rules.json (`prereq_by_intent` × `gate_levels.prereq` × `doc_scope`).
 *
 * Đánh thức `matchIntents` — bảng `prereq_by_intent` có từ lâu nhưng CHƯA hook nào
 * gọi, nên tiền đề chỉ là câu chữ. Đây là chỗ nó thành điều kiện máy kiểm được.
 *
 * Ba tính chất, theo thứ tự quan trọng:
 *  1. **Theo module** (QĐ-13). DOC-04·05·06·07·16·19 sống trong `03-modules/{id}/`,
 *     nên "có ≥1 file DOC-06 đâu đó" KHÔNG kết luận được gì — module lệch nhịp là
 *     trạng thái ĐÚNG. Nêu module → kiểm đúng module đó; không nêu → **im lặng**.
 *  2. **Người quyết cuối** (QĐ-11d). Chặn luôn mở được bằng BYPASS; hook chỉ nhắc,
 *     không thay người quyết "đủ thông tin để làm chưa".
 *  3. **Fail-open** (R2). Không đọc được profile → chỉ WARN. Thà bỏ sót còn hơn
 *     chặn oan một dự án mà ta còn không biết nó đang ở mode nào.
 *
 * @typedef {{action:"allow"}|{action:"warn"|"block", message:string}} PrereqGateResult
 */

import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

import { shouldBypass } from "./bypass.js"
import { isMinipowerProject, projectRoot } from "./profile-guard.js"
import { docLabel, docScope, gateLevel, matchIntents, requiresForIntent, stripDiacritics } from "./rules.js"

const MODULES_DIR = ["docs", "03-modules"]

/** Segment module hợp lệ: không rỗng, không bắt đầu bằng '_' (loại _template/_legacy). */
const MODULE_SEG = /03-modules[/\\](?!_)([^/\\\s:]+)/
const MODULE_DECL = /module:\s*([a-z0-9][a-z0-9_-]*)/i
const MODULE_ID_PREFIX = /\b([A-Z][A-Z0-9]{1,5})-(?:FR|UC|BR|AC|NFR|ADR)-\d{2,}\b/

/** Tên module đã có folder thật (bỏ _template/_legacy). Lỗi đọc → []. */
function knownModules(root) {
  const dir = join(root, ...MODULES_DIR)
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
      .map((d) => d.name)
  } catch {
    return []
  }
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Trích module id từ prompt (Q9 — chốt 2026-08-21). Năm cách, dừng ở cách đầu khớp:
 * bốn pattern **tường minh** (nâng bộ nhận-diện của token-guard từ boolean thành
 * trích id) + **đối chiếu folder có thật** cho prompt tự nhiên.
 *
 * KHÔNG đoán tên tiếng Việt ("Kho" → INV): đoán sai là báo oan, mà báo oan vài lần
 * là người dùng thôi đọc cảnh báo — hỏng luôn tác dụng của gate.
 *
 * @param {string|null|undefined} prompt
 * @param {string[]|null|undefined} [filePaths]
 * @param {{root?:string}|null|undefined} [opts]
 * @returns {string|null} id, hoặc null nếu không chắc
 */
export function extractModuleId(prompt, filePaths, opts) {
  const p = String(prompt || "")
  const files = (filePaths || []).filter(Boolean).map(String)

  // 1 — khai tường minh "Module: {id}".
  const decl = MODULE_DECL.exec(p)
  if (decl) return decl[1]

  // 2 — đường dẫn trong prompt.
  const inPrompt = MODULE_SEG.exec(p)
  if (inPrompt) return inPrompt[1]

  // 3 — ID có prefix module: INV-FR-012 → INV.
  const byId = MODULE_ID_PREFIX.exec(p)
  if (byId) return byId[1]

  // 4 — attachment (Cursor @ file: path không nằm trong prompt).
  for (const f of files) {
    const m = MODULE_SEG.exec(f)
    if (m) return m[1]
  }

  // 5 — đối chiếu folder có thật. Bắt buộc trùng nguyên từ để "ord" không khớp
  // "record". Trả về tên FOLDER (đúng hoa thường trên đĩa), không phải chữ người gõ.
  const norm = stripDiacritics(p).toLowerCase()
  for (const name of knownModules(projectRoot(opts?.root))) {
    const re = new RegExp(`\\b${escapeRe(stripDiacritics(name).toLowerCase())}\\b`)
    if (re.test(norm)) return name
  }

  return null
}

/** Thư mục có file DOC-NN nào không (khớp "DOC-06-srs.md" lẫn "DOC-06.md"). */
function dirHasDoc(dir, doc) {
  try {
    const re = new RegExp(`^DOC-${doc}[-.]`, "i")
    return readdirSync(dir).some((f) => re.test(f))
  } catch {
    return false
  }
}

/** DOC cấp dự án: tìm khắp docs/ TRỪ 03-modules (module có sổ riêng). */
function hasProjectDoc(root, doc, depth = 0) {
  const docs = join(root, "docs")
  if (!existsSync(docs)) return false
  const walk = (dir, level) => {
    if (level > 3) return false
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return false
    }
    const re = new RegExp(`^DOC-${doc}[-.]`, "i")
    for (const e of entries) {
      if (e.isFile() && re.test(e.name)) return true
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === "03-modules") continue
      if (walk(join(dir, e.name), level + 1)) return true
    }
    return false
  }
  return walk(docs, depth)
}

/** DOC của ĐÚNG module đó — không được thoả bằng file của module khác (QĐ-13). */
function hasModuleDoc(root, moduleId, doc) {
  return dirHasDoc(join(root, ...MODULES_DIR, moduleId), doc)
}

function buildMessage(level, missing, moduleId) {
  const list = missing.map((m) => `  - ${m}`).join("\n")
  const head =
    level === "block"
      ? "Thiếu tiền đề trước khi làm việc này:"
      : "Có thể thiếu tiền đề cho việc này:"
  const tail =
    level === "block"
      ? "Bạn vẫn là người quyết: gõ lại prompt với BYPASS ở đầu dòng nếu đã đủ thông tin để làm."
      : "Nếu vẫn làm, ghi nợ vào memory/doc-debt.md để không quên."
  const scopeNote = moduleId
    ? `Phạm vi: module ${moduleId} (các module khác không bị ảnh hưởng).`
    : "Phạm vi: cấp dự án."
  return `[Minipower] ${head}\n${list}\n${scopeNote}\n${tail}`
}

/**
 * @param {string|null|undefined} prompt
 * @param {string[]|null|undefined} [filePaths]
 * @param {{root?:string}|null|undefined} [opts]
 * @returns {PrereqGateResult}
 */
export function checkPrereqGate(prompt, filePaths, opts) {
  const p = String(prompt || "")
  if (shouldBypass(p)) return { action: "allow" }

  const root = projectRoot(opts?.root)
  if (!isMinipowerProject(root)) return { action: "allow" }

  const intents = matchIntents(stripDiacritics(p).toLowerCase())
  if (!intents.length) return { action: "allow" }

  const level = gateLevel("prereq")
  if (level === "off") return { action: "allow" }

  const moduleId = extractModuleId(p, filePaths, { root })

  const missing = []
  const seen = new Set()
  for (const it of intents) {
    for (const doc of requiresForIntent(it.id)) {
      if (seen.has(doc)) continue
      seen.add(doc)
      if (docScope(doc) === "module") {
        // Không biết module nào → im lặng, không đoán bừa (QĐ-13).
        if (!moduleId) continue
        if (!hasModuleDoc(root, moduleId, doc)) {
          missing.push(`${docLabel(doc)} — module ${moduleId}`)
        }
      } else if (!hasProjectDoc(root, doc)) {
        missing.push(docLabel(doc))
      }
    }
  }

  if (!missing.length) return { action: "allow" }
  return { action: level, message: buildMessage(level, missing, moduleId) }
}
