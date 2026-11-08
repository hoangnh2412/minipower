/**
 * Golden test — GitHub issue template "bài học" (ADR-044 §7 · T2).
 * Chứng minh: đủ 11 trường đúng thứ tự, dropdown đúng tập giá trị, checklist
 * ẩn danh required.
 *
 * Nhãn KHÔNG còn đối chiếu với `rules.json`: nguồn chân lý của nhãn là chính
 * GitHub (quyết định 2026-11-08). Test chỉ canh phần nằm trong repo — tức là
 * cái form, không phải cái nhãn.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ROOT } from "../lib/skill-catalog.js"

const TEMPLATE = join(ROOT, ".github", "ISSUE_TEMPLATE", "lesson.yml")
const text = readFileSync(TEMPLATE, "utf8")

function dropdownOptions(id) {
  const section = text.split(`id: ${id}`)[1].split(/^  - type:/m)[0]
  return [...section.matchAll(/^\s{8}- (\w+)$/gm)].map(([, o]) => o)
}

test("feedback: lesson.yml đặt nhãn mặc định lesson", () => {
  assert.match(text, /^labels:\s*\[\s*lesson\s*\]/m)
})

test("feedback: lesson.yml đủ 11 trường, đúng thứ tự 1→11", () => {
  const found = [...text.matchAll(/label:\s*"(\d+)\.\s*[^"]+"/g)].map(([, n]) => Number(n))
  assert.deepEqual(found, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], `thứ tự trường lệch: ${found}`)
})

test("feedback: dropdown Loại (7) đúng tập giá trị", () => {
  assert.deepEqual(dropdownOptions("kind"), ["skill", "prereq", "model", "other"])
})

test("feedback: dropdown Ưu tiên (8) đúng tập giá trị", () => {
  assert.deepEqual(dropdownOptions("priority"), ["p1", "p2", "p3"])
})

test("feedback: dropdown Mức ảnh hưởng (9) đúng tập giá trị", () => {
  assert.deepEqual(dropdownOptions("impact"), ["high", "medium", "low"])
})

test("feedback: checklist ẩn danh (11) có option required: true", () => {
  const section = text.split("11. Checklist ẩn danh")[1]
  assert.match(section, /required:\s*true/, "checkbox ẩn danh phải required — GitHub chặn submit nếu không")
})

test("feedback: rules.json không còn khối `feedback` (nguồn chân lý nhãn là GitHub)", async () => {
  const rules = JSON.parse(readFileSync(new URL("../lib/rules.json", import.meta.url), "utf8"))
  assert.equal("feedback" in rules, false, "khối feedback phải được gỡ — nhãn sống trên GitHub")
})
