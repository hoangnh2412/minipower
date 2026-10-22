#!/usr/bin/env node
/**
 * Minipower CLI — install (wire IDE) · init (cây dự án + .minipower/).
 * ADR-031 · ADR-034. Node ≥ 18, không dependency.
 *
 *   node cli/minipower.mjs install
 *   node cli/minipower.mjs init
 *   (flag --client / --answers chỉ cho CI)
 */

import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { spawnSync } from "node:child_process"
import { homedir, userInfo } from "node:os"
import { basename, dirname, join, resolve } from "node:path"
import { stdin, stdout } from "node:process"
import * as readline from "node:readline/promises"
import { fileURLToPath } from "node:url"

let DatabaseSync = null
try {
  ;({ DatabaseSync } = await import("node:sqlite"))
} catch {
  DatabaseSync = null
}

import { CLAUDE_PACK_PLACEHOLDER, claudeSettingsFragment, jsonFile } from "../src/router/hooks/lib/install-fragments.js"
import {
  defaultWithPacks,
  loadModuleRegistry,
} from "../src/router/hooks/lib/module-registry.js"
import { resolveSurfaces, validateProfile, validateUserProfile } from "../src/router/hooks/lib/profile-guard.js"
import { RULES } from "../src/router/hooks/lib/rules.js"
import { listLeafSkills } from "../src/router/hooks/lib/skill-catalog.js"

const MODE_ORDER = ["mvp", "standard", "maintain"]
const CLIENT_ORDER = ["cursor", "claude", "opencode"]
const FACES = ["docs", "tasks", "chat", "code"]
const NO_MCP = new Set(["local", "none"])

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, "..")
const ROUTER = join(REPO, "src", "router")
const CLIENTS = JSON.parse(readFileSync(join(HERE, "clients.json"), "utf8"))

function die(msg, code = 1) {
  process.stderr.write(msg + "\n")
  process.exit(code)
}

function parseArgs(argv) {
  const flags = {}
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--")) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith("--")) flags[key] = true
      else {
        flags[key] = next
        i++
      }
    } else rest.push(a)
  }
  return { cmd: rest[0], flags }
}

function osUser() {
  try {
    return userInfo().username || process.env.USER || process.env.USERNAME || ""
  } catch {
    return process.env.USER || process.env.USERNAME || ""
  }
}

function copyTree(src, dest) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  for (const e of readdirSync(src, { withFileTypes: true })) {
    if (e.name === ".DS_Store") continue
    const s = join(src, e.name)
    const d = join(dest, e.name)
    if (e.isDirectory()) copyTree(s, d)
    else if (!existsSync(d)) copyFileSync(s, d)
  }
}

function applyLayout(target, surfaces) {
  const picked = new Set(surfaces)
  if (picked.has("docs")) {
    copyTree(join(ROUTER, "project-skeleton"), target)
    copyTree(join(ROUTER, "docs-skeleton"), join(target, "docs"))
  } else {
    copyTree(join(ROUTER, "project-skeleton", "memory"), join(target, "memory"))
  }
  for (const spec of RULES.project_surfaces) {
    if (spec.id === "docs" || !picked.has(spec.id)) continue
    const src = join(ROUTER, "surface-skeleton", spec.id)
    if (existsSync(src)) copyTree(src, join(target, spec.path))
  }
}

function writeSurfaceIndex(target, surfaces) {
  const code = RULES.project_surfaces.filter((s) => s.id !== "docs" && surfaces.includes(s.id))
  const readme = join(target, "README.md")
  if (!code.length || !existsSync(readme)) return
  const rows = code.map((s) => `| \`${s.path}/\` | ${s.role} |`).join("\n")
  const block = [
    "## Code",
    "",
    "<!-- surfaces:start -->",
    "| Thư mục | Vai trò |",
    "|---------|---------|",
    rows,
    "<!-- surfaces:end -->",
    "",
  ].join("\n")
  const text = readFileSync(readme, "utf8")
  const re = /## Code\n\n<!-- surfaces:start -->[\s\S]*?<!-- surfaces:end -->\n?/
  const next = re.test(text) ? text.replace(re, block) : `${text.replace(/\s*$/, "\n\n")}${block}`
  writeFileSync(readme, next)
}

