# Sổ đã quyết bỏ

Sổ này ghi những **cơ chế đã quyết gỡ khỏi Minipower**. Check [A12](checks/a12-decided-removed.mjs) đọc nó rồi soát xem repo còn sót dấu vết hay không.

Vì sao cần sổ: khi một cơ chế bị gỡ, phần code thường đi trước phần chữ. Tài liệu, `description` của lá, hợp đồng, README còn mô tả thứ không còn tồn tại — và **không test nào đỏ, không link nào gãy**. Agent đọc những chỗ đó rồi hành xử theo hệ đã chết.

## Cách ghi

Mỗi dòng một cơ chế, đúng khuôn sau — A12 chỉ đọc dòng khớp khuôn này:

```
- `<từ khoá>` — <trạng thái> — <ghi chú>
```

- **từ khoá**: chuỗi tìm được bằng `grep`, đặt trong dấu nháy ngược. Chọn chuỗi đặc trưng nhất (`project_mode` tốt hơn `mode`).
- **trạng thái**: `đang gỡ` → A12 **im** (còn sót là bình thường, việc chưa xong) · `đã gỡ` → A12 **báo** mọi chỗ còn sót.
- **ghi chú**: quyết định ở đâu, ngày nào — để người sau biết tra đâu.

A12 **không** soát `ADRs/` và chính sổ này: ADR là bản ghi lịch sử, nhắc tên cơ chế đã chết ở đó là đúng.

## Sổ

<!-- Chưa có dòng nào. Thêm dòng khi một cơ chế được quyết gỡ — đổi `đang gỡ` thành `đã gỡ` ở commit cuối cùng của việc gỡ, rồi chạy `npm run check:integrity` để soát phần chữ còn sót. -->

*(trống)*
