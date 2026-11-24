/**
 * Golden test — dispatcher + init (ADR-020 việc #5 · ADR-037 E5).
 *
 * Bảng chế độ trong minipower-router là vùng **generated** (`gen:check`).
 * Init CLI / schema profile sống ở lá init + TPL + skeleton INIT.md.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { PROFILE_VERSION } from "../lib/profile-guard.js"
import { ROUTER as ROUTER_DIR } from "../lib/skill-catalog.js"

const ROUTER = readFileSync(join(ROUTER_DIR, "skills", "minipower-router", "SKILL.md"), "utf8")
const INIT = readFileSync(join(ROUTER_DIR, "skills", "minipower-router-init", "SKILL.md"), "utf8")
const INIT_MD = readFileSync(join(ROUTER_DIR, "project-skeleton", "INIT.md"), "utf8")
const PROFILE_TPL = readFileSync(join(ROUTER_DIR, "templates", "TPL-agent-profile.md"), "utf8")
const HUB = `${ROUTER}\n${INIT}\n${INIT_MD}\n${PROFILE_TPL}`

test("router — bốn mặt provider được hỏi (init, ADR-033)", () => {
  for (const face of ["docs_provider", "tasks_provider", "chat_provider", "code_provider"]) {
    assert.match(HUB, new RegExp(face), `init chưa hỏi ${face}`)
  }
  assert.match(HUB, /profile\.user\.json/)
  assert.match(HUB, /tasks_provider=none|`none`/)
})

test("router — số hiệu schema profile khớp code (không hứa v cũ)", () => {
  assert.match(
    HUB,
    new RegExp(`v${PROFILE_VERSION}`),
    `router phải nói schema v${PROFILE_VERSION} — khớp PROFILE_VERSION`,
  )
})

test("router — QĐ-2: nói rõ copy đủ khung, không cắt folder theo chế độ", () => {
  assert.match(HUB, /đủ khung ở mọi chế độ|đủ.*7 folder|Copy đủ khung/i)
  assert.match(HUB, /không.*cắt|KHÔNG.*cắt/i, "phải nói rõ không cắt folder theo chế độ")
})

test("router — có luồng init vào repo đã có sẵn (việc #5)", () => {
  // CLI idempotent + skeleton INIT/TPL mô tả archive + doc-debt
  assert.match(INIT, /minipower init/i)
  assert.match(HUB, /assets\/archive/, "repo có sẵn: tài liệu cũ vào assets/archive")
  assert.match(HUB, /doc-debt/, "repo có sẵn: phải ghi sổ nợ")
})

test("router — mọi anchor nội bộ trỏ tới heading có thật", () => {
  const slug = (h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/[`*]/g, "")
      .replace(/[()[\]{}.,:;!?/\\]/g, "")
      .replace(/ /g, "-")

  const headings = new Set()
  for (const m of ROUTER.matchAll(/^#{1,6}\s+(.+)$/gm)) headings.add(slug(m[1]))

  const anchors = [...ROUTER.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1])
  // Có thể 0 nếu dispatcher chỉ trỏ file ngoài; khi có thì phải khớp heading
  for (const a of anchors) {
    assert.ok(headings.has(a), `anchor gãy: #${a}`)
  }
})