function linkPath(src, dest) {
  const abs = resolve(src)
  mkdirSync(dirname(dest), { recursive: true })
  const isDir = lstatSync(abs).isDirectory()
  if (existsSync(dest)) {
    try {
      if (lstatSync(dest).isSymbolicLink()) unlinkSync(dest)
      else return "exists"
    } catch {
      return "exists"
    }
  }
  try {
    if (isDir) symlinkSync(abs, dest, process.platform === "win32" ? "junction" : "dir")
    else symlinkSync(abs, dest)
    return "symlink"
  } catch {
    if (isDir) cpSync(abs, dest, { recursive: true })
    else copyFileSync(abs, dest)
    return "copy"
  }
}

function isOurs(cmd) {
  const s = String(cmd || "")
  return (
    s.includes("minipower-sdlc") ||
    s.includes("minipower-router") ||
    s.includes(`${join("sdlc", "hooks", "bin")}`) ||
    s.includes(`${join("router", "hooks", "bin")}`) ||
    s.includes("minipower/sdlc/hooks") ||
    s.includes("minipower/src/router/hooks")
  )
}

function mergeClaude(cur, frag) {
  const next = { ...cur, hooks: { ...(cur.hooks || {}) } }
  for (const event of Object.keys(frag.hooks || {})) {
    const groups = Array.isArray((cur.hooks || {})[event]) ? (cur.hooks || {})[event] : []
    const kept = groups
      .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isOurs(h.command)) }))
      .filter((g) => (g.hooks || []).length)
    next.hooks[event] = [...kept, ...frag.hooks[event]]
  }
  return next
}

function mergeCursor(cur, frag) {
  const next = { version: cur.version || frag.version || 1, hooks: { ...(cur.hooks || {}) } }
  for (const event of Object.keys(frag.hooks || {})) {
    const prev = Array.isArray((cur.hooks || {})[event]) ? (cur.hooks || {})[event] : []
    const kept = prev.filter((h) => !isOurs(h.command))
    next.hooks[event] = [...kept, ...frag.hooks[event]]
  }
  return next
}

function writeJson(path, obj) {
  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path)) copyFileSync(path, path + ".bak")
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n")
}

function resolveClaudeFrag() {
  const packRoot = JSON.stringify(ROUTER).slice(1, -1)
  const raw = jsonFile(claudeSettingsFragment()).split(CLAUDE_PACK_PLACEHOLDER).join(packRoot)
  return JSON.parse(raw)
}

function installSkills(target, skillsRel, withPacks, opts = {}) {
  const skip = new Set(opts.skipSkillNames || [])
  const destRoot = join(target, skillsRel)
  const leaves = listLeafSkills().filter((s) => withPacks.includes(s.pack))
  const notes = []
  for (const s of leaves) {
    if (skip.has(s.name)) {
      notes.push(`${s.name}:skip(sdlc-pack-link)`)
      continue
    }
    const src = join(REPO, "src", s.pack, "skills", s.name)
    const dest = join(destRoot, s.name)
    notes.push(`${s.name}:${linkPath(src, dest)}`)
  }
  return notes
}

function cursorUserRulesDir() {
  const home = process.env.MINIPOWER_CURSOR_HOME || homedir()
  return join(home, ".cursor", "rules")
}

function cursorRulesSourceDir() {
  return join(HERE, "cursor", "rules")
}

function listCursorRuleFiles() {
  const rulesDir = cursorRulesSourceDir()
  if (!existsSync(rulesDir)) return []
  return readdirSync(rulesDir)
    .filter((f) => f.endsWith(".mdc"))
    .sort()
}

function installCursorUserRules() {
  const rulesDir = cursorRulesSourceDir()
  if (!existsSync(rulesDir)) die(`Thiếu ${rulesDir}`)
  const files = listCursorRuleFiles()
  if (!files.length) die(`Không có .mdc trong ${rulesDir}`)
  mkdirSync(cursorUserRulesDir(), { recursive: true })
  for (const f of files) {
    const src = join(rulesDir, f)
    const dest = join(cursorUserRulesDir(), f)
    if (existsSync(dest)) {
      try {
        unlinkSync(dest)
      } catch {
        /* replace bên dưới */
      }
    }
    const how = linkPath(src, dest)
    process.stdout.write(`✓ cursor user-rule ${dest} (${how})\n`)
  }
}

