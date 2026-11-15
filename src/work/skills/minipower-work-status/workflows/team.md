# Team — việc của đội

## 1. Đội gồm ai

`scope.team` nếu có khai. Không có ⇒ lấy toàn bộ `members.people`. Cả hai đều rỗng ⇒ dừng, chỉ sang `work-profile`.

Người hỏi về một nhánh cụ thể ("đội dev đang làm gì") ⇒ lọc theo `members.branch_of`.

## 2. Đọc và gom

Lọc theo phạm vi ở `scope`, loại trừ `exclude_stages`. Gom theo **ba chiều**, chọn chiều hợp câu hỏi:

| Người hỏi | Gom theo |
|---|---|
| "đội đang làm gì" | trạng thái — thấy việc ùn ở bước nào |
| "ai đang làm gì" | người được giao |
| "dự án nào đang nóng" | dự án |

## 3. Chỗ ùn — thứ đáng xem nhất

Một bước có nhiều việc đứng lại thường là nút thắt. Nêu **số liệu**, không kết luận:

- Bước nào đang giữ nhiều việc nhất so với các bước khác.
- Bước nào do một vai giữ mà vai đó chỉ có một người.
- Việc nằm ở một bước lâu bất thường so với phần còn lại.

**Không viết "X đang chậm".** Viết "bước review đang giữ 14 việc, nhiều gấp ba bước kế tiếp". Người đọc tự rút kết luận, và họ biết bối cảnh mà mình không biết.

## 4. Khối lượng theo người

Bảng `người | vai | đang làm | phụ trách | quá hạn`. Sắp theo số việc quá hạn giảm dần.

Lưu ý khi đọc: người có nhiều việc ở cột *phụ trách* mà ít ở cột *đang làm* không phải là rảnh — họ đang chờ người khác. Nói rõ điều này nếu bảng cho thấy vậy.

## 5. Trình

Mở đầu 3–7 gạch đầu dòng: *đội đang dồn ở đâu, có gì quá hạn, có ai đang gánh nhiều.*

Rồi bảng theo chiều đã chọn. Cuối: phạm vi, thời điểm đọc, có cắt trang không.
