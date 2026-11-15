# Close — đóng việc

Đánh dấu xong. Là thao tác **riêng** với chuyển trạng thái, vì công cụ giữ hai thứ đó ở hai trục độc lập.

## 1. Luật một dòng

Chỉ đóng được khi ticket đang ở trạng thái `status.done_when`.

Ticket ở chỗ khác mà người bảo đóng ⇒ **nêu ra**: ticket đang ở đâu, theo luồng còn mấy bước nữa. Rồi hỏi: đi tiếp cho đủ luồng, hay đóng tắt tại đây. Người chọn đóng tắt thì làm, nhưng phải để họ thấy mình đang bỏ qua cái gì.

## 2. Vì sao phải hỏi

Trạng thái và cờ hoàn thành **không ràng buộc nhau** — công cụ cho đóng ở bất kỳ đâu. Nên nếu máy im lặng làm theo, board sẽ dần có những ticket "xong" nằm rải rác giữa luồng, và mọi con số tiến độ sau đó đều sai.

Đây cũng là lý do đọc tiến độ phải dùng cả hai trục: ticket ở bước cuối mà chưa đóng nghĩa là **đã xong việc nhưng chưa chốt**, không phải lỗi dữ liệu.

## 3. Đóng hàng loạt

Cuối sprint thường đóng nhiều ticket một lượt. Trình **một bảng**:

```
ticket | tiêu đề | đang ở | đóng được?
…      | …       | …      | ✓ / ✗ còn N bước
```

Người bỏ tick dòng không muốn, một câu OK cho phần còn lại. **Không** đóng lặng lẽ cả loạt rồi báo sau.

## 4. Ghi và báo lại

Qua lá kênh, mỗi ticket một lệnh. Báo: số ticket đã đóng · ticket nào bị bỏ qua và vì sao.
