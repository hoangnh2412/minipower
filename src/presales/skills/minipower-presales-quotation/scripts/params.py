"""Nguồn chân lý DUY NHẤT cho tham số báo giá + công thức dẫn xuất.

to_xlsx.py và from_xlsx.py cùng import file này, nên Excel và bản đọc ngược
không bao giờ lệch định nghĩa.

Thứ tự ưu tiên khi lấy giá trị:  mặc định  <  estimate JSON  <  --set trên CLI
"""

# name (vùng đặt tên Excel) · key · diễn giải · mặc định · number_format · nhóm
PARAMS = [
    ("GIA_MODE", "gia_mode", "Cách tính giá — mm | gia_von", "mm", None, "Chung"),
    ("MH_PER_MD", "mh_per_md", "Giờ công / ngày công", 8, "0.0", "Chung"),
    ("SO_THANG", "so_thang", "Số tháng dự án", 4, "0", "Chung"),
    ("TIEN_TE", "tien_te", "Tiền tệ", "VND", None, "Chung"),

    ("AUTO_1", "auto_1", "auto_pct mức 1 (có DDL)", 0.65, "0%", "Tự động hoá"),
    ("AUTO_2", "auto_2", "auto_pct mức 2 (có phiếu)", 0.30, "0%", "Tự động hoá"),
    ("AUTO_3", "auto_3", "auto_pct mức 3 (tự mô tả, không tài liệu)", 0.45, "0%", "Tự động hoá"),
    ("AUTO_4", "auto_4", "auto_pct mức 4 (không tự mô tả, không tài liệu)", 0.05, "0%", "Tự động hoá"),

    ("MD_NAM", "md_nam", "MD danh nghĩa / năm", 260, "0", "Năng lực"),
    ("NGAY_LE", "ngay_le", "Trừ nghỉ lễ (ngày)", 11, "0", "Năng lực"),
    ("NGAY_PHEP", "ngay_phep", "Trừ phép năm (ngày)", 12, "0", "Năng lực"),
    ("UTILIZATION", "utilization", "Utilization — tỷ lệ ngày bán được", 0.80, "0%", "Năng lực"),

    ("DON_GIA_MM", "don_gia_mm", "Đơn giá bán / man-month", None, "#,##0", "Giá · mode mm"),

    ("LUONG_THANG", "luong_thang", "Lương gross / tháng", None, "#,##0", "Giá · mode gia_von"),
    ("THANG_LUONG", "thang_luong", "Số tháng lương / năm", 13, "0.0", "Giá · mode gia_von"),
    ("BAO_HIEM_PCT", "bao_hiem_pct", "Bảo hiểm + phí DN (% lương)", 0.235, "0.0%", "Giá · mode gia_von"),
    ("OVERHEAD_PCT", "overhead_pct", "Overhead (% chi phí nhân sự)", 0.40, "0%", "Giá · mode gia_von"),
    ("MARGIN_PCT", "margin_pct", "Margin trên giá bán", 0.20, "0%", "Giá · mode gia_von"),
]

BY_KEY = {key: row for row in PARAMS for key in (row[1],)}
MODES = ("mm", "gia_von")

# ---- giai đoạn — 3 chặng Discovery → Design → Delivery ------------------
# Khớp khung chung minipower (stage discovery/.../delivery, xem contracts/pack-manifest.md).
# Discovery và Design chốt giá riêng (xem §4 hướng dẫn). Delivery là chặng hỗ trợ NHẸ
# sau khi bàn giao — đội DE tự triển khai, mình chỉ follow-support, không thiết kế lại.
PHASES_GIAI_DOAN = ("discovery", "design", "delivery")

PHASE_BY_KIND = {
    "ks_ht": "discovery",
    "ks_bang": "discovery",
    "tq_ng": "discovery",
    "brz": "design",
    "slv": "design",
    "gld_dim": "design",
    "gld_fct": "design",
    "gld_dm": "design",
    "gld_kpi": "design",
    "erd": "design",
    "logic": "design",
    "map": "design",
    "bc_bg": "design",
    "gov": "design",
    "pii_bang": "design",
    "dq": "design",
    "dcat": "design",
    "gloss": "discovery",
    "ho_tro": "delivery",
}

