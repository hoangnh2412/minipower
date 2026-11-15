/**
 * A07 — chữ "bắt buộc" trong `SKILL.md` phải kèm tham chiếu cổng máy.
 *
 * Luật (ADR-026 §7.1): `W_must = |dòng chứa "bắt buộc" không kèm tham chiếu
 * check máy|`, "báo số", WARN. Nền của nó là phép thử trong AGENTS.md: *"cái gì
 * FAIL được bằng máy khi người dùng làm sai? Không trả lời được → đừng viết
 * 'bắt buộc', viết 'khuyến nghị'."* Một lá nói "bắt buộc" mà không có gì đỏ khi
 * người ta làm sai thì câu đó chỉ là lời mạnh, và lời mạnh lặp nhiều lần là
 * cách nhanh nhất khiến agent thôi phân biệt đâu là cổng thật.
 *
 * **Không có lối thoát bằng marker** — ADR §11 Q6 chốt *"Sửa chữ, không
 * whitelist"*. A07 báo thì cách sửa là viết lại câu: đổi sang "khuyến nghị",
 * hoặc nêu tên cổng máy đang canh nó. Thêm một dòng ngoại lệ là đúng thứ Q6 đã
 * loại.
 *
 * Chỉ soát `SKILL.md`: AGENTS.md chốt *"SKILL.md cho agent, README.md cho
 * người"* — chỉ lá là văn bản **ràng buộc agent**, nên chỉ ở đó chữ này mới là
 * lời tự nhận có cổng. Không soát `ADRs/` (bản ghi lịch sử, cùng lý do A12 bỏ
 * qua) và `staging/` (kho tạm).
 *
 * Nhận "tham chiếu cổng máy" — đọc từ dữ liệu: tên script npm có dấu `:` của
 * mọi `package.json` · tên shim trong `rules.json → install_hooks[].shim` · mã
 * check đăng ký trong `run.mjs` · hoặc dạng `npm run X` / `npm test`. Riêng
 * cổng của toolchain ngoài buộc phải nêu tên nên khai thành hằng `EXTERNAL` —
 * đây là phần duy nhất không suy từ dữ liệu repo được.
 *
 * Bốn phép loại, mỗi phép là một luật tổng quát (bắt thẳng theo chữ ADR cho 62
 * phát hiện, phần lớn là nhiễu):
 *   1. **Heading** — `## Output bắt buộc` là nhãn cấu trúc của khuôn lá, không
 *      phải câu quy tắc.
 *   2. **Phủ định** — `không bắt buộc` / `chưa bắt buộc` nói điều NGƯỢC LẠI.
 *   3. **Frontmatter** — `description` là bề mặt kích hoạt, không phải quy tắc.
 *   4. **Dùng ở dạng trích** — `"bắt buộc"`, `` `bắt buộc` ``, `*bắt buộc*`
 *      đang nói VỀ chữ đó, thường chính là dòng dạy luật này. Lưu ý `**bắt
 *      buộc**` (in đậm) KHÔNG được loại: đậm là nhấn một yêu cầu thật.
 *
 * Giới hạn đã biết: A07 không phân biệt được "repo bắt buộc" với "framework
 * ngoài bắt buộc" (ví dụ `ITenantEntity bắt buộc` là yêu cầu của Jarvis). Số
 * báo ra vì thế là **ứng viên để người soát**, không phải danh sách lỗi.
 */

import { existsSync } from "node:fs"
import { basename, join } from "node:path"
import { walk, readText, relTo, result, REPO_ROOT, isExempt } from "./lib.mjs"

const TERM = "bắt buộc"

/** Cổng của toolchain ngoài — phần duy nhất không suy từ dữ liệu repo được. */
const EXTERNAL = [
  "CI",
  "analyzer",
  "ESLint",
  "tsc",
  "ArchitectureTests",
  "dotnet build",
  "dotnet format",
  "dotnet test",
]

const SKIP_TOP = ["ADRs/", "staging/"]

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function shimNames(root) {
  // Vắng rules.json trong `root` đang soát là bình thường (test truyền thư mục
  // tạm) — không phải lỗi đọc, nên không ghi stderr.
  const f = join(root, "src", "router", "hooks", "lib", "rules.json")
  if (!existsSync(f)) return []
  const raw = readText(f)
  if (raw === null) return []
  try {
    const rules = JSON.parse(raw)
    return (rules.install_hooks || []).map((h) => h && h.shim).filter(Boolean)
  } catch (e) {
    process.stderr.write(`[evals] A07: rules.json không phải JSON hợp lệ: ${e.message}\n`)
    return []
  }
}

