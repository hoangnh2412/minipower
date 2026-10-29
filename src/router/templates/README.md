# Template tài liệu chuẩn (DOC-01 → DOC-19)

Mỗi file là khung copy-paste khi sinh artifact. Tham chiếu tiêu chuẩn/nguồn chính:

| ID | File | Tiêu chuẩn / nguồn |
|----|------|-------------------|
| DOC-01 | [DOC-01-vision-business-case.md](DOC-01-vision-business-case.md) | Khung Business Case (PMI, BABOK) |
| DOC-02 | [DOC-02-stakeholder-analysis.md](DOC-02-stakeholder-analysis.md) | Stakeholder register (PMBOK, BABOK) |
| DOC-03 | [DOC-03-brd.md](DOC-03-brd.md) | BRD industry practice |
| DOC-04 | [DOC-04-business-rules.md](DOC-04-business-rules.md) | Business Rules / DMN-inspired |
| DOC-05 | [DOC-05-use-cases.md](DOC-05-use-cases.md) | UML Use Case, Cockburn |
| DOC-06 | [DOC-06-srs.md](DOC-06-srs.md) | **IEEE 830**, **ISO/IEC/IEEE 29148** |
| DOC-07 | [DOC-07-acceptance-criteria.md](DOC-07-acceptance-criteria.md) | **Gherkin / BDD** |
| DOC-08 | [DOC-08-sad.md](DOC-08-sad.md) | **SEI** Views and Beyond, 4+1 |
| DOC-09 | [DOC-09-adr.md](DOC-09-adr.md) | **Michael Nygard ADR** |
| DOC-10 | [DOC-10-integration-specification.md](DOC-10-integration-specification.md) | Integration patterns, SAD adjunct |
| DOC-11 | [DOC-11-data-model.md](DOC-11-data-model.md) | **UML**, **ERD** |
| DOC-12 | [DOC-12-api-specification.md](DOC-12-api-specification.md) | **OpenAPI (OAS)** |
| DOC-13 | [DOC-13-nfr.md](DOC-13-nfr.md) | ISO 25010, van Lamsweerde |
| DOC-14 | [DOC-14-wbs-estimate.md](DOC-14-wbs-estimate.md) | **PMBOK WBS**, Story mapping |
| DOC-15 | [DOC-15-project-plan.md](DOC-15-project-plan.md) | **IEEE 1058 SPMP** |
| DOC-16 | [DOC-16-test-strategy.md](DOC-16-test-strategy.md) | Test Strategy & Test Cases — catalog Layer/Path/Priority |
| DOC-17 | [DOC-17-deployment-guide.md](DOC-17-deployment-guide.md) | Runbook / cutover checklist |
| DOC-18 | [DOC-18-change-request-register.md](DOC-18-change-request-register.md) | Change Management / RFC |
| DOC-19 | [DOC-19-prototype.md](DOC-19-prototype.md) | Prototype / Wireframe (phase requirements; HTML wireframe qua MCP ngoài — hoãn) |

## Template phụ trợ (ngoài bộ DOC-01→19)

Dùng khi vận hành/quản trị, **không** đánh số DOC — không vào trace-matrix baseline (N5, ADR 2026-07-20 §3.5).

| Template | File | Khi nào dùng |
|----------|------|--------------|
| Agent profile | [TPL-agent-profile.md](TPL-agent-profile.md) | Schema profile **v3** + khung `AGENTS.md` (mục 0–8). Bản đã điền: [SAMPLE-agents.md](SAMPLE-agents.md) |
| Kế hoạch nhiều task | [TPL-plan.md](TPL-plan.md) | Yêu cầu PHỨC chạm ≥ 2 skill (ADR-043): task có tiêu chí đo được, sống trên chat, người OK rồi mới chạy |
| RFC | [TPL-rfc.md](TPL-rfc.md) | Đề xuất thay đổi cần lấy ý kiến trước khi quyết; chốt → ADR (DOC-09) |
| Meeting Minutes | [TPL-meeting-minutes.md](TPL-meeting-minutes.md) | Biên bản họp — quyết định + action item |
| Incident Report | [TPL-incident-report.md](TPL-incident-report.md) | Ghi nhận sự cố vận hành (SEV1–3) |
| Postmortem | [TPL-postmortem.md](TPL-postmortem.md) | Phân tích blameless sau sự cố nghiêm trọng/lặp lại |
| Trace SQLite | [trace.sql](trace.sql) | Khuôn `memory/trace.sql` / DB `trace.db` (ADR-033) — không chứa body |

## Governance & traceability (`docs-skeleton/`)

| File | Mô tả |
|------|-------|
| [business-glossary.md](../docs-skeleton/00-governance/business-glossary.md) | SSOT trạng thái & thuật ngữ — DOC Status, sign-off registry, DOC-16 catalog (Layer/Path/Priority) |
| [doc-versioning.md](../docs-skeleton/00-governance/doc-versioning.md) | Version, header, Change Log; đồng bộ `doc-registry` |
| [doc-registry.md](../docs-skeleton/05-traceability/doc-registry.md) | Đăng ký DOC theo module — Author, Status, Baseline, sign-off |
| [trace-matrix.md](../docs-skeleton/05-traceability/trace-matrix.md) | Trace FR↔UC↔AC↔TC — single source of truth |

**Cấu trúc folder dự án:** copy [docs-skeleton](../docs-skeleton/README.md) → `{project-root}/docs/`.
