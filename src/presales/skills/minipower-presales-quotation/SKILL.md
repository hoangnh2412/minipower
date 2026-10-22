---
name: minipower-presales-quotation
description: Ước lượng BA phân tích & thiết kế data model logical 3 tầng (Bronze · Silver · Gold) rồi dựng báo giá — estimate JSON → Excel công thức sống (hiệu chỉnh tay) → báo giá nội bộ (md/html đầy đủ) → báo giá khách hàng (html lược bỏ phần nội bộ). Dùng khi báo giá dự án lakehouse/data platform ở vai trò BA, không phải phát triển phần mềm.
metadata:
  workflow: github
---

# minipower-presales-quotation

```
estimate.json ──to_xlsx.py──▶ XLSX (công thức sống)
                                  │  người chỉnh số & tỷ lệ trong Excel
                                  ▼
                 ◀─from_xlsx.py── XLSX đã chốt ──▶ .md + .html (nội bộ, +.json nếu cần)
                                  │
                                  ▼
                       to_customer_html.py ──▶ .html (gửi khách hàng)
```

Sau khi anh chỉnh Excel, **XLSX là nguồn chân lý** — kể cả catalog. `from_xlsx.py` đọc lại cả `01-CATALOG`, không dùng catalog gốc.

> Ba tài liệu, đọc theo thứ tự khi dựng báo giá mới:
> 1. **Tiêu chuẩn** — điều khoản bắt buộc (PHẢI/KHÔNG ĐƯỢC) mọi dự án phải tuân thủ, kèm phụ lục căn cứ → [references/phuong-phap-bao-gia.md](references/phuong-phap-bao-gia.md)
> 2. **Làm sao** — Điều N khớp 1:1 với Điều N ở tiêu chuẩn (bảng tham số, công thức, quy trình chạy — không phân tích) → [references/huong-dan-bao-gia.md](references/huong-dan-bao-gia.md)
> 3. **Ví dụ chạy đầy đủ, cả hai `gia_mode`** (dự án VNA Lakehouse) → [references/vi-du-vna-lakehouse.md](references/vi-du-vna-lakehouse.md)

Song song với [estimation-ulnl](../minipower-presales-estimation-ulnl/SKILL.md) — ULNL cho **phát triển phần mềm**, skill này cho **BA phân tích & thiết kế data model**. Khác domain, không trộn catalog, không gộp skill.

Input tối thiểu = danh sách hệ thống nguồn + số bảng/field đếm được. Thiếu khảo sát → [discovery](../../../discovery/skills/minipower-discovery-survey/SKILL.md).

## Hình dạng chi phí

Chi phí **không** tuyến tính theo số bảng. Đo trên dự án thật (718 bảng / 21.404 dòng field):

> ≈60% thu thập & hiểu nguồn · ≈25% dựng khung quy ước · ≈15% sản xuất artifact

Báo giá theo đơn giá/bảng là định giá đúng 15%. Vì vậy estimate chia **ba cấu phần**, không gộp:

| Cấu phần | Gồm | Mã |
|---|---|---|
| Phí khung (một lần) | quy ước 3 tầng, phương pháp luận, khung PII | `nen.*` |
| Gói theo nguồn | Σ dòng theo band × hệ số | `lines[]` |
| Ngoại lệ tính riêng | nguồn nhóm C nặng, nguồn bị chặn | `lines[].ngoai_le` |

## Bước 1 — Ước lượng: LLM làm gì

Chỉ điền `kind` và số đếm được **kèm trích nguồn**:

| `kind` | Số phải đếm |
|---|---|
| `ks_ht` | `has_doc` · `dba_ok` · `blocked` |
| `tq_ng` | `connected` — đã kết nối DB hay chưa |
| `brz` | `fields` · `doc_match` (1-3) · `self_describing` (1-3) |
| `slv` | `src_tables` · `cols` · `data_vault` |
| `gld_dim` | `attrs` · `scd2` |
| `gld_fct` | `measures` · `dims` · `grain_unclear` |
| `gld_dm` | `metrics` |
| `erd` | `muc` (1-4) — khớp mức Bronze của nguồn, xem Điều 9.1 |
| `logic` | `steps` |
| `map` | `rows` |
| `bc_bg` | `multi_source` |
| `gov` | `doi_tuong` · `pham_vi` (0/1/2) — **khách khai trong SOW, không tự chấm** |
| `pii_bang` | `fields` · `pii_fields` (bảng có ≥1 field PII) |

