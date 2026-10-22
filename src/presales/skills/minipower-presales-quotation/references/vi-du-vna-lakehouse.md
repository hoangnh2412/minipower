# Ví dụ mẫu — VNA Lakehouse

> Lượt chạy thật trên dự án VNA Lakehouse, dùng engine `minipower-presales-quotation` v2.5. File này chỉ có **số** và **bằng chứng**. Bảng tham số/công thức thuần → [huong-dan-bao-gia.md](huong-dan-bao-gia.md). Tiêu chuẩn bắt buộc và căn cứ → [phuong-phap-bao-gia.md](phuong-phap-bao-gia.md). Mỗi mục dưới đây trỏ ngược lại mục/điều tương ứng ở cả hai file.
>
> Nguồn: `examples/estimate-vna-lakehouse.json` (cùng skill). Catalog `dmba-default v2.5.0`. Số tiền dùng **`don_gia_mm` = 40.000.000** và **`luong_thang` = 40.000.000** làm giá trị test để minh hoạ công thức chạy — **không phải đơn giá/lương thật**, điền số thật bằng `--set` trước khi gửi khách.

## 1. Lịch sử áp dụng cho dự án này

| Version | Σ MH | Σ MD | Giá bán @40tr/MM | Thay đổi |
|---|---:|---:|---:|---|
| v1 | 6.393,72 | 799,2 | 2,023 tỷ | Nền tảng: 3 cấu phần, không giai đoạn/vai trò |
| v2 | 6.393,72 | 799,2 | 2,091 tỷ | +Giai đoạn (2 chặng) · +Vai trò · +Nghiệm thu — Σ MH không đổi, chỉ đổi cách quy ra tiền |
| v2.1 | 6.737,72 | 842,2 | 2,200 tỷ | +Chặng Delivery (`ho_tro`, +12 MH) · **sửa phạm vi Discovery 34 → 37 nguồn** (+332 MH) |
| v2.2 | 6.737,72 | 842,2 | 2,200 tỷ | Đổi nhãn trục chất lượng đầu vào `A`/`B`/`C` → `1`/`2`/`3` (mã `BRZ_A3`→`BRZ_1_3`). Đổi tên, không đổi số |
| v2.3 | 6.737,72 | 842,2 | 2,200 tỷ | Bỏ cờ boolean `has_ddl`/`has_survey_form`, mức Bronze suy từ tổ hợp 2 tiêu chí điểm (`doc_match` × `self_describing`). Thêm **mức 4** (không tài liệu + cấu trúc không tự mô tả — EDIFACT/TXT): vẫn báo giá như thường, kèm cờ risk bắt buộc. 37 nguồn VNA hiện tại chưa có dòng nào rơi vào mức 4 nên Σ MH không đổi |
| v2.4 | 6.788,72 | 848,6 | 2,216 tỷ | +Ma trận phạm vi QTDL 5 dòng (cả 5 đang `Ngoài PV`, 0 MH — chờ chốt SOW) · +3 dòng PII mức bảng **đo thật** (64 bảng có PII: 47+15+2 theo band tỷ lệ) = **+51 MH** |
| v2.4.1 | 6.834,32 | 854,3 | 2,230 tỷ | Đếm lại PII trên CLM/PSS → **chốt `PII_F` = 521**; sửa chỗ trộn cơ sở: `pii_bang` đang lấy số **đo** (64 bảng, chỉ 2 nguồn) cạnh `PII_F` lấy số **giả định** (phủ 7 nguồn) → thêm dòng giả định 76 bảng cho 4 nguồn chưa điền (+45,6 MH). Thêm Điều 3.4/3.5 |
| v2.5 | 6.666,32 | 833,3 | 2,177 tỷ | Bỏ 3 mã nền `TOOL`/`QA_RB`/`TRACE` (−168 MH) — đây là việc phải làm để ra kết quả từng hạng mục, đã tính ở mức dòng mục (adder `FIRST`, phase xn), tính riêng ở nền là tính hai lần. Phí khung 608→440 MH |

**Vì sao 37, không phải 34:** số 34 ở v1/v2 là ước tính từ tuần khảo sát thứ 2 (giữa 09/2026). Số thật là **Plan_KS §4.2** (`DAT-001`), xác nhận lại 12/10/2026 — xem bằng chứng ở §3.

