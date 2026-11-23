/**
 * A17 — ngân sách `description`: càng ngắn càng tốt, nhưng vẫn đủ để kích hoạt.
 *
 * Vì sao có: AI đọc `description` của **mọi** lá ở đầu mỗi lượt để biết nó có
 * những lá nào. Đó là chi phí trả mỗi lượt, và công cụ nền **cắt** khi vượt
 * ngưỡng — phần bị cắt thì lá đó vô hình, dù ruột viết đúng hết. Đo thật:
 * 75 lá, tổng 18.882 ký tự, trung vị 207, dài nhất 586.
 *
 * Chủ repo chốt nguyên tắc: *"càng ngắn càng tốt mà vẫn đủ keyword để dùng,
 * không mô tả dài dòng"*. Hai nửa kéo ngược nhau, nên check cũng hai nửa:
 *   (a) **ngắn** — trần mỗi lá, và trần tổng;
 *   (b) **đủ dùng** — phải có mệnh đề kích hoạt ("Dùng khi…"), vì một lá không
 *       nói *khi nào* dùng thì AI không có căn cứ chọn nó.
 *
 * **Trần là bánh răng, không phải số bịa.** Hai số ở `rules.json →
 * description_budget` chốt ở mức ĐO ĐƯỢC hôm nay; luật là chỉ được **giảm**.
 * Nên A17 báo cả chiều ngược: tổng tụt xuống dưới trần một quãng đáng kể thì
 * nhắc hạ trần — nếu không, bánh răng nhả ra và chỗ vừa dọn được lại phình lại.
 * Trần mỗi lá khởi điểm 400: đo thật thì nó bắt đúng 9 lá lệch hẳn khỏi phần
 * còn lại (8 lá `frontend-*-react` cộng một lá backend), trong khi 320 bắt 20 —
 * rộng tới mức thành tiếng ồn.
 *
 * Phủ định KHÔNG bị tính là dài dòng: 52 trong 75 lá dùng "không …" để chống
 * nhầm lá ("— không viết FR AC", "— không báo giá"). Đó là đặc sản của repo
 * này, không phải chữ thừa.
 *
 * KHÔNG soát độ trùng giữa các description. Đã đo: 8 cặp trùng ≥ 35% từ, nhưng
 * phần lớn là **song song có chủ đích** — `backend-plan-dotnet` ↔
 * `frontend-plan-react` (66%, ADR-045 cố ý tạo cặp), `analyst-impact` ↔
 * `architecture-impact` (58%, góc nhìn BA vs SA). Bắt chúng là ~70% báo oan.
 * Rủi ro thật — AI chọn sai lá trong một cặp song song — là câu hỏi **định
 * tuyến**, phải đo bằng câu người thật gõ, không đo bằng độ trùng chữ.
 *
 * Lối thoát: không có. Dài thì viết ngắn lại; thiếu mệnh đề kích hoạt thì thêm.
 * Một marker ở đây chỉ để lại đúng cái chi phí mỗi lượt mà nó đang đo.
 */

import { existsSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { walk, readText, relTo, result, REPO_ROOT } from "./lib.mjs"

const RULES_REL = ["src", "router", "hooks", "lib", "rules.json"]

/** Mệnh đề kích hoạt — "khi nào dùng lá này". */
const ACTIVATION = /dùng khi|dùng cho|use when/i

/** Tổng tụt dưới trần quá tỷ lệ này thì nhắc hạ trần (bánh răng). */
const SLACK = 0.05

function budget(root) {
  const f = join(root, ...RULES_REL)
  if (!existsSync(f)) return null
  const raw = readText(f)
  if (raw === null) return null
  try {
    const b = JSON.parse(raw).description_budget
    return b && typeof b === "object" ? b : null
  } catch (e) {
    process.stderr.write(`[evals] A17: rules.json không phải JSON hợp lệ: ${e.message}\n`)
    return null
  }
}

/** `description` của mọi lá đăng ký — đọc frontmatter, không nạp module. */
export function descriptions(root) {
  const out = []
  for (const f of walk(join(root, "src"), { exts: ["SKILL.md"] })) {
    if (basename(f) !== "SKILL.md") continue
    const rel = relTo(root, f)
    // chỉ lá đăng ký: src/{pack}/skills/{tên}/SKILL.md — không tính provider/pattern lồng
    const parts = rel.split("/")
    if (parts.length !== 5 || parts[2] !== "skills") continue
    let text
    try {
      text = readFileSync(f, "utf8")
    } catch (e) {
      process.stderr.write(`[evals] A17: không đọc được ${rel}: ${e.message}\n`)
      continue
    }
    const fm = text.match(/^---\n([\s\S]*?)\n---/)
    const m = fm && fm[1].match(/^description:\s*(.*)$/m)
    out.push({ file: rel, name: parts[3], desc: m ? m[1].trim() : "" })
  }
  return out
}

export function run(root = REPO_ROOT) {
  const b = budget(root)
  const leaves = descriptions(root)
  const findings = []

  if (b === null) {
    return result("A17", "ngân sách description", [
      { file: "src/router/hooks/lib/rules.json", message: "thiếu `description_budget` — check không có trần để so" },
    ], 0)
  }

  const perMax = Number(b.per_leaf_max)
  const totalMax = Number(b.total_max)
  let total = 0

  for (const l of leaves) {
    total += l.desc.length
    if (perMax > 0 && l.desc.length > perMax) {
      findings.push({
        file: l.file,
        message: `description ${l.desc.length} ký tự, quá trần ${perMax} — viết ngắn lại, đẩy chi tiết vào thân lá`,
      })
    }
    if (!ACTIVATION.test(l.desc)) {
      findings.push({
        file: l.file,
        message: "description không nói **khi nào** dùng lá này — thêm mệnh đề \"Dùng khi …\", nếu không AI không có căn cứ chọn nó",
      })
    }
  }

  if (totalMax > 0) {
    if (total > totalMax) {
      findings.push({
        file: "src/router/hooks/lib/rules.json",
        message: `tổng description ${total} ký tự, quá trần ${totalMax} — đây là chi phí trả MỖI LƯỢT, và công cụ nền cắt phần vượt`,
      })
    } else if (total < totalMax * (1 - SLACK)) {
      findings.push({
        file: "src/router/hooks/lib/rules.json",
        message: `tổng còn ${total} ký tự, dưới trần ${totalMax} hơn ${Math.round(SLACK * 100)}% — hạ \`total_max\` xuống ${total} để bánh răng không nhả`,
      })
    }
  }

  return result("A17", "ngân sách description", findings, leaves.length)
}
