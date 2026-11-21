# L1 — Đọc / tìm / lọc task Lark

1. Face: `tasks_provider === lark`. MCP `mcp.tasks` sẵn sàng (schema `task_v2_*`).
2. Hỏi **một lượt** nếu thiếu: Owned (`my_tasks`) hay một tasklist; `completed`; cửa sổ thời gian; từ khóa lọc sau khi đã list; map ID Minipower.
3. Gọi đọc: `task_v2_task_list` (`type=my_tasks`) và/hoặc `tasklist_list` → `tasklist_tasks`. Chi tiết một id: `task_v2_task_get`. `useUAT: true` khi schema có và việc của user.
4. `page_token`: lấy tiếp hoặc nói rõ đang cắt N bản ghi. Không bịa phần chưa đọc. Không bịa tool `task_search`.
5. Trả 3–7 bullet + mục mở. Dừng đây nếu người chỉ hỏi tìm/tóm tắt.
6. Cần ghi (tạo/sửa) → [l2-preview.md](l2-preview.md).

## Comment — 10 comment mới nhất

Khi lá báo cáo, hoặc người hỏi trao đổi trên ticket, cần comment:

1. Soát catalog. Tool gọi: `task_v2_comment_list` (khai `-t`: `task.v2.comment.list`). Không có trong catalog ⇒ nói thiếu tool, trỏ [connect.md](connect.md) §3–§4. Không viết "không có comment".
2. Schema đầu phiên là SSOT cho tên tham số. Truyền resource của task (`resource_id` hoặc `task_guid` tùy schema), `resource_type=task` khi schema có, `direction=desc`, `page_size=10`. Chỉ lấy trang đầu — đó là 10 comment mới nhất. Ít hơn 10 thì lấy hết.
3. `useUAT: true` khi schema có và việc của user.
4. Lỗi quyền ⇒ scope `task:comment:read` chưa có hoặc chưa release. Nói rõ, không coi là ticket không có comment.
5. Trả nội dung, người viết, thời điểm, và `reply_to_comment_id`. Trống ⇒ chat trên ticket. Có giá trị ⇒ chat trong thread, trả cả id comment được trả lời. Không tóm tắt thay lá báo cáo khi caller là `minipower-work-report` — lá đó tự tóm tắt theo khuôn của nó.
