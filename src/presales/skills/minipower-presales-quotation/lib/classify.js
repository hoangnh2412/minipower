/** classify() — bảng quyết định DMBA, không prompt. LLM chỉ đếm, máy chọn mã. */

const FIELD_BANDS = [10, 25, 60, 120]

/** số field → band 1..5 */
function fieldBand(n) {
  for (let i = 0; i < FIELD_BANDS.length; i++) {
    if (n <= FIELD_BANDS[i]) return i + 1
  }
  return 5
}

/**
 * Mức chất lượng đầu vào — trục chi phí chính ở mức bảng Bronze.
 * Suy từ 2 tiêu chí điểm (không dùng cờ boolean has_ddl/has_survey_form):
 *   doc_match       1 = tài liệu kế thừa toàn bộ (đã rà soát đối chiếu DDL/dữ liệu thật)
 *                   2 = kế thừa một phần, phải suy luận phần còn lại
 *                   3 = không có tài liệu dùng được, phải suy luận toàn bộ ý nghĩa
 *   self_describing 1 = DDL/catalog máy đọc, hoặc JSON/XML tên field rõ nghĩa
 *                   2 = tên field có nhưng viết tắt/mã nội bộ, phải đối chiếu
 *                   3 = định vị theo code/cột cố định (EDIFACT/TXT) — không tự mô tả
 * doc_match=1/2 luôn kéo self_describing về mức thấp nhất (đã có tài liệu thì không cần
 * tự suy luận cấu trúc). doc_match=3 & self_describing=3 → mức 4: vẫn ước lượng được
 * (không phải gate) nhưng BẮT BUỘC cờ risk ở calc.js riskFlags() — rủi ro hiểu sai ý
 * nghĩa dữ liệu, không phải rủi ro thiếu đầu vào nên không chặn báo giá.
 */
function bronzeMuc(doc_match, self_describing) {
  if (doc_match === 1) return 1
  if (doc_match === 2) return 2
  return self_describing === 3 ? 4 : 3
}

/** Ma trận phạm vi quản trị & bảo vệ dữ liệu (Điều 4) — 5 đối tượng × độ sâu.
 *  Độ sâu KHÁCH khai, không phải mình chấm: 0 ngoài phạm vi · 1 tham gia · 2 thiết kế. */
const GOV_DOI_TUONG = {
  qt_qtdl: "GOV_QT", // quy trình quản trị dữ liệu
  qc_qtdl: "GOV_QC", // quy tắc quản trị dữ liệu (CDE · DQ · metadata catalog)
  tl_qtdl: "GOV_TL", // tài liệu / biểu mẫu quản trị dữ liệu
  qt_bvdl: "BVD_QT", // quy trình bảo vệ dữ liệu
  qc_bvdl: "BVD_QC", // quy tắc bảo vệ dữ liệu (phân loại · MSK/ENC/AC)
}

/** Tỷ lệ field PII trong một bảng → band công mức bảng.
 *  Ngưỡng hiệu chỉnh trên phân bố thật 658 bảng Bronze: p50 5,2% · p90 16,2% · max 60%. */
const PII_BANDS = [0.1, 0.25]

const UNCLEAR = {
  ks_ht: "KS_HT3",
  tq_ng: "TQ_NG2",
  brz: "BRZ_3_5",
  gov: "GOV_QC_2",
  pii_bang: "PII_B3",
  slv: "SLV4",
  gld_dim: "GLD_DIM2",
  gld_fct: "GLD_FCT3",
  gld_dm: "GLD_DM2",
  erd: "ERD4",
  logic: "LOGIC3",
  map: "MAP3",
  bc_bg: "BC_BG2",
  ho_tro: "HOTRO2",
}

const GOLD_KINDS = new Set(["gld_dim", "gld_fct", "gld_dm", "gld_kpi"])

