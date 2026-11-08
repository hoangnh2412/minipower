# Ánh xạ việc → GitHub

Không load mặc định — mở ở L2 khi phân vân chọn gì.

Luật phân rã việc là tool-neutral, nằm ở [pm-plan › work-breakdown](../../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md). File này chỉ nói **GitHub gọi những thứ đó là gì**.

## 1. Đơn vị

| Luật work-breakdown | Trên GitHub | Ghi chú |
|---|---|---|
| Epic | Issue có thẻ con | GitHub không có type riêng; dùng sub-issue để gom |
| User story · Task | Issue | Tiêu đề là danh từ sản phẩm, không phải hoạt động |
| Task con | Sub-issue của issue cha | `sub_issue_write`, hoặc `parent_issue_number` lúc tạo |
| Sprint | Milestone | Hoặc một trường lặp trên Project nếu đã dựng |
| Hoạt động (viết code, test, họp) | *(không thành issue)* | Ghi bằng bình luận trên issue cha |

## 2. Vòng đời

GitHub chỉ có **mở** và **đóng**. Mọi trạng thái trung gian nằm ở nhãn hoặc ở cột Status của Project.

| Kết cục | Đóng với lý do |
|---|---|
| Làm xong, hoặc đã chuyển thành quyết định ở nơi khác | `completed` |
| Quyết định không làm | `not_planned` |
| Trùng thẻ đã có | `duplicate`, kèm số issue gốc |

Đóng không nêu lý do là mất thông tin không lấy lại được. Luôn nêu.

## 3. Nhãn

Nhãn **không khai trong repo này**. Nguồn chân lý là chính GitHub.

Trước khi gắn: đọc nhãn thật. Chưa có nhãn cần dùng → đề xuất trong bảng L2 cho người tạo. Không gắn nhãn gần giống để "tạm cho có".

## 4. Project

Project là **bảng nhìn**, không phải nơi giữ sự thật. Sự thật nằm ở nhãn và ở trạng thái đóng mở của issue.

Lý do thực dụng: token có thể có quyền Issues mà không có quyền Projects, và lúc đó mọi tool Projects trả 403. Thiết kế không được phụ thuộc vào thứ có thể tắt.

Bật auto-add trên Project thì GitHub tự đưa issue mới lên board, không cần skill làm gì. Auto-add chỉ tính từ lúc bật, thẻ cũ phải thêm tay.
