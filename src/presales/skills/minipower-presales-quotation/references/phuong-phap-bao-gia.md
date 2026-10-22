# Tiêu chuẩn báo giá — BA phân tích & thiết kế data model (DMBA)

| | |
|---|---|
| Mã tiêu chuẩn | `PRESALES-DMBA-STD` |
| Phiên bản | 2.5 |
| Trạng thái | Ban hành |
| Thay thế | v2.4.1, v2.4, v2.3, v2.2, v2.1, v2, v1 (xem Phụ lục C) |
| Engine tham chiếu | `minipower-presales-quotation` |

Tiêu chuẩn này quy định cách ước lượng và báo giá cho dự án mà vai trò là **BA phân tích & thiết kế data model** (lakehouse, DWH, migration — không bao gồm phát triển pipeline/hạ tầng). Mọi dự án thuộc phạm vi này **PHẢI** tuân thủ các điều khoản ở Phần I; **KHÔNG ĐƯỢC** thay thế bằng phương pháp khác (báo giá theo đơn giá/bảng phẳng, buffer rủi ro dạng hệ số nhân, phân loại độ phức tạp chủ quan) trừ khi có quyết định ngoại lệ bằng văn bản.

Tài liệu vận hành theo tiêu chuẩn này:

| Tài liệu | Vai trò |
|---|---|
| [huong-dan-bao-gia.md](huong-dan-bao-gia.md) | Bảng tham số, công thức, quy trình chạy — cách thực thi các điều khoản ở đây |
| [vi-du-vna-lakehouse.md](vi-du-vna-lakehouse.md) | Minh hoạ áp dụng trên một dự án thật |

---

# Phần I — Điều khoản bắt buộc

Từ khoá **PHẢI** / **KHÔNG ĐƯỢC** / **NÊN** / **CÓ THỂ** dùng theo quy ước: PHẢI = bắt buộc tuân thủ, không có ngoại lệ trừ quyết định bằng văn bản; KHÔNG ĐƯỢC = cấm; NÊN = khuyến nghị mạnh, có thể sai khác nếu có lý do ghi lại; CÓ THỂ = tuỳ chọn.

## 1. Phạm vi áp dụng

1.1. Tiêu chuẩn này áp dụng cho ước lượng và báo giá dự án **BA phân tích & thiết kế data model** — khảo sát nguồn, thiết kế mô hình dữ liệu logic/vật lý cho một hoặc nhiều tầng (Bronze/Silver/Gold hoặc tương đương), đặc tả mapping/transformation/data dictionary/data quality/KPI.

1.2. Tiêu chuẩn này **KHÔNG ĐƯỢC** dùng cho ước lượng phát triển phần mềm (dùng `estimation-ulnl`), phát triển pipeline ETL/ELT, hoặc vận hành hệ thống. **KHÔNG ĐƯỢC** trộn hai catalog ước lượng trong cùng một estimate.

## 2. Thuật ngữ

| Thuật ngữ | Định nghĩa |
|---|---|
| MH | Man-hour — giờ công hữu ích, không gồm thời gian chờ |
| MD | Man-day — MH ÷ số giờ/ngày công |
| MM | Man-month — đơn vị bán cho khách, quy đổi từ MD theo năng lực thực giao |
| `kind` | Loại hạng mục ước lượng (bảng Bronze, entity Silver, khảo sát hệ thống...) |
| Cấu phần | Một trong ba khối giá: phí khung · gói theo nguồn · ngoại lệ (Điều 4) |
| Giai đoạn | Một trong ba chặng: Discovery · Design · Delivery (Điều 5) |
| Ngoại lệ | Hạng mục không cam kết được giá cố định tại thời điểm báo giá (Điều 8) |
| Catalog | Bảng MH theo mã, có thể hiệu chỉnh theo dự án (Điều 11) |

## 3. Đơn vị ước lượng

3.1. Mọi estimate **PHẢI** dùng đơn vị đếm được trực tiếp từ dữ kiện quan sát được: bảng, entity, field, nguồn, nhóm nghiệp vụ, dòng mapping. **KHÔNG ĐƯỢC** dùng work package trừu tượng không gắn với số đếm cụ thể.

3.2. Hệ số phức tạp áp cho mỗi đơn vị **PHẢI** suy ra từ dữ kiện khách quan có thể kiểm chứng (có DDL hay không, có quyền truy cập hay không, schema đã đóng hay chưa...). **KHÔNG ĐƯỢC** dùng thang phân loại chủ quan không có tiêu chí rõ ràng (kiểu "Thấp/Trung bình/Cao" không định nghĩa ngưỡng).

3.3. Kết quả ước lượng **PHẢI** là một số truy vết được tới từng dòng mục (đơn vị, mã, hệ số). **KHÔNG ĐƯỢC** công bố một dải số rộng (ví dụ chênh lệch cận trên/dưới quá 50%) làm số báo giá chính thức.

