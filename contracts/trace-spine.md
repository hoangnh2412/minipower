# Trace spine — xương sống ID (LUẬT)

**Trạng thái:** 🟡 Một phần sống — luật `UC→FR→AC→Test` + `trace:check` đang chạy thật trong `src/router/hooks/`; ba ID mở rộng (`CMP`/`TEST`/`DEPLOY`) **chưa áp dụng** — bật khi pack code cắm vào spine.

`sdlc` trace `Goal → … → AC → Test`. Contract **kéo dài xuống code + ops** để pack downstream (backend, frontend, QA, ops) cắm vào cùng một xương sống.

```text
Goal → Stakeholder → BR → UC → FR → AC ─┬→ Design → Code → Test → Deploy
DOC-01   DOC-02    04   05   06   07    │  09/11/12  CMP   TEST   17
                                         └→ NFR(13) ───────────→ Test
```

## 1. ID hiện có — giữ nguyên

| ID | Ý nghĩa | Nguồn |
|----|---------|-------|
| `DOC-NN` | Tài liệu chuẩn (01–18) | `router/templates/` |
| `{MOD}-UC-NNN` · `-FR-` · `-BR-` · `-AC-` | Artifact theo module | [minipower-analyst-srs](../src/analyst/skills/minipower-analyst-srs/SKILL.md) |
| `DEC-{PHASE}-NNN` | Quyết định + phương án bị loại | [decision-log.md](../src/router/docs/decision-log.md) |
| `ADR-NNN` | Quyết định kiến trúc formal | DOC-09 |

## 2. ID thêm mới — cho downstream trace ngược

| ID | Ý nghĩa | Ai tạo | Trace về |
|----|---------|--------|----------|
| `{MOD}-CMP-NNN` | Component / module code | Backend/Frontend pack | `{MOD}-FR-*` |
| `{MOD}-TEST-NNN` | Test case | QA pack | `{MOD}-AC-*` |
| `{MOD}-DEPLOY-NNN` | Đơn vị triển khai (service, job, pipeline) | Ops/Delivery pack | DOC-17 · `{MOD}-CMP-*` |

**Luật chung:** *mọi artifact trace được về một FR/AC.* Ví dụ ràng buộc thực thi:
- Commit/PR ở repo code nhắc ID upstream: `feat(billing): retry policy — BILL-FR-021`.
- Test nhắc AC: `BILL-TEST-004 → BILL-AC-005`.

---

*Liên quan:* [handoff.md](handoff.md) (bàn giao tại boundary) · [pack-manifest.md](pack-manifest.md) (pack khai consumes/produces bằng ID)
