import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const CAT = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../catalog/dmba-default.json"), "utf8"),
)

export function catalog() {
  return CAT
}

/**
 * Thứ tự áp dụng — khớp đúng công thức trong Excel:
 *   goc        = (tt + pt + xn) × qty
 *   sau_reuse  = goc × (1 − reuse_pct)
 *   sau_auto   = sau_reuse × (1 − auto_pct)
 *   adders     = Σ(mh_adder × số lượng)        ← KHÔNG trừ auto: phán xét không tự động hoá được
 *   mh         = (sau_auto + adders) × (1 + adjust_pct)
 */
export function lineMH({
  code,
  qty = 1,
  reuse_pct = 0,
  auto_pct = 0,
  adjust_pct = 0,
  adders = {},
}) {
  const row = CAT.codes[code]
  if (!row) throw new Error(`mã ngoài catalog: ${code}`)

  const per = row.tt + row.pt + row.xn
  const goc = per * qty
  const sau_auto = goc * (1 - reuse_pct) * (1 - auto_pct)
  const add = adderMH(adders)
  const mh = (sau_auto + add) * (1 + adjust_pct)

  return {
    code,
    qty,
    mh_goc: round4(goc),
    mh_adders: round4(add),
    mh: round4(mh),
    phase: {
      tt: round4(row.tt * qty),
      pt: round4(row.pt * qty),
      xn: round4(row.xn * qty),
    },
  }
}

export function adderMH(adders = {}) {
  let s = 0
  for (const [k, n] of Object.entries(adders)) {
    if (!n) continue
    const a = CAT.adders[k]
    if (!a) throw new Error(`adder ngoài catalog: ${k}`)
    s += a.mh * n
  }
  return round4(s)
}

export function nenMH(code, months = 1) {
  const row = CAT.nen[code]
  if (!row) throw new Error(`hạng mục nền ngoài catalog: ${code}`)
  return round4(row.per === "tháng" ? row.mh * months : row.mh)
}

export function sumMH(lines, nenLines = []) {
  let s = 0
  for (const l of lines) {
    if (l.out_of_scope || l.group) continue
    s += l.mh
  }
  for (const n of nenLines) s += n.mh
  return round4(s)
}

/** Ba cấu phần báo giá — không gộp thành một số. */
export function components(lines, nenLines = []) {
  const inScope = lines.filter((l) => !l.out_of_scope && !l.group)
  const khung = round4(nenLines.reduce((s, n) => s + n.mh, 0))
  const nguon = round4(inScope.filter((l) => !l.ngoai_le).reduce((s, l) => s + l.mh, 0))
  const ngoai_le = round4(inScope.filter((l) => l.ngoai_le).reduce((s, l) => s + l.mh, 0))
  return { khung, nguon, ngoai_le, tong: round4(khung + nguon + ngoai_le) }
}

const VAGUE = {
  ty_le_nhom_c_gte: 0.3,
  nguon_bi_chan_gte: 1,
  nguon_dang_pt_gte: 1,
  oq_mo_gte: 10,
}

/**
 * Cờ rủi ro — chỉ để NÊU, không nhân vào giá.
 * Rủi ro ở dự án này là thiếu đầu vào (không có DDL, nguồn bị chặn);
 * buffer không mua được DDL, nên xử lý bằng ngoại lệ / out_of_scope thay vì hệ số.
 */
export function riskFlags(estimate) {
  const lines = (estimate.lines || []).filter((l) => !l.out_of_scope && !l.group)
  const brz = lines.filter((l) => /^BRZ_/.test(l.code))
  const c = brz.filter((l) => /^BRZ_3_/.test(l.code))
  const ty_le_c = brz.length ? c.length / brz.length : 0
  const muc4 = brz.filter((l) => /^BRZ_4_/.test(l.code))

  const flags = []
  if (ty_le_c >= VAGUE.ty_le_nhom_c_gte) {
    flags.push(`tỷ lệ bảng mức 3 (suy luận toàn bộ) = ${(ty_le_c * 100).toFixed(0)}% (≥ 30%)`)
  }
  // Mức 4 = cấu trúc không tự mô tả (EDIFACT/TXT) + không tài liệu. Vẫn ước lượng được
  // (không phải gate), nhưng rủi ro hiểu sai ý nghĩa dữ liệu là bắt buộc nêu, không
  // phụ thuộc ngưỡng tỷ lệ — một dòng cũng phải nêu.
  if (muc4.length > 0) {
    const nguon = [...new Set(muc4.map((l) => l.nguon).filter(Boolean))]
    flags.push(
      `${muc4.length} bảng mức 4 (cấu trúc không tự mô tả, chưa có tài liệu${
        nguon.length ? " — " + nguon.join(", ") : ""
      }): rủi ro hiểu sai ý nghĩa dữ liệu, cần đối chiếu lại với đội nguồn trước khi chốt đặc tả`
    )
  }
  if ((estimate.nguon_bi_chan ?? 0) >= VAGUE.nguon_bi_chan_gte) {
    flags.push(`${estimate.nguon_bi_chan} nguồn chưa được cấp quyền kết nối`)
  }
  if ((estimate.nguon_dang_pt ?? 0) >= VAGUE.nguon_dang_pt_gte) {
    flags.push(`${estimate.nguon_dang_pt} nguồn đang phát triển, schema chưa đóng`)
  }
  if ((estimate.oq_mo ?? 0) >= VAGUE.oq_mo_gte) {
    flags.push(`${estimate.oq_mo} vấn đề mở (≥ 10)`)
  }
  if (estimate.pham_vi_bang_chua_chot) {
    flags.push("số bảng trong phạm vi chưa chốt")
  }
  if (estimate.retention_chua_chot) {
    flags.push("chính sách retention / PII chưa chốt")
  }
  if (lines.some((l) => l.standard_missing)) {
    flags.push("tầng Gold chưa có template cột / catalog")
  }
  return flags
}

function round4(n) {
  return Math.round(n * 10000) / 10000
}