function installClient(id, target, withPacks, dry, opts = {}) {
  const spec = CLIENTS[id]
  if (!spec) die(`Client không hỗ trợ: ${id}. Có: ${Object.keys(CLIENTS).join(", ")}`)
  if (dry) {
    process.stdout.write(`[dry-run] ${id} → ${target}\n`)
    if (id === "cursor" && opts.userRules !== false) {
      for (const f of listCursorRuleFiles()) {
        process.stdout.write(`[dry-run] cursor user-rule ${join(cursorUserRulesDir(), f)}\n`)
      }
    }
    return
  }

  if (spec.kind === "claude-settings") {
    const frag = resolveClaudeFrag()
    const settings = join(target, spec.settingsRel)
    mkdirSync(dirname(settings), { recursive: true })
    const cur = existsSync(settings) ? JSON.parse(readFileSync(settings, "utf8")) : {}
    writeJson(settings, mergeClaude(cur, frag))
    process.stdout.write(`✓ ${id} settings ${settings}\n`)
  }

  if (spec.kind === "cursor-hooks") {
    const frag = JSON.parse(
      readFileSync(join(HERE, "cursor", "hooks", "hooks.fragment.json"), "utf8"),
    )
    const hooksPath = join(target, spec.hooksRel)
    mkdirSync(dirname(hooksPath), { recursive: true })
    const cur = existsSync(hooksPath) ? JSON.parse(readFileSync(hooksPath, "utf8")) : {}
    writeJson(hooksPath, mergeCursor(cur, frag))
    const rulesDir = join(HERE, "cursor", "rules")
    if (existsSync(rulesDir)) {
      mkdirSync(join(target, spec.rulesRel), { recursive: true })
      for (const f of readdirSync(rulesDir)) {
        if (!f.endsWith(".mdc")) continue
        const dest = join(target, spec.rulesRel, f)
        linkPath(join(rulesDir, f), dest)
      }
    }
    if (opts.userRules !== false) installCursorUserRules()
  }

  if (spec.kind === "opencode") {
    const frag = JSON.parse(readFileSync(join(HERE, "opencode", "opencode.fragment.json"), "utf8"))
    const cfg = join(target, spec.configRel)
    const cur = existsSync(cfg) ? JSON.parse(readFileSync(cfg, "utf8")) : {}
    const instructions = [...new Set([...(cur.instructions || []), ...(frag.instructions || [])])]
    writeJson(cfg, { ...cur, ...frag, instructions })
    const plugSrc = join(HERE, "opencode", "plugins", "minipower.ts")
    const plugDest = join(target, spec.pluginRel)
    mkdirSync(dirname(plugDest), { recursive: true })
    if (!existsSync(plugDest)) copyFileSync(plugSrc, plugDest)
    const rulesSrc = join(HERE, "opencode", "rules")
    if (existsSync(rulesSrc)) {
      mkdirSync(join(target, spec.rulesRel), { recursive: true })
      for (const f of readdirSync(rulesSrc)) {
        copyFileSync(join(rulesSrc, f), join(target, spec.rulesRel, f))
      }
    }
    process.stdout.write(`✓ opencode config ${cfg}\n`)
  }

  const skipSkillNames =
    spec.kind === "cursor-hooks" && spec.sdlcLinkName ? [spec.sdlcLinkName] : []
  const notes = installSkills(target, spec.skillsRel, withPacks, { skipSkillNames })
  if (spec.kind === "cursor-hooks" && spec.sdlcLinkName) {
    const sdlcLink = join(target, spec.skillsRel, spec.sdlcLinkName)
    const how = linkPath(ROUTER, sdlcLink)
    process.stdout.write(`✓ cursor hooks; router pack ${sdlcLink} (${how})\n`)
  }
  process.stdout.write(`✓ ${id} skills ${notes.length} (${notes.filter((n) => n.endsWith(":copy")).length} copy)\n`)
}

