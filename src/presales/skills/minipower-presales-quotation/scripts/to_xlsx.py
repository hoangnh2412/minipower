#!/usr/bin/env python3
"""estimate-dmba JSON -> workbook XLSX có công thức sống.

Công thức nằm trong Excel, không bake số: sửa tham số / catalog là tổng tự tính lại.
Neo cố định để from_xlsx.py đọc ngược: header dòng 5 mọi sheet dữ liệu.
"""

import argparse
import json
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

import params as P
from params import ADDER_ORDER, CALC_COLS, LINE_COLS

SKILL_DIR = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = SKILL_DIR / "catalog" / "dmba-default.json"

HEADER_ROW = 5
DATA_ROW = 6
HELPER_ROW = 4
MAX_LINES = 2000

C_TITLE = "1F3864"
C_HEAD = "2F5597"
C_INPUT = "FFF2CC"
C_CALC = "E2EFDA"
C_HELP = "F2F2F2"

THIN = Side(style="thin", color="BFBFBF")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def head_font():
    return Font(name="Calibri", size=10, bold=True, color="FFFFFF")


def body_font():
    return Font(name="Calibri", size=10)


def title_cell(ws, text, width=8):
    c = ws.cell(row=1, column=1, value=text)
    c.font = Font(name="Calibri", size=13, bold=True, color=C_TITLE)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=width)


def note_cell(ws, text, width=8):
    c = ws.cell(row=2, column=1, value=text)
    c.font = Font(name="Calibri", size=9, italic=True, color="808080")
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=width)


def write_header(ws, headers, row=HEADER_ROW):
    fill = PatternFill("solid", fgColor=C_HEAD)
    for i, h in enumerate(headers, start=1):
        c = ws.cell(row=row, column=i, value=h)
        c.font = head_font()
        c.fill = fill
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
    ws.row_dimensions[row].height = 30


def sheet_thamso(wb, resolved, est, cat):
    """Mọi tham số NHẬP TAY nằm ở đây, nhóm theo P.PARAMS. Sheet khác chỉ dẫn xuất."""
    ws = wb.create_sheet("00-THAMSO")
    title_cell(ws, "Tham số báo giá — DMBA", 5)
    note_cell(
        ws,
        "Sửa cột D. Mọi sheet khác tham chiếu tên vùng ở đây — không sửa cột A/B. "
        "Truyền lúc chạy: to_xlsx.py --set key=value (xem --list-params).",
        5,
    )
    write_header(ws, ["Tên vùng", "Khoá", "Diễn giải", "Giá trị", "Ghi chú"])

    HINT = {
        "gia_mode": "mm = bán theo đơn giá man-month · gia_von = dựng từ lương rồi cộng margin",
        "don_gia_mm": "giá bán, đã gồm margin + overhead → mode mm KHÔNG cộng margin nữa",
        "utilization": "tỷ lệ ngày thật giao được; đổi thẳng vào giá",
        "overhead_pct": "% trên chi phí nhân sự (chỗ làm · thiết bị · license · quản lý)",
        "margin_pct": "margin TRÊN GIÁ BÁN — chia (1−margin), không phải nhân 1,2",
        "md_nam": "52 tuần × 5 ngày; chưa trừ lễ/phép",
    }

    r = DATA_ROW
    nhom_truoc = None
    for name, key, label, default, fmt, nhom in P.PARAMS:
        if nhom != nhom_truoc:
            c = ws.cell(row=r, column=1, value=nhom)
            c.font = Font(size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor=C_HEAD)
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
            nhom_truoc = nhom
            r += 1
        ws.cell(row=r, column=1, value=name).font = Font(
            name="Consolas", size=9, color="7F7F7F"
        )
        ws.cell(row=r, column=2, value=key).font = body_font()
        ws.cell(row=r, column=3, value=label).font = body_font()
        c = ws.cell(row=r, column=4, value=resolved.get(key, default))
        c.font = Font(name="Calibri", size=10, bold=True)
        c.fill = PatternFill("solid", fgColor=C_INPUT)
        c.number_format = fmt or "General"
        c.border = BOX
        wb.defined_names.add(DefinedName(name, attr_text=f"'00-THAMSO'!$D${r}"))
        if key == "gia_mode":
            row_mode = r
        if key in HINT:
            ws.cell(row=r, column=5, value=HINT[key]).font = Font(
                size=9, italic=True, color="808080"
            )
        r += 1

    dv = DataValidation(type="list", formula1='"' + ",".join(P.MODES) + '"', allow_blank=False)
    ws.add_data_validation(dv)
    dv.add(f"$D${row_mode}")

    r += 1
    for label, val in (
        ("Dự án", est.get("du_an", "")),
        ("Khách hàng", est.get("khach_hang", "")),
        ("Người lập", est.get("nguoi_lap", "")),
        ("Ngày", est.get("ngay", "")),
        ("Catalog", f"{cat['catalog_id']} v{cat['version']}"),
    ):
        ws.cell(row=r, column=1, value=label).font = Font(size=10, bold=True)
        ws.cell(row=r, column=4, value=val).font = body_font()
        r += 1

    for col, w in zip("ABCDE", (14, 14, 34, 18, 62)):
        ws.column_dimensions[col].width = w
    return ws


