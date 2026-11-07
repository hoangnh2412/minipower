---
name: minipower-analyst-srs
description: Viết use case FR BR AC SRS NFR prototype DOC-04 đến 07 13 19. Dùng khi requirements, SRS, acceptance criteria, business rules — không viết code, không SAD.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-analyst-srs

Không viết code. Không SAD. Không board task trong SRS (QĐ-8).

**Tiên quyết:** DOC-03 scope. Thiếu → [minipower-discovery-survey](../../../discovery/skills/minipower-discovery-survey/SKILL.md), không soạn khảo sát ở đây.

**ID:** `{MOD}-UC-001`, `{MOD}-FR-001`, `{MOD}-BR-001`, `{MOD}-AC-001`, `{MOD}-NFR-001`. AC phải trỏ FR.

**Template:** [DOC-04–07, 13, 19](../../../router/templates/) · **Folder:** `docs/03-modules/{module-id}/` · NFR: `docs/04-platform/DOC-13-nfr.md`

Trước khi đề xuất slice DOC-06, chạy [minipower-router-readiness](../../../router/skills/minipower-router-readiness/SKILL.md) — liệt kê tiền đề thiếu một lượt (module index, UC, BR, ghi nợ/BYPASS). Không nhảy soạn FR khi skeleton trống.

## Quy trình

| Bước | Nội dung | Artifact |
|------|----------|----------|
| 3 | Actor | DOC-05 |
| 4 | Use Case | DOC-05 |
| 5 | Business Rules | DOC-04 |
| 6 | Prototype / Wireframe — cổng chốt trước SRS | DOC-19 |
| 7 | FR (SRS) | DOC-06 |
| 8 | NFR | DOC-13 |
| 9 | Acceptance Criteria | DOC-07 |

> **Thứ tự khuyến nghị:** DOC-04 Business Rules → DOC-19 Prototype → DOC-06 SRS. Đây là thứ tự tốt, không phải cổng chặn ([ADR-020](../../../../ADRs/todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-11). `prereq-gate` nhắc khi thiếu DOC upstream của đúng module; ở `standard` nó chặn và người gõ `BYPASS` để đi tiếp. Chốt bước nào thì ghi DEC làm bản ghi ([SAMPLE mục 6](../../../router/templates/SAMPLE-agents.md)). Wireframe HTML sinh qua MCP ngoài (hoãn).

**NFR:** Performance · SLA · Security · Audit · HA/DR

**Exit:** FR baseline · AC trace FR · `05-traceability/trace-matrix.md`

CR nội dung đổi FR/AC: [minipower-analyst-cr](../minipower-analyst-cr/SKILL.md). Ticket: [minipower-pm-cr-track](../../../pm/skills/minipower-pm-cr-track/SKILL.md).

## Format phản hồi

1. Đã hiểu · 2. Còn thiếu · 3. Câu hỏi · 4. Requirements · 5. Actor · 6. UC · 7. BR · 8. Rủi ro · 9. Complexity · 10. DOC-XX

## Anti-patterns

- FR không trace UC/BR · thiếu negative AC · SRS monolith — tách module

**Tiếp:** [minipower-architecture-sad](../../../architecture/skills/minipower-architecture-sad/SKILL.md)

Hướng dẫn người: [README.md](README.md).
