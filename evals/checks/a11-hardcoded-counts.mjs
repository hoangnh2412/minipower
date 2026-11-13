/**
 * A11 — con số đếm TỒN KHO của repo không được chép tay vào test.
 *
 * Luật: `assert.equal(X.length, 42)` chỉ bị bắt khi `X` là dữ liệu đọc từ
 * REPO — một hằng nhập từ `lib/` (tức dẫn về `rules.json`), hoặc kết quả của
 * một phép quét cây file. Khi đó 42 là nguồn chân lý THỨ HAI cạnh dữ liệu
 * thật: repo thêm một lá, một shim, một thư mục là test đỏ ở chỗ không liên
 * quan tới thay đổi — hoặc ai đó sửa 42 cho xanh mà không ai biết sửa cái gì.
 *
 * KHÔNG bắt con số là kết quả mong đợi trên fixture test tự dựng
 * (`assert.equal(r.broken.length, 1)` sau khi gài đúng một link gãy). Đó là
 * assert đúng nghĩa; bắt cả nhóm này thì check bắt 100% và thành tiếng ồn.
 *
 * Vì sao là luật chung: nó phân biệt theo NGUỒN của dữ liệu, nên tự đúng với
 * test của tương lai mà không phải kê danh sách chỗ nào được miễn.
 *
 * Lối thoát: `khoá có chủ đích: <lý do>` trên cùng dòng hoặc dòng ngay trên —
 * hợp lệ khi con số CHÍNH LÀ điều cần khoá (ví dụ "đúng 2 slot hook, thêm
 * slot thứ ba là đổi hợp đồng cài đặt").
 */

import { walk, readText, relTo, lineAt, lineAndPrev, result, REPO_ROOT, isExempt } from "./lib.mjs"

const MARKER = /khoá có chủ đích\s*:/i

const COUNT_ASSERT =
  /assert\s*\.\s*(?:equal|strictEqual|deepEqual|deepStrictEqual)\s*\(\s*([A-Za-z_$][\w$.[\]()]*)\s*\.\s*length\s*,\s*(\d+)/g

/** `Object.keys(PHASE_BY_DOC)` → `PHASE_BY_DOC`; `leaves` → `leaves`. */
function rootIdent(expr) {
  const inner = expr.match(/\(\s*([A-Za-z_$][\w$]*)/)
  if (inner) return inner[1]
  return expr.split(/[.[(]/)[0]
}

/** Hằng nhập từ `lib/` — tức dẫn về rules.json hoặc dữ liệu repo. */
function importedFromLib(src) {
  const names = new Set()
  const re = /import\s*\{([^}]*)\}\s*from\s*["'][^"']*\/lib\/[^"']*["']/g
  let m
  while ((m = re.exec(src))) {
    for (const part of m[1].split(",")) {
      const name = part.split(/\s+as\s+/).pop().trim()
      if (name) names.add(name)
    }
  }
  return names
}

/** Biến gán từ một phép quét cây file hoặc liệt kê catalog. */
function scannedIdents(src) {
  const names = new Set()
  const re =
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^\n;]*\b(?:readdirSync|readdir|globSync|walk|listLeafSkills|scan\w*|collect\w*)\s*\(/g
  let m
  while ((m = re.exec(src))) names.add(m[1])
  return names
}

export function findRepoCounts(src) {
  const fromRepo = new Set([...importedFromLib(src), ...scannedIdents(src)])
  const out = []
  let m
  COUNT_ASSERT.lastIndex = 0
  while ((m = COUNT_ASSERT.exec(src))) {
    const root = rootIdent(m[1])
    if (!fromRepo.has(root)) continue
    out.push({ line: lineAt(src, m.index), expr: m[1], number: m[2], source: root })
  }
  COUNT_ASSERT.lastIndex = 0
  return out
}

export function run(root = REPO_ROOT) {
  const files = walk(root, { exts: [".test.js", ".test.mjs", ".test.ts"] })
  const findings = []
  let checked = 0
  for (const f of files) {
    const src = readText(f)
    if (src === null || isExempt(src)) continue
    for (const c of findRepoCounts(src)) {
      checked++
      if (MARKER.test(lineAndPrev(src, c.line))) continue
      findings.push({
        file: relTo(root, f),
        line: c.line,
        message: `\`${c.expr}.length === ${c.number}\` — \`${c.source}\` là tồn kho của repo; đọc con số từ nguồn, hoặc ghi \`khoá có chủ đích: <lý do>\``,
      })
    }
  }
  return result("A11", "con số tồn kho của repo không chép tay vào test", findings, checked)
}
