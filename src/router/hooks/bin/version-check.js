#!/usr/bin/env node
/**
 * Minipower version:check — CLI cho CI (ADR-044 §8.1 Q2).
 *   node bin/version-check.js [--base <ref>]
 * WARN khi lá đổi mà metadata.version không tăng — luôn exit 0 (chưa chặn).
 */
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import { listLeafSkills } from "../lib/skill-catalog.js"
import { checkVersionBumps } from "../lib/version-check.js"

// bin/ → hooks/ → router → src → repo root
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(dirname(dirname(dirname(HERE))))

const args = process.argv.slice(2)
const bIdx = args.indexOf("--base")
const base = bIdx >= 0 && args[bIdx + 1] ? args[bIdx + 1] : "HEAD~1"

const warnings = checkVersionBumps(listLeafSkills(), ROOT, base)
for (const w of warnings) {
  process.stdout.write(`${w.path}  ⚠ đổi nhưng metadata.version không tăng (so với ${base})\n`)
}
process.stdout.write(
  warnings.length
    ? `${warnings.length} lá đổi mà chưa bump version — WARN, chưa chặn (ADR-044 Q2).\n`
    : `0 lá đổi mà quên bump version (so với ${base}).\n`,
)
process.exit(0)
