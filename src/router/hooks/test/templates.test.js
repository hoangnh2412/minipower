/**
 * Golden test — templates (ADR-020 §8 #8 · ADR-037 E3).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"

import { DOC_SCOPE } from "../lib/rules.js"
import { PROFILE_VERSION } from "../lib/profile-guard.js"
import { SRC, ROUTER } from "../lib/skill-catalog.js"

const TPL = join(ROUTER, "templates")

const DOC_PACK = {
  "01": "discovery",
  "02": "discovery",
  "03": "discovery",
  "04": "analyst",
  "05": "analyst",
  "06": "analyst",
  "07": "analyst",
  "08": "architecture",
  "09": "architecture",
  "10": "architecture",
  "11": "architecture",
  "12": "architecture",
  "13": "analyst",
  "14": "pm",
  "15": "pm",
  "16": "qa",
  "17": "ops",
  "18": "analyst",
  "19": "analyst",
}

function docFile(fname) {
  const m = fname.match(/^DOC-(\d{2})/)
  assert.ok(m, fname)
  const pack = DOC_PACK[m[1]]
  const p = join(SRC, pack, "templates", fname)
  assert.ok(existsSync(p), `thiếu ${pack}/templates/${fname}`)
  return p
}

function readDoc(fname) {
  return readFileSync(docFile(fname), "utf8")
}

const TWO_LEVEL = [
  "DOC-06-srs.md",
  "DOC-08-sad.md",
  "DOC-13-nfr.md",
  "DOC-15-project-plan.md",
  "DOC-16-test-strategy.md",
  "DOC-17-deployment-guide.md",
]

test("#8 — 6 DOC nặng có nhãn「lõi ▸ full」", () => {
  for (const f of TWO_LEVEL) {
    const text = readDoc(f)
    assert.match(text, /lõi\s*[▸►]\s*full|「lõi/, `${f}: thiếu nhãn 2 mức`)
  }
})

test("#8 — DOC-17 mục lõi không phải ▸ full", () => {
  const text = readDoc("DOC-17-deployment-guide.md")
  for (const must of ["Rollback", "Prerequisite"]) {
    const re = new RegExp(must, "i")
    assert.match(text, re, `DOC-17: phải có "${must}"`)
  }
  assert.match(text, /[Hh]ealth/, 'DOC-17: phải có health check')
})

test("#8 — DOC-19 có chỗ đứng trong _template module (doc_scope = module)", () => {
  assert.equal(DOC_SCOPE["19"], "module", "tiền đề: DOC-19 là DOC theo module")
  const readme = readFileSync(
    join(ROUTER, "docs-skeleton", "03-modules", "_template", "README.md"),
    "utf8",
  )
  assert.match(readme, /DOC-19/, "_template/README.md phải liệt kê DOC-19")
  assert.match(readme, /DOC-19-prototype\.md/, "phải trỏ đúng file template")
})

test("#8 — _template liệt kê ĐỦ mọi DOC scope=module", () => {
  const readme = readFileSync(
    join(ROUTER, "docs-skeleton", "03-modules", "_template", "README.md"),
    "utf8",
  )
  const moduleDocs = Object.entries(DOC_SCOPE)
    .filter(([, s]) => s === "module")
    .map(([d]) => d)
  for (const d of moduleDocs) {
    assert.match(readme, new RegExp(`DOC-${d}`), `_template thiếu DOC-${d} (scope=module)`)
  }
})

test("#8 — mọi file TPL-* đều được liệt kê trong templates/README.md", () => {
  const readme = readFileSync(join(TPL, "README.md"), "utf8")
  const tplFiles = readdirSync(TPL).filter((f) => f.startsWith("TPL-") && f.endsWith(".md"))
  assert.ok(tplFiles.length >= 4, "phải có ít nhất vài TPL để test có nghĩa")
  for (const f of tplFiles) {
    assert.match(readme, new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `README thiếu ${f}`)
  }
})

test("#8 — TPL-agent-profile khai đúng schema hiện hành", () => {
  const text = readFileSync(join(TPL, "TPL-agent-profile.md"), "utf8")
  assert.match(text, new RegExp(`schema v${PROFILE_VERSION}`), "tiêu đề schema lệch code")
  assert.match(text, /"version": 3/, "ví dụ JSON phải là v3")
  assert.match(text, /"docs_provider"/)
  assert.match(text, /"tasks_provider"/)
  assert.match(text, /"chat_provider"/)
  assert.match(text, /"code_provider"/)
  assert.match(text, /profile\.user\.json/, "tách identity local")
})

test("#8 — khuôn AGENTS.md là khung; mẫu đã điền tách file; file render không trỏ hai file nguồn", () => {
  const text = readFileSync(join(TPL, "TPL-agent-profile.md"), "utf8")
  assert.match(text, /SAMPLE-agents\.md/)
  const raw = text.split("<!-- BEGIN template: agents-md -->")[1]?.split("<!-- END template: agents-md -->")[0]
  assert.ok(raw, "thiếu marker template: agents-md")
  const body = raw.replace(/^\n*````markdown\n/, "").replace(/\n````\s*$/, "")
  assert.ok(!body.includes("SAMPLE-agents"), "khối render không được trỏ file mẫu")
  assert.ok(!body.includes("TPL-agent-profile"), "khối render không được trỏ file khuôn")
  assert.match(body, /\{project_name\}/)
  assert.match(body, /\{surfaces\}/)
  assert.match(body, /Bề mặt đang có: `\{surfaces\}`/)
  assert.match(body, /backend\/src\//)
  const blanks = body.split("_(điền)_").length - 1
  assert.ok(blanks > 0 && blanks <= 20, `ô _(điền)_ = ${blanks}, init phải để lại nội dung đã viết`)
  const bodyLines = body.split("\n")
  assert.ok(bodyLines.length >= 200 && bodyLines.length <= 300, `khối render ${bodyLines.length} dòng`)
  const sample = readFileSync(join(TPL, "SAMPLE-agents.md"), "utf8")
  const lines = sample.split("\n")
  assert.ok(lines.length >= 200 && lines.length <= 300, `mẫu ${lines.length} dòng, cần 200–300`)
  assert.ok(!sample.includes("SAMPLE-agents"))
  assert.ok(!sample.includes("TPL-agent-profile"))
  assert.ok(!sample.includes("{project_name}"))
  assert.match(sample, /Bề mặt đang có: `docs, backend`/)
  for (const h of [
    "## 0. Metadata",
    "## 1. Tổng quan",
    "## 2. Bắt đầu làm việc từ đâu",
    "## 3. Quy tắc",
    "## 4. Nguyên tắc",
    "## 5. Quy ước",
    "## 6. Cổng quyết định",
    "## 7. Bảo mật",
    "## 8. Definition of Done",
  ]) {
    assert.ok(body.includes(h), `khuôn thiếu ${h}`)
    assert.ok(sample.includes(h), `mẫu thiếu ${h}`)
  }
})