3.4. Mọi giá trị ảnh hưởng tới giá — kể cả giá trị gán ở mức từng dòng như giai đoạn và vai trò — **PHẢI** được giữ nguyên khi hồ sơ được xuất ra và nạp lại. Một bộ báo giá dựng lại từ chính bản lưu của nó **PHẢI** cho ra cùng con số; nếu lệch thì hồ sơ đó **KHÔNG ĐƯỢC** coi là truy vết được theo 3.3, bất kể tổng khối lượng có trùng hay không.

3.5. Khi một đại lượng có cả số **đo được** và số **giả định**, mỗi dòng mục **PHẢI** ghi rõ nó đang dùng cơ sở nào. Với các đại lượng liên hệ số học với nhau (ví dụ số đơn vị và số thuộc tính của cùng một tập), **KHÔNG ĐƯỢC** lấy số đo cho đại lượng này và số giả định cho đại lượng kia trong cùng một bộ báo giá — phải đưa về cùng một cơ sở, hoặc tách thành các dòng riêng ghi rõ cơ sở của từng dòng.

## 4. Cấu trúc giá — ba cấu phần

4.1. Mọi estimate **PHẢI** tách giá thành ba cấu phần, không gộp thành một đơn giá duy nhất:

| # | Cấu phần | Đặc tính bắt buộc |
|---|---|---|
| 1 | Phí khung | Tính một lần, không co giãn theo số lượng đơn vị trong phạm vi |
| 2 | Gói theo nguồn | Co giãn tuyến tính theo số đơn vị × hệ số |
| 3 | Ngoại lệ | Không cam kết giá cố định tại thời điểm báo giá |

4.2. Phí khung **PHẢI** bao gồm tối thiểu: bộ quy ước thiết kế dùng chung, phương pháp luận, khung bảo vệ dữ liệu cá nhân (nếu phạm vi có PII), đối chiếu quy định quản trị dữ liệu của khách, hoạt động điều phối định kỳ. **KHÔNG ĐƯỢC** đưa vào phí khung chi phí của việc làm cần thiết để tạo ra kết quả của từng hạng mục (ví dụ công cụ/script sinh hạng mục, rà soát chất lượng từng hạng mục, cập nhật registry/trace của từng hạng mục) — việc đó **PHẢI** tính ở cấu phần 2, tại mức dòng mục (Điều 3), không tách thành một dòng phẳng không co giãn theo khối lượng.

4.3. Hạng mục **PHẢI** chuyển sang cấu phần 3 (ngoại lệ) khi thuộc một trong hai trường hợp: (a) chưa được cấp quyền truy cập cần thiết, hoặc (b) nguồn đang trong quá trình phát triển và schema chưa đóng. **KHÔNG ĐƯỢC** gộp các hạng mục này vào cấu phần 2 rồi báo giá cố định.

4.4. Với hoạt động quản trị và bảo vệ dữ liệu, estimate **PHẢI** khai báo riêng từng đối tượng công việc (quy trình, quy tắc, tài liệu — cho cả quản trị dữ liệu và bảo vệ dữ liệu) ở một trong ba độ sâu: ngoài phạm vi / tham gia xây dựng / tự thiết kế. Độ sâu **PHẢI** lấy từ yêu cầu của khách ghi trong hợp đồng hoặc SOW; **KHÔNG ĐƯỢC** tự suy luận hay tự chấm điểm độ sâu này như một tiêu chí độ phức tạp.

4.5. Đối tượng được khai ngoài phạm vi **PHẢI** giữ lại thành một dòng trong hồ sơ báo giá với giá trị bằng không và dấu hiệu loại trừ rõ ràng. **KHÔNG ĐƯỢC** xoá dòng khỏi hồ sơ — người đọc phải thấy được cái gì đã bị loại, không chỉ thấy cái gì được tính.

4.6. Khi độ sâu chưa được khách khai, hạng mục **PHẢI** để ở trạng thái ngoài phạm vi kèm ghi chú chờ chốt. **KHÔNG ĐƯỢC** mặc định sang mức tham gia hay mức thiết kế rồi báo giá.

## 5. Giai đoạn

5.1. Mọi estimate **PHẢI** gán mỗi dòng mục vào một trong ba giai đoạn:

| Giai đoạn | Nội dung | Điều kiện báo giá cố định |
|---|---|---|
| Discovery | Khảo sát, lập inventory, phân loại đầu vào, chốt baseline | Luôn báo giá cố định được |
| Design | Thiết kế mô hình các tầng | Chỉ sau khi inventory Discovery tương ứng đã được duyệt |
| Delivery | Hỗ trợ sau bàn giao cho đội triển khai | Thương lượng riêng theo SLA, không bắt buộc đi kèm |

5.2. **KHÔNG ĐƯỢC** báo giá cố định cho giai đoạn Design của phần phạm vi chưa hoàn tất Discovery.

5.3. Giai đoạn Delivery **KHÔNG ĐƯỢC** bao gồm sửa đổi model — mọi thay đổi thiết kế sau khi Design được nghiệm thu là phạm vi mới (change request), tính giá riêng.