def _derive_sheet(wb, name, title, note, rows, formulas, highlight, hints=()):
    """Sheet chỉ chứa ô DẪN XUẤT (không nhập tay) — dùng chung cho 06 và 07."""
    ws = wb.create_sheet(name)
    title_cell(ws, title, 4)
    note_cell(ws, note, 4)
    write_header(ws, ["", "Khoá", "Diễn giải", "Giá trị"])

    at = {key: DATA_ROW + i for i, (key, _, _) in enumerate(rows)}
    for key, label, fmt in rows:
        r = at[key]
        last = key == highlight
        ws.cell(row=r, column=2, value=key).font = body_font()
        ws.cell(row=r, column=3, value=label).font = Font(size=10, bold=last)
        c = ws.cell(row=r, column=4, value=formulas(at)[key])
        c.number_format = fmt
        c.font = Font(size=11 if last else 10, bold=last)
        c.fill = PatternFill("solid", fgColor="FFE699" if last else C_CALC)
        c.border = BOX

    r = DATA_ROW + len(rows) + 1
    for line in hints:
        c = ws.cell(row=r, column=1, value=line)
        c.font = Font(size=9, italic=True, color="808080")
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        ws.row_dimensions[r].height = 26
        r += 1

    for col, w in zip("ABCD", (4, 16, 52, 20)):
        ws.column_dimensions[col].width = w
    return ws, at


def sheet_quydoi(wb):
    rows = [
        ("md_kha_dung", "MD khả dụng / năm = MD danh nghĩa − lễ − phép", "0.0"),
        ("md_ban_duoc", "MD bán được / năm = khả dụng × utilization", "0.0"),
        ("md_per_mm", "MD bán được / man-month = ÷ 12", "0.00"),
    ]
    F = lambda at: {  # noqa: E731
        "md_kha_dung": "=MD_NAM-NGAY_LE-NGAY_PHEP",
        "md_ban_duoc": f"=$D${at['md_kha_dung']}*UTILIZATION",
        "md_per_mm": f"=$D${at['md_ban_duoc']}/12",
    }
    ws, at = _derive_sheet(
        wb,
        "06-QUYDOI",
        "Năng lực — quy đổi man-month ↔ ngày công",
        "Ước lượng ra ngày công THỰC LÀM. 1 MM không bằng 21,7 ngày: trừ lễ, phép "
        "rồi nhân utilization mới ra số ngày thật giao được.",
        rows,
        F,
        "md_per_mm",
        (
            "260/12 = 21,7 là ngày thường trên lịch. Dùng số đó làm mẫu số là tự nhận "
            "mỗi người giao được 21,7 ngày hữu ích mỗi tháng — không lễ, không phép, "
            "không họp, không chờ SME.",
        ),
    )
    for nm, key in (("MD_BAN_DUOC", "md_ban_duoc"), ("MD_PER_MM", "md_per_mm")):
        wb.defined_names.add(DefinedName(nm, attr_text=f"'06-QUYDOI'!$D${at[key]}"))
    return ws


def sheet_giavon(wb):
    rows = [
        ("cp_nhan_su", "Chi phí nhân sự / năm = lương × số tháng × (1 + bảo hiểm)", "#,##0"),
        ("overhead", "Overhead = chi phí nhân sự × overhead_pct", "#,##0"),
        ("cp_tong", "Tổng chi phí / người / năm", "#,##0"),
        ("gia_von_md", "Giá vốn / MD = tổng chi phí ÷ MD bán được", "#,##0"),
        ("gia_von_mm", "Giá vốn / man-month", "#,##0"),
    ]
    F = lambda at: {  # noqa: E731
        "cp_nhan_su": "=LUONG_THANG*THANG_LUONG*(1+BAO_HIEM_PCT)",
        "overhead": f"=$D${at['cp_nhan_su']}*OVERHEAD_PCT",
        "cp_tong": f"=$D${at['cp_nhan_su']}+$D${at['overhead']}",
        "gia_von_md": f'=IFERROR($D${at["cp_tong"]}/MD_BAN_DUOC,"")',
        "gia_von_mm": f'=IFERROR($D${at["gia_von_md"]}*MD_PER_MM,"")',
    }
    ws, at = _derive_sheet(
        wb,
        "07-GIAVON",
        "Giá vốn — dựng từ lương",
        "Chỉ lái giá khi gia_mode = gia_von. Ở mode mm, sheet này vẫn tính để đối chiếu "
        "margin thực của đơn giá đang bán.",
        rows,
        F,
        "gia_von_md",
        (
            "Để trống LUONG_THANG thì sheet này ra rỗng — mode mm vẫn chạy bình thường.",
        ),
    )
    wb.defined_names.add(
        DefinedName("GIA_VON_MD", attr_text=f"'07-GIAVON'!$D${at['gia_von_md']}")
    )
    wb.defined_names.add(
        DefinedName("GIA_VON_MM", attr_text=f"'07-GIAVON'!$D${at['gia_von_mm']}")
    )
    return ws


