/**
 * Golden test cho rules-as-data (R3). Khoá:
 *  - rules.json phủ đủ DOC-01..18, mọi phase hợp lệ.
 *  - Nhãn phase suy ra khớp chuỗi cũ (không regress message hook).
 *  - Regex edit/breadth sinh từ keyword match đúng như bản hardcode cũ.
 *  - bảng generated đồng bộ rules.json (chạy gen --check).
 */

import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import {
  RULES,
  PHASE_BY_DOC,
  PHASE_ORDER,
  PHASE_LABEL,
  EDIT_VERBS,
  BREADTH,
  DOC_SHORT,
  PHASE_META,
  ROLES,
  PREREQ_BY_INTENT,
  DOC_SCOPE,
  PROJECT_MODES,
  DEFAULT_PROJECT_MODE,
  APPROVAL_SOURCE_KINDS,
  PROFILE_PROVIDERS,
  PROJECT_SURFACES,
  formatDocRanges,
  stripDiacritics,
  docLabel,
  docScope,
  stateForPhase,
  roleForPhase,
  matchIntents,
  modeConfig,
  gateLevel,
  requiresForIntent,
} from "../lib/rules.js"

const HOOKS = dirname(dirname(fileURLToPath(import.meta.url)))

test("rules.json — phủ đủ DOC-01..19, phase hợp lệ", () => {
  for (let i = 1; i <= 19; i++) {
    const key = String(i).padStart(2, "0")
    assert.ok(PHASE_BY_DOC[key], `thiếu ${key}`)
    assert.ok(PHASE_ORDER.includes(PHASE_BY_DOC[key]), `phase lạ cho ${key}: ${PHASE_BY_DOC[key]}`)
  }
  assert.equal(Object.keys(PHASE_BY_DOC).length, 19)
  assert.equal(PHASE_BY_DOC["19"], "requirements") // DOC-19 Prototype thuộc requirements
})

test("PHASE_LABEL — suy ra khớp chuỗi cũ", () => {
  assert.equal(PHASE_LABEL.discovery, "discovery (DOC-01–03)")
  assert.equal(PHASE_LABEL.requirements, "requirements (DOC-04–07, 13, 19)")
  assert.equal(PHASE_LABEL.architecture, "architecture (DOC-08–12)")
  assert.equal(PHASE_LABEL.planning, "planning (DOC-14–15)")
  assert.equal(PHASE_LABEL.delivery, "delivery (DOC-16–17)")
  assert.equal(PHASE_LABEL["change-control"], "change-control (DOC-18)")
})

test("formatDocRanges — gom dải liên tục, tách quãng đứt", () => {
  assert.equal(formatDocRanges([1, 2, 3]), "01–03")
  assert.equal(formatDocRanges([4, 5, 6, 7, 13]), "04–07, 13")
  assert.equal(formatDocRanges([18]), "18")
  assert.equal(formatDocRanges([16, 17]), "16–17")
})

test("EDIT_VERBS — match cả có dấu (đã strip) lẫn Anh", () => {
  for (const w of ["sửa", "cập nhật", "viết", "thêm", "update", "edit", "write", "review"]) {
    assert.ok(EDIT_VERBS.test(stripDiacritics(w.toLowerCase())), `miss verb: ${w}`)
  }
  assert.ok(!EDIT_VERBS.test(stripDiacritics("xem gì đó")))
})

test("BREADTH — match từ khoá độ rộng", () => {
  for (const w of ["toàn bộ", "all modules", "đồng bộ hết", "review all"]) {
    assert.ok(BREADTH.test(stripDiacritics(w.toLowerCase())), `miss breadth: ${w}`)
  }
})

test("rules.json giữ đủ danh sách keyword không rỗng", () => {
  assert.ok(RULES.edit_verbs.length >= 5)
  assert.ok(RULES.breadth_words.length >= 3)
})

test("bảng generated đồng bộ rules.json (gen --check)", () => {
  // Nếu lệch, execFileSync ném (exit 1) → test fail với stderr hướng dẫn.
  execFileSync("node", [join(HOOKS, "gen-agents-doc.js"), "--check"], { encoding: "utf8" })
})

// ─── N1/N2/N3/N4 — dữ liệu bổ sung ──────────────────────────────────────────

test("doc_short (N4) — phủ đủ DOC-01..19, không ngoặc lồng", () => {
  for (let i = 1; i <= 19; i++) {
    const key = String(i).padStart(2, "0")
    assert.ok(DOC_SHORT[key], `thiếu doc_short ${key}`)
    assert.ok(!/[()]/.test(DOC_SHORT[key]), `doc_short ${key} có ngoặc → docLabel lồng`)
  }
  assert.equal(docLabel("06"), "DOC-06 (SRS)")
  assert.equal(docLabel(3), "DOC-03 (BRD)")
})

