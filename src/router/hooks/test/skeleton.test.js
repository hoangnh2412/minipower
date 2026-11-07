/**
 * Golden test — skeleton dự án đích (ADR-020 QĐ-2 · ADR-035).
 *
 * Router [SKILL.md] hứa init sinh `memory/doc-debt.md`, `assets/archive/` và
 * **đủ 7 folder `docs/` ở mọi chế độ**. ADR-035: memory phẳng (không phase/),
 * không overview.md, không memory/tasks/.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { ROUTER, SRC } from "../lib/skill-catalog.js"

const PACK = ROUTER
const PROJECT_SKELETON = join(PACK, "project-skeleton")
const DOCS_SKELETON = join(PACK, "docs-skeleton")
const MEMORY = join(PROJECT_SKELETON, "memory")

const DOCS_FOLDERS = [
  "00-governance",
  "01-project",
  "02-baseline",
  "03-modules",
  "04-platform",
  "05-traceability",
  "06-changes",
]

const FORBIDDEN_PHASE_DIRS = [
  "discovery",
  "requirements",
  "architecture",
  "planning",
  "delivery",
  "change-control",
  "tasks",
]

test("project-skeleton — đủ 4 nhánh + FAQ (exit init §SKILL.md)", () => {
  for (const p of ["README.md", "FAQ.md", "INIT.md", "memory", "assets", "brainstorm"]) {
    assert.ok(existsSync(join(PROJECT_SKELETON, p)), `thiếu project-skeleton/${p}`)
  }
})

test("ADR-035 — memory phẳng: decision-log + open-questions + memory.md.example", () => {
  assert.ok(existsSync(join(MEMORY, "decision-log.md")), "thiếu memory/decision-log.md")
  assert.ok(existsSync(join(MEMORY, "open-questions.md")), "thiếu memory/open-questions.md")
  assert.ok(existsSync(join(MEMORY, "memory.md.example")), "thiếu memory/memory.md.example")
  assert.ok(existsSync(join(MEMORY, "doc-debt.md")), "thiếu memory/doc-debt.md")
  assert.ok(existsSync(join(MEMORY, "profile.user.json.example")))
  assert.ok(existsSync(join(MEMORY, "trace.sql")))
  const example = readFileSync(join(MEMORY, "memory.md.example"), "utf8")
  assert.match(example, /decision-log\.md/)
  assert.match(example, /open-questions\.md/)
  assert.match(example, /Nhắc việc/)
  assert.match(example, /Hiện trạng/)
  const gi = readFileSync(join(MEMORY, ".gitignore"), "utf8")
  assert.match(gi, /^memory\.md$/m)
})

test("ADR-035 — cấm memory/{phase}/, memory/tasks/, overview.md", () => {
  for (const name of FORBIDDEN_PHASE_DIRS) {
    assert.ok(!existsSync(join(MEMORY, name)), `không được còn memory/${name}/`)
  }
  assert.ok(
    !existsSync(join(DOCS_SKELETON, "05-traceability", "overview.md")),
    "docs-skeleton không được còn overview.md",
  )
})

test("ADR-020 #6 — memory/doc-debt.md ở GỐC memory", () => {
  const p = join(MEMORY, "doc-debt.md")
  assert.ok(existsSync(p), "thiếu memory/doc-debt.md")
  const text = readFileSync(p, "utf8")
  assert.match(text, /standard/, "phải nêu điều kiện lên standard")
})

test("ADR-020 #6 — assets/archive/ có README kèm cột độ tin cậy (Q5)", () => {
  const p = join(PROJECT_SKELETON, "assets", "archive", "README.md")
  assert.ok(existsSync(p), "thiếu assets/archive/README.md")
  const text = readFileSync(p, "utf8")
  for (const level of ["còn đúng", "nghi ngờ", "đã lỗi thời"]) {
    assert.match(text, new RegExp(level), `archive README thiếu mức tin cậy "${level}"`)
  }
  assert.match(text, /không phải artifact/i, "phải nói rõ archive KHÔNG phải artifact")
})

test("QĐ-2 — docs-skeleton đủ 7 folder, một khung cho cả 3 chế độ", () => {
  const dirs = readdirSync(DOCS_SKELETON, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
  assert.deepEqual(dirs, DOCS_FOLDERS, "cây docs/ lệch §2b — mode KHÔNG được cắt folder")
})

test("INIT.md — có README chuẩn cho folder chưa dùng (QĐ-2) + migrate ADR-035", () => {
  const text = readFileSync(join(PROJECT_SKELETON, "INIT.md"), "utf8")
  assert.match(text, /chưa điền/i, "INIT.md phải định nghĩa README cho folder rỗng")
  assert.match(text, /doc-debt/, "README folder rỗng phải trỏ về sổ nợ")
  assert.match(text, /mọi ch[eế] đ[oộ]/i, "INIT.md phải nói rõ copy đủ khung ở mọi chế độ")
  assert.match(text, /memory\.md\.example|decision-log\.md/, "INIT phải mô tả memory phẳng ADR-035")
})

test("ADR-044 — docs-skeleton có 00-governance/lessons.md (sổ bài học retro)", () => {
  const p = join(DOCS_SKELETON, "00-governance", "lessons.md")
  assert.ok(existsSync(p), "thiếu 00-governance/lessons.md")
  const text = readFileSync(p, "utf8")
  for (const col of ["LSN", "Skill@version", "Bài học", "Loại", "Trạng thái"]) {
    assert.match(text, new RegExp(col), `lessons.md thiếu cột "${col}"`)
  }
  const readme = readFileSync(join(DOCS_SKELETON, "README.md"), "utf8")
  assert.match(readme, /lessons\.md/, "docs-skeleton/README.md phải trỏ tới lessons.md")
})

test("ADR-035 — DOC-06/14/15 không dùng làm task board; tasks=none → SQLite", () => {
  const srs = readFileSync(join(SRC, "analyst", "templates", "DOC-06-srs.md"), "utf8")
  assert.match(srs, /Không.*task board|không dùng SRS làm task board/i)
  assert.match(srs, /tasks_provider|trace\.db|SQLite|artifact/i)
  const wbs = readFileSync(join(SRC, "pm", "templates", "DOC-14-wbs-estimate.md"), "utf8")
  assert.match(wbs, /tasks_provider|trace\.db|SQLite|artifact/i)
  const plan = readFileSync(join(SRC, "pm", "templates", "DOC-15-project-plan.md"), "utf8")
  assert.match(plan, /không.*board/i)
})
