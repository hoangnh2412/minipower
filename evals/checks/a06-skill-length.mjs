/**
 * A06 — `SKILL.md` không nên dài quá ngưỡng.
 *
 * Luật (ADR-026 §7.1): `W_len = |SKILL.md có > 150 dòng|`, "báo số", WARN. Đây
 * là số đo để **so giữa version**, không phải lỗi phải sửa ngay — một lá dày
 * lên dần là dấu hiệu nó đang gánh nhiều việc, trái luật single-purpose của
 * AGENTS.md; nhưng ngưỡng nào là "quá" thì người quyết, không phải máy.
 *
 * Chỉ soát `SKILL.md` vì AGENTS.md chốt *"SKILL.md cho agent, README.md cho
 * người"* — lá là thứ agent nạp vào ngữ cảnh mỗi lượt, nên độ dài của nó là
 * chi phí thật; README dài không tốn gì.
 *
 * Vì sao là luật chung: nó duyệt mọi `SKILL.md` trong cây, nên lá mới cũng
 * được canh mà không phải sửa check.
 *
 * Lối thoát: `dài có chủ đích: <lý do>` trong 800 ký tự đầu của chính lá đó —
 * hợp lệ khi nội dung thật sự không chẻ được (bảng tra dài, danh sách điều
 * khoản). Ghi lý do, đừng ghi suông.
 */

import { basename } from "node:path"
import { walk, readText, relTo, result, REPO_ROOT, isExempt } from "./lib.mjs"

/** Ngưỡng của ADR-026 §7.1. Đổi ở đây thì đổi cả ADR. */
const MAX_LINES = 150

const MARKER = /dài có chủ đích\s*:/i

/** Đếm như `wc -l`: số dòng kết thúc bằng newline. */
export function countLines(src) {
  const parts = src.split("\n")
  return src.endsWith("\n") ? parts.length - 1 : parts.length
}

export function run(root = REPO_ROOT) {
  const files = walk(root, { exts: ["SKILL.md"] }).filter((p) => basename(p) === "SKILL.md")
  const findings = []
  let checked = 0

  for (const f of files) {
    const src = readText(f)
    if (src === null || isExempt(src)) continue
    checked++
    const n = countLines(src)
    if (n <= MAX_LINES) continue
    if (MARKER.test(src.slice(0, 800))) continue
    findings.push({
      file: relTo(root, f),
      line: MAX_LINES + 1,
      message: `${n} dòng, quá ngưỡng ${MAX_LINES} — chẻ bớt sang \`reference/\` hoặc \`workflows/\`, hoặc ghi \`dài có chủ đích: <lý do>\``,
    })
  }

  return result("A06", `SKILL.md không dài quá ${MAX_LINES} dòng`, findings, checked)
}
