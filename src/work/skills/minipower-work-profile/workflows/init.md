# Init — dựng cấu hình lần đầu

Chạy khi `memory/tasks-config/` chưa có, hoặc đội chuyển sang board khác.

## 1. Kiểm tiền đề

1. `memory/profile.json` → `tasks_provider`. Chưa khai ⇒ dừng, hướng dẫn `minipower init`.
2. Lá kênh của provider đó đã kết nối chưa. Chưa ⇒ sang `connect` của lá kênh trước, đừng tự xoay xở.
3. `memory/tasks-config/` **đã có** ⇒ không ghi đè. Hỏi: cập nhật (sang [sync.md](sync.md)) hay dựng lại từ đầu.

## 2. Chọn board

Nhờ lá kênh liệt kê tasklist người này đọc được. Nhiều hơn một ⇒ **hỏi người chọn**, không đoán theo tên.

Chọn xong ghi tên vào `profile.json` → `workspace.tasklist`. **Ghi tên, không ghi guid** — guid tra lại mỗi phiên, tên thì người đọc hiểu.

## 3. Đọc những gì board trả lời được

| Đọc | Vào file |
|---|---|
| Danh sách trường tuỳ biến + kiểu + các lựa chọn | `profile.json` · `projects.json` |
| Danh sách nhóm / trạng thái | `status.json` → `stages` |
| Thành viên của board | `members.json` → `people` |

Board không có trường tuỳ biến nào ⇒ nói thẳng với người rằng phần lớn luật nghiệp vụ sẽ không thi hành được, hỏi họ có muốn tạo trường trước không. Đừng dựng cấu hình rỗng rồi để skill khác sập sau.

## 4. Hỏi những gì board không trả lời được — trọn gói một lượt

Liệt kê **tất cả** câu hỏi cùng lúc, kèm phương án gợi ý để người chỉ cần sửa chỗ sai:

| Cần biết | Gợi ý cách hỏi |
|---|---|
| Trường nào đóng vai loại việc, dự án, người phụ trách, ước lượng | Đưa danh sách trường đọc được, đề nghị ánh xạ, nhờ người sửa |
| Loại việc chuẩn nào ứng với lựa chọn nào | Ghép theo tên gần đúng, **đánh dấu rõ chỗ mình đoán** |
| Trạng thái nằm ở nhóm hay ở một trường | Suy từ tên nhóm đọc được, nhờ xác nhận |
| Luật chuyển: luồng chính từng nhánh, đường lỗi, đường huỷ | Vẽ chuỗi từ thứ tự nhóm, nhờ sửa |
| Trạng thái nào thì được đóng việc | Đề nghị nhóm cuối cùng |
| Vai của từng người | Đưa danh sách người, nhờ gán vai |
| Phạm vi mặc định: dự án nào, ai là "tôi" | Hỏi thẳng |

**Chỗ nào mình đoán thì phải nói là đoán.** Người sửa một chỗ nhanh hơn phát hiện một chỗ sai sau ba tuần.

## 5. Trình trước khi ghi

Một bảng `file | khoá | giá trị | nguồn` — nguồn là `đọc từ board` hay `người trả lời` hay **`đoán`**. Người OK rồi mới ghi.

## 6. Ghi

Năm file theo khuôn ở [project-skeleton/memory/tasks-config/](../../../../router/project-skeleton/memory/tasks-config/). Mỗi phần tử một dòng, không thụt lề, giữ các dòng `_` giải thích.

`synced_at` = hôm nay. Chỗ chưa có câu trả lời để **rỗng** và liệt kê ra cho người, **không điền bừa**.

## 7. Báo lại

- Cây 5 file đã ghi.
- Danh sách khoá còn rỗng và hệ quả của từng chỗ — ví dụ *"chưa khai vai cho ai ⇒ trả việc khi review không đạt sẽ phải hỏi người mỗi lần"*.
