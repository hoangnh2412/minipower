/**
 * A13 — catch không được trả giá trị mặc định trong im lặng.
 *
 * Luật: một khối `catch` mà thân chỉ gồm `return <giá trị trung tính>` (`{}`,
 * `[]`, `null`, `false`, `0`, `""`) hoặc rỗng hẳn, và không nói gì ra, là
 * "fallback im lặng" — đúng thứ `CLAUDE.md` cấm: *"giá trị mặc định im lặng,
 * catch rồi đi tiếp"*. Lỗi thật biến thành đường đi bình thường, nên bộ test
 * vẫn xanh trong khi tính năng đã chết. Ở một hook, nó còn là fail-OPEN: cổng
 * tự mở vì không đọc được đầu vào.
 *
 * KHÔNG bắt những catch có xử lý thật (đặt giá trị theo ngữ cảnh, thử cách
 * khác đã khai, dựng thông điệp) — chúng là mã hợp lệ, bắt hết thì check
 * thành tiếng ồn và sẽ bị bỏ qua.
 *
 * Vì sao là luật chung: nó phát biểu một HÌNH DẠNG mã, nên áp cho mọi file
 * tương lai mà không phải sửa check.
 *
 * Lối thoát: viết `cố ý im lặng: <lý do>` trong thân catch.
 */

import { walk, readText, relTo, lineAt, result, REPO_ROOT, isExempt } from "./lib.mjs"

const MARKER = /cố ý im lặng\s*:/i
/** Dấu hiệu "đã nói ra hoặc đã ném lại". */
const SPEAKS = /\bthrow\b|process\.stderr|process\.stdout|console\s*\.|\b\w*(?:log|warn|report|notify)\s*\(/i
/** Thân catch chỉ trả một giá trị trung tính — hoặc không làm gì. */
const NEUTRAL_RETURN =
  /^(?:return\s*(?:\{\s*\}|\[\s*\]|null|undefined|false|true|0|""|''|``)\s*;?)?$/

/** Bỏ comment khỏi một đoạn mã để xét thân catch thật sự làm gì. */
function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Tìm `{` khớp với `{` tại `open`. Bỏ qua chuỗi và comment.
 * shortcut: không phân tích regex literal (`/a{2}/` có thể lệch ngoặc),
 * nâng lên dùng parser khi gặp false positive thật.
 * @returns {number} chỉ số của `}` khớp, hoặc -1
 */
function matchBrace(src, open) {
  let depth = 0
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i)
      if (i < 0) return -1
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2)
      if (i < 0) return -1
      i += 1
      continue
    }
    if (c === '"' || c === "'" || c === "`") {
      for (let j = i + 1; j < src.length; j++) {
        if (src[j] === "\\") {
          j++
          continue
        }
        if (src[j] === c) {
          i = j
          break
        }
        if (j === src.length - 1) return -1
      }
      continue
    }
    if (c === "{") depth++
    else if (c === "}") {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** @returns {{line:number, body:string}[]} mọi khối catch trong `src` */
export function catchBlocks(src) {
  const re = /\bcatch\b\s*(?:\([^)]*\))?\s*\{/g
  const out = []
  let m
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1
    const close = matchBrace(src, open)
    if (close < 0) continue
    out.push({ line: lineAt(src, m.index), body: src.slice(open + 1, close) })
    re.lastIndex = close
  }
  return out
}

export function run(root = REPO_ROOT) {
  const files = walk(root, { exts: [".js", ".mjs", ".cjs", ".ts"] })
  const findings = []
  let checked = 0
  for (const f of files) {
    const src = readText(f)
    if (src === null || isExempt(src)) continue
    for (const b of catchBlocks(src)) {
      checked++
      if (SPEAKS.test(b.body) || MARKER.test(b.body)) continue
      const bare = stripComments(b.body)
      if (!NEUTRAL_RETURN.test(bare)) continue
      const shape = bare === "" ? "thân rỗng" : `\`${bare}\``
      findings.push({
        file: relTo(root, f),
        line: b.line,
        message: `catch trả mặc định trong im lặng (${shape}) — thêm một dòng stderr/throw, hoặc ghi \`cố ý im lặng: <lý do>\``,
      })
    }
  }
  return result("A13", "catch không trả mặc định trong im lặng", findings, checked)
}