test("phase_meta (N2) — mọi phase có state+role, role trỏ ROLES hợp lệ", () => {
  const roleIds = new Set(ROLES.map((r) => r.id))
  for (const phase of PHASE_ORDER) {
    const meta = PHASE_META[phase]
    assert.ok(meta && meta.state && meta.role, `phase ${phase} thiếu state/role`)
    // role có thể là "DEV / QC / DevOps" — mỗi token phải là role hợp lệ.
    for (const id of meta.role.split("/").map((s) => s.trim())) {
      assert.ok(roleIds.has(id), `phase ${phase}: role lạ "${id}"`)
    }
  }
  assert.equal(stateForPhase("architecture"), "Design")
  assert.equal(roleForPhase("architecture"), "SA")
  assert.equal(stateForPhase("phase-khong-ton-tai"), "phase-khong-ton-tai")
})

test("roles (N3) — id duy nhất, phase hợp lệ, file .md", () => {
  const ids = ROLES.map((r) => r.id)
  assert.equal(new Set(ids).size, ids.length, "role id trùng")
  const phases = new Set(PHASE_ORDER)
  for (const r of ROLES) {
    assert.ok(r.file.endsWith(".md"), `role ${r.id} file lạ`)
    for (const p of r.phase.split(",").map((s) => s.trim())) {
      assert.ok(phases.has(p), `role ${r.id}: phase lạ "${p}"`)
    }
  }
})

test("role files (N3) — mỗi role trong rules.json có file thật", () => {
  const rolesDir = join(HOOKS, "..", "roles")
  for (const r of ROLES) {
    assert.ok(existsSync(join(rolesDir, r.file)), `thiếu file roles/${r.file}`)
  }
})

test("prereq_by_intent (N1) — requires trỏ DOC hợp lệ, keyword không dấu", () => {
  assert.ok(PREREQ_BY_INTENT.length >= 3)
  for (const it of PREREQ_BY_INTENT) {
    assert.ok(it.keywords.length >= 1, `intent ${it.id} không keyword`)
    for (const k of it.keywords) {
      assert.equal(k, stripDiacritics(k.toLowerCase()), `keyword "${k}" phải strip+lower để match norm`)
    }
    for (const d of it.requires) {
      assert.ok(PHASE_BY_DOC[d], `intent ${it.id}: DOC lạ "${d}"`)
    }
  }
})

test("matchIntents (N1) — nhận diện intent từ prompt đã strip", () => {
  const hit = matchIntents(stripDiacritics("giúp tôi viết code cho module billing".toLowerCase()))
  assert.ok(hit.some((h) => h.id === "implement"), "miss intent implement")
  assert.equal(matchIntents(stripDiacritics("chào bạn".toLowerCase())).length, 0)
})

test("intent prototype (A3) — nhận diện, requires DOC-04 (Business Rules đã chốt)", () => {
  const proto = PREREQ_BY_INTENT.find((it) => it.id === "prototype")
  assert.ok(proto, "thiếu intent prototype")
  assert.deepEqual(proto.requires, ["04"])
  assert.ok(matchIntents(stripDiacritics("vẽ prototype cho module billing".toLowerCase())).some((h) => h.id === "prototype"))
  // implement (viết code) nay cần cả prototype DOC-19.
  const impl = PREREQ_BY_INTENT.find((it) => it.id === "implement")
  assert.ok(impl.requires.includes("19"), "implement phải yêu cầu DOC-19 prototype")
})

// ─── ADR-020 — project_mode + doc_scope ─────────────────────────────────────

test("doc_scope (QĐ-13) — phủ đủ DOC-01..19, chỉ project|module, khớp cây docs/ §2b", () => {
  for (let i = 1; i <= 19; i++) {
    const key = String(i).padStart(2, "0")
    const s = DOC_SCOPE[key]
    assert.ok(s, `thiếu doc_scope ${key}`)
    assert.ok(s === "project" || s === "module", `doc_scope ${key} lạ: "${s}"`)
  }
  // DOC sống trong docs/03-modules/{mod}/ — ADR-020 §2b + parallel-work quy tắc 1.
  for (const d of ["04", "05", "06", "07", "16", "19"]) {
    assert.equal(docScope(d), "module", `DOC-${d} phải là module-scoped`)
  }
  // BRD / SAD / Data model / Plan … ở cấp dự án.
  for (const d of ["01", "02", "03", "08", "11", "12", "15", "17", "18"]) {
    assert.equal(docScope(d), "project", `DOC-${d} phải là project-scoped`)
  }
  assert.equal(docScope("99"), "project", "DOC lạ → mặc định an toàn là project")
})

test("doc_scope — intent trộn hai cấp vẫn diễn đạt được (lý do chọn theo DOC, không theo intent)", () => {
  // design-architecture đòi DOC-03 (dự án) + DOC-06 (module) + DOC-13 (dự án).
  // Nếu gắn scope vào intent thì buộc phải chọn một → sai một nửa.
  const da = PREREQ_BY_INTENT.find((it) => it.id === "design-architecture")
  const scopes = new Set(da.requires.map(docScope))
  assert.deepEqual([...scopes].sort(), ["module", "project"])
})

