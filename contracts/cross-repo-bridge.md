# Cross-repo bridge — cầu hai chiều docs ↔ code (CƠ CHẾ)

**Trạng thái:** ⚪ Thiết kế — **kích hoạt khi tài liệu dự án đích tách thành repo riêng** (triển khai dạng submodule trong repo chính — kế hoạch đã xác nhận 2026-08-24; khi có MCP thì đẩy nền tảng lưu trữ chung như Outline).

Bài toán: DOC-08/11/12 sống ở **repo docs**; pack code đọc ở **repo code** (Jarvis). Cầu hai chiều:

```mermaid
flowchart LR
  subgraph DOCS["repo docs (sdlc)"]
    SAD["DOC-08 SAD"]
    API["DOC-12 API"]
    DM["DOC-11 data model"]
    TM["05-traceability/trace-matrix.md"]
  end
  subgraph CODE["repo code (Jarvis)"]
    SCAF["scaffold + CMP-*"]
    BR["traceability/from-docs.md"]
  end
  SAD -->|H4: freeze + pin docs@tag| SCAF
  API -->|H4| SCAF
  DM  -->|H4| SCAF
  SCAF -->|back-ref FR→PR/CMP| BR
  BR -.->|H6: cập nhật trace| TM
```

## 1. Chiều xuống (docs → code) — tại H4

- SA **đóng băng** DOC-08/11/12 → repo code nhận qua **con trỏ có version**: `docs@<tag>` (submodule / rsync / release script). **Tái dùng đúng cơ chế publish đã có** ([backend/README.md — publish](../src/backend/README.md)) — không phát minh cơ chế mới.
- Không copy tay từng đoạn spec vào code. Chỉ pin version + đọc.

## 2. Chiều lên (code → docs) — tại H6

- Repo code giữ `traceability/from-docs.md`: bảng map `{MOD}-FR → PR/file/{MOD}-CMP`.
- Đây là đầu nối để **trace-matrix** của `sdlc` "nhìn thấy" code — khép kín `FR → Code → Test → Deploy`.

## 3. Pin version

- Bump có chủ đích: `DOCS_REF=v1.4.0` (tag repo docs) — giống `JARVIS_SKILLS_REF` hiện có.
- Đổi spec sau baseline → CR ở repo docs → bump ref ở repo code, không sửa lệch.

## 4. Bài học ↔ skill (ADR-044) — cầu khác, đang chạy

**Trạng thái mục này:** 🟢 Active — khác §1–3 (vẫn ⚪ thiết kế, chờ tách repo docs). Đây là cầu giữa **repo dự án đích** (nơi phản hồi "làm chưa tốt" phát sinh) và **repo tác giả `hoangnh2412/minipower`** (nơi skill sống), qua GitHub Issue — không cần tách repo, không cần MCP riêng ngoài `feedback`.

Back-ref **hai chiều**, không chỉ một hướng:

| Lúc | Ghi ở đâu | Ghi gì |
|---|---|---|
| Phát hiện lỗi (retro, [minipower-router-retro](../src/router/skills/minipower-router-retro/SKILL.md)) | GitHub Issue, trường 6 | `{tên-lá}@{version lúc đó}` — version **trước khi sửa** |
| Nâng skill ([upgrade-from-lesson](../src/toolbox/skills/minipower-toolbox-skill-author/workflows/upgrade-from-lesson.md) chế độ thi hành) | `CHANGELOG.md` của lá | Dòng mới kèm `(#NNN)` — số issue vừa đóng |
| Đóng issue | Comment trên issue, trước khi đóng | *"đã nâng `{tên-lá}@{version mới}"* |

Nhờ vậy, từ một dòng CHANGELOG lần ra đúng issue gây ra nó; từ một issue đã đóng lần ra đúng version đã sửa — không cần hệ thống trace riêng.

---

*Liên quan:* [handoff.md](handoff.md) (H4/H6) · [trace-spine.md](trace-spine.md) (`CMP` trace về FR) · [backend/README.md](../src/backend/README.md) (cơ chế publish submodule/rsync) · [minipower-router-retro](../src/router/skills/minipower-router-retro/SKILL.md) + [upgrade-from-lesson](../src/toolbox/skills/minipower-toolbox-skill-author/workflows/upgrade-from-lesson.md) (§4, ADR-044)
