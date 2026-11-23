/**
 * A03 — điều kiện cứng KHAI phải có cưỡng chế THẬT, và ngược lại.
 *
 * Luật (ADR-026 §7.1): `A3 = |điều kiện cứng có ≥1 test làm nó FAIL| / |điều
 * kiện cứng|`, ngưỡng = 1. Check này nhận **nửa đi dây** của tiêu chí đó: mỗi
 * điều kiện khai ở `rules.json → hard_conditions` có thật sự được nối vào máy
 * hay không. Nửa còn lại — *"có test nào làm nó FAIL"* — chưa làm, vì "một test
 * làm điều kiện này đỏ" là phán đoán: một file test mang tên đúng chưa chứng
 * minh nó assert vào nhánh chặn. Đo riêng trước khi viết, đừng đoán.
 *
 * Vì sao nửa đi dây đã đáng có: `AGENTS.md` là file agent đọc ĐẦU TIÊN, và nó
 * đang kê một danh sách bảy món. Danh sách đó lệch thực tế theo cả hai chiều mà
 * không gì đỏ — agent tin có cổng ở nơi không có, và không biết có cổng ở nơi
 * có. Đây đúng loại lỗi tệ hơn tài liệu lệch: cổng không chạy mà máy vẫn báo an
 * toàn.
 *
 * Bốn luật, đọc từ dữ liệu:
 *   (a) khai `kind: "hook"` → id phải có trong `install_hooks[].shim`;
 *   (b) khai `kind: "ci"`   → phải có dòng `run:` trong `.github/workflows/`
 *       gọi tới id đó;
 *   (c) ngược — mọi `shim` trong `install_hooks` mà không được khai;
 *   (d) ngược — mọi cổng npm chạy trong CI (`*:check` hoặc `test`) mà không
 *       được khai.
 *
 * Hai chiều ngược quan trọng ngang chiều thuận: một cổng chạy thật mà không ai
 * khai thì nó biến mất khỏi danh sách khi có người dọn, và không ai biết vừa
 * mất cái gì.
 *
 * Vì sao là luật chung: cả danh sách khai, bộ shim, và các dòng `run:` của CI
 * đều đọc từ dữ liệu — thêm hook, thêm job, gỡ điều kiện đều tự được canh.
 *
 * Mức ra mắt **WARN** chứ không phải chặn như §7.1 ghi: danh sách đang lệch
 * thật, và nó còn đổi nữa (chủ repo đã chốt gỡ `project_mode`; thẻ S5/S6 gỡ
 * `token-guard` và `baseline-guard`). Nâng lên chặn sau khi danh sách đứng yên
 * — cùng luật ADR-044 §8.1.
 *
 * Lối thoát: không có. Lệch thì sửa một trong hai đầu — hoặc nối dây, hoặc bỏ
 * khai. Một marker ở đây chỉ để lại đúng cái danh sách nói dối.
 */

import { existsSync } from "node:fs"
import { join } from "node:path"
import { walk, readText, relTo, result, REPO_ROOT } from "./lib.mjs"

const RULES_REL = ["src", "router", "hooks", "lib", "rules.json"]
const WORKFLOWS_REL = [".github", "workflows"]

/** Cổng npm đáng khai: `*:check`, hoặc `test`. */
const GATE_SCRIPT = /^(?:[a-z-]+:check|test)$/

function readRules(root) {
  const f = join(root, ...RULES_REL)
  if (!existsSync(f)) return null
  const raw = readText(f)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    process.stderr.write(`[evals] A03: rules.json không phải JSON hợp lệ: ${e.message}\n`)
    return null
  }
}

/** Mọi dòng `run:` trong workflow CI, ghép lại. */
export function ciRunLines(root) {
  const dir = join(root, ...WORKFLOWS_REL)
  if (!existsSync(dir)) return []
  const out = []
  for (const f of walk(dir, { exts: [".yml", ".yaml"] })) {
    const src = readText(f)
    if (src === null) continue
    for (const line of src.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:-\s*)?run:\s*(.+)$/)
      if (m) out.push({ file: relTo(root, f), cmd: m[1].trim() })
    }
  }
  return out
}

/** Tên cổng npm mà CI thực sự gọi — `npm run X` hoặc `npm test` / `node --test`. */
export function ciGates(runLines) {
  const names = new Set()
  for (const { cmd } of runLines) {
    const run = cmd.match(/npm\s+run\s+([^\s-]\S*)/)
    if (run && GATE_SCRIPT.test(run[1])) names.add(run[1])
    if (/npm\s+test\b|node\s+--test\b/.test(cmd)) names.add("test")
  }
  return names
}

export function run(root = REPO_ROOT) {
  const rules = readRules(root)
  if (rules === null) {
    return result(
      "A03",
      "điều kiện cứng khai ↔ cưỡng chế thật",
      [{ file: relTo(root, join(root, ...RULES_REL)), message: "không đọc được rules.json — check không soát được gì" }],
      0,
    )
  }

  const declared = Array.isArray(rules.hard_conditions) ? rules.hard_conditions : []
  const shims = new Set((rules.install_hooks || []).map((h) => h && h.shim).filter(Boolean))
  const runLines = ciRunLines(root)
  const gates = ciGates(runLines)
  const declaredIds = new Set(declared.map((h) => h && h.id).filter(Boolean))

  const findings = []
  const rulesFile = relTo(root, join(root, ...RULES_REL))
  let checked = 0

  for (const h of declared) {
    if (!h || !h.id) continue
    checked++
    if (h.kind === "hook") {
      if (!shims.has(h.id)) {
        findings.push({
          file: rulesFile,
          message: `khai \`${h.id}\` là điều kiện cứng dạng hook, nhưng không có shim nào tên đó trong \`install_hooks\``,
        })
      }
      continue
    }
    if (h.kind === "ci") {
      const wired = runLines.some((l) => l.cmd.includes(h.id))
      if (!wired) {
        findings.push({
          file: rulesFile,
          message: `khai \`${h.id}\` là điều kiện cứng chạy ở CI, nhưng không workflow nào có dòng \`run:\` gọi nó — cổng này không chạy mà danh sách vẫn kê`,
        })
      }
      continue
    }
    findings.push({
      file: rulesFile,
      message: `\`${h.id}\` khai \`kind: "${h.kind}"\` — chỉ nhận \`hook\` hoặc \`ci\``,
    })
  }

  for (const shim of [...shims].sort()) {
    checked++
    if (declaredIds.has(shim)) continue
    findings.push({
      file: rulesFile,
      message: `hook \`${shim}\` có trong \`install_hooks\` nhưng không được khai là điều kiện cứng — cưỡng chế thật mà danh sách không biết`,
    })
  }

  for (const gate of [...gates].sort()) {
    checked++
    if (declaredIds.has(gate)) continue
    findings.push({
      file: ".github/workflows/",
      message: `CI chạy cổng \`${gate}\` nhưng không được khai là điều kiện cứng — ai dọn danh sách sẽ không biết vừa mất gì`,
    })
  }

  return result("A03", "điều kiện cứng khai ↔ cưỡng chế thật", findings, checked)
}
