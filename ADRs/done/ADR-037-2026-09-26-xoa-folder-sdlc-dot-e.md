# Xoá `src/sdlc/` — Đợt E/F ADR-033: hook → `router/`, hết pack SDLC

| | |
|---|---|
| **Ngày** | 2026-09-26 |
| **Trạng thái** | Done — 2026-09-27. T1–T6 xanh. Không còn `src/sdlc/`. Smoke Claude: skill router + `baseline-guard` |
| **Phạm vi** | Di trú hết nội dung còn lại trong `src/sdlc/` (đã xoá) sang nhà đúng ([`src/router/`](../../src/router/) · pack nghề/kênh · `contracts/`); wire lại CLI/CI/plugin; **xoá folder `src/sdlc/`**; siết [ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) QĐ-8 (hooks thôi neo `sdlc/`) |
| **Ngoài phạm vi** | Viết skill nghề mới · làm dày Lark ([ADR-036](../todo/ADR-036-2026-09-26-agent-skill-lark-tasks.md)) · Codex kênh 4 ([ADR-025](../todo/ADR-025-2026-08-26-ho-tro-codex-kenh-cai-thu-tu.md)) · Cursor plugin đầy đủ ([ADR-012](../todo/ADR-012-2026-07-26-minipower-cursor-plugin.md)) · eval runner ([ADR-026](../doing/ADR-026-2026-08-27-phuong-phap-danh-gia-chat-luong-minipower.md)) · Control Plane / agent runtime |
| **Nối tiếp** | [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) QĐ-3 · §5.0b · §5.0d · Đợt **E/F** · [ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) QĐ-8 (**siết**) · [ADR-031](../doing/ADR-031-2026-09-01-cli-install-init-thay-llm-thi-hanh.md) (CLI path) · [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md) (plugin root) · [ADR-034](../done/ADR-034-2026-09-26-minipower-marker-always-on-dispatch.md) · [ADR-035](../done/ADR-035-2026-09-26-memory-mot-file-thay-overview.md) (skeleton memory phẳng — giữ) · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-14 (pipeline theo module — harness, không skill fan-out) · [contracts/doc-mode.md](../../contracts/doc-mode.md) · [pack-manifest](../../contracts/pack-manifest.md) |
| **Mục đích** | Kết thúc nợ di trú: không còn module/pack tên `sdlc`; máy (hook · gen · install · plugin) neo `router/`; chữ AGENTS/README khớp dispatcher |
| **Ảnh hưởng** | `src/sdlc/` (**xoá**) · `src/router/` (nhận hooks · skeleton · agents · plugin) · pack nghề `templates/` · `contracts/` (DOC×mode SSOT nếu tách gen) · `cli/minipower.mjs` + fragment · `package.json` · `.github/workflows/minipower-hooks.yml` · `AGENTS.md` · `README.md` · test catalog / module-registry · `link-check.baseline.txt` |

---

## §1. Bối cảnh

[ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) đã chốt: **không** giữ `sdlc` như pack pipeline (QĐ-3). Pack nghề/kênh + `minipower-router` đã đứng; nhiều skill phase chỉ còn `[KHO]` trỏ lá. Nhưng **Đợt E chưa chạy** — máy vẫn neo `src/sdlc/`:

Số liệu đọc repo 2026-09-26:

| Khối trong `src/sdlc/` | Vai trò hiện tại | Đích đã khai (033 §5.0d) |
|------------------------|------------------|---------------------------|
| `hooks/` (~440K) | SSOT `rules.json` · gen · 6 shim · toàn bộ `npm test` | `router/hooks/` (+ bảng DOC×mode → `contracts/`) |
| `.claude-plugin/` | `${CLAUDE_PLUGIN_ROOT}` = `src/sdlc` | Phải đổi khi hooks rời |
| `project-skeleton/` · `docs-skeleton/` | `minipower init` | Init thuộc `router/` |
| `templates/` (DOC-01…19 + TPL) | Một SSOT file; `doc-mode` vẫn nói “đợt này vẫn `router/templates/`” | Pack nghề sở hữu template |
| `skills/` còn: `deliberation` · `readiness-gate` · `fan-out` · `as-built` · `planning` · `delivery` · `change-control` · `doc-review` | Trùng / `[KHO]` / identity QC đã gỡ | Router lá · **xoá** (fan-out không chuyển) |
| `agents/` · `roles/` · `docs/` · `SKILL.md` · `PACK.md` | Persona + hub pack `sdlc` | `router/` · chữ AGENTS |

[ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) QĐ-8 **cố ý** giữ `hooks/` trong `src/router/hooks/` vì lúc đó plugin root = `sdlc` và gộp `hooks/` vào `cli/` làm chết kênh Claude. ADR này **siết** QĐ-8: hooks đi theo **plugin root mới = `src/router/`**, không kéo vào `cli/`.

Điều kiện tiên quyết Đợt E (033): *D2 tối thiểu router + analyst* — **đã có** (router 4 lá · analyst/discovery/architecture/pm/… đã có skill thật).

---

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Hai “nhà” cùng lúc: `minipower-router` đã là dispatcher nhưng pack `sdlc` + `hooks` + plugin vẫn sống | Agent/người mới nhầm “cài sdlc”; catalog còn `pack: sdlc` |
| P2 | `npm test` / CI / CLI `import` hard-code `src/router/hooks` | Không xoá folder được; mọi đợt sửa path đắt |
| P3 | Skill `[KHO]` + `doc-review` + `PACK.md` sdlc còn trên đĩa | Hai SSOT chữ; loader có thể vẫn thấy tên cũ nếu cài nhầm path |
| P4 | ADR-032 QĐ-8 neo hooks tại sdlc — chưa có ADR thi hành đường thoát | Đợt E 033 không đủ chi tiết inventory + Confirm |

---

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **Không** agent runtime / spawn pack (ADR-022 QĐ-1 · ADR-033 QĐ-1) |
| C2 | **Chưa có skill thật → không tạo folder pack** (ADR-022 QĐ-7) — ADR này **không** mở module mới |
| C3 | Cứng = máy kiểm được; vòng `gen → test → gen:check` khi đụng `rules.json` / `lib` (AGENTS.md) |
| C4 | Ba kênh cài (Cursor/Claude/OpenCode) parity hook — không lệch fragment (ADR-020 QĐ-4 · ADR-032 C2) |
| C5 | Kênh plugin Claude **không được chết**: sau đổi root vẫn `claude --plugin-dir …/src/router` nạp skill + 6 shim (siết ADR-011 smoke) |
| C6 | **Không** gộp `hooks/` vào `cli/` (giữ lý do ADR-032 §5a — hooks = runtime mỗi prompt, không phải installer) |
| C7 | Skeleton memory phẳng (ADR-035) **không** rollback |
| C8 | Chữ ADR cũ: giữ nguyên, chỉ sửa **href** khi path đổi (ADR-022 QĐ-11) |

---

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Giữ `src/sdlc/` mãi làm “kernel hooks + skeleton” | Ít đụng | Trái QĐ-3 033; P1 còn | ❌ |
| O2 | Chuyển `hooks/` + skeleton + plugin → **`src/router/`**; template → pack nghề; xoá `src/sdlc/` | Khớp đích 033; một plugin root | Đợt Full lớn; smoke lại plugin | ✅ chọn |
| O3 | Đưa `hooks/` lên `cli/hooks/` + plugin root = gốc repo | Gộp installer | ADR-032 đã bác (chết plugin / gói cả ADRs) | ❌ |
| O4 | Symlink `sdlc/hooks → router/hooks` rồi xoá dần | Tương thích tạm | Hai path hợp lệ vô hạn; trái QĐ-3 032 | ❌ |

