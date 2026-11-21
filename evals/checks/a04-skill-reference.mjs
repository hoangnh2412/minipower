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
 * Chỗ trống đó là lối mục nát yên lặng nhất: một bảng liệt kê
 * `| minipower-ops-log-flow | Đọc log |` thì người đọc và agent đều tin lá đó
 * tồn tại. Không link nào gãy, không test nào đỏ. Đổi tên hay bỏ một lá cũng để
 * lại đúng dấu vết này.
 *
 * Nhận tham chiếu, đọc từ dữ liệu:
 *   (a) **module** = thư mục dưới `src/` — dùng để nhận "hình dạng tên lá". Chỉ
 *       token `minipower-{module}-…` mới được soát, nên `minipower-hooks` (gói
 *       npm), `minipower-catalog` (tên file test), `minipower-maintainer` (vai
 *       trong PACK.md) tự nằm ngoài mà không phải kê tên tay.
 *   (b) **tên hợp lệ** = mọi `name:` khai trong BẤT KỲ `SKILL.md` nào, nên lá
 *       lồng trong `providers/` và `patterns/` cũng tính.
 *   (c) token kết thúc bằng `-` là **fragment văn xuôi** (`minipower-backend-*`
 *       bị regex cắt ở dấu sao), không phải một tham chiếu.
 *
 * **Ngữ cảnh phủ nhận sự tồn tại thì không phải lỗi.** Đọc một dòng tách rời
 * khỏi ngữ cảnh cho 9 phát hiện giả trên repo — tài liệu đã trung thực sẵn, chỉ
 * là nói ở heading hoặc ở cột bên cạnh. Bốn hình thức, mỗi hình thức gắn một
 * quy ước có thật trong repo:
 *   1. **Mục "Sẽ có" / "dự kiến"** — quy ước *chưa có skill thật thì chưa tạo
 *      thư mục* (AGENTS.md; ADR-022 QĐ-7 luật 2; ADR-023 QĐ-3). Dùng ở
 *      `ops/README.md`, `toolbox/README.md`, `presales/README.md`.
 *   2. **Bảng có cột `❌`** — khuôn bảng phản diện `| ❌ | Vì sao |`, dùng ở 8
 *      workflow của frontend và toolbox. Tên trong đó là *đừng làm thế*.
 *   3. **Dòng tự khai chưa có** — `chưa có`, `chưa tách`; và `không phải` /
 *      `không theo` đứng ngay trước tên (ví dụ phản diện giữa câu).
 *   4. Marker `nhắc có chủ đích: <lý do>` cùng dòng hoặc dòng trên — lối thoát
 *      cuối cho trường hợp không khớp ba hình thức trên.
 *
 * Mức ra mắt **WARN** chứ không phải chặn như §7.1 ghi: theo ADR-044 §8.1, nâng
 * lên chặn sau khi check đã bắt đúng ít nhất hai lần trên thay đổi thật.
 */

import { readdirSync } from "node:fs"
import { basename, join } from "node:path"
import { walk, readText, relTo, result, REPO_ROOT, isExempt } from "./lib.mjs"

const MARKER = /nhắc có chủ đích\s*:/i

/** `minipower-backend-review-dotnet`. Fragment kết thúc bằng `-` bị bỏ ở dưới. */
const TOKEN = /minipower-[a-z0-9][a-z0-9-]*/g

/** Mục roadmap — quy ước "chưa có skill thật thì chưa tạo thư mục". */
const PLANNED_HEADING = /^#{1,6}\s.*(?:sẽ có|dự kiến)/i

/** Dòng tiêu đề bảng phản diện: `| ❌ | Vì sao |`. */
const COUNTER_HEADER = /❌/

/**
 * Tự khai là chưa tồn tại. Soát trong cửa sổ ±40 ký tự quanh tên, không soát
 * cả dòng: cả dòng thì một chữ "chưa có" ở đầu câu che mọi tên phía sau — đo
 * thật là 44 token bị che trong khi chỉ cần 2.
 */
const SELF_DISCLAIM = /chưa có|chưa tách/i
const DISCLAIM_WINDOW = 40

/** `…, không phải \`tên\`` — ví dụ phản diện giữa câu. */
const NEGATED_BEFORE = /(?:không phải|không theo)[^.;]{0,30}$/i

const TABLE_SEPARATOR = /^\s*\|[\s:|-]+\|\s*$/

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

/**
 * Tham chiếu đáng soát trong một file, đã trừ mọi ngữ cảnh phủ nhận.
 * @returns {{token:string, line:number}[]}
 */
export function references(src, isShaped) {
  const lines = src.split(/\r?\n/)
  const out = []
  let plannedSection = false
  let counterTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^#{1,6}\s/.test(line)) {
      plannedSection = PLANNED_HEADING.test(line)
      counterTable = false
    } else if (TABLE_SEPARATOR.test(line)) {
      counterTable = COUNTER_HEADER.test(lines[i - 1] || "")
    } else if (!line.trim()) {
      counterTable = false
    }

    if (plannedSection || counterTable) continue
    if (MARKER.test(line) || MARKER.test(lines[i - 1] || "")) continue

    const seen = new Set()
    TOKEN.lastIndex = 0
    let m
    while ((m = TOKEN.exec(line))) {
      const token = m[0]
      if (token.endsWith("-")) continue
      if (!isShaped(token)) continue
      const window = line.slice(
        Math.max(0, m.index - DISCLAIM_WINDOW),
        m.index + token.length + DISCLAIM_WINDOW,
      )
      if (SELF_DISCLAIM.test(window)) continue
      if (NEGATED_BEFORE.test(line.slice(0, m.index))) continue
      if (seen.has(token)) continue
      seen.add(token)
      out.push({ token, line: i + 1 })
    }
    TOKEN.lastIndex = 0
  }
  return out
}

export function run(root = REPO_ROOT) {
  const modules = moduleNames(root)
  const declared = declaredNames(root)
  const isShaped = (t) => modules.has(t.split("-")[1])
  const findings = []
  let checked = 0

  for (const f of walk(root, { exts: [".md"] })) {
    const r = relTo(root, f)
    if (SKIP_TOP.some((d) => r.startsWith(d))) continue
    const src = readText(f)
    if (src === null || isExempt(src)) continue

    for (const ref of references(src, isShaped)) {
      checked++
      if (declared.has(ref.token)) continue
      findings.push({
        file: r,
        line: ref.line,
        message: `\`${ref.token}\` không có lá nào khai tên đó — sửa tên, bỏ dòng, hoặc ghi \`nhắc có chủ đích: <lý do>\``,
      })
    }
  }

  return result("A04", "tên skill nhắc trong tài liệu trỏ tới lá có thật", findings, checked)
}