## 6. Vai trò

6.1. Dòng mục **PHẢI** gán một vai trò thực hiện. Đơn giá nền (`don_gia_mm` hoặc `luong_thang`) **PHẢI** neo vào đúng một vai trò gốc; vai trò khác áp hệ số nhân lên đơn giá nền đó.

6.2. Hệ số vai trò **PHẢI** được công bố cùng hồ sơ báo giá — **KHÔNG ĐƯỢC** dùng hệ số ẩn không xuất hiện trong tài liệu gửi khách hoặc nội bộ lưu trữ.

## 7. Mô hình tính giá

7.1. Mỗi estimate **PHẢI** chọn đúng một trong hai mô hình, không trộn trong cùng một bộ báo giá:

| Mô hình | Dùng khi |
|---|---|
| Đơn giá bán theo man-month | Tổ chức đã có đơn giá bán chuẩn, đã gồm margin và overhead |
| Dựng từ giá vốn | Phải tự tính từ chi phí nhân sự, chưa có đơn giá chuẩn |

7.2. Nếu dùng mô hình đơn giá bán: **KHÔNG ĐƯỢC** cộng thêm margin một lần nữa lên trên đơn giá đã công bố.

7.3. Nếu dùng mô hình dựng từ giá vốn: margin **PHẢI** tính trên giá bán (chia cho `1 − margin`), **KHÔNG ĐƯỢC** tính theo kiểu cộng thêm phần trăm lên chi phí (nhân `1 + margin`) — hai cách cho kết quả margin thực khác nhau.

7.4. Mẫu số quy đổi man-month sang ngày công **PHẢI** trừ ngày lễ, ngày phép, và nhân với hệ số sử dụng thời gian thực tế (utilization). **KHÔNG ĐƯỢC** dùng số ngày lịch thuần (ví dụ 260 ÷ 12) làm mẫu số.

7.5. Khi hồ sơ có cả đơn giá bán và giá vốn, **PHẢI** tính và công bố nội bộ chỉ số margin thực (= 1 − giá vốn/man-month ÷ đơn giá bán/man-month) trước khi chốt giá gửi khách.

Công thức đầy đủ → [huong-dan-bao-gia.md Điều 7](huong-dan-bao-gia.md).

## 8. Xử lý rủi ro

8.1. **KHÔNG ĐƯỢC** dùng hệ số nhân (buffer) áp lên toàn bộ giá để bù rủi ro thiếu đầu vào.

8.2. Rủi ro do thiếu đầu vào (không có tài liệu kỹ thuật, chưa được cấp quyền, nguồn chưa ổn định) **PHẢI** xử lý bằng cách đưa hạng mục liên quan vào cấu phần ngoại lệ (Điều 4.3) hoặc loại khỏi phạm vi, không xử lý bằng cách tăng giá toàn bộ.

8.3. Cờ rủi ro **CÓ THỂ** được nêu trong hồ sơ báo giá để thương lượng phạm vi, nhưng **KHÔNG ĐƯỢC** dùng để tự động điều chỉnh số tiền.

## 9. Phân loại độ phức tạp đầu vào

9.0. Mỗi tầng thiết kế **PHẢI** có trục độ khó riêng, chấm trên đối tượng của tầng đó. **KHÔNG ĐƯỢC** dùng một trục duy nhất cho mọi tầng, cũng **KHÔNG ĐƯỢC** định giá một tầng chỉ bằng số lượng đơn vị mà không có trục độ khó:

| Mục | Trục | Chấm trên | Quyết định |
|---|---|---|---|
| 9.1 | Độ khó **cấu trúc dữ liệu** | từng bảng/entity | mã Bronze |
| 9.2 | Độ khó **nguồn dữ liệu** | từng hệ thống nguồn | mã khảo sát Discovery |
| 9.3 | Độ khó **bảo vệ dữ liệu** | từng bảng có dữ liệu cá nhân | mã công mức bảng |

9.1. (Cấu trúc dữ liệu — ảnh hưởng thiết kế Bronze) Mỗi hạng mục mức bảng/entity **PHẢI** được xác định mức chất lượng đầu vào SAU KHI rà soát đối chiếu tài liệu trình bày (nếu có) với DDL/dữ liệu thật. **KHÔNG ĐƯỢC** suy mức trực tiếp từ việc "có tài liệu hay không" mà không rà soát. Mức tính theo tổ hợp của (a) tài liệu kế thừa được đến đâu và (b) cấu trúc nguồn có tự mô tả được ý nghĩa field hay không; hệ số của các mức **PHẢI** khác nhau có ý nghĩa (không được đặt bằng nhau rồi gọi là có phân loại).