def sheet_catalog(wb, cat):
    ws = wb.create_sheet("01-CATALOG")
    title_cell(ws, "Catalog MH theo mã — công tay, chưa trừ tự động hoá", 5)
    note_cell(ws, "Sửa tt / pt / xn để hiệu chỉnh. Cột Σ là công thức.", 5)
    write_header(ws, ["Mã", "tt Thu thập", "pt Phân tích & TK", "xn Xác nhận & BG", "Σ / đơn vị"])

    for i, (code, row) in enumerate(cat["codes"].items()):
        r = DATA_ROW + i
        ws.cell(row=r, column=1, value=code).font = Font(name="Consolas", size=10)
        for j, ph in enumerate(("tt", "pt", "xn"), start=2):
            c = ws.cell(row=r, column=j, value=row[ph])
            c.number_format = "#,##0.00"
            c.fill = PatternFill("solid", fgColor=C_INPUT)
            c.border = BOX
        c = ws.cell(row=r, column=5, value=f"=SUM(B{r}:D{r})")
        c.number_format = "#,##0.00"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.font = Font(size=10, bold=True)
        c.border = BOX

    for col, w in zip("ABCDE", (14, 13, 17, 17, 13)):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = f"A{DATA_ROW}"
    return ws


def sheet_adder(wb, cat):
    ws = wb.create_sheet("02-ADDER")
    title_cell(ws, "Cộng thêm theo đặc tính — không trừ tự động hoá", 4)
    note_cell(ws, "Phán xét con người: PII, CDC, grain. Thứ tự dòng khớp cột L..T của 03-DONGMUC.", 4)
    write_header(ws, ["Mã", "MH / đơn vị", "Đơn vị", "Lý do tốn công"])

    for i, code in enumerate(ADDER_ORDER):
        a = cat["adders"][code]
        r = DATA_ROW + i
        ws.cell(row=r, column=1, value=code).font = Font(name="Consolas", size=10)
        c = ws.cell(row=r, column=2, value=a["mh"])
        c.number_format = "#,##0.00"
        c.fill = PatternFill("solid", fgColor=C_INPUT)
        c.border = BOX
        ws.cell(row=r, column=3, value=a["unit"]).font = body_font()
        ws.cell(row=r, column=4, value=a["why"]).font = body_font()

    for col, w in zip("ABCD", (14, 12, 26, 62)):
        ws.column_dimensions[col].width = w
    return ws


