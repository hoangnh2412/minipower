# Intake — ghi một việc mới thành issue

## 1. Kiểm chỗ đứng

Thư mục làm việc phải là repo Minipower: có `AGENTS.md`, có `ADRs/`, `git remote` trỏ về repo minipower. Lệch → dừng, nói rõ đây là skill nội bộ.

## 2. Nhận loại thẻ

Đọc lời người nói, đối chiếu bảng bốn loại trong [SKILL.md](../SKILL.md). **Nói ra loại mình chọn và vì sao**, một dòng. Không chắc → hỏi, không đoán.

## 3. Chọn cách soạn

| Loại thẻ | Soạn thế nào |
|---|---|
| Bài học | Mở `.github/ISSUE_TEMPLATE/lesson.yml`, đọc **các ô có thật** cùng ô nào bắt buộc, điền theo đó |
| Ý tưởng · Lỗi · Cải tiến | **Văn bản tự do**, không có form |

Văn bản tự do **không** có nghĩa là viết sao cũng được. Giữ ba thứ: nói rõ chuyện gì đang xảy ra, nói rõ muốn gì khác đi, và nêu chỗ nào còn chưa chắc. Thiếu thì hỏi ở bước 5.

**Không tự dựng form** cho loại chưa có form.

## 4. Tìm trùng — bắt buộc

Nhờ lá GitHub chạy bước tìm trùng. **Không bỏ qua, kể cả khi chắc chắn là việc mới.** Lặp lại một ý tưởng cũ là thứ tốn thời gian nhất của backlog.

Bước này **chỉ đọc tiêu đề**, không đọc thân thẻ, để khỏi tốn token. Thấy tiêu đề gần giống → **dừng**, báo số thẻ, tiêu đề, trạng thái, và vì sao nghi trùng. Người chọn gộp, bình luận vào thẻ cũ, hay mở thẻ mới. **Không mở trùng im lặng, không tự quyết thay người.**

## 5. Soạn nháp

- **Thân thẻ là lời của người.** Giữ nguyên câu chữ, chỉ tách đoạn và sửa lỗi gõ rõ ràng. Nhận xét của AI không vào thân — để dành cho bình luận sau khi thẻ đã tạo.
- Bài học: điền đúng các ô đọc được ở bước 3, không thêm ô, không bỏ ô bắt buộc.
- Loại khác: viết liền mạch theo cách người nói, không chia mục giả.
- Thiếu thông tin → hỏi **trọn gói một lượt**, liệt kê tất cả chỗ thiếu cùng lúc. Không hỏi nhỏ giọt.
- Tiêu đề phải **tìm lại được**: mang tên lá skill, tên module, tên file hoặc tên nhãn liên quan, khoảng 6 tới 12 từ. Đây là thứ duy nhất bước tìm trùng đọc, nên tiêu đề mơ hồ là thẻ trùng của ngày mai.
- Viết cho người đọc hiểu. Không nhồi đường dẫn file, không bảng quyết định, không kế hoạch triển khai — những thứ đó thuộc ADR.

## 6. Nhãn

Nhờ lá GitHub đọc **nhãn thật** của repo. Đề xuất nhãn loại thẻ và nhãn mức ưu tiên nếu có.

Nhãn phán quyết thì **để trống**, chủ repo tự gắn. Nhãn cần dùng mà chưa tồn tại → ghi rõ ở cột ghi chú là nhãn mới cần người tạo.

## 7. Soát trước khi đăng

Repo công khai. Kiểm: không secret, không tên khách hàng, không tên người. Nêu tên công cụ nội bộ thì được.

Có thì thay bằng X, Y, A, B và **nói rõ đã thay chỗ nào**.

## 8. Trình và ghi

Chuyển sang lá GitHub ở tầng L2: một bảng, người bỏ tick dòng không muốn, một câu OK cho phần còn lại. OK rồi lá đó mới ghi ở tầng L3.

Xong: báo `#NNN` kèm link. Nếu repo đã bật auto-add thì nói thêm là thẻ sẽ tự lên board.
