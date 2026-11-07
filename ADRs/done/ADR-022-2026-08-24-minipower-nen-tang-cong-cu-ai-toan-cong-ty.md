# Minipower — nền tảng công cụ AI toàn công ty · hệ tên hai tầng · module hoá

| | |
|---|---|
| **Ngày** | 2026-08-24 |
| **Trạng thái** | 🟢 **DONE — chủ repo xác nhận 2026-08-25.** Đợt §6 thi hành 8/8 bước cùng [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md), verify §5 **5/5 PASS** + 14 test canh invariant (suite 427). **Việc sau-đợt tách riêng, trao đổi sau:** `install.mjs --with` (QĐ-6) · mở rộng ánh xạ MCP tên (QĐ-9) · tích hợp OpenProject cho `sdlc` |
| **Phạm vi** | **Toàn repo** — định vị sản phẩm, hệ tên, cấu trúc module, đổi `minipower/` → `sdlc/`. ADR **chủ**: [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) áp dụng hệ tên này cho pack `jarvis` |
| **Nối tiếp** | **Giữ** [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) (ruột `sdlc/` không đổi: 3 mode, gate mềm, hook cứng) · **Giữ** [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md) (plugin `"name": "minipower"` giữ nguyên — tên plugin không buộc theo tên folder) · **Nền tảng** [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) wrap-not-build (→ QĐ-9, QĐ-12) · **Kế thừa bài học** [ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) §2–3 (parity đa kênh là bẫy; invariant phải có check) |
| **Mục đích** | Chốt định vị *"minipower = bộ công cụ AI của toàn công ty"* (Role Intelligence Layer); hệ tên hai tầng thương-hiệu/chức-năng; quy tắc phân loại module để mở rộng không đụng lõi; chuẩn bị dữ liệu cho mô hình nâng cao (Skill Registry, MCP Gateway) mà **không xây nền tảng** |
| **Ảnh hưởng** | [AGENTS.md](../../AGENTS.md) §0 định vị + danh sách pack + index `contracts/` (QĐ-10) + chữ "ai-skills"→"minipower" · [README.md](../README.md) bản đồ · `minipower/` → `sdlc/` (folder + `install/{claude,cursor,opencode}` 6 hook path + [.github/workflows/minipower-hooks.yml](../../.github/workflows/minipower-hooks.yml) 8 ref bên trong, giữ tên file + `.claude-plugin/` path) · [COORDINATION.md](../../contracts/README.md) → tách `contracts/` ×5 (QĐ-10, kèm test `#12`) · [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) (bảng tên viết theo hệ này) · ADRs cũ (**chỉ href** — QĐ-11) · [fundamentals/template-skill.md](../../src/toolbox/skills/minipower-toolbox-skill-author/SKILL.md) |

---

## §0. Quyết định

