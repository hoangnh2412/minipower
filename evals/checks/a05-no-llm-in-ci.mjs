/**
 * A05 — không script test/CI/hook nào được tự gọi LLM.
 *
 * Luật (ADR-026 §7.1): `A5 = 1[không script test/CI/hook nào gọi eval:run hoặc
 * claude -p]`, ngưỡng = 1, **mức chặn**. Nó canh QĐ-7 — ranh giới "máy không
 * tự tiêu tiền, không tự gọi model". Nhóm B tốn tiền thật và cần người đọc kết
 * quả, nên chỉ người được bấm.
 *
 * Phạm vi, đọc từ DỮ LIỆU chứ không từ danh sách chép tay:
 *   (a) workflow CI dưới `.github/workflows/`;
 *   (b) mọi `*.test.js|mjs|ts` trong cây;
 *   (c) mọi `.js|.mjs` dưới `src/router/hooks/bin/` và `lib/` — code hook;
 *   (d) mọi script npm trong **closure của `test` và `check*`**: đọc `scripts`
 *       của mọi `package.json`, lấy gốc là `test` cùng mọi tên khớp `^check`,
 *       cộng cặp `pre*`/`post*` mà npm tự chạy quanh chúng, rồi lần theo
 *       `npm test` · `npm run X` · `npm run X --prefix <dir>`.
 *
 * Ranh giới cố ý: chính script `eval:run` ĐƯỢC phép gọi `claude -p` — §8.4 ghi
 * nó là lệnh "chỉ người" chạy. A05 chỉ báo khi dấu hiệu nằm trong closure CI,
 * hoặc trong file test/CI/hook. Đưa `eval:run` vào chuỗi `check` là lúc nó đỏ.
 *
 * Vì sao là luật chung: closure suy từ `scripts` thật, nên thêm `check:foo` về
 * sau là tự được canh; phạm vi file suy từ cây, nên hook mới cũng vậy. Cặp
 * `pre*`/`post*` phải tính vì npm chạy chúng **tự động** — một `pretest` gọi
 * model thì `npm test` tiêu tiền mà không dòng nào trong `test` nói ra.
 *
 * **Không có lối thoát bằng marker.** Tiền lệ A16: hỏng thì sửa. Một marker ở
 * đây sẽ vô hiệu hoá đúng cái cổng cần bảo vệ — muốn gọi model trong CI thì
 * phải đổi quyết định QĐ-7, không phải thêm một dòng ngoại lệ.
 *
 * Giới hạn đã biết: A05 bắt lệnh **gọi CLI**. Một script gọi API Anthropic
 * trực tiếp bằng HTTP nằm ngoài tầm — mở rộng khi có nhu cầu thật.
 */

import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { walk, readText, relTo, lineAt, result, REPO_ROOT, isExempt } from "./lib.mjs"

/** Dấu hiệu gọi model, giữ đúng chữ của ADR §7.1 cộng biến thể `claude-code`. */
const LLM = [
  { re: /\bclaude(?:-code)?\s+(?:-p|--print)\b/, what: "`claude -p`" },
  { re: /\beval:run\b/, what: "`eval:run`" },
]

/** Gốc closure: `test` và mọi script bắt đầu bằng `check`. */
const CI_ROOT = /^check/

const HOOK_DIRS = [
  ["src", "router", "hooks", "bin"],
  ["src", "router", "hooks", "lib"],
]

function llmHit(text) {
  for (const { re, what } of LLM) {
    const m = re.exec(text)
    if (m) return { what, index: m.index }
  }
  return null
}

/** `npm run X --prefix dir` / `npm test` trong một thân script. */
export function referenced(body) {
  const out = []
  for (const seg of body.split(/&&|\|\||;/)) {
    const m = seg.match(/npm\s+(?:run\s+([^\s-]\S*)|test)\b/)
    if (!m) continue
    const pfx = seg.match(/--prefix[=\s]+(\S+)/)
    out.push({ name: m[1] || "test", prefix: pfx ? pfx[1] : null })
  }
  return out
}

/** Mọi `package.json` trong cây → thư mục chứa nó và object `scripts`. */
function scriptsByDir(root) {
  const byDir = new Map()
  for (const p of walk(root, { exts: ["package.json"] })) {
    const raw = readText(p)
    if (raw === null) continue
    let json
    try {
      json = JSON.parse(raw)
    } catch (e) {
      process.stderr.write(`[evals] A05: ${relTo(root, p)} không phải JSON hợp lệ: ${e.message}\n`)
      continue
    }
    const scripts = json && typeof json.scripts === "object" && json.scripts ? json.scripts : {}
    byDir.set(dirname(p), scripts)
  }
  return byDir
}

/**
 * Closure các script npm mà CI thực sự chạy.
 * @returns {{dir:string, name:string, body:string}[]}
 */
export function ciClosure(root) {
  const byDir = scriptsByDir(root)
  const queue = []
  const push = (dir, name) => {
    const scripts = byDir.get(dir)
    if (!scripts) return
    for (const n of [name, `pre${name}`, `post${name}`]) {
      if (typeof scripts[n] === "string") queue.push([dir, n])
    }
  }

  for (const [dir, scripts] of byDir) {
    for (const name of Object.keys(scripts)) {
      if (name === "test" || CI_ROOT.test(name)) push(dir, name)
    }
  }

  const seen = new Set()
  const out = []
  while (queue.length) {
    const [dir, name] = queue.pop()
    const key = `${dir}::${name}`
    if (seen.has(key)) continue
    seen.add(key)
    const body = (byDir.get(dir) || {})[name]
    if (typeof body !== "string") continue
    out.push({ dir, name, body })
    for (const next of referenced(body)) {
      push(next.prefix ? resolve(dir, next.prefix) : dir, next.name)
    }
  }
  return out
}

/** File thuộc phạm vi (a)(b)(c). */
function filesInScope(root) {
  const out = new Set()
  // Vắng .github/workflows là bình thường (test truyền thư mục tạm).
  const wf = join(root, ".github", "workflows")
  if (existsSync(wf)) for (const p of walk(wf, { exts: [".yml", ".yaml"] })) out.add(p)
  for (const p of walk(root, { exts: [".test.js", ".test.mjs", ".test.ts"] })) out.add(p)
  for (const d of HOOK_DIRS) {
    const dir = join(root, ...d)
    if (existsSync(dir)) for (const p of walk(dir, { exts: [".js", ".mjs"] })) out.add(p)
  }
  return [...out].sort()
}

export function run(root = REPO_ROOT) {
  const findings = []
  let checked = 0

  for (const f of filesInScope(root)) {
    const src = readText(f)
    if (src === null || isExempt(src)) continue
    checked++
    const hit = llmHit(src)
    if (!hit) continue
    findings.push({
      file: relTo(root, f),
      line: lineAt(src, hit.index),
      message: `gọi ${hit.what} — file test/CI/hook không được tự gọi model (QĐ-7). Chuyển sang lệnh người tự chạy`,
    })
  }

  for (const s of ciClosure(root)) {
    checked++
    const hit = llmHit(s.body)
    if (!hit) continue
    findings.push({
      file: `${relTo(root, join(s.dir, "package.json"))} → scripts.${s.name}`,
      message: `gọi ${hit.what} trong chuỗi CI — \`npm test\`/\`npm run check\` sẽ tiêu tiền (QĐ-7). Tách ra lệnh người tự chạy`,
    })
  }

  return result("A05", "không script test/CI/hook nào tự gọi LLM", findings, checked, "block")
}