**Tách bạch +332 MH đến từ đâu** (đừng đọc nhầm là "332 MH vì thêm 3 nguồn"): thêm dòng GAS (+40 MH, `KS_HT2` không giảm) và sửa dòng gộp "nguồn chưa khảo sát" từ 22 đơn vị/giảm 35% (dữ liệu cũ, lạc quan) thành 24 đơn vị/giảm 10% (phản ánh đúng mức đa dạng domain của 24 nguồn thật — Khai thác, Dịch vụ, Quản trị chung không giống nhau) = +292 MH. Phần 292 MH này là **thay đổi giả định `reuse_pct`**, không chỉ là đếm lại số nguồn — ghi rõ ở đây để không lẫn với phần dữ kiện cứng (số 37).

Giá trị tham khảo (phương pháp, không gắn dự án) → [phuong-phap-bao-gia.md — Phụ lục C](phuong-phap-bao-gia.md).

## 2. Bằng chứng nguyên lý chi phí

### 2.1. Chi phí không tuyến tính theo số bảng

Đo trên git history của repo tài liệu dự án (6 tuần, 260 commit):

| Giai đoạn | Thời gian trôi | Kết quả |
|---|---|---|
| Khảo sát · họp · hiểu nguồn | ~4 tuần | brainstorm, meetings, weekly report |
| Dựng quy ước (SSOT) | ~1 tuần | 11 file, ~7.500 dòng |
| Sản xuất hàng loạt | ~1 tuần | **718 file bảng · 21.404 dòng field** |

718 bảng trong một tuần là không thể làm tay — nó được **sinh từ DDL bằng script**. Căn cứ cho Điều 3 và Điều 4 → [phuong-phap-bao-gia.md — Phụ lục A.1](phuong-phap-bao-gia.md).

### 2.2. Trục độ khó 1/2/3 — chất lượng đầu vào

CLM có 118 phiếu khảo sát → mức 1. PSS có **383 tài liệu nhưng 0 phiếu kỹ thuật** → mức 3, phải tự dựng schema. Cùng một số field, mức 3 đắt gấp ~2,5 lần mức 1 — minh hoạ cho yêu cầu hệ số phải khác nhau có ý nghĩa ở [phuong-phap-bao-gia.md Điều 9.1](phuong-phap-bao-gia.md); bảng mức 1/2/3 → [huong-dan-bao-gia.md Điều 9.1](huong-dan-bao-gia.md).

### 2.3. Phân bố field thật — hiệu chỉnh 5 band

718 bảng Bronze, phân bố: p50 = 14 · p75 = 28 · p90 = 59 · max = 364.

| Band | Số field | Số bảng thực |
|---|---|---:|
| 1 | ≤ 10 | 225 |
| 2 | 11–25 | 280 |
| 3 | 26–60 | 136 |
| 4 | 61–120 | 43 |
| 5 | > 120 hoặc chưa rõ | 34 |

### 2.4. Phân bố PII thật — hiệu chỉnh 3 band mức bảng

Đo 13/10/2026 trên `docs/04-platform/lakehouse/03-bronze/`: 779 file, **658 file đọc được khối COL** (121 file còn lại là file tổng hợp, không có khối COL). Field tính là PII khi có `MSK-L1..L4` / `ENC-L1..L4` / `ANON` / `PSEU`.

| | Số đo |
|---|---:|
| Σ field | 21.150 |
| Σ field PII | **236** (1,1%) |
| Bảng có ≥1 field PII | **64 / 658 = 9,7%** |
| Bảng không có field PII nào | 594 = 90,3% |

| Band tỷ lệ field PII | Số bảng thực | Σ field PII |
|---|---:|---:|
| ≤ 10% | 47 | 117 |
| > 10% – 25% | 15 | 99 |
| > 25% | 2 | 20 |

Tỷ lệ PII: p50 = 5,2% · p90 = 16,2% · max = 60%. Số field PII mỗi bảng: p50 = 2 · max = 21. Đây là căn cứ cho ngưỡng band ở [huong-dan-bao-gia.md Điều 9.3](huong-dan-bao-gia.md) — ngưỡng 10% và 25% đặt đúng chỗ phân bố thật gãy, không phải số chọn sẵn.

