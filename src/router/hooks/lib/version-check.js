/**
 * Minipower — version:check (ADR-044 §8.1 Q2).
 * So mỗi lá `minipower-*` giữa `--base` (nhánh gốc / commit trước) và hiện tại:
 * thư mục đổi mà `metadata.version` trong SKILL.md không đổi → WARN. Không FAIL —
 * script chưa kiểm chứng qua bump thật (ADR-044 Q2: nâng FAIL sau 2 lần).
 */

import { execFileSync } from "node:child_process"
import { relative, dirname } from "node:path"
import { frontmatter, fmVersion } from "./skill-catalog.js"

function git(root, args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  } catch {
    return null
  }
}

function versionAt(root, base, relSkillMd) {
  const text = git(root, ["show", `${base}:${relSkillMd}`])
  if (text === null) return null
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return m ? fmVersion(m[1]) : null
}

/**
 * @param {{name:string, skillMd:string}[]} leaves từ listLeafSkills()
 * @param {string} root — repo root (để chạy git đúng cwd + relative path)
 * @param {string} base — ref để so (nhánh gốc / commit trước)
 * @returns {{name:string, path:string}[]} lá có thư mục đổi mà version không đổi
 */
export function checkVersionBumps(leaves, root, base) {
  if (git(root, ["rev-parse", "--verify", base]) === null) return []
  const warnings = []
  for (const leaf of leaves) {
    const relDir = relative(root, dirname(leaf.skillMd))
    const relSkillMd = relative(root, leaf.skillMd)
    const changed = git(root, ["diff", "--name-only", base, "--", relDir])
    if (!changed || !changed.trim()) continue
    const baseVersion = versionAt(root, base, relSkillMd)
    const currentVersion = fmVersion(frontmatter(leaf.skillMd))
    if (currentVersion === baseVersion) warnings.push({ name: leaf.name, path: relDir })
  }
  return warnings
}
