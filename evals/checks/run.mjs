#!/usr/bin/env node
/**
 * Minipower evals — chạy toàn bộ check nhóm A (0 LLM call) và in báo cáo.
 *
 * Dùng: `npm run check` ở gốc repo, hoặc `node evals/checks/run.mjs [--json] [<root>]`
 *
 * Mức ra mắt của mọi check là WARN: exit 0 dù có finding. Nâng lên chặn bằng
 * cách đổi `level` của check đó sang "block" — làm sau khi nó đã bắt đúng ít
 * nhất hai lần trên thay đổi thật (cùng luật với `version:check`, ADR-044 §8.1).
 */

import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { REPO_ROOT } from "./lib.mjs"
import { run as a09 } from "./a09-hook-registry.mjs"
import { run as a10 } from "./a10-duplicate-content.mjs"
import { run as a11 } from "./a11-hardcoded-counts.mjs"
import { run as a12 } from "./a12-decided-removed.mjs"
import { run as a13 } from "./a13-silent-catch.mjs"
import { run as a16 } from "./a16-hook-runnable.mjs"

export const CHECKS = [a13, a11, a10, a09, a12, a16]

export function runAll(root = REPO_ROOT) {
  return CHECKS.map((fn) => fn(root))
}

function format(results) {
  const lines = []
  let warn = 0
  let block = 0
  for (const r of results) {
    const n = r.findings.length
    const tag = n === 0 ? "OK  " : r.level === "block" ? "FAIL" : "WARN"
    lines.push(`${tag} ${r.id} — ${r.title} (${n} phát hiện / ${r.checked} đã soát)`)
    for (const f of r.findings) {
      const where = f.line ? `${f.file}:${f.line}` : f.file
      lines.push(`       ${where} — ${f.message}`)
    }
    if (n) {
      if (r.level === "block") block += n
      else warn += n
    }
  }
  lines.push("")
  lines.push(`Tổng: ${block} chặn · ${warn} cảnh báo`)
  if (results.some((r) => r.checked === 0)) {
    lines.push("Lưu ý: có check soát 0 đơn vị — nó đang không kiểm được gì, đừng đọc là 'sạch'.")
  }
  return { text: lines.join("\n"), block }
}

const args = process.argv.slice(2)
const isMain = Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isMain) {
  const root = args.find((a) => !a.startsWith("--")) || REPO_ROOT
  const results = runAll(root)
  if (args.includes("--json")) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`)
  } else {
    const { text } = format(results)
    process.stdout.write(`${text}\n`)
  }
  const anyBlock = results.some((r) => r.level === "block" && r.findings.length)
  process.exit(anyBlock ? 1 : 0)
}

export { format }
