# Đổi tên pack `jarvis` → `backend` — áp dụng hệ tên ADR-022

| | |
|---|---|
| **Ngày** | 2026-08-24 |
| **Trạng thái** | 🟢 **DONE — chủ repo xác nhận 2026-08-25.** Thi hành trong đợt [ADR-022 §6](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md): 15/15 skill đổi tên đúng bảng §2, `name:` khớp thư mục lá, provider theo quy tắc, **nội dung bất biến** (kiểm 5 PASS); invariant có test canh (`backend-pack.test.js`) |
| **Phạm vi** | Tên **pack / thư mục / skill** của pack `jarvis/`. **Không** đụng nội dung kỹ thuật .NET, **không** đụng pack lõi (việc `minipower/` → `sdlc/` thuộc [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-3; `rules.json` 0 hit `"jarvis"`), **không** đụng framework Jarvis hay repo code của nó |
| **Nối tiếp** | **Tuân theo hệ tên [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md)** (QĐ-2 hai tầng · QĐ-4 tiền tố `minipower-{module}-…`) · **Giữ** [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) · **Giữ** [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md) (plugin — việc SAU) · **Kế thừa bài học** [ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) §2.2 + §3.1 (bốn bản cài lệch nhau; parity đa nền tảng là bẫy) |
| **Mục đích** | Tách bạch **tên sản phẩm ngoài** (framework Jarvis) khỏi **tên gói skill trong repo**; đặt tên pack theo **chức năng** (`backend`) và tên skill theo hệ `minipower-backend-*`, để repo mở sang stack khác không phải đổi tên lần hai và gõ `minipower` là thấy toàn bộ |
| **Ảnh hưởng** | `jarvis/` (→ `backend/`, 15 skill `minipower-backend-*`) · [README.md](../README.md) §bản đồ pack · [AGENTS.md](../../AGENTS.md) §Quy ước đặt tên & thư mục · hợp đồng liên-pack (sau tách theo ADR-022 QĐ-10: `contracts/shared-conventions.md` anatomy · `contracts/pack-manifest.md` §5.3–5.4 · `contracts/README.md` checklist) · [fundamentals/template-skill.md](../../src/toolbox/skills/minipower-toolbox-skill-author/SKILL.md) · `fundamentals/tutorial-index.md`. **Không ảnh hưởng:** ruột pack lõi · 7 điều kiện cứng · `rules.json` · CI hooks |

---

## §0. Quyết định

| # | Nội dung |
|---|---|
| **QĐ-1** | **"Jarvis" là hai thứ — chỉ đổi một.** Framework .NET tên **Jarvis** giữ nguyên tuyệt đối: package (`Jarvis.Caching`, `Jarvis.DDD.Application`), API (`AddJarvisAuthentication`), repo code, biến CI (`JARVIS_SKILLS_REF`), `vendor/jarvis`. Chỉ đổi thứ chỉ **pack / thư mục / tên skill trong repo `ai-skills`** |
| **QĐ-2** | **Pack `jarvis/` → `backend/`.** Tên pack theo **chức năng**, không theo framework; một từ, đồng bộ các module tương lai (`autotest`·`design`·`slide` — [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-2/QĐ-4, bỏ "code-"). Một pack `backend` chứa được nhiều stack; `-dotnet` hôm nay, `-node`/`-java` mai sau sống cạnh nhau |
| **QĐ-3** | **15 skill lá mang tiền tố `minipower-backend-`, giữ nguyên hậu tố stack.** `authentication-dotnet` → `minipower-backend-authentication-dotnet`. Gõ "minipower" trong ô search của mọi công cụ → toàn bộ hiện ra, kể cả loader chỉ liệt kê phẳng |
| **QĐ-4** | **Phân cấp bằng gạch nối, không bằng dấu hai chấm.** `name:` frontmatter là kebab-case; `:` không hợp lệ trong đó. Namespace `plugin:skill` **chỉ Claude Code hiểu** — Cursor, OpenCode, Codex, Antigravity đều quét phẳng. Đóng gói plugin để lấy `minipower:` là **việc SAU**, không nằm trong ADR này |
| **QĐ-5** | **Chỉ đổi tên, không đổi nội dung.** Sửa: đường dẫn, tên thư mục, `name:` frontmatter, link trỏ tới path cũ. **Không** sửa: `description`, quy tắc trong `SKILL.md`, workflow, template, cơ chế publish (rsync/submodule) |
| **QĐ-6** | **`frontend/` chưa tạo.** Không tạo thư mục rỗng, không tạo placeholder. Bổ sung khi có skill đầu tiên thật — đúng nguyên tắc *"co lại trước khi mở rộng"* |
| **QĐ-7** | **ADR đã ban hành: chữ giữ nguyên, href sửa máy móc** ([ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-11). [ADR-003](../cancel/ADR-003-2026-07-20-minipower-gated-fanout-execution.md) · [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) · [ADR-017](../cancel/ADR-017-2026-08-20-minipower-toolchain-openproject-github-outline-slack.md) có nhắc `jarvis` — chữ đó là **bản ghi lịch sử**, để nguyên; chỉ đường dẫn markdown trỏ file đã di chuyển được hàn lại cho hết gãy |
| **QĐ-8** | **`fundamentals/` giữ tên.** [AGENTS.md](../../AGENTS.md) §Quy ước đang khai pack `SOPs/` — thư mục đó **không tồn tại**. Sửa AGENTS.md cho khớp thực tế, không đổi tên thư mục |

---

## §1. Vì sao đổi — và vì sao không đổi phần còn lại

Pack đang mang tên một **framework nội bộ**. Ba hệ quả:

| Vấn đề | Biểu hiện |
|---|---|
| Tên pack ≠ chức năng pack | Người mới đọc `jarvis/` không đoán được đây là skill backend. Phải mở README mới biết |
| Không mở rộng được | Thêm backend Node/Java thì đặt ở đâu? `jarvis/` sai nghĩa, tạo pack mới thì phân mảnh |
| Trộn hai không gian tên | "Jarvis" vừa là pack ở repo này, vừa là framework + repo code ở [COORDINATION.md §4](../../contracts/cross-repo-bridge.md) — cầu H4/H6 trỏ sang repo **khác**, không nằm trong tay lần refactor này |

QĐ-1 tách đúng chỗ đau: **cái nào là bao bì thì đổi, cái nào là sản phẩm thì giữ.** Nội dung 15 skill vẫn dạy Jarvis framework, vẫn gọi `AddJarvisAuthentication` — chỉ cái hộp đựng đổi tên.

---

## §2. Bảng đổi tên (15 skill)

| Cũ | Mới |
|---|---|
| `jarvis/` | `backend/` |
| `jarvis/skills/application-dotnet/` | `backend/skills/minipower-backend-application-dotnet/` |
| `jarvis/skills/authentication-dotnet/` | `backend/skills/minipower-backend-authentication-dotnet/` |
| `jarvis/skills/blobstoring-dotnet/` | `backend/skills/minipower-backend-blobstoring-dotnet/` |
| `jarvis/skills/caching-dotnet/` | `backend/skills/minipower-backend-caching-dotnet/` |
| `jarvis/skills/code-review-dotnet/` | `backend/skills/minipower-backend-review-dotnet/` ✅ **Q1 chốt** — bỏ chữ "code" lặp |
| `jarvis/skills/entityframework-dotnet/` | `backend/skills/minipower-backend-entityframework-dotnet/` |
| `jarvis/skills/foundation-dotnet/` | `backend/skills/minipower-backend-foundation-dotnet/` |
| `jarvis/skills/healthcheck-dotnet/` | `backend/skills/minipower-backend-healthcheck-dotnet/` |
| `jarvis/skills/jarvis-dotnet/` | `backend/skills/minipower-backend-scaffold-dotnet/` ✅ **Q2 chốt** — tên theo **việc nó làm**, không theo framework |
| `jarvis/skills/notification-dotnet/` | `backend/skills/minipower-backend-notification-dotnet/` |
| `jarvis/skills/observability-dotnet/` | `backend/skills/minipower-backend-observability-dotnet/` |
| `jarvis/skills/realtime-dotnet/` | `backend/skills/minipower-backend-realtime-dotnet/` |
| `jarvis/skills/swashbuckle-dotnet/` | `backend/skills/minipower-backend-swashbuckle-dotnet/` |
| `jarvis/skills/telemetry-dotnet/` | `backend/skills/minipower-backend-telemetry-dotnet/` |
| `jarvis/skills/troubleshooting-dotnet/` | `backend/skills/minipower-backend-troubleshooting-dotnet/` |

**Ràng buộc kiểm được:** `name:` frontmatter **trùng tên thư mục lá** (quy ước sẵn có tại [fundamentals/template-skill.md](../../src/toolbox/skills/minipower-toolbox-skill-author/SKILL.md) §2). Tên dài nhất `minipower-backend-entityframework-dotnet` = **40 ký tự**, dưới ngưỡng 64.

**Provider skill con** (`providers/*/SKILL.md`, `patterns/*/SKILL.md`) theo quy ước cũ là `<skill>-<provider>` — sau đổi tên thành `minipower-backend-healthcheck-dotnet-postgresql` (**47 ký tự**, vẫn dưới 64).

### §2a. Cây repo sau đổi tên — pack `backend/` mở chi tiết

Toàn cảnh repo để thấy pack này đứng ở đâu; ruột `sdlc/` xem [ADR-022 §2a](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md). Giải phẫu từng skill **giữ nguyên** theo [fundamentals/template-skill.md](../../src/toolbox/skills/minipower-toolbox-skill-author/SKILL.md) — chỉ tên thư mục lá và `name:` đổi:

```text
minipower/                                          ← REPO (thương hiệu — ADR-022 QĐ-2)
│
├── AGENTS.md · CLAUDE.md · README.md               luật agent (nạp mỗi phiên) · bản đồ repo
├── contracts/                                      hợp đồng liên-pack ×5 + README index (ADR-022 QĐ-10)
├── ADRs/  ·  fundamentals/                         quyết định định hướng · kiến thức nền + interview/
│
├── sdlc/                                           ┃ CORE — router `minipower-sdlc` (ADR-022 QĐ-3)
│   ├── SKILL.md ★ router  ·  PACK.md               ┃ ruột chi tiết: ADR-022 §2a
│   ├── skills/   (11 nội bộ: 6 phase · 3 gate mềm · fan-out · as-built)
│   ├── agents/ · roles/ · templates/ · hooks/      ┃ rules.json SSOT · link-check.js
│   ├── docs-skeleton/ · project-skeleton/
│   └── install/{claude,cursor,opencode}/ · .claude-plugin/
│
├── backend/                                        ┃ PACK NÀY — phạm vi ADR-021
│   ├── README.md                                   ┃ hub người dùng: bảng 15 skill, prompt mẫu, publish
│   ├── PACK.md                                     ┃ manifest máy-đọc (ADR-022 QĐ-8)
│   └── skills/                                     ┃ 15 lá — loader đăng ký TỪNG CÁI (lá-rời)
│       │
│       │  ── dựng nền ──────────────────────────────────────
│       ├── minipower-backend-scaffold-dotnet/      ★ điểm vào: dựng solution .NET 9 + cài Jarvis
│       │   ├── SKILL.md                            (name: minipower-backend-scaffold-dotnet)
│       │   ├── README.md
│       │   ├── workflows/  scaffold.md
│       │   └── templates/  docs-README.md · docs-Architecture.md · SKILLS.md
│       ├── minipower-backend-foundation-dotnet/    Domain.Shared · Mvc · Json/CORS · ApiResponseWrapper
│       ├── minipower-backend-application-dotnet/   CQRS Application layer
│       │
│       │  ── tích hợp theo nhu cầu ─────────────────────────  (mỗi skill cùng giải phẫu:
│       ├── minipower-backend-authentication-dotnet/    JWT · API Key · Cognito     SKILL.md + README.md
│       ├── minipower-backend-entityframework-dotnet/   EF multitenancy             + workflows/{init,add}.md
│       ├── minipower-backend-caching-dotnet/           Memory + Redis              + providers|patterns/
│       ├── minipower-backend-notification-dotnet/      Email SMTP Mailkit          + templates/)
│       ├── minipower-backend-blobstoring-dotnet/       FileSystem / MinIO
│       ├── minipower-backend-realtime-dotnet/
│       ├── minipower-backend-swashbuckle-dotnet/       Swagger / OpenAPI
│       │
│       │  ── vận hành ──────────────────────────────────────
│       ├── minipower-backend-healthcheck-dotnet/       /health/live · /health/ready
│       │   └── providers/postgresql/SKILL.md           (name: minipower-backend-healthcheck-dotnet-postgresql)
│       ├── minipower-backend-telemetry-dotnet/         OpenTelemetry
│       ├── minipower-backend-observability-dotnet/     OTEL → Prometheus → Grafana → alert
│       ├── minipower-backend-troubleshooting-dotnet/   xử sự cố (+ tools/)
│       │
│       │  ── chất lượng ────────────────────────────────────
│       └── minipower-backend-review-dotnet/            review PR C#/.NET trước khi mở
│
├── frontend/                                       ⏳ CHƯA TẠO (QĐ-6)
└── autotest/ · design/ · slide/ …                  ⏳ khi có skill thật (ADR-022 §4)
```

15 lá phục vụ **4 vai** qua lăng kính `roles/` của pack lõi: DEV (dựng nền + tích hợp) · QC (review) · DevOps (vận hành) · Support (troubleshooting) — khai ở trường `roles:` trong `PACK.md`, không chia thư mục theo vai.

### §2b. Cách dùng sau đổi tên

**Đường chính — tự kích hoạt theo ngữ cảnh** (giá trị của lá-rời): người dùng mô tả việc, agent khớp `description` của lá:

```text
"Dựng backend mới cho sản phẩm Acme"        → minipower-backend-scaffold-dotnet
"API cần xác thực JWT + API key"            → minipower-backend-authentication-dotnet
"cache Redis, invalidate khi update stock"  → minipower-backend-caching-dotnet
"thêm readiness check cho PostgreSQL"       → minipower-backend-healthcheck-dotnet
"review PR này trước khi merge"             → minipower-backend-review-dotnet
```

**Đường phụ — gọi đích danh** (prompt mẫu trong `backend/README.md`, path đổi theo tên mới):

```text
@.opencode/skills/minipower-backend-scaffold-dotnet/workflows/scaffold.md
Scaffold backend .NET 9: Product=Acme, product=acme

@.opencode/skills/minipower-backend-entityframework-dotnet/workflows/init.md
Init Jarvis EF + single DB cho MyApp
```

**Thứ tự khuyên khi dựng mới** (khuyến nghị trong README, không hook nào ép — lá-rời không có thứ tự cưỡng chế): `scaffold → foundation → application → (auth / EF / cache / … theo nhu cầu) → review trước khi mở PR`.

**Cài vào repo product:** cơ chế publish giữ nguyên (QĐ-5) — symlink/rsync từng lá như [backend/README.md] hiện hành, chỉ đổi path nguồn `jarvis/skills/*` → `backend/skills/*`; tương lai `install.mjs --with backend` (ADR-022 QĐ-6).

---

## §3. Ranh giới "đổi tên, không đổi nội dung" (QĐ-5)

| Làm | Không làm |
|---|---|
| Đổi tên thư mục pack + 15 thư mục skill | Sửa `description` trong frontmatter |
| Cập nhật `name:` frontmatter cho khớp thư mục | Viết lại quy tắc / workflow trong `SKILL.md` |
| Sửa link trỏ path cũ ở README, AGENTS, hợp đồng liên-pack, fundamentals | Gộp / tách / thêm / bớt skill |
| Sửa bảng skill ở `backend/README.md` | Đụng chữ `Jarvis` khi nó chỉ framework, package, API, repo ngoài |
| Sửa `pack: jarvis` → `pack: backend` ở `contracts/pack-manifest.md` (§5.3 cũ) | Mở install channel riêng cho `backend` |
| Sửa AGENTS.md `SOPs/` → `fundamentals/` (QĐ-8) | Đụng ruột pack lõi (đổi vỏ `minipower/`→`sdlc/` thuộc ADR-022) |

**Lý do tách bạch:** trộn hai loại thay đổi thì khi hỏng không phân biệt được do đổi tên hay do sửa nội dung. Refactor đổi tên phải kiểm được bằng mệnh đề *"trước sau giống hệt, trừ đường dẫn"*.

---

## §4. Hợp đồng liên-pack — sửa gì, giữ gì

[ADR-022 QĐ-10](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) tách `COORDINATION.md` thành `contracts/` ×5 **trong cùng đợt** — các sửa dưới áp vào **file đích sau tách** (cột "Vị trí" ghi § của file gốc để đối chiếu). Phân biệt hai trục dễ lẫn:

| Trường | Nghĩa | Hành động |
|---|---|---|
| `pack:` | Tên **gói skill** trong repo này | `jarvis` → **`backend`** |
| `roles:` | **Vai trò con người** trong công ty | `backend-dotnet` — **giữ** |

| Vị trí (file gốc → file đích) | Nội dung | Hành động |
|---|---|---|
| §3 anatomy → `contracts/shared-conventions.md` — `jarvis + minipower` | Tên pack | Đổi → `backend + sdlc` |
| §5.3 → `contracts/pack-manifest.md` — `pack: jarvis` | Tên pack | Đổi → `pack: backend`; `roles: [backend-dotnet]` giữ |
| §2 dòng 70, 85 → `contracts/handoff.md` — *"repo code (Jarvis)"*, *"repo consumer (Jarvis)"* | **Repo ngoài** | **Giữ** — QĐ-1 |
| §4 + mermaid → `contracts/cross-repo-bridge.md` — `subgraph CODE["repo code (Jarvis)"]` | **Repo ngoài** | **Giữ** |
| §4.1 → `contracts/cross-repo-bridge.md` — link `jarvis/README.md — publish` | Path trong repo này | Đổi path → `backend/README.md`; chữ "Jarvis" trong câu giữ (chỉ cơ chế publish của framework) |
| §4.3 → `contracts/cross-repo-bridge.md` — `JARVIS_SKILLS_REF` | Biến CI repo ngoài | **Giữ** |
| §7 checklist → `contracts/README.md` — `PACK.md` cho `jarvis` | Tên pack | Đổi → `backend` |
| §5.4 → `contracts/pack-manifest.md` — khung `pack: frontend-react` | Pack tương lai | ✅ **Q3 chốt**: đổi → `pack: frontend` cho khớp hệ tên; folder `frontend/` vẫn **chưa tạo** (QĐ-6) |

---

## §5. Cái này **không** động tới

Kiểm chứng bằng grep, không phải bằng phỏng đoán:

- **`rules.json` (SSOT, trong pack lõi): 0 lần xuất hiện `"jarvis"`.** SSOT sạch.
- **7 điều kiện cứng** (`profile-guard` · `prereq-gate` · `baseline-guard` · `token-guard` · `auto-routing` · `trace:check`) — không tham chiếu pack `jarvis`.
- **`npm run gen` / `npm test` / `npm run gen:check`** — không có vùng generated nào nhắc `jarvis`.

**Hệ quả quan trọng:** ba lệnh trên **xanh không chứng minh được gì** cho refactor này. Chúng phủ `hooks/`, còn thứ đang đổi là markdown. Cần cơ chế kiểm riêng — §6.

---

## §6. Verify — vì sao cần thứ khác ngoài `npm test`

**649** lượt xuất hiện `jarvis` trong `.md`/`.json`/`.js`. Không test nào canh link markdown. Success criteria đề xuất:

```
1. Đổi tên + cập nhật ref
   → verify: grep -ri "jarvis/" còn 0 match dạng đường dẫn
              (match còn lại phải là framework/package/repo ngoài — QĐ-1)
2. Link check
   → verify: mọi link markdown tương đối resolve tới file có thật
3. Không hồi quy hooks
   → verify: npm run gen && npm test && npm run gen:check (cả ba xanh)
4. Nội dung bất biến
   → verify: diff nội dung SKILL.md trước/sau = rỗng, trừ dòng `name:`
```

Bước 2 cần script dò link (~30 dòng Node, không dependency). Xem **§6a**.

### §6a. Script dò link là gì, và "giữ hay bỏ" nghĩa là gì (giải thích Q4)

**Vấn đề nó giải.** Markdown link kiểu `[COORDINATION](../../contracts/README.md)` là **chuỗi ký tự thường** — không compiler nào kiểm. Đổi tên `jarvis/` → `backend/` sẽ làm mọi link trỏ `jarvis/...` chết **im lặng**: file vẫn mở được, link vẫn hiện màu xanh, bấm vào mới ra 404. Repo có ~649 chỗ nhắc `jarvis` (và ~937 chỗ nhắc `minipower` — đợt chung với ADR-022), không soi tay hết được.

**Script làm gì.** Quét mọi `.md`, bóc link tương đối, kiểm file đích có thật không, in ra cái nào gãy:

```text
README.md:64        → skills/template-skill.md          ✗ KHÔNG TỒN TẠI
COORDINATION.md:149 → jarvis/README.md                  ✗ KHÔNG TỒN TẠI
```

Khoảng 30 dòng Node thuần, không dependency — cùng kiểu với `hooks/` sẵn có.

**Hai lựa chọn khác nhau ở chỗ nào:**

| | **Chạy một lần rồi bỏ** | **Giữ lại trong repo** |
|---|---|---|
| Viết script | Có (vẫn phải viết) | Có |
| Nơi để | Thư mục tạm | `hooks/bin/link-check.js` (pack lõi) + `npm run link:check` |
| Bắt được lần này | ✅ | ✅ |
| Bắt được **lần sau** | ❌ — mỗi lần đổi tên/di chuyển file lại viết lại | ✅ — chạy một lệnh |
| Vào CI được | ❌ | ✅ — link gãy làm đỏ PR |
| Chi phí thêm | 0 | ~15 phút wire `package.json` + 1 test |

**Nói gọn:** cùng một script, khác nhau ở chỗ **có cất vào hộp đồ nghề hay vứt đi sau khi dùng**.

**Đề xuất: giữ lại.** Hai lý do:
1. Đây không phải lần cuối repo đổi tên/di chuyển file — `frontend/`·`autotest/`·`design/`·`slide/` sẽ thêm vào sau ([ADR-022 §4](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md)), và mọi lần tách/gộp pack đều sinh ra đúng loại link gãy im lặng này.
2. Đúng nguyên tắc repo đã tự chốt: *"mọi thứ mới phải có SSOT + test/CI, **không dựa vào kỷ luật con người**"* — và [ADR-001 §3.6](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) đã ghi bài học *"invariant duy trì bằng kỷ luật thay vì bằng check — ít nhất 2 cái đã lệch rồi"*.

**Phản biện công bằng:** thêm script = thêm thứ phải bảo trì, và [ADR-001 §3.3](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) cảnh báo đúng chuyện "code chết được test giữ sống". Khác biệt ở đây: script này **có consumer thật** (chạy mỗi lần đổi cấu trúc, và CI), không phải tài liệu nằm im.

---

## §7. Câu hỏi chặn — cần chủ repo quyết

| # | Câu hỏi | Kết quả |
|---|---|---|
| **Q1** | Tên skill review — lặp chữ "code" | ✅ **Chốt 2026-08-24: bỏ chữ lặp → `minipower-backend-review-dotnet`** (tiền tố theo ADR-022 QĐ-4). Provider skill giữ quy tắc `<skill>-<provider>` |
| **Q2** | Skill scaffold `jarvis-dotnet` đặt tên gì | ✅ **Chốt 2026-08-24: tên theo việc nó làm → `minipower-backend-scaffold-dotnet`.** *Nội dung skill vẫn scaffold đúng framework Jarvis, không đổi một chữ (QĐ-5)* |
| **Q3** | Pack manifest §5.4 khai `pack: frontend-react` vs tên module tương lai | ✅ **Chốt 2026-08-24: đổi thành `frontend`** (hệ tên ADR-022). Sửa tên pack ở §5.3 (`jarvis`→`backend`) và §5.4 (`frontend-react`→`frontend`) — sau tách QĐ-10, hai chỗ này nằm ở `contracts/pack-manifest.md` |
| **Q4** | Script dò link markdown: giữ lại trong repo hay chạy một lần rồi bỏ | ✅ **Chốt 2026-08-24: giữ lại** — `hooks/bin/link-check.js` + `npm run link:check`, lý do §6a. Là bước 1 của đợt thi hành ([ADR-022 §6](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md)) |

**Giả định đang áp** (nói nếu sai): việc đổi **tên thư mục repo và remote Git** do chủ repo tự làm. ADR này chỉ đổi **nội dung và cách xưng hô trong tài liệu** — theo quy ước Git của repo, agent không tự thao tác đổi trạng thái Git.

---

## §8. Việc phải làm (theo thứ tự)

Các bước dưới lồng trong đợt chung [ADR-022 §6](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) (script dò link = bước 1 của đợt, dùng chung):

| # | Việc | Xong khi |
|---|---|---|
| **1** | ~~Chốt Q1–Q4 §7~~ | ✅ Đóng 2026-08-24 |
| **2** | Đổi tên `jarvis/` → `backend/` + 15 thư mục skill theo bảng §2; cập nhật `name:` frontmatter | Tên thư mục lá ≡ `name:` ở cả 15 skill |
| **3** | Cập nhật `backend/README.md` — bảng 15 skill, path prompt mẫu | Bảng khớp thư mục thật |
| **4** | Cập nhật [README.md](../README.md) (6 chỗ) · [AGENTS.md](../../AGENTS.md) (+ QĐ-8) · hợp đồng liên-pack (theo §4 ADR này, trên `contracts/` sau tách) | grep bước 1 §6 sạch |
| **5** | Cập nhật [fundamentals/template-skill.md](../../src/toolbox/skills/minipower-toolbox-skill-author/SKILL.md) + `tutorial-index.md` | Quy ước đặt tên trong template khớp QĐ-3 |
| **6** | Chạy trọn 4 bước verify §6 | Cả 4 xanh |

**Phát hiện phụ trong lúc khảo sát** (không sửa nếu chưa được đồng ý): [README.md:64](../README.md) trỏ `skills/template-skill.md` — path này **không tồn tại**, file thật ở `fundamentals/template-skill.md`. Link gãy có sẵn, và nằm đúng dòng nói về "Skill Jarvis mới" nên sẽ chạm tới ở bước 5.

---

## §9. Điều chỉnh 2026-08-28 — QĐ-8 và QĐ-6 bị [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) thay

Hai quyết định của ADR này thôi hiệu lực; phần còn lại (đổi tên pack `jarvis` → `backend`, 15 skill lá, ràng buộc `name:` ≡ thư mục) **giữ nguyên**.

| QĐ | Nội dung cũ | Thay bằng | Vì sao đổi |
|---|---|---|---|
| **QĐ-8** | *"`fundamentals/` giữ tên"* | Thư mục đổi tên **`fundamentals/` → `staging/`** và hạ vai từ *tầng nền* xuống **kho tạm — chỉ rút, không nạp** ([ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) QĐ-1) | Lúc ADR-021, đổi tên kéo theo **50 link gãy** phải soát để đổi lấy đúng một chữ — không đáng. Sau khi xoá `tutorial-index.md` (44 trong số đó) ngày 2026-08-28, chi phí còn ~5 link: cùng một quyết định, cán cân khác hẳn |
| **QĐ-6** | `frontend/` chưa tạo ⇒ nội dung frontend nằm chờ | `staging/tabler-uikit-skill.md` **xoá hẳn**, không chờ `frontend/` ([ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) QĐ-7). Luật *"chưa có skill thật thì chưa tạo thư mục module"* **vẫn giữ** — `frontend/` vẫn chưa tạo | Giữ một file để chờ module chưa có kế hoạch mở là giữ nợ; cần thì lấy lại từ lịch sử Git |

---

*Liên quan:* [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) (điều chỉnh QĐ-8 · QĐ-6) · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) (ADR chủ — hệ tên + đợt thi hành + tách `contracts/`) · [AGENTS.md](../../AGENTS.md) §Quy ước đặt tên & thư mục · `contracts/pack-manifest.md` (schema PACK.md, sau tách) · [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md) (plugin — việc sau) · [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) (định hướng hiện hành)