| # | Nội dung |
|---|---|
| **QĐ-1** | **Định vị: minipower = Role Intelligence Layer của Corporate AI Platform.** Nằm giữa AI client (Claude/Cursor/Codex/OpenCode) và MCP: cung cấp skill/instruction/SOP theo vai. **Sở hữu KHUÔN** (quy trình, template, kỷ luật trace, gate) — **không sở hữu ĐẤT SÉT** (business knowledge → Outline · code → GitLab/CodeGraph · task → OpenProject · runtime → Grafana). **Không phải agent runtime** — nhất quán §0 AGENTS.md, không phải nhượng bộ mới |
| **QĐ-2** | **Hệ tên hai tầng.** **`minipower`** = thương hiệu, xuất hiện đúng 3 chỗ: tên repo · tiền tố skill · tên plugin. **Tên folder module** = chức năng, một từ: `sdlc` · `backend` · `frontend` · `autotest` · `design` · `slide`… Mỗi tên một nghĩa, hết nhập nhằng "repo hay pack" |
| **QĐ-3** | **Pack lõi `minipower/` → `sdlc/`.** Nó là bộ pipeline vòng đời sản phẩm (6 phase + gate + roles + templates + hooks + skeletons) — tên phải nói việc đó. Router đăng ký với loader thành **`minipower-sdlc`** (14 ký tự). Tích hợp MCP OpenProject tương lai đặt tại đây (khớp `approval_source` ADR-020 QĐ-12) |
| **QĐ-4** | **Tiền tố toàn cục: `minipower-{module}-{capability}[-{stack}]`.** Kebab-case, ≤64 ký tự — namespace bằng **gạch nối** vì đó là thứ duy nhất mọi loader (Claude/Cursor/OpenCode/Codex/Antigravity) đều hiểu; `plugin:skill` chỉ Claude Code có. Bỏ "code-" khỏi tên module: `backend`, không phải `code-backend` — tiền tố `minipower-` đã đủ định danh, và đồng bộ với các module một-từ (`autotest`, `design`, `slide`). Gõ `minipower` trong ô search → **toàn bộ skill hiện ra**, search tiếp bằng tên module |
| **QĐ-5** | **Hai mô hình đăng ký, chọn theo "từ vựng kích hoạt".** (a) **`sdlc` = router-gộp**: loader thấy MỘT skill `minipower-sdlc`, 11 skill con là file nội bộ router dẫn — một cửa, gác một chỗ, đúng cho quy trình có thứ tự. (b) **Module kỹ thuật = lá-rời**: mỗi skill tự đứng trên menu với description sắc (Redis, JWT, multitenancy…) — agent tự kích hoạt theo ngữ cảnh. (c) Router mỏng per-module (tuỳ chọn) **sinh từ manifest** (QĐ-8), không viết tay — chống bệnh "bảng quên skill" (ADR-001 §3.3). (d) Skill module **không thêm phase** vào `rules.json` — cắm kiểu **cross-phase** qua bảng trigger router, như tiền lệ `deliberation`/`doc-review`/`fan-out` |
| **QĐ-6** | **Đơn vị cài = module.** `install.mjs` nâng cấp nhận `--with <module>` (đọc manifest QĐ-8); ai cần gì cài nấy, không cài cả bộ. Chưa nâng cấp xong thì cơ chế hiện hành (symlink/rsync) vẫn dùng — không chặn đợt đổi tên |
| **QĐ-7** | **Quy tắc phân loại việc mới — 3 câu hỏi, hỏi theo thứ tự:** (1) *Tác động lên chính tài liệu/pipeline minipower sở hữu?* → skill core trong `sdlc/` (thường cross-phase). (2) *Gắn framework/stack có vòng đời riêng, hoặc người dùng khác hẳn?* → module mới ngang hàng. (3) *Chỉ là năng lực của skill đã có?* → workflow/provider bên trong. Kèm 2 luật bất biến: **tên theo việc nó làm, không theo công cụ** (công cụ là thứ được wrap) · **chưa có skill thật thì chưa tạo thư mục** |
| **QĐ-8** | **PACK.md manifest máy-đọc-được cho mỗi module** — file `.md` chứa **một khối yaml** theo schema `contracts/pack-manifest.md` (tách từ COORDINATION §5 — QĐ-10): `pack · version · owner · roles · stage · consumes · produces · handoff · mcp`. Một artifact, **bốn consumer**: installer `--with` · bảng router sinh tự động · trace liên-pack · **hạt giống Skill Registry** của mô hình nâng cao. Đúng khuôn rules-as-data: registry tương lai *sinh từ* manifest, như bảng generated sinh từ `rules.json` |
| **QĐ-9** | **MCP bằng con trỏ tên, không bằng endpoint.** Skill chỉ viết tên trừu tượng — `tasks` · `docs` · `code` (mở rộng đúng khuôn `approval_source {docs,tasks,code}` đã có trong `rules.json`, thêm khi cần: `code-intel`, `runtime`); ánh xạ `tên → MCP server` nằm **một chỗ** trong `profile.json`/`rules.json`. MCP Gateway của mô hình nâng cao xuất hiện → **đổi một ánh xạ, không sửa một skill** |
| **QĐ-10** | **Tách `COORDINATION.md` thành `contracts/` ×5, index ở AGENTS.md.** File cũ ôm 5 loại nội dung (luật · giao thức · quy ước · cơ chế · schema) — khó đặt tên vì làm quá nhiều việc. Tách: `contracts/{trace-spine, handoff, shared-conventions, cross-repo-bridge, pack-manifest}.md` + `contracts/README.md` (nguyên tắc nền + index + việc còn lại); xoá file gốc. **Mỗi chủ đề một nhà duy nhất** — tách file, không tách SSOT. **Mỗi file tự khai trạng thái** (per-module handoff ĐÃ SỐNG từ ADR-020 QĐ-13/14 · bridge kích hoạt khi docs tách repo submodule · pack-manifest load-bearing từ bước 7) — hết cảnh cả khối đeo nhãn "draft chưa áp dụng". Index viết ở **AGENTS.md §Tham chiếu** (thay 3 chỗ đã gỡ phiên 2026-08-24); **CLAUDE.md không đụng** — nó là con trỏ `@AGENTS.md`, tự thừa hưởng. Kéo theo: sửa test `#12` đang pin `COORDINATION.md` → `contracts/handoff.md` (vòng gen/test) |
| **QĐ-11** | **ADR đã ban hành: CHỮ giữ nguyên, HREF sửa máy móc.** "minipower"/"jarvis" trong câu văn là bản ghi lịch sử — không đụng. Đường dẫn markdown trỏ file đã di chuyển là ống nước — gãy thì hàn, không tính là sửa quyết định. Ghi luật này để script dò link không đỏ oan kho lịch sử |
| **QĐ-12** | **Không xây Control Plane.** 8 capability của mô hình nâng cao (MCP Gateway · AuthZ · Audit · Governance · Approval engine · Evaluation platform · Registry service · Data Platform) là **hạ tầng công ty ngoài repo**. Repo chỉ chuẩn bị **tương thích bằng dữ liệu** (QĐ-8, QĐ-9) — đúng wrap-not-build (ADR-014 §7), đúng "co lại trước khi mở rộng", và đúng chính lời phản biện ngoài: *"chỉ thêm infrastructure khi use case thực tế yêu cầu"* |

