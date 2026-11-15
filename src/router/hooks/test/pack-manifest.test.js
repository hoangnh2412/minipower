/**
 * Golden test — PACK.md manifest (ADR-022 QĐ-8, schema: contracts/pack-manifest.md).
 *
 * QĐ-8 tuyên bố manifest "máy-đọc-được với 4 consumer" — test này là consumer đầu
 * tiên: không máy nào parse thì manifest chỉ là markdown thường (bệnh ADR-001 §3.3).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { SRC } from "../lib/skill-catalog.js"

const MODULES = [
  "backend",
  "frontend",
  "ops",
  "toolbox",
  "docs",
  "tasks",
  "chat",
  "vcs",
  "router",
  "discovery",
  "analyst",
  "architecture",
  "pm",
  "support",
  "qa",
  "presales",
  "work",
]

// trường bắt buộc theo schema contracts/pack-manifest.md §1
const REQUIRED = ["pack", "version", "owner", "roles", "stage", "repo", "consumes", "produces", "memory", "mcp"]

function yamlBlock(mod) {
  const p = join(SRC, mod, "PACK.md")
  assert.ok(existsSync(p), `${mod}/PACK.md không tồn tại`)
  const m = readFileSync(p, "utf8").match(/```yaml\r?\n([\s\S]*?)```/)
  assert.ok(m, `${mod}/PACK.md thiếu khối \`\`\`yaml`)
  return m[1]
}

for (const mod of MODULES) {
  test(`PACK.md ${mod}: đủ trường bắt buộc theo schema`, () => {
    const y = yamlBlock(mod)
    for (const key of REQUIRED) {
      assert.match(y, new RegExp(`^${key}:`, "m"), `${mod}/PACK.md thiếu trường "${key}:"`)
    }
    assert.ok(/^handoff-(in|out):/m.test(y), `${mod}/PACK.md thiếu handoff-in/handoff-out`)
  })

  test(`PACK.md ${mod}: pack ≡ tên folder, version semver`, () => {
    const y = yamlBlock(mod)
    assert.equal((y.match(/^pack:\s*(\S+)/m) || [])[1], mod, `pack: phải trùng tên folder "${mod}"`)
    assert.match(y, /^version:\s*\d+\.\d+\.\d+/m, "version phải là semver")
  })
}

test("PACK.md: trỏ đúng schema contracts/pack-manifest.md", () => {
  for (const mod of MODULES) {
    const t = readFileSync(join(SRC, mod, "PACK.md"), "utf8")
    assert.ok(t.includes("contracts/pack-manifest.md"), `${mod}/PACK.md không trỏ schema`)
  }
})

test("MODULES khớp cây src/ (ADR-032 T5)", () => {
  const dirs = readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort()
  assert.deepEqual(dirs, [...MODULES].sort())
})
