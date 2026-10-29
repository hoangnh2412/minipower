/**
 * ADR-043 — router triage · lá minipower-router-plan · TPL-plan · matchIntents.
 * Máy chỉ canh ĐỊNH DẠNG (C3 "cứng bằng máy, mềm bằng lời"): khuôn đủ mục, lá thật,
 * tiêu chí có dạng đo được, trần 3 và điều kiện dừng được nêu. Kế hoạch đúng hay sai là việc người.
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { ROOT, ROUTER, listLeafSkills } from "../lib/skill-catalog.js"
import { matchIntent, matchIntents } from "../../../router/lib/intent-dispatch.js"

const PLAN_DIR = join(ROUTER, "skills", "minipower-router-plan")
const SKILL = readFileSync(join(PLAN_DIR, "SKILL.md"), "utf8")
const README = readFileSync(join(PLAN_DIR, "README.md"), "utf8")
const TPL = readFileSync(join(ROUTER, "templates", "TPL-plan.md"), "utf8")
const TPL_README = readFileSync(join(ROUTER, "templates", "README.md"), "utf8")
const ROUTER_SKILL = readFileSync(join(ROUTER, "skills", "minipower-router", "SKILL.md"), "utf8")
const NAMES = new Set(listLeafSkills().map((s) => s.name))

const lines = (t) => t.split("\n").length
/** Nội dung từ heading `## h` tới heading `## ` kế tiếp. */
const section = (t, h) => {
  const i = t.indexOf(`\n${h}`)
  if (i < 0) return ""
  const rest = t.slice(i + 1 + h.length)
  const j = rest.search(/\n## /)
  return j < 0 ? rest : rest.slice(0, j)
}

const LOG_SELF = /\| Lần \| Tiêu chí chưa đạt \| Cách xử lý \| Kết quả \|/
const LOG_REVIEW = /\| Vòng \| Finding \| Task # \| Lá \| Cách xử lý \| Kết quả \|/
const BANNED = [
  /mới được fan-out/i,
  /fan-out chỉ nằm giữa hai cổng/i,
  /KHÔNG tự sang bước sau/i,
  /không có DEC chốt cho cổng = không qua/i,
]

test("QĐ-2 — lá plan: frontmatter, description có khóa, README, ≤ 150 dòng", () => {
  assert.match(SKILL, /^---\r?\n/)
  assert.match(SKILL, /^name: minipower-router-plan$/m)
  assert.match(SKILL, /^description: .+/m)
  for (const k of [/lập kế hoạch/i, /nhiều skill/i, /nhiều bước/i, /plan trước khi làm/i, /chia task/i, /phân chia công việc/i]) {
    assert.match(SKILL.split("---")[1], k, `description thiếu khóa ${k}`)
  }
  assert.match(SKILL, /workflow: github/)
  assert.ok(existsSync(join(PLAN_DIR, "README.md")), "README.md cho người")
  assert.ok(lines(SKILL) <= 150, `SKILL lá plan ${lines(SKILL)} dòng > 150 (ADR-026)`)
})

test("QĐ-3 — TPL-plan: bảng tổng quan đủ cột; templates/README liệt kê", () => {
  assert.match(TPL, /\| # \| Việc \| Lá \| Module \| Phụ thuộc \| ∥ \| Gate \|/)
  assert.match(TPL_README, /TPL-plan\.md/)
})

test("QĐ-3 — TPL-plan: khối chi tiết đủ bảy mục", () => {
  assert.match(TPL, /\| Mục \| Nội dung \|/)
  for (const m of ["Mô tả", "Điều kiện cần", "Tiêu chí hoàn thành", "Phụ thuộc", "Input tối thiểu", "Output", "Gate"]) {
    assert.match(TPL, new RegExp(`^\\| ${m} \\|`, "m"), `thiếu mục ${m}`)
  }
})

test("QĐ-3 — TPL-plan: Gate chỉ bốn giá trị", () => {
  const gate = section(TPL, "## Gate")
  const rows = gate.split("\n").filter((l) => /^\| `/.test(l))
  assert.equal(rows.length, 4, "đúng 4 giá trị Gate")
  for (const g of ["`—`", "`readiness`", "`⏸ người`", "`review`"]) assert.ok(gate.includes(g), `thiếu Gate ${g}`)
})

test("QĐ-4 — TPL-plan: bộ tiêu chí cơ bản B1–B7 + định nghĩa đo được", () => {
  for (let i = 1; i <= 7; i++) assert.match(TPL, new RegExp(`^\\| B${i} \\|`, "m"), `thiếu B${i}`)
  assert.match(TPL, /trace:check/)
  assert.match(TPL, /link:check/)
  assert.match(TPL, /TBD/)
  assert.match(TPL, /không hợp lệ/)
})

test("QĐ-5 — TPL-plan: gói giao việc / gói báo về", () => {
  const give = section(TPL, "## Gói giao việc")
  const back = section(TPL, "## Gói báo về")
  assert.ok(give, "## Gói giao việc")
  assert.ok(back, "## Gói báo về")
  for (const r of [/không gọi agent khác/i, /không mở task kế/i, /không ghi ra ngoài/i]) assert.match(give, r)
  assert.match(back, /Nhật ký/)
  assert.match(back, /Đề xuất/)
})

test("QĐ-6/7 — hai bảng nhật ký có ở cả TPL và SKILL", () => {
  for (const [name, t] of [["TPL", TPL], ["SKILL", SKILL]]) {
    assert.match(t, LOG_SELF, `${name} thiếu nhật ký tự kiểm`)
    assert.match(t, LOG_REVIEW, `${name} thiếu nhật ký review`)
  }
})

test("QĐ-6 — SKILL: tối đa 3 lần thử, bốn điều kiện dừng, không gọi lại readiness", () => {
  for (const r of [/tối đa 3 lần thử/, /bốn điều kiện dừng/i, /Hết 3 lần/, /không xử lý được/, /cùng một cách/, /ghi ra ngoài/, /không gọi lại readiness/i]) {
    assert.match(SKILL, r)
  }
})

test("QĐ-7 — SKILL: review trần 3 vòng chung cả kế hoạch, người ký PASS, pack thiếu review ghi nợ", () => {
  for (const r of [/trần 3 vòng/, /chung cả kế hoạch/, /ngoài kế hoạch/, /[Nn]gười ký PASS/, /self-check theo PACK\.md/, /doc-debt\.md/, /open-questions\.md/]) {
    assert.match(SKILL, r)
  }
})

test("QĐ-2 — SKILL: chỉ đọc catalog, không mở SOP, OK một lần, dispatch từng task, memory", () => {
  for (const r of [/[Kk]hông mở SOP/, /không sinh DOC/i, /TPL-plan\.md/, /OK một lần/i, /\(task n\/N\)/, /không cần plan/, /gói giao việc/i, /gói báo về/i, /memory\/memory\.md/, /\{DOC\}#\{section\/ID\}/]) {
    assert.match(SKILL, r)
  }
})

test("C1/C3 — SKILL mềm: không hook nào chặn, không agent bàn giao agent, không hứa cổng máy", () => {
  assert.match(SKILL, /không hook nào chặn/i)
  assert.match(SKILL, /không agent bàn giao agent/i)
  for (const r of BANNED) assert.doesNotMatch(SKILL, r, `lá plan lặp lại lời ADR đã huỷ: ${r}`)
  assert.doesNotMatch(SKILL, /spawn/i, "Minipower không viết runtime")
  assert.doesNotMatch(SKILL, /bắt buộc/, "máy không FAIL được thì không viết bắt buộc")
})

test("QĐ-1 — router SKILL: § Triage 5 dấu hiệu, mặc định PHỨC, lối thoát, một lá cho mỗi task, ≤ 150", () => {
  const tri = section(ROUTER_SKILL, "## Triage")
  assert.ok(tri, "thiếu ## Triage")
  assert.equal((tri.match(/^\| [a-e] \|/gm) || []).length, 5, "đúng 5 dấu hiệu PHỨC a–e")
  for (const r of [/[Kk]hông chắc.*PHỨC/, /không cần plan/, /minipower-router-plan/, /matchIntents/]) assert.match(tri, r)
  assert.match(ROUTER_SKILL, /cho mỗi task/)
  assert.doesNotMatch(ROUTER_SKILL, /không spawn/i)
  assert.doesNotMatch(ROUTER_SKILL, /một phiên = một pack/)
  for (const r of BANNED) assert.doesNotMatch(ROUTER_SKILL, r)
  assert.ok(lines(ROUTER_SKILL) <= 150, `router SKILL ${lines(ROUTER_SKILL)} dòng > 150`)
})

test("QĐ-10 — README lá: ví dụ dùng lá thật, dòng cuối review, có ∥, tiêu chí đo được", () => {
  const ex = section(README, "## Ví dụ — kế hoạch")
  assert.ok(ex, "thiếu ## Ví dụ — kế hoạch")
  const rows = ex.split("\n").filter((l) => /^\| \d+ \|/.test(l))
  assert.ok(rows.length >= 3, "ví dụ phải có ≥ 3 task")
  for (const row of rows) {
    for (const name of row.match(/minipower-[a-z0-9-]+/g) || []) assert.ok(NAMES.has(name), `lá không có thật: ${name}`)
  }
  const last = rows.at(-1).split("|").map((c) => c.trim()).filter(Boolean)
  assert.equal(last.at(-1), "review", "dòng cuối là review")
  assert.ok(rows.some((r) => r.includes("∥")), "có task song song ∥")
  const crit = ex.split("\n").find((l) => l.startsWith("| Tiêu chí hoàn thành |"))
  assert.ok(crit, "chi tiết task có Tiêu chí hoàn thành")
  const parts = crit.split("|")[2].split("·").map((s) => s.trim()).filter(Boolean)
  assert.ok(parts.length >= 3)
  for (const p of parts) assert.match(p, /\d|≥|=|`/, `tiêu chí không đo được: ${p}`)
})

test("QĐ-10 — README lá: nhật ký mẫu dừng vì cùng cách, nhật ký review, nêu Không dùng", () => {
  assert.match(README, LOG_SELF)
  assert.match(README, /cùng cách/i)
  assert.match(README, /dừng/)
  assert.match(README, LOG_REVIEW)
  assert.match(README, /Không dùng/)
  assert.match(README, /minipower-pm-plan/)
})

test("QĐ-8 — matchIntents: prompt ghép ≥ 2 lá; matchIntent vẫn một", () => {
  const p = "viết FR module ORD rồi scaffold backend và review PR"
  assert.ok(matchIntents(p).length >= 2)
  assert.equal(typeof matchIntent(p), "string")
  assert.deepEqual(matchIntents("Viết FR luồng đặt hàng module ORD"), ["minipower-analyst-srs"])
})

test("QĐ-9 — README gốc và router/README.md liệt kê lá plan", () => {
  const root = readFileSync(join(ROOT, "README.md"), "utf8")
  const hub = readFileSync(join(ROUTER, "README.md"), "utf8")
  assert.ok(root.includes("skills/minipower-router-plan/"), "README gốc")
  assert.ok(hub.includes("**minipower-router-plan**"), "router/README.md")
})
