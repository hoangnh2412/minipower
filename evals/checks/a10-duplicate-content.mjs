/**
 * A10 — không hai file nào giống hệt nhau mà không khai là bản sao có chủ đích.
 *
 * Luật: hai file cùng nội dung là hai nguồn chân lý cho một sự thật. Sửa một
 * bản quên bản kia là drift im lặng — không test nào đỏ, không link nào gãy,
 * và bản nào thắng thì tuỳ chỗ nào đọc trước.
 *
 * Vì sao là luật chung: repo này cố ý có cơ chế "file sinh" (`npm run gen`)
 * cho những chỗ cần nhân bản. File giống hệt mà KHÔNG qua bộ sinh là chép tay,
 * tức nằm ngoài mọi cổng máy đang có.
 *
 * Lối thoát: một trong các bản ghi `bản sao có chủ đích: <lý do>` (comment
 * theo cú pháp của chính định dạng đó), hoặc để bộ sinh tạo ra nó.
 *
 * shortcut: chỉ so file ≥ MIN_BYTES để khỏi báo hàng loạt file rỗng/stub;
 * hạ ngưỡng khi có nhu cầu thật.
 */

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { walk, sizeOf, relTo, result, REPO_ROOT } from "./lib.mjs"

const MARKER = /bản sao có chủ đích\s*:/i
const MIN_BYTES = 64

export function run(root = REPO_ROOT, minBytes = MIN_BYTES) {
  const files = walk(root).filter((f) => sizeOf(f) >= minBytes)
  const byHash = new Map()
  for (const f of files) {
    let buf
    try {
      buf = readFileSync(f)
    } catch (e) {
      process.stderr.write(`[evals] A10 bỏ qua ${f}: ${e.message}\n`)
      continue
    }
    const h = createHash("sha256").update(buf).digest("hex")
    if (!byHash.has(h)) byHash.set(h, [])
    byHash.get(h).push({ path: f, text: buf.toString("utf8") })
  }

  const findings = []
  for (const group of byHash.values()) {
    if (group.length < 2) continue
    if (group.some((g) => MARKER.test(g.text))) continue
    const paths = group.map((g) => relTo(root, g.path))
    findings.push({
      file: paths[0],
      message: `nội dung giống hệt ${group.length} chỗ: ${paths.join(" · ")} — gộp lại, cho qua bộ sinh, hoặc ghi \`bản sao có chủ đích: <lý do>\``,
    })
  }
  return result("A10", "không có hai nguồn chân lý giống hệt", findings, files.length)
}