9.1a. Khi tài liệu không dùng được **và** cấu trúc không tự mô tả (định vị theo code/cột cố định, không có tên field mang nghĩa), hạng mục đó **PHẢI** được xếp vào một mức riêng so với trường hợp suy luận toàn bộ nhưng cấu trúc tự mô tả được. Mức riêng này **PHẢI** vẫn được ước lượng và đưa vào báo giá — **KHÔNG ĐƯỢC** biến thành điều kiện chặn (yêu cầu có tài liệu trước mới ước lượng); xử lý bằng cờ rủi ro theo Điều 8, không bằng cách từ chối báo giá.

9.1b. Cờ rủi ro cho mức riêng ở 9.1a **PHẢI** được nêu trong mọi trường hợp xuất hiện, không áp ngưỡng tỷ lệ như các cờ rủi ro khác.

9.2. (Nguồn dữ liệu — ảnh hưởng khảo sát Discovery) Mỗi hệ thống/nguồn ở giai đoạn Discovery **PHẢI** được chấm điểm theo bộ tiêu chí phức tạp nguồn (năm tiêu chí: tài liệu & DDL, quyền truy cập, độ ổn định schema, nền tảng kỹ thuật, số bên liên quan — xem bảng đầy đủ ở huong-dan-bao-gia.md Điều 9.2) để xác định mã khảo sát và có đưa vào ngoại lệ hay không.

9.2a. Khi quyền truy cập bị chặn hoàn toàn hoặc schema chưa đóng, nguồn đó **PHẢI** được xếp vào mã khảo sát nặng nhất và đưa vào ngoại lệ, bất kể điểm tổng của các tiêu chí còn lại.

9.2b. Trục 9.1 và trục 9.2 **CÓ THỂ** chấm trên cùng một dữ kiện (ví dụ: có tài liệu kỹ thuật hay không) nhưng **KHÔNG ĐƯỢC** gộp làm một: 9.2 quyết định công *khảo sát một hệ thống*, 9.1 quyết định công *thiết kế một bảng*. Hai deliverable khác nhau, hai mẫu số khác nhau.

9.3. (Bảo vệ dữ liệu — ảnh hưởng công mức bảng) Khi phạm vi có dữ liệu cá nhân, estimate **PHẢI** đếm và công bố ba số riêng biệt: (a) số bảng có dữ liệu cá nhân, (b) số trường dữ liệu cá nhân, (c) tỷ lệ trường dữ liệu cá nhân trên tổng số trường của từng bảng. **KHÔNG ĐƯỢC** định giá phần bảo vệ dữ liệu chỉ bằng số trường: quyết định cấp phân loại, nhóm quyền truy cập và chính sách lưu giữ phát sinh **một lần mỗi bảng**, không theo từng trường.

9.3a. Tỷ lệ ở 9.3(c) **PHẢI** được dùng để chọn cách xử lý (theo trường hay theo cả bảng) và ngưỡng phân band **PHẢI** hiệu chỉnh trên phân bố thật của dự án, không dùng ngưỡng mặc định mà chưa đo.

9.3b. Số trường dữ liệu cá nhân dùng ở 9.3(b) **PHẢI** đối chiếu khớp với số đã khai trong các hạng mục thiết kế bảng. Khi hai số lệch nhau, **KHÔNG ĐƯỢC** tự chọn một số để báo giá — phải mở vấn đề và ghi rõ chênh lệch trong hồ sơ.

## 10. Nghiệm thu

10.1. Mỗi loại hạng mục trong phạm vi **PHẢI** có tiêu chí nghiệm thu bằng văn bản, mô tả trạng thái kiểm tra được (ví dụ: đủ số trường bắt buộc, không còn ô trống, có xác nhận của vai trò liên quan) — **KHÔNG ĐƯỢC** mô tả bằng mức độ nỗ lực ("đã cố gắng", "làm kỹ").

10.2. Mọi hồ sơ nghiệm thu **PHẢI** ghi rõ: tiêu chí nghiệm thu áp dụng cho đặc tả/thiết kế, không bao hàm việc hệ thống thực thi đặc tả đó đã chạy đúng trên môi trường thật.

10.3. Số vòng review tiêu chuẩn là một vòng; vòng vượt mức **PHẢI** được tính thêm công riêng, không gộp miễn phí vào giá đã báo.

## 11. Hiệu chỉnh catalog

11.1. Catalog khởi điểm (giá trị MH mặc định theo mã) **KHÔNG ĐƯỢC** dùng trực tiếp cho báo giá chính thức khi chưa qua hiệu chỉnh trên giờ thực của dự án hoặc tổ chức đang áp dụng.

11.2. Hiệu chỉnh **PHẢI** theo quy trình: chọn một hạng mục đã hoàn thành → so Σ MH ước lượng với giờ thực đã dùng → sửa catalog → chốt lại bản ghi. Quy trình chi tiết → [huong-dan-bao-gia.md Điều 11.2](huong-dan-bao-gia.md).

11.3. Chênh lệch giữa catalog (trước hiệu chỉnh) và năng suất thực đo được **PHẢI** phản ánh vào margin, **KHÔNG ĐƯỢC** phản ánh vào số MH công bố — số MH **PHẢI** trung thực với công thực tế ước tính.