Thêm `adders` đếm được: `PII_F` · `CDC_OQ` · `GRAIN` · `ENUM` · `FK` · `FIRST` · `ROUND` · `EXPORT` · `SOFT_RULE` · `NEST_DEEP`.

Đếm không ra → `unclear: true`. **Không chọn mã, không cộng MH, không gán `auto_pct`.**

`classify()` · `lineMH()` · `adderMH()` · `nenMH()` · `sumMH()` · `components()` · `riskFlags()` trong `lib/`. Catalog `catalog/dmba-default.json`.

**Không có buffer rủi ro, không có ROM.** Rủi ro ở loại dự án này là *thiếu đầu vào* (không có DDL, nguồn chưa cấp quyền, nguồn đang phát triển) — nhân một hệ số vào giá không mua được DDL. `riskFlags()` chỉ **nêu** cờ để thương lượng phạm vi; nguồn thiếu đầu vào thì đưa `ngoai_le` hoặc `out_of_scope`.

Trục chi phí chính là **chất lượng đầu vào**, suy ra từ 2 tiêu chí điểm — chi tiết công thức → [references/huong-dan-bao-gia.md Điều 9.1](references/huong-dan-bao-gia.md):

| Mức | Điều kiện | Hệ quả |
|---|---|---|
| `1` | Tài liệu kế thừa toàn bộ (đã rà soát đối chiếu DDL/dữ liệu thật) | sinh được bằng script |
| `2` | Tài liệu kế thừa một phần | bán tự động |
| `3` | Không tài liệu dùng được, phải suy luận toàn bộ — nhưng cấu trúc tự mô tả (DDL/JSON/XML) | thiết kế tay |
| `4` | Như mức 3, **và** cấu trúc không tự mô tả (EDIFACT/TXT định vị theo code) | thiết kế tay + **cờ risk bắt buộc**, vẫn ước lượng được, không phải gate |

Phần **quản trị & bảo vệ dữ liệu** không đi theo trục này: độ sâu (`pham_vi`) là **khai báo phạm vi từ SOW** → [Điều 4.4](references/huong-dan-bao-gia.md); công mức bảng cho bảng có PII đi theo tỷ lệ field PII → [Điều 9.3](references/huong-dan-bao-gia.md).

MH trong catalog là **công tay**, chưa trừ tự động hoá. `auto_pct` trừ sau và **công khai với khách** — đối ứng không phải một dòng nền riêng, mà là hệ số "đầu nhóm không hưởng giảm" đã nằm sẵn ở mức dòng mục (adder `FIRST`).

## Bước 2 — Vòng tròn Excel (số thương mại, hiệu chỉnh tay)

```bash
python3 scripts/to_xlsx.py --input estimate.json --output out/bao-gia.xlsx \
  --set gia_mode=mm --set don_gia_mm=45_000_000 --set utilization=80%

python3 scripts/from_xlsx.py --input out/bao-gia.xlsx --out-dir out --json
```

| Cờ | Việc |
|---|---|
| `--set KEY=VALUE` | ghi đè tham số, **lặp lại được**. Nhận `80%` và `45_000_000`. Có ở cả hai script |
| `--list-params` | in bảng 18 tham số + mặc định rồi thoát |
| `--blank` | `to_xlsx` xuất template rỗng, chỉ nạp catalog |
| `--catalog` | dùng catalog khác (mặc định `catalog/dmba-default.json`) |
| `--basename` | tên file md/html; mặc định theo tên xlsx |
| `--json` | `from_xlsx` xuất thêm estimate JSON để sinh lại xlsx |
| `--overwrite` | cho ghi đè |

Thứ tự ưu tiên: **mặc định < `tham_so` trong estimate JSON < `--set`**.

`--set` trên `to_xlsx.py` ghi thật vào `00-THAMSO`; trên `from_xlsx.py` là **what-if** — tính lại báo cáo theo tham số mới mà không sửa workbook (bản md/html ghi rõ đã ghi đè gì).

Tham số sai tên, sai mode, hoặc `margin_pct ≥ 1` đều dừng ngay kèm danh sách hợp lệ — không âm thầm dùng mặc định.

Phụ thuộc: `python3` + `openpyxl`. Không cần Excel để chạy script.