---

## §1. Bối cảnh — hai nguồn hội tụ độc lập

Định vị QĐ-1 không phát minh trong phòng kín. Nó là giao điểm của **(a)** chuỗi quyết định nội bộ ADR-001→020 và **(b)** phản biện ngoài (mô hình Corporate AI Platform, chủ repo cho AI khác đóng vai ~20 vị trí công ty để soi). Bốn nguyên tắc trụ cột trùng nhau từng chữ:

| Phản biện ngoài kết luận | Repo đã chốt từ trước |
|---|---|
| Minipower "không sở hữu knowledge, không phải agent runtime" | §0 AGENTS.md: AI = trợ lý, người quyết cuối; ADR-020 gate mềm |
| CodeGraph = Code Intelligence plane, truy cập qua MCP | ADR-020 QĐ-6: `as-built` wrap codegraph MCP — trùng cả tên tool |
| AI đọc tự do, hành động qua approval theo thang | Di sản L1/L2/L3 (ADR-009/017) + `approval_source` trong `rules.json` |
| "Chỉ thêm infrastructure khi use case yêu cầu" | "Co lại trước khi mở rộng" — nguyên văn |

**Bốn loại context** của mô hình là bản đồ mặt tiền sản phẩm (phase là ruột của `sdlc`, context là cách trình bày ra ngoài):

| Context | Hạ tầng công ty | Phía minipower |
|---|---|---|
| 📋 Work | OpenProject | `sdlc/` (+ MCP `tasks` — QĐ-9) |
| 💻 Code | GitLab · CodeGraph | `backend/`·`frontend/` + `as-built` |
| 👔 Organization | Outline · Obsidian | `sdlc/` publish + `doc-map` tương lai (§5) |
| 📊 Runtime | Grafana/Loki/Tempo | `minipower-backend-observability/telemetry-dotnet` (đã có) |

---

## §2. Hệ tên — bảng chuẩn

| Tầng | Tên | Vai |
|---|---|---|
| Thương hiệu | `minipower` | repo · tiền tố skill · plugin ([plugin.json](../../src/router/.claude-plugin/plugin.json) `"name": "minipower"` giữ) |
| Module | `sdlc` · `backend` · `frontend` · `autotest` · `design` · `slide`… | folder ngang hàng = đơn vị cài |
| Skill | `minipower-{module}-{capability}[-{stack}]` | tên đăng ký với loader, = tên thư mục lá |

Ví dụ độ dài (ngưỡng 64):

```text
minipower-sdlc                                    14   (router core)
minipower-backend-review-dotnet                   31
minipower-backend-scaffold-dotnet                 33
minipower-backend-entityframework-dotnet          40
minipower-backend-healthcheck-dotnet-postgresql   47   (provider dài nhất)
```

### §2a. Cấu trúc repo sau đợt