function checkIds(root) {
  const f = join(root, "evals", "checks", "run.mjs")
  if (!existsSync(f)) return []
  const src = readText(f)
  if (src === null) return []
  return [...src.matchAll(/from\s+"\.\/(a\d{2})-/g)].map((m) => m[1].toUpperCase())
}

function namedScripts(root) {
  const out = []
  for (const p of walk(root, { exts: ["package.json"] })) {
    const raw = readText(p)
    if (raw === null) continue
    try {
      const json = JSON.parse(raw)
      const scripts = json && typeof json.scripts === "object" && json.scripts ? json.scripts : {}
      for (const name of Object.keys(scripts)) if (name.includes(":")) out.push(name)
    } catch (e) {
      process.stderr.write(`[evals] A07: ${relTo(root, p)} không phải JSON hợp lệ: ${e.message}\n`)
    }
  }
  return out
}

/** Một biểu thức nhận mọi dấu hiệu "có cổng máy". */
export function gateRegex(root) {
  const toks = new Set([...EXTERNAL, ...shimNames(root), ...checkIds(root), ...namedScripts(root)])
  const alt = [...toks]
    .map(escapeRe)
    .sort((a, b) => b.length - a.length)
    .join("|")
  return new RegExp(`\\bnpm\\s+(?:run\\s+\\S+|test)\\b|(?<![\\w-])(?:${alt})(?![\\w-])`, "i")
}

/** Dòng cuối của khối frontmatter (1-based); 0 nếu file không có. */
export function frontmatterEnd(lines) {
  if (lines[0] !== "---") return 0
  for (let i = 1; i < lines.length; i++) if (lines[i].trim() === "---") return i + 1
  return 0
}

/** `không bắt buộc` · `chưa **bắt buộc**` — nói điều ngược lại. */
function isNegated(line, idx) {
  const before = line.slice(Math.max(0, idx - 18), idx)
  return /(?:không|chưa)(?:\s|\*|_|`|phải|là)*$/i.test(before)
}

/** `"bắt buộc"` · `` `bắt buộc` `` · `*bắt buộc*` — nói VỀ chữ đó. `**…**` thì không. */
function isQuotedMention(line, idx) {
  const b1 = line.slice(Math.max(0, idx - 1), idx)
  const b2 = line.slice(Math.max(0, idx - 2), Math.max(0, idx - 1))
  const a1 = line.slice(idx + TERM.length, idx + TERM.length + 1)
  const quote = new Set(['"', "'", "`"])
  if (quote.has(b1) && quote.has(a1)) return true
  if ((b1 === "*" || b1 === "_") && b2 !== b1 && (a1 === "*" || a1 === "_")) return true
  return false
}

/**
 * Ứng viên trong một lá: dòng mang chữ, đã qua bốn phép loại.
 * @returns {{line:number, text:string}[]}
 */
export function candidates(src) {
  const lines = src.split(/\r?\n/)
  const fmEnd = frontmatterEnd(lines)
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const no = i + 1
    if (no <= fmEnd) continue
    const line = lines[i]
    if (/^\s{0,3}#{1,6}\s/.test(line)) continue
    let idx = line.indexOf(TERM)
    while (idx !== -1) {
      if (!isNegated(line, idx) && !isQuotedMention(line, idx)) {
        out.push({ line: no, text: line.trim() })
        break
      }
      idx = line.indexOf(TERM, idx + 1)
    }
  }
  return out
}

export function run(root = REPO_ROOT) {
  const gate = gateRegex(root)
  const files = walk(root, { exts: ["SKILL.md"] })
    .filter((p) => basename(p) === "SKILL.md")
    .filter((p) => !SKIP_TOP.some((d) => relTo(root, p).startsWith(d)))
  const findings = []
  let checked = 0

  for (const f of files) {
    const src = readText(f)
    if (src === null || isExempt(src)) continue
    for (const c of candidates(src)) {
      checked++
      if (gate.test(c.text)) continue
      findings.push({
        file: relTo(root, f),
        line: c.line,
        message: `"${TERM}" không kèm cổng máy nào — nêu tên cổng đang canh, hoặc đổi thành "khuyến nghị" (ADR-026 §11 Q6: sửa chữ, không whitelist)`,
      })
    }
  }

  return result("A07", `"${TERM}" trong SKILL.md phải kèm cổng máy`, findings, checked)
}
