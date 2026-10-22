#!/usr/bin/env python3
"""Workbook XLSX (đã chốt số) -> markdown + html, lưu hai bản.

Số liệu được TÍNH LẠI trong Python từ ô nhập tay, không tin cache của Excel.
Nếu Excel có cache, đối chiếu và báo lệch — bắt được cả trường hợp ô công thức bị ghi đè tay.
"""

import argparse
import html
import json
import sys
from datetime import date
from pathlib import Path

from openpyxl import load_workbook

import params as P
from params import (ADDER_ORDER, C_ADD0, C_ADJ, C_AUTO, C_CODE, C_GHI,
                    C_GIAIDOAN, C_HM, C_KIND, C_LE, C_MH, C_NG, C_PV,
                    C_QTY, C_REUSE, C_STT, C_VAITRO)

HEADER_ROW = 5
DATA_ROW = 6
HELPER_ROW = 4

PHASES = ("tt", "pt", "xn")

# group_lines() giờ sống ở params.py (dùng chung với to_xlsx.py để STT/Nhóm công việc
# trong Excel khớp đúng cách báo cáo này nhóm dòng).
group_lines = P.group_lines


def num(v, default=0.0):
    if v is None or v == "":
        return default
    if isinstance(v, str):
        if v.startswith("="):
            return default
        v = v.replace(",", ".").strip()
        try:
            return float(v)
        except ValueError:
            return default
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def vn(x, dec=0):
    """Định dạng số kiểu Việt: nghìn '.', thập phân ','."""
    if x is None:
        return "—"
    s = f"{x:,.{dec}f}"
    return s.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def read_params(wb, cached_wb=None):
    """Quét 00-THAMSO lấy mọi khoá có trong P.PARAMS. Bỏ qua dòng tiêu đề nhóm."""
    ws = wb["00-THAMSO"]
    cached = cached_wb["00-THAMSO"] if cached_wb is not None else None
    p, meta = {}, {}
    META_LABELS = {"Dự án", "Khách hàng", "Người lập", "Ngày", "Catalog"}

    for r in range(DATA_ROW, ws.max_row + 1):
        key = ws.cell(row=r, column=2).value
        key = str(key).strip() if key else ""
        if key in P.BY_KEY:
            v = ws.cell(row=r, column=4).value
            # ô có thể bị đổi thành công thức → lấy giá trị Excel đã tính
            if isinstance(v, str) and v.startswith("=") and cached is not None:
                v = cached.cell(row=r, column=4).value
            p[key] = v
            continue
        label = ws.cell(row=r, column=1).value
        label = str(label).strip() if label else ""
        if label in META_LABELS:
            val = ws.cell(row=r, column=4).value
            if val is not None:
                meta[label] = val
    return p, meta


def read_catalog(wb):
    ws = wb["01-CATALOG"]
    cat = {}
    r = DATA_ROW
    while True:
        code = ws.cell(row=r, column=1).value
        if not code:
            break
        cat[str(code).strip()] = {
            "tt": num(ws.cell(row=r, column=2).value),
            "pt": num(ws.cell(row=r, column=3).value),
            "xn": num(ws.cell(row=r, column=4).value),
        }
        r += 1
    return cat


def read_adders(wb):
    ws = wb["02-ADDER"]
    out = {}
    for i, code in enumerate(ADDER_ORDER):
        out[code] = num(ws.cell(row=DATA_ROW + i, column=2).value)
    return out


def read_lines(wb, cat, adder_mh, cached_wb=None):
    ws = wb["03-DONGMUC"]
    cached = cached_wb["03-DONGMUC"] if cached_wb is not None else None
    lines, warn = [], []
    r = DATA_ROW
    blank = 0
    while r <= ws.max_row + 50:
        code = ws.cell(row=r, column=C_CODE).value
        name = ws.cell(row=r, column=C_HM).value
        if not code and not name:
            blank += 1
            if blank >= 3:
                break
            r += 1
            continue
        blank = 0
        code = str(code).strip() if code else ""
        if code and code not in cat:
            warn.append(f"dòng {r}: mã `{code}` không có trong 01-CATALOG — bỏ qua")
            r += 1
            continue

        adders = {}
        for i, a in enumerate(ADDER_ORDER):
            n = num(ws.cell(row=r, column=C_ADD0 + i).value)
            if n:
                adders[a] = n

        kind = ws.cell(row=r, column=C_KIND).value or ""
        giai_doan = P.phase_of(kind, ws.cell(row=r, column=C_GIAIDOAN).value)
        vai_tro = P.role_of(ws.cell(row=r, column=C_VAITRO).value)
        qty = num(ws.cell(row=r, column=C_QTY).value)
        reuse = num(ws.cell(row=r, column=C_REUSE).value)
        auto = num(ws.cell(row=r, column=C_AUTO).value)
        adj = num(ws.cell(row=r, column=C_ADJ).value)
        le = str(ws.cell(row=r, column=C_LE).value or "").strip().lower() == "x"
        pv = str(ws.cell(row=r, column=C_PV).value or "").strip().lower() == "x"

        row = cat.get(code, {"tt": 0, "pt": 0, "xn": 0})
        per = row["tt"] + row["pt"] + row["xn"]
        goc = per * qty
        add_mh = sum(adder_mh[a] * n for a, n in adders.items())
        mh = 0.0 if pv else (goc * (1 - reuse) * (1 - auto) + add_mh) * (1 + adj)

        if cached is not None:
            cv = cached.cell(row=r, column=C_MH).value
            if isinstance(cv, (int, float)) and abs(float(cv) - mh) > 0.01:
                warn.append(
                    f"dòng {r}: Excel cache MH={float(cv):.2f} ≠ tính lại {mh:.2f}"
                    " — ô công thức có thể bị ghi đè tay"
                )

        lines.append(
            {
                "row": r,
                "stt": ws.cell(row=r, column=C_STT).value,
                "hang_muc": name or "",
                "nguon": ws.cell(row=r, column=C_NG).value or "",
                "kind": kind,
                "giai_doan": giai_doan,
                "vai_tro": vai_tro,
                "code": code,
                "qty": qty,
                "reuse_pct": reuse,
                "auto_pct": auto,
                "adjust_pct": adj,
                "ngoai_le": le,
                "out_of_scope": pv,
                "adders": adders,
                "mh_goc": goc,
                "mh_adders": add_mh,
                "mh": mh,
                "phase": {p: row[p] * qty for p in PHASES},
                "ghi_chu": ws.cell(row=r, column=C_GHI).value or "",
            }
        )
        r += 1
    return lines, warn


def read_nen(wb, so_thang):
    ws = wb["04-NEN"]
    out = []
    r = DATA_ROW
    while True:
        code = ws.cell(row=r, column=1).value
        if not code:
            break
        per = str(ws.cell(row=r, column=4).value or "").strip()
        mh = num(ws.cell(row=r, column=3).value)
        out.append(
            {
                "code": str(code).strip(),
                "ten": ws.cell(row=r, column=2).value or "",
                "mh_goc": mh,
                "per": per,
                "mh": mh * so_thang if per == "tháng" else mh,
                "giai_doan": P.phase_of(None, ws.cell(row=r, column=7).value)
                if ws.cell(row=r, column=7).value
                else P.PHASE_NEN.get(str(code).strip(), "modeling"),
                "vai_tro": P.role_of(ws.cell(row=r, column=8).value),
                "ghi_chu": ws.cell(row=r, column=9).value or "",
            }
        )
        r += 1
    return out


def read_nghiemthu(wb):
    """[(kind, tên, tiêu chí)] + list tiêu chí chung từ 09-NGHIEMTHU."""
    if "09-NGHIEMTHU" not in wb.sheetnames:
        return [], []
    ws = wb["09-NGHIEMTHU"]
    rows, chung = [], []
    for r in range(DATA_ROW, ws.max_row + 1):
        kind = ws.cell(row=r, column=1).value
        if kind and str(kind).strip() in P.KINDS:
            rows.append(
                (str(kind).strip(), ws.cell(row=r, column=2).value or "",
                 ws.cell(row=r, column=3).value or "")
            )
        elif isinstance(kind, str) and kind.startswith("•"):
            chung.append(kind.lstrip("• ").strip())
    return rows, chung