```text
minipower/                                  ← REPO (thương hiệu — QĐ-2)
│
├── AGENTS.md                               luật cho agent, nạp mỗi phiên
├── CLAUDE.md                               → @AGENTS.md
├── README.md                               bản đồ toàn repo
├── contracts/                              hợp đồng liên-pack — tách ×5 (QĐ-10), mỗi file tự khai trạng thái
│   ├── README.md                           nguyên tắc nền + index + việc còn lại
│   ├── trace-spine.md                      LUẬT: ID CMP/TEST/DEPLOY, mọi artifact trace về FR/AC
│   ├── handoff.md                          GIAO THỨC: H1–H6, per-module (ĐÃ SỐNG — ADR-020)
│   ├── shared-conventions.md                    QUY ƯỚC: memory · decision-log · versioning · ownership
│   ├── cross-repo-bridge.md                CƠ CHẾ: pin docs@tag + back-ref (kích hoạt khi tách repo)
│   └── pack-manifest.md                    SCHEMA của PACK.md (load-bearing — QĐ-8)
├── ADRs/                                   quyết định định hướng + README index
├── fundamentals/                           kiến thức nền + interview/ (giữ tên — ADR-021 QĐ-8)
│
├── sdlc/                                   ┃ CORE — Role Intelligence Layer (QĐ-3)
│   ├── SKILL.md                            ┃ ★ ROUTER — đăng ký `minipower-sdlc`, cửa vào duy nhất
│   ├── PACK.md                             ┃ manifest máy-đọc (QĐ-8)
│   ├── README.md · INSTALL.md · CHANGELOG.md
│   ├── skills/                             ┃ 11 skill NỘI BỘ — loader KHÔNG thấy, router dẫn bằng Read
│   │   ├── discovery/ requirements/ architecture/      ─┐
│   │   ├── planning/ delivery/ change-control/          ┘ 6 phase
│   │   ├── deliberation/ readiness-gate/ doc-review/    ─ 3 gate mềm
│   │   ├── fan-out/  as-built/                          ─ cross-phase (as-built wrap codegraph)
│   │   └── (doc-map/ — tương lai, §4)
│   ├── agents/                             ┃ 8 guardrail markdown
│   ├── roles/                              ┃ 7 lăng kính BA·PM·SA·DEV·QC·DevOps·Support
│   ├── templates/                          ┃ DOC-01…19 + TPL-* (khuôn, không phải đất sét — QĐ-1)
│   ├── hooks/                              ┃ Node ESM — rules.json SSOT · bin/ · test/ · link-check.js
│   ├── docs-skeleton/ · project-skeleton/  ┃ khung dự án đích
│   ├── install/{claude,cursor,opencode}/   ┃ 6 hook × 3 kênh; nâng `--with` sau (QĐ-6)
│   └── .claude-plugin/                     ┃ plugin.json "name": "minipower" (giữ — ADR-011)
│
├── backend/                                ┃ MODULE .NET — cây chi tiết: ADR-021 §2a
│   ├── README.md · PACK.md
│   └── skills/                             ┃ 15 lá — loader THẤY TỪNG CÁI
│       └── minipower-backend-{scaffold|foundation|application|authentication|
│            entityframework|caching|notification|blobstoring|realtime|
│            swashbuckle|healthcheck|telemetry|observability|
│            troubleshooting|review}-dotnet/
│
├── frontend/                               ⏳ CHƯA TẠO (QĐ-7 luật 2)
└── autotest/ · design/ · slide/ …          ⏳ khi có skill thật (§4)
```

`install/` và `hooks/` hiện toàn khái niệm pipeline nên ở trong `sdlc/` là đúng; khi installer thành tầng sản phẩm thật (cài nhiều module) thì cân nhắc nâng lên root — **để lúc đó**, không làm trước.

### §2b. Cách dùng skill sau đợt

**Menu người dùng thấy** (mọi loader — gõ `minipower` là ra tất cả, QĐ-4):

```text
minipower-sdlc                            ← 1 dòng = cả pipeline (router-gộp)
minipower-backend-scaffold-dotnet         ┐
minipower-backend-caching-dotnet          │ 15 dòng, mỗi lá tự đứng
minipower-backend-review-dotnet           │ với description sắc (lá-rời)
…                                         ┘
```

**Ba luồng sử dụng:**

