# Contracts — hợp đồng phối hợp liên-pack

Tách từ `COORDINATION.md` (draft v0.1) ngày 2026-08-25 — **mỗi chủ đề một file, mỗi file tự khai trạng thái** (ADR-022 QĐ-10). Sửa hợp đồng tại đúng file chủ đề; pack không định nghĩa lại.

> Mục tiêu: nhiều pack skill (mỗi pack phục vụ một/vài **vai trò** trong công ty) **hoạt động và phối hợp được với nhau** — kể cả khi chạy trên **repo khác nhau** (repo tài liệu vs repo code). Nền tảng: 5 primitive điều phối của `sdlc/` (trace, memory, decision-log, ownership, sync) nâng thành chuẩn chung cho mọi pack.

## Chỉ mục

| File | Loại | Trạng thái | Nội dung |
|---|---|---|---|
| [trace-spine.md](trace-spine.md) | **Luật** | 🟡 Một phần sống | Xương sống ID; kéo dài xuống `CMP`/`TEST`/`DEPLOY`; luật "mọi artifact trace về FR/AC" |
| [handoff.md](handoff.md) | **Giao thức** | 🟢 Per-module **đã sống** | 6 boundary H1–H6, input tối thiểu, bàn giao theo module |
| [shared-conventions.md](shared-conventions.md) | **Quy ước** | 🟡 Sống trong `sdlc/` | memory · decision-log · versioning · ownership dùng chung · luật ứng xử của agent (bảo mật artifact, viết code) |
| [cross-repo-bridge.md](cross-repo-bridge.md) | **Cơ chế** | ⚪ Thiết kế | Pin `docs@tag` + back-reference; kích hoạt khi docs tách repo |
| [pack-manifest.md](pack-manifest.md) | **Schema** | 🟢 **Load-bearing** | Khuôn `PACK.md` mỗi pack tự khai consumes/produces/handoff |
| [doc-mode.md](doc-mode.md) | **Bảng** | 🟢 Sinh từ `rules.json` | DOC × phase × pack nghề (ADR-033 E) |

## Nguyên tắc nền

| # | Nguyên tắc | Ý nghĩa |
|---|------------|---------|
| 1 | **Pack ≠ vai trò cứng** | Một pack có thể gom nhiều vai trò (`sdlc` = BA+SA+TPM) nếu chúng chia sẻ hạ tầng. Không xé pack chỉ để "mỗi role một folder". |
| 2 | **ID là tiền tệ** | Mọi phối hợp diễn ra qua **ID ổn định**, không qua "đọc lại toàn bộ tài liệu". Artifact nào cũng trace được về một FR/AC. |
| 3 | **Handoff có tên + mức tối thiểu** | Bàn giao xảy ra tại **boundary có tên** (H1…H6), mỗi boundary khai báo *input tối thiểu* — không chờ "xong hết". |
| 4 | **Một ngôn ngữ chung** | memory schema · decision-log schema · versioning · ownership giống nhau ở mọi pack. |
| 5 | **Liên repo qua con trỏ pin, không copy tay** | Artifact vượt biên repo bằng version pin (tag/submodule/rsync) + back-reference, không chỉnh tay hai nơi. |

## Việc còn lại

- [x] `PACK.md` cho `sdlc` và `backend` (theo [pack-manifest.md](pack-manifest.md)) — *xong 2026-08-25*
- [ ] Mở rộng trace spine trong `sdlc`: thêm `CMP/TEST/DEPLOY` vào trace-matrix template
- [ ] Ghi boundary H4/H6 vào `architecture/` + `ops/` / `qa/`
- [ ] `traceability/from-docs.md` mẫu ở phía repo code
- [ ] Pack vai trò mới khi cần: `frontend`, `qa`, `ops` (theo khung [pack-manifest.md](pack-manifest.md) §5.4)

---

*Liên quan:* [sdlc pipeline](../src/router/docs/pipeline.md) · [parallel-work](../src/router/docs/parallel-work.md) · [decision-log](../src/router/docs/decision-log.md) · [backend publish](../src/backend/README.md)
