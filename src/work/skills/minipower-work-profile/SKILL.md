---
name: minipower-work-profile
description: Dựng và cập nhật cấu hình board của đội trong memory/tasks-config — tasklist, vai trò từng trường, danh mục dự án, nhân sự, luật chuyển trạng thái, phạm vi làm việc. Dùng khi chưa có cấu hình, khi board đổi, hoặc khi người yêu cầu sửa cấu hình bằng lời. Không đọc việc, không ghi ticket.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-work-profile

Một việc: **giữ cho `memory/tasks-config/` khớp với board thật của đội.**

Người: [README.md](README.md). Nền: [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-3.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Chưa có `memory/tasks-config/`, hoặc đổi sang board khác | [workflows/init.md](workflows/init.md) |
| Người báo "board đổi rồi" — thêm dự án, đổi tên nhóm, thêm người | [workflows/sync.md](workflows/sync.md) |
| Người nói bằng lời: "thêm X vào đội DEV", "bỏ dự án Y" | [workflows/edit.md](workflows/edit.md) |

## Quy tắc cốt lõi

- **Đọc board qua lá kênh, không gọi MCP thẳng.** Lá này biết *cấu hình trông như thế nào*, lá kênh biết *gọi tool nào*.
- **Ghi vào `memory/`, không ghi vào board.** Không tạo, sửa, xoá ticket — đó là việc của [minipower-work-desk](../minipower-work-desk/SKILL.md).
- **Năm file, mỗi file một mối quan tâm:** `profile` (tasklist + vai trò trường + loại việc + cây phân cấp) · `status` (trạng thái + luật chuyển) · `projects` (danh mục dự án) · `members` (nhân sự + vai) · `scope` (phạm vi mặc định).
- **Định dạng: mỗi phần tử một dòng, không thụt lề.** Để `git diff` chỉ ra đúng dòng đổi. Mỗi khoá có một dòng `_` giải thích ngay cạnh.
- **`synced_at` cập nhật mỗi lần ghi.** Người đọc biết dữ liệu cũ bao lâu.
- **Luật chuyển trạng thái không đọc được từ board** — API không trả về. Phải hỏi người, và hỏi **trọn gói một lượt**.
- **Không đoán khi board có thứ lạ.** Gặp trường hoặc lựa chọn không khớp cấu hình ⇒ nêu ra, hỏi, chờ người quyết.
- **Trình trước khi ghi.** Mọi thay đổi cấu hình đi qua một bảng `thêm / sửa / xoá`, người OK rồi mới ghi đĩa.

## Ranh giới

| Việc | Thuộc về |
|---|---|
| Gọi tool MCP, phân trang, xử lý lỗi, cài đặt kết nối | [minipower-tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md) |
| Tạo / sửa / chuyển trạng thái ticket | [minipower-work-desk](../minipower-work-desk/SKILL.md) |
| Xem tình hình, tổng hợp tiến độ | [minipower-work-status](../minipower-work-status/SKILL.md) |
| Báo cáo định kỳ | [minipower-work-report](../minipower-work-report/SKILL.md) |

## Output

- `init`: cây 5 file đã ghi + danh sách chỗ còn trống chờ người điền.
- `sync`: bảng `khoá | cũ | mới | nguồn`, rồi số file đã ghi.
- `edit`: bảng `file | thay đổi`, rồi xác nhận đã ghi.
