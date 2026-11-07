/**
 * Minipower — rules-as-data loader (R3 / ADR §5.2).
 *
 * SSOT duy nhất cho map DOC→phase và các danh sách từ khoá heuristic là
 * [rules.json](./rules.json). File này CHỈ đọc + suy ra cấu trúc dùng chung;
 * không hardcode luật. Thêm DOC-19 = **một dòng** trong rules.json (auto-routing,
 * token-guard và auto-routing đều đọc từ đây — chạy `npm run gen`).
 *
 * Vì sao keyword lưu dạng tiếng Việt CÓ DẤU nhưng match được prompt không dấu:
 * cả prompt lẫn keyword đều được `stripDiacritics` + lowercase trước khi so
 * (xem token-guard.js). Nhờ đó rules.json đọc được cho người, mà vẫn diệt sạch
 * class bug có-dấu/không-dấu từng khiến .ps1 và .sh/.ts lệch nhau (ADR §1.1).
 */

import { readFileSync } from "node:fs"

/** @typedef {{
 *   phase_by_doc: Record<string,string>,
 *   phase_order: string[],
 *   edit_verbs: string[],
 *   breadth_words: string[],
 *   doc_short: Record<string,string>,
 *   doc_scope: Record<string,"project"|"module">,
 *   phase_meta: Record<string,{state:string,role:string}>,
 *   roles: {id:string,title:string,phase:string,file:string}[],
 *   project_modes: Record<string,{label:string,docs_focus:"all"|string[],prereq_overrides?:Record<string,string[]>,gates:Record<string,string>}>,
 *   default_project_mode: string,
 *   approval_source_kinds: string[],
 *   profile_providers: Record<string,string[]>,
 *   project_surfaces: {id:string,label:string,path:string,default:boolean,role:string}[],
 *   prereq_by_intent: {id:string,label:string,keywords:string[],requires:string[]}[],
 *   install_hooks: {shim:string,slot:"prompt"|"pre_tool",cursor_timeout?:number,matcher?:string}[],
 *   feedback: {repo:string,labels:{name:string,description:string}[]}
 * }} Rules */

/** @type {Rules} */
export const RULES = JSON.parse(readFileSync(new URL("./rules.json", import.meta.url), "utf8"))

/** Bỏ dấu tiếng Việt (gồm đ/Đ mà NFD không tách). Dùng chung cho match keyword. */
export function stripDiacritics(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
}

/** @type {Record<string,string>} DOC "01".."18" → phase. */
export const PHASE_BY_DOC = RULES.phase_by_doc

/** @type {string[]} Thứ tự phase để hiển thị/nhóm (deterministic). */
export const PHASE_ORDER = RULES.phase_order

const pad = (n) => String(n).padStart(2, "0")

/** [1,2,3] → "01–03"; [4,5,6,7,13] → "04–07, 13"; [18] → "18". */
export function formatDocRanges(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const groups = []
  let start = sorted[0]
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i]
      continue
    }
    groups.push([start, prev])
    start = sorted[i]
    prev = sorted[i]
  }
  groups.push([start, prev])
  return groups.map(([s, e]) => (s === e ? pad(s) : `${pad(s)}–${pad(e)}`)).join(", ")
}

/** DOC numbers thuộc một phase, đã sort. */
export function docsForPhase(phase) {
  return Object.entries(PHASE_BY_DOC)
    .filter(([, p]) => p === phase)
    .map(([d]) => Number(d))
    .sort((a, b) => a - b)
}

/** @type {Record<string,string>} phase → nhãn hiển thị, vd "discovery (DOC-01–03)". */
export const PHASE_LABEL = (() => {
  const label = {}
  for (const phase of PHASE_ORDER) {
    const nums = docsForPhase(phase)
    if (nums.length) label[phase] = `${phase} (DOC-${formatDocRanges(nums)})`
  }
  return label
})()

