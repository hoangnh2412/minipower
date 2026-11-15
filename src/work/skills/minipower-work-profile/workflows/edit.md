# Edit — sửa cấu hình bằng lời

Người nói *"thêm X vào đội DEV"*, *"bỏ dự án Y"*, *"từ nay review xong thì sang bước Z"* — skill sửa file, người không phải mở JSON.

## 1. Hiểu yêu cầu thuộc file nào

| Người nói về | File |
|---|---|
| Ai làm gì, ai là lead | `members.json` |
| Dự án nào đang chạy | `projects.json` |
| Luồng đi, đường lỗi, bước nào thì đóng việc | `status.json` |
| Trường nào đóng vai gì, loại việc nào ứng với lựa chọn nào, cây phân cấp | `profile.json` |
| Mặc định lọc gì khi không nói rõ | `scope.json` |

Yêu cầu đụng nhiều file ⇒ xử trọn một lượt, một bảng, không chia nhỏ bắt người OK nhiều lần.

## 2. Hai chỗ phải kiểm trước khi ghi

**Giá trị có thật trên board không.** Thêm người, thêm dự án, đổi tên nhóm — nhờ lá kênh đọc và đối chiếu. Không có thật ⇒ nói rõ: ghi vào cấu hình cũng vô dụng vì board không có chỗ chứa. Hỏi người tạo trên board trước.

**Có làm hỏng chỗ khác không.** Vài liên kết nội bộ dễ gãy:

| Sửa | Kiểm kèm |
|---|---|
| Bỏ một trạng thái | Nó có trong `flows` nào không · có phải `done_when` không · có trong `on_fail.from` không |
| Bỏ một người | Họ có phải lead trong `leads` không · có trong `scope.team` không |
| Bỏ một dự án | Có trong `scope.projects` không |
| Đổi `key` bất kỳ | **Từ chối** — `key` là hằng số; muốn đổi tên thì sửa `name` |

Gãy ⇒ nêu ra và đề nghị sửa kèm, không ghi nửa vời rồi để skill khác sập.

## 3. Trình và ghi

Bảng `file | khoá | cũ | mới`. Người OK rồi ghi, cập nhật `synced_at`.

Giữ nguyên định dạng mỗi phần tử một dòng và các dòng `_` giải thích — đừng format lại cả file vì một dòng đổi, `git diff` sẽ vô dụng.