function parseCsv(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

async function cmdInstall(flags) {
  if (flags["list-modules"]) {
    process.stdout.write(jsonFile(loadModuleRegistry(REPO)))
    return
  }

  if (flags["print-user-rules"]) {
    const files = listCursorRuleFiles()
    if (!files.length) die(`Không có .mdc trong ${cursorRulesSourceDir()}`)
    const parts = files.map((f) => readFileSync(join(cursorRulesSourceDir(), f), "utf8"))
    process.stdout.write(parts.join("\n\n"))
    return
  }

  if (flags.check && !flags["dry-run"]) {
    let n = 0
    for (const script of [
      "token-guard.js",
      "auto-routing.js",
      "profile-guard.js",
      "prereq-gate.js",
      "decision-staleness.js",
      "baseline-guard.js",
    ]) {
      if (!existsSync(join(ROUTER, "hooks", "bin", script))) die(`Thiếu shim ${script}`)
      n++
    }
    process.stdout.write(`(--check) ${n} shim có mặt. Không ghi.\n`)
    return
  }

  const registry = loadModuleRegistry(REPO)
  const known = new Set(registry.map((p) => p.pack))
  const flagged = flags.client && flags.client !== true
  let target = resolve(flags.target && flags.target !== true ? flags.target : process.cwd())
  let clients = flagged ? parseCsv(flags.client) : []
  let withPacks = flags.with && flags.with !== true ? parseCsv(flags.with) : defaultWithPacks(registry)
  let userRules = flags["no-user-rules"] !== true

  if (flags.print) {
    if (!clients.length) die(" --print cần --client claude (hoặc chạy install không flag để hỏi).")
    if (clients.includes("claude")) process.stdout.write(jsonFile(resolveClaudeFrag()))
    return
  }

  if (!flagged) {
    const asked = await promptInstall(registry)
    target = asked.target
    clients = asked.clients
    withPacks = asked.withPacks
    userRules = asked.userRules
  }

  if (!clients.length) die("Thiếu client (cursor / claude / opencode).")
  for (const p of withPacks) {
    if (!known.has(p)) die(`Module không có trong registry: ${p}`)
  }

  process.stdout.write(
    `Repo: ${REPO}\nTarget: ${target}\nClient: ${clients.join(", ")}\nWith: ${withPacks.join(", ")}\n`,
  )

  for (const id of clients) {
    installClient(id, target, withPacks, flags["dry-run"] === true, { userRules })
  }
  if (!flags["dry-run"]) recordInstalledClients(target, clients)
}

function minipowerDir(target) {
  return join(target, ".minipower")
}

function writeClientsJson(target, extraClients = []) {
  const dir = minipowerDir(target)
  mkdirSync(dir, { recursive: true })
  const p = join(dir, "clients.json")
  const prev = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { clients: [] }
  const set = new Set([...(prev.clients || []), ...extraClients])
  writeFileSync(p, jsonFile({ clients: [...set].sort(), factory_root: REPO }))
}

function writeFactoryLauncher(target) {
  writeClientsJson(target, [])
  const bin = join(minipowerDir(target), "bin")
  mkdirSync(bin, { recursive: true })
  const dest = join(bin, "minipower")
  writeFileSync(
    dest,
    `#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const cfg = JSON.parse(readFileSync(join(root, "clients.json"), "utf8"))
if (!cfg.factory_root) {
  process.stderr.write("Thiếu factory_root trong .minipower/clients.json\\n")
  process.exit(1)
}
const cli = join(cfg.factory_root, "cli", "minipower.mjs")
const r = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { stdio: "inherit" })
process.exit(r.status === null ? 1 : r.status)
`,
  )
  try {
    chmodSync(dest, 0o755)
  } catch {
    /* Windows */
  }
}

function recordInstalledClients(target, clients) {
  writeClientsJson(target, clients)
  writeFactoryLauncher(target)
}

function ensureSqlite(dir) {
  const dbPath = join(dir, "minipower.sqlite")
  if (DatabaseSync) {
    const db = new DatabaseSync(dbPath)
    db.exec(`CREATE TABLE IF NOT EXISTS intent_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    prompt TEXT,
    skill TEXT
  );`)
    db.close()
    return
  }
  writeFileSync(dbPath, "")
  writeFileSync(
    join(dir, "schema.sql"),
    "CREATE TABLE IF NOT EXISTS intent_log (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, prompt TEXT, skill TEXT);\n",
  )
}

function requiredAnswers() {
  return [
    "project_name",
    "project_summary",
    "project_mode",
    "current_phase",
    "docs_provider",
    "tasks_provider",
    "chat_provider",
    "code_provider",
    "user_name",
    "honorific",
    "roles",
    "minipower_experience",
  ]
}

async function promptInstall(registry) {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: Boolean(stdin.isTTY) })
  const iter = rl[Symbol.asyncIterator]()
  try {
    stdout.write(`Minipower install → factory ${REPO}\nEnter = mặc định. Không tự dò client.\n`)
    stdout.write(`Thư mục dự án [${process.cwd()}]: `)
    const target = resolve(await nextLine(iter, process.cwd()))

    const clientOpts = CLIENT_ORDER.filter((id) => CLIENTS[id])
    stdout.write("\nClient (nhiều số: 1,2)\n")
    clientOpts.forEach((id, i) => {
      const d = i === 0 ? "  ← mặc định" : ""
      stdout.write(`  ${i + 1}) ${id}${d}\n`)
    })
    let clients = []
    for (;;) {
      const raw = (await nextLine(iter, "1")) || "1"
      const parts = raw.split(/[,\s]+/).filter(Boolean)
      const ids = []
      let ok = true
      for (const p of parts) {
        const n = Number(p)
        if (Number.isInteger(n) && n >= 1 && n <= clientOpts.length) ids.push(clientOpts[n - 1])
        else if (CLIENTS[p]) ids.push(p)
        else {
          ok = false
          break
        }
      }
      if (ok && ids.length) {
        clients = [...new Set(ids)]
        break
      }
      stdout.write("Không hợp lệ.\n")
    }

    const defaults = defaultWithPacks(registry)
    stdout.write("\nPack (Enter = mặc định; all = mọi pack; số hoặc tên)\n")
    registry.forEach((p, i) => {
      const d = p.install?.default ? "  ← mặc định" : ""
      stdout.write(`  ${i + 1}) ${p.pack} (${p.kind})${d}\n`)
    })
    let withPacks = defaults
    const packRaw = await nextLine(iter, "")
    if (packRaw === "all") withPacks = registry.map((p) => p.pack)
    else if (packRaw) {
      const parts = packRaw.split(/[,\s]+/).filter(Boolean)
      const ids = []
      for (const p of parts) {
        const n = Number(p)
        if (Number.isInteger(n) && n >= 1 && n <= registry.length) ids.push(registry[n - 1].pack)
        else ids.push(p)
      }
      withPacks = [...new Set(ids)]
    }

    let userRules = true
    if (clients.includes("cursor")) {
      stdout.write(
        "\nAlways-on user-global (~/.cursor/rules/minipower-always-on.mdc) — mọi workspace Cursor, kể cả không .minipower/. [Y/n]: ",
      )
      const ur = (await nextLine(iter, "Y")).toLowerCase()
      userRules = ur !== "n" && ur !== "no"
    }

    stdout.write(`\n${target}\nclient: ${clients.join(", ")}\npack: ${withPacks.join(", ")}\n`)
    stdout.write("Cài? [Y/n]\n")
    const ok = (await nextLine(iter, "Y")).toLowerCase()
    if (ok === "n" || ok === "no") die("Huỷ install.")
    return { target, clients, withPacks, userRules }
  } finally {
    rl.close()
  }
}