11.4. Nếu tỷ lệ tự động hoá (`auto_pct`) được công khai với khách hàng, hồ sơ báo giá **PHẢI** cho thấy chi phí tạo ra mức giảm đó đang nằm ở đâu trong cấu phần 2 (ví dụ hệ số không hưởng giảm trên đơn vị đầu nhóm) — **KHÔNG ĐƯỢC** công khai mức giảm mà không công khai chi phí tương ứng, và **KHÔNG ĐƯỢC** tách chi phí này thành một dòng phẳng ở phí khung (vi phạm 4.2).

## 12. Phân bổ thời gian — không trộn hai trục

12.1. Tỷ lệ phân bổ theo **thời gian trôi** (đo bằng lịch dự án: khảo sát, dựng khung, sản xuất) và tỷ lệ phân bổ theo **công thực trả** (tt/pt/xn trong catalog) **PHẢI** được giữ tách biệt trong mọi tài liệu nội bộ và bên ngoài.

12.2. **KHÔNG ĐƯỢC** dùng tỷ lệ thời gian trôi để chia tiền hoặc chia công; tỷ lệ này chỉ **được** dùng để lập lịch và đánh giá rủi ro chờ phụ thuộc bên ngoài (SME, DBA, phê duyệt).

## 13. Tiêu chí tuân thủ

Một bộ báo giá được coi là tuân thủ tiêu chuẩn này khi đáp ứng đủ:

- [ ] Giá tách rõ ba cấu phần (Điều 4), không có một đơn giá gộp duy nhất.
- [ ] Mọi dòng mục có giai đoạn và vai trò gán rõ (Điều 5, 6).
- [ ] Không có hệ số buffer rủi ro dạng nhân (Điều 8).
- [ ] Mọi hạng mục Discovery đã qua chấm điểm 5 tiêu chí phức tạp nguồn (Điều 9).
- [ ] Mọi bảng Bronze có tài liệu trình bày đã qua rà soát đối chiếu trước khi gán mức, không gán thẳng từ việc "có tài liệu" (Điều 9.1). Bảng mức riêng (9.1a) có cờ risk kèm theo, không bị chặn chờ tài liệu.
- [ ] Mọi loại hạng mục trong phạm vi có tiêu chí nghiệm thu bằng văn bản (Điều 10).
- [ ] Catalog đã qua ít nhất một lần hiệu chỉnh trên giờ thực, hoặc có ghi chú rõ "chưa hiệu chỉnh" kèm cảnh báo trong hồ sơ (Điều 11).
- [ ] Hồ sơ không trộn tỷ lệ thời gian trôi với tỷ lệ phân bổ công (Điều 12).
- [ ] Mọi đối tượng quản trị/bảo vệ dữ liệu đã khai độ sâu theo SOW; đối tượng ngoài phạm vi vẫn còn dòng trong hồ sơ với giá trị không (Điều 4.4–4.6).
- [ ] Nếu phạm vi có dữ liệu cá nhân: đã đếm đủ ba số (số bảng, số trường, tỷ lệ theo bảng) và số trường khớp giữa hạng mục bảo vệ và hạng mục thiết kế bảng (Điều 9.3).
- [ ] Hồ sơ dựng lại từ bản lưu của chính nó cho ra cùng con số (Điều 3.4).
- [ ] Mỗi dòng mục ghi rõ cơ sở đo hay giả định; không có cặp đại lượng liên hệ số học nào bị trộn hai cơ sở (Điều 3.5).
- [ ] Phí khung không chứa chi phí sản xuất từng hạng mục (công cụ, rà soát chất lượng, registry/trace) — các chi phí này đã tính ở mức dòng mục (Điều 4.2).

---

# Phần II — Phụ lục (không bắt buộc để tuân thủ, giúp hiểu căn cứ)

## Phụ lục A — Căn cứ

### A.1. Vì sao đơn vị phải đếm được (Điều 3)

Chi phí loại dự án này không tuyến tính theo số bảng. Đo git history một dự án đã chạy: thời gian khảo sát/họp, thời gian dựng bộ quy ước, thời gian sản xuất hàng loạt (sinh file từ DDL bằng script) lệch nhau rất xa — giai đoạn sản xuất có thể nhanh hơn khảo sát nhiều lần. Báo giá theo đơn giá/bảng phẳng định giá đúng phần sản xuất và làm vô hình phần khảo sát + dựng khung, nên Điều 4 bắt buộc tách ba cấu phần thay vì gộp.

Số đo cụ thể → [vi-du-vna-lakehouse.md §2](vi-du-vna-lakehouse.md).

### A.2. Vì sao ba cấu phần hành xử thương mại khác nhau (Điều 4)

| Cấu phần | Thương lượng thế nào |
|---|---|
| Phí khung | Thu một lần; phạm vi lớn hay nhỏ vẫn tốn chừng đó |
| Gói theo nguồn | Cắt phạm vi → giá đổi theo tỷ lệ, chứng minh bằng số đếm |
| Ngoại lệ | T&M, phụ lục khi nguồn sẵn sàng, hoặc loại khỏi phạm vi |

