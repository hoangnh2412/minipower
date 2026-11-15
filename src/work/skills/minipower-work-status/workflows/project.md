# Project — tiến độ một dự án

## 1. Chốt dự án

Người nêu tên ⇒ tra `projects.json`, khớp theo `name` hoặc `key`. Không khớp ⇒ đưa danh sách dự án đang hoạt động, hỏi.

Người không nêu ⇒ dùng `scope.projects`. Không có mặc định ⇒ hỏi, đừng gộp hết mọi dự án.

## 2. Đọc

Qua lá kênh, lọc theo trường dự án. Loại trừ các trạng thái trong `scope.exclude_stages`.

Dữ liệu cần: loại việc · trạng thái · người phụ trách · hạn · cờ hoàn thành · quan hệ cha–con.

## 3. Dựng bức tranh

**Mốc trước.** Lọc loại việc ứng với `milestone` trong `type_map`. Mỗi mốc: tên, hạn, còn bao nhiêu việc con chưa xong. Đội không khai loại mốc ⇒ bỏ phần này, nói rõ là đội không dùng khái niệm mốc.

**Phân bố theo trạng thái.** Đếm theo `status.stages`, giữ đúng thứ tự luồng. Đây là chỗ thấy việc đang ùn ở đâu.

**Việc cần chú ý** — ba nhóm, mỗi nhóm vài dòng:

| Nhóm | Cách nhận |
|---|---|
| Quá hạn | hạn đã qua, chưa đóng |
| Sắp tới hạn | hạn trong vài ngày tới |
| Đã xong việc, chưa chốt | đang ở `done_when` mà chưa đóng |

## 4. Hai chỗ dễ đếm sai

**Đừng đếm "việc tồn" chỉ bằng cờ hoàn thành.** Ticket ở `done_when` mà chưa đóng là *đã xong, chờ chốt* — tách riêng, đừng gộp vào việc tồn.

**Việc con và việc cha dễ đếm hai lần.** Nói rõ mình đang đếm cấp nào. Tổng số "việc" mà gộp cả hai cấp thì vô nghĩa.

## 5. Trình

Mở đầu 3–7 gạch đầu dòng trả lời thẳng: *dự án đang ở đâu, cái gì đáng lo, mốc gần nhất khi nào.*

Rồi bảng mốc, bảng phân bố trạng thái. Cuối cùng một dòng: lọc theo gì, đọc lúc nào, có bị cắt trang không.
