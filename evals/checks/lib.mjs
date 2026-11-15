/**
 * Minipower evals — tiện ích chung cho nhóm A (0 LLM call).
 *
 * Luật của mọi check trong thư mục này:
 *   1. Đọc từ DỮ LIỆU (rules.json, cây file), không từ danh sách chép tay.
 *   2. Phát biểu luật tổng quát, không nhắm vào một lỗi cụ thể đang tồn tại.
 *   3. Lối thoát là MARKER trong chính file bị bắt, không phải file baseline.
 *   4. Có fixture dương (phải bắt) và fixture âm (phải im) trong *.test.mjs cạnh nó.
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

/** checks/ → evals/ → gốc repo */
export const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

export const SKIP_DIRS = new Set(["node_modules", ".git", ".codegraph", "dist", "coverage"])

/**
 * Liệt kê đường dẫn tuyệt đối mọi file dưới `root`, trừ SKIP_DIRS.
 * @param {string} root
 * @param {{ exts?: string[], skip?: Set<string> }} [opts] exts ví dụ [".js", ".mjs"]
 * @returns {string[]}
 */
export function walk(root, opts = {}) {
  const { exts = null, skip = SKIP_DIRS } = opts
  const out = []
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch (e) {
      process.stderr.write(`[evals] không đọc được thư mục ${dir}: ${e.message}\n`)
      continue
    }
    for (const e of entries) {
      if (skip.has(e.name)) continue
      const p = join(dir, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.isFile() && (!exts || exts.some((x) => e.name.endsWith(x)))) out.push(p)
    }
  }
  return out.sort()
}

/**
 * File tự khai miễn soát ở header — dành cho file CHỨA mã mẫu làm fixture, nơi
 * lỗi là cố ý. Marker: `evals: không soát — <lý do>`.
 */
const FILE_EXEMPT = /evals:\s*không soát/i

export function isExempt(src) {
  return FILE_EXEMPT.test(src.slice(0, 800))
}

/** Đọc text; trả null nếu không đọc được (nhị phân / quyền). */
export function readText(p) {
  try {
    return readFileSync(p, "utf8")
  } catch (e) {
    process.stderr.write(`[evals] không đọc được ${p}: ${e.message}\n`)
    return null
  }
}

export function sizeOf(p) {
  try {
    return statSync(p).size
  } catch (e) {
    process.stderr.write(`[evals] không stat được ${p}: ${e.message}\n`)
    return 0
  }
}

/**
 * Đường dẫn tương đối theo `root` ĐANG SOÁT — không theo repo thật. Mọi check
 * nhận `root` làm tham số (test truyền thư mục tạm), nên dùng `rel()` cố định
 * theo REPO_ROOT sẽ cho `../../..` và làm mọi bộ lọc theo thư mục gãy câm.
 */
export function relTo(root, p) {
  return relative(root, p).split("\\").join("/")
}

export function rel(p) {
  return relTo(REPO_ROOT, p)
}

/** Số dòng (1-based) của vị trí `idx` trong `src`. */
export function lineAt(src, idx) {
  let n = 1
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === "\n") n++
  return n
}

/** Dòng thứ `n` (1-based) và dòng ngay trước nó, ghép lại — dùng để tìm marker. */
export function lineAndPrev(src, n) {
  const lines = src.split("\n")
  return `${lines[n - 2] || ""}\n${lines[n - 1] || ""}`
}

/**
 * Kết quả một check.
 * @param {string} id
 * @param {string} title
 * @param {{file:string,line?:number,message:string}[]} findings
 * @param {number} checked số đơn vị đã soát — để phân biệt "không có lỗi" với "không soát gì"
 * @param {"warn"|"block"} [level] mức ra mắt là "warn" (ADR-044 §8.1: nâng FAIL sau khi kiểm chứng)
 */
export function result(id, title, findings, checked, level = "warn") {
  return { id, title, findings, checked, level }
}