def read_flags(wb):
    ws = wb["05-TONGHOP"]
    out = []
    for r in range(1, ws.max_row + 1):
        v = ws.cell(row=r, column=1).value
        if isinstance(v, str) and v.startswith("•"):
            out.append(v.lstrip("• ").strip())
    return out


def rollup(lines, nen, p):
    """p = dict tham số đã resolve. Mọi số tiền tính lại bằng params.py, không tin Excel."""
    mh_per_md = P.num(p.get("mh_per_md"), 8) or 8

    live = [l for l in lines if not l["out_of_scope"]]
    khung = sum(n["mh"] for n in nen)
    nguon = sum(l["mh"] for l in live if not l["ngoai_le"])
    ngoai_le = sum(l["mh"] for l in live if l["ngoai_le"])
    mh = khung + nguon + ngoai_le
    md = mh / mh_per_md

    # MD theo (giai đoạn, vai trò) — gộp cả dòng mục và hạng mục nền
    md_by_pr = {}
    for item in live + nen:
        key = (item["giai_doan"], item["vai_tro"])
        md_by_pr[key] = md_by_pr.get(key, 0.0) + item["mh"] / mh_per_md

    q = P.quydoi(p)
    gv = P.giavon(p, q)
    money = P.price(p, md_by_pr, q, gv)

    r = {
        "khung": khung,
        "nguon": nguon,
        "ngoai_le": ngoai_le,
        "mh": mh,
        "md": md,
        "mh_per_md": mh_per_md,
        "quydoi": q,
        "giavon": gv,
        "md_by_pr": md_by_pr,
        "mh_giai_doan": {
            gd: sum(i["mh"] for i in live + nen if i["giai_doan"] == gd)
            for gd in P.PHASES_GIAI_DOAN
        },
        "phase": {ph: sum(l["phase"][ph] for l in live) for ph in PHASES},
    }
    r.update(money)
    return r


def pct(x):
    return f"{x * 100:.0f}%" if x else "—"


def build_section2(lines):
    """[(label, [dòng], Σ MH)] cho II.2, + (g, Σ) riêng cho II.3 Báo cáo & bàn giao và
    II.4 Hỗ trợ triển khai — tách khỏi WORK_GROUPS đầy đủ để hiển thị thành mục riêng."""
    all_groups = group_lines(lines)
    group2, g3, g4 = [], ([], 0.0), ([], 0.0)
    for label, g, sub in all_groups:
        if label == P.GROUP_BAOCAO_LABEL:
            g3 = (g, sub)
        elif label == P.GROUP_HOTRO_LABEL:
            g4 = (g, sub)
        else:
            group2.append((label, g, sub))
    return group2, g3, g4


def build_section1(nen, group2, g3, g4):
    """Cây I.1 Cấu phần giá: mỗi cấu phần (khung/nguồn/ngoại lệ) liệt kê ĐỦ hạng mục của
    Phần II đóng góp vào nó, kèm chỉ mục (II.x) để tham chiếu ngược. Chỉ gộp lại theo
    'ngoai_le' — không tính thêm số mới, không đổi Σ của bất kỳ cấu phần nào ở I.1 cũ.

    Trả về (khung_items, nguon_items, ngoai_le_items), mỗi phần tử (ref, label, mh)."""
    khung_items = [("II.1", "Hạng mục chung", sum(n["mh"] for n in nen))]

    nguon_items, ngoai_le_items = [], []

    def _split(ref, label, g):
        committed = sum(l["mh"] for l in g if not l["ngoai_le"])
        exc = sum(l["mh"] for l in g if l["ngoai_le"])
        nguon_items.append((ref, label, committed))
        ngoai_le_items.append((ref, label, exc))

    for i, (label, g, _sub) in enumerate(group2, start=1):
        _split(f"II.2.{i}", label, g)
    _split("II.3", P.GROUP_BAOCAO_LABEL, g3)
    _split("II.4", P.GROUP_HOTRO_LABEL, g4)

    return khung_items, nguon_items, ngoai_le_items


def _dongmuc_table_rows(A, g, mh_per_md):
    A("| STT | Hạng mục | Nguồn | Mã | SL | reuse | auto | MH | MD | Căn cứ |")
    A("| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |")
    for l in g:
        mark = " ⚑" if l["ngoai_le"] else (" ∅" if l["out_of_scope"] else "")
        A(
            f"| {l['stt'] or ''} | {l['hang_muc']}{mark} | {l['nguon']} | `{l['code']}` "
            f"| {vn(l['qty'])} | {pct(l['reuse_pct'])} | {pct(l['auto_pct'])} "
            f"| {vn(l['mh'], 2)} | {vn(l['mh'] / mh_per_md, 1)} | {l['ghi_chu']} |"
        )
    sub = sum(l["mh"] for l in g)
    A(
        f"| | **Σ** | | | | | | **{vn(sub, 2)}** | **{vn(sub / mh_per_md, 1)}** | |"
    )


def _dongmuc_table_html(A, g, mh_per_md):
    e = html.escape
    A("<div class=tw><table><thead><tr><th class=n>STT</th>"
      "<th>Hạng mục</th><th>Nguồn</th><th>Mã</th><th class=n>SL</th>"
      "<th class=n>reuse</th><th class=n>auto</th><th class=n>MH</th>"
      "<th class=n>MD</th><th>Căn cứ</th></tr></thead><tbody>")
    for l in g:
        mark = " ⚑" if l["ngoai_le"] else (" ∅" if l["out_of_scope"] else "")
        A(
            f'<tr><td class=n>{e(str(l["stt"] or ""))}</td>'
            f'<td>{e(str(l["hang_muc"]))}{mark}</td><td>{e(str(l["nguon"]))}</td>'
            f'<td><code>{e(l["code"])}</code></td><td class=n>{vn(l["qty"])}</td>'
            f'<td class=n>{pct(l["reuse_pct"])}</td><td class=n>{pct(l["auto_pct"])}</td>'
            f'<td class=n>{vn(l["mh"], 2)}</td>'
            f'<td class=n>{vn(l["mh"] / mh_per_md, 1)}</td>'
            f'<td>{e(str(l["ghi_chu"]))}</td></tr>'
        )
    sub = sum(l["mh"] for l in g)
    A(
        f'<tr class=tot><td></td><td>Σ</td><td></td><td></td><td class=n></td>'
        f'<td class=n></td><td class=n></td><td class=n>{vn(sub, 2)}</td>'
        f'<td class=n>{vn(sub / mh_per_md, 1)}</td><td></td></tr>'
    )
    A("</tbody></table></div>")


