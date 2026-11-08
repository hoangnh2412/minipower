---
name: minipower-analyst-impact
description: Đánh giá impact thay đổi theo góc nhìn nghiệp vụ — tóm tắt hiểu yêu cầu, chức năng liên quan, rủi ro, giải pháp đề xuất, viết cho BA không đọc code. Dùng khi đánh giá impact, ảnh hưởng thay đổi, impact assessment trước CR — không soạn nội dung CR (analyst-cr), không ghi ticket (pm-cr-track), không phân tích kỹ thuật (architecture-impact).
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-analyst-impact

Impact **góc nhìn nghiệp vụ** — người đọc BA, không cần đọc code. Góc kỹ thuật = [minipower-architecture-impact](../../../architecture/skills/minipower-architecture-impact/SKILL.md); hai skill độc lập, chạy trước hoặc sau nhau tuỳ ai khởi xướng.

Thường chạy **trước** [minipower-analyst-cr](../minipower-analyst-cr/SKILL.md) khi thay đổi đủ lớn cần nhìn tác động trước khi soạn CR.

## Output — đúng 4 phần, ngắn gọn, không dài dòng

1. **Tóm tắt hiểu yêu cầu** — diễn giải lại thay đổi đang xét bằng lời của AI (restate + suy diễn ngắn), để người xác nhận đã hiểu đúng trước khi phân tích tiếp.
2. **Chức năng liên quan** — module/FR/màn hình nghiệp vụ bị đụng, theo ID nếu có (`{MOD}-FR-*`).
3. **Rủi ro nghiệp vụ** — tác động tới người dùng, quy trình, dữ liệu; không nói về code/kiến trúc.
4. **Giải pháp đề xuất** — hướng xử lý ở mức nghiệp vụ, chưa phải thiết kế kỹ thuật.

## Ranh giới

- Không soạn nội dung CR (`DOC-18`) — đó là [minipower-analyst-cr](../minipower-analyst-cr/SKILL.md).
- Không ghi ticket/board — đó là [minipower-pm-cr-track](../../../pm/skills/minipower-pm-cr-track/SKILL.md).
- Không phân tích kỹ thuật/API/data model — đó là [minipower-architecture-impact](../../../architecture/skills/minipower-architecture-impact/SKILL.md).

Hướng dẫn người: [README.md](README.md).