### 2.5. Đối chiếu `PII_F` theo từng nguồn — đã chốt

Đếm lại từng nguồn (13/10/2026) để giải quyết chênh lệch giữa số khai và số đo:

| Nguồn | Bảng | Σ field | PII đo | Báo giá khai | Chênh |
|---|---:|---:|---:|---:|---:|
| CLM | 117 | 2.116 | 54 | 57 | +3 |
| PSS | 188 | 8.055 | 182 | 182 | **0** |
| MRO | 254 | 5.492 | 0 | 144 | +144 |
| PRA | 26 | 2.221 | 0 | 56 | +56 |
| CRA | 20 | 1.988 | 0 | 50 | +50 |
| DCS CM + FM | 53 | 1.278 | 0 | 32 | +32 |
| **Σ** | | | **236** | **521** | **+285** |

**Kết luận: `PII_F` = 521 đáng tin, tài liệu mới là chỗ thiếu.** Hai nguồn đã điền PII trong tài liệu (CLM, PSS) khớp gần tuyệt đối — PSS lệch 0, CLM lệch 3 cột (0,45 MH). Toàn bộ 285 cột chênh nằm ở 4 nguồn chưa đánh dấu PII trong file Bronze (144+56+50+32 = 282) cộng 3 cột lệch của CLM. Việc còn lại là **điền PII vào tài liệu 4 nguồn đó**, không phải sửa báo giá.

**Chỗ trộn cơ sở đã sửa.** Phát hiện khi chốt số trên: `PII_F` = 521 lấy theo cơ sở **giả định phủ hết 7 nguồn**, còn `pii_bang` = 64 bảng lấy theo cơ sở **đo thật chỉ 2 nguồn** — hai đại lượng liên hệ số học nhưng khác cơ sở, làm phần công mức bảng bị tính thiếu khoảng một nửa. Đã thêm một dòng `pii_bang` giả định cho 4 nguồn chưa điền:

| Cách suy số bảng PII của 4 nguồn | Kết quả |
|---|---:|
| 282 cột ÷ 3,69 cột/bảng (tỷ lệ CLM+PSS) | 76 bảng |
| 353 bảng × 21,0% (tỷ lệ bảng có PII của CLM+PSS) | 74 bảng |
| *cùng tỷ lệ nếu dùng riêng CLM 10,3% / PSS 27,7%* | *36 / 98 bảng* |

Chọn **76 bảng**, band 1 (band hay gặp nhất: 47/64 bảng đo thật) → +45,6 MH. Thay bằng số đo khi tài liệu 4 nguồn điền xong. Điều khoản sinh ra từ lỗi này: [Điều 3.5 · Phụ lục A.12](phuong-phap-bao-gia.md).

## 3. Phạm vi — 37 nguồn Discovery, 5 nhóm theo mức sẵn sàng

Đối chiếu **Plan_KS §4.2** (`DAT-001`):

| Nhóm | SL | Mã | Nguồn |
|---|---:|---|---|
| Đã khảo sát sâu + Bronze Đợt 1 | 7 | `KS_HT1`/`KS_HT2` | PSS · CLM · MRO · DCS CM · DCS FM · REVERA-CRA · REVERA-PRA |
| Đã khảo sát sâu, Bronze hoãn | 2 | `KS_HT1`/`KS_HT2` | TIMS (92 xlsx, Q19 hoãn) · GAS (chỉ xem schema) |
| Ngoại lệ — bị chặn (Bravo) | 2 | `KS_HT3` | CMS · SPS — kickoff 16/09, Bravo chưa đồng ý PROD (chỉ UAT, cập nhật chậm hơn PRO) |
| Ngoại lệ — đang phát triển | 2 | `KS_HT3` | Flight OPS (GL 03/2027) · TOSS (GL 12/2026, không backup) |
| Chưa khảo sát | 24 | `KS_HT2` | Phần lớn domain Khai thác/Dịch vụ, Owner "Chưa rõ" trong Plan_KS |
| **Σ** | **37** | | |

