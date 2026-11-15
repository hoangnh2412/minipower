# Changelog — minipower-work-report

## 1.0.0 · 2026-11-15

- Lá mới theo [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2. Soạn báo cáo có khuôn từ dữ liệu board; chỉ đọc.
- Ba workflow với ba trục khác nhau: `daily` (việc cần hành động hôm nay) · `weekly` (gom theo mốc, nhiều dự án) · `monthly` (một người, đếm theo ngày đóng).
- **Không tự chạy theo lịch** — Minipower không phải nơi chạy nền (ADR-022 QĐ-1). Nhịp đến từ bên ngoài; lá này chỉ soạn một bản khi được gọi.
- Bốn luật giữ báo cáo dùng được: có mốc thời gian · nêu thay đổi so với kỳ trước · không suy diễn nguyên nhân · mục rỗng ghi "không có" thay vì bịa cho đầy.
- Dựng khung cho ba nhu cầu báo cáo định kỳ ở issue #15.