def md_report(meta, p, lines, nen, s, flags, warn, nghiem_thu=((), ())):
    tien = p.get("tien_te") or "VND"
    L = []
    A = L.append
    A(f"# Báo giá — {meta.get('Dự án', 'DMBA')}")
    A("")
    A(f"| | |\n| --- | --- |")
    for k in ("Khách hàng", "Người lập", "Ngày", "Catalog"):
        if meta.get(k):
            A(f"| {k} | {meta[k]} |")
    A(f"| Xuất lúc | {date.today().isoformat()} |")
    A("")
    A(f"**Tổng quan** — Σ MH {vn(s['mh'], 2)} · Σ MD {vn(s['md'], 1)} · "
      f"{vn(s['mh_per_md'], 1)} giờ công/ngày công"
      + (f" · Giá bán **{vn(s['gia_ban'])} {tien}**" if s.get("gia_ban") else ""))
    A("")

    # ---------------------------------------------------------------- Phần I
    group2, (g3, sub3), (g4, sub4) = build_section2(lines)
    khung_items, nguon_items, ngoai_le_items = build_section1(nen, group2, g3, g4)

    A("## I. Chi tiết giá")
    A("")
    A("### I.1 Cấu phần giá")
    A("")
    A("| # | Cấu phần | MH | MD | Tỷ lệ |")
    A("| --- | --- | ---: | ---: | ---: |")
    tot_mh = s["mh"] or 1
    for idx, (key, label, items) in enumerate(
        (
            ("khung", "Phí khung (một lần)", khung_items),
            ("nguon", "Gói theo nguồn", nguon_items),
            ("ngoai_le", "Ngoại lệ tính riêng", ngoai_le_items),
        ),
        start=1,
    ):
        A(
            f"| **I.1.{idx}** | **{label}** | **{vn(s[key], 2)}** | **{vn(s[key] / s['mh_per_md'], 1)}** "
            f"| **{s[key] / tot_mh * 100:.0f}%** |"
        )
        for ref, item_label, mh in items:
            A(
                f"| | ↳ `{ref}` {item_label} | {vn(mh, 2)} | {vn(mh / s['mh_per_md'], 1)} "
                f"| {mh / tot_mh * 100:.0f}% |"
            )
    A(f"| | **Σ** | **{vn(s['mh'], 2)}** | **{vn(s['md'], 1)}** | **100%** |")
    A("")

    A("### I.2 Đơn giá")
    A("")
    if s.get("gia_ban"):
        g, gv = s["quydoi"], s.get("giavon")
        mode = s["gia_mode"]
        A(f"Cách tính: **`{mode}`** — "
          + ("bán theo đơn giá man-month (margin & overhead đã nằm trong đơn giá)"
             if mode == "mm" else "dựng từ giá vốn rồi cộng margin"))
        A("")
        A("#### I.2.1 Theo man-month")
        A("")
        if mode == "mm":
            A(f"Đơn giá nhập ở `00-THAMSO` ({vn(P.num(p.get('don_gia_mm')))} {tien}) LÀ đơn giá "
              "bán BÌNH QUÂN / man-month trên toàn cơ cấu vai trò của dự án (không phải mức nền "
              "riêng vai trò nào) — nhân thẳng với Σ MM để ra Giá bán (mục I.3):")
            A("")
            A("| Hạng mục | Giá trị |")
            A("| --- | ---: |")
            A(f"| Đơn giá bán / man-month (bình quân, = số đã nhập) "
              f"| {vn(P.num(p.get('don_gia_mm')))} {tien} |")
            A(f"| **= Σ Giá bán ÷ Σ MM (đối chiếu)** | **{vn(s['don_gia_mm'])} {tien}** |")
            A("")
            A("Bảng phụ — suy ngược mức nền riêng từng vai trò (hệ số theo Điều 6) từ đơn giá "
              "bình quân trên, cho ai cần xem đơn giá riêng BA/DM/DA/PM; không ảnh hưởng Giá bán:")
            A("")
            A("| Vai trò | Tên vai trò | Hệ số | MD | Đơn giá / man-month (vai trò) |")
            A("| --- | --- | ---: | ---: | ---: |")
            tvt = s.get("theo_vai_tro", {})
            sum_md = sum(v["md"] for v in tvt.values()) or 1
            nen_mm = s.get("nen_mm") or 0
            for vt, v in tvt.items():
                A(
                    f"| {vt} | {P.ROLE_LABEL.get(vt, '—')} | {P.ROLE_HESO[vt]:.2f} "
                    f"| {vn(v['md'], 1)} | {vn(nen_mm * P.ROLE_HESO[vt])} |"
                )
            A(f"| | | **BQ {vn(s.get('weighted_heso'), 4)}** | **Σ {vn(sum_md, 1)}** "
              f"| **Nền (hệ số 1.00) = {vn(nen_mm)}** |")
        else:
            A("| Hạng mục | " + tien + " |")
            A("| --- | ---: |")
            A(f"| Đơn giá bán / man-month (bình quân, theo cơ cấu vai trò) | {vn(s['don_gia_mm'])} |")
            A(f"| Giá vốn / man-month | {vn(gv['gia_von_mm']) if gv else '—'} |")
        A("")
        A("#### I.2.2 Theo man-day")
        A("")
        A("Đơn giá quy đổi / man-day = Đơn giá bán / man-month ÷ MD/man-month "
          "(bảng quy đổi bên dưới):")
        A("")
        A("| Hạng mục | Giá trị |")
        A("| --- | ---: |")
        A(f"| Đơn giá bán / man-month (bình quân) | {vn(P.num(p.get('don_gia_mm')))} {tien} |")
        A(f"| ÷ MD / man-month | {vn(g['md_per_mm'], 2)} |")
        A(f"| **= Đơn giá quy đổi / man-day (bình quân)** | **{vn(s.get('rate_md'))} {tien}** |")
        A("")
        A("Quy đổi man-month → ngày công:")
        A("")
        A("| Hạng mục | Giá trị | Giải thích |")
        A("| --- | ---: | --- |")
        A(
            f"| MD danh nghĩa / năm | {vn(P.num(p.get('md_nam')), 0)} "
            "| Tham số `md_nam` ở `00-THAMSO` — số ngày làm việc danh nghĩa/năm "
            "(≈52 tuần × 5 ngày/tuần), CHƯA trừ lễ/phép |"
        )
        A(
            f"| − nghỉ lễ {vn(P.num(p.get('ngay_le')), 0)} − phép "
            f"{vn(P.num(p.get('ngay_phep')), 0)} | {vn(g['md_kha_dung'], 1)} "
            "| Trừ ngày nghỉ lễ + phép năm theo luật/chính sách công ty (tham số "
            "`ngay_le`/`ngay_phep`) |"
        )
        A(
            f"| × utilization {pct(P.num(p.get('utilization')))} | "
            f"{vn(g['md_ban_duoc'], 1)} MD bán được / năm "
            "| **Utilization** = tỷ lệ thời gian THỰC SỰ sinh MH tính phí trên tổng ngày còn lại "
            "sau lễ/phép — phần còn lại dành cho họp nội bộ, đào tạo, chờ phản hồi khách giữa "
            "các giai đoạn |"
        )
        A(
            f"| **÷ 12 → MD / man-month** | **{vn(g['md_per_mm'], 2)}** | "
            f"{vn(g['md_ban_duoc'], 1)} MD bán được/năm ÷ 12 tháng = {vn(g['md_per_mm'], 2)} — "
            "1 man-month ở đây là NGÀY CÔNG THỰC bán được bình quân/tháng, không phải 1 tháng "
            "lịch (30 ngày) |"
        )
        A("")
        if gv:
            A("Giá vốn — dựng từ lương:")
            A("")
            A("| Hạng mục | " + tien + " |")
            A("| --- | ---: |")
            A(f"| Lương gross/tháng × {vn(P.num(p.get('thang_luong')), 1)} tháng "
              f"× (1 + bảo hiểm {pct(P.num(p.get('bao_hiem_pct')))}) | {vn(gv['cp_nhan_su'])} |")
            A(f"| + overhead {pct(P.num(p.get('overhead_pct')))} | {vn(gv['overhead'])} |")
            A(f"| **= tổng chi phí / người / năm** | **{vn(gv['cp_tong'])}** |")
            A(f"| Giá vốn / MD | {vn(gv['gia_von_md'])} |")
            A("")
            if s.get("margin_thuc") is not None:
                A(f"> **Margin thực trên giá bán: {s['margin_thuc'] * 100:.1f}%** "
                  f"— đơn giá {vn(s['don_gia_mm'])} so với giá vốn {vn(gv['gia_von_mm'])} "
                  "mỗi man-month.")
                A("")
    else:
        thieu = "DON_GIA_MM" if s.get("gia_mode") == "mm" else "LUONG_THANG"
        A(f"> `{thieu}` chưa điền ở `00-THAMSO` (gia_mode = `{s.get('gia_mode')}`) "
          "— chỉ xuất MH / MD, chưa tính được đơn giá/Thành tiền.")
        A("")

    A("### I.3 Thành tiền")
    A("")
    if s.get("gia_ban"):
        A("| Hạng mục | " + tien + " | Giải thích |")
        A("| --- | ---: | --- |")
        A(
            f"| Σ MM (man-month) | {vn(s['mm'], 2)} | Σ MD ({vn(s['md'], 1)}) ÷ MD/man-month "
            f"({vn(g['md_per_mm'], 2)}) = {vn(s['mm'], 2)} — xem cách ra 15,80 ở mục I.2.2 |"
        )
        if mode == "gia_von":
            A(f"| Giá vốn / MD | {vn(s['rate_md'])} | |")
            A(f"| Chi phí | {vn(s['chi_phi'])} | |")
            A(f"| Margin trên giá bán ({pct(s['margin_pct'])}) | {vn(s['margin'])} | |")
        A(
            f"| **Giá bán** | **{vn(s['gia_ban'])}** | Σ Giá bán từng vai trò "
            "(MD vai trò × hệ số × đơn giá nền) — xem bảng I.3.2 |"
        )
        A("")

        A("#### I.3.1 Theo giai đoạn")
        A("")
        A("**a) Theo chặng hợp đồng — Discovery / Design / Delivery (chốt giá từng chặng)**")
        A("")
        A("| Giai đoạn | MH | MD | % | MM | Giá bán |")
        A("| --- | ---: | ---: | ---: | ---: | ---: |")
        tot_gd_mh = sum(s["mh_giai_doan"].values()) or 1
        for gd, v in s.get("theo_giai_doan", {}).items():
            mh_gd = s["mh_giai_doan"].get(gd, 0.0)
            A(
                f"| {gd.capitalize()} | {vn(mh_gd, 2)} | {vn(v['md'], 1)} "
                f"| {mh_gd / tot_gd_mh * 100:.0f}% | {vn(v['mm'], 2)} | {vn(v['gia_ban'])} |"
            )
        A(
            f"| **Σ** | **{vn(sum(s['mh_giai_doan'].values()), 2)}** | **{vn(s['md'], 1)}** "
            f"| **100%** | **{vn(s['mm'], 2)}** | **{vn(s['gia_ban'])}** |"
        )
        A("")
        A("> Chốt Discovery trước; Design báo lại sau khi inventory được duyệt — "
          "không cam kết giá cố định cho nguồn chưa khảo sát. Delivery là hỗ trợ NHẸ sau "
          "bàn giao (đội DE tự triển khai) — thương lượng riêng, không bắt buộc đi kèm.")
        A("")
        A("**b) Theo loại công — Thu thập / Phân tích & thiết kế / Xác nhận & bàn giao**")
        A("")
        A("*Trục catalog mô tả cơ cấu công trong từng dòng mục, không gắn trực tiếp với "
          "chặng hợp đồng ở bảng (a) — một dòng Design vẫn có đủ cả 3 loại công. "
          "MH ở đây là công THEO CATALOG GỐC (trước khi trừ reuse/tự động hoá, không gồm "
          "Hạng mục nền) nên **Σ của bảng này KHÔNG bằng** Σ MH toàn báo giá/bảng (a) — "
          "chỉ dùng để xem tỷ lệ 3 loại công, không cộng chung với các bảng khác.*")
        A("")
        A("| Loại công | MH | MD | Tỷ lệ |")
        A("| --- | ---: | ---: | ---: |")
        tot_ph = sum(s["phase"].values()) or 1
        for ph, label in zip(PHASES, ("Thu thập", "Phân tích & thiết kế", "Xác nhận & bàn giao")):
            A(
                f"| `{ph}` {label} | {vn(s['phase'][ph], 2)} "
                f"| {vn(s['phase'][ph] / s['mh_per_md'], 1)} "
                f"| {s['phase'][ph] / tot_ph * 100:.0f}% |"
            )
        A(
            f"| **Σ** | **{vn(tot_ph, 2)}** | **{vn(tot_ph / s['mh_per_md'], 1)}** | **100%** |"
        )
        A("")

        A("#### I.3.2 Theo vai trò")
        A("")
        A("| Vai trò | Tên vai trò | Hệ số | MH | MD | Tỷ lệ | Giá bán |")
        A("| --- | --- | ---: | ---: | ---: | ---: | ---: |")
        tot_vt_mh = sum(v["md"] * s["mh_per_md"] for v in s.get("theo_vai_tro", {}).values()) or 1
        for vt, v in s.get("theo_vai_tro", {}).items():
            mh_vt = v["md"] * s["mh_per_md"]
            A(
                f"| {vt} | {P.ROLE_LABEL.get(vt, '—')} | {P.ROLE_HESO[vt]:.2f} "
                f"| {vn(mh_vt, 2)} | {vn(v['md'], 1)} | {mh_vt / tot_vt_mh * 100:.0f}% "
                f"| {vn(v['gia_ban'])} |"
            )
        A(
            f"| | **Σ** | | **{vn(tot_vt_mh, 2)}** "
            f"| **{vn(sum(v['md'] for v in s.get('theo_vai_tro', {}).values()), 1)}** "
            f"| **100%** | **{vn(sum(v['gia_ban'] for v in s.get('theo_vai_tro', {}).values()))}** |"
        )
        A("")
    else:
        A("> Giá bán chưa tính được — xem lý do ở mục I.2.")
        A("")

    # --------------------------------------------------------------- Phần II
    A("## II. Chi tiết công việc")
    A("")
    A("### II.1 Hạng mục chung")
    A("")
    A("| Mã | Hạng mục | MH | Ghi chú |")
    A("| --- | --- | ---: | --- |")
    for n in nen:
        A(f"| `{n['code']}` | {n['ten']} | {vn(n['mh'], 2)} | {n['ghi_chu']} |")
    A(f"| | **Σ — Hạng mục nền** | **{vn(sum(n['mh'] for n in nen), 2)}** | |")
    A("")

    A("### II.2 Hạng mục theo nhóm công việc")
    A("")
    A("| # | Nhóm công việc | Số dòng | MH | MD | % |")
    A("| --- | --- | ---: | ---: | ---: | ---: |")
    g2_tot = sum(sub for _, _, sub in group2) or 1
    for i, (label, g, sub) in enumerate(group2, start=1):
        A(
            f"| II.2.{i} | {label} | {len(g)} | {vn(sub, 2)} | {vn(sub / s['mh_per_md'], 1)} "
            f"| {sub / g2_tot * 100:.0f}% |"
        )
    A(
        f"| | **Σ** | **{sum(len(g) for _, g, _ in group2)}** | **{vn(g2_tot, 2)}** "
        f"| **{vn(g2_tot / s['mh_per_md'], 1)}** | **100%** |"
    )
    A("")
    for i, (label, g, sub) in enumerate(group2, start=1):
        A(f"#### II.2.{i} {label} — {vn(sub, 2)} MH · {vn(sub / s['mh_per_md'], 1)} MD")
        A("")
        _dongmuc_table_rows(A, g, s["mh_per_md"])
        A("")
    A("⚑ ngoại lệ tính riêng · ∅ ngoài phạm vi (MH = 0)")
    A("")

    A(f"### II.3 Hạng mục báo cáo và bàn giao — {vn(sub3, 2)} MH · {vn(sub3 / s['mh_per_md'], 1)} MD")
    A("")
    if g3:
        _dongmuc_table_rows(A, g3, s["mh_per_md"])
    else:
        A("*(chưa có dòng mục)*")
    A("")

    A(f"### II.4 Hạng mục hỗ trợ triển khai — {vn(sub4, 2)} MH · {vn(sub4 / s['mh_per_md'], 1)} MD")
    A("")
    if g4:
        _dongmuc_table_rows(A, g4, s["mh_per_md"])
    else:
        A("*(chưa có dòng mục)*")
    A("")

    # -------------------------------------------------------------- Phần III/IV
    nt_rows, nt_chung = nghiem_thu
    if nt_rows:
        kinds_dung = {l["kind"] for l in lines if not l["out_of_scope"]}
        A("## III. Tiêu chí nghiệm thu")
        A("")
        A("| kind | Loại hạng mục | Đạt khi |")
        A("| --- | --- | --- |")
        for kind, ten, tieu_chi in nt_rows:
            if kind in kinds_dung:
                A(f"| `{kind}` | {ten} | {tieu_chi} |")
        A("")
        if nt_chung:
            A("Áp dụng cho mọi hạng mục:")
            A("")
            for line in nt_chung:
                A(f"- {line}")
            A("")

    if flags:
        A("## IV. Rủi ro")
        A("")
        for f in flags:
            A(f"- {f}")
        A("")
    if warn:
        A("## Phụ lục — Cảnh báo đọc file")
        A("")
        for w in warn:
            A(f"- {w}")
        A("")
    return "\n".join(L)