def sheet_dongmuc(wb, est, cat):
    ws = wb.create_sheet("03-DONGMUC")
    L = {i: get_column_letter(i) for i in range(1, P.C_GHI + 1)}

    title_cell(ws, "Dòng mục — gói theo nguồn", 10)
    note_cell(
        ws,
        "Vàng = nhập tay. Xanh = công thức/dẫn xuất, đừng sửa. Thêm dòng ở cuối rồi kéo công thức xuống. "
        "STT và Nhóm công việc tự suy từ kind khi xuất lại — sửa tay sẽ mất. "
        "Giai đoạn trống → suy từ kind; Vai trò trống → BA.",
        10,
    )

    ws.cell(row=HELPER_ROW, column=len(LINE_COLS), value="MH/đơn vị →").font = Font(
        size=9, italic=True, color="808080"
    )
    ws.cell(row=HELPER_ROW, column=len(LINE_COLS)).alignment = Alignment(horizontal="right")
    for j, code in enumerate(ADDER_ORDER):
        c = ws.cell(row=HELPER_ROW, column=P.C_ADD0 + j, value=f"='02-ADDER'!$B${DATA_ROW + j}")
        c.number_format = "#,##0.00"
        c.font = Font(size=9, italic=True, color="808080")
        c.fill = PatternFill("solid", fgColor=C_HELP)

    write_header(ws, P.HEADERS)

    # Sắp theo Nhóm công việc (thứ tự P.WORK_GROUPS); trong một nhóm giữ nguyên thứ tự
    # JSON gốc (sort ổn định) rồi đánh số phân cấp "N.M" — N = thứ tự nhóm, M = thứ tự
    # trong nhóm. Đây là cột hiển thị, KHÔNG phải ô nhập tay — sửa tay sẽ bị ghi đè lần sau.
    lines = sorted(est.get("lines", []),
                   key=lambda ln: P.group_index(ln.get("kind", ""), ln.get("code")))
    grp_count = {}
    for i, ln in enumerate(lines):
        r = DATA_ROW + i
        adders = ln.get("adders", {})
        kind = ln.get("kind", "")
        code = ln.get("code")
        g = P.group_index(kind, code)
        grp_count[g] = grp_count.get(g, 0) + 1
        stt = f"{g + 1}.{grp_count[g]}"
        # Khoá theo TÊN cột rồi phát ra đúng thứ tự LINE_COLS — đổi thứ tự cột ở đó
        # (vd. đảo Hạng mục/Nhóm công việc) không làm lệch dữ liệu ghi vào từng ô.
        field = {
            "STT": stt,
            "Hạng mục": ln.get("hang_muc", ""),
            "Nhóm công việc": P.group_label(kind, code),
            "Nguồn": ln.get("nguon", ""),
            "kind": kind,
            "Mã": ln.get("code", ""),
            "Giai đoạn": P.phase_of(kind, ln.get("giai_doan")),
            "Vai trò": P.role_of(ln.get("vai_tro")),
            "SL": ln.get("qty", 1),
            "reuse_pct": ln.get("reuse_pct", 0),
            "auto_pct": ln.get("auto_pct", 0),
            "adjust_pct": ln.get("adjust_pct", 0),
            "Ngoại lệ": "x" if ln.get("ngoai_le") else "",
            "Ngoài PV": "x" if ln.get("out_of_scope") else "",
        }
        vals = [field[name] for name, _, _ in LINE_COLS]
        for j, v in enumerate(vals, start=1):
            c = ws.cell(row=r, column=j, value=v)
            c.font = body_font()
            # STT và Nhóm công việc là cột DẪN XUẤT (suy từ kind) — tô xanh như mọi ô
            # công thức khác để báo "đừng sửa tay", dù giá trị ở đây là chuỗi tĩnh.
            c.fill = PatternFill(
                "solid", fgColor=C_CALC if j in (P.C_STT, P.C_GRP) else C_INPUT
            )
            c.border = BOX
            c.number_format = LINE_COLS[j - 1][2] or "General"
            if j in (P.C_LE, P.C_PV):
                c.alignment = Alignment(horizontal="center")
        for j, code in enumerate(ADDER_ORDER):
            c = ws.cell(row=r, column=P.C_ADD0 + j, value=adders.get(code, 0) or None)
            c.font = body_font()
            c.fill = PatternFill("solid", fgColor=C_INPUT)
            c.border = BOX
            c.number_format = "#,##0"
        c = ws.cell(row=r, column=P.C_GHI, value=ln.get("ghi_chu", ""))
        c.font = body_font()
        c.alignment = Alignment(wrap_text=True, vertical="top")
        c.border = BOX

    last = DATA_ROW + max(len(lines), 1) - 1
    for r in range(DATA_ROW, last + 1):
        f = {
            P.C_GOC: f"=IFERROR(VLOOKUP(${L[P.C_CODE]}{r},'01-CATALOG'!$A:$E,5,FALSE)"
            f"*${L[P.C_QTY]}{r},\"\")",
            P.C_ADD_MH: f"=SUMPRODUCT(${L[P.C_ADD0]}{r}:${L[P.C_ADD_LAST]}{r},"
            f"${L[P.C_ADD0]}${HELPER_ROW}:${L[P.C_ADD_LAST]}${HELPER_ROW})",
            P.C_MH: f'=IF(${L[P.C_PV]}{r}="x",0,IFERROR((${L[P.C_GOC]}{r}'
            f"*(1-${L[P.C_REUSE]}{r})*(1-${L[P.C_AUTO]}{r})+${L[P.C_ADD_MH]}{r})"
            f"*(1+${L[P.C_ADJ]}{r}),\"\"))",
            P.C_MD: f'=IFERROR(${L[P.C_MH]}{r}/MH_PER_MD,"")',
            P.C_TT: f"=IFERROR(VLOOKUP(${L[P.C_CODE]}{r},'01-CATALOG'!$A:$E,2,FALSE)"
            f"*${L[P.C_QTY]}{r},\"\")",
            P.C_TT + 1: f"=IFERROR(VLOOKUP(${L[P.C_CODE]}{r},'01-CATALOG'!$A:$E,3,FALSE)"
            f"*${L[P.C_QTY]}{r},\"\")",
            P.C_TT + 2: f"=IFERROR(VLOOKUP(${L[P.C_CODE]}{r},'01-CATALOG'!$A:$E,4,FALSE)"
            f"*${L[P.C_QTY]}{r},\"\")",
        }
        for col, formula in f.items():
            c = ws.cell(row=r, column=col, value=formula)
            c.number_format = CALC_COLS[col - P.C_GOC][2]
            c.fill = PatternFill("solid", fgColor=C_CALC)
            c.border = BOX
            c.font = Font(size=10, bold=(col == P.C_MH))

    for j, (_, w, _) in enumerate(LINE_COLS, start=1):
        ws.column_dimensions[L[j]].width = w
    for j in range(P.C_ADD0, P.C_ADD_LAST + 1):
        ws.column_dimensions[L[j]].width = 8
    for j, (_, w, _) in enumerate(CALC_COLS, start=P.C_GOC):
        ws.column_dimensions[L[j]].width = w
    ws.column_dimensions[L[P.C_GHI]].width = P.GHI_CHU_COL[1]

    for formula1, rng in (
        ('"' + ",".join(P.KINDS) + '"', f"{L[P.C_KIND]}{DATA_ROW}:{L[P.C_KIND]}{MAX_LINES}"),
        ('"' + ",".join(P.PHASES_GIAI_DOAN) + '"',
         f"{L[P.C_GIAIDOAN]}{DATA_ROW}:{L[P.C_GIAIDOAN]}{MAX_LINES}"),
        ('"' + ",".join(P.ROLE_HESO) + '"',
         f"{L[P.C_VAITRO]}{DATA_ROW}:{L[P.C_VAITRO]}{MAX_LINES}"),
        ('"x"', f"{L[P.C_LE]}{DATA_ROW}:{L[P.C_PV]}{MAX_LINES}"),
    ):
        dv = DataValidation(type="list", formula1=formula1, allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(rng)

    ws.freeze_panes = f"{L[P.C_QTY]}{DATA_ROW}"
    ws.auto_filter.ref = f"A{HEADER_ROW}:{L[P.C_GHI]}{last}"
    return ws, {"mh": L[P.C_MH], "ngoai_le": L[P.C_LE], "ngoai_pv": L[P.C_PV],
                "giai_doan": L[P.C_GIAIDOAN], "vai_tro": L[P.C_VAITRO],
                "md": L[P.C_MD], "tt_idx": P.C_TT}


def sheet_nen(wb, est, cat):
    ws = wb.create_sheet("04-NEN")
    title_cell(ws, "Hạng mục nền — phí khung, tính một lần", 9)
    note_cell(ws, "Không phụ thuộc số nguồn. Công cụ tự động hoá/rà soát chất lượng/truy xuất tính ở mức dòng mục (adder FIRST, phase xn), không tính riêng ở đây.", 9)
    write_header(
        ws,
        ["Mã", "Hạng mục", "MH gốc", "Theo", "Số tháng", "MH tính",
         "Giai đoạn", "Vai trò", "Ghi chú"],
    )

    chosen = est.get("nen")
    if chosen is None:
        chosen = [{"code": k} for k in cat["nen"]]

    for i, item in enumerate(chosen):
        code = item["code"]
        row = cat["nen"][code]
        r = DATA_ROW + i
        per = row.get("per", "")
        ws.cell(row=r, column=1, value=code).font = Font(name="Consolas", size=10)
        ws.cell(row=r, column=2, value=row["ten"]).font = body_font()
        c = ws.cell(row=r, column=3, value=item.get("mh", row["mh"]))
        c.number_format = "#,##0.00"
        c.fill = PatternFill("solid", fgColor=C_INPUT)
        c.border = BOX
        ws.cell(row=r, column=4, value=per or "—").font = body_font()
        c = ws.cell(row=r, column=5, value="=SO_THANG" if per == "tháng" else None)
        c.number_format = "0"
        c.fill = PatternFill("solid", fgColor=C_CALC if per == "tháng" else C_HELP)
        c = ws.cell(row=r, column=6, value=f'=IF($D{r}="tháng",$C{r}*$E{r},$C{r})')
        c.number_format = "#,##0.00"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.font = Font(size=10, bold=True)
        c.border = BOX
        for col, val in (
            (7, item.get("giai_doan") or P.PHASE_NEN.get(code, "modeling")),
            (8, P.role_of(item.get("vai_tro"))),
        ):
            cc = ws.cell(row=r, column=col, value=val)
            cc.font = body_font()
            cc.fill = PatternFill("solid", fgColor=C_INPUT)
            cc.border = BOX
        ws.cell(row=r, column=9, value=item.get("ghi_chu", "")).font = body_font()

    last = DATA_ROW + max(len(chosen), 1) - 1
    for formula1, col in (
        ('"' + ",".join(P.PHASES_GIAI_DOAN) + '"', "G"),
        ('"' + ",".join(P.ROLE_HESO) + '"', "H"),
    ):
        dv = DataValidation(type="list", formula1=formula1, allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f"{col}{DATA_ROW}:{col}{last}")

    for col, w in zip("ABCDEFGHI", (12, 42, 11, 10, 10, 12, 12, 9, 30)):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = f"A{DATA_ROW}"
    return ws, last


def sheet_vaitro(wb, ref, nen_last):
    """Bảng vai trò + cross-tab MD theo (giai đoạn × vai trò) → tiền. N giai đoạn bất kỳ."""
    ws = wb.create_sheet("08-VAITRO")
    n_gd = len(P.PHASES_GIAI_DOAN)
    c_first_gd = 4          # cột D = giai đoạn đầu tiên
    c_tong = c_first_gd + n_gd      # cột Σ MD
    c_gia = c_tong + 1              # cột giá bán

    title_cell(ws, "Vai trò — hệ số đơn giá và phân bổ theo chặng", c_gia)
    note_cell(
        ws,
        "don_gia_mm / luong_thang ở 00-THAMSO là mức NỀN của vai trò BA. "
        "Vai trò khác nhân hệ số ở cột C. Mỗi cột giai đoạn gộp cả dòng mục và hạng mục nền.",
        c_gia,
    )
    write_header(
        ws,
        ["Mã", "Vai trò", "Hệ số"]
        + [f"MD {gd.capitalize()}" for gd in P.PHASES_GIAI_DOAN]
        + ["MD tổng", "Giá bán"],
    )

    dm, md, gd_col, vt, pv = "'03-DONGMUC'", ref["md"], ref["giai_doan"], ref["vai_tro"], ref["ngoai_pv"]
    R1, R2 = DATA_ROW, MAX_LINES
    nen_md = f"'04-NEN'!$F${DATA_ROW}:$F${nen_last}/MH_PER_MD"

    for i, (code, ten, he_so) in enumerate(P.ROLES):
        r = DATA_ROW + i
        ws.cell(row=r, column=1, value=code).font = Font(name="Consolas", size=10)
        ws.cell(row=r, column=2, value=ten).font = body_font()
        c = ws.cell(row=r, column=3, value=he_so)
        c.number_format = "0.00"
        c.fill = PatternFill("solid", fgColor=C_INPUT)
        c.border = BOX
        for j, giai_doan in enumerate(P.PHASES_GIAI_DOAN):
            c = ws.cell(
                row=r,
                column=c_first_gd + j,
                value=(
                    f"=SUMIFS({dm}!${md}${R1}:${md}${R2},{dm}!${gd_col}${R1}:${gd_col}${R2},"
                    f'"{giai_doan}",{dm}!${vt}${R1}:${vt}${R2},$A{r},'
                    f'{dm}!${pv}${R1}:${pv}${R2},"")'
                    f"+SUMPRODUCT(({nen_md})*('04-NEN'!$G${DATA_ROW}:$G${nen_last}="
                    f'"{giai_doan}")*(\'04-NEN\'!$H${DATA_ROW}:$H${nen_last}=$A{r}))'
                ),
            )
            c.number_format = "#,##0.0"
            c.fill = PatternFill("solid", fgColor=C_CALC)
            c.border = BOX
        gd_first_L = get_column_letter(c_first_gd)
        gd_last_L = get_column_letter(c_first_gd + n_gd - 1)
        c = ws.cell(row=r, column=c_tong, value=f"=SUM(${gd_first_L}{r}:${gd_last_L}{r})")
        c.number_format = "#,##0.0"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.font = Font(size=10, bold=True)
        c.border = BOX
        tong_L = get_column_letter(c_tong)
        c = ws.cell(
            row=r,
            column=c_gia,
            value=(
                '=IF(GIA_MODE="mm",'
                f"IFERROR(${tong_L}{r}/MD_PER_MM*DON_GIA_MM*$C{r},0),"
                f'IFERROR(${tong_L}{r}*GIA_VON_MD*$C{r}/(1-MARGIN_PCT),0))'
            ),
        )
        c.number_format = "#,##0"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.border = BOX

    last = DATA_ROW + len(P.ROLES) - 1
    r = last + 1
    ws.cell(row=r, column=2, value="Σ").font = Font(size=11, bold=True)
    for col_idx in range(c_first_gd, c_gia + 1):
        L = get_column_letter(col_idx)
        c = ws.cell(row=r, column=col_idx, value=f"=SUM({L}{DATA_ROW}:{L}{last})")
        c.number_format = "#,##0" if col_idx == c_gia else "#,##0.0"
        c.font = Font(size=11, bold=True)
        c.fill = PatternFill("solid", fgColor="FFE699")
        c.border = BOX

    for j, giai_doan in enumerate(P.PHASES_GIAI_DOAN):
        L = get_column_letter(c_first_gd + j)
        wb.defined_names.add(
            DefinedName(f"MD_{giai_doan.upper()}", attr_text=f"'08-VAITRO'!${L}${r}")
        )
    wb.defined_names.add(
        DefinedName("GIA_TONG", attr_text=f"'08-VAITRO'!${get_column_letter(c_gia)}${r}")
    )

    # giá bán theo chặng — tính riêng để TONGHOP tham chiếu
    for j, giai_doan in enumerate(P.PHASES_GIAI_DOAN):
        rr = r + 1 + j
        ws.cell(row=rr, column=2, value=f"Giá bán — {giai_doan.capitalize()}").font = body_font()
        L = get_column_letter(c_first_gd + j)
        c = ws.cell(
            row=rr,
            column=c_gia,
            value=(
                '=IF(GIA_MODE="mm",'
                f"IFERROR(SUMPRODUCT(${L}${DATA_ROW}:${L}${last},$C${DATA_ROW}:$C${last})"
                "/MD_PER_MM*DON_GIA_MM,0),"
                f"IFERROR(SUMPRODUCT(${L}${DATA_ROW}:${L}${last},$C${DATA_ROW}:$C${last})"
                "*GIA_VON_MD/(1-MARGIN_PCT),0))"
            ),
        )
        c.number_format = "#,##0"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.border = BOX
        wb.defined_names.add(
            DefinedName(f"GIA_{giai_doan.upper()}", attr_text=f"'08-VAITRO'!${get_column_letter(c_gia)}${rr}")
        )

    widths = [10, 40, 9] + [13] * n_gd + [12, 18]
    for col_idx, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(col_idx)].width = w
    return ws


