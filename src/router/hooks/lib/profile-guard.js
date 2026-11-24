/**
 * Minipower — profile guard @ beforeSubmitPrompt.
 * SSOT. Chặn prompt làm việc minipower khi dự án chưa có memory/profile.json hợp lệ
 * hoặc identity local thiếu / lệch OS user (ADR-033 QĐ-20).
 *
 * SSOT máy đọc: memory/profile.json (dự án) + memory/profile.user.json (người, gitignore).
 * Dự án minipower = memory/memory.md và (docs/ hoặc profile.surfaces không gồm docs).
 */

import { existsSync, readFileSync } from "node:fs"
import { homedir, userInfo } from "node:os"
import { join } from "node:path"

import { shouldBypass } from "./bypass.js"
import { RULES, stripDiacritics } from "./rules.js"

/** @typedef {{action:"allow"}|{action:"block",message:string}} ProfileGuardResult */

/**
 * Schema hiện hành. **v1 và v2 vẫn hợp lệ** — dự án cài bản cũ không bị chặn oan
 * (tương thích ngược, ADR-020 QĐ-2a). v3 = dự án + identity tách file (ADR-033).
 */
export const PROFILE_VERSION = 3
const SUPPORTED_VERSIONS = new Set([1, 2, 3])

const VALID_PHASES = new Set(RULES.phase_order)
const VALID_ROLES = new Set(RULES.roles.map((r) => r.id))
const VALID_EXPERIENCE = new Set(["new", "returning"])
const VALID_HONORIFIC = new Set(["anh", "chi"])
const PROVIDERS = RULES.profile_providers
const FACES = ["docs", "tasks", "chat", "code"]
const NO_MCP = new Set(["local", "none"])

const EXEMPT_RE =
  /\b(init project|khoi tao|khoi tao du an|tao folder du an|reconfigure agent|cap nhat profile|ca nhan hoa|hoan tat profile|personalize profile|khai bao toi la ai)\b/

const MINIPOWER_WORK_RE =
  /\/minipower\b|phase:\s*(discovery|requirements|architecture|planning|delivery|change-control)\b|doc-\d{2}\b|@docs\b|\/docs\/|\/memory\//

/**
 * @param {string} [root]
 * @returns {string}
 */
export function projectRoot(root) {
  return root || process.env.MP_PROJECT_ROOT || process.cwd()
}

/**
 * @returns {string}
 */
export function osUsername() {
  try {
    return userInfo().username || process.env.USER || process.env.USERNAME || process.env.LOGNAME || ""
  } catch {
    return process.env.USER || process.env.USERNAME || process.env.LOGNAME || ""
  }
}

/**
 * @param {string} [root]
 * @returns {boolean}
 */
/**
 * Bề mặt init. `undefined` = mặc định trong rules (`docs`). Mảng rỗng hoặc id lạ → null.
 * @param {unknown} value
 * @returns {string[] | null}
 */
export function resolveSurfaces(value) {
  const catalog = RULES.project_surfaces || []
  if (value === undefined) return catalog.filter((s) => s.default).map((s) => s.id)
  if (!Array.isArray(value) || value.length === 0) return null
  const known = new Set(catalog.map((s) => s.id))
  for (const id of value) {
    if (typeof id !== "string" || !known.has(id)) return null
  }
  const picked = new Set(value)
  const out = catalog.map((s) => s.id).filter((id) => picked.has(id))
  return out.length ? out : null
}

export function isMinipowerProject(root) {
  if (!existsSync(join(root, "memory", "memory.md"))) return false
  if (existsSync(join(root, "docs"))) return true
  const pf = join(root, "memory", "profile.json")
  if (!existsSync(pf)) return false
  try {
    const p = JSON.parse(readFileSync(pf, "utf8"))
    const surfaces = resolveSurfaces(p.surfaces)
    return Array.isArray(surfaces) && !surfaces.includes("docs")
  } catch {
    return false
  }
}

/**
 * @param {unknown} obj
 * @returns {{valid:boolean, errors:string[]}}
 */
