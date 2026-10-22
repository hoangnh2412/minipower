# DOC-14 — WBS & Ước lượng

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **PMBOK WBS**; Agile Epic · Feature · User Story · Story Points

> WBS/estimate là **phân rã phạm vi + điểm**. Tracker việc (todo/doing/done) **không** nằm trong DOC này — SQLite `artifact` khi `tasks_provider=none`, hoặc board OpenProject/Lark. Cột *Story ID* không thay `T-NNN`.

---

## 1. Tổng quan

| Mục | Giá trị |
|-----|---------|
| **Project / Phase** | |
| **Baseline SRS version** | DOC-06 vX.Y |
| **Estimation method** | Story Point / T-shirt / Bottom-up |
| **Velocity assumption** | SP / sprint |

## 2. Cấu trúc WBS

```text
1.0 Project
├── 1.1 Module A
│   ├── 1.1.1 Feature A1
│   └── 1.1.2 Feature A2
├── 1.2 Module B
└── 1.3 Non-functional (NFR, security, perf)
```

## 3. Phân rã Epic · Feature · Story

| WBS ID | Epic | Feature | Story ID | Story title | FR trace | AC trace | SP | Priority |
|--------|------|---------|----------|-------------|----------|----------|----|----------|
| 1.1.1 | EP-01 | FE-01 | US-001 | As a … I want … | FR-001 | AC-001, AC-002 | 5 | Must |

Story không có AC chưa phải story (DOC-07). Tách theo sản phẩm / luồng nghiệp vụ, không theo tầng kỹ thuật hay hoạt động; estimate ở story **hoặc** task con, không đếm đôi — luật đầy đủ: `minipower-pm-plan/reference/work-breakdown.md`.

## 4. Chi tiết story (mẫu)

### US-[ID] — [Title]

| Mục | Nội dung |
|-----|----------|
| **User story** | As a [role], I want [goal], so that [benefit] |
| **Acceptance criteria** | → DOC-07 AC-xxx |
| **Dependencies** | US-xxx, INT-xxx |
| **Story points** | |
| **Notes** | |

## 5. Chấm điểm độ phức tạp (tham chiếu skill — 0–20 / chiều)

| Module | Functional | Integration | Security | Data | Infra | Total | Size |
|--------|------------|-------------|----------|------|-------|-------|------|
| Module A | 12 | 8 | 10 | 6 | 4 | 40 | Medium |

## 6. Ước lượng effort theo vai trò

| Role | Person-days / hours | Ghi chú |
|------|---------------------|---------|
| BA | | |
| Backend | | |
| Frontend | | |
| QA | | |
| DevOps | | |
| PM | | |
| **Total** | | |

## 7. Giả định & Rủi ro (ước lượng)

| ID | Assumption / Risk | Impact on estimate |
|----|-------------------|--------------------|
| | | +20% buffer |

## 8. Ánh xạ Release / Wave

| Wave | Stories | Total SP | Target date |
|------|---------|----------|-------------|
| MVP | US-001 … | | |
| Phase 2 | | | |

## 9. Truy vết

| Story | FR | UC | CR |
|-------|----|----|-----|
| US-001 | FR-001 | UC-001 | |