---

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Xoá `src/sdlc/` khi inventory §5a xong và T xanh** | Không còn `pack: sdlc` trong registry · không còn path `src/sdlc` trong code/CI (ngoài ADR/CHANGELOG lịch sử) |
| **QĐ-2** | **`src/router/` = nhà runtime dispatcher** | Nhận: `hooks/` · `.claude-plugin/` · `project-skeleton/` · `docs-skeleton/` · `agents/` (guard/load) · docs kỹ thuật hook · lá skill dispatcher đã có. `PACK.md` router khai đủ; **không** còn `src/sdlc/PACK.md` |
| **QĐ-3** | **Siết ADR-032 QĐ-8** | Hooks **không** ở `cli/`; đích mới = `src/router/hooks/`. Plugin root = `src/router` (`claude --plugin-dir <repo>/src/router`). Fragment CLI trỏ `…/src/router/hooks/bin/…` |
| **QĐ-4** | **`rules.json` SSOT** vẫn một file — sống tại `src/router/hooks/lib/rules.json` | Gen ghi vùng `<!-- BEGIN/END generated -->` vào `src/router/` (+ `contracts/doc-mode.md` nếu vẫn gen ra contracts). `package.json` / CI `working-directory: src/router/hooks` |
| **QĐ-5** | **Template DOC theo pack nghề** (bảng [doc-mode](../../contracts/doc-mode.md)) | `git mv` từng `DOC-NN-*.md` vào `src/{pack}/templates/`. **DOC-18 → `src/analyst/templates/`** (Q3). TPL dùng chung → `src/router/templates/`. `trace.sql` → skeleton `memory/`. **Cấm** hai bản DOC cùng ID. Ranh giới CR: §5b |
| **QĐ-6** | **Skill còn trong `sdlc/skills/` — map đóng** | Trùng lá router → **xoá** bản sdlc (gộp diff thiếu nếu có). `[KHO]` phase → **xoá**. `doc-review` → **xoá** identity. **`fan-out` → xoá hẳn** — không chuyển playbook: harness client + quy tắc owner trong `parallel-work` / ADR-020 QĐ-14 đủ (Q4). Khi E4: sửa `parallel-work` bỏ link skill fan-out |
| **QĐ-7** | **Registry / install** | `module-registry` bỏ `sdlc`; default install không còn pack sdlc; skill install path = `src/router` + packs đã chọn. Tên đăng ký dispatcher chỉ `minipower-router` |
| **QĐ-8** | **Thi hành tách E1…E5** (Q5) | Một đợt = một thay đổi Full. Sau E5: không còn `src/sdlc/` |
| **QĐ-9** | **Chữ F (033)** | `AGENTS.md` · `README.md` · hub router: hết “router-gộp ôm phase” / “kho `sdlc/`” như đường hiện hành; trỏ `src/router/hooks` |

### §5a. Inventory chuyển / xoá

