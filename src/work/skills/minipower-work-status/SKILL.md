---
name: minipower-work-status
description: Trả lời "đang có chuyện gì" trên board — tiến độ một dự án và các mốc, việc của tôi, việc của đội. Dùng khi người hỏi tình hình, còn bao nhiêu việc, ai đang làm gì, cái gì quá hạn. Chỉ đọc, không ghi; không phải báo cáo định kỳ.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-work-status

Một việc: **trả lời câu hỏi tình hình ngay tại chỗ, bằng số liệu đọc từ board.**

Người: [README.md](README.md). Luật board: `memory/tasks-config/`. Nền: [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| "tiến độ dự án X", "còn mốc nào chưa xong" | [workflows/project.md](workflows/project.md) |
| "việc của tôi", "tôi đang vướng gì" | [workflows/personal.md](workflows/personal.md) |
| "đội đang làm gì", "ai đang quá tải" | [workflows/team.md](workflows/team.md) |

## Quy tắc cốt lõi

- **Chỉ đọc.** Không tạo, sửa, chuyển trạng thái, đóng việc. Người muốn làm ⇒ chỉ sang [minipower-work-desk](../minipower-work-desk/SKILL.md).
- **Đọc cấu hình trước.** Tên trường, trạng thái, dự án, nhân sự đều ở `memory/tasks-config/`. Thiếu ⇒ dừng, chỉ sang [minipower-work-profile](../minipower-work-profile/SKILL.md).
- **Trạng thái và cờ hoàn thành là hai trục.** Đếm "còn bao nhiêu việc" phải dùng **cả hai** — ticket ở bước cuối mà chưa đóng là *đã xong việc, chưa chốt*, không phải việc tồn.
- **Phạm vi mặc định lấy từ `scope.json`.** Người không nói rõ dự án nào thì dùng mặc định, và **nói ra mình đang lọc theo gì**. Không có mặc định ⇒ hỏi.
- **Nói rõ dữ liệu đọc lúc nào.** Board đổi liên tục; con số là ảnh chụp tại thời điểm đọc.
- **Cắt trang thì phải nói.** Danh sách dài bị phân trang ⇒ nêu rõ đang xem bao nhiêu trên tổng bao nhiêu, đừng để người tưởng đã thấy hết.
- **Không suy diễn nguyên nhân.** Thấy việc đứng yên lâu thì nêu số liệu, đừng kết luận ai chậm. Người đọc tự hiểu.
- **Tóm tắt trước, bảng sau.** Mở đầu 3–7 gạch đầu dòng trả lời thẳng câu hỏi; bảng chi tiết để sau, và chỉ khi có ích.

## Ranh giới

| Việc | Thuộc về |
|---|---|
| Gọi tool, phân trang, lỗi | lá kênh — [tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md) |
| Thao tác lên ticket | [minipower-work-desk](../minipower-work-desk/SKILL.md) |
| Báo cáo theo nhịp, có khuôn, cho người khác đọc | [minipower-work-report](../minipower-work-report/SKILL.md) |
| Sửa cấu hình | [minipower-work-profile](../minipower-work-profile/SKILL.md) |
| Lập kế hoạch, ước lượng | [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md) |

Ranh giới với `work-report`: lá này **trả lời tại chỗ cho người đang hỏi**; lá kia **sinh văn bản theo nhịp cho người khác đọc**.

## Output

Tóm tắt 3–7 gạch đầu dòng · bảng chi tiết khi cần · một dòng nói rõ phạm vi lọc và thời điểm đọc.