test("project_modes (QĐ-1) — đủ 3 mode, mỗi mode có label/docs_focus/gates hợp lệ", () => {
  assert.deepEqual(Object.keys(PROJECT_MODES).sort(), ["maintain", "mvp", "standard"])
  assert.ok(PROJECT_MODES[DEFAULT_PROJECT_MODE], "default_project_mode trỏ mode không tồn tại")
  assert.equal(DEFAULT_PROJECT_MODE, "standard")

  for (const [name, cfg] of Object.entries(PROJECT_MODES)) {
    assert.ok(cfg.label, `mode ${name} thiếu label`)
    if (cfg.docs_focus !== "all") {
      assert.ok(Array.isArray(cfg.docs_focus) && cfg.docs_focus.length, `mode ${name}: docs_focus rỗng`)
      for (const d of cfg.docs_focus) assert.ok(PHASE_BY_DOC[d], `mode ${name}: docs_focus DOC lạ "${d}"`)
    }
    // QĐ-2: mode KHÔNG được cắt folder — cấm tái sinh skeleton_skip.
    assert.equal(cfg.skeleton_skip, undefined, `mode ${name}: skeleton_skip bị cấm (QĐ-2)`)
    // QĐ-11: dec-gate đã bỏ — không mode nào được khai khoá "dec".
    assert.equal(cfg.gates.dec, undefined, `mode ${name}: khoá gate "dec" đã bỏ (QĐ-11)`)
    for (const g of ["prereq", "baseline", "legacy_read"]) {
      assert.ok(cfg.gates[g], `mode ${name}: thiếu gate ${g}`)
    }
    for (const id of Object.keys(cfg.prereq_overrides || {})) {
      assert.ok(PREREQ_BY_INTENT.some((it) => it.id === id), `mode ${name}: override intent lạ "${id}"`)
    }
  }
})

test("gateLevel — chỉ standard chặn prereq; baseline deny mọi mode (C4); legacy chỉ mở ở maintain (C5)", () => {
  assert.equal(gateLevel("standard", "prereq"), "block")
  assert.equal(gateLevel("mvp", "prereq"), "warn")
  assert.equal(gateLevel("maintain", "prereq"), "warn")

  for (const m of ["standard", "mvp", "maintain"]) {
    assert.equal(gateLevel(m, "baseline"), "deny", `mode ${m}: baseline phải deny mọi mode`)
  }
  assert.equal(gateLevel("maintain", "legacy_read"), "allow")
  assert.equal(gateLevel("standard", "legacy_read"), "deny")
  assert.equal(gateLevel("mvp", "legacy_read"), "deny")

  // Fail-open (R2): mode lạ / thiếu → rơi về standard, không ném.
  assert.equal(gateLevel("mode-khong-ton-tai", "prereq"), "block")
  assert.equal(gateLevel(undefined, "prereq"), "block")
  assert.equal(gateLevel("standard", "gate-khong-ton-tai"), "off")
  assert.equal(modeConfig("linh tinh").label, PROJECT_MODES.standard.label)
})

test("requiresForIntent — override theo mode, standard giữ nguyên giá trị cũ", () => {
  // standard = không override → y hệt prereq_by_intent.
  assert.deepEqual(requiresForIntent("implement", "standard"), ["06", "07", "08", "11", "12", "19"])
  assert.deepEqual(requiresForIntent("test", "standard"), ["06", "07", "16"])

  // mvp nhẹ tay hơn.
  assert.deepEqual(requiresForIntent("implement", "mvp"), ["03", "06", "07"])
  assert.deepEqual(requiresForIntent("deploy", "mvp"), ["17"])
  // intent không override → dùng bộ gốc kể cả ở mvp.
  assert.deepEqual(requiresForIntent("prototype", "mvp"), ["04"])

  // maintain: implement không đòi gì (vào code trước).
  assert.deepEqual(requiresForIntent("implement", "maintain"), [])
  assert.deepEqual(requiresForIntent("test", "maintain"), ["07"])

  assert.deepEqual(requiresForIntent("intent-khong-ton-tai", "standard"), [])
})

test("approval_source_kinds (QĐ-12) — đúng 3 loại tách rời", () => {
  assert.deepEqual(APPROVAL_SOURCE_KINDS, ["docs", "tasks", "code"])
})

test("project_surfaces (ADR-038) — docs mặc định, code opt-in, path = id", () => {
  assert.deepEqual(
    PROJECT_SURFACES.map((s) => s.id),
    ["docs", "backend", "frontend", "mobile", "autotest"],
  )
  assert.equal(PROJECT_SURFACES.find((s) => s.id === "docs").default, true)
  for (const s of PROJECT_SURFACES) {
    assert.equal(s.path, s.id, s.id)
    if (s.id !== "docs") assert.equal(s.default, false, s.id)
    assert.ok(s.role && s.label)
  }
})

test("profile_providers (ADR-033) — enum bốn mặt", () => {
  assert.deepEqual(PROFILE_PROVIDERS.docs, ["local", "outline"])
  assert.deepEqual(PROFILE_PROVIDERS.tasks, ["openproject", "lark", "github", "none"])
  assert.deepEqual(PROFILE_PROVIDERS.chat, ["slack", "lark", "none"])
  assert.deepEqual(PROFILE_PROVIDERS.code, ["gitlab", "local"])
})
