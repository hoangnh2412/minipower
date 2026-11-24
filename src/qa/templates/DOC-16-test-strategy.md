# DOC-16 — Chiến lược Kiểm thử & Test Cases ({module-id})

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| — | YYYY-MM-DD | | Draft |

> Quy tắc versioning: [`doc-versioning.md`](../docs-skeleton/00-governance/doc-versioning.md).

**Module:** `{module-id}` · **MOD prefix:** `{MOD}`

**Tiêu chuẩn tham khảo:** **ISTQB** — test levels & types; catalog trace FR↔AC↔TC.

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = chỉ cần khi làm chuẩn để bàn giao / nghiệm thu.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Mục đích
[Mô tả phạm vi test module — trace [`DOC-06-srs.md`](DOC-06-srs.md) (N FR) và [`DOC-07-acceptance-criteria.md`](DOC-07-acceptance-criteria.md) (N AC).]

---

## 2. Danh mục test case
> Business glossary — [Trạng thái thực thi TC](../docs-skeleton/00-governance/business-glossary.md#4-doc-16--trạng-thái-thực-thi-tc) · [Cột catalog](../docs-skeleton/00-governance/business-glossary.md#8-doc-16--cột-catalog) · [Layer, Path, Priority](../docs-skeleton/00-governance/business-glossary.md#9-doc-16--layer-path-priority).

### 2.1 [Nhóm chức năng — ví dụ: Happy path chính]

| TC ID | Mô tả | Kết quả mong muốn | Layer | Path | Priority | Trạng thái |
|-------|-------|-------------------|-------|------|----------|------------|
| {MOD}-TC-001 | [Tóm tắt kịch bản] | [Expected outcome ngắn] | E2E | Happy | Must | |
| {MOD}-TC-002 | [Validation / unhappy] | [Thông báo lỗi / từ chối] | FE/BE | Validation | Must | |

### 2.2 [Nhóm chức năng khác]

| TC ID | Mô tả | Kết quả mong muốn | Layer | Path | Priority | Trạng thái |
|-------|-------|-------------------|-------|------|----------|------------|
| {MOD}-TC-010 | | | BE/API | Unhappy | Must | |

---

## 3. Chi tiết test case ▸ full
### {MOD}-TC-001 — [Tiêu đề]

| Mục | Nội dung |
|-----|----------|
| **Trace** | {MOD}-FR-001, {MOD}-AC-001, {MOD}-BR-001 |
| **Preconditions** | |
| **Steps** | 1. … 2. … |
| **Expected result** | |
| **Layer / Path** | E2E · Happy |
| **Status** | *(Pass / Fail / Blocked / Skip)* |

---

## 4. Ma trận truy vết
| TC ID | FR ID | AC ID | BR ID | UC ID | Coverage |
|-------|-------|-------|-------|-------|----------|
| {MOD}-TC-001 | {MOD}-FR-001 | {MOD}-AC-001 | {MOD}-BR-001 | {MOD}-UC-001 | ✅ |
| {MOD}-TC-002 | — | — | {MOD}-BR-002 | {MOD}-UC-001 | ⚠️ |

> **✅** map đủ FR/AC · **⚠️** edge / validation chưa có FR/AC riêng.

---

## 5. Phương pháp kiểm thử ▸ full
| Loại | Mô tả |
|------|-------|
| **Unit Test** | Kiểm thử từng hàm/service |
| **Integration Test** | Luồng API + DB |
| **UI / E2E** | Portal / client |
| **Security Test** | Phân quyền, token |

---

## 6. Môi trường kiểm thử ▸ full
| Môi trường | Mục đích |
|------------|----------|
| **Local/Dev** | Unit, integration cơ bản |
| **QA/Staging** | Regression, UAT |
| **Production** | Smoke sau deploy |

---

## 7. Mức độ nghiêm trọng lỗi ▸ full
→ [DOC-16 — Defect severity](../docs-skeleton/00-governance/business-glossary.md#10-doc-16--defect-severity).

---

## 8. Nhật ký thay đổi ▸ full
> Quy tắc versioning: [`doc-versioning.md`](../docs-skeleton/00-governance/doc-versioning.md).

| Phiên bản | Thay đổi | Tác giả |
|-----------|----------|---------|
| — | *(chưa có — chờ approve lần đầu)* | — |

---

## 9. Phê duyệt ▸ full
| Vai trò | Họ tên | Ngày | Baseline |
|---------|--------|------|----------|
| REQ owner (sign-off) | | | ☐ |