export function classify(input) {
  const { kind, unclear = false } = input

  if (unclear) {
    const code = UNCLEAR[kind]
    if (!code) throw new Error(`kind không trong catalog: ${kind}`)
    return { code, split: 1, open_question: true, standard_missing: GOLD_KINDS.has(kind) }
  }

  const out = (code, split = 1) => ({
    code,
    split,
    open_question: false,
    standard_missing: GOLD_KINDS.has(kind),
  })

  switch (kind) {
    case "ks_ht": {
      // Proxy 3 cờ cho bảng tiêu chí đầy đủ ở references/huong-dan-bao-gia.md Điều 9.2:
      // blocked    = tiêu chí "quyền truy cập" ở mức 3đ (bị chặn hoàn toàn, qua bên thứ 3)
      // unstable   = tiêu chí "độ ổn định schema" ở mức 3đ (đang phát triển, go-live tương lai)
      // Cả hai đều đẩy thẳng KS_HT3 — không cộng điểm, vì một mình nó đã đủ biến nguồn
      // thành ngoại lệ không cam kết giá cố định được.
      const { has_doc = false, dba_ok = false, blocked = false, unstable = false } = input
      if (blocked || unstable) return out("KS_HT3")
      if (has_doc && dba_ok) return out("KS_HT1")
      return out("KS_HT2")
    }

    case "ho_tro": {
      const { muc_do = "nhe" } = input
      return out(muc_do === "sat_sao" ? "HOTRO2" : "HOTRO1")
    }

    case "ks_bang":
      return out("KS_BANG")

    case "tq_ng": {
      // Trục chi phí là ĐÃ KẾT NỐI DB HAY CHƯA, không phải số bảng — kiểm tra tổng quan
      // (đếm sheet/bảng, đối chiếu domain) tốn công như nhau dù hệ thống nhỏ hay lớn;
      // chỉ tốn thêm khi phải tự tìm cách lấy dữ liệu vì chưa có kết nối.
      const { connected = true } = input
      return out(connected ? "TQ_NG1" : "TQ_NG2")
    }

    case "brz": {
      const { fields = 0, doc_match, self_describing } = input
      if (![1, 2, 3].includes(doc_match)) {
        throw new Error(`doc_match phải 1/2/3 (tài liệu kế thừa được sau rà soát): ${doc_match}`)
      }
      if (![1, 2, 3].includes(self_describing)) {
        throw new Error(`self_describing phải 1/2/3 (cấu trúc có tự mô tả): ${self_describing}`)
      }
      const muc = bronzeMuc(doc_match, self_describing)
      const band = fieldBand(fields)
      // >120 field: tách thành 2 dòng để người duyệt thấy khối lượng thật
      return out(`BRZ_${muc}_${band}`, band === 5 ? 2 : 1)
    }

    case "gov": {
      // pham_vi là KHAI BÁO phạm vi (SOW), không phải điểm độ khó mình tự chấm.
      // 0 → vẫn trả mã nhẹ nhất kèm out_of_scope: giữ dòng trong hồ sơ, MH = 0,
      // để người đọc thấy đã loại cái gì (Điều 4) thay vì dòng biến mất.
      const { doi_tuong, pham_vi } = input
      const base = GOV_DOI_TUONG[doi_tuong]
      if (!base) {
        throw new Error(
          `doi_tuong phải thuộc: ${Object.keys(GOV_DOI_TUONG).join(" · ")} — nhận: ${doi_tuong}`
        )
      }
      if (![0, 1, 2].includes(pham_vi)) {
        throw new Error(`pham_vi phải 0/1/2 (ngoài PV · tham gia · thiết kế): ${pham_vi}`)
      }
      if (pham_vi === 0) return { ...out(`${base}_1`), out_of_scope: true }
      return out(`${base}_${pham_vi}`)
    }

    case "pii_bang": {
      const { fields = 0, pii_fields = 0 } = input
      if (pii_fields <= 0) {
        throw new Error("pii_bang chỉ dùng cho bảng có ≥1 field PII — pii_fields phải > 0")
      }
      if (fields <= 0) throw new Error("pii_bang cần fields > 0 để tính tỷ lệ")
      const ty_le = pii_fields / fields
      const band = PII_BANDS.findIndex((t) => ty_le <= t)
      return out(`PII_B${band === -1 ? PII_BANDS.length + 1 : band + 1}`)
    }

    case "slv": {
      const { src_tables = 1, cols = 0, data_vault = false } = input
      if (data_vault) return out("SLV_DV")
      if (src_tables > 5) return out("SLV4")
      if (src_tables >= 3) return out("SLV3")
      if (src_tables === 2 || cols > 25) return out("SLV2")
      return out("SLV1")
    }

    case "gld_dim": {
      const { attrs = 0, scd2 = false } = input
      return out(attrs > 20 || scd2 ? "GLD_DIM2" : "GLD_DIM1")
    }

    case "gld_fct": {
      const { measures = 0, dims = 0, grain_unclear = false } = input
      if (grain_unclear || measures > 15 || dims > 8) {
        return { ...out("GLD_FCT3"), open_question: grain_unclear }
      }
      if (measures > 5 || dims > 4) return out("GLD_FCT2")
      return out("GLD_FCT1")
    }

    case "gld_dm": {
      const { metrics = 0 } = input
      return out(metrics > 10 ? "GLD_DM2" : "GLD_DM1")
    }

    case "gld_kpi":
      return out("GLD_KPI")

    case "erd": {
      // Trục chi phí là MỨC ĐỘ KHÓ của nguồn (Điều 9.1, 1-4), không phải số bảng/nhóm —
      // vẽ ERD cho một nguồn tốn công theo việc hiểu quan hệ giữa các bảng khó hay dễ,
      // không theo số lượng bảng. Một nguồn = một dòng, bất kể có bao nhiêu nhóm nghiệp vụ.
      const { muc } = input
      if (![1, 2, 3, 4].includes(muc)) {
        throw new Error(`muc phải 1/2/3/4 (độ khó nguồn — khớp Điều 9.1 brz): ${muc}`)
      }
      return out(`ERD${muc}`)
    }

    case "logic": {
      const { steps = 0 } = input
      if (steps <= 10) return out("LOGIC1")
      if (steps <= 25) return out("LOGIC2")
      return out("LOGIC3")
    }

    case "map": {
      const { rows = 0 } = input
      if (rows <= 300) return out("MAP1")
      if (rows <= 1000) return out("MAP2")
      return out("MAP3")
    }

    case "bc_bg": {
      const { multi_source = false } = input
      return out(multi_source ? "BC_BG2" : "BC_BG1")
    }

    default:
      throw new Error(`kind không trong catalog: ${kind}`)
  }
}

export { fieldBand, bronzeMuc, GOV_DOI_TUONG }