Phạm vi toàn dự án: 718 bảng Bronze · 284 entity Silver · 114 object Gold · 42 nhóm nghiệp vụ.

## 4. Chạy cả hai mô hình giá — so sánh cạnh nhau

Cùng Σ MH 6.666,32 / Σ MD 833,3 / Σ MM 52,74 — chỉ khác cách quy ra tiền (căn cứ → [phuong-phap-bao-gia.md Điều 7 · Phụ lục A.3](phuong-phap-bao-gia.md); công thức → [huong-dan-bao-gia.md Điều 7](huong-dan-bao-gia.md)).

### 4.1. Ba cấu phần (không đổi theo mode)

| Cấu phần | MH | MD | % |
|---|---:|---:|---:|
| Phí khung | 440,0 | 55,0 | 7% |
| Gói theo nguồn | 5.954,3 | 744,3 | 89% |
| Ngoại lệ | 272,0 | 34,0 | 4% |
| **Σ** | **6.666,3** | **833,3** | **100%** |

### 4.2. mode `mm` — `don_gia_mm` = 40.000.000

```bash
--set gia_mode=mm --set don_gia_mm=40_000_000
```

| Giai đoạn | MD | MM | Giá bán |
|---|---:|---:|---:|
| Discovery | 202,6 | 12,82 | 512.784.810 |
| Design | 629,2 | 39,83 | 1.660.733.386 |
| Delivery | 1,5 | 0,09 | 3.797.468 |
| **Σ** | **833,3** | **52,74** | **2.177.315.665** |

| Vai trò | Hệ số | MD | Giá bán |
|---|---:|---:|---:|
| BA | 1,00 | 273,1 | 691.265.823 |
| DM | 1,00 | 464,6 | 1.176.203.006 |
| DA | 1,30 | 82,7 | 272.144.304 |
| PM | 1,15 | 12,9 | 37.702.532 |

**Giá bán: 2.177.315.665 đ · ROM 1.959.584.098 — 2.395.047.231 đ**

### 4.3. mode `gia_von` — `luong_thang` = 40.000.000 (test)

```bash
--set gia_mode=gia_von --set luong_thang=40_000_000 --set overhead_pct=40% --set margin_pct=20%
```

| Hạng mục | Giá trị |
|---|---:|
| Giá vốn / MD | 4.741.983 đ |
| Chi phí | 4.078.293.683 đ |
| Margin (20%) | 1.019.573.421 đ |
| **Giá bán** | **5.097.867.103 đ** |
| ROM | 4.588.080.393 — 5.607.653.814 đ |

| Giai đoạn | MD | MM | Giá bán |
|---|---:|---:|---:|
| Discovery | 202,6 | 12,82 | 1.200.610.852 |
| Design | 629,2 | 39,83 | 3.888.365.033 |
| Delivery | 1,5 | 0,09 | 8.891.218 |
| **Σ** | **833,3** | **52,74** | **5.097.867.103** |

| Vai trò | Hệ số | MD | Giá bán |
|---|---:|---:|---:|
| BA | 1,00 | 273,1 | 1.618.498.114 |
| DM | 1,00 | 464,6 | 2.753.907.810 |
| DA | 1,30 | 82,7 | 637.186.200 |
| PM | 1,15 | 12,9 | 88.274.980 |

### 4.4. So sánh

| | `mm` @40tr | `gia_von` (lương test 40tr) |
|---|---:|---:|
| Giá bán | 2.177.315.665 | 5.097.867.103 |
| Chênh | — | **×2,34** |

Chênh lớn vì hai con số 40tr **không cùng ý nghĩa**: mode `mm` dùng 40tr làm **đơn giá bán** (đã gồm margin + overhead); mode `gia_von` dùng 40tr làm **lương gross** rồi cộng thêm bảo hiểm 23,5% + overhead 40% + margin 20% lên trên — ra giá vốn/MD 4.741.983đ, cao hơn nhiều so với đơn giá 40tr/21,67 ngày ≈ 1,85tr/ngày nếu tính nhầm theo ngày lịch. Đây không phải lỗi — nó cho thấy **hai mode trả lời hai câu hỏi khác nhau** và không nên dùng cùng một con số 40tr cho cả hai mà không soát lại ý nghĩa.