Nhận giá trọn gói cho hạng mục thuộc Điều 4.3 nghĩa là cam kết một việc không kiểm soát được thời điểm bắt đầu — đây là lý do Điều 4.3 bắt buộc, không phải khuyến nghị.

### A.3. Vì sao tính giá theo từng ô (giai đoạn × vai trò) (Điều 6, 7)

Hệ số vai trò khác nhau nên không thể nhân một lần trên tổng Σ MD — phải tính trên từng ô (giai đoạn, vai trò) rồi mới cộng. Hệ quả: ba cách cộng (theo chặng, theo vai trò, theo tổng) phải luôn ra cùng một số; nếu lệch là có lỗi tính toán, không phải làm tròn.

### A.4. Vì sao mẫu số quy đổi không phải ngày lịch thuần (Điều 7.4)

Dùng 260 ÷ 12 ≈ 21,7 ngày/tháng (chưa trừ gì) làm mẫu số là tự nhận mỗi người giao được 21,7 ngày hữu ích mỗi tháng — không nghỉ lễ, không nghỉ phép, không họp, không chờ phụ thuộc. Với lễ 11 + phép 12 + utilization 80% (mặc định catalog), mẫu số thật còn khoảng 15,8 — hụt khoảng 27% số man-month phải bán nếu dùng số ngày lịch thuần. Catalog đếm MH là giờ làm việc hữu ích nên Σ MD cũng phải là ngày hữu ích — quy đổi phải so cùng đơn vị.

### A.5. Vì sao chi phí tạo tự động hoá không nằm ở phí khung (Điều 4.2, 11.4)

Phiên bản trước đặt một dòng nền `TOOL` làm "đối ứng" khi công khai `auto_pct` với khách — lý do lúc đó: công khai mức giảm mà không công khai chi phí tạo ra mức giảm là không trung thực. Lý do đó vẫn đúng, nhưng chỗ đặt sai: công cụ/script không phải một khoản đầu tư một lần tách rời khỏi hạng mục — nó được dựng và điều chỉnh NGAY TRÊN từng hạng mục (viết script sinh bảng, chỉnh lại cho đúng cấu trúc riêng của hạng mục đó), nên chi phí này đã nằm trong công thiết kế hạng mục đầu nhóm — chính là lý do hạng mục đầu nhóm "không hưởng reuse" (Điều 3). Tách thêm một dòng nền cho đúng việc này là tính hai lần.

Cùng lý do áp cho rà soát chất lượng và cập nhật registry/trace: đây không phải việc làm một lần cho cả dự án, mà là việc phải làm **cho từng hạng mục** để hạng mục đó được coi là xong (Điều 10) — nó đã nằm trong công xác nhận & bàn giao của chính hạng mục, tính riêng ở nền là tính trùng với cấu phần 2.

### A.6. Vì sao không dùng buffer rủi ro (Điều 8)

Rủi ro ở loại dự án này là thiếu đầu vào: không có tài liệu kỹ thuật, nguồn chưa cấp quyền, nguồn đang phát triển. Nhân một hệ số vào giá không mua được tài liệu kỹ thuật còn thiếu — nó chỉ chuyển rủi ro sang bên báo giá và làm tờ giá khó bảo vệ trước khách. Xử lý đúng là đưa nguồn đó vào ngoại lệ hoặc ngoài phạm vi.

### A.7. Vì sao luật ghi đè trong phân loại độ phức tạp nguồn không chỉ cộng điểm (Điều 9.2a)

Quyền truy cập bị chặn hoàn toàn hoặc schema chưa đóng đều có nghĩa không kiểm soát được thời điểm xong — đúng định nghĩa ngoại lệ ở Điều 4.3. Một nguồn có thể có điểm tổng thấp (tài liệu tốt, nền tảng đơn giản) nhưng vẫn phải xếp mã nặng nhất nếu bị chặn truy cập, vì điểm tổng thấp không giải quyết được vấn đề "không biết khi nào gỡ chặn".

Bảng 5 tiêu chí đầy đủ và bảng quy đổi điểm → mã → [huong-dan-bao-gia.md Điều 9.2](huong-dan-bao-gia.md). Hiệu chỉnh và validate trên một dự án thật (37 nguồn) → [vi-du-vna-lakehouse.md §6](vi-du-vna-lakehouse.md).

### A.8. Vì sao cần nghiệm thu bằng văn bản (Điều 10)

Trả lời được "bao nhiêu tiền" nhưng không trả lời được "khi nào coi là xong" thì Σ MH đúng đến mấy cũng không bảo vệ được — khách có thể bảo chưa đạt, bên báo giá không có căn cứ phản bác. Điều khoản "nghiệm thu đặc tả không đồng nghĩa pipeline chạy đúng" (Điều 10.2) là điều khoản tự bảo vệ quan trọng nhất: phạm vi là *thiết kế*, không phải *vận hành*.

