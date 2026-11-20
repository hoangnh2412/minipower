---
name: minipower-work-desk
description: Làm việc trên ticket của board mà không mở app — tạo, sửa nội dung, chuyển trạng thái đúng luồng, bình luận, đóng việc. Dùng khi người nói "tạo task", "chuyển sang review", "xong rồi", "ghi chú vào ticket". Không dùng để xem tình hình hay làm báo cáo.
metadata:
  workflow: github
  version: 1.1.0
---

# minipower-work-desk

Một việc: **làm trọn vòng đời một ticket từ chỗ đang ngồi, không phải mở app lên.**

Người: [README.md](README.md). Luật board của đội: `memory/tasks-config/`. Nền: [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2/QĐ-5/QĐ-6.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| "tạo task cho…", "mở ticket…" | [workflows/create.md](workflows/create.md) |
| "đổi hạn", "gán cho ai", "sửa mô tả", "đổi dự án" | [workflows/update.md](workflows/update.md) |
| "chuyển sang review", "deploy xong rồi", "test fail" | [workflows/move.md](workflows/move.md) |
| "ghi chú là…", "báo lại tiến độ" | [workflows/comment.md](workflows/comment.md) |
| "xong rồi", "đóng ticket" | [workflows/close.md](workflows/close.md) |

## Quy tắc cốt lõi

- **Đọc cấu hình trước, luôn luôn.** Tên trường, tên trạng thái, loại việc đều nằm ở `memory/tasks-config/`. **Không hardcode, không đoán** — thiếu cấu hình thì dừng và chỉ sang [minipower-work-profile](../minipower-work-profile/SKILL.md).
- **Ghi đi qua lá kênh, qua đủ cổng.** Mọi thao tác ghi là L2 → người OK → L3 của lá kênh. Lá này **không gọi MCP thẳng**, và không bỏ qua cổng dù người giục.
- **Tạo ticket là hai lệnh.** Lệnh tạo không nhận trường tuỳ biến. Phải tạo rồi sửa. Trình L2 thì nói rõ đây là hai bước, để người không tưởng nửa chừng là hỏng.
- **Không nhảy cóc trạng thái.** Bước kế tiếp đọc từ `status.flows`. Người muốn nhảy ⇒ nói rõ đang bỏ qua bước nào, hỏi xác nhận, rồi mới làm.
- **Lùi bước bắt buộc kèm lý do.** `status.on_fail.require_comment` bật ⇒ thiếu lý do thì **từ chối ghi**. Đây là điều máy kiểm được nên nó là luật cứng, không phải lời khuyên.
- **Trả việc về người phụ trách chính.** Review hoặc kiểm thử không đạt ⇒ người được giao quay về người phụ trách chính, nhánh suy từ vai của người đó trong `members.json`.
- **Đóng việc chỉ ở đúng chỗ.** `status.done_when` nói trạng thái nào. Chưa tới đó mà người bảo đóng ⇒ nêu ra, hỏi lại.
- **Một ticket một người phụ trách.** Việc hai người cùng làm ⇒ đề nghị tách hai ticket, không gán hai người rồi để giờ công lẫn lộn.
- **Không bịa giá trị.** Loại việc không có trong `type_map`, trạng thái không có trong `stages`, người không có trong `members` ⇒ **dừng và hỏi**, không chọn thứ gần giống.

## Ranh giới

| Việc | Thuộc về |
|---|---|
| Gọi tool, phân trang, lỗi, kết nối | lá kênh của provider — [tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md) |
| Sửa cấu hình board | [minipower-work-profile](../minipower-work-profile/SKILL.md) |
| Xem tình hình, tổng hợp | [minipower-work-status](../minipower-work-status/SKILL.md) |
| Báo cáo định kỳ | [minipower-work-report](../minipower-work-report/SKILL.md) |
| Chia việc lớn thành Epic/Story/Task | [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md) |

## Output

Bảng L2 `hành động | ticket | thay đổi | kiểm`, rồi sau khi người OK là mã ticket kèm việc đã làm. Có bước bị chặn ⇒ nói rõ chặn vì luật nào.