## 5. Cách ra giá vốn — ví dụ tính số (mode `gia_von`)

Công thức → [huong-dan-bao-gia.md Điều 7.2](huong-dan-bao-gia.md). Số với `luong_thang` = 40.000.000, mặc định catalog còn lại:

| Bước | Công thức | Giá trị |
|---|---|---:|
| Chi phí nhân sự/năm | `40tr × 13 × (1+23,5%)` | 642.200.000 |
| Overhead | `642.200.000 × 40%` | 256.880.000 |
| Tổng chi phí/năm | | 899.080.000 |
| MD khả dụng/năm | `260 − 11 − 12` | 237,00 |
| MD bán được/năm | `237 × 80%` | 189,60 |
| MD / man-month | `189,60 ÷ 12` | **15,80** |
| **Giá vốn / MD** | `899.080.000 ÷ 189,60` | **4.741.983** |
| Giá vốn / man-month | `4.741.983 × 15,80` | 74.923.333 |

**Đối chiếu margin thực** (khi dùng mode `mm` nhưng vẫn có `luong_thang` để so sánh): đơn giá **bình quân thực tế** đang bán (sau khi trộn hệ số vai trò) là **41.284.042đ/MM** — cao hơn 40tr vì các dòng vai trò `DA`/`PM` kéo giá bình quân lên. So với giá vốn **74.923.333đ/MM** → margin thực **−81,5%** — tức đơn giá đang bán **thấp hơn giá vốn**, không phải lợi nhuận. Đây là tín hiệu rõ ràng: 40tr/MM chỉ hợp lý nếu đó là giá công ty đã có (đã tối ưu theo cách khác), không phải giá tự dựng từ lương 40tr/tháng.

## 6. Đối chiếu bộ tiêu chí phức tạp với 37 nguồn thật

Bộ 5 tiêu chí → [huong-dan-bao-gia.md Điều 9.2](huong-dan-bao-gia.md). Áp vào một số nguồn đại diện:

| Nguồn | (1) Tài liệu | (2) Truy cập | (3) Ổn định | (4) Nền tảng | (5) Owner | +vendor | Tổng | → Mã |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| CLM | 1 | 1 | 1 | 1 | 1 | — | 5 | `KS_HT1` ✓ |
| PSS | 3 | 1 | 1 | 2 | 1 | — | 8 | `KS_HT2` ✓ |
| GAS | 2 | 2 | 1 | 1 | 3 | — | 9 | `KS_HT2` ✓ |
| CMS/SPS (Bravo) | 3 | **3** | 1 | 2 | 3 | +1 | — | `KS_HT3` (luật ghi đè) ✓ |
| Flight OPS/TOSS | 3 | 2 | **3** | — | — | — | — | `KS_HT3` (luật ghi đè) ✓ |
| 24 nguồn chưa khảo sát | 3 | 2 | 1 | 2 | 3 | — | 11 | `KS_HT2` ✓ |

Khớp đúng cách phân loại thật ở §3 — bảng tiêu chí ở file hướng dẫn **không phải suy diễn trừu tượng**, nó được hiệu chỉnh ngược từ chính 37 nguồn này.

## 7. Đối chiếu với phương pháp tư vấn ngoài

Phương pháp so sánh → [phuong-phap-bao-gia.md — Phụ lục B](phuong-phap-bao-gia.md). Số cụ thể cho dự án này:

Phương pháp ngoài (bottom-up man-day, work package WP1–WP8) cho baseline **210–430 MD** cho một chương trình Lakehouse nhiều domain, chưa biết số đối tượng cụ thể. Áp vào phạm vi VNA (718+284+114 = **1.116 đối tượng**):

| Nguồn ước lượng | MD/đối tượng |
|---|---:|
| Phương pháp ngoài — cận trên (430 MD) | 0,39 |
| Engine này (v1, trước hiệu chỉnh) | 0,72 |

Chênh gần **hai lần**. Không phải so sánh ngang hàng (phương pháp ngoài không neo vào số đối tượng thật), nhưng là kiểm tra chéo đáng điều tra. Hai khả năng:

