---
name: minipower-architecture-impact
description: Đánh giá impact thay đổi theo góc nhìn kỹ thuật — tóm tắt hiểu yêu cầu, thành phần/API/data model liên quan, rủi ro kỹ thuật, giải pháp đề xuất, viết cho SA. Dùng khi đánh giá impact kỹ thuật, ảnh hưởng thay đổi tới kiến trúc/API trước khi sửa DOC-08/11/12 — không viết SAD đầy đủ (architecture-sad), không convention .NET, không góc nhìn nghiệp vụ (analyst-impact).
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-architecture-impact

Impact **góc nhìn kỹ thuật** — người đọc SA. Góc nghiệp vụ = [minipower-analyst-impact](../../../analyst/skills/minipower-analyst-impact/SKILL.md); hai skill độc lập, chạy trước hoặc sau nhau tuỳ ai khởi xướng.

## Output — đúng 4 phần, ngắn gọn, không dài dòng

1. **Tóm tắt hiểu yêu cầu** — diễn giải lại thay đổi đang xét (restate + suy diễn ngắn ở góc kỹ thuật), người xác nhận trước khi phân tích tiếp.
2. **Thành phần/API/data model liên quan** — `DOC-08`/`11`/`12`, ADR, component, API endpoint, bảng dữ liệu bị đụng.
3. **Rủi ro kỹ thuật** — breaking change, hiệu năng, bảo mật, migration dữ liệu.
4. **Giải pháp đề xuất** — hướng xử lý kỹ thuật ở mức tóm tắt, chưa phải SAD đầy đủ.

## Ranh giới

- Không viết SAD đầy đủ (`DOC-08`→`12`) — đó là [minipower-architecture-sad](../minipower-architecture-sad/SKILL.md).
- Không convention/layer .NET — đó là [minipower-backend-architecture-dotnet](../../../backend/skills/minipower-backend-architecture-dotnet/SKILL.md).
- Không góc nhìn nghiệp vụ — đó là [minipower-analyst-impact](../../../analyst/skills/minipower-analyst-impact/SKILL.md).

Hướng dẫn người: [README.md](README.md).
