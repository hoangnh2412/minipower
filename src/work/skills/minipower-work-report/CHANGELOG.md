# Changelog — minipower-work-report

## 2.3.0 · 2026-11-21

- Hai vai khi nhắc nguyên tắc. Quản lý (`branch_of` null hoặc `oversight`): ghi comment nhắc thành viên trên ticket. Thành viên: nhắc chính người đang hỏi trong bản báo cáo, không ghi lên ticket.
- Raise vấn đề phải là ticket Support, tiêu đề bắt đầu bằng `[Vấn đề]`. Mỗi vấn đề có một comment thống nhất trên ticket đó, chứa tag `[Kết luận]`.

## 2.2.0 · 2026-11-21

- Nguyên tắc chat trên ticket và chat trong thread là việc của thành viên trong team.
- Đọc 10 comment cuối, thấy comment lệch nguyên tắc thì ghi một comment trên ticket nhắc lại đúng hai câu. Không nêu tên, không nhận xét. Lời nhắc đã có trong 10 comment thì không ghi lại.

## 2.1.0 · 2026-11-21

- Chat trên ticket (comment không có reply): raise vấn đề và chốt vấn đề. Thống nhất và xác nhận chỉ lấy ở đây.
- Chat trong thread (comment có reply): trao đổi chi tiết. Không lấy raise hay chốt từ thread.

## 2.0.0 · 2026-11-21

- Đổi khuôn ba bản ngày / tuần / tháng. Cùng ba mục: Milestone và Release sắp đến hạn kèm việc phát sinh, Story / Bug / Support cập nhật trong kỳ, ticket chậm deadline.
- Đọc đúng thứ tự khóa `type_map`: `milestone` → `release` → `story` → `bug` → `support`.
- Mỗi ticket trong bản có đủ Dự án, PIC, Assign, StartDate, EndDate, Loại. Thiếu thì ghi `thiếu`.
- Story, Bug, Support cập nhật trong kỳ: tóm tắt từ 10 comment mới nhất. Có vấn đề thì ghi đã thấy thống nhất và xác nhận trong các comment đó hay chưa.
- Chậm deadline khi `due` đã qua và chưa hoàn thành. Lý do chỉ lấy từ `field_roles.note`; trống thì ghi `chưa có`.
- Bỏ đếm ticket, đếm trạng thái, đoạn tóm tắt và mọi câu nhận xét.

## 1.0.0 · 2026-11-15

- Lá mới theo [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2. Soạn báo cáo có khuôn từ dữ liệu board; chỉ đọc.
- Ba workflow với ba trục khác nhau: `daily` (việc cần hành động hôm nay) · `weekly` (gom theo mốc, nhiều dự án) · `monthly` (một người, đếm theo ngày đóng).
- **Không tự chạy theo lịch** — Minipower không phải nơi chạy nền (ADR-022 QĐ-1). Nhịp đến từ bên ngoài; lá này chỉ soạn một bản khi được gọi.
- Bốn luật giữ báo cáo dùng được: có mốc thời gian · nêu thay đổi so với kỳ trước · không suy diễn nguyên nhân · mục rỗng ghi "không có" thay vì bịa cho đầy.
- Dựng khung cho ba nhu cầu báo cáo định kỳ ở issue #15.
