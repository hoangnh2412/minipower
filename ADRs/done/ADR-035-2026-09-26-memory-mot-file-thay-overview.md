# Memory một file thay `overview.md` — tiến độ cá nhân + nhắc việc (agent đọc trước phiên)

| | |
|---|---|
| **Ngày** | 2026-09-26 |
| **Trạng thái** | **Done** 2026-09-26. Confirm §6 · T1–T7 🟢. Chủ repo **bỏ smoke Cursor** (đủ unit + CLI `--check`). |
| **Phạm vi** | Dự án đích: bỏ `docs/05-traceability/overview.md`; **một** file memory làm entry agent đầu phiên (hiện trạng theo góc nhìn người đang làm + tiến độ cá nhân + nhắc việc). Skeleton/docs/skill/agent trỏ tới file đó. |
| **Ngoài phạm vi** | Không xoá `trace-matrix.md` / `doc-registry.md` · không quyết DEC/`doc-debt` trong ADR này (nợ nối) · **có** siết ADR-033 §5.3 (`memory/tasks/` → SQLite, QĐ-9) · không viết CLI mới (ADR-031) · không đổi marker `.minipower/` (ADR-034) trừ khi Q2 chọn đặt memory trong đó |
| **Nối tiếp** | [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) QĐ-20 (identity ≠ dự án; §5.3 siết bởi QĐ-9) · [ADR-034](../done/ADR-034-2026-09-26-minipower-marker-always-on-dispatch.md) (`.minipower/`) · [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) §3c (memory theo phase — **siết** bởi ADR này) · [shared-conventions](../../contracts/shared-conventions.md) · token-guard / context-load / TPL-agent-profile |
| **Mục đích** | Agent có **một** chỗ đọc trước khi làm việc; bỏ rollup đội `overview.md` trùng vai trò; memory = sổ **cá nhân** (tiến độ + nhắc việc), không phải board dự án |
| **Ảnh hưởng** | `src/router/docs-skeleton/05-traceability/overview.md` (**xoá**) · bản sao `sdlc/docs-skeleton/…` nếu còn · `src/router/project-skeleton/memory/memory.md` (viết lại khuôn) · `.gitignore` skeleton · `TPL-agent-profile` · `agents/token-guard.md` · `agents/context-load.md` · `docs/token-guard.md` · `docs/parallel-work.md` · `skills/fan-out/SKILL.md` · README skeleton · test skeleton / docs-consistency / link-check baseline |

---

## §1. Bối cảnh

Hiện tại dự án đích có **hai** lớp “nắm tình hình”:

| Path | Vai trò khai |
|------|----------------|
| `docs/05-traceability/overview.md` | Rollup đội 30s — snapshot, module × pipeline, milestone, blocker, việc 2 tuần tới; PM/BA cập nhật |
| `memory/memory.md` + `memory/{phase}/` | Index context agent theo chủ đề / phase |

Hệ quả: agent được bảo đọc `overview` rồi `memory/{phase}/`; fan-out / parallel-work coi `overview` là file dùng chung dễ xung đột ghi. Người dùng chốt định hướng 2026-09-26: **không cần overview trong docs**; **một file memory** cho agent đọc trước phiên; nội dung = **tiến độ cá nhân + nhắc việc** (kèm nắm hiện trạng đủ để làm việc), **không chia phase**, **không share** (gitignore).

Số liệu grep 2026-09-26: `overview.md` được dẫn từ token-guard, TPL-agent-profile, fan-out, parallel-work, README skeleton, CHANGELOG — phải dọn cùng đợt.

`trace-matrix.md` / `doc-registry.md` vẫn là SSOT truy vết / registry DOC — **không** thay bằng memory.