PHASE_NEN = {  # hạng mục nền thuộc chặng nào
    "KHUNG": "design", "PPL": "design", "PII_FW": "design",
    "QUYDOI": "design", "GOV": "discovery", "GLOSS": "discovery",
    "HOP": "design",
}


KINDS = tuple(PHASE_BY_KIND)  # danh sách kind hợp lệ — suy từ bảng giai đoạn


def phase_of(kind, override=None):
    if override:
        o = str(override).strip().lower()
        if o not in PHASES_GIAI_DOAN:
            raise SystemExit(f"phase phải là {' | '.join(PHASES_GIAI_DOAN)}, nhận: {override!r}")
        return o
    return PHASE_BY_KIND.get(kind, "design")


# ---- v2: vai trò --------------------------------------------------------
# don_gia_mm / luong_thang là mức NỀN của vai trò BA; vai trò khác nhân hệ số.
ROLES = [
    ("BA", "Business Analyst — khảo sát, đặc tả", 1.00),
    ("DM", "Data Modeler — thiết kế mô hình", 1.00),
    ("DA", "Data Architect — kiến trúc, chuẩn, review", 1.30),
    ("PM", "Điều phối, workshop, stakeholder", 1.15),
]
ROLE_HESO = {code: he_so for code, _, he_so in ROLES}
ROLE_LABEL = {code: label for code, label, _ in ROLES}
DEFAULT_ROLE = "BA"


def role_of(v=None):
    if not v:
        return DEFAULT_ROLE
    r = str(v).strip().upper()
    if r not in ROLE_HESO:
        raise SystemExit(f"vai_tro phải là {' | '.join(ROLE_HESO)}, nhận: {v!r}")
    return r


# ---- Nhóm công việc — gom dòng mục để đọc theo khối, dùng chung cho cả hai script.
# Thứ tự ở đây QUYẾT ĐỊNH thứ tự nhóm trong 03-DONGMUC (sort theo nhóm) và trong báo cáo.
# Mỗi nhóm là (nhãn, predicate) — predicate(kind, code) -> bool. Phần lớn nhóm chỉ cần
# kind; "Quản trị dữ liệu" / "Bảo vệ dữ liệu" tách từ CÙNG kind `gov` theo tiền tố mã
# (GOV_* vs BVD_*) vì hai việc khác bản chất (chính sách chung vs PII/bảo vệ cụ thể).
def _by_kind(*kinds):
    return lambda kind, code: kind in kinds


# Thứ tự khớp Phần II "Chi tiết công việc" của báo cáo (xem from_xlsx.py): 9 nhóm đầu là
# II.2 "Hạng mục theo nhóm công việc". "Báo cáo & bàn giao" / "Hỗ trợ triển khai" tách thành
# II.3 / II.4 riêng, không nằm trong bảng "theo nhóm công việc" — nhưng vẫn ở trong
# WORK_GROUPS để 03-DONGMUC sort đúng thứ tự.
# "Tổng quan nguồn" gộp chung với "ERD & logic nghiệp vụ" thành "Tổng hợp thông tin nguồn";
# "Mapping source → target" gộp vào "Thiết kế tầng Bronze" (cùng công đoạn thiết kế Bronze).
# "Từ điển thuật ngữ dữ liệu" (`kind=gloss`) tính vào cấu phần "Gói theo nguồn" (I.1.2),
# KHÔNG phải "Phí khung" — trước đây là hạng mục nền GLOSS, đã chuyển thành dòng mục thật.
WORK_GROUPS = [
    ("Khảo sát nguồn", _by_kind("ks_ht", "ks_bang")),
    ("Tổng hợp thông tin nguồn", _by_kind("tq_ng", "erd", "logic")),
    ("Thiết kế tầng Bronze", _by_kind("brz", "map")),
    ("Thiết kế tầng Silver", _by_kind("slv")),
    ("Thiết kế tầng Gold", _by_kind("gld_dim", "gld_fct", "gld_dm", "gld_kpi")),
    ("Quản trị dữ liệu (Data Governance)",
     lambda kind, code: kind == "gov" and str(code).startswith("GOV_")),
    ("Bảo vệ dữ liệu (PII)",
     lambda kind, code: kind == "pii_bang" or (kind == "gov" and str(code).startswith("BVD_"))),
    ("Chất lượng dữ liệu (Data Quality)", _by_kind("dq")),
    ("Từ điển thuật ngữ dữ liệu (Data Glossary)", _by_kind("gloss")),
    ("Danh mục tài sản dữ liệu (Data Catalog)", _by_kind("dcat")),
    ("Báo cáo & bàn giao", _by_kind("bc_bg")),
    ("Hỗ trợ triển khai (Delivery)", _by_kind("ho_tro")),
]
GROUP_KHAC = "Khác"

