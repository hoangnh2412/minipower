/**
 * Catalog toàn Minipower: mọi skill lá · kho SOP · agent guardrail · README gốc.
 * Chạy cùng `npm test` (repo root hoặc router/hooks).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  ROOT,
  SRC,
  ROUTER,
  SKILL_PACKS,
  listLeafSkills,
  listAgents,
  frontmatter,
  fmName,
  fmHasDescription,
} from "../lib/skill-catalog.js"
import { INTENT_RULES } from "../../../router/lib/intent-dispatch.js"

const leaves = listLeafSkills()

test("catalog: đủ pack nghề/kênh có skills/", () => {
  for (const pack of SKILL_PACKS) {
    assert.ok(existsSync(join(SRC, pack, "skills")), `thiếu ${pack}/skills`)
    assert.ok(existsSync(join(SRC, pack, "PACK.md")), `thiếu ${pack}/PACK.md`)
  }
})

test("catalog: mọi lá minipower-* có SKILL.md + README.md + name ≡ thư mục + description", () => {
  assert.equal(leaves.length, 53, `kỳ vọng 53 lá đăng ký, thấy ${leaves.length}`)
  for (const s of leaves) {
    assert.ok(existsSync(s.skillMd), `${s.name} thiếu SKILL.md`)
    assert.ok(existsSync(s.readme), `${s.name} thiếu README.md`)
    const fm = frontmatter(s.skillMd)
    assert.equal(fmName(fm), s.name, `${s.name}: name lệch thư mục`)
    assert.ok(fmHasDescription(fm), `${s.name}: thiếu description`)
    assert.ok(s.name.length <= 64, `${s.name}: >64`)
  }
})

test("catalog: README gốc liệt kê mọi lá (href skills/{tên}/)", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8")
  const missing = leaves.filter((s) => !readme.includes(`skills/${s.name}/`))
  assert.deepEqual(missing.map((s) => s.name), [], "README gốc thiếu lá")
})

test("catalog: không còn src/sdlc (ADR-037 E5)", () => {
  assert.equal(existsSync(join(SRC, "sdlc")), false)
})

test("catalog: router/agents — file còn lại có trong README agents", () => {
  const agents = listAgents()
  assert.deepEqual(
    agents.map((a) => a.name),
    ["lark-work-assistant.md"],
    "ADR-039: chỉ còn lark-work-assistant",
  )
  const index = readFileSync(join(ROUTER, "agents", "README.md"), "utf8")
  for (const a of agents) {
    assert.ok(existsSync(a.path))
    assert.ok(index.includes(`](${a.name})`), `agents/README.md thiếu ${a.name}`)
  }
})

test("catalog: mọi skill trong INTENT_RULES là lá thật", () => {
  const names = new Set(leaves.map((s) => s.name))
  for (const r of INTENT_RULES) {
    assert.ok(names.has(r.skill), `INTENT_RULES trỏ skill không tồn tại: ${r.skill}`)
  }
})