---

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | `overview.md` = rollup **đội** trong `docs/`, trong khi agent cần entry **cá nhân** đầu phiên | Hai nguồn “đang ở đâu”; xung đột ghi multi-BA; người mới nhầm board đội với sổ nhắc |
| P2 | `memory/` chia phase + index trùng overview | Context phình; ADR-020 §3c giữ phase vì fan-out — nhưng fan-out thật sự dựa `docs/03-modules/`, không cần memory theo phase cho entry |
| P3 | Commit memory/overview → lộ / lệch WIP giữa máy | Trái tinh thần ADR-033 QĐ-20 (cá nhân ≠ dự án) |

---

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | Không agent runtime / không tự bàn giao (ADR-022 QĐ-1) |
| C2 | Cứng = máy kiểm được; “phải đọc memory trước” là **advisory** trong rule/skill trừ khi có hook path (ADR-020 QĐ-3) |
| C3 | `trace-matrix` · `doc-registry` · DEC · doc-debt đội **không** biến mất im lặng — ADR này chỉ thay **overview**; dời DEC/debt nếu còn trong memory = đợt riêng |
| C4 | Token-guard: đầu phiên **một** file memory mỏng — không đọc full docs để “bootstrap” mỗi lần (bootstrap lần đầu = tuỳ chọn, có stale) |
| C5 | Marker `.minipower/` (ADR-034) giữ; không nhân bản identity |

---

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Giữ `overview.md`, chỉ thêm todo cá nhân | Ít đụng | P1/P3 còn | ❌ |
| O2 | Xoá `overview.md`; **một** `memory/memory.md` (gitignore) = hiện trạng góc nhìn tôi + tiến độ + nhắc việc; agent đọc file này trước | Một entry; khớp cá nhân hoá | Đội mất rollup 30s trong docs — dùng matrix/registry/DOC-15 | ✅ chọn |
| O3 | Xoá `overview.md`; đặt file tại `.minipower/memory.md` | Khớp marker 034 | Lệch thói quen path `memory/` trong skill cũ | (Q2) |

---

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Xoá `docs/05-traceability/overview.md` khỏi docs-skeleton** (và bản sao path cũ nếu còn). Folder `05-traceability/` giữ `trace-matrix.md` + `doc-registry.md`. Dự án đã init: xoá/archive overview ở đợt migrate, không bắt buộc rewrite lịch sử git | Không còn “rollup đội 30s” trong docs |
| **QĐ-2** | **Entry agent đầu phiên = một file memory** — mặc định đề xuất: `memory/memory.md`. (Q2 Confirm: hoặc `.minipower/memory.md`.) **Không** chia `memory/{phase}/` cho mục đích entry / tiến độ / nhắc việc | Thay chuỗi `overview` → `memory/{phase}/` |
| **QĐ-3** | **Nội dung khuôn bắt buộc (ba khối trong cùng file):** (1) **Hiện trạng** — phase, module mình đang đụng, baseline/blocker *theo góc nhìn người này* (pointer sang DOC/ID, không copy SRS); (2) **Tiến độ cá nhân** — đã làm / đang làm / lần cập nhật; (3) **Nhắc việc** — việc *tôi* cần làm tiếp (không phải board đội) | Một file, ba mục |
| **QĐ-4** | **File memory này gitignore** (cá nhân / máy). Skeleton commit `memory.md.example` (hoặc `memory.md` khuôn + `.gitignore` `memory/memory.md`). `profile.json` dự án vẫn commit được (exception hoặc path riêng — giữ ADR-033) | Không push WIP cá nhân |
| **QĐ-5** | **Thứ tự đầu phiên (advisory):** `profile.json` → `profile.user.json` → **`memory/memory.md`** → rồi mới 1 DOC slice. Thiếu memory → hỏi bootstrap mỏng (đọc thay overview: README + `doc-registry` / `trace-matrix` TOC + hỏi người), ghi local — **không** đọc full mọi DOC mỗi phiên | C4 |
| **QĐ-6** | **Việc đội / milestone dự án** không sống trong `memory/memory.md` (file đó chỉ nhắc việc *cá nhân*). Việc đội khi `tasks_provider=none` → **SQLite `artifact` (`type=task`)** — xem QĐ-9. Khi có OpenProject/Lark → provider. Kế hoạch → DOC-14/15 · truy vết → matrix/registry | Tránh memory = Kanban giả |
| **QĐ-7** | **Giữ `decision-log.md` + `open-questions.md` — phẳng, không theo phase.** Xoá 6 folder `memory/{phase}/`. Một `memory/decision-log.md` (mọi DEC; ID vẫn `DEC-{PHASE}-NNN` trong nội dung) · một `memory/open-questions.md` (câu hỏi đội / nợ tiền đề). **`memory.md` chỉ link** tới hai file đó ở khối «Con trỏ nhanh» — không nhúng nội dung DEC/Q. Siết ADR-020 §3c + schema path `memory/{phase}/decision-log.md` (docs/decision-log, shared-conventions, context-load, rules.json `context_chain`) | Một sổ DEC, một sổ hỏi; entry vẫn mỏng |
| **QĐ-8** | **Sửa chữ / test:** mọi ref `overview.md` trong `src/sdlc/` (+ bản sao `sdlc/` nếu parity) → `memory/memory.md`; parallel-work bỏ `overview` khỏi “file dùng chung”; fan-out rollup trỏ registry/matrix + cập nhật memory **cá nhân** khi người yêu cầu cuối phiên; path DEC/open-questions → file phẳng | Regression link-check + grep = 0 |
| **QĐ-9** | **`tasks_provider=none` → không còn `memory/tasks/`.** SSOT việc = hàng `artifact` trong `trace.db` (`type=task`, `provider=none`: id, title, status, due qua convention / cột sẵn có, `link` tới FR). SQLite vốn là projection cho FR/SRS body — nhưng **task metadata không có body DOC**, nên không cần file markdown song song. **Siết** [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) §5.3 / §11 (bỏ cây `T-NNN.md`). Mô tả dài nếu cần → một đoạn trong chat rồi L3 ghi title/status đủ dùng, hoặc pointer `docs/` / DEC — không nhân bản tracker | Một nhà cho việc đội khi không có MCP |