# Nhãn nhóm tách riêng khỏi bảng "Hạng mục theo nhóm công việc" (II.2) để làm mục II.3/II.4
# riêng trong báo cáo — xem from_xlsx.py.
GROUP_BAOCAO_LABEL = "Báo cáo & bàn giao"
GROUP_HOTRO_LABEL = "Hỗ trợ triển khai (Delivery)"


def _group_idx(kind, code):
    for i, (_, pred) in enumerate(WORK_GROUPS):
        if pred(kind, code):
            return i
    return len(WORK_GROUPS)


def group_index(kind, code=None):
    """Thứ tự nhóm (0-based) của một dòng; không khớp nhóm nào xếp cuối ('Khác')."""
    return _group_idx(kind, code)


def group_label(kind, code=None):
    idx = _group_idx(kind, code)
    return WORK_GROUPS[idx][0] if idx < len(WORK_GROUPS) else GROUP_KHAC


def group_lines(lines):
    """[(tên nhóm, [dòng], Σ MH)] — giữ thứ tự WORK_GROUPS; dòng lạ gom vào 'Khác'."""
    seen, out = set(), []
    for label, pred in WORK_GROUPS:
        g = [l for l in lines if pred(l["kind"], l.get("code"))]
        if g:
            seen.update(id(l) for l in g)
            out.append((label, g, sum(l["mh"] for l in g)))
    rest = [l for l in lines if id(l) not in seen]
    if rest:
        out.append((GROUP_KHAC, rest, sum(l["mh"] for l in rest)))
    return out


# ---- Layout sheet 03-DONGMUC — dùng chung cho cả hai script -------------
# STT là text "N.M" (N = thứ tự nhóm, M = thứ tự trong nhóm) — tính tự động khi xuất
# Excel (to_xlsx.py), KHÔNG nhập tay. "Nhóm công việc" cũng tự suy từ `kind`, chỉ để đọc.
LINE_COLS = [
    ("STT", 8, "@"),
    ("Nhóm công việc", 26, None),
    ("Hạng mục", 38, None),
    ("Nguồn", 11, None),
    ("kind", 9, None),
    ("Mã", 11, None),
    ("Giai đoạn", 11, None),
    ("Vai trò", 8, None),
    ("SL", 7, "#,##0"),
    ("reuse_pct", 9, "0%"),
    ("auto_pct", 9, "0%"),
    ("adjust_pct", 9, "0%"),
    ("Ngoại lệ", 9, None),
    ("Ngoài PV", 9, None),
]

ADDER_ORDER = [
    "PII_F", "CDC_OQ", "GRAIN", "ENUM", "FK", "FIRST", "ROUND", "EXPORT", "SOFT_RULE", "NEST_DEEP",
]

CALC_COLS = [
    ("MH gốc", 11, "#,##0.00"),
    ("MH adder", 11, "#,##0.00"),
    ("MH", 12, "#,##0.00"),
    ("MD", 10, "#,##0.0"),
    ("tt", 9, "#,##0.0"),
    ("pt", 9, "#,##0.0"),
    ("xn", 9, "#,##0.0"),
]

GHI_CHU_COL = ("Căn cứ / Ghi chú", 44, None)

