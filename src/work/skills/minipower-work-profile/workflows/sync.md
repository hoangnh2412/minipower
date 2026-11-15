# Sync — cập nhật cấu hình khi board đổi

Chạy khi người báo board có thay đổi. Cấu hình khai đủ nên **không tự phát hiện được** — người báo thì mới biết (ADR-046 §4 O1).

## 1. Đọc hai bên

Cấu hình hiện tại ở `memory/tasks-config/`, và trạng thái thật của board qua lá kênh. Đọc **cùng phạm vi**: trường tuỳ biến, lựa chọn của từng trường, nhóm trạng thái, thành viên.

## 2. So và phân loại

| Loại lệch | Ví dụ | Xử lý |
|---|---|---|
| **Thêm** | Board có lựa chọn mới, cấu hình chưa có | Đề nghị thêm, tự sinh `key` ổn định từ tên |
| **Đổi tên** | Cùng vị trí, khác chuỗi | Đề nghị sửa `name`, **giữ nguyên `key`** |
| **Mất** | Cấu hình có, board không còn | **Không xoá ngay** — đề nghị đánh `active:false`, vì dữ liệu cũ vẫn tham chiếu tới |
| **Mơ hồ** | Một mất một thêm, có thể là đổi tên hoặc là hai việc khác nhau | **Hỏi người**, không tự ghép |

**`key` là hằng số.** Báo cáo cũ, câu lệnh đã lưu, thói quen gõ của người — tất cả bám vào `key`. Đổi tên trên board chỉ đụng `name`.

## 3. Những gì sync không chạm

Luật chuyển trạng thái, vai của từng người, phạm vi mặc định — board không biết, nên **sync không đụng**. Nhóm trạng thái mới xuất hiện ⇒ nói rõ với người rằng nó **chưa có trong luồng nào**, hỏi chèn vào đâu.

## 4. Trình và ghi

Bảng `file | khoá | cũ | mới | loại lệch`. Người bỏ dòng không muốn, một câu OK cho phần còn lại.

Ghi xong cập nhật `synced_at`. Báo số dòng đã đổi theo từng file, và nhắc lại những chỗ còn rỗng.
