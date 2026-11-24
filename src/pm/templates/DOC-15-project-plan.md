# DOC-15 — Kế hoạch Dự án

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **IEEE 1058** — Software Project Management Plan (SPMP)

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = chỉ cần khi làm chuẩn để bàn giao / nghiệm thu.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Giới thiệu
### 1.1 Tổng quan dự án

[Tên dự án, sponsor, PM, timeline tổng]

### 1.2 Mục tiêu

| ID | Objective | Success criteria |
|----|-----------|------------------|
| | | |

### 1.3 Tài liệu tham chiếu

| Doc | Version |
|-----|---------|
| DOC-01 Vision | |
| DOC-06 SRS | |
| DOC-14 WBS | |

## 2. Tổ chức dự án ▸ full
### 2.1 Vai trò & Trách nhiệm

| Role | Name | Responsibility |
|------|------|----------------|
| Sponsor | | |
| PM | | |
| BA | | |
| Architect | | |

### 2.2 Stakeholder

→ **DOC-02**

## 3. Quy trình quản lý dự án ▸ full
| Process | Approach |
|---------|----------|
| Scope | Baseline DOC-06; change via DOC-18 |
| Schedule | Phase / Sprint |
| Cost | |
| Quality | DOC-16 Test Strategy |
| Risk | Risk register §7 |
| Communication | DOC-02 comm plan |
| Change control | DOC-18 |

## 4. WBS & Lịch trình
### 4.1 Giai đoạn / Cột mốc

| Phase | Milestone | Deliverables | Start | End |
|-------|-----------|--------------|-------|-----|
| Phase 1 — MVP | M1: SRS baseline | DOC-06 v1.0 | | |
| Phase 2 | M2: UAT sign-off | DOC-07, DOC-16 | | |
| Go-live | M3: Production | DOC-17 | | |

### 4.2 Tổng quan lịch trình (Gantt tóm tắt)

| WBS ID | Task | Duration | Dependency | Owner |
|--------|------|----------|------------|-------|
| | | | FS / SS | |

> Cột *Task* = hạng mục lịch trình, **không** phải board. Việc theo dõi: SQLite `trace.db` (`tasks=none`) hoặc tasks provider.

## 5. Kế hoạch nguồn lực ▸ full
| Role | FTE | Phase 1 | Phase 2 | Notes |
|------|-----|---------|---------|-------|
| Dev | | | | |

## 6. Ngân sách (nếu áp dụng) ▸ full
| Category | Estimated | Actual | Variance |
|----------|-----------|--------|------------|
| Labor | | | |
| License / Infra | | | |

## 7. Đăng ký rủi ro ▸ full
| ID | Risk | Prob | Impact | Mitigation | Owner | Status |
|----|------|------|--------|------------|-------|--------|
| RK-001 | | H/M/L | H/M/L | | | Open |

## 8. Đăng ký phụ thuộc ▸ full
| ID | Dependency | Type | Impact if delayed |
|----|------------|------|-------------------|
| | External team / vendor | | |

## 9. Chất lượng & Chấp nhận ▸ full
| Gate | Criteria | Sign-off |
|------|----------|----------|
| G1 Discovery | DOC-01–03 | |
| G2 Build complete | Unit + integration pass | |
| G3 Go-live | UAT + DOC-17 dry-run | |

## 10. Phụ lục ▸ full
- Communication plan
- Training plan
- Hypercare plan (post go-live)

## 11. Phê duyệt ▸ full
| Vai trò | Họ tên | Ngày |
|---------|--------|------|
| PM | | |
| Sponsor | | |