CSS = """
:root{--bg:#fff;--fg:#1a1a1a;--mut:#6b6b6b;--line:#dcdcdc;--head:#2f5597;
--accent:#1f3864;--warn:#c00000;--zebra:#f7f9fc;--ok:#e2efda}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
--bg:#14161a;--fg:#e8e8e8;--mut:#9aa0a6;--line:#30343a;--head:#4a76c4;
--accent:#9bb8e8;--warn:#ff6b6b;--zebra:#1a1d22;--ok:#1f3326}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);
font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:32px 24px 64px}
h1{font-size:25px;margin:0 0 4px;color:var(--accent);letter-spacing:-.2px}
h2{font-size:16px;margin:36px 0 10px;padding-bottom:6px;
border-bottom:2px solid var(--line);color:var(--accent)}
h3{font-size:13.5px;margin:26px 0 8px;color:var(--fg);display:flex;
flex-wrap:wrap;align-items:baseline;gap:10px}
h3::before{content:"";width:4px;height:15px;background:var(--head);border-radius:2px}
.gsum{font-size:11.5px;font-weight:400;color:var(--mut);
font-variant-numeric:tabular-nums}
.sub{color:var(--mut);font-size:12px;margin-bottom:28px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:18px 0 8px}
.card{border:1px solid var(--line);border-radius:10px;padding:14px 16px;background:var(--zebra)}
.card .k{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}
.card .v{font-size:21px;font-weight:650;margin-top:6px;font-variant-numeric:tabular-nums}
.card.hi{background:var(--ok);border-color:var(--head)}
.tw{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-size:12.5px;min-width:520px}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}
th{background:var(--head);color:#fff;font-weight:600;white-space:nowrap}
tbody tr:nth-child(even){background:var(--zebra)}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr.tot{font-weight:700}tr.tot td{background:var(--ok)}
tr.sub2 td{background:var(--zebra);font-weight:600;color:var(--mut);
border-top:2px solid var(--head)}
code{font:12px ui-monospace,SFMono-Regular,Consolas,monospace;
background:var(--zebra);padding:1px 5px;border-radius:4px}
.meta{font-size:13px}.meta td:first-child{color:var(--mut);width:160px}
.meta table{min-width:0;max-width:520px}
ul.flags{margin:10px 0;padding-left:20px}ul.flags li{color:var(--warn);margin:4px 0}
.note{border-left:3px solid var(--head);background:var(--zebra);
padding:10px 14px;margin:12px 0;color:var(--mut);font-size:13px}
.bar{height:7px;border-radius:4px;background:var(--head);min-width:2px}
@media print{body{background:#fff}.wrap{padding:0;max-width:none}
h2{break-after:avoid}tr{break-inside:avoid}.card{break-inside:avoid}}
"""


