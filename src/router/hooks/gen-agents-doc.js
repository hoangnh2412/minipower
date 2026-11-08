#!/usr/bin/env node
/**
 * Minipower — sinh các bảng "rules-as-data" từ rules.json (R3 + N1/N2/N3/N4).
 *
 * Mỗi target = 1 file có cặp marker HTML comment; generator thay phần GIỮA marker,
 * mọi thứ ngoài marker do người viết tay. Nhờ đó "thêm DOC-19 / intent / role = sửa
 * rules.json" — chạy `npm run gen` là mọi doc tự cập nhật.
 *
 *   node gen-agents-doc.js          # ghi lại mọi target
 *   node gen-agents-doc.js --check  # CI: exit 1 nếu bất kỳ target lệch rules.json
 *
 * Target:
 *   skills/minipower-router-readiness/SKILL.md — bảng tiền đề theo intent (N1)
 *   roles/README.md                 — chỉ mục vai trò (N3)
 *   skills/minipower-router/SKILL.md — bảng project_mode
 *   contracts/doc-mode.md           — DOC × pack
 *   hooks.json, cli/claude/settings.fragment.json,
 *   cli/cursor/hooks/hooks.fragment.json — wiring hook (SSOT: rules.json install_hooks)
 *   hooks/lib/module-registry.json — PACK.md packs (ADR-031 QĐ-4)
 *
 * Không sinh bốn file agent đã bỏ (ADR-039 QĐ-2/QĐ-5). phase_meta vẫn trong rules.json — hook đọc.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  ROLES,
  PREREQ_BY_INTENT,
  PROJECT_MODES,
  formatDocRanges,
  docLabel,
  docScope,
  PHASE_BY_DOC,
} from "./lib/rules.js"
import {
  claudeSettingsFragment,
  cursorHooksFragment,
  pluginHooksJson,
  jsonFile,
} from "./lib/install-fragments.js"
import { scanModuleRegistry } from "./lib/module-registry.js"
import { ROUTER } from "./lib/skill-catalog.js"
import { join } from "node:path"

const rel = (p) => fileURLToPath(new URL(p, import.meta.url))
/** Router — agents/roles (ADR-037 E2). */
const rt = (...p) => join(ROUTER, ...p)

/** Mô tả tình huống mỗi mode — chữ cho NGƯỜI, không phải luật máy (luật ở rules.json). */
const MODE_NOTE = {
  standard: "Sản phẩm mới / outsource; hoặc MVP lên đời",
  mvp: "Chỉ cần chạy được, tài liệu cơ bản",
  maintain: "Hệ chạy nhiều năm, tài liệu cũ rời rạc",
}
const marker = (id) =>
  `<!-- BEGIN generated: ${id} (nguồn: hooks/lib/rules.json — chạy \`npm run gen\`) -->`
const END = (id) => `<!-- END generated: ${id} -->`

function prereqTable() {
  const rows = [
    "| Intent | Tiền đề cần có | Kiểm ở đâu |",
    "|--------|----------------|------------|",
  ]
  for (const it of PREREQ_BY_INTENT) {
    const reqs = it.requires.map(docLabel).join(" · ")
    const scopes = new Set(it.requires.map(docScope))
    const where = scopes.has("module")
      ? scopes.has("project")
        ? "module + dự án"
        : "theo module"
      : "cấp dự án"
    rows.push(`| **${it.label}** | ${reqs} | ${where} |`)
  }
  return rows.join("\n")
}

function projectModesTable() {
  const rows = [
    "| Chế độ | Tình huống | DOC cần điền (`docs_focus`) | prereq | `02-baseline` | `_legacy` |",
    "|--------|------------|------------------------------|:------:|:-------------:|:---------:|",
  ]
  for (const [id, cfg] of Object.entries(PROJECT_MODES)) {
    const focus =
      cfg.docs_focus === "all"
        ? "**tất cả 19 DOC**"
        : `DOC-${formatDocRanges(cfg.docs_focus.map(Number))}`
    const g = cfg.gates
    rows.push(
      `| **${cfg.label}** (\`${id}\`) | ${MODE_NOTE[id] || ""} | ${focus} | ${g.prereq} | ${g.baseline} | ${g.legacy_read} |`,
    )
  }
  return rows.join("\n")
}