async function nextLine(iter, fallback = "") {
  const { value, done } = await iter.next()
  if (done) return fallback
  const a = String(value ?? "").trim()
  return a || fallback
}

async function askChoiceFrom(iter, title, options, defaultIndex = 0) {
  stdout.write(`\n${title}\n`)
  options.forEach((o, i) => {
    const d = i === defaultIndex ? "  ← mặc định" : ""
    stdout.write(`  ${i + 1}) ${o.label}${d}\n`)
  })
  for (;;) {
    const raw = await nextLine(iter, "")
    if (raw === "") return options[defaultIndex].value
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return options[n - 1].value
    const hit = options.find((o) => o.value.toLowerCase() === raw.toLowerCase())
    if (hit) return hit.value
    stdout.write("Không hợp lệ — nhập số hoặc giá trị.\n")
  }
}

async function askRolesFrom(iter) {
  const roles = RULES.roles
  stdout.write("\nVai trò (nhiều số: 1,3 hoặc 1 3)\n")
  roles.forEach((r, i) => stdout.write(`  ${i + 1}) ${r.id} — ${r.title}\n`))
  for (;;) {
    const raw = (await nextLine(iter, "1")) || "1"
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    const ids = []
    let ok = true
    for (const p of parts) {
      const n = Number(p)
      if (Number.isInteger(n) && n >= 1 && n <= roles.length) ids.push(roles[n - 1].id)
      else if (roles.some((r) => r.id === p)) ids.push(p)
      else {
        ok = false
        break
      }
    }
    if (ok && ids.length) return [...new Set(ids)]
    stdout.write("Không hợp lệ.\n")
  }
}

