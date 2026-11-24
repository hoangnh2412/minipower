---
name: minipower-analyst-cr
description: Soạn nội dung change request đổi FR/AC với khách. Dùng khi CR yêu cầu, đổi scope sau baseline — không ghi ticket board (pm), không sửa registry (support).
metadata:
  workflow: github
  version: 1.1.0
---

# minipower-analyst-cr

Change request **nội dung** (delta FR/AC, DOC-18). Ticket board = [minipower-pm-cr-track](../../../pm/skills/minipower-pm-cr-track/SKILL.md).

**Pack:** minipower · **Tiên quyết:** baseline DOC-01–07.

**Template:** [DOC-18](../../templates/DOC-18-change-request-register.md) · **Folder:** `00-governance/` · `06-changes/CR-xxx/` · **Versioning:** [doc-versioning](../../../router/docs-skeleton/00-governance/doc-versioning.md)

**Quy tắc:** Sau baseline → CR bắt buộc · không sửa `02-baseline/` trực tiếp.

```text
CR → impact → deltas/ → merge docs → regression → approve → vX.Y
```

**Sau merge delta** — `minipower-*-review` trong pack nghề regression tài liệu (trace + mâu thuẫn) trước re-baseline. CR lớn → [minipower-router-deliberation](../../../router/skills/minipower-router-deliberation/SKILL.md) trước khi chấp thuận.

## Khi nào cần CR

- **Sau baseline** — bắt buộc. Chưa có baseline → đổi tự do, phần thiếu ghi `doc-debt.md`.
- **Hệ đang chạy** — CR là đơn vị công việc chính; sự cố vận hành ở `06-changes/incident/` thường đẻ ra CR.
- doc-review sau merge: đủ chiều khi bàn giao theo tài liệu; còn lại chỉ **vùng CR động vào**.

> Gate này **mềm** — không hook nào chặn trên "đã có CR chưa". Cái cứng là `baseline-guard`: `docs/02-baseline/` **deny luôn, không BYPASS**. Vì thế "không sửa baseline trực tiếp" là điều kiện máy giữ được, còn "phải mở CR" thì không.

---

## Chốt baseline đầu tiên — trả nợ trước

Chốt baseline **không phải chụp snapshot** — nó là sự kiện có nghi thức, đi qua skill này và **phải kèm DEC**. Không có nghi thức thì sổ nợ thành đường né gate (R3).

### Dự án làm nhanh — trả nợ rồi chốt

1. **Đọc [`memory/doc-debt.md`](../../../router/project-skeleton/memory/doc-debt.md)** — đó là danh sách việc, không phải ghi chú.
2. **Backfill** các DOC còn ở trạng thái *nợ* mà việc sắp tới cần. Nguồn là artifact đã có: code, FR rời, AC, ADR. Backfill là **viết ngược từ cái đã làm** — gần với [minipower-architecture-as-built](../../../architecture/skills/minipower-architecture-as-built/SKILL.md) hơn là viết mới.
3. **Gắn ID** cho mọi FR/UC/AC chưa có (`{MOD}-FR-001`…). Nếu đã dùng ID từ ngày đầu như khuyến nghị thì bước này gần như trống.
4. **`trace:check`** phải xanh — ID không trỏ sai, không trùng.
5. **Chốt baseline đầu tiên** → `docs/02-baseline/v1.0/`.
6. **Ghi DEC** `DEC-CHG-NNN`: vì sao chốt lúc này · nợ nào đã trả · nợ nào cố ý mang theo.

**Không có bước di trú cấu trúc.** Khung folder đã đủ từ ngày init (QĐ-2) — chỉ điền tiếp.

### Hệ cũ tiếp quản — as-built đủ rồi mới chốt

1. **[minipower-architecture-as-built](../../../architecture/skills/minipower-architecture-as-built/SKILL.md)** cho tới khi phủ hết vùng đang chạy (DOC-04 · 08 · 09 · 10 · 11 · 12 · 17 · 18).
2. Mọi mục vào `docs/` phải **đã có người xác nhận** — nháp chưa xác nhận không tính là đã trả nợ.
3. `assets/archive/` còn nguồn *"nghi ngờ"* chưa xử lý → hoặc xác nhận, hoặc hạ xuống *"đã lỗi thời"*. Không để lửng.
4. `trace:check` xanh → chốt baseline → ghi DEC.

## Format `doc-debt.md`

Sổ nợ là **điều kiện vào** luồng chốt baseline, nên format phải máy đọc được ở mức tối thiểu:

```markdown
| # | Thiếu gì | Module / phạm vi | Vì sao chấp nhận thiếu | Cần trước khi | Trạng thái |
|---|----------|------------------|------------------------|---------------|------------|
| 1 | DOC-04 Business Rules | ORD | MVP demo 3 tuần | chốt baseline v1.0 | ☐ nợ |
```

| Quy tắc | |
|---|---|
| **Thiếu gì** | Nêu **DOC-NN** rõ ràng — `DOC-04 Business Rules`, không phải "tài liệu nghiệp vụ" |
| **Module / phạm vi** | `{MOD}` nếu DOC theo module; `dự án` nếu cấp dự án. Cột này khớp chiều `doc_scope` mà `prereq-gate` dùng |
| **Trạng thái** | `☐ nợ` · `☐ đang trả` · `☑ xong` |
| **Khi nào ghi** | `prereq-gate` nhắc thiếu tiền đề mà vẫn quyết làm tiếp → ghi ngay. Đó là lúc nợ phát sinh |

**Liên quan:** [minipower-analyst-srs](../../../analyst/skills/minipower-analyst-srs/SKILL.md) · [minipower-architecture-sad](../../../architecture/skills/minipower-architecture-sad/SKILL.md) · [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md) · [minipower-ops-deploy](../../../ops/skills/minipower-ops-deploy/SKILL.md) / [minipower-qa-strategy](../../../qa/skills/minipower-qa-strategy/SKILL.md) · [minipower-architecture-as-built](../../../architecture/skills/minipower-architecture-as-built/SKILL.md)

## Anti-patterns

- Sửa SRS không CR · duplicate DOC · approve CR không cập nhật trace/test
- **Chốt baseline mà không ghi DEC** — mất dấu vết, và mở đường né gate (R3)
- Gõ `BYPASS` cho gate im thay vì trả nợ tài liệu
- Coi `doc-debt.md` là ghi chú tuỳ hứng — nó là danh sách việc của luồng chốt baseline


Hướng dẫn người: [README.md](README.md).
