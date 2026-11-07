/**
 * Golden test — GitHub issue template "bài học" (ADR-044 §7 · T2).
 * Chứng minh: đủ 11 trường đúng thứ tự, checklist ẩn danh required, và nhãn
 * dropdown ⊆ SSOT rules.json khối `feedback` (không soạn tay ở hai nơi).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ROOT } from "../lib/skill-catalog.js"
import { FEEDBACK } from "../lib/rules.js"

const TEMPLATE = join(ROOT, ".github", "ISSUE_TEMPLATE", "lesson.yml")
const text = readFileSync(TEMPLATE, "utf8")
const labelNames = FEEDBACK.labels.map((l) => l.name)

test("feedback: lesson.yml đặt nhãn mặc định lesson, khớp rules.json", () => {
  assert.match(text, /^labels:\s*\[\s*lesson\s*\]/m)
  assert.ok(labelNames.includes("lesson"), "rules.json phải có nhãn 'lesson'")
})

test("feedback: lesson.yml đủ 11 trường, đúng thứ tự 1→11", () => {
  const found = [...text.matchAll(/label:\s*"(\d+)\.\s*[^"]+"/g)].map(([, n]) => Number(n))
  assert.deepEqual(found, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], `thứ tự trường lệch: ${found}`)
})

test("feedback: dropdown Loại (7) ⊆ rules.json kind:*", () => {
  const section = text.split('id: kind')[1].split(/^  - type:/m)[0]
  const options = [...section.matchAll(/^\s{8}- (\w+)$/gm)].map(([, o]) => o)
  assert.deepEqual(options, ["skill", "prereq", "model", "other"])
  for (const o of options) {
    assert.ok(labelNames.includes(`kind:${o}`), `rules.json thiếu nhãn kind:${o}`)
  }
})

test("feedback: dropdown Ưu tiên (8) ⊆ rules.json priority:*", () => {
  const section = text.split('id: priority')[1].split(/^  - type:/m)[0]
  const options = [...section.matchAll(/^\s{8}- (\w+)$/gm)].map(([, o]) => o)
  assert.deepEqual(options, ["p1", "p2", "p3"])
  for (const o of options) {
    assert.ok(labelNames.includes(`priority:${o}`), `rules.json thiếu nhãn priority:${o}`)
  }
})

test("feedback: dropdown Mức ảnh hưởng (9) ⊆ rules.json impact:*", () => {
  const section = text.split('id: impact')[1].split(/^  - type:/m)[0]
  const options = [...section.matchAll(/^\s{8}- (\w+)$/gm)].map(([, o]) => o)
  assert.deepEqual(options, ["high", "medium", "low"])
  for (const o of options) {
    assert.ok(labelNames.includes(`impact:${o}`), `rules.json thiếu nhãn impact:${o}`)
  }
})

test("feedback: checklist ẩn danh (11) có option required: true", () => {
  const section = text.split("11. Checklist ẩn danh")[1]
  assert.match(section, /required:\s*true/, "checkbox ẩn danh phải required — GitHub chặn submit nếu không")
})

test("feedback: rules.json không enum skill:<tên-lá> tĩnh (động theo catalog)", () => {
  assert.ok(
    !labelNames.some((n) => n.startsWith("skill:")),
    "nhãn skill:<tên-lá> phải động theo catalog skill, không hardcode trong rules.json",
  )
})