```text
Ⓐ PIPELINE TÀI LIỆU (router-gộp — một cửa, có gác)
   "viết SRS cho module đơn hàng"
   → hook auto-routing gợi ý phase → kích hoạt `minipower-sdlc`
   → router áp mode (mvp/standard/maintain) + tier (micro/light/full)
     + prereq theo module → Read skills/requirements/SKILL.md → làm việc
   Gate mềm (deliberation · readiness-gate · doc-review) nằm trên đường này.

Ⓑ ĐỒ NGHỀ CODE (lá-rời — vào thẳng, không thứ tự)
   "service đơn hàng cần cache Redis, invalidate khi update"
   → khớp description `minipower-backend-caching-dotnet` → nạp thẳng
   → workflows/init.md (chưa có module) hoặc add.md (thêm provider)
   Không qua router nào; 6 hook (prereq/baseline/token…) vẫn nổ độc lập.

Ⓒ CHUYỂN TIẾP DOCS → CODE (điểm nối hai mô hình)
   `minipower-sdlc` xong architecture cho một module → bảng trigger router
   chỉ đường: "DOC-08/11/12 đủ → sang `minipower-backend-scaffold-dotnet`"
   Người mở đường từng nhánh (per-module — ADR-020 QĐ-14), không agent bàn giao agent.
```

**Cài đặt — ai cần gì cài nấy (QĐ-6):**

```bash
# Core (repo dự án bất kỳ): 6 hook + skill minipower-sdlc
node sdlc/install/claude/install.mjs

# Module backend (repo code sản phẩm): hiện tại symlink/rsync từng lá như cũ;
# sau khi QĐ-6 thi hành:
node sdlc/install/claude/install.mjs --with backend
```

Repo tài liệu chỉ cần core · repo code cài core + `backend` · máy marketing mai này cài core + `design`.

---

## §3. Sẵn sàng mô hình nâng cao — tương thích bằng dữ liệu, không bằng service

| Capability nâng cao | Repo làm gì **hôm nay** |
|---|---|
| MCP Gateway/Registry | QĐ-9 con trỏ tên. Gateway đến → đổi ánh xạ. **Không xây** |
| Fine-grained AuthZ · DLP | Không gì. Tương lai xa: nhãn phân loại trên template — ghi nhận, không làm |
| AI Audit | Kỷ luật sẵn có **là** vế docs của audit: DEC + `trace:check` + doc-debt |
| Governance/Policy | Gate mềm + phân tầng micro/light/full = policy dạng văn bản có cấu trúc |
| **Approval/HITL** | **Sân nhà.** Minipower định nghĩa *quy trình* phê duyệt (thang đọc-tự-do/ghi-qua-cổng); Control Plane tương lai *cưỡng chế* nó |
| AI Evaluation | Giữ luật skill single-purpose + output bắt buộc → skill eval được. Golden test là phôi |
| **Skill Registry** | Capability duy nhất chạm thẳng repo. Lời giải = **QĐ-8**: PACK.md + frontmatter metadata (`audience`/`workflow` đã có) + CHANGELOG + tag semver (`skills-v1.3.0` tiền lệ). *"Minipower không nên chỉ là folder Markdown khổng lồ"* — đúng, và câu trả lời là manifest sinh-registry-được, không phải registry service |
| Data Platform/BI | Ngoài phạm vi repo hoàn toàn |

7/8 dòng là "giữ kỷ luật đang có". Chi phí sẵn-sàng ≈ 0 **nếu** QĐ-8/QĐ-9 đi cùng đợt refactor này; đắt nếu retrofit (bài học ADR-014 Q5).

---

## §4. Phân loại các việc tương lai đã biết (áp QĐ-7)

| Việc | Kết quả lọc |
|---|---|
| Autotest (framework QC tự xây) | Module `autotest/` — khuôn y `backend/`; trace `{MOD}-TEST-*` → `{MOD}-AC-*` |
| Design (landing page marketing) | Module `design/` — người dùng khác hẳn, không gánh trace |
| Slide (HTML slide) | Module `slide/` |
| Diagram | **Tách đôi**: vẽ sơ đồ = việc SA trong `sdlc/` (mermaid đã có trong DOC); render đẹp = skill trong `slide/` |
| GraphCode | **Không tạo** — ADR-020 QĐ-6 đã chốt codegraph MCP + `as-built`. Làm nốt việc treo "xác minh đường codegraph" |
| Obsidian / sơ đồ hoá tài liệu | Skill core cross-phase `doc-map` trong `sdlc/` — sinh cấu trúc Markdown liên kết chuẩn để **người xem bằng Obsidian, AI đọc trực tiếp**; không wrap Obsidian API. Khuôn `as-built`: tool optional, degrade được |
| Prototype | Template DOC-19 **ở lại** `sdlc/`; skill dựng prototype = module maker khi có thật |

