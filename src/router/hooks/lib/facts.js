/**
 * Minipower — SỐ LIỆU dùng chung, suy ra từ cây repo.
 *
 * Vì sao có file này: cùng một con số đang được **tuyên bố bằng tay** ở nhiều
 * nơi, và mỗi nơi một kiểu — `src/backend/README.md` ghi 17 lá trong khi thật
 * là 20, `src/frontend/README.md` ghi 9 trong khi thật là 10. Có test ép README
 * liệt kê **đủ tên** mọi lá, nhưng không test nào canh **con số trong câu văn**.
 *
 * Luật: số nào suy ra được thì **không ai viết tay**. Nguồn là cây repo; file
 * `facts.json` là bản sinh ra để script đọc; markdown nhận giá trị **tiêm vào**
 * giữa cặp marker `<!--f:đường.dẫn-->giá trị<!--/f-->` khi chạy `npm run gen`.
 * `npm run gen:check` đỏ nếu bất kỳ chỗ nào lệch.
 *
 * Ranh giới cố ý: file này chỉ giữ số **suy ra được**. Số **khai** (Node tối
 * thiểu, trần ngân sách, danh sách điều kiện cứng) là *luật*, thuộc
 * `rules.json` — nơi người sửa tay. Trộn hai loại vào một file sinh tự động thì
 * `npm run gen` sẽ ghi đè mất phần người khai.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs"
import { basename, join } from "node:path"

import { ROOT, SRC, SKILL_PACKS, listLeafSkills } from "./skill-catalog.js"

/** Thư mục trạng thái của ADR — cùng bộ với ADRs/README.md. */
const ADR_STATES = ["pending", "todo", "doing", "done", "cancel"]

/** `description` trong frontmatter — bề mặt AI đọc mỗi lượt. */
function descriptionOf(skillMd) {
  let text
  try {
    text = readFileSync(skillMd, "utf8")
  } catch (e) {
    process.stderr.write(`[facts] không đọc được ${skillMd}: ${e.message}\n`)
    return ""
  }
  const fm = text.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return ""
  const m = fm[1].match(/^description:\s*(.*)$/m)
  return m ? m[1].trim() : ""
}

/** Pack của một lá, suy từ đường dẫn `src/{pack}/skills/…`. */
function packOf(skillMd) {
  const rel = skillMd.startsWith(SRC) ? skillMd.slice(SRC.length + 1) : skillMd
  return rel.split(/[\\/]/)[0]
}

/** Số lá đăng ký theo pack, cộng tổng. */
export function leafCounts() {
  const byPack = {}
  for (const p of SKILL_PACKS) byPack[p] = 0
  let total = 0
  for (const s of listLeafSkills()) {
    const pack = packOf(s.skillMd)
    if (pack in byPack) byPack[pack]++
    total++
  }
  return { by_pack: byPack, total }
}

/**
 * Ngân sách `description` — tổng ký tự AI phải đọc ở đầu mỗi lượt để biết nó
 * có những lá nào. Đây là con số bị công cụ nền cắt, nên nó là số đo thật.
 */
export function descriptionBudget() {
  let chars = 0
  let longest = 0
  for (const s of listLeafSkills()) {
    const n = descriptionOf(s.skillMd).length
    chars += n
    if (n > longest) longest = n
  }
  return { chars, longest }
}

/** ADR: đếm theo thư mục trạng thái, và mã kế tiếp = cao nhất + 1. */
export function adrFacts() {
  const dir = join(ROOT, "ADRs")
  const byState = {}
  let total = 0
  let highest = 0
  for (const state of ADR_STATES) {
    const d = join(dir, state)
    let names = []
    if (existsSync(d)) {
      try {
        names = readdirSync(d).filter((f) => /^ADR-\d{3}-.*\.md$/.test(f))
      } catch (e) {
        process.stderr.write(`[facts] không đọc được ADRs/${state}: ${e.message}\n`)
      }
    }
    byState[state] = names.length
    total += names.length
    for (const f of names) {
      const n = Number(f.slice(4, 7))
      if (n > highest) highest = n
    }
  }
  return {
    by_state: byState,
    total,
    next_code: `ADR-${String(highest + 1).padStart(3, "0")}`,
  }
}

