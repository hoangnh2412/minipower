---
name: minipower-architecture-sad
description: Viết SAD ADR integration data model API spec DOC-08 đến 12. Dùng khi architecture, SAD, OpenAPI — không vibe-code .NET.
metadata:
  workflow: github
---

# minipower-architecture-sad

SAD cho người đọc sau ký. Không convention .NET (lá `minipower-backend-architecture-dotnet`). Không báo giá.

Trước ký, giải pháp mức bán là [minipower-architecture-solution-lite](../minipower-architecture-solution-lite/SKILL.md) (`SOL-*`), không phải SAD đầy đủ.

**Tiên quyết:** DOC-06 + DOC-13 của module. Thiếu → [minipower-analyst-srs](../../../analyst/skills/minipower-analyst-srs/SKILL.md).

**Template:** [DOC-08–12](../../../router/templates/) · **Folder:** `docs/04-platform/`

| DOC | Nội dung |
|-----|----------|
| 08 SAD | 4+1 views |
| 09 ADR | 1 file / quyết định — không sửa Accepted. **Viết cho người không chuyên đọc hiểu** (PM, khách, người ký); đoạn chuyên sâu kỹ thuật gắn nhãn `[Kỹ thuật]` ở đầu đoạn / đầu mục để người đọc bỏ qua được |
| 10 Integration | Protocol, direction, SLA |
| 11 Data Model | ERD, master data — theo khung template: ba tầng tên, UUIDv7, audit, UTC+0, **lý do thiết kế · dữ liệu mẫu · query mẫu** mỗi ERD |
| 12 API | OpenAPI — DTO ở ranh giới, camelCase, lỗi `code` + `message` đúng họ mã |

**Exit:** SAD/ADR reviewed · API/Data trace FR · NFR in architecture

## Format phản hồi

1. Context · 2. Components · 3. Integration · 4. ADRs · 5. Data/API · 6. NFR map · 7. Risks · 8. DOC updates · 9. Questions · 10. Tiếp → [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md)

## Anti-patterns

- SAD trước SRS · sửa ADR cũ · ADR toàn thuật ngữ kỹ thuật không nhãn `[Kỹ thuật]` · API không trace FR · ERD không có dữ liệu mẫu / query mẫu · ghi chú thảo luận lẫn trong thân ERD

Hướng dẫn người: [README.md](README.md).
