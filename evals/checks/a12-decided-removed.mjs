/**
 * A12 — cơ chế đã quyết gỡ không được còn dấu vết trong repo.
 *
 * Luật: đọc sổ `evals/decided-removed.md`; với mỗi từ khoá mang trạng thái
 * `đã gỡ`, soát toàn repo xem còn chỗ nào nhắc tới. Bỏ qua `ADRs/` và chính
 * sổ đó — ADR là bản ghi lịch sử, nhắc tên cơ chế đã chết ở đó là đúng.
 *
 * Vì sao cần: khi gỡ một cơ chế, code đi trước chữ. Tài liệu, `description`
 * của lá, hợp đồng, README còn mô tả thứ không còn tồn tại — và không test nào
 * đỏ, không link nào gãy. Agent đọc những chỗ đó rồi hành xử theo hệ đã chết.
 *
 * Vì sao là luật chung, không phải vá một đợt: check này không biết tên cơ chế
 * nào. Sổ là DỮ LIỆU, do người ghi khi có quyết định gỡ; check chỉ thi hành.
 * Sổ trống thì A12 soát 0 từ khoá — đó là đúng, không phải hỏng.
 *
 * Trạng thái `đang gỡ` thì A12 im: việc chưa xong, còn sót là bình thường.
 */

import { join } from "node:path"
import { walk, readText, relTo, lineAt, result, REPO_ROOT } from "./lib.mjs"

const LEDGER_REL = ["evals", "decided-removed.md"]
/** `- \`project_mode\` — đã gỡ — ADR-0NN ngày …` */
const ENTRY = /^\s*-\s*`([^`]+)`\s*—\s*(đã gỡ|đang gỡ)\s*—\s*(.*)$/u
/** Thư mục không soát: bản ghi lịch sử, và chính sổ. */
const SKIP_TOP = new Set(["ADRs", "evals"])
const SCAN_EXTS = [".md", ".js", ".mjs", ".cjs", ".ts", ".json", ".yml", ".yaml", ".mdc"]

/** @returns {{token:string, status:string, note:string}[]} */
export function parseLedger(text) {
  const out = []
  for (const line of text.split("\n")) {
    const m = ENTRY.exec(line)
    if (m) out.push({ token: m[1], status: m[2], note: m[3].trim() })
  }
  return out
}

export function run(root = REPO_ROOT) {
  const ledgerPath = join(root, ...LEDGER_REL)
  const text = readText(ledgerPath)
  if (text === null) {
    return result(
      "A12",
      "cơ chế đã quyết gỡ không còn dấu vết",
      [{ file: relTo(root, ledgerPath), message: "không có sổ decided-removed.md — A12 không soát được gì" }],
      0,
    )
  }

  const retired = parseLedger(text).filter((e) => e.status === "đã gỡ")
  if (!retired.length) {
    return result("A12", "cơ chế đã quyết gỡ không còn dấu vết", [], 0)
  }

  const files = walk(root, { exts: SCAN_EXTS }).filter((f) => {
    const r = relTo(root, f)
    return !SKIP_TOP.has(r.split("/")[0])
  })

  const findings = []
  for (const f of files) {
    const src = readText(f)
    if (src === null) continue
    for (const e of retired) {
      let at = src.indexOf(e.token)
      if (at < 0) continue
      findings.push({
        file: relTo(root, f),
        line: lineAt(src, at),
        message: `còn nhắc \`${e.token}\` — đã quyết gỡ (${e.note}); sửa chỗ này, hoặc hạ trạng thái về \`đang gỡ\` nếu việc chưa xong`,
      })
    }
  }
  return result("A12", "cơ chế đã quyết gỡ không còn dấu vết", findings, retired.length * files.length)
}