| Nguồn (`src/sdlc/…`) | Đích | Ghi chú |
|----------------------|------|---------|
| `hooks/**` | `src/router/hooks/**` | Giữ cấu trúc `bin/` · `lib/` · `test/` |
| `.claude-plugin/` | `src/router/.claude-plugin/` | Đổi `name` nếu còn `minipower-sdlc` → khớp router |
| `project-skeleton/` · `docs-skeleton/` | `src/router/project-skeleton/` · `docs-skeleton/` | ADR-035 giữ |
| `agents/*.md` | `src/router/agents/` | `lark-work-assistant` — cắt task = ADR-036 (có thể để stub / xoá SOP task trong đợt này nếu 036 chưa Confirm: **chỉ chuyển file, không làm dày**) |
| `roles/` | Tan vào pack nghề đã có `roles/` hoặc `src/router/roles/` nếu còn dùng init | Không folder rỗng |
| `docs/` (token-guard, parallel-work…) | `src/router/docs/` | |
| `templates/DOC-01…03` | `src/discovery/templates/` | |
| `templates/DOC-04…07,13,19` | `src/analyst/templates/` | |
| `templates/DOC-08…12` | `src/architecture/templates/` | |
| `templates/DOC-14…15` | `src/pm/templates/` | |
| `templates/DOC-16` | `src/qa/templates/` | |
| `templates/DOC-17` | `src/ops/templates/` | |
| `templates/DOC-18` | `src/analyst/templates/` | SSOT nội dung CR (Q3). PM chỉ **pointer** / skill `minipower-pm-cr-track` — §5b |
| `templates/TPL-*` · README templates | `src/router/templates/` | |
| `skills/deliberation` · `readiness-gate` | **Xoá** nếu trùng `minipower-router-deliberation` / `readiness` | Diff nội dung trước khi xoá — gộp dòng thiếu vào lá router |
| `skills/as-built` | **Xoá** — đã có `minipower-architecture-as-built` | |
| `skills/planning` · `delivery` · `change-control` | **Xoá** `[KHO]` | Lá `pm` / `qa`+`ops` / `analyst-cr`+`pm-cr-track` |
| `skills/fan-out` | **Xoá** — không chuyển file | Harness + `parallel-work` (quy tắc owner); bỏ link skill khi E4 |
| `skills/doc-review` | Rút 5 chiều (nếu chưa có trong `*-review`) rồi **xoá** | |
| `SKILL.md` · `PACK.md` · `INSTALL.md` · `README.md` · `CHANGELOG.md` | Gộp ý cần vào `src/router/README.md` / CHANGELOG repo rồi **xoá** cùng folder | Không giữ hub sdlc |

### §5b. DOC-18 vs nhịp PM (chốt Confirm Q3)

**SSOT file** = `analyst/templates/DOC-18-…` (sổ thay đổi phạm vi / delta FR). **Không** có nghĩa mọi CR phải ghi xong DOC-18 trước khi code.

| Việc | Owner | Skill |
|------|-------|--------|
| Chốt / mô tả thay đổi phạm vi, delta FR/AC, impact nội dung | **Analyst** | `minipower-analyst-cr` → ghi (khi ghi) vào DOC-18 |
| Thủ tục giải trình, ticket, milestone, “đã báo cáo chưa” | **PM** | `minipower-pm-cr-track` → board/provider — **không** nhân bản DOC-18 |

Song song “vừa thực thi vừa giải trình” hoặc “cuối dự án mới ghi nhận CR” là **lựa chọn dự án** (nhẹ bằng lời / ghi nợ `doc-debt` hoặc open-questions) — không đổi chỗ file template. Khi đội **có** ghi sổ CR nội dung → một nhà: analyst. PM không giữ bản DOC-18 thứ hai.

```text
Trước:  src/sdlc/{hooks,skills,templates,skeleton,…}  +  src/router/{skills mỏng}
Sau:    src/router/{hooks,skills,agents,skeleton,templates-TPL,…}
        src/{discovery,analyst,…}/templates/DOC-*
        (không còn src/sdlc/; không còn skill fan-out)
```

---

## §6. Confirm *(bắt buộc trước khi thi hành)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…9 (xoá `src/sdlc/`, hooks+plugin → `src/router/`, siết ADR-032 QĐ-8)? | **Có** — 2026-09-26 |
| Q2 | Plugin root mới = **`src/router`** — chấp nhận smoke lại `claude --plugin-dir …/src/router` (và Cursor fragment)? | **Có** |
| Q3 | DOC-18 SSOT đặt ở pack nào: **`analyst/`** (đề xuất) hay `pm/`? | **`analyst/`** — ranh giới nhịp PM: §5b |
| Q4 | `fan-out`: playbook vào đâu? | **Không cần** — harness đã làm → **xoá** skill, không chuyển playbook (QĐ-6) |
| Q5 | Thi hành tách E1…E5? | **Có** — tách E1→E5 |

Chốt 2026-09-26: **Trạng thái** Confirm · ADR → `doing/` · index cập nhật.

