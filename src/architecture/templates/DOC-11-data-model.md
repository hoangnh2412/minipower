# DOC-11 — Mô hình Dữ liệu

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **UML Class Diagram** · **ERD (Entity-Relationship Diagram)** · master data governance

> Platform dùng file này cho ERD lõi. Module dùng cùng khung cho `docs/03-modules/{module}/DOC-11-erd.md` — **không** lặp cột khung §1.2, chỉ bảng module sở hữu. Dự án có convention database riêng (`docs/00-governance/`) thì áp thêm, không thay §1.2.

---

## 1. Giới thiệu

### 1.1 Mục đích & Phạm vi

[Domain / module; tham chiếu DOC-06, DOC-08. Bảng nào thuộc ERD này, bảng nào thuộc module khác — chỉ link, không copy]

### 1.2 Quy ước chung

Áp cho mọi bảng trong ERD. Lệch có chủ đích → ADR (DOC-09).

| # | Quy ước | Chi tiết |
|---|---------|----------|
| 1 | **Tên ba tầng** | DB `snake_case`, danh từ số ít (`invoice_detail`, `created_at`) · Code PascalCase (`InvoiceDetail`, `CreatedAt`) · JSON camelCase (`createdAt`). Ánh xạ khai một lần ở DbContext |
| 2 | **Khoá chính** | Mọi bảng — kể cả bảng trung gian và `settings` — có đúng một `id` kiểu uuid, giá trị **UUIDv7**. Không identity số nguyên, không UUIDv4 |
| 3 | **Audit tối thiểu** | `created_at` · `created_by` · `updated_at` · `updated_by`. Bảng cần **xoá mềm** thêm đủ ba cột `deleted_at` · `deleted_by` · `deleted_id` (cùng có hoặc cùng không); truy vấn nghiệp vụ mặc định `deleted_at is null` |
| 4 | **Thời điểm** | datetime **không timezone**, giá trị luôn **UTC+0**. Cần múi giờ nghiệp vụ → cột riêng (`issued_timezone`, IANA). Múi giờ mặc định toàn hệ thống đọc từ `settings`, không hardcode |
| 5 | **Khoá ngoại** | `{tên_bảng_đích}_id` → `{tên_bảng_đích}.id`, kiểu uuid. Áp cho cả FK vật lý và FK logic. Không `invoice_ref`, `fk_invoice` |
| 6 | **n-n** | Bảng trung gian thật, có `id` + audit, hai FK theo (5), cặp FK unique. Không lưu danh sách ID dạng mảng / chuỗi |
| 7 | **Mỗi bảng có lý do thiết kế** | Giữ gì · vì sao bảng riêng · vì sao cấu trúc này — gắn UC / BR / FR / ADR. Chưa có → `TBD`, không suy diễn |
| 8 | **ERD có dữ liệu mẫu** | Mỗi bảng ≥ 1 dòng; FK trỏ `id` có thật trong bộ mẫu; **synthetic** — không dữ liệu khách |
| 9 | **ERD có query mẫu** | Mỗi query trỏ UC / BR / FR nó chứng minh (§3.2) |
| 10 | **Thân ERD không chứa thảo luận** | Chưa chốt → §8 *Việc còn mở*. Đã chốt → bảng / quy tắc, không lặp dạng ghi chú |

Bảng phân vùng tenant mang thêm `tenant_id` (và cột tổ chức nếu ERD lõi khai) — bổ sung, không thay bộ audit.

## 2. Mô hình khái niệm (ERD — cấp cao)

```text
[Entity A] 1───* [Entity B]
    │
    *───* [Entity C]
```

[Diagram chỉ field chính + FK, không cột audit. Bảng trace: entity → UC / FR của DOC-06]

| Entity | UC / FR | Module sở hữu |
|--------|---------|---------------|
| | | |

## 3. Mô hình logic & dữ liệu mẫu

### 3.1 Thực thể: `[table_name]`

**Lý do thiết kế:**
- Giữ … phục vụ … (`{MOD}-UC-…`, `{MOD}-FR-…`)
- Tách riêng vì …
- [Xoá mềm / FK logic / bảng trung gian] vì … (BR / ADR)

| Column | Type | PK/FK | Nullable | Description |
|--------|------|-------|----------|-------------|
| id | uuid (UUIDv7) | PK | N | |
| … | | | | |
| created_at | timestamp (UTC+0, no tz) | | N | |
| created_by | uuid | | N | |
| updated_at | timestamp (UTC+0, no tz) | | N | |
| updated_by | uuid | | N | |

**Indexes:**

| Name | Columns | Unique |
|------|---------|--------|
| | | |

**Dữ liệu mẫu** (cột `snake_case`, thời điểm UTC+0, giá trị giả):

| id | … | created_at | created_by |
|----|---|------------|------------|
| `01936b8e-7c2a-7a1e-8f3b-9c0d1e2f3a4b` | | `2026-01-15 02:00:00` | `01936b8e-1111-7111-8111-111111111111` |

**Business rules:** `{MOD}-BR-xxx`

### 3.1 Thực thể: `[next_table]`

…

### 3.2 Query mẫu

Mỗi query gắn ID nó chứng minh. Chưa có ID → `TBD`, không bịa. FR Must chưa có query → ghi §8, không coi diagram là đã đáp ứng.

| Query | UC | BR | FR | Chứng minh điều gì |
|-------|----|----|----|--------------------|
| Q1 | `TBD` | `TBD` | `TBD` | |

```sql
select id, name
from my_table
where deleted_at is null
  and created_at >= timestamp '2026-01-01 00:00:00'
  and created_at <  timestamp '2026-02-01 00:00:00';
```

## 4. Miền dữ liệu chủ (Master Data)

| Domain | Golden record | Source of truth | Sync to |
|--------|---------------|-----------------|---------|
| Customer | CRM | CRM | ERP |
| Employee | HRM | HRM | — |

## 5. Từ điển dữ liệu

| Entity.Attribute | Business definition | Allowed values | Sensitive (Y/N) |
|------------------|---------------------|----------------|-----------------|
| | | | |

## 6. Lưu trữ & Vòng đời

| Entity | Retention | Archive | Legal hold |
|--------|-----------|---------|------------|
| | 7 years | | |

## 7. Di chuyển dữ liệu (nếu có)

| Source | Target | Rules | Volume | Owner |
|--------|--------|-------|--------|-------|
| Legacy | New | Cleanse rules | | |

## 8. Việc còn mở

Câu hỏi, phương án chưa chốt, blocker — **không** trộn vào §2–§3. Nháp dài → `brainstorm/` hoặc `memory/open-questions.md`.

| # | Việc | Phương án | Chờ ai |
|---|------|-----------|--------|
| | | | |

## 9. Truy vết

| FR ID | INT ID |
|-------|--------|
| | |

---

**Checklist trước review** (chiều ERD của `minipower-architecture-review`): mọi bảng ở §2 có mục §3.1 + lý do thiết kế (hoặc `TBD` kèm dòng §8) · dữ liệu mẫu đủ bảng, FK khớp · FR Must có query · không ghi chú thảo luận trong §2–§3 · cross-ref module khác bằng link, không copy FR.
