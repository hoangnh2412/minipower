# Hồ sơ tài liệu dự án — Skeleton

Khung folder **generic** — không gắn ngành, module hay dự án cụ thể.

**Skill pack:** [../README.md](../README.md) · skill con: [../skills/](../skills/)

## Cách dùng

1. **Khởi tạo dự án** — copy [`project-skeleton/`](../project-skeleton/) → `{project}/` và [`docs-skeleton/`](../docs-skeleton/) → `{project}/docs/` (xem [SKILL.md](../SKILL.md))
2. **Tạo module** — copy `03-modules/_template/` → `03-modules/{module-id}/`
3. **Sinh nội dung** — copy từ [`../templates/`](../templates/README.md) vào file tương ứng
4. **Quy ước ID** — `{MOD}-{TYPE}-{NNN}` (MOD = mã module viết hoa, 3–6 ký tự)

| Mục | Giá trị ban đầu |
|-----|-----------------|
| **Baseline hiện tại** | *(chưa baseline — draft)* |
| **Module list** | *(điền trong `01-project/DOC-03-brd.md`)* |

## Cấu trúc

| Folder | DOC | Mô tả |
|--------|-----|-------|
| [`00-governance/`](00-governance/) | 15, 18 | Plan, CR register, baseline history, [business glossary](00-governance/business-glossary.md), [doc versioning](00-governance/doc-versioning.md), [sổ bài học](00-governance/lessons.md) (ADR-044) |
| [`01-project/`](01-project/) | 01–03 | Vision, stakeholder, BRD |
| [`02-baseline/`](02-baseline/) | * | Snapshot sign-off — **READ ONLY** |
| [`03-modules/`](03-modules/) | 04–07, 16 | Theo từng module / bounded context |
| [`04-platform/`](04-platform/) | 08–14, 17 | Kiến trúc, tích hợp, NFR, deploy |
| [`05-traceability/`](05-traceability/) | — | Overview, trace matrix, doc registry |
| [`06-changes/`](06-changes/) | 18 | CR + delta từng thay đổi |

## Luồng sửa một module

```text
06-changes/CR-xxx/ → 03-modules/{module-id}/ (+ 04-platform/ nếu cần)
→ 05-traceability/trace-matrix.md
→ regression FR bị ảnh hưởng → approve → baseline vX.Y
```