- Catalog đang tính quá tay (chưa hiệu chỉnh trên giờ thực — [huong-dan-bao-gia.md Điều 11](huong-dan-bao-gia.md)).
- Phương pháp ngoài tính thiếu vì không đếm được khối lượng thật.

**Việc còn nợ:** lấy một nguồn đã làm xong (CLM hoặc DCSFM), so Σ MH catalog với giờ thực đã bỏ ra, để phân định bên nào đúng. Chưa làm tại thời điểm viết tài liệu này.

## 8. Độ nhạy — bốn chỗ đáng soát lại trước khi gửi khách

| Sửa | MD | Δ |
|---|---:|---:|
| gốc (v2.5) | 833 | — |
| 24 nguồn chưa khảo sát → giả định khảo sát nhẹ hơn (reuse 30%) | 809 | −24 |
| `auto_pct` mức 1: 0,65 → 0,85 | 804 | −30 |
| `auto_pct` mức 3: 0,10 → 0,40 | 755 | −78 |
| bỏ tầng Gold (chưa có template cột) | 781 | −52 |
| **cả 4** | **649** | **−184** |

`auto_pct` mức 3 = 0,10 vẫn là chỗ sai rõ nhất của catalog: đặt thấp vì cho rằng flatten JSON/XML không automate được, nhưng thực tế đã sinh được 200 file PSS bằng script.

## 9. Tham số VNA — cái gì thật, cái gì giả định

| | Tham số | Vì sao |
|---|---|---|
| ✅ | `mh_per_md` = 8 · `md_nam` = 260 | Cơ sở thật: 8 giờ/ngày · 260 ngày thường/năm |
| ⚠️ | `utilization` = 80% | **Nhạy nhất** — chốt bằng dữ liệu chấm công, đừng để mặc định |
| ❌ | `ngay_le` = 11 · `ngay_phep` = 12 | Giả định |
| ❌ | `thang_luong` · `bao_hiem_pct` · `overhead_pct` · `margin_pct` | Giả định; chỉ ảnh hưởng khi `gia_mode = gia_von` |
| ❌ | `auto_1/2/3` | Giả định — xem bảng độ nhạy §8, `auto_3` sai rõ nhất |
| ✅ | `PII_F` = 521 cột | **Đã chốt** — CLM và PSS (hai nguồn đã điền PII) khớp 54/57 và 182/182; xem §2.4 |
| ❌ | `pham_vi` của 5 dòng `kind=gov` | Chưa khai báo — cả 5 đang `Ngoài PV`, MH = 0, chờ chốt SOW (Điều 4.4) |
| ✅ | 64 bảng có PII (CLM·PSS) · 47/15/2 theo band | Đo thật 13/10/2026 — xem §2.4 |
| ⚠️ | 76 bảng PII của 4 nguồn chưa điền | Giả định, suy hai cách tụ về ~76 — thay bằng số đo khi tài liệu điền xong (§2.4) |
| ❌ | toàn bộ `01-CATALOG` | v2.5.0, chưa hiệu chỉnh trên giờ thực |
| — | `don_gia_mm` · `luong_thang` | Số thương mại, để trống trong repo — toàn bộ số 40tr trong tài liệu này là **giá trị test minh hoạ công thức**, không phải giá thật |

**`utilization` quyết định mẫu số quy đổi, đổi thẳng vào giá:**

| utilization | MD / man-month | Σ MM | Giá bán @40tr (mm) |
|---:|---:|---:|---:|
| 70% | 13,82 | 60,27 | 2.488.360.759 |
| **80%** | **15,80** | **52,74** | **2.177.315.665** |
| 90% | 17,78 | 46,88 | 1.935.391.702 |

Mỗi 10 điểm utilization đổi giá khoảng 0,25–0,32 tỷ. Chốt số này bằng dữ liệu chấm công thật, đừng để mặc định 80%.

---

*Dựng 10/2026 từ dự án VNA Lakehouse. Số đối tượng/git-history ở §2–3 là số thật đếm trên repo `documents`; số tiền (40tr) ở mọi mục là số test minh hoạ công thức, không phải đơn giá/lương thật của bất kỳ ai.*