### Khuôn `memory/memory.md` (skeleton / example)

```markdown
# Memory — {Tên dự án} ({user_name local})

> **Cá nhân — gitignore.** Agent đọc file này **trước** khi làm DOC/phase.
> SSOT đội: `docs/` · `trace-matrix` · `doc-registry` · tasks provider.

## Hiện trạng (góc nhìn tôi)

| Mục | Giá trị |
|-----|---------|
| **Cập nhật** | YYYY-MM-DD |
| **Phase đang làm** | |
| **Module / slice** | |
| **Baseline** | |
| **Blocker tôi gặp** | pointer ID / path — không paste dài |

## Tiến độ cá nhân

| Ngày | Đã làm / đang làm | Artifact (ID) |
|------|-------------------|---------------|
| | | |

## Nhắc việc

| # | Việc | Liên quan | Nhắc khi | Trạng thái |
|---|------|-----------|----------|------------|
| 1 | | DOC / FR / DEC | | ☐ / ◐ / ✓ |

## Con trỏ nhanh

| Cần | Mở |
|-----|-----|
| Decision log (đội) | [`decision-log.md`](decision-log.md) |
| Open questions (đội) | [`open-questions.md`](open-questions.md) |
| Registry DOC | `docs/05-traceability/doc-registry.md` |
| Trace | `docs/05-traceability/trace-matrix.md` |
| Module tôi | `docs/03-modules/{id}/` |
```

### Cấu trúc folder `memory/` — trước → sau

**Trước (hiện hành, ADR-020 §3c + ADR-033 §5.7):**

