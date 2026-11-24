# Init theo bề mặt — docs mặc định, code là folder cạnh nhau

| | |
|---|---|
| **Ngày** | 2026-09-26 |
| **Trạng thái** | Done — 2026-09-27. T1–T5 unit; T6 smoke TTY. Điều chỉnh cùng ngày: init không ghi `AGENTS.md` |
| **Phạm vi** | `minipower init`: lớp lõi luôn có; lớp tài liệu mặc định; Backend / Frontend / Mobile / Autotest là folder anh em, chỉ tạo khi chọn |
| **Ngoài phạm vi** | Scaffold solution Jarvis · pack `frontend/` `mobile/` `autotest/` · đường dẫn folder tự khai · repo code tách riêng ([cross-repo-bridge](../../contracts/cross-repo-bridge.md)) |
| **Nối tiếp** | [ADR-031](../doing/ADR-031-2026-09-01-cli-install-init-thay-llm-thi-hanh.md) QĐ-7–9 · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-2 · [ADR-022](ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 · [ADR-035](ADR-035-2026-09-26-memory-mot-file-thay-overview.md) |
| **Mục đích** | Một lệnh init dùng được cho dự án chỉ tài liệu và dự án có thêm code, không bị một skeleton docs |
| **Ảnh hưởng** | `cli/minipower.mjs` · `src/router/hooks/lib/rules.json` (`project_surfaces`) · `rules.js` · `profile-guard.js` · `src/router/surface-skeleton/` · `project-skeleton/README.md` · `INIT.md` · `minipower-router-init/SKILL.md` · test `install-cli` · `profile-guard` · `rules` |

---

## §1. Bối cảnh

`minipower init` copy nguyên `project-skeleton` + `docs-skeleton`. Cây đó là hồ sơ: `docs/`, `memory/`, `assets/`, `brainstorm/`. `isMinipowerProject` coi có dự án khi có `memory/memory.md` **và** `docs/`.

Pack `backend` đã có skill scaffold Jarvis (solution `.sln` riêng). Chưa có pack frontend, mobile, autotest (ADR-022 QĐ-7: chưa có skill thật thì chưa tạo folder module).

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Init luôn dựng cây quản lý tài liệu | Repo có thêm Backend, Frontend, Mobile hoặc Autotest không có chỗ đứng trong khung |
| P2 | Nhét scaffold .NET / framework vào init | Trùng skill Jarvis; bịa cấu trúc cho stack chưa có pack |
| P3 | Bỏ `docs/` làm mất nhận diện dự án | Hook profile/prereq không chạy trên repo chỉ code |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | Init vẫn là script, không LLM (ADR-031) |
| C2 | `project_mode` không cắt folder tài liệu (ADR-020 QĐ-2) — bề mặt là trục khác |
| C3 | Không mở pack frontend/mobile/autotest trong ADR này |
| C4 | File đã có không bị đè (kể cả README gốc) |
| C5 | Profile v3 thiếu `surfaces` vẫn hợp lệ — hiểu là `["docs"]` |

## §4. Phương án

| # | Phương án | |
|---|---|---|
| O1 | Giữ init chỉ docs; code để skill khác | Không giải P1 |
| O2 | Folder cố định `backend/` `frontend/` `mobile/` `autotest/`, chỉ tạo cái được chọn | Chọn |
| O3 | Mỗi bề mặt một đường dẫn tự khai | Linh hoạt hơn nhu cầu đã chốt; `--check` yếu |
| O4 | Init gọi scaffold Jarvis và sinh app frontend | Trái C3; init thành installer framework |

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Bề mặt là dữ liệu** `rules.json` → `project_surfaces` | `docs` (mặc định) · `backend` · `frontend` · `mobile` · `autotest`. `path` = `id` |
| **QĐ-2** | **Lõi luôn ghi** | `.minipower/` + `memory/` |
| **QĐ-3** | **`docs` copy skeleton hiện tại** | `docs/` + `assets/` + `brainstorm/` + README/FAQ. Tắt `docs` thì không copy các thứ đó |
| **QĐ-4** | **Code = cây cố định + README** | `surface-skeleton/{id}/` copy vào folder bề mặt: backend `src/` `tests/` `build/` `docs/Architecture.md`; frontend, mobile, autotest là `src/`. Không sinh `.sln` hay framework. Init **không** ghi `AGENTS.md` — in prompt (bản mẫu + số liệu profile); người dán vào chat để viết file. Không đè file đã có |
| **QĐ-5** | **`profile.surfaces`** | Mảng id, thứ tự catalog. Thiếu field = `docs`. Id lạ hoặc mảng rỗng → profile không hợp lệ, init FAIL |
| **QĐ-6** | **`init --check`** | Đòi đúng folder đã khai. `docs/` chỉ bắt buộc khi bề mặt có `docs` |
| **QĐ-7** | **Nhận diện dự án** | `memory/memory.md` và (`docs/` hoặc `surfaces` không gồm `docs`) |

## §6. Xác minh

| # | Loại | Việc | Kỳ vọng |
|---|---|---|---|
| T1 | Mới | `init --answers` không khai `surfaces` | `surfaces: ["docs"]`, có `docs/`, không có `backend/` |
| T2 | Mới | `surfaces: ["frontend","backend","docs"]` | Thứ tự catalog; có `backend/src/` `tests/` `build/` và `frontend/src/`; không `mobile/` `autotest/`; không `.sln`; `--check` OK |
| T3 | Mới | `surfaces: ["backend"]` | Có `memory/` + `.minipower/` + `backend/`; không `docs/` `assets/` `brainstorm/`; `--check` OK |
| T4 | Mới | `surfaces: ["ios"]` | FAIL |
| T5 | Regression | `npm test` · `gen:check` | Xanh. `project_mode` vẫn không cắt folder docs |
| T6 | Smoke | Init TTY trên `sample-cursor` | 🟢 2026-09-27 — chọn cả năm bề mặt; cây + `.minipower/` + profile khớp. Enter mặc định chỉ `docs` đã có unit stdin |
| T7 | Smoke | Prompt init → người viết `AGENTS.md` | 🟢 2026-09-27 — file ra đúng nội dung dự án |

## §7. Điều chỉnh 2026-09-27 — `AGENTS.md` không do init ghi

Câu cũ trong QĐ-4 (*render từ khuôn, thay token `{surfaces}`*) hết hiệu lực. Init in prompt: đường dẫn `SAMPLE-agents.md` và số liệu `memory/profile.json`. Người dán prompt vào chat. File đã có thì giữ nguyên.