### Workbook — 10 sheet, header luôn ở dòng 5

| Sheet | Việc | Ô nhập tay |
|---|---|---|
| `00-THAMSO` | **Toàn bộ 18 tham số nhập tay**, nhóm theo chủ đề | cột D |
| `01-CATALOG` | MH theo mã (công tay) | tt · pt · xn |
| `02-ADDER` | MH cộng thêm theo đặc tính | MH/đơn vị |
| `03-DONGMUC` | Dòng mục — gói theo nguồn | A..V (có `Giai đoạn`, `Vai trò`) |
| `04-NEN` | Hạng mục nền — phí khung | MH gốc |
| `05-TONGHOP` | Ba cấu phần → Σ MH → Σ MD → Σ MM → giá bán | — |
| `06-QUYDOI` | Năng lực: MD khả dụng → MD/man-month | — (dẫn xuất) |
| `07-GIAVON` | Giá vốn từ lương + bảo hiểm + overhead | — (dẫn xuất) |
| `08-VAITRO` | Hệ số đơn giá theo vai trò + MD theo chặng | hệ số (cột C) |
| `09-NGHIEMTHU` | Tiêu chí nghiệm thu theo `kind` | — (từ catalog) |

3 giai đoạn `discovery` / `design` / `delivery` (`delivery` là hỗ trợ NHẸ sau bàn giao, `kind=ho_tro`). Không có dòng buffer rủi ro, không có ROM; mode `mm` không có bước margin. Cờ rủi ro vẫn in ở cuối `05-TONGHOP` nhưng **chỉ để nêu**, không nhân vào giá.

Báo cáo nội bộ chia **5 phần**: (0) Tổng quan · (I) Chi tiết giá — cấu phần giá, đơn giá man-month/man-day, thành tiền theo giai đoạn + theo vai trò · (II) Chi tiết công việc — Hạng mục chung (nền) → 10 nhóm công việc → Báo cáo & bàn giao → Hỗ trợ triển khai · (III) Tiêu chí nghiệm thu · (IV) Rủi ro — kèm Phụ lục Cảnh báo đọc file. Sửa `WORK_GROUPS` trong `scripts/params.py` nếu muốn đổi cách gom nhóm.

### Công thức — một thứ tự duy nhất

```
MH gốc    = Σ(tt+pt+xn) × SL
MH adder  = Σ(MH/đơn vị × số lượng)        ← KHÔNG trừ auto_pct
MH        = (MH gốc × (1−reuse) × (1−auto) + MH adder) × (1+adjust)
```

`auto_pct` chỉ trừ phần sinh được bằng script. Phán xét con người (PII, CDC, grain) nằm ở adder nên không bị trừ.

### Hai cách tính giá — chọn bằng `gia_mode`

| mode | Đầu vào | Chuỗi |
|---|---|---|
| `mm` | `don_gia_mm` — đơn giá bán **bình quân** / man-month trên toàn cơ cấu vai trò (BA/DM/DA/PM) | Σ MD ÷ MD/MM → **Σ MM** × đơn giá bình quân = Giá bán |
| `gia_von` | `luong_thang` · `thang_luong` · `bao_hiem_pct` · `overhead_pct` · `margin_pct` | Σ MD × giá vốn/MD → Chi phí ÷ (1 − margin) = Giá bán |

**Ở mode `mm`, `don_gia_mm` KHÔNG phải mức nền riêng vai trò nào** (vd. riêng BA) — số nhập vào chính là đơn giá bình quân mục tiêu; `price()` trong `scripts/params.py` tự suy ngược mức nền theo hệ số vai trò (`ROLE_HESO`, weighted theo cơ cấu MD thật của dự án) để Σ Giá bán ÷ Σ MM khớp đúng số đã nhập, không lệch. Báo cáo nội bộ (I.2.1) in kèm bảng phụ suy ra mức nền từng vai trò cho ai cần xem riêng BA/DM/DA/PM.

Ở mode `mm`, đơn giá bán **đã gồm** margin và overhead → không cộng margin lần nữa.
Ở mode `gia_von`, margin là **trên giá bán**: chia `(1 − margin)`, không phải nhân `1 + margin`.

```
giá vốn/MD = (lương × số tháng × (1 + bảo hiểm)) × (1 + overhead_pct) ÷ MD bán được/năm
MD/man-month = ((MD danh nghĩa − lễ − phép) × utilization) ÷ 12
```