async function askSurfacesFrom(iter) {
  const specs = RULES.project_surfaces
  stdout.write("\nBề mặt (nhiều số: 1,2 hoặc Enter = mặc định)\n")
  specs.forEach((s, i) => {
    const d = s.default ? "  ← mặc định" : ""
    stdout.write(`  ${i + 1}) ${s.id} — ${s.label}${d}\n`)
  })
  for (;;) {
    const raw = await nextLine(iter, "")
    if (raw === "") return resolveSurfaces(undefined)
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    const ids = []
    let ok = true
    for (const p of parts) {
      const n = Number(p)
      if (Number.isInteger(n) && n >= 1 && n <= specs.length) ids.push(specs[n - 1].id)
      else if (specs.some((s) => s.id === p)) ids.push(p)
      else {
        ok = false
        break
      }
    }
    const resolved = ok ? resolveSurfaces(ids) : null
    if (resolved) return resolved
    stdout.write("Không hợp lệ.\n")
  }
}

async function promptAnswers(target) {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: Boolean(stdin.isTTY) })
  const iter = rl[Symbol.asyncIterator]()
  try {
    stdout.write(`Minipower init → ${target}\nEnter = mặc định. Script hỏi, không gọi LLM.\n`)
    stdout.write(`Tên dự án [${basename(target)}]: `)
    const project_name = await nextLine(iter, basename(target))
    stdout.write(`Tóm tắt một dòng [dự án Minipower]: `)
    const project_summary = await nextLine(iter, "dự án Minipower")
    const modeOpts = MODE_ORDER.filter((id) => RULES.project_modes[id]).map((id) => ({
      value: id,
      label: `${id} — ${RULES.project_modes[id].label}`,
    }))
    const project_mode = await askChoiceFrom(iter, "Chế độ dự án", modeOpts, 0)
    const phaseOpts = RULES.phase_order.map((id) => ({ value: id, label: id }))
    const current_phase = await askChoiceFrom(iter, "Phase hiện tại", phaseOpts, 0)
    const mcp = {}
    const providers = {}
    for (const face of FACES) {
      const allowed = RULES.profile_providers[face] || []
      const def = allowed.includes("local")
        ? allowed.indexOf("local")
        : allowed.includes("none")
          ? allowed.indexOf("none")
          : 0
      const val = await askChoiceFrom(
        iter,
        `Provider ${face}`,
        allowed.map((v) => ({ value: v, label: v })),
        def,
      )
      providers[`${face}_provider`] = val
      if (!NO_MCP.has(val)) {
        const srv = await nextLine(iter, "")
        if (!String(srv).trim()) die(`Provider ${val} cần tên MCP server`)
        mcp[face] = srv.trim()
      }
    }
    stdout.write(`Tên người (xưng hô) [${osUser() || "bạn"}]: `)
    const user_name = await nextLine(iter, osUser() || "bạn")
    const honorific = await askChoiceFrom(
      iter,
      "Danh xưng",
      [
        { value: "anh", label: "anh" },
        { value: "chị", label: "chị" },
      ],
      0,
    )
    const roles = await askRolesFrom(iter)
    const surfaces = await askSurfacesFrom(iter)
    const minipower_experience = await askChoiceFrom(
      iter,
      "Đã dùng Minipower chưa",
      [
        { value: "new", label: "new — lần đầu" },
        { value: "returning", label: "returning — đã dùng" },
      ],
      0,
    )
    stdout.write(
      `\n${project_name} · ${project_mode} · ${current_phase} · ${surfaces.join("+")} · ${user_name} (${honorific}) · ${roles.join("+")}\n`,
    )
    stdout.write("Ghi cây dự án? [Y/n]\n")
    const ok = (await nextLine(iter, "Y")).toLowerCase()
    if (ok === "n" || ok === "no") die("Huỷ init.")
    return {
      project_name,
      project_summary,
      project_mode,
      current_phase,
      ...providers,
      mcp: Object.keys(mcp).length ? mcp : undefined,
      user_name,
      honorific,
      roles,
      surfaces,
      minipower_experience,
    }
  } finally {
    rl.close()
  }
}

async function loadAnswers(flags, target) {
  if (flags.answers && flags.answers !== true) {
    const p = resolve(flags.answers)
    if (!existsSync(p)) die(`Không thấy --answers ${p}`)
    return JSON.parse(readFileSync(p, "utf8"))
  }
  return promptAnswers(target)
}