def html_report(meta, p, lines, nen, s, flags, warn, nghiem_thu=((), ())):
    e = html.escape
    tien = e(str(p.get("tien_te") or "VND"))
    O = []
    A = O.append
    A("<!doctype html><html lang=vi><head><meta charset=utf-8>")
    A('<meta name=viewport content="width=device-width,initial-scale=1">')
    A(f"<title>Báo giá — {e(str(meta.get('Dự án', 'DMBA')))}</title>")
    A(f"<style>{CSS}</style></head><body><div class=wrap>")
    A(f"<h1>Báo giá — {e(str(meta.get('Dự án', 'DMBA')))}</h1>")
    bits = [f"{k}: {e(str(v))}" for k, v in meta.items() if k != "Dự án"]
    bits.append(f"Xuất lúc: {date.today().isoformat()}")
    A(f"<div class=sub>{' · '.join(bits)}</div>")

    A("<div class=cards>")
    A(f'<div class=card><div class=k>Σ MH</div><div class=v>{vn(s["mh"], 0)}</div></div>')
    A(f'<div class=card><div class=k>Σ MD</div><div class=v>{vn(s["md"], 1)}</div></div>')
    A(
        f'<div class=card><div class=k>Giờ công / ngày công</div>'
        f'<div class=v>{vn(s["mh_per_md"], 1)}</div></div>'
    )
    if s.get("gia_ban"):
        A(
            f'<div class="card hi"><div class=k>Giá bán ({tien})</div>'
            f'<div class=v>{vn(s["gia_ban"])}</div></div>'
        )
    A("</div>")

    # ---------------------------------------------------------------- Phần I
    group2, (g3, sub3), (g4, sub4) = build_section2(lines)
    khung_items, nguon_items, ngoai_le_items = build_section1(nen, group2, g3, g4)

    A("<h2>I · Chi tiết giá</h2>")

    A("<h3>I.1 Cấu phần giá</h3>")
    tot_mh = s["mh"] or 1
    A("<div class=tw><table><thead><tr>"
      "<th>#</th><th>Cấu phần</th><th class=n>MH</th><th class=n>MD</th>"
      "<th class=n>Tỷ lệ</th></tr></thead><tbody>")
    for idx, (key, label, items) in enumerate(
        (
            ("khung", "Phí khung (một lần)", khung_items),
            ("nguon", "Gói theo nguồn", nguon_items),
            ("ngoai_le", "Ngoại lệ tính riêng", ngoai_le_items),
        ),
        start=1,
    ):
        A(
            f'<tr class=tot><td>I.1.{idx}</td><td>{e(label)}</td>'
            f'<td class=n>{vn(s[key], 2)}</td><td class=n>{vn(s[key] / s["mh_per_md"], 1)}</td>'
            f"<td class=n>{s[key] / tot_mh * 100:.0f}%</td></tr>"
        )
        for ref, item_label, mh in items:
            A(
                f'<tr><td></td><td>↳ <code>{e(ref)}</code> {e(item_label)}</td>'
                f'<td class=n>{vn(mh, 2)}</td><td class=n>{vn(mh / s["mh_per_md"], 1)}</td>'
                f"<td class=n>{mh / tot_mh * 100:.0f}%</td></tr>"
            )
    A(
        f'<tr class=tot><td></td><td>Σ</td><td class=n>{vn(s["mh"], 2)}</td>'
        f'<td class=n>{vn(s["md"], 1)}</td><td class=n>100%</td></tr>'
    )
    A("</tbody></table></div>")

    A("<h3>I.2 Đơn giá</h3>")
    if s.get("gia_ban"):
        g, gv = s["quydoi"], s.get("giavon")
        mode = s["gia_mode"]
        A(f'<div class=note>Cách tính <code>{e(mode)}</code> — '
          + ("bán theo đơn giá man-month; margin và overhead đã nằm trong đơn giá."
             if mode == "mm" else "dựng từ giá vốn rồi cộng margin lên trên.")
          + "</div>")

        A("<h4>I.2.1 Theo man-month</h4>")
        if mode == "mm":
            A(
                f'<div class=note>Đơn giá nhập ở <code>00-THAMSO</code> '
                f'({vn(P.num(p.get("don_gia_mm")))} {tien}) LÀ đơn giá bán BÌNH QUÂN / man-month '
                "trên toàn cơ cấu vai trò của dự án (không phải mức nền riêng vai trò nào) — "
                "nhân thẳng với Σ MM để ra Giá bán (mục I.3):</div>"
            )
            A("<div class=tw><table><tbody>")
            A(
                f'<tr><td>Đơn giá bán / man-month (bình quân, = số đã nhập)</td>'
                f'<td class=n>{vn(P.num(p.get("don_gia_mm")))} {tien}</td></tr>'
            )
            A(
                f'<tr class=tot><td>= Σ Giá bán ÷ Σ MM (đối chiếu)</td>'
                f'<td class=n>{vn(s["don_gia_mm"])} {tien}</td></tr>'
            )
            A("</tbody></table></div>")
            A(
                '<div class=note>Bảng phụ — suy ngược mức nền riêng từng vai trò (hệ số theo '
                "Điều 6) từ đơn giá bình quân trên, cho ai cần xem đơn giá riêng BA/DM/DA/PM; "
                "không ảnh hưởng Giá bán:</div>"
            )
            A("<div class=tw><table><thead><tr><th>Vai trò</th><th>Tên vai trò</th>"
              "<th class=n>Hệ số</th><th class=n>MD</th>"
              "<th class=n>Đơn giá / man-month (vai trò)</th></tr></thead><tbody>")
            tvt = s.get("theo_vai_tro", {})
            sum_md = sum(v["md"] for v in tvt.values()) or 1
            nen_mm = s.get("nen_mm") or 0
            for vt, v in tvt.items():
                A(
                    f"<tr><td>{e(vt)}</td><td>{e(P.ROLE_LABEL.get(vt, '—'))}</td>"
                    f"<td class=n>{P.ROLE_HESO[vt]:.2f}</td>"
                    f"<td class=n>{vn(v['md'], 1)}</td>"
                    f"<td class=n>{vn(nen_mm * P.ROLE_HESO[vt])}</td></tr>"
                )
            A(
                f'<tr class=tot><td></td><td>BQ {vn(s.get("weighted_heso"), 4)}</td>'
                f'<td class=n></td>'
                f'<td class=n>Σ {vn(sum_md, 1)}</td>'
                f'<td class=n>Nền (hệ số 1.00) = {vn(nen_mm)}</td></tr>'
            )
            A("</tbody></table></div>")
        else:
            A("<div class=tw><table><tbody>")
            A(
                f'<tr><td>Đơn giá bán / man-month (bình quân, theo cơ cấu vai trò)</td>'
                f'<td class=n>{vn(s["don_gia_mm"])} {tien}</td></tr>'
            )
            if gv:
                A(f'<tr><td>Giá vốn / man-month</td><td class=n>{vn(gv["gia_von_mm"])} {tien}</td></tr>')
            A("</tbody></table></div>")

        A("<h4>I.2.2 Theo man-day</h4>")
        A('<div class=note>Đơn giá quy đổi / man-day = Đơn giá bán / man-month ÷ MD/man-month '
          "(bảng quy đổi bên dưới):</div>")
        A("<div class=tw><table><tbody>")
        A(
            f'<tr><td>Đơn giá bán / man-month (bình quân)</td>'
            f'<td class=n>{vn(P.num(p.get("don_gia_mm")))} {tien}</td></tr>'
        )
        A(f'<tr><td>÷ MD / man-month</td><td class=n>{vn(g["md_per_mm"], 2)}</td></tr>')
        A(
            f'<tr class=tot><td>= Đơn giá quy đổi / man-day (bình quân)</td>'
            f'<td class=n>{vn(s.get("rate_md"))} {tien}</td></tr>'
        )
        A("</tbody></table></div>")
        A('<div class=note>Quy đổi man-month → ngày công:</div>')
        A("<div class=tw><table><thead><tr><th>Hạng mục</th><th class=n>Giá trị</th>"
          "<th>Giải thích</th></tr></thead><tbody>")
        for label, val, giai_thich in (
            (
                "MD danh nghĩa / năm", vn(P.num(p.get("md_nam")), 0),
                "Tham số <code>md_nam</code> ở <code>00-THAMSO</code> — số ngày làm việc danh "
                "nghĩa/năm (≈52 tuần × 5 ngày/tuần), CHƯA trừ lễ/phép.",
            ),
            (
                f'− nghỉ lễ {vn(P.num(p.get("ngay_le")), 0)} − phép '
                f'{vn(P.num(p.get("ngay_phep")), 0)}',
                vn(g["md_kha_dung"], 1),
                "Trừ ngày nghỉ lễ + phép năm theo luật/chính sách công ty (tham số "
                "<code>ngay_le</code>/<code>ngay_phep</code>).",
            ),
            (
                f'× utilization {pct(P.num(p.get("utilization")))}',
                f'{vn(g["md_ban_duoc"], 1)} MD bán được / năm',
                "<b>Utilization</b> = tỷ lệ thời gian THỰC SỰ sinh MH tính phí trên tổng ngày còn "
                "lại sau lễ/phép — phần còn lại dành cho họp nội bộ, đào tạo, chờ phản hồi khách "
                "giữa các giai đoạn.",
            ),
        ):
            A(f"<tr><td>{label}</td><td class=n>{val}</td><td>{giai_thich}</td></tr>")
        A(
            f'<tr class=tot><td>÷ 12 → MD / man-month</td>'
            f'<td class=n>{vn(g["md_per_mm"], 2)}</td>'
            f'<td>{vn(g["md_ban_duoc"], 1)} MD bán được/năm ÷ 12 tháng = {vn(g["md_per_mm"], 2)} '
            '— 1 man-month ở đây là NGÀY CÔNG THỰC bán được bình quân/tháng, không phải 1 tháng '
            'lịch (30 ngày)</td></tr>'
        )
        A("</tbody></table></div>")

        if gv:
            A("<div class=note>Giá vốn — dựng từ lương:</div><div class=tw><table><tbody>")
            for label, val in (
                (
                    f'Lương × {vn(P.num(p.get("thang_luong")), 1)} tháng × '
                    f'(1 + bảo hiểm {pct(P.num(p.get("bao_hiem_pct")))})',
                    vn(gv["cp_nhan_su"]),
                ),
                (f'+ overhead {pct(P.num(p.get("overhead_pct")))}', vn(gv["overhead"])),
            ):
                A(f"<tr><td>{label}</td><td class=n>{val} {tien}</td></tr>")
            A(
                f'<tr class=sub2><td>= tổng chi phí / người / năm</td>'
                f'<td class=n>{vn(gv["cp_tong"])} {tien}</td></tr>'
            )
            A(f'<tr><td>Giá vốn / MD</td><td class=n>{vn(gv["gia_von_md"])} {tien}</td></tr>')
            if s.get("margin_thuc") is not None:
                A(
                    f'<tr class=tot><td>Margin thực trên giá bán</td>'
                    f'<td class=n>{s["margin_thuc"] * 100:.1f}%</td></tr>'
                )
            A("</tbody></table></div>")
    else:
        thieu = "DON_GIA_MM" if s.get("gia_mode") == "mm" else "LUONG_THANG"
        A(f"<div class=note><code>{thieu}</code> chưa điền ở <code>00-THAMSO</code> "
          f"(gia_mode = <code>{e(str(s.get('gia_mode')))}</code>) — chỉ xuất MH / MD, "
          "chưa tính được đơn giá/Thành tiền.</div>")

    A("<h3>I.3 Thành tiền</h3>")
    if s.get("gia_ban"):
        A("<div class=tw><table><thead><tr><th>Hạng mục</th><th class=n>" + tien + "</th>"
          "<th>Giải thích</th></tr></thead><tbody>")
        rows = [
            (
                "Σ MM (man-month)", vn(s["mm"], 2),
                f'Σ MD ({vn(s["md"], 1)}) ÷ MD/man-month ({vn(g["md_per_mm"], 2)}) = '
                f'{vn(s["mm"], 2)} — xem cách ra 15,80 ở mục I.2.2',
            )
        ]
        if mode == "gia_von":
            rows += [
                ("Giá vốn / MD", f'{vn(s["rate_md"])} {tien}', ""),
                ("Chi phí", f'{vn(s["chi_phi"])} {tien}', ""),
                (f'Margin trên giá bán ({pct(s["margin_pct"])})', f'{vn(s["margin"])} {tien}', ""),
            ]
        for label, val, giai_thich in rows:
            A(f"<tr><td>{label}</td><td class=n>{val}</td><td>{giai_thich}</td></tr>")
        A(
            f'<tr class=tot><td>Giá bán</td><td class=n>{vn(s["gia_ban"])} {tien}</td>'
            '<td>Σ Giá bán từng vai trò (MD vai trò × hệ số × đơn giá nền) — xem bảng I.3.2</td></tr>'
        )
        A("</tbody></table></div>")

        A("<h4>I.3.1 Theo giai đoạn</h4>")
        A("<div class=note>a) Theo chặng hợp đồng — Discovery / Design / Delivery "
          "(chốt giá từng chặng)</div>")
        A("<div class=tw><table><thead><tr><th>Giai đoạn</th><th class=n>MH</th>"
          "<th class=n>MD</th><th class=n>%</th><th class=n>MM</th>"
          "<th class=n>Giá bán</th></tr></thead><tbody>")
        tot_gd_mh = sum(s["mh_giai_doan"].values()) or 1
        for gd, v in s.get("theo_giai_doan", {}).items():
            mh_gd = s["mh_giai_doan"].get(gd, 0.0)
            A(
                f"<tr><td>{e(gd.capitalize())}</td><td class=n>{vn(mh_gd, 2)}</td>"
                f"<td class=n>{vn(v['md'], 1)}</td>"
                f"<td class=n>{mh_gd / tot_gd_mh * 100:.0f}%</td>"
                f"<td class=n>{vn(v['mm'], 2)}</td>"
                f"<td class=n>{vn(v['gia_ban'])} {tien}</td></tr>"
            )
        A(
            f'<tr class=tot><td>Σ</td><td class=n>{vn(sum(s["mh_giai_doan"].values()), 2)}</td>'
            f'<td class=n>{vn(s["md"], 1)}</td><td class=n>100%</td>'
            f'<td class=n>{vn(s["mm"], 2)}</td>'
            f'<td class=n>{vn(s["gia_ban"])} {tien}</td></tr>'
        )
        A("</tbody></table></div>")
        A("<div class=note>Chốt Discovery trước; Design báo lại sau khi inventory "
          "được duyệt — không cam kết giá cố định cho nguồn chưa khảo sát. Delivery là "
          "hỗ trợ NHẸ sau bàn giao (đội DE tự triển khai) — thương lượng riêng, không "
          "bắt buộc đi kèm.</div>")

        A("<div class=note>b) Theo loại công — Thu thập / Phân tích &amp; thiết kế / Xác nhận "
          "&amp; bàn giao. Trục catalog mô tả cơ cấu công trong từng dòng mục, không gắn trực "
          "tiếp với chặng hợp đồng ở bảng (a). MH ở đây là công THEO CATALOG GỐC (trước khi trừ "
          "reuse/tự động hoá, không gồm Hạng mục nền) nên <b>Σ của bảng này KHÔNG bằng</b> Σ MH "
          "toàn báo giá/bảng (a) — chỉ dùng để xem tỷ lệ 3 loại công.</div>")
        tot_ph = sum(s["phase"].values()) or 1
        A("<div class=tw><table><thead><tr><th>Loại công</th><th class=n>MH</th>"
          "<th class=n>MD</th><th class=n>Tỷ lệ</th></tr></thead><tbody>")
        for ph, label in zip(PHASES, ("Thu thập", "Phân tích &amp; thiết kế", "Xác nhận &amp; bàn giao")):
            A(
                f"<tr><td><code>{ph}</code> {label}</td>"
                f'<td class=n>{vn(s["phase"][ph], 2)}</td>'
                f'<td class=n>{vn(s["phase"][ph] / s["mh_per_md"], 1)}</td>'
                f"<td class=n>{s['phase'][ph] / tot_ph * 100:.0f}%</td></tr>"
            )
        A(
            f'<tr class=tot><td>Σ</td><td class=n>{vn(tot_ph, 2)}</td>'
            f'<td class=n>{vn(tot_ph / s["mh_per_md"], 1)}</td><td class=n>100%</td></tr>'
        )
        A("</tbody></table></div>")

        A("<h4>I.3.2 Theo vai trò</h4><div class=tw><table><thead><tr><th>Vai trò</th>"
          "<th>Tên vai trò</th><th class=n>Hệ số</th><th class=n>MH</th>"
          "<th class=n>MD</th><th class=n>Tỷ lệ</th><th class=n>Giá bán</th>"
          "</tr></thead><tbody>")
        tot_vt_mh = sum(v["md"] * s["mh_per_md"] for v in s.get("theo_vai_tro", {}).values()) or 1
        for vt, v in s.get("theo_vai_tro", {}).items():
            mh_vt = v["md"] * s["mh_per_md"]
            A(
                f"<tr><td>{e(vt)}</td><td>{e(P.ROLE_LABEL.get(vt, '—'))}</td>"
                f"<td class=n>{P.ROLE_HESO[vt]:.2f}</td>"
                f"<td class=n>{vn(mh_vt, 2)}</td>"
                f"<td class=n>{vn(v['md'], 1)}</td>"
                f"<td class=n>{mh_vt / tot_vt_mh * 100:.0f}%</td>"
                f"<td class=n>{vn(v['gia_ban'])} {tien}</td></tr>"
            )
        A(
            f'<tr class=tot><td></td><td>Σ</td><td></td>'
            f'<td class=n>{vn(tot_vt_mh, 2)}</td>'
            f'<td class=n>{vn(sum(v["md"] for v in s.get("theo_vai_tro", {}).values()), 1)}</td>'
            f'<td class=n>100%</td>'
            f'<td class=n>{vn(sum(v["gia_ban"] for v in s.get("theo_vai_tro", {}).values()))} {tien}</td></tr>'
        )
        A("</tbody></table></div>")
    else:
        A('<div class=note>Giá bán chưa tính được — xem lý do ở mục I.2.</div>')

    # --------------------------------------------------------------- Phần II
    A("<h2>II · Chi tiết công việc</h2>")

    A("<h3>II.1 Hạng mục chung</h3><div class=tw><table><thead><tr><th>Mã</th>"
      "<th>Hạng mục</th><th class=n>MH</th><th>Ghi chú</th></tr></thead><tbody>")
    for n in nen:
        A(
            f'<tr><td><code>{e(n["code"])}</code></td><td>{e(str(n["ten"]))}</td>'
            f'<td class=n>{vn(n["mh"], 2)}</td><td>{e(str(n["ghi_chu"]))}</td></tr>'
        )
    A(
        f'<tr class=tot><td></td><td>Σ — Hạng mục nền</td>'
        f'<td class=n>{vn(sum(n["mh"] for n in nen), 2)}</td><td></td></tr>'
    )
    A("</tbody></table></div>")

    A("<h3>II.2 Hạng mục theo nhóm công việc</h3>")
    A("<div class=tw><table><thead><tr><th>#</th><th>Nhóm công việc</th>"
      "<th class=n>Số dòng</th><th class=n>MH</th><th class=n>MD</th>"
      "<th class=n>%</th><th style=width:22%></th></tr></thead><tbody>")
    g2_tot = sum(sub for _, _, sub in group2) or 1
    for i, (label, g, sub) in enumerate(group2, start=1):
        share = sub / g2_tot
        A(
            f"<tr><td>II.2.{i}</td><td>{e(label)}</td><td class=n>{len(g)}</td>"
            f"<td class=n>{vn(sub, 2)}</td>"
            f'<td class=n>{vn(sub / s["mh_per_md"], 1)}</td>'
            f"<td class=n>{share * 100:.0f}%</td>"
            f'<td><div class=bar style="width:{share * 100:.1f}%"></div></td></tr>'
        )
    A(
        f"<tr class=tot><td></td><td>Σ</td><td class=n>{sum(len(g) for _, g, _ in group2)}</td>"
        f"<td class=n>{vn(g2_tot, 2)}</td>"
        f'<td class=n>{vn(g2_tot / s["mh_per_md"], 1)}</td>'
        f"<td class=n>100%</td><td></td></tr>"
    )
    A("</tbody></table></div>")

    for i, (label, g, sub) in enumerate(group2, start=1):
        A(
            f"<h4>II.2.{i} {e(label)} <span class=gsum>{vn(sub, 2)} MH · "
            f'{vn(sub / s["mh_per_md"], 1)} MD · {sub / g2_tot * 100:.0f}% gói</span></h4>'
        )
        _dongmuc_table_html(A, g, s["mh_per_md"])
    A("<div class=sub>⚑ ngoại lệ tính riêng · ∅ ngoài phạm vi (MH = 0)</div>")

    A(
        f"<h3>II.3 Hạng mục báo cáo và bàn giao <span class=gsum>{vn(sub3, 2)} MH · "
        f'{vn(sub3 / s["mh_per_md"], 1)} MD</span></h3>'
    )
    if g3:
        _dongmuc_table_html(A, g3, s["mh_per_md"])
    else:
        A("<div class=note>(chưa có dòng mục)</div>")

    A(
        f"<h3>II.4 Hạng mục hỗ trợ triển khai <span class=gsum>{vn(sub4, 2)} MH · "
        f'{vn(sub4 / s["mh_per_md"], 1)} MD</span></h3>'
    )
    if g4:
        _dongmuc_table_html(A, g4, s["mh_per_md"])
    else:
        A("<div class=note>(chưa có dòng mục)</div>")

    # ------------------------------------------------------------- Phần III/IV
    nt_rows, nt_chung = nghiem_thu
    if nt_rows:
        kinds_dung = {l["kind"] for l in lines if not l["out_of_scope"]}
        A("<h2>III · Tiêu chí nghiệm thu</h2><div class=tw><table><thead><tr>"
          "<th>kind</th><th>Loại hạng mục</th><th>Đạt khi</th></tr></thead><tbody>")
        for kind, ten, tieu_chi in nt_rows:
            if kind in kinds_dung:
                A(f"<tr><td><code>{e(kind)}</code></td><td>{e(str(ten))}</td>"
                  f"<td>{e(str(tieu_chi))}</td></tr>")
        A("</tbody></table></div>")
        if nt_chung:
            A("<div class=note>Áp dụng cho mọi hạng mục: "
              + " · ".join(e(x) for x in nt_chung) + "</div>")

    if flags:
        A("<h2>IV · Rủi ro</h2><ul class=flags>")
        for f in flags:
            A(f"<li>{e(f)}</li>")
        A("</ul>")
    if warn:
        A("<h2>Phụ lục · Cảnh báo đọc file</h2><ul class=flags>")
        for w in warn:
            A(f"<li>{e(w)}</li>")
        A("</ul>")
    A("</div></body></html>")
    return "\n".join(O)