/** Số phép đo nhóm A đang đăng ký trong `evals/checks/run.mjs`. */
export function checkCount() {
  const f = join(ROOT, "evals", "checks", "run.mjs")
  if (!existsSync(f)) return { total: 0, ids: [] }
  let src
  try {
    src = readFileSync(f, "utf8")
  } catch (e) {
    process.stderr.write(`[facts] không đọc được evals/checks/run.mjs: ${e.message}\n`)
    return { total: 0, ids: [] }
  }
  const ids = [...src.matchAll(/from\s+"\.\/(a\d{2})-/g)].map((m) => m[1].toUpperCase()).sort()
  return { total: ids.length, ids }
}

/**
 * Điều kiện cứng — ĐẾM từ danh sách KHAI ở `rules.json → hard_conditions`.
 * Danh sách là luật (người khai); con số thì suy ra được, nên nó ở đây.
 */
export function hardConditions() {
  const f = join(SRC, "router", "hooks", "lib", "rules.json")
  if (!existsSync(f)) return { total: 0, ids: [] }
  let rules
  try {
    rules = JSON.parse(readFileSync(f, "utf8"))
  } catch (e) {
    process.stderr.write(`[facts] rules.json không phải JSON hợp lệ: ${e.message}\n`)
    return { total: 0, ids: [] }
  }
  const list = Array.isArray(rules.hard_conditions) ? rules.hard_conditions : []
  return { total: list.length, ids: list.map((h) => h && h.id).filter(Boolean) }
}

/** Số file test và pack có thư mục skills/. */
export function repoShape() {
  const testDir = join(SRC, "router", "hooks", "test")
  let tests = 0
  if (existsSync(testDir)) {
    try {
      tests = readdirSync(testDir).filter((f) => f.endsWith(".test.js")).length
    } catch (e) {
      process.stderr.write(`[facts] không đọc được hooks/test: ${e.message}\n`)
    }
  }
  let modules = 0
  try {
    modules = readdirSync(SRC, { withFileTypes: true }).filter(
      (d) => d.isDirectory() && !d.name.startsWith("_"),
    ).length
  } catch (e) {
    process.stderr.write(`[facts] không đọc được src/: ${e.message}\n`)
  }
  return { modules, skill_packs: SKILL_PACKS.length, hook_tests: tests }
}

/** Toàn bộ số liệu suy ra được. Thứ tự khoá cố định để diff đọc được. */
export function scanFacts() {
  return {
    leaves: leafCounts(),
    description: descriptionBudget(),
    adr: adrFacts(),
    checks: checkCount(),
    hard_conditions: hardConditions(),
    repo: repoShape(),
  }
}

/** Mảng toàn giá trị đơn thì nối bằng dấu `·` — một danh sách cũng là dữ liệu. */
const LIST_SEP = " · "

/**
 * Lấy một giá trị theo đường dẫn chấm — `leaves.by_pack.backend`.
 * Mảng các giá trị đơn trả về chuỗi đã nối; object trả `undefined` (không tiêm
 * được một nhánh). `undefined` để nơi gọi báo lỗi rõ.
 */
export function factAt(facts, path) {
  let cur = facts
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object" || !(key in cur)) return undefined
    cur = cur[key]
  }
  if (Array.isArray(cur)) {
    return cur.every((v) => v !== null && typeof v !== "object") ? cur.join(LIST_SEP) : undefined
  }
  return typeof cur === "object" ? undefined : cur
}

/** Marker tiêm số: `<!--f:leaves.by_pack.backend-->20<!--/f-->`. */
const FACT_MARKER = /<!--f:([a-z0-9_.]+)-->([\s\S]*?)<!--\/f-->/g

const SKIP_DIRS = new Set(["node_modules", "dist", "coverage"])

/** Thư mục ẩn (bắt đầu bằng dấu chấm) không chứa markdown cần tiêm số. */
const isHidden = (name) => name.startsWith(".")

/** Mọi file `.md` dưới `root`, trừ thư mục rác. */
export function markdownFiles(root) {
  const out = []
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch (e) {
      process.stderr.write(`[facts] không đọc được thư mục ${dir}: ${e.message}\n`)
      continue
    }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name) || isHidden(e.name)) continue
      const f = join(dir, e.name)
      if (e.isDirectory()) stack.push(f)
      else if (e.isFile() && e.name.endsWith(".md")) out.push(f)
    }
  }
  return out.sort()
}

/**
 * Thay giá trị giữa mọi cặp marker trong `text`.
 * @returns {{next:string, bad:string[]}} `bad` = đường dẫn fact không tồn tại
 */
export function injectInto(text, facts) {
  const bad = []
  const next = text.replace(FACT_MARKER, (whole, path) => {
    const v = factAt(facts, path)
    if (v === undefined) {
      bad.push(path)
      return whole
    }
    return `<!--f:${path}-->${v}<!--/f-->`
  })
  return { next, bad }
}

export { ADR_STATES, basename }