async function cmdInit(flags) {
  const target = resolve(flags.target || process.cwd())
  if (flags.check) {
    const errors = checkInit(target)
    if (errors.length) {
      process.stderr.write(errors.map((e) => `FAIL ${e}`).join("\n") + "\n")
      process.exit(1)
    }
    process.stdout.write("init --check OK\n")
    return
  }

  const a = await loadAnswers(flags, target)
  const surfaces = resolveSurfaces(a.surfaces)
  if (!surfaces) {
    const ids = RULES.project_surfaces.map((s) => s.id).join(", ")
    die(`surfaces phải là mảng không rỗng gồm: ${ids}`)
  }
  const missing = requiredAnswers().filter((k) => {
    const v = a[k]
    if (Array.isArray(v)) return v.length === 0
    return v == null || String(v).trim() === ""
  })
  if (missing.length) die(`Thiếu trường: ${missing.join(", ")}`)

  const readmeExisted = existsSync(join(target, "README.md"))
  applyLayout(target, surfaces)
  if (!readmeExisted) writeSurfaceIndex(target, surfaces)

  // ADR-035: entry cá nhân — copy khuôn → memory.md (gitignore trên dự án đích)
  const memExample = join(target, "memory", "memory.md.example")
  const memLocal = join(target, "memory", "memory.md")
  if (existsSync(memExample) && !existsSync(memLocal)) copyFileSync(memExample, memLocal)

  const profile = {
    version: 3,
    project_name: a.project_name,
    project_summary: a.project_summary,
    current_phase: a.current_phase,
    project_mode: a.project_mode,
    docs_provider: a.docs_provider,
    tasks_provider: a.tasks_provider,
    chat_provider: a.chat_provider,
    code_provider: a.code_provider,
    trace_store: "sqlite",
    surfaces,
  }
  if (a.mcp && typeof a.mcp === "object") profile.mcp = a.mcp
  const pv = validateProfile(profile)
  if (!pv.valid) die(`profile.json: ${pv.errors.join("; ")}`)
  mkdirSync(join(target, "memory"), { recursive: true })
  writeFileSync(join(target, "memory", "profile.json"), jsonFile(profile))

  const user = {
    user_name: a.user_name,
    honorific: a.honorific,
    agent_pronoun: a.agent_pronoun || "em",
    roles: a.roles,
    minipower_experience: a.minipower_experience,
    os_username: a.os_username || osUser(),
  }
  const uv = validateUserProfile(user)
  if (!uv.valid) die(`profile.user: ${uv.errors.join("; ")}`)
  writeFileSync(join(target, "memory", "profile.user.json"), jsonFile(user))

  const mp = minipowerDir(target)
  mkdirSync(mp, { recursive: true })
  writeFileSync(join(mp, "identity.json"), jsonFile(user))
  ensureSqlite(mp)
  if (!existsSync(join(mp, "clients.json"))) writeFileSync(join(mp, "clients.json"), jsonFile({ clients: [] }))

  if (a.project_mode === "mvp" || a.project_mode === "maintain") {
    const debt = join(target, "memory", "doc-debt.md")
    if (!existsSync(debt)) copyFileSync(join(ROUTER, "project-skeleton", "memory", "doc-debt.md"), debt)
  }

  writeFactoryLauncher(target)
  printAgentsHint(target, profile)
  process.stdout.write(`✓ init ${target}\n  tiếp: node .minipower/bin/minipower --help\n`)
}

function printAgentsHint(target, profile) {
  const agents = join(target, "AGENTS.md")
  if (existsSync(agents)) {
    process.stdout.write("AGENTS.md đã có — giữ nguyên.\n")
    return
  }
  const sample = join(ROUTER, "templates", "SAMPLE-agents.md")
  const surfaces = profile.surfaces.join(", ")
  const backend = profile.surfaces.includes("backend") ? "Code backend nằm ở `backend/src/`.\n" : ""
  process.stdout.write(`AGENTS.md chưa có. Init không ghi file này.
Dán prompt sau vào chat của dự án để AI viết AGENTS.md:

---
Đọc bản mẫu ${sample}.
Viết file AGENTS.md mới, cùng cấu trúc mục 0–8, tiếng Việt, đúng sự thật dưới đây. Không chép tên dự án của bản mẫu.

project_name: ${profile.project_name}
project_summary: ${profile.project_summary}
project_mode: ${profile.project_mode}
current_phase: ${profile.current_phase}
docs_provider: ${profile.docs_provider}
tasks_provider: ${profile.tasks_provider}
chat_provider: ${profile.chat_provider}
code_provider: ${profile.code_provider}
Bề mặt đang có: \`${surfaces}\`
${backend}Không ghi tên người. Không chèn link tới SAMPLE-agents.md hay TPL-agent-profile.md.
---
`)
}

