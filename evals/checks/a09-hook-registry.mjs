/**
 * A09 — sổ đăng ký hook và cây file phải khớp nhau, hai chiều.
 *
 * Luật, đọc từ `rules.json` chứ không từ danh sách chép tay:
 *   (a) mọi `shim` khai trong `install_hooks` phải có `bin/<shim>.js` tồn tại;
 *   (b) mọi `bin/*.js` tự khai là shim (header có `CLI shim @ <slot>`) phải
 *       có mặt trong `install_hooks`.
 *
 * Vì sao cả hai chiều: thiếu chiều (a) thì xoá file mà để lại dòng khai → lệnh
 * cài dựng một hook trỏ hư không, repo vẫn xanh, chỉ gãy ở máy người dùng.
 * Thiếu chiều (b) thì viết hook mà quên đăng ký → nó không bao giờ chạy, và
 * cũng không có gì đỏ.
 *
 * Vì sao là luật chung: nó duyệt dữ liệu, nên tự đúng với bộ hook của tương
 * lai — thêm hook, bớt hook, đổi tên đều được canh mà không phải sửa check.
 *
 * Lối thoát chiều (b): ghi `không đăng ký: <lý do>` trong header file shim.
 */

import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { readText, relTo, result, REPO_ROOT } from "./lib.mjs"

const MARKER = /không đăng ký\s*:/i
const DECLARES_SLOT = /CLI shim\s*@\s*\w+/i

const RULES_REL = ["src", "router", "hooks", "lib", "rules.json"]
const BIN_REL = ["src", "router", "hooks", "bin"]

export function run(root = REPO_ROOT) {
  const rulesPath = join(root, ...RULES_REL)
  const binDir = join(root, ...BIN_REL)
  const raw = readText(rulesPath)
  if (raw === null) {
    return result("A09", "sổ đăng ký hook khớp cây file", [
      { file: relTo(root, rulesPath), message: "không đọc được rules.json — check không soát được gì" },
    ], 0)
  }

  let rules
  try {
    rules = JSON.parse(raw)
  } catch (e) {
    return result("A09", "sổ đăng ký hook khớp cây file", [
      { file: relTo(root, rulesPath), message: `rules.json không phải JSON hợp lệ: ${e.message}` },
    ], 0)
  }

  const declared = Array.isArray(rules.install_hooks) ? rules.install_hooks : []
  const findings = []

  // (a) khai → file
  for (const h of declared) {
    const name = h && h.shim
    if (!name) {
      findings.push({ file: relTo(root, rulesPath), message: "install_hooks có mục thiếu `shim`" })
      continue
    }
    if (!existsSync(join(binDir, `${name}.js`))) {
      findings.push({
        file: relTo(root, rulesPath),
        message: `khai shim \`${name}\` nhưng không có bin/${name}.js — lệnh cài sẽ dựng hook trỏ file không tồn tại`,
      })
    }
  }

  // (b) file tự khai là shim → phải có trong sổ
  const names = new Set(declared.map((h) => h && h.shim).filter(Boolean))
  let binFiles = []
  try {
    binFiles = readdirSync(binDir).filter((f) => f.endsWith(".js"))
  } catch (e) {
    findings.push({ file: relTo(root, binDir), message: `không đọc được bin/: ${e.message}` })
  }
  for (const f of binFiles) {
    const name = f.replace(/\.js$/, "")
    if (names.has(name)) continue
    const src = readText(join(binDir, f))
    if (src === null) continue
    const header = src.slice(0, 600)
    if (!DECLARES_SLOT.test(header)) continue
    if (MARKER.test(header)) continue
    findings.push({
      file: relTo(root, join(binDir, f)),
      message: `tự khai \`CLI shim @ …\` nhưng không có trong install_hooks — hook này không bao giờ được cài; đăng ký nó, hoặc ghi \`không đăng ký: <lý do>\` ở header`,
    })
  }

  return result(
    "A09",
    "sổ đăng ký hook khớp cây file",
    findings,
    declared.length + binFiles.length,
  )
}