**Khối đối chiếu** ở cuối `05-TONGHOP` chạy ở cả hai mode khi có `luong_thang`: nó so đơn giá đang bán với giá vốn thật và in **margin thực trên giá bán**.

**Bẫy: 1 man-month không bằng 21,7 ngày.** Catalog đếm MH là giờ hữu ích, nên Σ MD là ngày hữu ích — mẫu số quy đổi phải là ngày *thực giao được* (≈15,80, không phải 260÷12).

`06-QUYDOI` và `07-GIAVON` được tính lại trong Python (`scripts/params.py`) khi đọc ngược, nên đúng số cả khi file chưa mở trong Excel.

### Đọc ngược — không tin cache Excel

`from_xlsx.py` **tính lại** mọi số từ ô nhập tay thay vì đọc kết quả công thức, nên chạy được cả khi file chưa từng mở trong Excel. Khi Excel có cache, script đối chiếu và báo lệch > 0,01 — bắt được ô công thức bị ghi đè tay.

Đọc dòng mục đến khi gặp 3 dòng trống liền nhau ở cả `Hạng mục` và `Mã`, nên thêm/xoá dòng giữa bảng không làm sai. Mã không có trong `01-CATALOG` thì bỏ qua kèm cảnh báo, không âm thầm tính 0.

### Thương mại — không commit

`DON_GIA_MM` và `LUONG_THANG` là số thương mại. `examples/` để cả hai `null`; truyền lúc chạy bằng `--set`, hoặc điền trong `00-THAMSO`. `.gitignore` của pack chặn `*.xlsx` và `out/`.

Tên khách hàng / dự án **không hardcode** ở đâu trong `scripts/` — đọc từ `00-THAMSO` (`Khách hàng`, `Dự án`) qua `read_params()`, hoặc truyền qua `--set`/cờ CLI. `examples/estimate-vna-lakehouse.json` và `references/vi-du-vna-lakehouse.md` là ví dụ minh hoạ công thức (số test, không phải đơn giá/khách thật) — không phải cấu hình mặc định.

## Bước 3 — Báo giá khách hàng (lược bỏ phần nội bộ)

`scripts/to_customer_html.py` đọc cùng workbook đã chốt, tái dùng mọi hàm đọc/tính của `from_xlsx.py` (không viết lại công thức) — chỉ bỏ phần giải thích nội bộ (catalog, provenance ĐO THẬT/GIẢ ĐỊNH, rủi ro, nghiệm thu), giữ **Tổng quan** (giá + 3 cấu phần) và **Chi tiết công việc** (theo nhóm, không drill-down từng dòng mục).

```bash
python3 scripts/to_customer_html.py --input out/bao-gia.xlsx --out-dir out \
  --unit manmonth --detail groups
```

| Cờ | Việc |
|---|---|
| `--unit manmonth\|manday` | đơn giá hiển thị theo man-month (mặc định) hay man-day |
| `--detail groups\|lines` | chi tiết công việc theo nhóm (mặc định, 13 dòng) hay từng dòng mục |
| `--khach-hang` / `--du-an` | ghi đè tên khách hàng/dự án; mặc định đọc `Khách hàng`/`Dự án` ở `00-THAMSO` |
| `--hieu-luc-ngay` | số ngày hiệu lực báo giá, mặc định 30 |
| `--basename` / `--overwrite` | như `from_xlsx.py` |

Script dừng ngay (không xuất file) nếu Σ MM × đơn giá (hoặc Σ MD × đơn giá/MD ở mode `manday`) lệch Giá bán quá 1 đồng — không âm thầm xuất báo giá sai.

PDF: chưa tự động — mở file `.html` trong trình duyệt rồi in ra PDF (thủ công).

## Hiệu chỉnh catalog

Catalog hiện tại là mức khởi điểm — chưa hiệu chỉnh trên giờ thực. Cách hiệu chỉnh: `--blank` → điền số bảng/field thật của một nguồn đã làm xong → so Σ MH với giờ thực đã bỏ ra → sửa `01-CATALOG` → `from_xlsx.py --json` để chốt lại catalog mới.

Người duyệt ba cấu phần, `gia_mode`, đơn giá và `utilization` trước khi sang Bước 3; duyệt lại bản khách hàng trước khi gửi (L3 kênh chat/docs).