def sheet_nghiemthu(wb, cat):
    ws = wb.create_sheet("09-NGHIEMTHU")
    title_cell(ws, "Tiêu chí nghiệm thu theo loại hạng mục", 3)
    note_cell(
        ws,
        "Gắn vào biên bản bàn giao. Nghiệm thu ĐẶC TẢ — không đồng nghĩa pipeline đã chạy đúng.",
        3,
    )
    write_header(ws, ["kind", "Loại hạng mục", "Đạt khi"])

    TEN = {
        "ks_ht": "Khảo sát hệ thống nguồn", "ks_bang": "Phiếu khảo sát bảng",
        "tq_ng": "Tổng quan nguồn", "brz": "Bảng Bronze", "slv": "Entity Silver",
        "gld_dim": "Dimension Gold", "gld_fct": "Fact Gold", "gld_dm": "Data mart Gold",
        "gld_kpi": "Định nghĩa chỉ tiêu", "erd": "ERD nhóm nghiệp vụ",
        "logic": "Logic luồng nghiệp vụ", "map": "Mapping source → target",
        "bc_bg": "Báo cáo bàn giao",
        "ho_tro": "Hỗ trợ triển khai (Delivery)",
    }
    r = DATA_ROW
    for kind, tieu_chi in cat.get("nghiem_thu", {}).items():
        ws.cell(row=r, column=1, value=kind).font = Font(name="Consolas", size=10)
        ws.cell(row=r, column=2, value=TEN.get(kind, kind)).font = body_font()
        c = ws.cell(row=r, column=3, value=tieu_chi)
        c.font = body_font()
        c.alignment = Alignment(wrap_text=True, vertical="top")
        c.border = BOX
        ws.row_dimensions[r].height = 42
        r += 1

    r += 1
    c = ws.cell(row=r, column=1, value="Áp dụng cho mọi hạng mục")
    c.font = Font(size=11, bold=True, color="FFFFFF")
    c.fill = PatternFill("solid", fgColor=C_HEAD)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
    r += 1
    for line in cat.get("nghiem_thu_chung", []):
        c = ws.cell(row=r, column=1, value="• " + line)
        c.font = body_font()
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
        r += 1

    for col, w in zip("ABC", (12, 28, 96)):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = f"A{DATA_ROW}"
    return ws