# Chỉ số cột (1-based) — suy ra, đừng hardcode ở nơi khác
# Chỉ số cột suy từ TÊN cột trong LINE_COLS — thêm/bớt cột ở đó không làm lệch số thủ công.
_H = {name: i + 1 for i, (name, _, _) in enumerate(LINE_COLS)}
C_STT = _H["STT"]
C_HM = _H["Hạng mục"]
C_GRP = _H["Nhóm công việc"]
C_NG = _H["Nguồn"]
C_KIND = _H["kind"]
C_CODE = _H["Mã"]
C_GIAIDOAN = _H["Giai đoạn"]
C_VAITRO = _H["Vai trò"]
C_QTY = _H["SL"]
C_REUSE = _H["reuse_pct"]
C_AUTO = _H["auto_pct"]
C_ADJ = _H["adjust_pct"]
C_LE = _H["Ngoại lệ"]
C_PV = _H["Ngoài PV"]
C_ADD0 = len(LINE_COLS) + 1
C_ADD_LAST = C_ADD0 + len(ADDER_ORDER) - 1
C_GOC = C_ADD_LAST + 1
C_ADD_MH = C_GOC + 1
C_MH = C_GOC + 2
C_MD = C_GOC + 3
C_TT = C_GOC + 4
C_GHI = C_GOC + len(CALC_COLS)

HEADERS = (
    [h for h, _, _ in LINE_COLS] + ADDER_ORDER
    + [h for h, _, _ in CALC_COLS] + [GHI_CHU_COL[0]]
)


def defaults():
    return {key: default for _, key, _, default, _, _ in PARAMS}


def parse_value(raw):
    """'80%' -> 0.8 · '40000000' -> 40000000.0 · 'mm' -> 'mm'"""
    s = str(raw).strip()
    if s.lower() in ("none", "null", ""):
        return None
    if s.endswith("%"):
        try:
            return float(s[:-1].replace(",", ".").replace("_", "")) / 100
        except ValueError:
            pass
    try:
        return float(s.replace("_", "").replace(" ", ""))
    except ValueError:
        return s


def parse_set(pairs):
    """['utilization=70%', 'gia_mode=gia_von'] -> dict, báo lỗi key lạ."""
    out = {}
    for p in pairs or []:
        if "=" not in p:
            raise SystemExit(f"--set phải dạng key=value, nhận: {p!r}")
        k, v = p.split("=", 1)
        k = k.strip()
        if k not in BY_KEY:
            raise SystemExit(
                f"tham số không có: {k!r}\ndanh sách hợp lệ: " + ", ".join(BY_KEY)
            )
        out[k] = parse_value(v)
    return out


def resolve(est_params=None, overrides=None):
    p = defaults()
    p.update({k: v for k, v in (est_params or {}).items() if k in BY_KEY})
    p.update(overrides or {})
    mode = str(p.get("gia_mode") or "mm").strip().lower()
    if mode not in MODES:
        raise SystemExit(f"gia_mode phải là {' | '.join(MODES)}, nhận: {mode!r}")
    p["gia_mode"] = mode
    return p


def num(v, default=0.0):
    if v is None or v == "":
        return default
    if isinstance(v, str):
        if v.startswith("="):
            return default
        v = v.replace(",", ".").strip()
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def quydoi(p):
    """Năng lực: 1 man-month giao được bao nhiêu ngày công THỰC."""
    md_kha_dung = num(p.get("md_nam")) - num(p.get("ngay_le")) - num(p.get("ngay_phep"))
    md_ban_duoc = md_kha_dung * num(p.get("utilization"))
    return {
        "md_kha_dung": md_kha_dung,
        "md_ban_duoc": md_ban_duoc,
        "md_per_mm": md_ban_duoc / 12 if md_ban_duoc else 0.0,
    }


def giavon(p, q):
    """Giá vốn/MD từ lương. Trả None khi chưa có lương."""
    luong = num(p.get("luong_thang"))
    if not luong or not q["md_ban_duoc"]:
        return None
    cp_nhan_su = luong * num(p.get("thang_luong")) * (1 + num(p.get("bao_hiem_pct")))
    overhead = cp_nhan_su * num(p.get("overhead_pct"))
    cp_tong = cp_nhan_su + overhead
    gia_von_md = cp_tong / q["md_ban_duoc"]
    return {
        "cp_nhan_su": cp_nhan_su,
        "overhead": overhead,
        "cp_tong": cp_tong,
        "gia_von_md": gia_von_md,
        "gia_von_mm": gia_von_md * q["md_per_mm"],
    }


