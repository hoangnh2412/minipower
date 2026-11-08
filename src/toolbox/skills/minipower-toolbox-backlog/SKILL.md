---
name: minipower-toolbox-backlog
description: Tạo và quản lý issue của chính repo Minipower theo khuôn riêng: chọn loại thẻ, soạn đúng form trong .github/ISSUE_TEMPLATE, tìm trùng, gắn nhãn, đóng kèm lý do, tóm tắt backlog. Ghi qua minipower-tasks-github. Dùng khi mở issue hoặc quản backlog cho minipower. Không dùng cho dự án khách.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-toolbox-backlog

Một việc: **biến ý muốn của chủ repo thành issue đúng khuôn của Minipower, và lo phần hành chính của thẻ sau đó.**

Người: [README.md](README.md). Cơ chế GitHub: [minipower-tasks-github](../../../tasks/skills/minipower-tasks-github/SKILL.md).

Đây là đồ nghề nội bộ — **không** cài vào workspace dự án khách hàng.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Có việc mới cần ghi lại: ý tưởng, bài học, lỗi, cải tiến | [workflows/intake.md](workflows/intake.md) |
| Thẻ đã có: tóm tắt trao đổi thành bình luận, chốt yêu cầu, đổi nhãn, nối thẻ con, đóng | [workflows/curate.md](workflows/curate.md) |
| Hỏi backlog đang có gì, cái gì đang chờ | [workflows/digest.md](workflows/digest.md) |

## Bốn loại thẻ

| Loại | Là gì | Dấu hiệu nhận ra |
|---|---|---|
| **Ý tưởng** | đề xuất chưa quyết, chưa rõ có đáng làm | "hay là mình…", "anh đang nghĩ…" |
| **Bài học** | rút ra từ một lần dùng thật, gửi về từ dự án | "chỗ này skill làm chưa tốt" |
| **Lỗi** | Minipower làm sai, tái hiện được | "chạy X thì ra Y, đáng lẽ phải Z" |
| **Cải tiến** | việc đã rõ, chỉ là chưa làm | "cần thêm…", "nên đổi…" |

Không chắc loại nào → **hỏi, không đoán**. Loại quyết định cách soạn nội dung và nhãn đề xuất.

## Quy tắc cốt lõi

- **Chỉ chạy trên repo Minipower.** Dấu hiệu: thư mục làm việc có `AGENTS.md` cùng `ADRs/`, và `git remote` trỏ về repo minipower. Lệch → dừng, nói rõ đây là skill nội bộ.
- **Không gọi GitHub trực tiếp.** Mọi lần đọc và ghi đi qua [minipower-tasks-github](../../../tasks/skills/minipower-tasks-github/SKILL.md), và lá đó chỉ đi bằng MCP. Cấm `gh`, cấm `curl`. Ba tầng L1 đọc, L2 đề xuất, L3 ghi do lá đó giữ — lá này **không** giữ bản sao luật nào.
- **Thân issue là lời của anh, bình luận là chỗ của AI.** Nội dung người gửi thành thân thẻ, giữ nguyên câu chữ. Phân tích, câu hỏi, đề xuất, bản chốt yêu cầu, mã ADR — tất cả xuống bình luận. **Không sửa thân thẻ** trừ khi người yêu cầu rõ ràng.
- **Chỉ bài học có form.** `.github/ISSUE_TEMPLATE/lesson.yml` — nội dung do AI soạn và bắt buộc ẩn danh nên cần ô cố định. Mở file đó đọc các ô **có thật**; **không** chép danh sách ô vào skill.
- **Mọi loại khác là văn bản tự do.** Không có form, và **không tự dựng form**. Viết theo đúng cách người nói, hỏi một lượt chỗ nào thiếu nghĩa, giữ cho người sau đọc hiểu. Không nhồi đường dẫn file, không bảng quyết định, không kế hoạch triển khai.
- **Nhãn đọc sống từ GitHub**, không khai ở đây. Nhãn chưa tồn tại → đề xuất cho người tạo, không tự tạo.
- **Nhãn nhóm `decision:` chỉ người gắn.** Đó là kết cục do chủ repo quyết. Skill đọc lại rồi làm phần hành chính tương ứng, không tự gắn, không tự đổi.
- **Luôn tìm trùng trước khi đề xuất tạo**, gồm cả issue đã đóng.
- **Repo công khai.** Soát trước khi đăng: không secret, không tên khách hàng, không tên người. Nêu tên công cụ nội bộ thì được, theo đúng ngưỡng đang áp cho `ADRs/`.
- **Đóng issue luôn kèm lý do.**

## Ranh giới — việc KHÔNG thuộc lá này

| Việc | Thuộc về |
|---|---|
| Thao tác GitHub: gọi tool, phân trang, xử lý 401/403 | [minipower-tasks-github](../../../tasks/skills/minipower-tasks-github/SKILL.md) |
| Bàn xem một ý tưởng có đáng làm không | [minipower-router-deliberation](../../../router/skills/minipower-router-deliberation/SKILL.md) |
| Bắt bài học tại dự án khách hàng rồi gửi về | [minipower-router-retro](../../../router/skills/minipower-router-retro/SKILL.md) |
| Viết ADR | `ADRs/TEMPLATE.md`, chủ repo cấp mã và đặt file |
| Nâng cấp một skill từ bài học | [minipower-toolbox-skill-author](../minipower-toolbox-skill-author/SKILL.md) |
| Chia task khi bắt tay làm việc phức | [minipower-router-plan](../../../router/skills/minipower-router-plan/SKILL.md) |

Lá này **không** điều phối các lá trên. Chủ repo tự quyết khi nào gọi chúng.

## Output

- Intake: một bảng đề xuất theo khuôn L2 của lá GitHub, rồi `#NNN` sau khi người OK.
- Curate: bảng hành động đã làm, mỗi dòng một thẻ.
- Digest: bảng gom theo loại và theo cái gì đang chờ người.