def sheet_tonghop(wb, est, nen_last, ref):
    ws = wb.create_sheet("05-TONGHOP")
    title_cell(ws, "Tổng hợp — ba cấu phần báo giá", 5)
    note_cell(
        ws,
        "Ba cấu phần tách riêng — đừng gộp thành một đơn giá/bảng. "
        "Phân bổ giai đoạn dưới đây là CÔNG (man-hour), không phải thời gian trôi.",
        5,
    )

    dm = "'03-DONGMUC'"
    mh, j_ngoai_le, j_pv = ref["mh"], ref["ngoai_le"], ref["ngoai_pv"]
    rng = f"{dm}!${mh}${DATA_ROW}:${mh}${MAX_LINES}"
    f_le = f"{dm}!${j_ngoai_le}${DATA_ROW}:${j_ngoai_le}${MAX_LINES}"
    f_pv = f"{dm}!${j_pv}${DATA_ROW}:${j_pv}${MAX_LINES}"

    # key, kind, label, formula (dùng {key} để trỏ dòng khác — phân giải sau), format
    rows = [
        (None, "block", "Cấu phần MH", None, None),
        ("khung", "calc", "1 · Phí khung (một lần)",
         f"=SUM('04-NEN'!$F${DATA_ROW}:$F${nen_last})", "#,##0.00"),
        ("nguon", "calc", "2 · Gói theo nguồn", f'=SUMIFS({rng},{f_le},"",{f_pv},"")', "#,##0.00"),
        ("ngoai_le", "calc", "3 · Ngoại lệ tính riêng",
         f'=SUMIFS({rng},{f_le},"x",{f_pv},"")', "#,##0.00"),
        ("mh", "total", "Σ MH", "=SUM($C${khung}:$C${ngoai_le})", "#,##0.00"),
        ("md", "total", "Σ MD", "=$C${mh}/MH_PER_MD", "#,##0.0"),
        ("mm", "total", "Σ MM (man-month)", "=$C${md}/MD_PER_MM", "#,##0.00"),
        (None, "gap", None, None, None),
        (None, "block", "Theo giai đoạn — chốt giá từng chặng", None, None),
    ]
    for _gd in P.PHASES_GIAI_DOAN:
        rows += [
            (f"md_{_gd}", "calc", f"{_gd.capitalize()} · MD", f"=MD_{_gd.upper()}", "#,##0.0"),
            (f"gia_{_gd}", "total", f"{_gd.capitalize()} · giá bán", f"=GIA_{_gd.upper()}", "#,##0"),
        ]
    rows += [
        (None, "gap", None, None, None),
        (None, "block", "Thành tiền", None, None),
        ("gia_ban", "total", "Giá bán", "=GIA_TONG", "#,##0"),
        ("rom_lo", "calc", "ROM thấp", "=$C${gia_ban}*0.9", "#,##0"),
        ("rom_hi", "calc", "ROM cao", "=$C${gia_ban}*1.1", "#,##0"),
        (None, "gap", None, None, None),
        (None, "block", "Đối chiếu giá vốn", None, None),
        ("don_gia_tt", "calc", "Đơn giá bình quân / man-month",
         '=IFERROR($C${gia_ban}/$C${mm},"")', "#,##0"),
        ("gv_mm", "calc", "Giá vốn / man-month", '=IFERROR(GIA_VON_MM,"")', "#,##0"),
        ("margin_thuc", "total", "Margin thực trên giá bán",
         '=IFERROR(1-$C${gv_mm}/$C${don_gia_tt},"")', "0.0%"),
        (None, "gap", None, None, None),
        (None, "block", "Phân bổ theo giai đoạn công việc", None, None),
    ]

    at = {}
    r = 5
    for key, kind, _, _, _ in rows:
        if kind == "gap":
            r += 1
            continue
        if key:
            at[key] = r
        r += 1

    r = 5
    for key, kind, label, formula, fmt in rows:
        if kind == "gap":
            r += 1
            continue
        if kind == "block":
            c = ws.cell(row=r, column=1, value=label)
            c.font = Font(size=11, bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor=C_HEAD)
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
            r += 1
            continue
        ws.cell(row=r, column=1, value=label).font = Font(
            size=10, bold=(kind == "total")
        )
        c = ws.cell(row=r, column=3, value=formula.format(**at))
        c.number_format = fmt
        c.font = Font(size=11 if kind == "total" else 10, bold=(kind == "total"))
        c.fill = PatternFill("solid", fgColor="FFE699" if kind == "total" else C_CALC)
        c.border = BOX
        r += 1

    phase_first = r
    for j, ph in enumerate(("tt Thu thập", "pt Phân tích & thiết kế", "xn Xác nhận & bàn giao")):
        col = get_column_letter(ref["tt_idx"] + j)
        pr = f"{dm}!${col}${DATA_ROW}:${col}${MAX_LINES}"
        ws.cell(row=r, column=1, value=ph).font = body_font()
        c = ws.cell(row=r, column=3, value=f'=SUMIFS({pr},{f_pv},"")')
        c.number_format = "#,##0.00"
        c.fill = PatternFill("solid", fgColor=C_CALC)
        c.border = BOX
        c = ws.cell(
            row=r,
            column=4,
            value=f'=IFERROR($C{r}/SUM($C${phase_first}:$C${phase_first + 2}),"")',
        )
        c.number_format = "0%"
        c.font = Font(size=10, italic=True, color="595959")
        r += 1

    r += 1
    flags = est.get("rui_ro_flags", [])
    if flags:
        c = ws.cell(
            row=r,
            column=1,
            value="Cờ rủi ro — nêu để thương lượng phạm vi, KHÔNG nhân vào giá",
        )
        c.font = Font(size=11, bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="C00000")
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        r += 1
        for f in flags:
            ws.cell(row=r, column=1, value=f"• {f}").font = Font(size=10, color="C00000")
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
            r += 1

    for col, w in zip("ABCD", (34, 4, 20, 10)):
        ws.column_dimensions[col].width = w
    return ws