/** Danh sách từ (tiếng Việt có dấu) → regex substring, match trên text đã strip+lower. */
function wordListRegex(words) {
  const alts = words.map((w) =>
    stripDiacritics(w.toLowerCase()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  )
  return new RegExp(alts.join("|"))
}

/** [FIX-1] Động từ sửa — Việt (đã strip) + Anh. Match trên `norm` trong token-guard. */
export const EDIT_VERBS = wordListRegex(RULES.edit_verbs)

/** Từ khoá độ rộng — prompt quá rộng. Match trên `norm`. */
export const BREADTH = wordListRegex(RULES.breadth_words)

// ─── N1/N2/N4 — dữ liệu bổ sung, cùng SSOT rules.json ───────────────────────

/** @type {Record<string,string>} DOC "01".."18" → tên ngắn (SSOT nhãn DOC). */
export const DOC_SHORT = RULES.doc_short

/** "06" → "DOC-06 (SRS)"; số không rõ → "DOC-06". */
export function docLabel(num) {
  const key = pad(Number(num))
  const short = DOC_SHORT[key]
  return short ? `DOC-${key} (${short})` : `DOC-${key}`
}

/**
 * @type {Record<string,"project"|"module">}
 * DOC sống ở đâu trong cây `docs/` (ADR-020 §2b): DOC-04·05·06·07·16·19 nằm trong
 * `03-modules/{mod}/` → **module**; còn lại ở `01-project/` · `04-platform/` … → **project**.
 * Đây là chiều `prereq-gate` cần để kiểm tiền đề **theo module** (QĐ-13): các module
 * chạy lệch nhịp là bình thường, nên "có ≥1 file DOC-06 đâu đó" KHÔNG đủ kết luận.
 */
export const DOC_SCOPE = RULES.doc_scope

/** "06" → "module"; DOC lạ → "project" (mặc định an toàn: kiểm ở cấp dự án). */
export function docScope(num) {
  return DOC_SCOPE[pad(Number(num))] || "project"
}

/** @type {Record<string,{state:string,role:string}>} phase → giai đoạn vòng đời + vai trò chính (N2). */
export const PHASE_META = RULES.phase_meta

/** phase → giai đoạn dự án ("Design"…) hoặc phase gốc nếu thiếu. */
export function stateForPhase(phase) {
  return (PHASE_META[phase] && PHASE_META[phase].state) || phase
}

/** phase → vai trò chính ("SA"…) hoặc "" nếu thiếu. */
export function roleForPhase(phase) {
  return (PHASE_META[phase] && PHASE_META[phase].role) || ""
}

/** @type {{id:string,title:string,phase:string,file:string}[]} Danh mục vai trò (N3). */
export const ROLES = RULES.roles

// ─── ADR-020 — chiều thứ hai: project_mode ──────────────────────────────────

/**
 * @type {Record<string,{label:string,docs_focus:"all"|string[],prereq_overrides?:Record<string,string[]>,gates:Record<string,string>}>}
 * Ba chế độ dự án (QĐ-1). Mode **không** đổi cấu trúc folder (QĐ-2) — chỉ đổi
 * *DOC nào cần điền* (`docs_focus`), *tiền đề nào áp cho intent nào*
 * (`prereq_overrides`) và *gate nào bật ở mức nào* (`gates`).
 */
export const PROJECT_MODES = RULES.project_modes

/** @type {string} Mode dùng khi profile chưa khai / không đọc được (fail-open — R2). */
export const DEFAULT_PROJECT_MODE = RULES.default_project_mode

/** @type {string[]} Ba loại nguồn phê duyệt tách rời (QĐ-12, schema v2). */
export const APPROVAL_SOURCE_KINDS = RULES.approval_source_kinds

/** @type {Record<string,string[]>} Enum provider từng mặt (ADR-033 profile v3). */
export const PROFILE_PROVIDERS = RULES.profile_providers

/** @type {{id:string,label:string,path:string,default:boolean,role:string}[]} Bề mặt init (ADR-038). */
export const PROJECT_SURFACES = RULES.project_surfaces

/** Mode name → config; mode lạ/thiếu → config của DEFAULT_PROJECT_MODE. */
export function modeConfig(mode) {
  return PROJECT_MODES[String(mode)] || PROJECT_MODES[DEFAULT_PROJECT_MODE]
}

/** Mức của một gate ở mode đã cho, vd gateLevel("mvp","prereq") → "warn". */
export function gateLevel(mode, gate) {
  return modeConfig(mode).gates[String(gate)] || "off"
}

/** @type {{id:string,label:string,keywords:string[],requires:string[]}[]} Bộ tiền đề theo intent (N1). */
export const PREREQ_BY_INTENT = RULES.prereq_by_intent

/**
 * Tiền đề thực tế của một intent **sau khi áp `prereq_overrides` của mode**.
 * `mvp`/`maintain` nhẹ tay hơn `standard` (mảng rỗng = intent đó không đòi gì).
 * @returns {string[]} danh sách DOC number ("06"…); intent lạ → []
 */
export function requiresForIntent(intentId, mode) {
  const cfg = modeConfig(mode)
  const ov = cfg.prereq_overrides
  if (ov && Object.prototype.hasOwnProperty.call(ov, String(intentId))) return ov[String(intentId)]
  const it = PREREQ_BY_INTENT.find((x) => x.id === String(intentId))
  return it ? it.requires : []
}

/**
 * Nhận diện intent từ prompt đã chuẩn hoá (strip+lower). Keyword lưu KHÔNG dấu
 * trong rules.json → so trực tiếp trên `norm`. Trả mọi intent khớp (có thể nhiều).
 * @param {string} norm text đã stripDiacritics + toLowerCase
 * @returns {{id:string,label:string,requires:string[]}[]}
 */
export function matchIntents(norm) {
  const s = String(norm)
  return PREREQ_BY_INTENT.filter((it) => it.keywords.some((k) => s.includes(k))).map(
    ({ id, label, requires }) => ({ id, label, requires }),
  )
}

/** Thứ tự + slot 6 hook IDE — SSOT sinh fragment Claude/Cursor (ADR-031 Q5 cách B). */
export const INSTALL_HOOKS = RULES.install_hooks

/**
 * @type {{repo:string,labels:{name:string,description:string}[]}}
 * Repo GitHub của minipower + nhãn issue "bài học" (ADR-044 §7). Nhãn `skill:<tên-lá>`
 * KHÔNG nằm trong danh sách này — nó động theo catalog skill, gắn lúc tạo issue.
 */
export const FEEDBACK = RULES.feedback
