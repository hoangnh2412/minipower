# Changelog — minipower-work-desk

## 1.0.0 · 2026-11-15

- Lá mới theo [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2. Làm trọn vòng đời một ticket mà không mở app.
- Năm workflow: `create` (hai lệnh, nói rõ ở L2) · `update` (hỏi lại khi đổi người phụ trách chính hoặc loại việc) · `move` (chặn nhảy cóc, bắt lý do khi lùi, đổi người được giao theo bước) · `comment` (giữ nguyên lời người, diễn biến không nhét vào mô tả) · `close` (chỉ ở trạng thái kết thúc, đóng hàng loạt phải trình bảng).
- Mọi tên trường và tên trạng thái đọc từ `memory/tasks-config/`; không hardcode. Ghi đi qua cổng L2 → người OK → L3 của lá kênh.
- Không hỗ trợ xoá ticket — xoá không khôi phục được qua API.
