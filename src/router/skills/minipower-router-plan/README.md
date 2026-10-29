# minipower-router-plan

Lập kế hoạch nhiều task có tiêu chí đo được cho yêu cầu PHỨC; người OK một lần, AI điều phối, người ký PASS. Agent đọc [SKILL.md](./SKILL.md).

Atomic pack `router/`. Không agent bàn giao agent (ADR-022 QĐ-1 · ADR-043).

## Khi nào dùng

| Dấu hiệu | Ví dụ |
|---|---|
| Yêu cầu chạm ≥ 2 skill hoặc ≥ 2 pack | FR (analyst) + code (backend) |
| Có từ nối chuỗi | *rồi · sau đó · và review · cuối cùng · xong thì* |
| Đầu ra ≥ 2 artifact khác loại | DOC + code |
| Đã là tầng Full | module mới, DOC mới, đụng baseline |

Router tự triage; người không cần gọi tên lá. Không chắc đơn hay phức → router chọn PHỨC.

**Không dùng cho:** việc một lá phủ trọn → router đi thẳng lá đó · WBS / DOC-14 / DOC-15 → [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/README.md) · soát tiền đề → [minipower-router-readiness](../minipower-router-readiness/README.md) · có nên làm không → [minipower-router-deliberation](../minipower-router-deliberation/README.md).

## Cách gọi

Mô tả việc bằng lời trong Agent:

```text
Thêm module Tenants (TEN) và Orgs (ORG): viết FR cho cả hai, cập nhật SAD, scaffold .NET, rồi review.
```

Router báo PHỨC → `Sẽ chạy minipower-router-plan để lập kế hoạch …` → kế hoạch hiện trên chat → bạn sửa tiêu chí, OK một lần (hoặc nói *"từng bước"*). Gạt bằng *"không cần plan"*.

## Ví dụ — kế hoạch

Yêu cầu ở trên. Mode `standard`, tầng full.

**Tổng quan**

| # | Việc | Lá | Module | Phụ thuộc | ∥ | Gate |
|---|---|---|---|---|---|---|
| 1 | Premise Check: TEN, ORG có đáng là hai module? | `minipower-router-deliberation` | TEN, ORG | — | | ⏸ người |
| 2 | Viết UC/FR/AC cho TEN | `minipower-analyst-srs` | TEN | #1 | ∥ | readiness |
| 3 | Viết UC/FR/AC cho ORG | `minipower-analyst-srs` | ORG | #1 | ∥ | readiness |
| 4 | Review FR/AC hai module | `minipower-analyst-review` | TEN, ORG | #2, #3 | | review |
| 5 | Cập nhật SAD/API slice | `minipower-architecture-sad` | TEN, ORG | #4 | | readiness |
| 6 | Scaffold code .NET | `minipower-backend-scaffold-dotnet` | TEN, ORG | #5 | | ⏸ người |
| 7 | Review code | `minipower-backend-review-dotnet` | TEN, ORG | #6 | | review |

#2 và #3 độc lập (khác module, khác folder `03-modules/`) → hai agent con chạy song song, báo về agent chính. #4 chờ cả hai.

**Chi tiết task #2**

| Mục | Nội dung |
|---|---|
| Mô tả | Từ DOC-03 mục TEN, viết UC, FR, BR, AC vào `docs/03-modules/TEN/` theo DOC-05/06/07 |
| Điều kiện cần | DOC-03 có mục TEN đã review (#1 PROCEED) · dải ID `TEN-` chưa dùng · template DOC-05/06/07 có sẵn |
| Tiêu chí hoàn thành | Cơ bản B1–B5 · mỗi UC trong DOC-03 mục TEN có ≥ 1 FR · mỗi FR có ≥ 1 AC Given/When/Then · 0 FR thiếu Priority · `trace:check` 0 WARN cho TEN · 0 AC mâu thuẫn BR cùng module (đọc chéo) |
| Phụ thuộc | #1: cần verdict PROCEED và scope TEN chốt trong DOC-03 |
| Input tối thiểu | DOC-03 mục TEN |
| Output | DOC-05/06/07 của TEN; `TEN-UC-*`, `TEN-FR-*`, `TEN-AC-*` |
| Gate | readiness |

## Ví dụ — nhật ký tự kiểm dừng vì "cùng cách"

Task #2, điều kiện dừng (c):

| Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả |
|---|---|---|---|
| 1 | mỗi FR có ≥ 1 AC — thiếu 3 | Viết AC cho 3 FR theo UC | còn 1 (FR-007 không có UC gốc) |
| 2 | mỗi FR có ≥ 1 AC — thiếu 1 | Suy AC từ mô tả FR-007 | còn 1 — AC mâu thuẫn BR-002 |
| 3 | như trên | Suy AC từ mô tả FR-007 | **dừng — cùng cách lần 2; FR-007 vs BR-002 cần người quyết** |

Gói báo về rút gọn:

```text
Task #2/7 · Kết quả: DỪNG (c)
Output: docs/03-modules/TEN/DOC-05, DOC-06, DOC-07 (nháp)
Tiêu chí: đạt 5/6 — còn "mỗi FR có ≥ 1 AC" (FR-007)
Đề xuất cho người: chọn sửa FR-007 theo BR-002, hoặc bỏ FR-007
```

## Ví dụ — nhật ký review

Review #4 (vòng 0) ra một finding, vòng 1 đóng:

| Vòng | Finding | Task # | Lá | Cách xử lý | Kết quả |
|---|---|---|---|---|---|
| 0 | `DOC-06#TEN-FR-004` thiếu AC — vi phạm tiêu chí *mỗi FR có ≥ 1 AC* của #2 | #2 | `minipower-analyst-srs` | — | 1 finding |
| 1 | như trên | #2 | `minipower-analyst-srs` | Thêm `TEN-AC-011` | 0 finding → trình người ký |

## Liên quan

- [minipower-router § Triage](../minipower-router/README.md) — ai quyết ĐƠN / PHỨC
- [TPL-plan.md](../../templates/TPL-plan.md) — khuôn kế hoạch, bộ tiêu chí cơ bản B1–B7, gói giao việc / báo về
- [parallel-work](../../docs/parallel-work.md) — luật song song: một module một owner
- Pack hub: [router/README.md](../../README.md)
