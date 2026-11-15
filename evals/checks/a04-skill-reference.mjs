/**
 * A04 — tên skill nhắc trong tài liệu phải trỏ tới một lá có thật.
 *
 * Luật (ADR-026 §7.1): `A4 = |tham chiếu skill hợp lệ| / |tham chiếu skill|`,
 * ngưỡng = 1. Phần lớn công thức đó **đã có người canh**, nên check này chỉ
 * nhận đúng khoảng trống còn lại:
 *
 * | Phần của A4 | Ai canh |
 * |---|---|
 * | `name` ≡ thư mục · README gốc liệt kê mọi lá | `test/minipower-catalog.test.js` |
 * | link `[x](../x/SKILL.md)` trỏ file có thật | `npm run link:check` |
 * | tên skill trỏ từ `rules.json` | mẫu số rỗng — `rules.json` không chứa tên lá |
 * | **tên nhắc trần trong văn xuôi, không phải link** | **chưa ai — A04** |
 *
 * Chỗ trống đó có thật và là lối mục nát yên lặng nhất: một bảng trong README
 * liệt kê `| minipower-ops-log-flow | Đọc log vẽ sơ đồ luồng |` thì người đọc
 * và agent đều tin lá đó tồn tại. Không link nào gãy, không test nào đỏ. Đổi
 * tên hay bỏ một lá cũng để lại đúng dấu vết này.
 *
 * Luật, đọc từ dữ liệu:
 *   (a) **module** = thư mục dưới `src/` — dùng để nhận "hình dạng tên lá".
 *       Chỉ token `minipower-{module}-…` mới được soát, nên `minipower-hooks`
 *       (gói npm), `minipower-catalog` (tên file test), `minipower-maintainer`
 *       (vai trong PACK.md) tự nằm ngoài mà không phải kê tên tay.
 *   (b) **tên hợp lệ** = mọi `name:` khai trong BẤT KỲ `SKILL.md` nào, nên lá
 *       lồng trong `providers/` và `patterns/` cũng tính — chúng là skill thật,
 *       chỉ không nằm trong danh sách lá đăng ký.
 *   (c) token kết thúc bằng `-` là **fragment văn xuôi** (`minipower-backend-*`
 *       bị regex cắt ở dấu sao), không phải một tham chiếu.
 *
 * Không soát `ADRs/` (bản ghi lịch sử — nhắc tên lá đã chết ở đó là đúng, cùng
 * lý do A12 bỏ qua) và `staging/` (kho tạm).
 *
 * Mức ra mắt **WARN** chứ không phải chặn như §7.1 ghi: repo hiện có 8 chỗ,
 * trong đó vài chỗ là nhắc có chủ đích. Theo ADR-044 §8.1 thì nâng lên chặn sau
 * khi check đã bắt đúng ít nhất hai lần trên thay đổi thật — và sau khi 8 chỗ
 * kia được phân loại xong.
 *
 * Lối thoát: `nhắc có chủ đích: <lý do>` cùng dòng hoặc dòng ngay trên — hợp lệ
 * cho lá đang trong catalog mà chưa tách file, và cho tên dùng làm **ví dụ**
 * (kể cả ví dụ phản diện trong lá dạy viết skill).
 */

import { readdirSync } from "node:fs"
import { basename, join } from "node:path"
import { walk, readText, relTo, lineAt, lineAndPrev, result, REPO_ROOT, isExempt } from "./lib.mjs"

const MARKER = /nhắc có chủ đích\s*:/i

/** `minipower-backend-review-dotnet`. Fragment kết thúc bằng `-` bị bỏ ở dưới. */
const TOKEN = /minipower-[a-z0-9][a-z0-9-]*/g

const SKIP_TOP = ["ADRs/", "staging/"]

/** Module = thư mục dưới `src/`. */
export function moduleNames(root) {
  try {
    return new Set(
      readdirSync(join(root, "src"), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .map((d) => d.name),
    )
  } catch (e) {
    process.stderr.write(`[evals] A04: không đọc được src/: ${e.message}\n`)
    return new Set()
  }
}

/** Mọi `name:` khai trong bất kỳ `SKILL.md` nào — gồm lá lồng provider/pattern. */
export function declaredNames(root) {
  const out = new Set()
  for (const f of walk(root, { exts: ["SKILL.md"] })) {
    if (basename(f) !== "SKILL.md") continue
    const src = readText(f)
    if (src === null) continue
    const m = src.match(/^name:\s*(\S+)/m)
    if (m) out.add(m[1])
  }
  return out
}

export function run(root = REPO_ROOT) {
  const modules = moduleNames(root)
  const declared = declaredNames(root)
  const findings = []
  let checked = 0

  for (const f of walk(root, { exts: [".md"] })) {
    const r = relTo(root, f)
    if (SKIP_TOP.some((d) => r.startsWith(d))) continue
    const src = readText(f)
    if (src === null || isExempt(src)) continue

    const seen = new Set()
    TOKEN.lastIndex = 0
    let m
    while ((m = TOKEN.exec(src))) {
      const token = m[0]
      if (token.endsWith("-")) continue
      if (!modules.has(token.split("-")[1])) continue
      checked++
      if (declared.has(token)) continue
      const line = lineAt(src, m.index)
      if (MARKER.test(lineAndPrev(src, line))) continue
      const key = `${token}:${line}`
      if (seen.has(key)) continue
      seen.add(key)
      findings.push({
        file: r,
        line,
        message: `\`${token}\` không có lá nào khai tên đó — sửa tên, bỏ dòng, hoặc ghi \`nhắc có chủ đích: <lý do>\``,
      })
    }
    TOKEN.lastIndex = 0
  }

  return result("A04", "tên skill nhắc trong tài liệu trỏ tới lá có thật", findings, checked)
}
