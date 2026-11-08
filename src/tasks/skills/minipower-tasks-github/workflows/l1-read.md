# L1 — Đọc / tìm / lọc GitHub Issue

**Tiền đề:** [connect.md](connect.md) PASS, và đã biết repo đích.

1. Repo đích từ `git remote`. Có `memory/profile.json` thì `tasks_provider` phải là `github`.
2. Hỏi **một lượt** nếu thiếu: issue số mấy; trạng thái mở hay đóng; nhãn nào; người được giao; cửa sổ thời gian; từ khóa tiêu đề; map `{MOD}-FR-` / `T-NNN`.
3. Chọn tool **có trong catalog**:
   - Liệt kê theo bộ lọc đơn giản: `list_issues`
   - Truy vấn có từ khóa hoặc điều kiện phức: `search_issues`
   - Chi tiết một issue kèm bình luận: `issue_read`
   - Nhãn thật của repo: `get_label` hoặc tool liệt kê nhãn
   - Board: `projects_list`, `projects_get`
4. **Luôn truyền `fields`** chỉ gồm thứ đang cần. Bỏ `body` khi chỉ cần danh sách — đó là phần tốn token nhất. Mở thân issue bằng `issue_read` chỉ cho thẻ thật sự phải đọc.
5. **Luôn giới hạn trang 5–10 mục** rồi hỏi có đọc tiếp không. Không kéo cả backlog vào ngữ cảnh.
6. Không bịa phần chưa đọc, không bịa tên tool, không suy trạng thái board từ nhãn.
7. Projects trả 403 → ghi một dòng "chưa đọc được board, token thiếu quyền Projects" rồi tiếp tục phần issue.
8. Trả 3–7 bullet + mục mở. Dừng nếu người chỉ hỏi tìm hoặc tóm tắt.
9. Cần ghi → [l2-preview.md](l2-preview.md).
