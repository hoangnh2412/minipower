/**
 * Golden test — tầng MỀM không được hứa cái tầng CỨNG không làm (ADR-020 §8 #7, #7b).
 *
 * ADR-037 E4: gate SOP sống ở lá router; fan-out playbook → parallel-work (không skill).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"

import { ROUTER, SRC } from "../lib/skill-catalog.js"

const readRouter = (...p) => readFileSync(join(ROUTER, ...p), "utf8")

const GATE_SKILLS = [
  "minipower-router-deliberation",
  "minipower-router-readiness",
]

function markdownFiles() {
  const out = []
  for (const name of GATE_SKILLS) {
    const f = join(ROUTER, "skills", name, "SKILL.md")
    out.push([`skills/${name}/SKILL.md`, readFileSync(f, "utf8")])
  }
  for (const rel of [
    "skills/minipower-router/SKILL.md",
    "docs/parallel-work.md",
    "docs/pipeline.md",
  ]) {
    out.push([rel, readRouter(...rel.split("/"))])
  }
  // pack review leaves — không hứa cổng chặn
  for (const pack of ["discovery", "analyst", "architecture", "qa"]) {
    const dir = join(SRC, pack, "skills")
    if (!existsSync(dir)) continue
    for (const d of readdirSync(dir, { withFileTypes: true })) {
      if (!d.isDirectory() || !d.name.endsWith("-review")) continue
      const f = join(dir, d.name, "SKILL.md")
      if (existsSync(f)) out.push([`${pack}/skills/${d.name}/SKILL.md`, readFileSync(f, "utf8")])
    }
  }
  return out
}

test("#7 — skill gate nói rõ mình MỀM, phần cứng do hook làm", () => {
  for (const s of GATE_SKILLS) {
    const text = readRouter("skills", s, "SKILL.md")
    assert.match(
      text,
      /mềm|advisory|người quyết|verdict cuối/i,
      `${s}: phải nói rõ ranh giới mềm/cứng`,
    )
  }
})

test("#7b — fan-out mô hình pipeline theo module, bỏ barrier", () => {
  const text = readRouter("docs", "parallel-work.md")
  assert.match(text, /pipeline theo module/i, "phải khai rõ mô hình pipeline")
  assert.match(text, /mỗi module một nhịp|nhịp riêng/i)
  assert.match(text, /QĐ-14/, "phải trỏ quyết định nguồn")
  assert.match(text, /không.*chờ|không chờ nhau/i, "phải nói module không chờ nhau")
})

test("#7b — fan-out KHÔNG còn bắt kiểm DEC trước khi chạy", () => {
  const text = readRouter("docs", "parallel-work.md")
  assert.doesNotMatch(text, /Kiểm cổng \(bắt buộc\)/i)
  assert.doesNotMatch(text, /chỉ chạy GIỮA hai cổng/i)
  assert.doesNotMatch(
    text,
    /DEC "đã chốt".*Chưa.*dừng/is,
    "fan-out không được dừng vì thiếu DEC (QĐ-11)",
  )
})

test("QĐ-11 — không markdown nào còn hứa 'chưa duyệt = không qua'", () => {
  const BANNED = [
    [/không có DEC chốt cho cổng = không qua/i, 'hứa "không có DEC = không qua"'],
    [/fan-out chỉ nằm giữa hai cổng/i, "hứa fan-out bị kẹp giữa hai cổng"],
    [/KHÔNG tự sang bước sau/i, "hứa AI bị chặn sang bước sau"],
    [/mới được fan-out/i, "hứa fan-out cần điều kiện chữ ký"],
  ]
  const problems = []
  for (const [name, text] of markdownFiles()) {
    for (const [re, why] of BANNED) {
      if (re.test(text)) problems.push(`${name}: ${why}`)
    }
  }
  assert.deepEqual(problems, [], `tầng mềm còn hứa cổng chặn:\n${problems.join("\n")}`)
})