export function validateProfile(obj) {
  const errors = []
  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: ["profile không phải object"] }
  }
  const p = /** @type {Record<string, unknown>} */ (obj)

  if (!SUPPORTED_VERSIONS.has(p.version)) errors.push("version phải là 1, 2 hoặc 3")

  if (p.version === 3) {
    validateProjectV3(p, errors)
    return { valid: errors.length === 0, errors }
  }

  for (const key of ["user_name", "project_name", "project_summary"]) {
    if (typeof p[key] !== "string" || !String(p[key]).trim()) errors.push(`thiếu ${key}`)
  }

  const honorific = stripDiacritics(String(p.honorific || "")).toLowerCase()
  if (!VALID_HONORIFIC.has(honorific)) errors.push("honorific phải là anh hoặc chị")

  if (!Array.isArray(p.roles) || p.roles.length === 0) {
    errors.push("roles phải là mảng không rỗng")
  } else {
    for (const r of p.roles) {
      if (!VALID_ROLES.has(String(r))) errors.push(`role không hợp lệ: ${r}`)
    }
  }

  if (!VALID_PHASES.has(String(p.current_phase || ""))) {
    errors.push("current_phase không hợp lệ")
  }

  const exp = String(p.minipower_experience || "")
  if (!VALID_EXPERIENCE.has(exp)) errors.push("minipower_experience phải là new hoặc returning")

  if (p.version === 2) {
    const src = p.approval_source
    if (!src || typeof src !== "object" || Array.isArray(src)) {
      errors.push("approval_source phải là object { docs, tasks, code }")
    } else {
      for (const kind of RULES.approval_source_kinds) {
        const v = /** @type {Record<string, unknown>} */ (src)[kind]
        if (typeof v !== "string" || !v.trim()) errors.push(`approval_source.${kind} thiếu`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * @param {Record<string, unknown>} p
 * @param {string[]} errors
 */
function validateProjectV3(p, errors) {
  for (const key of ["project_name", "project_summary"]) {
    if (typeof p[key] !== "string" || !String(p[key]).trim()) errors.push(`thiếu ${key}`)
  }
  if (!VALID_PHASES.has(String(p.current_phase || ""))) {
    errors.push("current_phase không hợp lệ")
  }
  const store = p.trace_store == null || p.trace_store === "" ? "sqlite" : String(p.trace_store)
  if (store !== "sqlite") errors.push("trace_store phải là sqlite")

  for (const face of FACES) {
    const field = `${face}_provider`
    const v = String(p[field] || "")
    const allowed = PROVIDERS[face] || []
    if (!allowed.includes(v)) {
      errors.push(`${field} phải là một trong: ${allowed.join(", ")}`)
    }
  }

  if (p.surfaces !== undefined && resolveSurfaces(p.surfaces) == null) {
    const ids = (RULES.project_surfaces || []).map((s) => s.id).join(", ")
    errors.push(`surfaces phải là mảng không rỗng gồm: ${ids}`)
  }

  const mcp = p.mcp
  if (mcp != null) {
    if (typeof mcp !== "object" || Array.isArray(mcp)) {
      errors.push("mcp phải là object { docs, tasks, chat, code }")
    } else {
      const m = /** @type {Record<string, unknown>} */ (mcp)
      for (const face of FACES) {
        const provider = String(p[`${face}_provider`] || "")
        const server = m[face]
        const hasServer = typeof server === "string" && server.trim() !== ""
        if (NO_MCP.has(provider) && hasServer) {
          errors.push(`mcp.${face} lệch mặt: provider=${provider} không được gắn MCP`)
        }
        if (!NO_MCP.has(provider) && !hasServer) {
          errors.push(`mcp.${face} thiếu (provider=${provider})`)
        }
      }
    }
  } else {
    for (const face of FACES) {
      const provider = String(p[`${face}_provider`] || "")
      if (!NO_MCP.has(provider)) {
        errors.push(`mcp.${face} thiếu (provider=${provider})`)
      }
    }
  }
}

/**
 * @param {unknown} obj
 * @returns {{valid:boolean, errors:string[]}}
 */
export function validateUserProfile(obj) {
  const errors = []
  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: ["profile.user không phải object"] }
  }
  const p = /** @type {Record<string, unknown>} */ (obj)
  if (typeof p.user_name !== "string" || !p.user_name.trim()) errors.push("thiếu user_name")
  const honorific = stripDiacritics(String(p.honorific || "")).toLowerCase()
  if (!VALID_HONORIFIC.has(honorific)) errors.push("honorific phải là anh hoặc chị")
  if (!Array.isArray(p.roles) || p.roles.length === 0) {
    errors.push("roles phải là mảng không rỗng")
  } else {
    for (const r of p.roles) {
      if (!VALID_ROLES.has(String(r))) errors.push(`role không hợp lệ: ${r}`)
    }
  }
  const exp = String(p.minipower_experience || "")
  if (!VALID_EXPERIENCE.has(exp)) errors.push("minipower_experience phải là new hoặc returning")
  if (typeof p.os_username !== "string" || !p.os_username.trim()) {
    errors.push("thiếu os_username")
  }
  return { valid: errors.length === 0, errors }
}

/**
 * v2 `tasks=local` → v3 `none`. Dùng khi nâng schema / init.
 * @param {Record<string, unknown>} data
 * @returns {Record<string, string>}
 */
export function providersFromProfile(data) {
  if (data?.version === 3) {
    return {
      docs: String(data.docs_provider || "local"),
      tasks: String(data.tasks_provider || "none"),
      chat: String(data.chat_provider || "none"),
      code: String(data.code_provider || "local"),
    }
  }
  const src = data?.approval_source
  const pick = (k, d) => {
    if (src && typeof src === "object" && !Array.isArray(src)) {
      const v = /** @type {Record<string, unknown>} */ (src)[k]
      if (typeof v === "string" && v.trim()) return v.trim()
    }
    return d
  }
  const tasksV2 = pick("tasks", "local")
  return {
    docs: pick("docs", "local"),
    tasks: tasksV2 === "local" ? "none" : tasksV2,
    chat: "none",
    code: pick("code", "local"),
  }
}

/**
 * @param {string} root
 * @returns {Record<string, unknown>|null}
 */
export function loadProfile(root) {
  return readJson(join(root, "memory", "profile.json"))
}

/**
 * Project file thắng home. Không đọc user_name từ profile.json git.
 * @param {string} root
 * @param {{homeDir?:string}} [opts]
 * @returns {Record<string, unknown>|null}
 */
export function loadUserProfile(root, opts) {
  const project = readJson(join(root, "memory", "profile.user.json"))
  if (project) return project
  const home = opts?.homeDir ?? homedir()
  return readJson(join(home, ".minipower", "user.json"))
}

/**
 * @param {string} path
 * @returns {Record<string, unknown>|null}
 */
function readJson(path) {
  if (!existsSync(path)) return null
  try {
    const data = JSON.parse(readFileSync(path, "utf8"))
    return data && typeof data === "object" ? data : null
  } catch {
    return null
  }
}

/**
 * @param {string} root
 * @returns {boolean}
 */
export function isProfileComplete(root) {
  const data = loadProfile(root)
  if (!data) return false
  return validateProfile(data).valid
}

/**
 * @param {string} root
 * @param {{osUsername?:string, homeDir?:string}} [opts]
 * @returns {{ok:boolean, reason?:"missing"|"invalid"|"os_mismatch"}}
 */
export function checkUserIdentity(root, opts) {
  const data = loadUserProfile(root, opts)
  if (!data) return { ok: false, reason: "missing" }
  const v = validateUserProfile(data)
  if (!v.valid) return { ok: false, reason: "invalid" }
  const current = opts?.osUsername ?? osUsername()
  if (current && String(data.os_username) !== current) {
    return { ok: false, reason: "os_mismatch" }
  }
  return { ok: true }
}

/**
 * @param {string|null|undefined} prompt
 * @returns {boolean}
 */
export function isExemptPrompt(prompt) {
  const p = prompt || ""
  if (shouldBypass(p)) return true
  const norm = stripDiacritics(p).toLowerCase()
  return EXEMPT_RE.test(norm)
}

/**
 * @param {string|null|undefined} prompt
 * @param {string[]|null|undefined} [filePaths]
 * @returns {boolean}
 */
export function isMinipowerWorkPrompt(prompt, filePaths) {
  const p = prompt || ""
  const norm = stripDiacritics(p).toLowerCase()
  if (MINIPOWER_WORK_RE.test(norm)) return true

  const files = (filePaths || []).filter(Boolean)
  for (const f of files) {
    const n = String(f).replace(/\\/g, "/").toLowerCase()
    if (/(?:^|\/)docs(?:\/|$)/.test(n) || /(?:^|\/)memory(?:\/|$)/.test(n)) return true
  }
  return false
}

const BLOCK_PROJECT = `Chưa có memory/profile.json hợp lệ (cấu hình **dự án**).

Chạy: **Init project {tên}** hoặc **Hoàn tất profile** — hỏi trọn gói: 4 provider (docs/tasks/chat/code). Schema v3 — [TPL-agent-profile](templates/TPL-agent-profile.md).
Không ghi user_name vào file git.
Gỡ tạm: BYPASS ở đầu dòng.`

const BLOCK_IDENTITY = `Chưa khai báo người dùng trên máy này (thiếu hoặc lệch memory/profile.user.json).

Chạy: **Khai báo tôi là ai** / **Hoàn tất profile** — tên, xưng hô, vai trò. Ghi **local** (gitignore), kèm os_username.
**Cấm** lấy tên từ memory/profile.json trên git.
Gỡ tạm: BYPASS ở đầu dòng.`

/**
 * @param {string|null|undefined} prompt
 * @param {string[]|null|undefined} [filePaths]
 * @param {{root?:string, osUsername?:string, homeDir?:string}|null|undefined} [opts]
 * @returns {ProfileGuardResult}
 */
export function checkProfileGuard(prompt, filePaths, opts) {
  const root = projectRoot(opts?.root)
  if (!isMinipowerProject(root)) return { action: "allow" }
  if (isExemptPrompt(prompt)) return { action: "allow" }
  if (!isMinipowerWorkPrompt(prompt, filePaths)) return { action: "allow" }
  if (!isProfileComplete(root)) return { action: "block", message: BLOCK_PROJECT }
  const id = checkUserIdentity(root, opts || {})
  if (!id.ok) return { action: "block", message: BLOCK_IDENTITY }
  return { action: "allow" }
}