def main():
    ap = argparse.ArgumentParser(description="XLSX đã chốt -> markdown + html")
    ap.add_argument("--input", required=True, help="workbook .xlsx")
    ap.add_argument("--out-dir", required=True, help="thư mục lưu hai bản")
    ap.add_argument("--basename", help="tên file không đuôi; mặc định theo tên xlsx")
    ap.add_argument("--json", action="store_true", help="xuất thêm estimate JSON để sinh lại xlsx")
    ap.add_argument("--overwrite", action="store_true")
    ap.add_argument(
        "--set",
        dest="sets",
        action="append",
        metavar="KEY=VALUE",
        help="ghi đè tham số đọc từ file (what-if, không sửa xlsx); lặp lại được",
    )
    a = ap.parse_args()

    src = Path(a.input)
    if not src.exists():
        sys.exit(f"không thấy file: {src}")

    wb = load_workbook(src, data_only=False)
    need = {"00-THAMSO", "01-CATALOG", "02-ADDER", "03-DONGMUC", "04-NEN", "05-TONGHOP"}
    missing = need - set(wb.sheetnames)
    if missing:
        sys.exit(f"thiếu sheet: {', '.join(sorted(missing))}")

    cached_wb = load_workbook(src, data_only=True)

    p_file, meta = read_params(wb, cached_wb)
    p = P.resolve(p_file, P.parse_set(a.sets))
    cat = read_catalog(wb)
    adder_mh = read_adders(wb)
    lines, warn = read_lines(wb, cat, adder_mh, cached_wb)
    nen = read_nen(wb, P.num(p.get("so_thang"), 1) or 1)
    flags = read_flags(wb)
    nghiem_thu = read_nghiemthu(wb)
    s = rollup(lines, nen, p)
    if a.sets:
        warn.append("tham số bị ghi đè bằng --set: " + " · ".join(a.sets))

    out = Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    base = a.basename or src.stem
    f_md, f_html = out / f"{base}.md", out / f"{base}.html"
    for f in (f_md, f_html):
        if f.exists() and not a.overwrite:
            sys.exit(f"đã tồn tại: {f} — thêm --overwrite")

    f_md.write_text(md_report(meta, p, lines, nen, s, flags, warn, nghiem_thu), "utf-8")
    f_html.write_text(html_report(meta, p, lines, nen, s, flags, warn, nghiem_thu), "utf-8")
    print(f"markdown  → {f_md}")
    print(f"html      → {f_html}")

    if a.json:
        f_json = out / f"{base}.json"
        f_json.write_text(
            json.dumps(
                {
                    "schema": "estimate-dmba-v1.0",
                    "du_an": meta.get("Dự án", ""),
                    "khach_hang": meta.get("Khách hàng", ""),
                    "nguoi_lap": meta.get("Người lập", ""),
                    "ngay": str(meta.get("Ngày", "")),
                    "tham_so": p,
                    "lines": [
                        {
                            k: v
                            for k, v in l.items()
                            if k
                            in (
                                "stt", "hang_muc", "nguon", "kind", "code", "qty",
                                "giai_doan", "vai_tro",
                                "reuse_pct", "auto_pct", "adjust_pct", "ngoai_le",
                                "out_of_scope", "adders", "ghi_chu",
                            )
                        }
                        for l in lines
                    ],
                    "nen": [{"code": n["code"], "mh": n["mh_goc"], "ghi_chu": n["ghi_chu"]} for n in nen],
                    "rui_ro_flags": flags,
                },
                ensure_ascii=False,
                indent=2,
            ),
            "utf-8",
        )
        print(f"json      → {f_json}")

    print(
        f"\nΣ MH {vn(s['mh'], 2)} · Σ MD {vn(s['md'], 1)} · "
        f"{vn(s['mh_per_md'], 1)} MH/MD"
        + (f" · Σ MM {vn(s['mm'], 2)} · Giá bán {vn(s['gia_ban'])} {p.get('tien_te') or 'VND'}"
           if s.get("gia_ban") else "")
    )
    print(
        f"cấu phần: khung {vn(s['khung'], 1)} · nguồn {vn(s['nguon'], 1)} · "
        f"ngoại lệ {vn(s['ngoai_le'], 1)} MH"
    )
    tot = sum(s["phase"].values()) or 1
    print(
        "giai đoạn: "
        + " · ".join(f"{ph} {s['phase'][ph] / tot * 100:.0f}%" for ph in PHASES)
    )
    for w in warn:
        print(f"  ⚠ {w}")


if __name__ == "__main__":
    main()
