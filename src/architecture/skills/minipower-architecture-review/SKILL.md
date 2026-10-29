---
name: minipower-architecture-review
description: Review kiến trúc chức năng cho người đọc: view, ADR header, không convention C#. Dùng khi QC SAD, soi ADR, review ERD DOC-11, soát hợp đồng API DOC-12, kiểm bảo mật thiết kế.
metadata:
  workflow: github
---

# minipower-architecture-review

QĐ-13. Không ArchUnit (đó là backend). Verdict PASS / BLOCK do **người** ký — máy không chặn.

Fan-out **một subagent / chiều**; agent chính dedup finding theo `{DOC}#{section/ID}`. Không tự sửa DOC của owner khác.

## Năm chiều

| Chiều | DOC | Soát gì | Finding điển hình |
|-------|-----|---------|-------------------|
| **View** | DOC-08 | 4+1 view đủ và nhất quán; NFR DOC-13 có chỗ đứng trong kiến trúc; component trace FR | Component không trace FR · NFR không ai chịu |
| **ADR** | DOC-09 | Header đủ (Context · Options · Decision · Consequences); không sửa ADR `Accepted`; lệch convention có ADR; **người không chuyên đọc hiểu** Bối cảnh · Quyết định · Lý do · Hệ quả — đoạn chuyên sâu kỹ thuật có nhãn `[Kỹ thuật]` | Sửa ADR cũ thay vì ADR mới · quyết định không có phương án bị loại · Lý do / Hệ quả chỉ người kỹ thuật hiểu, không có nhãn `[Kỹ thuật]` |
| **ERD** | DOC-11 | Theo khung [DOC-11](../../templates/DOC-11-data-model.md): tên ba tầng (`snake_case` / PascalCase / camelCase) · `id` UUIDv7 · bộ audit tối thiểu, xoá mềm đủ 3 cột hoặc không · datetime UTC+0 không timezone · FK `{bảng_đích}_id` · n-n qua bảng thật có `id` + audit · **mỗi bảng có lý do thiết kế** · **dữ liệu mẫu** đủ bảng, FK trỏ id có thật, synthetic · **query mẫu** trỏ UC/BR/FR (hoặc `TBD`) · thân ERD không chứa ghi chú thảo luận — chưa chốt nằm ở mục *Việc còn mở* | Bảng thiếu `created_by` · `permission_ids` dạng mảng · FR Must không có query chứng minh · "H3 — chốt / bảng cũ" lẫn trong bảng cột |
| **API** | DOC-12 | DTO ở ranh giới, không entity · một action một use case · JSON camelCase · `id` / FK là UUIDv7 · datetime UTC+0 · lỗi chỉ `code` + `message`, `code` đúng họ `{MOD}-VAL-` / `-BR-` / `-API-` / `SYS-` · tenant từ phiên, không từ body · endpoint trace FR | Trả entity · `snake_case` trên dây · body lỗi không `code` · `tenantId` trong request đã authenticated |
| **Bảo mật thiết kế** | DOC-08 · DOC-11 · DOC-12 | Client là vùng không tin cậy — rule nhạy cảm enforce ở API / worker · tenant tách logic, không "client chọn tenant" · một danh tính một nguồn (phiên Jarvis) · lỗi an toàn: không stack, không cấu trúc nội bộ, không dữ liệu người khác · kênh ra/vào có TLS, xác thực đối tác, timeout · ERD / API spec không chứa secret hay PII thật trong sample | Quyền chỉ ở UI · sample row MST thật · webhook không xác minh chữ ký |

Chiều ERD / API / bảo mật thiết kế thêm 2026-10-22 (ADR-041) — tiêu chí chung mọi dự án Jarvis; dự án có convention riêng (`docs/00-governance/`) thì soát thêm theo file đó, không thay bảng này.

## Output

Mỗi finding: `{DOC}#{section/ID}` · chiều · mức (BLOCK / WARN / NOTE) · vì sao · gợi ý sửa. Kết: PASS / BLOCK đề xuất — người ký.

Hướng dẫn người: [README.md](README.md).