---

## §5. Chi phí & verify

Số đếm thật (2026-08-24): ~937 lượt "minipower" toàn repo — `minipower/` nội bộ 433 (đa phần link tương đối, đổi tên folder **không gãy**) · ADRs 416 (**chỉ sửa href** — QĐ-11) · install 6 hook path × 3 kênh (có test parity canh) · CI 8 ref · AGENTS/README/fundamentals ~54.

`npm test`/`gen:check` **không phủ** markdown — verify phải gồm ([ADR-021 §6](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md)):

```text
1. Script dò link chạy TRƯỚC (baseline link gãy sẵn có) và SAU (không link gãy mới)
2. grep "minipower/" · "jarvis/" dạng path → 0 match ngoài ADRs-href-đã-sửa
3. npm run gen && npm test && npm run gen:check — xanh (hooks không hồi quy)
4. Test parity 3 kênh install — xanh sau khi sửa 6 hook path
5. Diff nội dung SKILL.md trước/sau = rỗng trừ dòng name: (QĐ-5 ADR-021)
```

---

## §6. Việc phải làm — MỘT đợt

| # | Việc | Xong khi |
|---|---|---|
| 1 | Script dò link (`hooks/bin/link-check.js` + `npm run link:check`) — chạy lấy baseline | In danh sách link gãy hiện có |
| 2 | `minipower/` → `sdlc/` + sửa install 3 kênh + CI + `.claude-plugin` path + tag `[minipower]` → giữ (tag search, không phải path) | Verify 3–4 §5 xanh |
| 3 | Thi hành [ADR-021 §8](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md): `jarvis/` → `backend/` + 15 skill `minipower-backend-*` | Bảng §2 ADR-021 khớp thư mục thật |
| 4 | AGENTS.md: định vị QĐ-1 + danh sách pack mới + **index `contracts/` ở §Tham chiếu** (QĐ-10, thay 3 chỗ đã gỡ) + sửa `SOPs/`→`fundamentals/` (ADR-021 QĐ-8) + đổi chữ "ai-skills"→"minipower" trong tài liệu (folder/remote chủ repo tự đổi sau) | Đọc lại nhất quán |
| 5 | **Tách COORDINATION.md → `contracts/` ×5 + README index** (QĐ-10); cập nhật ví dụ manifest sang tên pack mới (`sdlc`/`backend`/`frontend`); sửa test `#12` → `contracts/handoff.md`; README.md bản đồ | Link check + gen/test xanh |
| 6 | Href trong ADRs cũ (QĐ-11) — máy móc, không đụng chữ | Link check xanh trên ADRs |
| 7 | `PACK.md` cho `sdlc/` + `backend/` (QĐ-8) | Khớp schema `contracts/pack-manifest.md` |
| 8 | Chạy trọn 5 bước verify §5 | Cả 5 xanh |

Sau đợt này (không thuộc đợt): nâng `install.mjs --with` (QĐ-6) · mở rộng ánh xạ MCP tên (QĐ-9) · tích hợp OpenProject cho `sdlc/`.

---

## §7. Không làm (ranh giới)

| ❌ | Vì sao |
|---|---|
| Xây MCP Gateway / AuthZ / Audit / Eval platform / Registry service / Data Platform | QĐ-12 — hạ tầng công ty, wrap-not-build |
| Tạo folder module rỗng (`frontend/`, `autotest/`…) | QĐ-7 luật 2 |
| Viết trước 13 file role công ty (Sales, HR, Finance…) | Role đến cùng module phục vụ nó; `roles:` trong PACK.md là chỗ khai |
| Đổi nội dung skill trong đợt đổi tên | ADR-021 QĐ-5 — đổi tên phải kiểm được bằng "trước sau giống hệt trừ path" |
| Sửa chữ "minipower"/"jarvis" trong ADR cũ | QĐ-11 — chỉ href |
| Nhét Governance/Approval engine vào minipower | Minipower định nghĩa quy trình; cưỡng chế là việc Control Plane ngoài |

---

*Liên quan:* [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) (áp dụng cho pack backend) · [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) (ruột sdlc) · [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) (wrap-not-build) · [COORDINATION.md](../../contracts/README.md) (nguồn tách `contracts/` — QĐ-10) · [AGENTS.md](../../AGENTS.md)