---

## §7. Việc triển khai

| Đợt | Việc | Done khi | Phụ thuộc |
|-----|------|----------|-----------|
| **E0** | Confirm Q1–Q5; Điều chỉnh ADR-032 QĐ-8 + ADR-033 trỏ ADR-037 | §6 có trả lời · ADR ở `doing/` | 🟢 2026-09-26 |
| **E1** | `git mv` `src/router/hooks` → `src/router/hooks`; sửa `package.json` · CI · `cli/minipower.mjs` import · mọi hard-code path; `npm run gen` · `npm test` · `gen:check` | T2 xanh; không còn `src/router/hooks` | 🟢 2026-09-26 |
| **E2** | `git mv` `.claude-plugin` + skeleton + `agents` + `docs` (+ `roles`) → `src/router/`; sửa fragment Claude/Cursor/OpenCode; README install path | T1 (unit path) xanh; T3 chủ repo smoke plugin | 🟢 2026-09-26 (T3 chủ repo) |
| **E3** | Chia `templates/DOC-*` theo §5a (DOC-18 → analyst); TPL → router; cập nhật href; `doc-mode` / gen path | Một DOC-ID một file; `link:check` 0 MỚI | 🟢 2026-09-26 |
| **E4** | Map skill §5a; **xoá `fan-out`** + sửa `parallel-work` bỏ link; xoá `doc-review` identity | `src/sdlc/skills/` không còn | 🟢 2026-09-26 |
| **E5** | Registry bỏ `sdlc`; chữ AGENTS/README/F; xoá toàn bộ `src/sdlc/`; grep tàn dư; baseline link nếu cần | T4–T6; **không còn `src/sdlc`** | 🟢 2026-09-26 |
| **F** | (gộp E5) Persona / hub chữ khớp QĐ-9 | grep “ôm phase” / “pack sdlc” hiện hành = 0 ngoài ADR | 🟢 2026-09-26 |

---

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | `node cli/minipower.mjs` / fragment `--print` trỏ `src/router/hooks/bin/*` | 6 shim đủ | 🟢 2026-09-26 E2 |
| T2 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới (từ gốc repo) | xanh; working-dir `src/router/hooks` | 🟢 2026-09-26 E5 |
| T3 | Smoke | `claude --plugin-dir <repo>/src/router` từ folder sạch | Plugin nạp · skill router · hook chạy — **chủ repo** | 🟢 2026-09-27 (`minipower:minipower-router*` · `@docs/02-baseline/…` → *Operation stopped by hook*) |
| T4 | Mới | `test ! -d src/sdlc` + registry không liệt `sdlc` | PASS | 🟢 2026-09-26 |
| T5 | Regression | `rg 'src/sdlc|minipower-sdlc|pack: sdlc' --glob '!ADRs/**' --glob '!**/CHANGELOG*'` | 0 hit (hoặc whitelist có chủ đích) | 🟢 2026-09-26 (còn lịch sử `isOurs` minipower-sdlc trong CLI) |
| T6 | Mới | Test canh: mọi `DOC-NN` chỉ một path dưới `src/*/templates/` | `npm test` đỏ nếu nhân bản | 🟢 2026-09-26 |

---

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Hết module `sdlc`; một nhà runtime `router/`; khớp ADR-033 đích; init/hook/plugin cùng cây |
| Xấu / chi phí | Đợt Full nhiều PR; sửa hàng trăm href; smoke lại Claude/Cursor; ADR-012/025 chữ còn nói `sdlc/install` — sửa href khi đụng |
| Trung lập | Tên thương hiệu `minipower` giữ; ID DOC/DEC không đổi |
| Không làm | Kéo hooks vào `cli/` · symlink lâu dài · mở pack mới chỉ để chứa template · **giữ skill / playbook fan-out** (Q4) |

---

*Liên quan:* Đợt E/F [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) · siết [ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) QĐ-8 · plugin [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md).