### A.9. Vì sao phân biệt hai trục tỷ lệ (Điều 12)

Chờ phụ thuộc bên ngoài (SME, DBA, phê duyệt) chiếm thời gian trôi nhưng không phải công phải trả. Dùng tỷ lệ thời gian trôi để chia tiền là lỗi dễ mắc nhất khi lập lịch và báo giá cùng một lúc — hai việc dùng hai mẫu số khác nhau.

### A.10. Vì sao mức 4 không phải điều kiện chặn (Điều 9.1a, 9.1b)

Ban đầu có hướng xử lý tổ hợp "không tài liệu + cấu trúc không tự mô tả" (EDIFACT/TXT trần) bằng cách chặn ước lượng, yêu cầu có tài liệu trước — giống cách xử lý nguồn bị chặn quyền truy cập. Nhưng hai tình huống khác bản chất: thiếu quyền truy cập là *không có gì để đọc*, còn ở đây dữ liệu mẫu vẫn tồn tại và đọc được, chỉ là *không chắc hiểu đúng ý nghĩa* nếu không có tài liệu. Chặn báo giá trong trường hợp này từ chối một việc làm được, chỉ vì nó có rủi ro — đi ngược nguyên tắc không buffer ở Điều 8 (xử lý rủi ro bằng cờ nêu, không bằng từ chối/hệ số). Xếp vào mức riêng + cờ risk bắt buộc giữ được cả hai: vẫn báo giá, và khách/người duyệt nhìn thấy rủi ro hiểu sai mà không cần dò tìm trong bảng chi tiết.

### A.11. Vì sao độ sâu phạm vi là khai báo, không phải điểm chấm (Điều 4.4)

Các trục ở Điều 9 đều là thứ mình **đo được từ dữ kiện**: đọc tài liệu thì biết kế thừa được bao nhiêu, đếm field thì biết band. Độ sâu tham gia vào việc quản trị dữ liệu không thuộc loại đó — nó phụ thuộc khách muốn giao gì, và cùng một bộ dữ kiện có thể ra "khách tự làm" hoặc "mình thiết kế toàn bộ" tuỳ hợp đồng. Tự chấm điểm cho nó nghĩa là tự đoán một con số lẽ ra phải đi hỏi, rồi báo giá trên phỏng đoán đó. Vì vậy Điều 4.4 xếp nó vào cấu trúc giá (phạm vi) chứ không vào Điều 9 (độ phức tạp), và Điều 4.6 bắt để trạng thái ngoài phạm vi khi chưa có câu trả lời — thiếu phạm vi thì báo giá thiếu, còn đoán phạm vi thì báo giá sai.

Lý do giữ dòng giá trị 0 (Điều 4.5): một tờ giá không có dòng nào về quản trị dữ liệu và một tờ giá có dòng ghi rõ "ngoài phạm vi" trông giống nhau về tiền nhưng khác nhau hoàn toàn khi tranh luận phạm vi về sau.

### A.12. Vì sao bắt buộc dựng lại ra cùng số, và cấm trộn cơ sở đo/giả định (Điều 3.4, 3.5)

Cả hai điều khoản này đến từ hai lỗi thật, phát hiện khi chạy kiểm tra chứ không phải khi đọc lại tài liệu.

**Lỗi 3.4:** công cụ xuất hồ sơ ra tệp trung gian nhưng làm rơi trường vai trò của từng dòng. Nạp lại thì mọi dòng rơi về vai trò mặc định hệ số 1,00, giá đổi khoảng 3% — trong khi tổng giờ công, tổng ngày công, tổng man-month **trùng khít**. Ba con số tổng khớp nhau là cái người duyệt hay nhìn để yên tâm, nên loại lỗi này đi qua mọi vòng rà soát bằng mắt. Chỉ có phép thử dựng-lại-rồi-so mới bắt được.

**Lỗi 3.5:** trong cùng một bộ báo giá, số thuộc tính (cột dữ liệu cá nhân) lấy theo **giả định phủ hết phạm vi**, còn số đơn vị (bảng chứa dữ liệu cá nhân) lấy theo **số đo trên tài liệu đã hoàn thành** — mà tài liệu mới hoàn thành một phần. Hai số đó liên hệ số học với nhau, nên trộn cơ sở làm phần công theo đơn vị bị tính thiếu khoảng một nửa, dù từng số nhìn riêng đều có căn cứ. Nguy hiểm ở chỗ số đo luôn *trông* đáng tin hơn số giả định, nên người lập có xu hướng dùng số đo ngay cả khi nó chỉ phủ một phần phạm vi.

## Phụ lục B — Đối chiếu với phương pháp khác

Tiêu chuẩn này hình thành từ việc đối chiếu bản thảo đầu tiên (v1) với một phương pháp báo giá Lakehouse độc lập (bottom-up man-day + phase-based fixed price + work package).