def build(est, cat, out_path, resolved):
    wb = Workbook()
    wb.remove(wb.active)
    sheet_thamso(wb, resolved, est, cat)
    sheet_catalog(wb, cat)
    sheet_adder(wb, cat)
    _, ref = sheet_dongmuc(wb, est, cat)
    _, nen_last = sheet_nen(wb, est, cat)
    sheet_tonghop(wb, est, nen_last, ref)
    sheet_quydoi(wb)
    sheet_giavon(wb)
    sheet_vaitro(wb, ref, nen_last)
    sheet_nghiemthu(wb, cat)
    wb.save(out_path)


def main():
    ap = argparse.ArgumentParser(
        description="estimate-dmba JSON -> XLSX có công thức",
        epilog="Ví dụ: --set gia_mode=gia_von --set luong_thang=40000000 --set utilization=75%",
    )
    ap.add_argument("--input", help="estimate JSON; bỏ qua nếu dùng --blank")
    ap.add_argument("--output", help="đường dẫn .xlsx")
    ap.add_argument("--catalog", default=str(DEFAULT_CATALOG))
    ap.add_argument("--blank", action="store_true", help="xuất template rỗng, chỉ nạp catalog")
    ap.add_argument("--overwrite", action="store_true")
    ap.add_argument(
        "--set",
        dest="sets",
        action="append",
        metavar="KEY=VALUE",
        help="ghi đè tham số; lặp lại được. Nhận '80%%' và '40_000_000'.",
    )
    ap.add_argument("--list-params", action="store_true", help="in bảng tham số rồi thoát")
    a = ap.parse_args()

    if a.list_params:
        print(f"{'KHOÁ':<16}{'MẶC ĐỊNH':>14}  NHÓM · DIỄN GIẢI")
        for _, key, label, default, _, nhom in P.PARAMS:
            d = "—" if default is None else str(default)
            print(f"{key:<16}{d:>14}  {nhom} · {label}")
        print("\nDùng: --set key=value (lặp lại được)")
        return

    if not a.output:
        sys.exit("thiếu --output")
    if not a.blank and not a.input:
        sys.exit("thiếu --input (hoặc dùng --blank)")

    out = Path(a.output)
    if out.exists() and not a.overwrite:
        sys.exit(f"đã tồn tại: {out} — thêm --overwrite nếu muốn ghi đè")

    cat = json.loads(Path(a.catalog).read_text("utf-8"))
    est = {} if a.blank else json.loads(Path(a.input).read_text("utf-8"))
    resolved = P.resolve(est.get("tham_so"), P.parse_set(a.sets))

    out.parent.mkdir(parents=True, exist_ok=True)
    build(est, cat, out, resolved)

    n = len(est.get("lines", []))
    print(f"đã ghi {out} — {n} dòng mục · catalog {cat['catalog_id']} v{cat['version']}")
    print(f"gia_mode = {resolved['gia_mode']}")
    if resolved["gia_mode"] == "mm" and not resolved.get("don_gia_mm"):
        print("  ⚠ chưa có DON_GIA_MM — chỉ xuất MH / MD")
    if resolved["gia_mode"] == "gia_von" and not resolved.get("luong_thang"):
        print("  ⚠ chưa có LUONG_THANG — chỉ xuất MH / MD")


if __name__ == "__main__":
    main()
