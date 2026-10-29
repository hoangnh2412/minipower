# Minipower — dispatcher + pack theo nghề/kênh + SSOT provider + chỉ mục SQLite

| | |
|---|---|
| **Ngày** | 2026-09-25 |
| **Trạng thái** | **QĐ-1…20 chốt.** A–C, D1 (4 lá kênh), presales unit 2026-09-26. **031 CLI unit xong.** SOP khảo sát / SRS / SAD nằm ở lá `minipower-discovery-survey`, `minipower-analyst-srs`, `minipower-architecture-sad`. **Đợt E/F → [ADR-037](../done/ADR-037-2026-09-26-xoa-folder-sdlc-dot-e.md)** (xoá `src/sdlc/`; siết ADR-032 QĐ-8). Một `name` dispatcher: `minipower-router`. Còn smoke T6. |
| **Phạm vi** | **Toàn repo + skeleton dự án đích** — định vị dispatcher, tách pack nghề/kênh, `profile.json` v3, SSOT tài liệu/việc, chỉ mục trace SQLite, cấu trúc folder mục tiêu |
| **Ngoài phạm vi** | Thi hành di chuyển file (đợt sau, sau Confirm) · MCP Obsidian (treo) · Control Plane / agent runtime · đổi tên repo · [ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) (`src/`/`cli/`) — trực giao, không ghép vào đợt này |
| **Nối tiếp** | **Giữ** [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1 (Role Intelligence, không runtime) · QĐ-4/QĐ-7 (hệ tên, 3 câu hỏi) · QĐ-9 (MCP bằng tên trừu tượng) · QĐ-12 (không Control Plane) · **Giữ** [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) wrap-not-build + L1/L2/L3 · **Giữ** [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) `project_mode` + cứng-bằng-máy · **Siết** ADR-022 QĐ-3/QĐ-5 (`sdlc` = router-gộp ôm hết phase) · **Mở lại** Lark như *provider tuỳ chọn* (không phải module nghề) — khác [ADR-017](../cancel/ADR-017-2026-08-20-minipower-toolchain-openproject-github-outline-slack.md) QĐ-3 (🟣, “Lark rời lộ trình”) · **Chọn nhánh** [ADR-009](../cancel/ADR-009-2026-07-25-minipower-orchestrator-analysis.md) đã 🟣: dispatcher, **không** supervisor tự bàn giao |
| **Mục đích** | Chốt: Minipower gợi ý/mở pack (atomic), không điều phối runtime; đất sét nằm đúng một docs provider + một tasks provider; trace UC→FR→AC vẫn moat, query bằng SQLite |
| **Ảnh hưởng** | [AGENTS.md](../../AGENTS.md) · [README.md](../README.md) · [`sdlc/`](../../src/router/) (kho chuyển) · pack nghề (`analyst/` `architecture/` `pm/` `support/` `backend/` …) tự chứa skill/rules/hooks/templates/review · kênh `tasks/` `docs/` `chat/` `vcs/` · [`contracts/`](../../contracts/) · `profile-guard` · không tầng `templates/` 19 DOC dùng chung |

---

## §1. Bối cảnh

Minipower đang là **một cửa `minipower-sdlc`** ôm 6 phase + 3 gate mềm + fan-out + as-built + template 19 DOC + hook, trong khi pack kỹ thuật (`backend/`, `ops/`) đã là **lá-rời**. Hệ quả:

- Router nạp quá nhiều luật vào mọi intent (kể cả “hỏi làm rõ yêu cầu” — việc harness client đã làm được).
- Channel (Lark) sống như agent phụ trong `sdlc/agents/`, trong khi ADR-017 từng đưa Lark *ra lộ trình* dù MCP `user-lark-mcp` đang dùng thật.
- `approval_source` (ADR-020 QĐ-12) mới tách `{docs,tasks,code}` — **thiếu `chat`**, chưa cấm hai provider cùng lúc, chưa có migration, chưa có chỗ query trace khi body tài liệu không còn trong `docs/`.

Chủ repo chốt định hướng 2026-09-23…25: **dispatcher** (không orchestrator runtime); **SSOT đất sét** ở nền tảng khi có MCP; **trace bắt buộc**; **một profile = một provider / mặt**; **atomic load**.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | `sdlc/` vừa là khuôn (template/ID) vừa là mọi nghề BA/SA/PM vừa là channel | Context phình; skill nghề không atomic; harness (fan-out/QC) bị nhái lại trong pack |
| P2 | Coi `docs/` git là SSOT mặc định, trong khi việc thật sống ở Lark/OpenProject và tài liệu duyệt sống ở Outline | Hai nơi ghi cùng sự thật; agent bịa hoặc lệch board |
| P3 | Trace gắn parser markdown; khi body ra Outline thì `trace:check` mất nguồn | Mất moat UC→FR→AC |
| P4 | Đổi công cụ (local→Outline, OP↔Lark) không có hợp đồng migrate | Profile đổi suông = mất ID / trùng việc |
| P5 | “Minipower điều phối agent” dễ hiểu thành spawn/handoff autonomous | Trái ADR-022 QĐ-1 / §0 AGENTS.md |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **Không** agent runtime, **không** agent-tự-bàn-giao-agent (ADR-022 QĐ-1, ADR-009 ranh giới đã kế thừa) |
| C2 | Wrap MCP, không tự viết SDK (ADR-014 §5.2) |
| C3 | Tên module một-từ; **chưa có skill thật thì chưa tạo folder** (ADR-022 QĐ-2/QĐ-7) |
| C4 | Cứng = máy kiểm được (file/ID/schema); hỏi discovery không thành hook chặn (ADR-020 QĐ-3) |
| C5 | Fan-out / QC đối kháng / vòng retry = **client harness** — Minipower không làm lại cơ chế |
| C6 | Obsidian **treo** — không có `docs_provider=obsidian` trong đợt này |

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Giữ `sdlc` router-gộp, chỉ thêm MCP vào skill phase | Ít đụng folder | Không giải P1; context vẫn béo | ❌ |
| O2 | Orchestrator supervisor tự gọi chuỗi Discovery→Analyst→… | “Điều phối” đúng nghĩa runtime | Trái C1; Control Plane trá hình | ❌ |
| O3 | **Dispatcher + pack nghề + pack kênh + profile v3 + SQLite index** | Atomic; SSOT một nhà; trace còn query được | Đợt tách folder; migration phải viết | ✅ chọn |

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Minipower = dispatcher.** Phân loại intent → gợi ý / mở **đúng một pack** (atomic). Người hoặc harness client bật phiên agent. **Không** spawn chuỗi, **không** pack A tự bàn giao pack B | Handoff giữa nghề = **ID ổn định** + contracts, như H1–H6 |
| **QĐ-2** | **Đơn vị = agent pack** (một nghề hoặc một mặt kênh). Mỗi pack **tự chứa** skill + rules + hook + review **trong phạm vi pack** — không mượn `doc-review`/`hooks` của `sdlc`. Ba *loại* pack vẫn tách: nghề · kênh · dispatcher. **Không** có “kernel template 19 DOC dùng chung mọi nghề” | Anatomy §5.0. QĐ-13 |
| **QĐ-3** | **Không giữ `sdlc` như pack pipeline.** Đích: không còn `minipower-sdlc`. Folder `sdlc/` = kho chuyển đến khi từng agent pack đứng được. Hook/plugin đang neo path = **chi phí dọn**, không phải lý do giữ kernel sản phẩm | §5.0b. Q4 đóng cùng Q1 |
| **QĐ-4** | **Catalog nghề.** BA = `analyst/`. Thư ký/công bố/khung dự án = **`support/`** (không `scribe/`). Folder chỉ tạo khi có skill thật | §5.1 |
| **QĐ-5** | **Bốn module kênh** `tasks/` `docs/` `chat/` `vcs/` — SOP MCP + L1/L2/L3. Agent nghề **không** nhúng schema API Lark/Outline. `support` *quyết đăng gì*; kênh *gọi MCP*. Git trong `vcs/` | Q3 đã ghi. Hỗ trợ QĐ-12 |
| **QĐ-6** | **SSOT đất sét theo provider, một profile một nhà / mặt.** Body tài liệu / việc **không** nhân bản vào git khi đã chọn nền tảng | Xem §5.2 |
| **QĐ-7** | **Nháp = phiên chat.** Ghi L3 **chỉ khi người yêu cầu rõ**, sau preview. **Nhiều món một lệnh:** một bảng L2 (mỗi dòng = một artifact, mặc định chọn), người **bỏ chọn** món chưa public, rồi **một lần** đồng ý — không hỏi nhỏ giọt, không “đồng ý cả lô không nhìn dòng” | Q6 đóng: cách A + bỏ chọn từng dòng |
| **QĐ-8** | **`tasks_provider=none`:** việc sống markdown/SQLite; **file track riêng** — cấm board trong SRS | §5.3 |
| **QĐ-9** | **Trace UC→FR→AC→Test(+CMP) vẫn moat.** SQLite = projection, không chứa body | §5.4 |
| **QĐ-10** | **Đổi provider = migrate xong mới ghi L3 nhà mới** | Playbook đợt 1: `local`↔`outline` |
| **QĐ-11** | **Atomic load.** Mỗi phiên: contracts tối thiểu + **một** agent pack (kèm rules/hook/review của pack) *hoặc* một lá kênh. **Ngoại lệ SOP:** pack nghề được `PACK.md` khai `mcp: [docs\|tasks\|…]` thì **Read SKILL lá kênh** của đúng mặt đó rồi gọi MCP — không nạp rules/hook nghề của pack kênh | Không nạp catalog toàn công ty. §5.1d |
| **QĐ-12** | **Lark / OpenProject / Slack / GitLab / Outline = provider**, không phải module nghề. ADR-017 QĐ-3 không chặn Lark *làm provider* | Cấm coi Lark là SSOT nội dung FR |
| **QĐ-13** | **Review theo nghề, trong pack.** `minipower-backend-review-dotnet` (đã có) · `minipower-analyst-review` · `minipower-architecture-review` · `minipower-frontend-review` (khi có FE). Không một skill QC 5 chiều cho mọi DOC | Harness fan-out vẫn dùng được; *nội dung tiêu chí* thuộc pack |
| **QĐ-14** | **Init = skill trên `router/` + CLI.** Skill `minipower-router-init`: hỏi trọn gói (gồm `project_mode` + 4 provider). CLI `minipower init` dựng cây + ghi `profile.json` (thiếu mode → FAIL). Support **không** init | Chưa có CLI: skill vẫn hỏi + ghi JSON; `mkdir` là nợ ADR-031 |
| **QĐ-15** | Support **không soạn lại** nội dung nghề. Có **rà soát theo tiêu chuẩn** (thiếu ID, thiếu DOC theo mode, chỗ lưu sai) rồi **nhắc** owner pack | Không tự sửa FR/SAD |
| **QĐ-16** | **Báo giá trước ký = `presales/`.** PM không làm tờ giá bán hàng. Không skill báo giá trên mọi agent rồi cộng | |
| **QĐ-17** | **`qa/`** (test + autotest). **DOC-17 = `ops/`.** **CR:** analyst · PM · support (registry baseline) | |
| **QĐ-18** | **Luồng presale — ba agent, không gộp khảo sát vào presales.** (1) **`discovery/` khảo sát** → output khảo sát. (2) **`architecture/` dựng giải pháp tổng thể mức bán** (module/phương án, không SAD đầy đủ). (3) **`presales/` estimate + quotation** từ hai input đó. Discovery **không** là skill lá trong `presales/` — analyst sau ký vẫn dùng cùng bản khảo sát; gộp thì SSOT khảo sát nằm trong pack “bán hàng” | Khớp ADR-030: presales *dùng* discovery, không *sở hữu* |
| **QĐ-19** | **Mỗi agent khai I/O + evidence trên `PACK.md`.** Thiếu input tối thiểu → hỏi một lượt / TBD, không bịa, không tự làm việc của agent trước. Backend/frontend/qa **không** tự viết BRD/ADR/plan | §5.1e · catalog skill §5.1f |
| **QĐ-20** | **Cá nhân hoá ≠ cấu hình dự án.** `user_name` / xưng hô / vai *của người đang ngồi máy này* **không** nằm file commit chung. Mỗi phiên **bắt buộc** kiểm tra identity local; thiếu hoặc lệch người (OS user khác) → hỏi khai báo, **cấm** gọi tên từ `profile.json` trên git | §5.2a. Tránh user A commit “Hoàng” rồi user B bị gọi Hoàng |

### §5.0 Agent pack độc lập — trả lời “vì sao không thiết kế vậy?”

**Có, và đây mới là đích.** Bản §5.0 trước lẫn hai việc: (1) không xoá được folder `sdlc/` một commit vì plugin/CI neo path; (2) ngầm giữ “kernel template + hook dùng chung”. **(2) sai định hướng.** `backend/` đã đúng hình agent độc lập (skill lá Jarvis + `review-dotnet` + convention/architecture). Các nghề khác phải cùng hình đó — không kéo về một `templates/` 19 DOC + một `doc-review` cho cả công ty.

**Một agent pack chứa (phạm vi pack, atomic):**

```text
{agent}/                          ví dụ analyst/ · backend/ · support/
├── PACK.md                       consumes / produces / mcp mặt nào được đụng
├── README.md                     cho người
├── skills/                       lá-rời: viết · phân tích · review · (component)
├── rules/                        guardrail markdown — chỉ luật nghề này
├── hooks/                        máy kiểm artifact CỦA pack (ID FR, ArchUnit, …)
└── templates/                    mẫu CỦA pack (BA ≠ SAD ≠ báo cáo PM)
```

Phiên làm việc: dispatcher mở **đúng một** pack → nạp skill/rules/hook của pack đó.

**Backend / frontend** — lá hiện có / khi có skill; không liệt kê hết ở đây.

**Mọi agent còn lại — đủ skill · rule · hook · script · DOC:** §5.0c (khớp `phase_by_doc` trong `rules.json`).

### §5.0c Bộ đồ nghề từng agent (trừ backend/frontend)

Quy ước path: `{pack}/skills/` · `{pack}/rules/` · `{pack}/hooks/` · `{pack}/scripts/` · template DOC trong `{pack}/templates/`. Hook chỉ việc **máy FAIL được**. Script = Node thuần, không SDK MCP.

#### `router/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-router` (cửa intent→pack) · `minipower-router-init` |
| **Rule** | `rules/identity.md` (QĐ-20) · `rules/dispatch.md` (một pack/phiên, không spawn) · `rules/l3.md` (không L3 hộ nghề) |
| **Hook** | `profile-guard` — schema `profile.json` dự án + **mỗi phiên** identity `profile.user.json` / `os_username` |
| **Script** | CLI `minipower init` / `init --check` (ADR-031) · copy `trace.sql` → `memory/trace.db` lúc init |
| **DOC** | Không sở hữu DOC-01…19. Sở hữu: `profile.json` (dự án), skeleton khung, `trace.sql` |

#### `discovery/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-discovery-ingest` · `minipower-discovery-survey` · `minipower-discovery-review` |
| **Rule** | `rules/no-invent-source.md` · `rules/stop-at-survey.md` (không FR/AC/giá) |
| **Hook** | `survey-id-guard` — output có ID `SUR-*` hoặc DOC-01/02/03; FAIL trùng ID |
| **Script** | (tuỳ) chunker ingest — không bắt buộc đợt 1 |
| **DOC** | **DOC-01** Vision/business case · **DOC-02** Stakeholder · **DOC-03** BRD/scope |

#### `analyst/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-analyst-uc` · `-fr` · `-br` · `-ac` · `-srs` (lắp DOC-06) · `-nfr` · `-prototype` (DOC-19) · `-cr` (nội dung đổi yêu cầu) · `-review` |
| **Rule** | `rules/id-trace.md` (`{MOD}-UC/FR/BR/AC/NFR-*`) · `rules/ac-requires-fr.md` · `rules/no-code.md` |
| **Hook** | `fr-ac-link` — WARN/FAIL AC không trỏ FR (cùng mức `trace:check`) |
| **Script** | — |
| **DOC** | **DOC-04** Business rules · **DOC-05** Use cases · **DOC-06** SRS · **DOC-07** AC · **DOC-13** NFR · **DOC-19** Prototype/màn hình |

#### `architecture/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-architecture-solution-lite` (presale) · `-sad` · `-adr` · `-integration` · `-data` · `-api` · `-review` |
| **Rule** | `rules/human-sad.md` (không convention .NET) · `rules/lite-not-full-sad.md` · `rules/adr-format.md` |
| **Hook** | `adr-header-guard` — ADR đích đủ trường (máy đọc được header) |
| **Script** | — |
| **DOC** | **SOL-*** (template pack, không DOC-NN) · **DOC-08** SAD · **DOC-09** ADR · **DOC-10** Integration · **DOC-11** Data model · **DOC-12** API spec |

#### `presales/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-presales-estimation-ulnl` · `minipower-presales-quotation` |
| **Rule** | `rules/no-survey.md` · `rules/no-design.md` · `rules/countable-only.md` (MH có nguồn) |
| **Hook** | `estimate-schema-guard` — JSON estimate đúng schema (ADR-030) |
| **Script** | `scripts/estimate-validate.js` · `scripts/quotation-calc.js` (MH→MD→tiền, buffer; **không** LLM cộng tiền) |
| **DOC** | Không DOC-14 (họ WBS khác). Artifact: `estimate-vX.Y.json` + tờ giá (template pack) |

#### `pm/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-pm-plan` · `-progress` · `-risk` · `-cr-track` |
| **Rule** | `rules/no-quotation.md` · `rules/no-edit-fr.md` · `rules/tasks-file-separate.md` (QĐ-8) |
| **Hook** | — (board ở provider; `tasks=none` thì file `memory/tasks/T-*.md` tồn tại — check path) |
| **Script** | — |
| **DOC** | **DOC-14** WBS/estimate (Story Point — không ULNL) · **DOC-15** Project plan · **DOC-18** CR register (cột ticket/tiến độ; nội dung yêu cầu = analyst) |

#### `support/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-support-registry` · `-minutes` · `-baseline` · `-publish` |
| **Rule** | `rules/no-rewrite.md` · `rules/remind-not-fix.md` · `rules/publish-via-channel.md` (§5.1d) · `rules/no-init.md` |
| **Hook** | `registry-mode-advisory` — thiếu DOC theo `project_mode` → **cảnh báo** (không FAIL cứng; người BYPASS bằng lời, khớp ADR-020 QĐ-11) |
| **Script** | `scripts/registry-scan.js` (đọc SQLite `artifact` vs bảng mode) |
| **DOC** | Không sở hữu DOC-01…19. Sở hữu: mục lục registry, biên bản họp (template pack), bản baseline (danh sách ID đóng băng) |

#### `qa/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-qa-strategy` · `-scenario` · `-testcase` · `-suite` · `-autotest` · `-report` · `-review` |
| **Rule** | `rules/test-traces-ac.md` · `rules/no-fake-pass.md` |
| **Hook** | `ac-test-link` — WARN FR/AC thiếu TEST (khớp `trace:check`) |
| **Script** | runner autotest **ở repo code** (qa skill chỉ *gọi/đọc* kết quả, không nhét framework test vào pack markdown) |
| **DOC** | **DOC-16** Test strategy · artifact `{MOD}-TEST-*` · test report (template pack) |

#### `ops/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-ops-metrics` *(đã có)* · `minipower-ops-deploy` · `minipower-ops-incident` |
| **Rule** | `rules/no-fr.md` · `rules/runbook-evidence.md` |
| **Hook** | — (metrics schema nếu có, giữ test pack hiện tại) |
| **Script** | — (thu thập Grafana = MCP/runtime ngoài) |
| **DOC** | **DOC-17** Deployment guide · runbook/incident (template pack) |

#### Kênh `tasks/` · `docs/` · `chat/` · `vcs/`

| Loại | Danh sách |
|------|-----------|
| **Skill** | `minipower-tasks-openproject` · `minipower-tasks-lark` · `minipower-docs-outline` · `minipower-chat-slack` · `minipower-chat-lark` · `minipower-vcs-gitlab` |
| **Rule** | `rules/l1-l2-l3.md` · `rules/one-face.md` · `rules/profile-mcp.md` |
| **Hook** | `face-mismatch` — L3 lệch `docs_provider`/`tasks_provider`/… → FAIL |
| **Script** | — (wrap MCP, không SDK) |
| **DOC** | Không |

**CI chung (không thuộc một nghề):** `trace:check` đọc SQLite — FR↔AC↔TEST; chạy trên dự án đích / hook router, không nhét vào analyst-only.

Kênh không nằm bảng tóm tắt nghề — chỉ §5.0c khối trên + §5.1b.

**`support` vs kênh:** §5.1d.

**Chỉ những thứ *liên-agent* mới ở ngoài pack:**

| Ở ngoài pack | Vì sao không nhét vào analyst hay backend |
|--------------|-------------------------------------------|
| `contracts/` | ID + handoff — ngôn ngữ chung; mỗi pack *tuân*, không *sở hữu một mình* |
| `router/` (`minipower-router`) | Gợi ý pack + hỏi/ghi `project_mode` lúc init (cùng CLI). Không template nghề |
| `memory/profile.json` + `trace.db` | Cấu hình dự án + mục lục; mọi pack đọc, không pack nào là SSOT body |
| Hook `profile-guard` (mỏng) | Schema profile v3 — không phải luật BA |

`trace:check` CI = đọc SQLite (hợp đồng QĐ-9), **không** phải skill review BA.

### §5.0d Skill/hook `sdlc/` hiện có — nhà mới (không mở QĐ mới)

Ba gate mềm + fan-out **không** thành pack nghề. Map khi dọn path:

| Hiện (`sdlc/skills/` · hook) | Đích | Ghi chú |
|------------------------------|------|---------|
| Router `minipower-sdlc` | `router/` | Đổi tên đăng ký khi bước 5 §7 xong |
| `deliberation` · `readiness-gate` | `router/` (lá mỏng) | Verdict người; máy không FAIL. Không nhét vào analyst |
| `doc-review` | **xoá identity**; tiêu chí → `*-review` từng pack | QĐ-13 |
| `fan-out` | harness client; playbook ngắn trong `contracts/` nếu cần chữ | Không skill spawn |
| `as-built` | không pack mới — skill cạnh intel (`architecture` hoặc `backend` khi đụng code) | ADR-020 QĐ-6 |
| 6 phase (`discovery`…`handover`) | tan vào pack nghề §5.0c | Không giữ tên phase làm pack |
| `prereq-gate` · `baseline-guard` · `token-guard` · `auto-routing` · `gen`/`rules.json` | **ở lại `sdlc/hooks/` đến Đợt E**; đích: `router/hooks/` + bảng DOC×mode trong `contracts/` (support `registry-scan` đọc) | Không nhân bản `rules.json` mỗi pack |
| `profile-guard` | `router/hooks/` (Đợt A có thể vá tại chỗ `sdlc/` rồi chuyển) | QĐ-14 · QĐ-20 |

**H0** (discovery → architecture lite → presales): bổ sung `contracts/handoff.md` khi tách pack — không đổi H1–H6 sau ký.

### §5.0b Folder `sdlc/` — chỉ là chi phí dọn path

Không xoá một commit vì máy đang neo: plugin `${CLAUDE_PLUGIN_ROOT}` = `sdlc/`, `hooks/bin`, `rules.json` gen, skeleton init, 11 skill chưa copy. Đó là **nợ di trú**, không phải kiến trúc đích. Đích không còn tên pack SDLC; từng khối đi vào đúng agent pack (§5.0) hoặc `router/` / `contracts/`.

[ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) trực giao.

### §5.1 Catalog nghề (role)

| Module (folder) | Việc | Input | Output |
|-----------------|------|-------|--------|
| `discovery/` | Khảo sát | Biên bản, painpoint, tài liệu nguồn | Gói khảo sát — **§5.1e** (presales + analyst cùng đọc, không soạn hai bản) |
| `analyst/` | Phân tích + viết BA; **thu thập CR với khách** (đổi FR/AC) | Khảo sát, biên bản, CR từ khách | UC/FR/BR/AC + review BA |
| `architecture/` | SA: kiến trúc **chức năng / module cho người đọc**; skill **giải pháp mức bán** (trước ký) + SAD đầy đủ (sau ký) | Artifact discovery (nhẹ) hoặc BA (đủ) | **SOL-*** / bản module mức bán · SAD/ADR tổng quan — **không** thay architecture-dotnet |
| `pm/` | Kế hoạch, tiến độ, rủi ro; **ghi nhận CR thành việc + theo dõi** | FR must-have (H3), CR đã có nội dung BA | Kế hoạch / báo cáo / ticket CR — **không** báo giá trước ký |
| `presales/` | Ước lượng + **báo giá trước ký** | **Khảo sát discovery + giải pháp mức bán architecture** | `estimate` + quotation. Không sở hữu survey |
| `support/` | Registry · họp/note · **rà soát tiêu chuẩn + nhắc owner** · chỉ đạo publish · baseline mục lục | Artifact nghề đã có ID | Mục lục, nhắc thiếu, URI — **không** soạn lại, **không** init |
| `qa/` | Test case / suite / scenario / report + autotest | AC (+ kế hoạch test nếu có) | `{MOD}-TEST-*` + report + evidence chạy |
| `backend/` | *(đã có)* code .NET + review; skill **architecture-dotnet** = luật stack cho AI vibe code | BRD/FR/AC + SAD/ADR + plan slice — **§5.1e** | Source + CMP + evidence (PR) |
| `frontend/` | Code UI + review — **khi có skill thật** | cùng họ input backend | Source + evidence |
| `ops/` | **DOC-17**, deploy, metrics, sự cố | Build + H6 | Hướng dẫn triển khai + vận hành |
| `toolbox/` | *(đã có)* làm ra minipower | — | Skill/module |

Init khung dự án + `project_mode`: **không** thuộc support — §5.1c #2 / QĐ-14.

Không gộp `discovery/` vào `analyst/` — §5.1c #6.

Không còn playbook `doc-review` dùng chung. `fan-out` = harness. `as-built` đi với intel/code.

### §5.1b Catalog kênh (bốn module)

| Module | Mặt profile | Skill lá (khi có MCP/skill thật) | Khi provider = none / local |
|--------|-------------|----------------------------------|------------------------------|
| `tasks/` | `tasks_provider` | `minipower-tasks-openproject` · `minipower-tasks-lark` | Không lá MCP; `memory/tasks/` (§5.3) |
| `docs/` | `docs_provider` | `minipower-docs-outline` | Không lá MCP; folder `docs/` git |
| `chat/` | `chat_provider` | `minipower-chat-slack` · `minipower-chat-lark` | Không lá; chỉ soạn trong phiên |
| `vcs/` | `code_provider` | `minipower-vcs-gitlab` (MR + commit/push) | Đợt này không có `none` |

Cùng sản phẩm Lark trên hai mặt = **hai skill**, atomic load chỉ một lá / phiên.

### §5.1c Phản biện catalog — chốt 2026-09-26

| # | Vấn đề | Chốt |
|---|--------|------|
| 1 | Trộn nghề + kênh | Đã gỡ. Giữ §5.1 / §5.1b |
| 2 | Init | **QĐ-14.** Skill **`minipower-router-init`** hỏi `project_mode` + provider. CLI dựng cây. Support không init |
| 3 | Support soạn lại | **Không.** Rà soát tiêu chuẩn + **nhắc** owner. Không tự sửa FR/SAD |
| 4 | Presale: ai khảo sát, ai dựng giải pháp? | **QĐ-18.** Discovery khảo sát. Architecture = giải pháp mức bán. Presales = estimate + tờ giá. Discovery **không** nhét vào pack presales |
| 5 | `architecture/` vs architecture-dotnet | **Không gộp.** SA = người đọc. architecture-dotnet = luật stack cho AI |
| 6 | Gộp discovery + analyst? Skill discovery trong presale? | **Không / không.** Một output khảo sát, hai consumer |
| 7 | QC, DOC-17, CR/baseline | `qa/` · DOC-17=`ops/` · CR=analyst+PM+support registry |
| 8 | frontend chưa skill | Không tạo folder trống |
| 9 | Support gọi MCP thế nào | **§5.1d** — ví dụ |
| 10 | toolbox | Không phải agent dự án khách |

### §5.1d Ví dụ: support công bố mà không nuốt MCP

**Tình huống:** Registry ghi `ORD-FR-012` đủ ID, analyst đã soạn xong trong chat. Người: *“Công bố FR này lên Outline.”*

**Sai (nuốt MCP):** `support/SKILL.md` chứa `folder_token`, schema `docx_builtin_import`, tự gọi MCP. Lần sau đổi Outline→local phải sửa Support. Support = agent Lark/Outline trá hình.

**Sai (hai phiên, người làm router):** Support chỉ trả: *“A mở skill `minipower-docs-outline` giúp em.”* Người phải mở chat mới, dán lại ID — ma sát.

**Đúng (một phiên, hai file SOP):**

1. Pack `support` đang load. `PACK.md` khai `mcp: [docs]` — *được đụng mặt docs*, không copy schema.
2. Support soạn bảng L2: `| ORD-FR-012 | Outline | title=… | body = bản nháp phiên / URI local |`.
3. Người: *“Đồng ý.”*
4. Agent **Read** `docs/skills/minipower-docs-outline/SKILL.md` (mục publish một trang) rồi gọi MCP đúng tool kênh mô tả. Lỗi field MCP → sửa skill **kênh**, không sửa support.
5. Support ghi registry: `ORD-FR-012 → https://outline…/doc/…` + hàng `artifact.provider_uri` trên SQLite.

Cùng kiểu: họp xong cần nhắn Slack → Read `minipower-chat-slack`, không nhét `chat_id` vào luật thư ký.

### §5.1e Input / output / evidence — mỗi agent một hợp đồng

**Luật:** thiếu input tối thiểu → liệt kê một lượt, ghi TBD hoặc dừng; **không** làm việc của agent trước. Output + evidence ghi vào SQLite `artifact`/`link` (và registry nếu support).

**Discovery — output (không phải FR):**

| Thành phần | Ý nghĩa |
|------------|---------|
| Pain / mục tiêu / bên liên quan | Vì sao làm, ai đau |
| In/out scope + assumption | Ranh + giả định (chưa chốt FR) |
| Danh sách phân hệ / module sơ bộ | Đủ để SA vẽ mức bán và ULNL đếm chức năng |
| Nguồn (biên bản, file khách) | Trích được, không bịa |
| ID gợi ý: `SUR-*` hoặc DOC-01/02/03 trong *template của pack discovery* | Một bản — presales và analyst **cùng đọc** |

**Không** đưa skill khảo sát vào `presales/`: sau khi ký, analyst vẫn cần gói này; nếu nằm trong pack bán hàng thì BA phải mở presales để đọc khảo sát (sai nhà).

**Presale (trước ký) — ba bước, ba agent:**

```text
discovery     →  gói khảo sát
architecture  →  giải pháp mức bán (SOL-* / cây module + 2–3 phương án)  [không SAD đầy đủ]
presales      →  estimate (MH) + quotation (tiền)     [không khảo sát lại, không thiết kế lại]
```

**Sau ký — implementers không tự viết BRD/ADR/plan:**

| Agent | Input tối thiểu (phải có trước khi làm) | Output bàn giao | Evidence |
|-------|------------------------------------------|-----------------|----------|
| `analyst/` | Gói khảo sát discovery | BRD slice, `{MOD}-UC/FR/BR/AC-*` | ID trên SQLite; bản trên docs provider |
| `architecture/` | FR/AC must-have của module (H2) | SAD/ADR/API slice (người đọc) | `ADR-*`, `DOC-08/11/12` hoặc URI |
| `pm/` | FR must-have (H3) | Kế hoạch / WBS / ticket | ID task trên tasks provider |
| `backend/` | **BRD/FR+AC** + **SAD/ADR/API** + **plan slice** (mode `mvp` có thể hạ plan) | Code + `{MOD}-CMP-*` | MR/PR GitLab, pipeline xanh |
| `frontend/` | cùng họ + UC/màn | Code UI | MR/PR |
| `qa/` | AC (+ code hoặc API đã có nếu autotest) | Test case/suite/report | `{MOD}-TEST-*`, log chạy autotest |
| `ops/` | Build + nhu cầu deploy | DOC-17, runbook | URI + artifact build |
| `support/` | Các ID nghề đã có | Nhắc thiếu theo `project_mode`; mục lục baseline | Registry + URI publish |

Chuỗi “BRD → ADR → plan → code” là **handoff giữa agent**, không phải backend tự lần lượt viết cả bốn.

**Danh sách skill + logic implement:** §5.1f.

### §5.1f Catalog skill — logic bắt buộc khi implement

**Mọi skill (trừ khi ghi khác):**

1. Chạy identity §5.2a *trước* xưng hô.
2. Đọc `PACK.md` `consumes` — thiếu input tối thiểu → hỏi **một lượt** hoặc TBD; **không bịa**; **không làm việc agent trước**.
3. Nháp = chat (L1/L2). Ghi hệ ngoài = L3 sau preview + người đồng ý (QĐ-7).
4. Output phải có **ID** + **evidence** (bảng §5.1e). Ghi `artifact`/`link` SQLite khi có `trace.db`.
5. Skill **review** không ghi L3 (trừ khi người bảo sửa); chỉ báo cáo.

Ký hiệu: **In** = bắt buộc trước khi chạy · **Cấm** = không được làm dù “tiện”.

#### Router — `minipower-router-*`

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-router-init` | “init project”, chưa có `profile.json` đủ mode | — | Hỏi mode + 4 provider (+ trỏ CLI mkdir); **không** ghi `user_name` vào file git | Tự điền mode; gọi tên từ file git |
| `minipower-router` (cửa, `SKILL.md` pack) | Mọi intent chưa rõ pack | Identity + project profile | Tên **một** pack + input còn thiếu | Spawn pack khác; L3 MCP “cho xong” |

#### Discovery

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-discovery-ingest` | Tài liệu nguồn lớn (ADR-016) | File/URL nguồn | Chunk/tóm tắt có trích | Bịa nội dung nguồn |
| `minipower-discovery-survey` | Khảo sát pain/scope | Biên bản, ingest | Gói khảo sát §5.1e (`SUR-*` / DOC-01..03 pack) | Viết FR/AC; báo giá |
| `minipower-discovery-review` | Soát gói khảo sát | Gói khảo sát | Finding (thiếu nguồn, scope mơ) | Sửa lén thành FR |

#### Analyst

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-analyst-uc` | Use case | Gói khảo sát | `{MOD}-UC-*` + **DOC-05** | Code; SAD |
| `minipower-analyst-fr` | Yêu cầu chức năng | UC/khảo sát | `{MOD}-FR-*` | Estimate tiền |
| `minipower-analyst-br` | Business rule | FR/khảo sát | `{MOD}-BR-*` + **DOC-04** | |
| `minipower-analyst-ac` | Acceptance | FR | `{MOD}-AC-*` + **DOC-07** | AC không trỏ FR |
| `minipower-analyst-srs` | Lắp SRS | UC/FR/BR/AC | **DOC-06** | |
| `minipower-analyst-nfr` | Phi chức năng | Khảo sát/FR | `{MOD}-NFR-*` + **DOC-13** | |
| `minipower-analyst-prototype` | Màn hình/luồng | UC | **DOC-19** | HTML wireframe (đã chuyển FE — ADR-017 QĐ-4) |
| `minipower-analyst-cr` | Đổi yêu cầu với khách | FR hiện có + ý khách | Bản FR/AC nháp + mô tả CR | Tự tạo ticket PM; tự baseline |
| `minipower-analyst-review` | QC BA | Artifact BA | Báo cáo | Publish Outline |

#### Architecture (SA — người đọc)

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-architecture-solution-lite` | Presale | **Gói khảo sát** | `SOL-*` | SAD đầy đủ; MH/tiền; .NET convention |
| `minipower-architecture-sad` | SAD sau ký | FR/AC (H2) | **DOC-08** | Layer Jarvis |
| `minipower-architecture-adr` | ADR nghiệp vụ | Context + options | **DOC-09** / `ADR-*` đích | ADR repo minipower |
| `minipower-architecture-integration` | Tích hợp | SAD + FR | **DOC-10** | |
| `minipower-architecture-data` | Mô hình dữ liệu | SAD + FR | **DOC-11** | Schema DB production unilaterally |
| `minipower-architecture-api` | API slice | SAD + FR | **DOC-12** | Implement handler |
| `minipower-architecture-review` | QC SA | Artifact SA | Báo cáo | |

#### Presales

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-presales-estimation-ulnl` | Ước MH | **Khảo sát + SOL-*** | `estimate-*.json` (MH, mã loại) | Tự khảo sát; tự vẽ giải pháp; bịa MH |
| `minipower-presales-quotation` | Tờ giá | estimate đã có | Báo giá (MD, tiền, buffer) — L2 rồi L3 kênh | Gửi khách không cổng người; đơn giá bịa |

#### PM

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-pm-plan` | WBS/kế hoạch sau ký | FR must-have (H3) | Kế hoạch / DOC-14 họ WBS | ULNL/quotation presale |
| `minipower-pm-progress` | Báo cáo tiến độ | Tasks provider (hoặc `memory/tasks/`) | Báo cáo nháp | Bịa % complete |
| `minipower-pm-risk` | Rủi ro tiến độ/tiền thực thi | Plan + board | Sổ rủi ro | |
| `minipower-pm-cr-track` | CR thành việc | Mô tả CR từ analyst | Ticket trên `tasks` (L3) | Tự sửa FR |

#### Support

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-support-registry` | Mục lục thừa/thiếu | ID artifact + `project_mode` | Bảng đủ/thiếu; **nhắc owner** | Soạn FR/SAD |
| `minipower-support-minutes` | Họp | Ghi chép/thoại | Biên bản | Quyết định giả làm DEC |
| `minipower-support-baseline` | Đóng băng | Danh sách ID đã chốt | Mục lục baseline + chỉ đạo publish | Sửa nội dung nghề |
| `minipower-support-publish` | Công bố | ID + provider docs/chat | L2 bảng rồi L3 **qua SOP kênh** §5.1d | Copy schema MCP vào pack |

#### QA (`qa/` — gồm autotest)

| Skill | Khi | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-qa-strategy` | Chiến lược test | AC / scope | **DOC-16** | |
| `minipower-qa-scenario` | Kịch bản | AC | Scenario | |
| `minipower-qa-testcase` | Test case | AC/scenario | `{MOD}-TEST-*` | Case không trỏ AC |
| `minipower-qa-suite` | Gom suite | Cases | Suite | |
| `minipower-qa-autotest` | Chạy máy | Case + code/API | Log/report chạy | Pass khi không chạy |
| `minipower-qa-report` | Báo cáo | Kết quả chạy | Test report | Che fail |
| `minipower-qa-review` | QC test | Cases/report | Báo cáo | |

#### Backend / frontend / ops (lá đã có hoặc cùng logic)

| Pack | Skill | In | Out | Cấm |
|------|-------|----|-----|-----|
| `backend/` | Lá hiện có (`scaffold`, `*-dotnet`, **`minipower-backend-architecture-dotnet`**, `review-dotnet`, …) | **FR+AC + SAD/ADR/API + plan slice** (§5.1e) | Code + CMP + PR | Tự viết BRD/ADR SA/plan; báo giá |
| `frontend/` | Lá UI + `minipower-frontend-review` (khi có) | Cùng họ + UC/màn | Code UI + PR | Như backend |
| `ops/` | `minipower-ops-metrics` *(có)* · `-deploy` · `-incident` | Build + nhu cầu vận hành | **DOC-17**, metrics, postmortem | Viết FR |

#### Kênh — chỉ SOP MCP

| Skill | Mặt | In | Out | Cấm |
|-------|-----|----|-----|-----|
| `minipower-tasks-openproject` / `-lark` | tasks | Preview L2 + đồng ý | Work package / task id | Luật UC/FR |
| `minipower-docs-outline` | docs | Body + id | URI doc | |
| `minipower-chat-slack` / `-lark` | chat | Bản tin | message_id | |
| `minipower-vcs-gitlab` | code | Diff/commit msg | MR/SHA | Force push; commit hộ không hỏi |

**Thứ tự mở pack (người / router gợi ý, không tự spawn):**

```text
# Presale
discovery-survey → architecture-solution-lite → presales-estimation → presales-quotation

# Sau ký (một module)
analyst-* → architecture-sad/adr/api → pm-plan → backend|frontend → qa-* → ops
support-registry song song (nhắc), không chặn
```

### §5.2 Profile v3 — dự án (commit được) + người (local)

Thay / mở rộng `approval_source` v2. Giữ `project_mode`.

```json
{
  "version": 3,
  "project_mode": "standard",
  "docs_provider": "outline",
  "tasks_provider": "openproject",
  "chat_provider": "slack",
  "code_provider": "gitlab",
  "trace_store": "sqlite",
  "mcp": {
    "docs": "user-outline-mcp",
    "tasks": "user-op-mcp",
    "chat": "user-slack-mcp",
    "code": "user-gitlab-mcp"
  }
}
```

| Field | Enum đợt này | Luật |
|-------|----------------|------|
| `docs_provider` | `outline` \| `local` | Đúng một. `local` = folder `docs/` là SSOT body |
| `tasks_provider` | `openproject` \| `lark` \| `none` | Đúng một. `none` → §5.3 |
| `chat_provider` | `slack` \| `lark` \| `none` | Tách khỏi tasks; **được** `tasks=lark` và `chat=lark` (cùng nền, hai field) |
| `code_provider` | `gitlab` \| `local` | `local` = git trên đĩa, không L3 GitLab. `gitlab` khi đã bật MCP |
| `trace_store` | `sqlite` | Path mặc định dự án đích: `memory/trace.db` (**gitignore** — projection; khuôn `trace.sql` commit được) |

**Nâng v2 → v3 (chốt 2026-09-26, OK 1–5):** `approval_source.docs/tasks=local` → `docs_provider=local`, `tasks_provider=none`; `chat_provider=none`; `approval_source.code=local` → `code_provider=local`. `user_name` còn trong `profile.json` git: **bỏ qua khi xưng hô**, không tự xóa. Đợt A–C trên cây `sdlc/` hiện tại; ADR-032 sau.

`profile-guard`: FAIL khi hai giá trị cùng mặt, hoặc L3 gọi MCP lệch map `mcp.*`. Đổi field provider **không** tự do im lặng — phải có bước migrate (QĐ-10).

Tương thích v2: `approval_source.*` → providers; `chat_provider=none`. **`user_name` trong file git bị bỏ qua** — xem §5.2a.

### §5.2a Identity — từng người, từng máy

Hai file, hai vòng đời:

| File | Commit git? | Chứa | Ai ghi |
|------|-------------|------|--------|
| `memory/profile.json` | **Có** | `project_name`, `project_mode`, 4 provider, `mcp`, `trace_store`, `current_phase` (tuỳ) | `minipower-router-init` + CLI |
| `memory/profile.user.json` | **Không** (gitignore; skeleton chỉ `profile.user.json.example`) | `user_name`, `honorific`, `agent_pronoun`, `roles`, `minipower_experience`, `os_username` | skill init / “khai báo tôi là ai” trên **máy này** |

Tuỳ chọn cùng máy nhiều repo: `~/.minipower/user.json` — cùng schema user; project file thắng nếu có, else home.

**Mỗi phiên (router + `profile-guard`, trước khi xưng hô):**

1. Đọc `profile.json` dự án (mode/provider). Thiếu `project_mode` → hỏi init dự án (QĐ-14), không đoán.
2. Đọc `profile.user.json` (rồi `~/.minipower/user.json`).
3. **Thiếu file user** → hỏi trọn gói cá nhân hoá (tên, anh/chị, vai), ghi local; **cấm** lấy `user_name` còn sót trong `profile.json` git.
4. **Có file nhưng `os_username` ≠ user OS hiện tại** (user B ngồi máy / clone USB) → hỏi lại, ghi đè file local; không giữ tên A.
5. Chỉ sau bước 3–4 mới được xưng “anh/chị {user_name}”.

`AGENTS.md` sinh lúc init **không** nhúng tên người vào git nếu repo chia sẻ — hoặc sinh `AGENTS.local.md` gitignore. Template v2 đang nhét tên vào AGENTS.md commit được → **đổi**: persona đọc runtime từ `profile.user.json`.

### §5.3 Việc khi `tasks_provider=none`

Trên **dự án đích**:

```text
memory/tasks/
  README.md       ← quy ước; không phải board
  T-001.md        ← một việc / một file (id, title, status, due, refs)
memory/trace.db   ← index (khi đã bật sqlite)
docs/**           ← mô tả nghiệp vụ; được *trỏ* `T-001`, cấm nhúng board
```

Không dùng chung file “mô tả công việc” (WBS narrative, SRS) làm task tracker.

### §5.4 SQLite — projection, không SSOT nội dung

File khuôn (sẽ copy lúc init): `templates/trace.sql` (đích) — tạm thời sống cạnh skeleton. DB dự án đích: `memory/trace.db`. **Không** cột chứa body FR/SRS.

```sql
-- memory/trace.sql  (SQLite 3)
PRAGMA foreign_keys = ON;

-- Artifact đã biết (tài liệu, việc, MR, tin — chỉ mục, không nội dung)
CREATE TABLE artifact (
  id            TEXT PRIMARY KEY,          -- canonical: ORD-FR-012 | T-001 | DOC-06 | ADR-005
  type          TEXT NOT NULL,             -- uc | fr | br | ac | nfr | test | cmp | doc | adr
                                           -- | task | mr | message | other
  title         TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft',  -- draft | proposed | accepted | done | dropped
  provider_face TEXT,                      -- docs | tasks | chat | code | NULL (chưa gắn nền)
  provider      TEXT,                      -- outline | local | openproject | lark | slack | gitlab | none
  provider_uri  TEXT,                      -- URL hoặc path trên nền; local = relative path
  rev           TEXT,                      -- etag / version / commit SHA — phát hiện lệch sync
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX artifact_type ON artifact (type);
CREATE INDEX artifact_provider ON artifact (provider_face, provider);

-- Quan hệ trace (UC→FR, FR→AC, AC→Test, FR→CMP, task→FR, …)
CREATE TABLE link (
  from_id  TEXT NOT NULL REFERENCES artifact(id) ON DELETE CASCADE,
  to_id    TEXT NOT NULL REFERENCES artifact(id) ON DELETE CASCADE,
  rel      TEXT NOT NULL,                  -- traces | satisfies | tests | implements | tracks
  PRIMARY KEY (from_id, to_id, rel)
);

CREATE INDEX link_to ON link (to_id);

-- Bóng profile.json — một hàng / một mặt; UNIQUE(face) = đúng một provider
CREATE TABLE face_binding (
  face       TEXT PRIMARY KEY,             -- docs | tasks | chat | code
  provider   TEXT NOT NULL,
  mcp_server TEXT                          -- tên server MCP; NULL khi local/none
);

-- Lịch sử đổi provider; ghi L3 nhà mới chỉ khi status = done
CREATE TABLE migration (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  face          TEXT NOT NULL,             -- docs | tasks | chat | code
  from_provider TEXT NOT NULL,
  to_provider   TEXT NOT NULL,
  status        TEXT NOT NULL,             -- pending | running | done | aborted
  started_at    TEXT,
  finished_at   TEXT,
  note          TEXT
);

CREATE INDEX migration_face_status ON migration (face, status);
```

| Bảng | Việc | Không làm |
|------|------|-----------|
| `artifact` | Tra ID, chỗ lưu, trạng thái sync | Lưu đoạn SRS |
| `link` | `trace:check` (thiếu AC, ID gãy) | Suy diễn nghiệp vụ |
| `face_binding` | Khớp profile; chặn MCP lệch mặt | Thay `profile.json` (JSON vẫn SSOT cấu hình; bảng là bóng) |
| `migration` | Cổng QĐ-10 | Tự migrate |

`tasks_provider=none`: mỗi file `memory/tasks/T-NNN.md` = một hàng `artifact` (`type=task`, `provider=none`). Không cần bảng `task_local` riêng.

`trace:check`: đọc `link`; thiếu `rel=satisfies` từ FR → AC = WARN (giữ mức ADR-020 QĐ-6). Khi `docs_provider=local` có thể *đổ* index từ markdown → DB; khi `outline` lấy URI từ MCP rồi đối chiếu ID trong `artifact`.

### §5.5 L1 / L2 / L3 (giữ, áp mọi kênh)

| Mức | Hành vi |
|-----|---------|
| L1 | Đọc MCP / soạn nháp trong chat — tự do |
| L2 | Bản xem trước đủ metadata — chờ người |
| L3 | `create`/`update`/`message`/`publish` — bắt buộc người đồng ý sau preview |

### §5.6 Cấu trúc folder — repo minipower (mục tiêu)

Không tạo folder trống trong đợt Confirm. Cây dưới là **đích sau khi tách**; đợt thi hành từng pack có skill.

Cây **logic** (tên pack). Path vật lý `src/` vs gốc = [ADR-032](../done/ADR-032-2026-09-03-gop-module-vao-thu-muc-modules.md) — **không** ghép; khi ADR-032 chốt thì đổi prefix path, không đổi tên pack.

```text
minipower/                     (hoặc src/ khi ADR-032)
├── contracts/                 ← ngôn ngữ liên-agent (ID, handoff, H0)
├── router/                    ← dispatcher + profile-guard + plugin/install + CLI neo
├── discovery/ · analyst/ · architecture/ · presales/ · pm/ · support/ · qa/
├── backend/ · ops/ · toolbox/   (đã có)
├── frontend/                  ← chỉ khi có skill thật
├── tasks/ · docs/ · chat/ · vcs/
├── ADRs/ · staging/ · evals/
└── sdlc/                      ← kho chuyển đến Đợt E
```

Ví dụ pack nghề (khi tách):

```text
analyst/
  PACK.md · README.md
  skills/minipower-analyst-fr/ · minipower-analyst-review/ · …
  rules/
  hooks/                       ← chỉ artifact BA
  templates/                   ← mẫu BA, không ôm SAD
support/
  skills/…-registry/ · …-minutes/ · …-baseline/ · …-publish/
  (không có *-init — QĐ-14)
```

Mỗi module kênh (khi có skill):

```text
tasks/
  PACK.md
  skills/minipower-tasks-openproject/
  skills/minipower-tasks-lark/
docs/
  skills/minipower-docs-outline/
chat/
  skills/minipower-chat-slack/
  skills/minipower-chat-lark/
vcs/
  skills/minipower-vcs-gitlab/
```

**Thứ tự tách:** §7. `trace.sql` khuôn thuộc `router/` (copy lúc init). Support **không** nhận init.

Intel (CodeGraph): không module mới; `as-built` + MCP `code-intel` (ADR-020 QĐ-6).

### §5.7 Cấu trúc folder — dự án đích

```text
{project}/
├── memory/
│   ├── profile.json          ← v3 **chỉ dự án** (commit được)
│   ├── profile.user.json     ← gitignore — tên/xưng hô máy này
│   ├── profile.user.json.example
│   ├── memory.md
│   ├── trace.db              ← khi trace_store=sqlite
│   ├── tasks/                ← CHỈ khi tasks_provider=none
│   ├── migration-log.md
│   └── {phase}/ · open-questions.md · doc-debt.md
├── docs/                     ← SSOT body CHỈ khi docs_provider=local
│                             ← khi outline: archive/read-only sau migrate, hoặc không ghi mới
├── assets/ · brainstorm/
└── AGENTS.md
```

Khi `docs_provider=outline`: không giữ bản chính SRS trong `docs/`. Template nghề nằm trong pack agent, không tầng templates toàn repo.

## §6. Confirm *(đã đóng 2026-09-26)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…20? | **Có** — 2026-09-26 |
| Q2 | Tên module BA? | **`analyst/`** |
| Q3 | Bốn module kênh? | **Có** `tasks/` `docs/` `chat/` `vcs/` |
| Q4 | Agent pack độc lập + `sdlc/` chỉ nợ path? | **Có** — khớp QĐ-3 |
| Q5 | DDL bốn bảng §5.4 | **Có** — `artifact` · `link` · `face_binding` · `migration` |
| Q6 | Nhiều nháp, một lệnh “đẩy Outline”? | **A + bỏ chọn từng dòng** (ghi vào QĐ-7) |

**Q6 đã chốt:** một bảng L2 đủ món trong phiên (id, tiêu đề, đích). Mặc định chọn hết; người **bỏ chọn** món chưa public; **một lần** “đồng ý” → MCP từng dòng còn chọn. Không hỏi nhỏ giọt.

Thi hành: **được** sửa hook/skeleton hiện có trong `sdlc/` (Đợt A–C). **Không** tạo folder pack nghề/kênh trống; folder mới chỉ khi Đợt D+ có skill thật trong cùng thay đổi. `rules.json` chỉ đụng khi Đợt E chuyển bảng DOC×mode / bỏ `minipower-sdlc`.

## §7. Plan thực thi *(sau Confirm — làm từng đợt, không một commit)*

Nguyên tắc đợt: **một đợt = một thay đổi Full** (đụng baseline/skill/hook). Folder pack **chỉ** khi có skill trong cùng đợt. CLI mkdir = [ADR-031](../doing/ADR-031-2026-09-01-cli-install-init-thay-llm-thi-hanh.md) (Confirm ADR-031 vẫn mở — Đợt A–C **không** chờ CLI: vá skeleton + hook trong `sdlc/`). Presales skill = [ADR-030](../doing/ADR-030-2026-08-29-mo-module-presales-skill-uoc-luong-ulnl.md) (Confirm còn mở — Đợt D `presales/` chờ Q1 ADR-030 hoặc thi hành song song khi chủ repo bật). `src/` = ADR-032, không nhét vào đây.

| Đợt | Việc | Done khi | Phụ thuộc |
|-----|------|----------|-----------|
| **A** | Profile v3 (chỉ dự án) + `profile.user.json` gitignore + example + `profile-guard` identity mỗi phiên; bỏ đọc `user_name` git | T3, T7; schema v2 còn map được | Confirm này |
| **B** | `trace.sql` vào skeleton; `trace:check` đọc SQLite; local md → đổ `artifact`/`link` | T4; md parser cũ không regress T5 | A |
| **C** | `memory/tasks/` khi `tasks=none`; luật cấm board trong template SRS | T1 (cây) | A |
| **D1** | Lá kênh: `minipower-docs-outline` (migrate local↔outline) · `minipower-tasks-lark` · `minipower-chat-lark` · `minipower-vcs-gitlab` (SOP mỏng nếu GitLab MCP đã có) — **từng lá một đợt**, không 4 folder trống | loader thấy skill; T2 | A, MCP thật |
| **D2** | Pack nghề **theo nhu cầu dùng**, không theo alphabet: `router/` (cửa + init skill, hook chuyển dần) → `discovery/` → `analyst/` (templates DOC-04…07,13,19) → `architecture/` (lite + SAD) → `pm/` → `support/` (registry, không init) → `qa/` → `ops/` (lá deploy/incident) | mỗi pack: PACK.md consumes/produces + ≥1 skill + review nếu nghề viết DOC | QĐ-4 folder; copy từ `sdlc/` không để hai SSOT |
| **D3** | `presales/` + `quotation-calc.js` | schema estimate + test | ADR-030 Confirm |
| **E** | H0 vào `handoff.md`; bảng DOC×mode → `contracts/` (gen từ một SSOT); đổi đăng ký `minipower-sdlc` → `minipower-router`; gỡ plugin path khi `router/` đứng; xoá identity `doc-review` | `npm run gen:check`; không còn skill `minipower-sdlc` | D2 tối thiểu: router + analyst — **thi hành: [ADR-037](../done/ADR-037-2026-09-26-xoa-folder-sdlc-dot-e.md)** (Confirm 2026-09-26) |
| **F** | AGENTS.md / README / hub chữ khớp QĐ; persona runtime từ `profile.user.json` | grep “router-gộp ôm phase” hết ngoài ADR cũ | E — **gộp theo dõi ADR-037** |

Đợt A–C **được bắt đầu ngay** (sửa `sdlc/` tại chỗ). Đợt D+ = tách file. Không xoá `sdlc/` trước hết path neo (QĐ-3).

## §8. Xác minh (định nghĩa xong)

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Init `docs=local`, `tasks=none` → `memory/tasks/`, profile v3 | cây skeleton + **CLI `init --answers` unit (031)**; smoke Cursor còn | 🟡 |
| T2 | Smoke | Intent “tóm tắt task Lark” → `minipower-tasks-lark`, không nạp `analyst` | atomic trên Cursor | 🟢 2026-09-26: `none` → không MCP Lark, trỏ `memory/tasks/`, không analyst |
| T3 | Mới | `profile-guard` face lệch | | 🟢 `profile-guard.test.js` |
| T4 | Mới | `trace:check` sqlite thiếu FR→AC → WARN | | 🟢 |
| T5 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới | | 🟢 2026-09-26 (sau CLI + catalog) |
| T6 | Mới | L2 Outline 3 nháp, bỏ chọn 1 | MCP thật | 🔴 |
| T7 | Mới | `profile.user.json` user A, os_username B | | 🟢 unit |
| T8 | Regression | skill đăng ký không còn `minipower-sdlc` | | 🟢 `docs-consistency` T8 |

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Context theo pack; SSOT một nhà; bốn kênh đúng mặt; trace còn query khi body rời git; hết định vị “sdlc = mọi nghề” |
| Xấu / chi phí | Đợt tách dài; plugin/hooks neo `sdlc/` đến bước 6; Lark bị hai lá (tasks+chat); `profile-guard` v3 |
| Trung lập | `project_mode` giữ — chỉ đổi chỗ điền/publish |
| Không làm | Supervisor tự chạy; Obsidian; task board trong SRS; SQLite chứa body FR; xoá `sdlc/` trước khi role/router đứng; folder module trống |

**Nợ ngoài QĐ-1…20:** ADR-032 Confirm (Q1+Q6); nhà vật lý `as-built`; hook `face-mismatch` một chỗ `router/`. **030 Confirm mặc định + D3 unit xong. 031 Confirm + CLI unit xong.**

---

## §10. Ranh giới nhanh (để khỏi trượt lúc viết skill)

| Được | Không |
|------|--------|
| Router trả **tên pack + input còn thiếu** (hỏi một lượt) | Router tự gọi MCP L3 “cho xong” |
| Role soạn nháp trong chat | Role tự publish Outline |
| Kênh wrap MCP đúng **một** mặt | Kênh viết luật UC/FR; một skill Lark ôm cả task lẫn chat trong cùng lần load |
| `tasks=lark` + `chat=slack` | `tasks=lark` **và** `tasks=openproject` |
| Intel CodeGraph cho architecture/backend | CodeGraph thay analyst |

---

## §11. Điều chỉnh 2026-09-26 — §5.3 bị [ADR-035](../done/ADR-035-2026-09-26-memory-mot-file-thay-overview.md) QĐ-9 thay

Chữ §5.3 / một số hàng catalog vẫn mô tả cây `memory/tasks/T-NNN.md`. **Thôi hiệu lực** phần “một file markdown / một việc” khi `tasks_provider=none`. Phần còn lại của ADR-033 (profile v3 · bốn mặt · SQLite projection · L1–L3) **giữ**.

| Mục | Nội dung cũ (§5.3) | Thay bằng (ADR-035 QĐ-9) |
|---|---|---|
| SSOT việc `tasks=none` | `memory/tasks/T-NNN.md` (+ đổ sang `artifact`) | Chỉ hàng `artifact` (`type=task`, `provider=none`) trong `memory/trace.db` |
| Cây skeleton | Có `memory/tasks/` | **Không** còn folder `tasks/` |
| Nhắc việc cá nhân | (không tách) | `memory/memory.md` khối «Nhắc việc» — không phải board đội |

*Chữ lịch sử trong §5.3 / T1–T2 giữ nguyên để đọc ngữ cảnh; thi hành theo bảng trên.*

## §12. Điều chỉnh 2026-10-29 — QĐ-1 / QĐ-11 "atomic" tính theo **task**, không theo phiên ([ADR-043](../done/ADR-043-2026-10-28-router-triage-plan-nhieu-task-review-cuoi.md))

| | Trước (2026-09-25) | Sau (ADR-043) |
|---|---|---|
| Đơn vị atomic | Một phiên = một pack, một lá | Một **task** = một lá đang load; một phiên chứa **chuỗi task** người đã OK trong kế hoạch |
| "Không spawn chuỗi" | Không mở pack thứ hai trong phiên | **Không agent bàn giao agent** (ADR-022 QĐ-1 giữ nguyên); task độc lập `∥` fan-out qua harness, đích về agent chính |
| `rules/dispatch.md` | một pack / phiên, không spawn | một task một lá; việc PHỨC → `minipower-router-plan` |

*QĐ-1, QĐ-11, §5.1 giữ chữ lịch sử để đọc ngữ cảnh; thi hành theo bảng trên.*