```text
{project}/
├── memory/
│   ├── .gitignore                 ← profile.user.json · trace.db
│   ├── profile.json               ← dự án (commit)
│   ├── profile.user.json          ← identity (gitignore)
│   ├── profile.user.json.example
│   ├── memory.md                  ← index gốc → trỏ overview + 6 phase
│   ├── doc-debt.md                ← sổ nợ đội (commit)
│   ├── trace.sql / trace.db
│   ├── tasks/                     ← khi tasks_provider=none
│   ├── discovery/ … change-control/   ← 6 folder phase (README + decision-log)
│   └── {phase}/open-questions.md  ← khi có
├── docs/05-traceability/
│   ├── overview.md                ← rollup đội 30s  ← XOÁ (QĐ-1)
│   ├── trace-matrix.md
│   └── doc-registry.md
└── …
```

**Sau ADR-035 — đích khi Q2 = `memory/memory.md` (đề xuất):**

```text
{project}/
├── memory/
│   ├── .gitignore
│   │     # cá nhân / máy
│   │     memory.md
│   │     profile.user.json
│   │     trace.db
│   ├── profile.json               ← dự án v3 (commit) — ADR-033
│   ├── profile.user.json          ← identity (gitignore)
│   ├── profile.user.json.example  ← khuôn commit
│   ├── memory.md.example          ← khuôn ba khối + con trỏ (QĐ-3) — commit
│   ├── memory.md                  ← entry agent (gitignore) — link tới DEC / open-Q
│   ├── decision-log.md            ← DEC đội, **một file** — không theo phase (commit) — QĐ-7
│   ├── open-questions.md          ← câu hỏi / nợ tiền đề đội (commit) — QĐ-7
│   ├── doc-debt.md                ← sổ nợ tài liệu đội (commit) — chưa dời path (C3)
│   ├── trace.sql                  ← khuôn SQLite (commit)
│   └── trace.db                   ← index + SSOT việc đội khi tasks=none (gitignore) — QĐ-9
│   # không còn memory/{phase}/ · không còn memory/tasks/
├── docs/05-traceability/
│   ├── trace-matrix.md            ← SSOT truy vết (giữ)
│   └── doc-registry.md            ← registry DOC (giữ)
│   # overview.md — ĐÃ XOÁ
├── docs/ … · assets/ · brainstorm/
└── AGENTS.md
```

> **Vì sao bỏ `memory/tasks/`?** ADR-033 §5.3 từng lấy mỗi `T-NNN.md` làm SSOT rồi *đổ* sang `artifact`. Với task, gần như mọi field hữu ích (id · title · status · refs qua `link`) **đã đủ trong SQLite** — file markdown chỉ trùng. Khác FR/SRS: body tài liệu dài vẫn ở `docs/` / Outline; DB không chứa body. Việc đội `tasks=none` → ghi/đọc DB; việc *tôi* nhắc đầu phiên → khối «Nhắc việc» trong `memory.md`.

> **Vì sao DEC / open-questions phẳng?** Phase vẫn mã hoá trong ID (`DEC-REQ-001`) và trong dòng Trace — không cần 6 folder. Agent mở `memory.md` → click link khi cần sổ đội; không nạp cả DEC vào context mặc định.

**Nếu Q2 chọn `.minipower/memory.md`:**

```text
{project}/
├── .minipower/
│   ├── …                          ← identity / DB theo ADR-034
│   ├── memory.md                  ← entry agent (gitignore)
│   └── memory.md.example
└── memory/
    ├── profile.json · profile.user*
    ├── decision-log.md · open-questions.md · doc-debt.md
    └── trace.sql · trace.db
```

**Migrate dự án cũ (Q3 / Q4):** gộp `memory/*/decision-log.md` → `memory/decision-log.md` (giữ heading DEC); gộp open-questions tương tự; xoá 6 folder phase + `overview.md`.

