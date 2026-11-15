# Changelog — minipower-work-profile

## 1.0.0 · 2026-11-15

- Lá mới theo [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2/QĐ-3. Quản trị `memory/tasks-config/` — năm file cấu hình board của đội.
- Ba workflow: `init` (dựng lần đầu, hỏi trọn gói một lượt phần board không trả lời được) · `sync` (so cấu hình với board, `key` là hằng số, thứ mất thì đánh `active:false` chứ không xoá) · `edit` (sửa bằng lời, kiểm liên kết nội bộ trước khi ghi).
- Ranh giới: lá duy nhất được ghi `memory/tasks-config/`; không ghi board, không gọi MCP thẳng.
