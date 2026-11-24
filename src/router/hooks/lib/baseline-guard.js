/**
 * Minipower — baseline guard @ PreToolUse Read|Write|Edit (ADR-020 C4 · C5 · QĐ-4).
 *
 * Thay `token-guard-read` ở tầng wiring VÀ thay `permissions.deny` tĩnh trong
 * `install/*` — dồn cưỡng chế về **một** SSOT, hết cảnh kênh plugin và kênh
 * settings nói hai điều khác nhau.
 *
 * Khác `token-guard-read` đúng **một** điểm: `_legacy` mở theo số khai
 * `rules.json → gate_levels.legacy_read` (C5) — ở dự án tiếp quản hệ cũ thì đọc
 * tài liệu/code cũ CHÍNH LÀ công việc, bắt gõ "migrate" mỗi lần là ma sát vô
 * nghĩa. Phần còn lại uỷ quyền nguyên vẹn cho `checkReadGuard` để không nhân
 * đôi luật (wrap-not-build, ADR-014).
 *
 * C4 — `docs/02-baseline`: deny luôn, **không BYPASS**, kể cả prompt nói
 * migrate. Đây là hook duy nhất không có lối thoát (§5): snapshot đã ký.
 *
 * @typedef {{action:"allow"}|{action:"deny", message:string}} BaselineGuardResult
 */

import { gateLevel } from "./rules.js"
import { checkReadGuard } from "./token-guard-read.js"

const BASELINE = "docs/02-baseline"
const LEGACY = "docs/03-modules/_legacy"

/**
 * @param {string|null|undefined} filePath
 * @param {string|null|undefined} [prompt]
 * @param {{root?:string}|null|undefined} [_opts] giữ chữ ký cho shim; không còn đọc profile
 * @returns {BaselineGuardResult}
 */
export function checkBaselineGuard(filePath, prompt, _opts) {
  const path = String(filePath || "").replace(/\\/g, "/")
  if (!path.trim()) return { action: "allow" }

  // C4 — baseline: không đọc prompt. Deny là deny.
  if (path.includes(BASELINE)) return checkReadGuard(filePath, prompt)

  // C5 — _legacy: mở theo số khai.
  if (path.includes(LEGACY) && gateLevel("legacy_read") === "allow") return { action: "allow" }

  return checkReadGuard(filePath, prompt)
}