| Path | Git | Vai trò sau ADR-035 |
|------|-----|---------------------|
| `memory/memory.md` | ignore | Entry agent: hiện trạng tôi + tiến độ + nhắc việc *cá nhân* + **link** DEC/open-Q |
| `memory/memory.md.example` | commit | Khuôn |
| `memory/decision-log.md` | commit | DEC đội (một file) |
| `memory/open-questions.md` | commit | Câu hỏi / nợ tiền đề đội |
| `memory/doc-debt.md` | commit | Sổ nợ tài liệu (mvp/maintain) |
| `memory/profile.json` | commit | Cấu hình dự án |
| `memory/profile.user.json` | ignore | Identity máy |
| `memory/trace.db` | ignore | Index trace + SSOT việc đội khi `tasks=none` |
| `memory/tasks/` · `memory/{phase}/` | — | **Bỏ** |
| `docs/05-traceability/overview.md` | — | **Xoá** |

---

## §6. Confirm *(bắt buộc trước khi thi hành)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…9? | **Có** — 2026-09-26 |
| Q2 | Path entry: `memory/memory.md` hay `.minipower/memory.md`? | **`memory/memory.md` + gitignore** |
| Q3 | Duyệt QĐ-7 — xoá 6 folder phase; một `decision-log.md` + một `open-questions.md`; `memory.md` chỉ link? | **Có** |
| Q4 | Dự án đã có `overview.md` / DEC theo phase: gộp migrate tự động (init note) hay người tự gộp? | **Note migrate trong INIT.md** (đợt skeleton) |
| Q5 | Duyệt QĐ-9 — bỏ `memory/tasks/`, việc đội `tasks=none` chỉ SQLite? | **Có** |

Chốt xong: ghi ngày vào **Trạng thái** + dòng index README.

---

## §7. Việc triển khai

| Bước | Việc | Done khi | Trạng thái |
|---|---|---|---|
| 1 | Confirm Q1–Q5 | Có trả lời trong §6 | 🟢 |
| 2 | Xoá `overview.md`; cập nhật README `05-traceability` | File không còn; link-check | 🟢 |
| 3 | Skeleton: khuôn `memory.md` (+ `.example`, gitignore) · **`decision-log.md` + `open-questions.md` phẳng** · xoá 6 folder `{phase}/` + `tasks/` · sửa path DEC trong docs/decision-log, shared-conventions, `rules.json` `context_chain`, decision-staleness | Cây khớp QĐ-7/9 | 🟢 |
| 4 | Sửa TPL-agent-profile, token-guard, context-load, parallel-work, fan-out, FAQ, INIT | grep `overview.md` và `memory/{phase}` = 0 ngoài ADRs/CHANGELOG | 🟢 |
| 5 | Test skeleton / docs-consistency; `link:check`; `npm test` (+ `gen` nếu đụng `rules.json`) | T xanh | 🟢 |
| 6 | Note migrate: gộp DEC/open-Q theo phase → file phẳng (Q4) | Có hướng dẫn trong INIT/FAQ | 🟢 |

---

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Init skeleton mới | Không `overview.md` · không `{phase}/` · không `tasks/` · có `memory.md.example` + `decision-log.md` + `open-questions.md` | 🟢 |
| T2 | Smoke | Khuôn `memory.md` link tới `decision-log.md` và `open-questions.md` | Có trong example | 🟢 |
| T3 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới | xanh | 🟢 |
| T4 | Regression | `rg overview` / phase memory ngoài ADRs/CHANGELOG | dọn src/cli | 🟢 |
| T5 | Mới | Test skeleton cấm overview / tasks / phase dirs | 🟢 |
| T6 | Mới | `tasks_provider=none`: việc qua `artifact` — unit sẵn trace; CLI bỏ tasks/ | 🟢 (skill/CLI tạo T-NNN chỉ DB = ngoài phạm vi — nợ pack `tasks` / ADR-033) |
| T7 | Mới | `decision-staleness` đọc `memory/decision-log.md` phẳng | 🟢 |

---

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Một entry cá nhân; DEC + open-questions đội còn nhưng phẳng; agent theo link từ memory.md |
| Xấu / chi phí | File DEC dài hơn (gom 6 phase); migrate dự án cũ; sửa nhiều path `memory/{phase}/` |
| Trung lập | ID `DEC-{PHASE}-` giữ trong nội dung; shared-conventions / decision-log schema đổi path |
