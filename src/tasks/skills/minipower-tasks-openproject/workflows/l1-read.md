# L1 — Đọc / tìm / lọc work package OpenProject

**Tiền đề:** [connect.md](connect.md) PASS (MCP catalog sống).

1. Face: `tasks_provider === openproject`. Namespace = `profile.mcp.tasks`.
2. Hỏi **một lượt** nếu thiếu: project (id/tên); WP # cụ thể; trạng thái/type; assignee; due/overdue; từ khóa subject; map `{MOD}-FR-` / `T-NNN`.
3. `GetDynamicTools` — chọn tool **có trong catalog**:
   - List project: tên hay gặp `search_projects`, `list_projects`, …
   - List/filter WP: `search_work_packages`, …
   - Chi tiết một WP: `get_work_package`, …
4. Phân trang: gọi page tiếp hoặc nói rõ đang cắt N bản ghi. Không bịa phần chưa đọc. Không bịa tên tool.
5. Trả 3–7 bullet + mục mở (+ bảng nếu cần). Dừng nếu người chỉ hỏi tìm/tóm tắt.
6. Cần ghi (tạo/sửa WP) → [l2-preview.md](l2-preview.md).