def price(p, md_by_pr, q, gv):
    """md_by_pr = {(giai_doan, vai_tro): Σ MD} -> tiền, tách theo chặng và vai trò.

    Mode `mm`: `don_gia_mm` là đơn giá BÌNH QUÂN mục tiêu trên toàn cơ cấu vai trò
    của dự án — không phải mức nền riêng vai trò nào. Suy ngược mức nền
    (`nen_mm`, tương ứng hệ số 1.00) từ bình quân này rồi mới nhân ROLE_HESO
    cho từng vai trò, để Σ Giá bán ÷ Σ MM khớp đúng `don_gia_mm` đã nhập.
    Trả dict không có 'gia_ban' khi thiếu đầu vào của mode đang chọn.
    """
    mode = p["gia_mode"]
    mpm = q["md_per_mm"]
    md_tong = sum(md_by_pr.values())
    mm_tong = md_tong / mpm if mpm else 0.0
    out = {"mm": mm_tong, "md_per_mm": mpm, "gia_mode": mode}

    don_gia_mm_input = num(p.get("don_gia_mm"), None)
    margin_pct = num(p.get("margin_pct"))
    if mode == "gia_von" and margin_pct >= 1:
        raise SystemExit("margin_pct phải < 1")
    if (mode == "mm" and not don_gia_mm_input) or (mode == "gia_von" and not gv):
        return out

    weighted_heso = None
    nen_mm = None
    if mode == "mm" and md_tong:
        weighted_heso = sum(md * ROLE_HESO[vt] for (_, vt), md in md_by_pr.items()) / md_tong
        nen_mm = don_gia_mm_input / weighted_heso if weighted_heso else None

    rows = []
    for (giai_doan, vai_tro), md in sorted(md_by_pr.items()):
        if not md:
            continue
        he_so = ROLE_HESO[vai_tro]
        mm = md / mpm if mpm else 0.0
        if mode == "mm":
            don_gia = nen_mm * he_so
            chi_phi = None
            gia = mm * don_gia
        else:
            don_gia = None
            chi_phi = md * gv["gia_von_md"] * he_so
            gia = chi_phi / (1 - margin_pct)
        rows.append(
            {
                "giai_doan": giai_doan,
                "vai_tro": vai_tro,
                "he_so": he_so,
                "md": md,
                "mm": mm,
                "don_gia_mm": don_gia,
                "chi_phi": chi_phi,
                "gia_ban": gia,
            }
        )

    gia_ban = sum(r["gia_ban"] for r in rows)
    out["rows"] = rows
    out["theo_giai_doan"] = {
        gd: {
            "md": sum(r["md"] for r in rows if r["giai_doan"] == gd),
            "mm": sum(r["mm"] for r in rows if r["giai_doan"] == gd),
            "gia_ban": sum(r["gia_ban"] for r in rows if r["giai_doan"] == gd),
        }
        for gd in PHASES_GIAI_DOAN
        if any(r["giai_doan"] == gd for r in rows)
    }
    out["theo_vai_tro"] = {
        vt: {
            "md": sum(r["md"] for r in rows if r["vai_tro"] == vt),
            "mm": sum(r["mm"] for r in rows if r["vai_tro"] == vt),
            "gia_ban": sum(r["gia_ban"] for r in rows if r["vai_tro"] == vt),
        }
        for vt in ROLE_HESO
        if any(r["vai_tro"] == vt for r in rows)
    }

    if mode == "gia_von":
        chi_phi_tong = sum(r["chi_phi"] for r in rows)
        out.update(
            {
                "chi_phi": chi_phi_tong,
                "margin_pct": margin_pct,
                "margin": gia_ban - chi_phi_tong,
                "rate_md": gv["gia_von_md"],
            }
        )
    else:
        out["rate_md"] = don_gia_mm_input / mpm if mpm else 0.0
        out["weighted_heso"] = weighted_heso
        out["nen_mm"] = nen_mm

    out["don_gia_mm"] = gia_ban / mm_tong if mm_tong else 0.0  # đơn giá bình quân thực tế
    out["gia_ban"] = gia_ban
    out["rom_lo"] = gia_ban * 0.9
    out["rom_hi"] = gia_ban * 1.1

    if gv and out["don_gia_mm"]:
        out["gia_von_mm"] = gv["gia_von_mm"]
        out["margin_thuc"] = 1 - gv["gia_von_mm"] / out["don_gia_mm"]
    return out