| | Tiêu chuẩn này | Phương pháp đối chiếu |
|---|---|---|
| Đơn vị ước lượng | Đối tượng đếm được (Điều 3) | Work package trừu tượng |
| Hệ số phức tạp | Suy từ dữ kiện khách quan (Điều 3.2, 9) | Thấp/TB/Cao — người chấm |
| Kết quả | Một số truy vết được (Điều 3.3) | Dải rộng (dễ gấp đôi cận dưới/trên) |
| Giai đoạn · nghiệm thu | Bắt buộc (Điều 5, 10) | Có, không bắt buộc hoá thành điều khoản |

Hai điểm **cố ý không áp dụng** từ phương pháp đối chiếu, vì đi ngược nguyên tắc ở Điều 3: dải số rộng (mất khả năng ký hợp đồng) và phân loại độ phức tạp không có ngưỡng khách quan.

Nếu áp dụng tiêu chuẩn này cho một dự án và thấy MD/đối tượng chênh lớn so với benchmark từ phương pháp khác, đó là tín hiệu cần hiệu chỉnh catalog (Điều 11) trước khi gửi khách — không phải trùng hợp bỏ qua được. Trường hợp thực tế đã gặp chênh lệch này → [vi-du-vna-lakehouse.md §7](vi-du-vna-lakehouse.md).

## Phụ lục C — Lịch sử phiên bản

| Version | Thay đổi chính |
|---|---|
| v1 | Đơn vị đếm được · trục A/B/C · 5 band · ba cấu phần · không buffer · hai mô hình giá |
| v2 | + Giai đoạn (ban đầu 2 chặng) · + Vai trò và hệ số · + Yêu cầu nghiệm thu bằng văn bản |
| v2.1 | Đổi tên chặng `modeling` → `design` cho khớp từ vựng `stage` dùng chung (`discovery · requirements · architecture · planning · implementation · qa · delivery · ops · cross-cutting · presales`); thêm chặng thứ ba `delivery` (hỗ trợ sau bàn giao, Điều 5.3) |
| v2.2 | Đổi nhãn trục chất lượng đầu vào (Điều 9.1) từ chữ `A`/`B`/`C` sang số `1`/`2`/`3` (1 = dễ nhất, 3 = khó nhất) — xác định độ khó nhất quán với band field-count và các mã `KS_HT1/2/3`. Mã catalog `BRZ_{mức}_{band}` thay cho `BRZ_{A/B/C}{band}`. Không đổi MH, không đổi hành vi tính giá |
| v2.3 | Điều 9.1: mức không còn suy trực tiếp từ cờ `has_ddl`/`has_survey_form` — bắt buộc rà soát đối chiếu tài liệu trước, mức tra theo tổ hợp 2 tiêu chí điểm (`doc_match` × `self_describing`). Thêm **mức 4** cho tổ hợp "không tài liệu + cấu trúc không tự mô tả" (EDIFACT/TXT) — vẫn ước lượng như thường, không chặn, kèm cờ risk bắt buộc không theo ngưỡng (Điều 9.1a, 9.1b). Thêm mã catalog `BRZ_4_1..5` (MH bằng mức 3) và adder `NEST_DEEP` (lồng >5 cấp) |
| v2.4 | Điều 4.4–4.6: thêm **ma trận khai báo phạm vi** quản trị & bảo vệ dữ liệu (5 đối tượng × 3 độ sâu: ngoài PV / tham gia / thiết kế) — độ sâu lấy từ SOW, KHÔNG tự chấm; đối tượng ngoài phạm vi phải giữ dòng giá trị 0. Điều 9.3: thêm trục **độ khó bảo vệ dữ liệu** ở mức bảng — bắt buộc đếm ba số (số bảng có PII, số trường PII, tỷ lệ theo bảng) và đối chiếu khớp giữa hai nơi khai. Thêm mã `GOV_*`/`BVD_*` (10 mã) và `PII_B1/2/3` |
| v2.4.1 | Điều 3.4: bắt buộc hồ sơ dựng lại từ bản lưu phải ra cùng số (bao gồm giá trị gán mức dòng như vai trò). Điều 3.5: cấm trộn cơ sở đo/giả định giữa các đại lượng liên hệ số học. Cả hai từ lỗi thật phát hiện khi kiểm tra — xem Phụ lục A.12 |
| v2.5 | Điều 4.2: bỏ "công cụ tự động hoá" khỏi nội dung bắt buộc của phí khung — chi phí này nằm ở hạng mục đầu nhóm (không hưởng reuse), tách riêng là tính hai lần. Điều 11.4 viết lại: công khai `auto_pct` phải trỏ tới chi phí ở cấu phần 2, không còn yêu cầu dòng nền riêng. Bỏ 3 mã nền `TOOL`/`QA_RB`/`TRACE` (cùng lý do: rà soát chất lượng và registry/trace là việc phải làm cho từng hạng mục, không phải việc làm một lần cho dự án) |

---

*Phần I là điều khoản bắt buộc. Phần II không bắt buộc đọc để tuân thủ — giữ lại để tra cứu căn cứ khi cần giải trình.*
