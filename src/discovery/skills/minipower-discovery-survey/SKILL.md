---
name: minipower-discovery-survey
description: Khảo sát painpoint stakeholder scope BRD DOC-01 DOC-02 DOC-03. Dùng khi discovery, khảo sát, brainstorm, vision — không viết FR AC, không báo giá.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-discovery-survey

Dừng ở gói khảo sát. Không UC/FR, không báo giá, không SAD.

## Quy tắc pack

- Không invent nguồn ([rules/no-invent-source.md](../../rules/no-invent-source.md)).
- Không FR/AC/giá.
- H0: gói khảo sát → [minipower-architecture-solution-lite](../../../architecture/skills/minipower-architecture-solution-lite/SKILL.md) (`SOL-*`) → presales. Không nhảy thẳng tờ giá.

**Template:** [DOC-01–03](../../../router/templates/) · **Folder:** `{project}/docs/01-project/`

## Bước 1 — Khám phá bài toán

| Hạng mục | Thu thập | Ví dụ |
|----------|----------|-------|
| Business Goal | Mục tiêu kinh doanh | Tăng doanh số · Tự động hóa |
| Stakeholder | Bên liên quan | User · Manager · Admin · Đối tác |
| Success Criteria | Đo lường được | Giảm 50% thao tác thủ công |

**Artifact:** DOC-01 · DOC-02 · DOC-03 (draft)

**Exit criteria:**

- [ ] Goal + Success Criteria — sponsor xác nhận
- [ ] Stakeholder register + RACI sơ bộ
- [ ] Assumption log
- [ ] DOC-01 có ROI / success metrics

## Bước 2 — Phân tích phạm vi

| Loại | Mô tả |
|------|-------|
| In Scope | Thuộc dự án |
| Out of Scope | Không thuộc dự án |

**Artifact:** DOC-03 (scope) · Module index → `03-modules/{module-id}/`

**Exit criteria:**

- [ ] In/out scope review · danh sách module

## Trước bước 1

Chạy [minipower-router-deliberation](../../../router/skills/minipower-router-deliberation/SKILL.md): Premise Check + nghị luận. Có verdict PROCEED/RESHAPE mới elicit tiếp.

- Tối đa **10 câu hỏi** — phạm vi · chi phí · kiến trúc
- **Đã rõ** · **Chưa rõ** · **Chưa đề cập** · gắn `Assumption`

## Format phản hồi

1. Đã hiểu · 2. Còn thiếu · 3. Câu hỏi (≤10) · 4. Problem statement · 5. Stakeholder · 6. Scope · 7. Assumptions · 8. Rủi ro · 9. DOC 01–03 · 10. Tiếp → [minipower-analyst-srs](../../../analyst/skills/minipower-analyst-srs/SKILL.md) sau khi có scope

## Anti-patterns

- UC/SRS trước scope sign-off · tự bịa nghiệp vụ · thiếu success metrics

Hướng dẫn người: [README.md](README.md).
