---
name: minipower-work-report
description: Soạn báo cáo công việc theo nhịp từ dữ liệu board — tiến độ trong ngày, tổng hợp tuần theo mốc, báo cáo tháng cá nhân. Dùng khi người cần một văn bản có khuôn để gửi đi hoặc lưu lại. Chỉ đọc board; không tự chạy theo lịch.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-work-report

Một việc: **biến dữ liệu board thành văn bản có khuôn, cho người khác đọc.**

Người: [README.md](README.md). Luật board: `memory/tasks-config/`. Nền: [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Tiến độ và hiện trạng trong ngày | [workflows/daily.md](workflows/daily.md) |
| Tổng hợp tuần theo mốc, nhiều dự án | [workflows/weekly.md](workflows/weekly.md) |
| Báo cáo tháng của một người | [workflows/monthly.md](workflows/monthly.md) |

## Quy tắc cốt lõi

- **Không tự chạy theo lịch.** Minipower không phải nơi chạy nền (ADR-022 QĐ-1). Người mở phiên, hoặc lịch bên ngoài gọi vào. Lá này chỉ biết **soạn một bản báo cáo khi được gọi**.
- **Chỉ đọc board.** Không tạo, sửa, đóng việc. Không gửi đi đâu — gửi tin thuộc mặt `chat`.
- **Đọc cấu hình trước.** Thiếu `memory/tasks-config/` ⇒ dừng, chỉ sang [minipower-work-profile](../minipower-work-profile/SKILL.md).
- **Báo cáo là ảnh chụp, phải ghi mốc thời gian.** Mỗi bản nêu rõ đọc lúc nào và lọc theo gì. Không có mốc thì bản báo cáo vô dụng sau một ngày.
- **Nêu thay đổi, không chỉ nêu trạng thái.** Người đọc báo cáo định kỳ cần biết *"từ lần trước đến giờ có gì khác"*. Không so được với kỳ trước ⇒ nói thẳng là không so được, đừng lặng lẽ chỉ liệt kê hiện trạng.
- **Số liệu thì nêu, nguyên nhân thì không suy diễn.** Việc đứng yên lâu ⇒ nêu số ngày. Đừng viết ai chậm, đừng đoán vì sao.
- **Không bịa cho đủ khuôn.** Mục nào không có dữ liệu ⇒ ghi "không có", không viết cho đầy.
- **Độ dài có giới hạn.** Báo cáo dài không ai đọc. Mỗi bản mở đầu bằng phần tóm tắt đọc được trong 30 giây.

## Ranh giới

| Việc | Thuộc về |
|---|---|
| Gọi tool, phân trang | lá kênh — [tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md) |
| Trả lời tình hình tại chỗ | [minipower-work-status](../minipower-work-status/SKILL.md) |
| Thao tác ticket | [minipower-work-desk](../minipower-work-desk/SKILL.md) |
| Gửi báo cáo vào nhóm chat | mặt `chat` — lá của provider tương ứng |
| Lưu báo cáo thành tài liệu | mặt `docs` |
| Đặt lịch chạy định kỳ | ngoài Minipower — xem README |

## Output

Một văn bản Markdown hoàn chỉnh: tiêu đề có mốc thời gian · tóm tắt 30 giây · các mục theo khuôn của workflow · dòng cuối ghi phạm vi lọc và thời điểm đọc.