function docModeTable() {
  const packByPhase = {
    discovery: "`discovery/`",
    requirements: "`analyst/`",
    architecture: "`architecture/`",
    planning: "`pm/`",
    "change-control": "`analyst/` + `pm/` + `support/`",
  }
  const packByDoc = {
    "16": "`qa/`",
    "17": "`ops/`",
  }
  const rows = [
    "| DOC | Phase (`rules.json`) | Pack nghề (ADR-033) |",
    "|-----|----------------------|---------------------|",
  ]
  for (const [num, phase] of Object.entries(PHASE_BY_DOC)) {
    rows.push(`| DOC-${num} | \`${phase}\` | ${packByDoc[num] || packByPhase[phase] || "—"} |`)
  }
  return rows.join("\n")
}


function rolesTable() {
  const rows = ["| Vai trò | Chức danh | Phase liên quan | File |", "|---------|-----------|-----------------|------|"]
  for (const r of ROLES) {
    rows.push(`| **${r.id}** | ${r.title} | ${r.phase} | [${r.file}](${r.file}) |`)
  }
  return rows.join("\n")
}

const TARGETS = [
  { file: rt("skills", "minipower-router-readiness", "SKILL.md"), id: "prereq-by-intent", build: prereqTable },
  { file: rt("roles", "README.md"), id: "roles-index", build: rolesTable },
  { file: rt("skills", "minipower-router", "SKILL.md"), id: "project-modes", build: projectModesTable },
  { file: rel("../../../contracts/doc-mode.md"), id: "doc-mode", build: docModeTable },
]

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function render(target) {
  const current = readFileSync(target.file, "utf8")
  const begin = marker(target.id)
  const end = END(target.id)
  const block = `${begin}\n\n${target.build()}\n\n${end}`
  const re = new RegExp(`${escape(begin)}[\\s\\S]*?${escape(end)}`)
  if (!re.test(current)) {
    throw new Error(`Không tìm thấy marker "${target.id}" trong ${target.file}. Thêm cặp:\n${begin}\n${end}`)
  }
  return { current, next: current.replace(re, block) }
}

const check = process.argv.includes("--check")
let drift = false

for (const target of TARGETS) {
  const { current, next } = render(target)
  const name =
    target.file.split("/router/")[1] ||
    target.file.split("/contracts/")[1] ||
    target.file
  if (check) {
    if (next !== current) {
      drift = true
      process.stderr.write(`${name} lệch rules.json. Chạy \`npm run gen\` rồi commit.\n`)
    }
  } else if (next !== current) {
    writeFileSync(target.file, next)
    process.stdout.write(`Đã cập nhật ${name} từ rules.json.\n`)
  } else {
    process.stdout.write(`${name} đã đồng bộ — không đổi.\n`)
  }
}

const PLUGIN_HOOKS = rel("hooks.json")

function writeJsonTarget(file, next, name) {
  const current = existsSync(file) ? readFileSync(file, "utf8") : ""
  if (check) {
    if (next !== current) {
      drift = true
      process.stderr.write(`${name} lệch install_hooks. Chạy \`npm run gen\` rồi commit.\n`)
    }
  } else if (next !== current) {
    writeFileSync(file, next)
    process.stdout.write(`Đã cập nhật ${name} từ rules.json install_hooks.\n`)
  } else {
    process.stdout.write(`${name} đã đồng bộ — không đổi.\n`)
  }
}

writeJsonTarget(
  rel("../../../cli/claude/settings.fragment.json"),
  jsonFile(claudeSettingsFragment()),
  "cli/claude/settings.fragment.json",
)
writeJsonTarget(
  rel("../../../cli/cursor/hooks/hooks.fragment.json"),
  jsonFile(cursorHooksFragment()),
  "cli/cursor/hooks/hooks.fragment.json",
)
writeJsonTarget(PLUGIN_HOOKS, jsonFile(pluginHooksJson()), "hooks/hooks.json")
writeJsonTarget(rel("lib/module-registry.json"), jsonFile(scanModuleRegistry()), "hooks/lib/module-registry.json")

if (check) {
  if (drift) process.exit(1)
  process.stdout.write("Mọi bảng generated đồng bộ với rules.json.\n")
}