function declaredSurfaces(target) {
  const pf = join(target, "memory", "profile.json")
  if (!existsSync(pf)) return resolveSurfaces(undefined)
  try {
    const surfaces = resolveSurfaces(JSON.parse(readFileSync(pf, "utf8")).surfaces)
    return surfaces || resolveSurfaces(undefined)
  } catch {
    return resolveSurfaces(undefined)
  }
}

function checkInit(target) {
  const errors = []
  const mp = minipowerDir(target)
  if (!existsSync(mp)) errors.push(".minipower/")
  else {
    if (!existsSync(join(mp, "identity.json"))) errors.push(".minipower/identity.json")
    if (!existsSync(join(mp, "minipower.sqlite"))) errors.push(".minipower/minipower.sqlite")
  }
  const pf = join(target, "memory", "profile.json")
  if (!existsSync(pf)) errors.push("memory/profile.json")
  else {
    const v = validateProfile(JSON.parse(readFileSync(pf, "utf8")))
    if (!v.valid) errors.push(`profile: ${v.errors.join("; ")}`)
  }
  if (!existsSync(join(target, "memory", "memory.md"))) errors.push("memory/memory.md")
  if (!existsSync(join(target, "memory", "decision-log.md"))) errors.push("memory/decision-log.md")
  if (!existsSync(join(target, "memory", "open-questions.md"))) errors.push("memory/open-questions.md")
  const surfaces = declaredSurfaces(target)
  for (const spec of RULES.project_surfaces) {
    if (!surfaces.includes(spec.id)) continue
    if (!existsSync(join(target, spec.path))) errors.push(`${spec.path}/`)
    if (spec.id !== "docs" && !existsSync(join(target, spec.path, "README.md"))) {
      errors.push(`${spec.path}/README.md`)
    }
  }
  if (existsSync(join(target, "docs", "05-traceability", "overview.md"))) {
    errors.push("docs/05-traceability/overview.md (đã bỏ — ADR-035; xoá hoặc migrate vào memory.md)")
  }
  if (existsSync(join(target, "memory", "tasks"))) {
    errors.push("memory/tasks/ (đã bỏ — ADR-035; việc đội → trace.db)")
  }
  const launcher = join(mp, "bin", "minipower")
  if (existsSync(mp) && existsSync(launcher)) {
    const body = readFileSync(launcher, "utf8")
    const stale = body.includes("sdlc/install/minipower.mjs")
    const ok = body.includes('"cli", "minipower.mjs"') || body.includes("cli/minipower.mjs")
    if (stale || !ok) {
      errors.push(".minipower/bin/minipower (shim cũ — chạy lại minipower install)")
    }
  }
  if (existsSync(pf)) {
    const mode = JSON.parse(readFileSync(pf, "utf8")).project_mode
    if (
      surfaces.includes("docs") &&
      (mode === "mvp" || mode === "maintain") &&
      !existsSync(join(target, "memory", "doc-debt.md"))
    ) {
      errors.push("memory/doc-debt.md")
    }
  }
  return errors
}

function usage() {
  process.stdout.write(`minipower — ${REPO}

  install                 hỏi thư mục, client, pack (số + Enter)
  install --client cursor[,claude] [--with pack,...] [--target DIR]
                          [--no-user-rules]   bỏ always-on ~/.cursor/rules/
  init                    hỏi từng bước. AGENTS.md: in prompt, người tự tạo
  init --answers FILE.json   tuỳ chọn "surfaces": ["docs","backend"]
  init --check [--target DIR]
  install --check | --list-modules | --dry-run | --print | --print-user-rules

Từ repo factory (lần đầu):
  node cli/minipower.mjs install
Sau cài, trong dự án:
  node .minipower/bin/minipower init
`)
}

const { cmd, flags } = parseArgs(process.argv.slice(2))
if (!cmd || cmd === "help" || flags.help) {
  usage()
  process.exit(cmd ? 0 : 1)
}
if (cmd === "install") await cmdInstall(flags)
else if (cmd === "init") await cmdInit(flags)
else die(`Lệnh lạ: ${cmd}`)
