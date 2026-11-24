# CLI `minipower install` / `init` — script thi hành, LLM chỉ hỏi

| | |
|---|---|
| **Ngày** | 2026-09-01 |
| **Trạng thái** | Confirm đủ + CLI A+B unit 2026-09-26. Còn smoke máy thật / `--interactive` TTY / npx (QĐ-11) |
| **Phạm vi** | Một CLI Node duy nhất cho **hai bề mặt deterministic** đang giao cho LLM/người làm tay: **(A) wire minipower vào client** (Claude Code · Cursor · OpenCode · Codex) và **(B) khởi tạo cấu trúc dự án đích**. Đụng `sdlc/install/`, `sdlc/SKILL.md` (mục Khởi tạo), `sdlc/hooks/{package.json,test}`, `*/PACK.md` (đọc, không sửa) |
| **Ngoài phạm vi** | Không đổi logic guard trong `hooks/lib/*.js` · không đổi `rules.json` schema · không thêm hook thứ 7 · không tự động hoá phần **phán đoán** (chọn `project_mode`, viết nội dung DOC) · kênh Codex vẫn thuộc [ADR-025](../todo/ADR-025-2026-08-26-ho-tro-codex-kenh-cai-thu-tu.md) (ADR này chỉ chừa **chỗ cắm dữ liệu**, không mở kênh) · không làm packaging npm/`npx` (QĐ-11 ghi nhận là hướng, chưa quyết) |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-6 (`install --with <module>` — **ADR này đóng**) · QĐ-8 (`PACK.md` manifest = nguồn danh sách module) · [ADR-025](../todo/ADR-025-2026-08-26-ho-tro-codex-kenh-cai-thu-tu.md) QĐ-6 (parity 4 kênh có máy canh) · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-3 ("cứng bằng máy, mềm bằng lời" — nguyên tắc gốc) + QĐ-4 (mọi kênh cùng bộ guard) · [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) (wrap-not-build, không nền tảng thứ tư) · [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md)/[ADR-012](../todo/ADR-012-2026-07-26-minipower-cursor-plugin.md) (kênh plugin — song song, không thay thế) |
| **Mục đích** | Ghi lại một ranh giới: **việc có logic xác định thì viết thành script, LLM chỉ là kênh giao tiếp tự nhiên giữa người và script**. Cài đặt và khởi tạo phải đúng 100% mỗi lần, không phụ thuộc phiên bản model hay độ dài context |
| **Ảnh hưởng** | `sdlc/install/minipower.mjs` (**mới** — CLI) · `sdlc/install/{claude,cursor,opencode}/` (README hạ xuống tham chiếu; fragment + rule giữ nguyên vai trò dữ liệu) · `sdlc/install/claude/install.mjs` (**hấp thụ** vào CLI, giữ shim mỏng) · [`sdlc/SKILL.md`](../../src/router/skills/minipower-router/SKILL.md) mục "Thao tác agent khi init" + "Exit init" (viết lại theo QĐ-7/QĐ-9) · [`sdlc/hooks/package.json`](../../src/router/hooks/package.json) (script `install`/`init`) · `sdlc/hooks/test/{install-cli,init-cli}.test.js` (**mới**) + `install-parity.test.js` (mở rộng) · [`AGENTS.md`](../../AGENTS.md) mục Build/Test/Run + Kiến trúc |

---

## §1. Bối cảnh

Chủ repo đọc tài liệu [CodeGraph](https://github.com/colbymchenry/codegraph) ngày 2026-09-01 và chỉ ra một khuôn đáng học — nó tách **sạch hai lệnh** và nói rõ lệnh nào làm gì:

> `codegraph install` — dò và tự cấu hình Claude Code, Cursor, Codex CLI, opencode, Gemini CLI, Copilot… wire MCP server vào từng cái. **Nó chỉ wire agent — không index code**; dựng graph từng project là `codegraph init` riêng.

Điều đáng học **không phải** danh sách client, mà là: toàn bộ việc này là **chọn option → chạy script**, không có LLM ở giữa. Kết quả đúng 100% mỗi lần, không phụ thuộc model nào đang chạy.

Đối chiếu minipower ngày 2026-09-01 — repo có **đúng hai bề mặt đó**, ở hai mức trưởng thành rất lệch:

| Bề mặt | Hiện trạng | Ai thi hành |
|---|---|---|
| **Wire vào client** — Claude Code | [`install/claude/install.mjs`](../../cli/claude/install.mjs) — 150 dòng, idempotent, backup `.bak`, `--check`/`--print`, smoke-test 4 shim, xử lý escape path Windows | **script** ✅ |
| — Cursor | `install/cursor/README.md`: người tự `New-Item -ItemType SymbolicLink` ×3 rule + tự merge `hooks.fragment.json` | người / LLM ❌ |
| — OpenCode | `install/opencode/README.md`: symlink ×3 + merge `opencode.fragment.json` + đặt plugin `.ts` | người / LLM ❌ |
| — Codex | chưa có ([ADR-025](../todo/ADR-025-2026-08-26-ho-tro-codex-kenh-cai-thu-tu.md) ⚪, chặn ở Q1–Q3 §6) | — |
| **Khởi tạo dự án** | [`sdlc/SKILL.md:208`](../../src/router/skills/minipower-router/SKILL.md) "Thao tác agent khi init": 8 bước bằng chữ (copy 2 skeleton, ghi `profile.json` v2, sinh `AGENTS.md`+`CLAUDE.md`, tạo 6 folder `memory/{phase}/`, điền README) + checklist "Exit init" 5 gạch đầu dòng | **LLM 100%** ❌ |

Hai việc treo sẵn có đã trỏ đúng về đây, cả hai đều **chưa mở**:

- **ADR-022 QĐ-6** — *"`install.mjs` nâng cấp nhận `--with <module>` (đọc manifest QĐ-8); ai cần gì cài nấy"*; §6 ghi rõ là *"việc sau-đợt, trao đổi sau"*.
- **ADR-025 QĐ-6** — parity 4 kênh phải có test canh, và gợi ý *"nếu fragment Claude đang sinh-từ-SSOT qua `npm run gen` thì fragment Codex cũng sinh cùng đường"*.

Nguyên tắc thì repo đã có từ [ADR-020 QĐ-3](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md): *"cứng bằng máy, mềm bằng lời"* — thứ máy kiểm được mà không cần phán đoán thì đừng giao cho phán đoán. **ADR này không mở hướng mới; nó áp nguyên tắc sẵn có vào bề mặt duy nhất chưa được chạm.**

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | 3 kênh cài, **1 kênh có script** — Cursor/OpenCode vẫn là "đọc README rồi gõ tay 6–8 lệnh, tự merge JSON" | Sai lặng: symlink thiếu một rule, merge đè mất hook cũ của người dùng, path Windows escape sai — **không có gì FAIL** để phát hiện. Đúng lỗi mà `install.mjs` đã sinh ra để chữa cho riêng Claude |
| P2 | Bước 3–6 của init (copy `project-skeleton/` + `docs-skeleton/`, ghi `profile.json`, sinh 2 file persona, tạo 6 folder memory) **không có một dòng nào cần suy luận** nhưng đang giao cho LLM | Thiếu folder / lệch tên / quên `doc-debt.md` là chuyện xảy ra được và **im lặng**; kết quả init khác nhau giữa hai lần chạy cùng câu trả lời |
| P3 | "Exit init" là **checklist bằng chữ** trong SKILL.md | Không qua được phép thử của repo: *cái gì FAIL được bằng máy khi làm sai?* — hiện tại: **không gì cả** |
| P4 | Mỗi kênh mới (Codex là kênh thứ tư) = viết thêm một README quy trình tay + một cách merge riêng | Chi phí thêm kênh tuyến tính; parity giữa kênh dựa vào kỷ luật đọc README, trái ADR-020 QĐ-4 |
| P5 | Danh sách module (`sdlc`/`backend`/`ops`/`toolbox`, sắp có thứ năm ở [ADR-030](../doing/ADR-030-2026-08-29-mo-module-presales-skill-uoc-luong-ulnl.md)) **chưa có consumer nào đọc `PACK.md`** | `PACK.md` (ADR-022 QĐ-8) mới là manifest chờ người dùng; "ai cần gì cài nấy" vẫn là lời hứa |
| P6 | Ranh giới *LLM hỏi ↔ máy làm* **chưa được viết ở đâu** thành quy tắc | Mỗi lần thêm năng lực lại phải cãi lại từ đầu "cái này để agent làm hay viết script" |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **Không nền tảng thứ tư** ([ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md)) — CLI là **Node ESM plain, không build step, không dependency, Node ≥ 18**, cùng hệ với `hooks/`. Không thêm bundler, không thêm framework CLI |
| C2 | **SSOT ở giữa** — CLI là *consumer* của `rules.json` · `PACK.md` · fragment; nó **không** được chứa bản sao thứ hai của danh sách hook, danh sách module hay danh sách rule |
| C3 | [ADR-020 QĐ-4](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) — mọi kênh khai **cùng bộ 6 hook, cùng bộ guard**; parity phải có **test canh**, không dựa kỷ luật |
| C4 | **Triết lý bất biến** (AGENTS.md §Bối cảnh) — CLI **không** ra quyết định thay người: không tự chọn `project_mode`, không tự đoán câu trả lời thiếu, không tự sửa file đã tồn tại của người dùng. Tự động hoá dừng ở **thi hành**, không lấn sang **phán đoán** |
| C5 | **Không thêm điều kiện cứng dạng hook.** Bảy điều kiện cứng hiện hành giữ nguyên số lượng; `init --check` là **verifier gọi theo yêu cầu** (exit code), không phải hook chặn prompt |
| C6 | **Tương thích ngược** — bản đã cài bằng tay theo README cũ phải chạy lại CLI được mà không nhân đôi hook, không mất cấu hình riêng của người dùng (khuôn `stripMinipower` + `.bak` của `install.mjs` hiện tại) |
| C7 | **Windows là first-class** — repo đã có bug thật vì escape path (`D:\Working\…` → `\W`) và bug installer chết trên Windows (ADR-020 việc #4). Mọi đường dẫn qua `node:path`, mọi chèn vào JSON qua `JSON.stringify` |

## §4. Phương án — vị trí và hình dạng CLI

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | **Giữ per-channel** — viết thêm `install/cursor/install.mjs`, `install/opencode/install.mjs` | Thay đổi nhỏ nhất, mỗi script độc lập | 4 script × phần detect/merge/backup/verify **lặp 4 lần** → đúng thứ đã làm 4 bản guard `.py/.ps1/.sh/.ts` lệch nhau trước đây; parity lại dựa kỷ luật | ❌ |
| O2 | **Một CLI ở `sdlc/install/minipower.mjs`**, kênh hạ xuống **dữ liệu** (fragment + rule + bảng detect) | Một chỗ chứa logic; thêm kênh = thêm một entry dữ liệu, không thêm code; dùng lại nguyên `hooks/` package (test, Node, CI) đã có | Tên hơi lệch: installer cho cả `backend`/`ops` lại sống trong `sdlc/` — chấp nhận, vì `sdlc/` đã là module duy nhất ship hook và `install/` đã là bề mặt cài của cả repo | ✅ chọn |
| O3 | **Module/thư mục CLI mới ở root** (`installer/` hoặc `bin/`) | Tên sạch nhất theo ADR-022 QĐ-2 | Thêm top-level thứ sáu + package Node thứ hai để bảo trì; trái C1 và "co lại trước khi mở rộng". Không đáng cho ~400 dòng script | ❌ |
| O4 | Đưa vào `toolbox/` | Đúng nghĩa "công cụ" | Sai người dùng: `toolbox/` là công cụ **làm ra** minipower, chỉ cài trong repo này ([ADR-027](../doing/ADR-027-2026-08-28-module-toolbox-cong-cu-lam-ra-minipower.md)); installer phục vụ **người dùng cuối** ở dự án đích | ❌ |

*Ghi chú O2:* nếu sau này `sdlc/` tách repo ([cross-repo-bridge](../../contracts/cross-repo-bridge.md)) thì CLI đi cùng `sdlc/` — vẫn đúng, vì hook và skeleton cũng ở đó. Không cần dự phòng thêm.

## §5. Quyết định

### Ranh giới nền — hai lệnh, không nhập nhằng

Học đúng chỗ CodeGraph làm tốt: **wire công cụ** và **khởi tạo dữ liệu của một project** là hai lệnh khác nhau, tài liệu phải nói rõ lệnh này *không* làm việc kia.

| Lệnh | Làm gì | Chạy ở đâu | Bao nhiêu lần |
|---|---|---|---|
| `minipower install` | Wire skill + hook + rule của **module theo registry** vào **client người chọn** (một hoặc nhiều) | root dự án đích (`--target`) | lặp lại được — thêm client mới |
| `minipower init` | Dựng cấu trúc + `.minipower/` (cá nhân hoá + DB, [ADR-034](../done/ADR-034-2026-09-26-minipower-marker-always-on-dispatch.md)) từ câu trả lời **script** | root dự án đích | một lần / dự án (`--check` lặp) |

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Một CLI Node duy nhất, hai lệnh `install` và `init`.** Vị trí `sdlc/install/minipower.mjs` (O2). Node ESM, không dependency, Node ≥ 18 | Chủ repo 2026-09-26: **OK** |
| **QĐ-2** | **Script thi hành, hạn chế LLM.** Mọi `mkdir`/`cp`/ghi JSON/SQL/merge/symlink/verify = script. LLM không dựng cây, không ghi `.minipower/` | Chốt lại 2026-09-26: hỏi cũng bằng **readline/cờ**, không bằng model (QĐ-7) |
| **QĐ-3** | **Không tự dò client.** Người **chọn loại** (cursor · claude · opencode · …) — **được nhiều client một lệnh**. Chạy lại `install` để **thêm** client, không xoá client cũ (trừ khi `--uninstall`) | **Lật** bản 2026-09-01 (auto-detect). `--client cursor,claude` hoặc menu interactive. Không `--all` im lặng |
| **QĐ-4** | **Không hardcode list module trong CLI.** CLI đọc **module registry** sinh từ `*/PACK.md` (xem §5.1) — `--with`, `--list-modules` | Consumer ADR-022 QĐ-8. `toolbox` mặc định **off** trên dự án khách |
| **QĐ-5** | **Client IDE = dữ liệu, không phải nhánh code.** Mỗi *client* (Cursor/Claude/…) một entry: đích skill/rule, file config, cách merge. **Không** nhầm với **module kênh** `docs/` `tasks/` `chat/` `vcs/` (ADR-033) | File: `clients.json` (đổi tên khỏi `channels.json` để hết đụng chữ “kênh”) |
| **QĐ-6** | **Chạy lại an toàn:** lần 2 không nhân đôi hook; `.bak` trước khi đè khối minipower; `--check` chỉ kiểm, không ghi | Xem §5.2 |
| **QĐ-7** | **`init` = script hỏi + ghi.** `--interactive` (readline) là đường chính. `--answers` chỉ khi đã có file do người/script khác xuất. Thiếu trường → FAIL, không đệm LLM | Bỏ luồng “LLM hỏi 7 câu rồi mới gọi init” làm đường chính |
| **QĐ-8** | **`init --check` theo kiến trúc mới:** có `.minipower/` (file cá nhân hoá tối thiểu + DB mở được) · `profile.json` schema **v3** (ADR-033) · cây `docs/`/`memory/` theo skeleton · `doc-debt` khi `mvp`/`maintain` | Thay checklist chữ + schema v2 cũ |
| **QĐ-9** | **Skill init:** không `cp -R` bằng lời. Agent (nếu có) chỉ *nhắc gọi CLI* hoặc người tự chạy `minipower init`. Kế hoạch ADR-034: *Khởi tạo dự án …* → `minipower-router-init` → **bảng lệnh script**, người OK rồi CLI chạy | Không 8 bước LLM copy folder |
| **QĐ-10** | **CLI không phán đoán hộ người.** Không tự chọn `project_mode`, không viết nội dung FR/SAD, không đè README/AGENTS đã có, không đoán provider MCP | Xem §5.3 — khác với “chọn client” (QĐ-3): client là *cấu hình máy*, mode là *quyết định dự án* |
| **QĐ-11** | **Chưa `npm publish` / `npx minipower`.** Lệnh gọi bằng `node …/minipower.mjs`. Packaging = phân phối như Codegraph (`npx`) — **việc khác**, cần tên gói npm + ai publish | Không chặn local install. Mở ADR riêng khi cần phát hành |

### §5.1 Module registry (QĐ-4)

**Vấn đề:** glob `*/PACK.md` trong CLI vẫn là “danh sách ẩn” nếu path pack hardcode.

**Giải pháp (một SSOT, hai bước):**

1. Mỗi pack giữ `PACK.md` (schema [pack-manifest](../../contracts/pack-manifest.md)). Thêm khóa máy-đọc tuỳ chọn:

```yaml
install:
  default: true | false    # mặc định cài cho dự án khách? toolbox = false
  kind: role | channel | dispatcher | warehouse
```

2. `npm run gen` ghi `sdlc/hooks/lib/module-registry.json` (vùng generated): mảng `{ pack, path, repo, install.default, kind }`. CLI **chỉ** đọc file này + `--with` để lọc. Pack mới = thêm `PACK.md` + `gen` — **không sửa `minipower.mjs`**.

Test: xóa một pack khỏi registry giả → CLI `--list-modules` không còn tên đó; thêm `PACK.md` giả trong fixture → sau gen thì xuất hiện.

### §5.2 QĐ-6 — “idempotent / backup / verify” nghĩa là gì

Không phải thuật ngữ ẩn. Ba hành vi khi **chạy `install` lần 2, 3, …**:

| Từ | Việc máy làm | Nếu thiếu thì sao |
|---|---|---|
| Idempotent | Merge lần nữa **không** nhân đôi khối hook/rule minipower | File settings phình, hook chạy 2 lần |
| Backup | Copy `settings.json` → `settings.json.bak` **trước** khi ghi | Hỏng merge thì còn bản người dùng |
| Verify (`--check`) | Đọc config, báo thiếu shim/path — **exit 1**, không ghi | CI/người biết cài lệch mà không sợ bị đè |

### §5.3 QĐ-10 — “không tự động hoá phán đoán”

Script **được** làm: tạo folder, chép skeleton, ghi JSON đúng schema, wire client đã **chọn**.

Script **không được** làm (người phải trả lời / giữ file cũ):

- Chọn `mvp` vs `standard` vs `maintain`
- Viết nội dung DOC, FR, báo giá
- Đổi `README.md` dự án đã có
- Đoán `docs=outline` khi người chưa nói

Chọn Cursor+Claude (QĐ-3) **không** phải phán đoán nghiệp vụ — đó là “cài vào phần mềm nào trên máy này”.

### §5.4 QĐ-11 — packaging / `npx` dùng để làm gì

Hôm nay: clone repo factory, `node sdlc/install/minipower.mjs install --client cursor`.

`npx minipower` (như `npx codegraph`) = **không cần clone**, gõ một lệnh là có CLI. Cần: gói npm, version, quyền publish. **Chưa có** thì vẫn cài được bằng path. QĐ-11 chỉ **hoãn** bước phân phối, không hoãn CLI local.

### Hình dạng sau khi thi hành

```text
sdlc/install/
├── minipower.mjs              MỚI  — CLI: install | init
├── clients.json               MỚI  — dữ liệu client IDE (QĐ-5), không phải module kênh MCP
├── claude/
│   ├── install.mjs            shim mỏng → minipower.mjs install --client claude   (C6)
│   ├── settings.fragment.json (giữ — dữ liệu)
│   └── README.md              hạ xuống: tham chiếu + cách cài tay khi cần
├── cursor/{hooks.fragment.json, rules/*.mdc, README.md}     (giữ — dữ liệu)
├── opencode/{opencode.fragment.json, plugins/, rules/, README.md}
└── codex/                     chừa chỗ — mở khi ADR-025 chốt (entry `clients.json` + fragment)
```

```text
  người ──readline/cờ──> minipower init ──> cây + .minipower/ + profile v3
                              └── init --check ──> exit code (QĐ-8)
```

### §5.5 Confirm Q5 — “fragment” là gì, sinh từ `rules.json` nghĩa là gì

Khi `install` wire **Cursor / Claude / OpenCode**, nó không bịa hook. Nó **chép/merge một mẫu JSON/Markdown có sẵn** vào máy bạn, ví dụ:

- Cursor: `sdlc/install/cursor/hooks.fragment.json` — danh sách 6 lệnh hook (`token-guard`, `auto-routing`, …)
- Claude: `sdlc/install/claude/settings.fragment.json`
- OpenCode: tương tự

Đó gọi là **fragment** = mảnh cấu hình IDE. **Hôm nay các file này viết tay.** Ba file phải **cùng 6 hook, cùng thứ tự**. Lệch một file là một IDE chạy thiếu cổng.

`rules.json` là SSOT của **pipeline tài liệu** (DOC nào thuộc phase nào, mode mvp/standard…). Nó **không** đang chứa danh sách 6 hook IDE.

Hai cách làm:

| Cách | Việc | Ưu | Nhược |
|------|------|----|--------|
| **A — giữ viết tay** | `install` đọc 3 fragment như hiện có. Test `install-parity` FAIL nếu Cursor thiếu 1 hook mà Claude có | Làm CLI ngay, ít đụng generator | Thêm hook thứ 7 = sửa **tay 3 file** (vẫn có test bắt lệch) |
| **B — sinh từ SSOT** | Thêm danh sách hook vào `rules.json` (hoặc file dữ liệu một chỗ), `npm run gen` **ghi ra** 3 fragment. Không sửa fragment tay | Thêm hook = 1 chỗ | Phình đợt CLI: phải thiết kế schema + generator + sửa test gen. **Không** bắt buộc để `install` chạy được |

Câu hỏi Q5 chỉ là: **đợt viết CLI này làm A hay B?** Không phải “có hook hay không” — hook đã có. Đề xuất **A** để ship `install`/`init`; B tách việc (gần ADR-025 QĐ-6).

## §6. Confirm

### Chủ repo chốt trên bảng QĐ (2026-09-26)

QĐ-1 OK · QĐ-2 OK · QĐ-3 **không auto-detect**, chọn 1..n client, chạy lại để thêm · QĐ-4 đồng ý + **registry** (§5.1) · QĐ-5–6–10–11 **đã giải thích trong §5.2–5.4** · QĐ-7 script không LLM · QĐ-8/9 cập nhật kiến trúc 033/034.

### Câu §6 bản 2026-09-01

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ (bản đã điều chỉnh)? | **Có** — 2026-09-26, kèm lật QĐ-3 |
| Q2 | Vị trí CLI O2 `sdlc/install/minipower.mjs`? | **OK** |
| Q3 | `install` **symlink skill**? | **Có** — 2026-09-26. Fail (Windows không quyền) → copy + cảnh báo, không FAIL cả lệnh |
| Q4 | `init --interactive` làm Đợt B? | **Có** — đường chính (QĐ-7) |
| Q5 | Fragment viết tay hay `npm run gen`? | **B** — 2026-09-26. SSOT `rules.json` → `install_hooks`; `npm run gen` ghi fragment Claude/Cursor + `hooks.json` |
| Q6 | A rồi B hay liền? | **Liền hai đợt** — 2026-09-26. Không dừng nghiệm thu giữa `install` và `init` |

CLI: Confirm đủ. Sinh fragment (Q5 B) làm cùng đợt viết `minipower.mjs`.

## §7. Việc triển khai — hai đợt

### Đợt A — `install` (đóng ADR-022 QĐ-6)

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| A1 | `clients.json` — 3 client (claude · cursor · opencode): đích skill/rule, merge JSON | Diff README kênh ↔ entry = 0 | Q1, Q3 (symlink) |
| A2 | `minipower.mjs install` — **chọn client** (QĐ-3) · `--with` đọc **registry** (QĐ-4) · idempotent (QĐ-6) · `--check`/`--dry-run`/`--target` | Cài N client; lần 2 thêm client không xoá cái cũ; `--check` xanh | A1 |
| A3 | Hấp thụ `claude/install.mjs` → shim mỏng; giữ nguyên hành vi cờ cũ (`--check`, `--print`) | Lệnh cũ trong README/ADR-020 §8 vẫn chạy đúng | A2 |
| A4 | Mở rộng `install-parity.test.js` + thêm `install-cli.test.js` (T1·T4·T6) | Suite xanh; parity 3 kênh do **máy** canh, không do README | A2 |
| A5 | Viết lại 3 `README.md` kênh: lệnh CLI lên đầu, hướng dẫn tay xuống mục "khi không chạy được script"; cập nhật AGENTS.md §Build/Test/Run | `link:check` 0 gãy mới; không còn chỗ nào bảo người dùng merge JSON tay như **đường chính** | A2 |

### Đợt B — `init` (đóng P2/P3)

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| B1 | `init --interactive` + `--answers` (QĐ-7): skeleton · profile **v3** · **`.minipower/`** (034) · persona từ TPL | Hai lần cùng input → cùng cây | A5 (cùng đợt, không dừng) |
| B2 | `init --check` (QĐ-8) — `.minipower/` · profile v3 · cây skeleton · `doc-debt`; exit 0/1, in đúng cái thiếu | Xoá marker hoặc folder ⇒ FAIL đúng tên | B1 |
| B3 | Đường **init vào repo đã có sẵn** (SKILL.md mục riêng): không đè file tồn tại, chỉ liệt kê cái thiếu + đề nghị; tài liệu cũ → `assets/archive/` | Chạy trên repo có sẵn `README.md`/`AGENTS.md` ⇒ **không file nào bị sửa**, in danh sách thiếu | B1 |
| B4 | Viết lại `sdlc/SKILL.md` mục "Thao tác agent khi init" (8 bước → 3) + thay "Exit init" bằng `init --check` (QĐ-9); xoá đoạn `cp -R` tham chiếu | `router.test.js` + `skeleton.test.js` xanh; grep `cp -R "$MINIPOWER` = 0 hit trong SKILL.md | B2 |
| B5 | `init-cli.test.js` (T2·T5) + một dòng quy tắc QĐ-2 vào AGENTS.md | Suite xanh; quy tắc ranh giới có chỗ đứng cố định | B4 |

## §8. Xác minh (định nghĩa xong)

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | `install` hỏi client rồi thêm client khác | Cả hai; không nhân đôi | 🟡 wizard stdin unit 2026-09-26. Smoke 2 IDE máy chủ repo còn |
| T2 | Smoke | `init --answers` đủ trường, `init --check` | Cây + `.minipower/` + profile v3 | 🟢 unit. Interactive: stdin lựa chọn 🟢 2026-09-26 |
| T3 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới | xanh | 🟢 2026-09-26 gốc repo |
| T4 | Mới | Cùng 6 hook mọi client; lệch 1 hook ⇒ đỏ | | 🟢 `install_hooks` + `install-parity` + `gen:check` |
| T5 | Mới | `init --check` thiếu `.minipower/` | FAIL | 🟢 `install-cli.test.js` |
| T6 | Mới | Windows path JSON; symlink fail → copy | không crash | 🟡 CI matrix 3 OS cho hook; CLI copy-fallback có trong code, **chưa** case Windows riêng |
| T7 | Mới | `init` hỏi lựa chọn không LLM; `hooks/lib` không import CLI | | 🟢 stdin numbered options; CLI import `hooks/lib` một chiều |
| T8 | Smoke | `install` 3 lần; giữ hook người dùng | `.bak` · không nhân đôi | 🟡 unit 2 lần cursor. Merge Claude settings có sẵn **chưa** fixture riêng |

## Kết quả thi hành 2026-09-26

- `sdlc/install/minipower.mjs` — `install --client` (không dò) · `--with` registry · symlink/copy · `init --answers` / `--check` · ghi `.minipower/`
- `rules.json` `install_hooks` → `npm run gen` fragment Claude/Cursor + `hooks.json` + `module-registry.json`
- `claude/install.mjs` shim; `npm run minipower`; README/AGENTS lệnh CLI
- **Chưa:** packaging npx (QĐ-11) · Codex (ADR-025) · dời vào `cli/` (ADR-032)

Icon: 🟢 xong · 🟡 có sẵn, cần giữ xanh · 🔴 chưa có. **Không 🟢 Done khi còn T đỏ.**

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| **Tốt** | Cài đặt và khởi tạo **đúng 100% mỗi lần**, không phụ thuộc model/context — đúng điều chủ repo muốn. Cursor/OpenCode lên ngang Claude, hết P1. "Exit init" từ lời nói thành exit code, hết P3 |
| **Tốt** | Thêm kênh = thêm **entry dữ liệu**: [ADR-025](../todo/ADR-025-2026-08-26-ho-tro-codex-kenh-cai-thu-tu.md) rút gọn còn "đóng 4 ẩn số vòng thực nghiệm N", không phải viết installer riêng (P4) |
| **Tốt** | `PACK.md` có **consumer thật** đầu tiên (ADR-022 QĐ-8 thôi là lời hứa); module thứ năm của [ADR-030](../doing/ADR-030-2026-08-29-mo-module-presales-skill-uoc-luong-ulnl.md) cài được mà không sửa CLI (P5) |
| **Tốt** | Ranh giới *LLM hỏi ↔ script làm* có chỗ đứng cố định trong AGENTS.md — lần sau không phải cãi lại (P6) |
| **Xấu / chi phí** | Thêm **~400–500 dòng** Node phải bảo trì, và một bề mặt lỗi mới: CLI hỏng thì **cả 4 kênh** hỏng (trước đây hỏng lẻ từng kênh). Giảm thiểu bằng T1/T4/T8 + đường cài tay giữ trong README |
| **Xấu / chi phí** | `clients.json` mô tả IDE bên ngoài — client đổi format thì lệch âm thầm; phải smoke khi nâng IDE |
| **Trung lập** | Hai đợt A+B **làm liền** (Confirm Q6) — không còn trạng thái “install script / init vẫn LLM” kéo dài |
| **Trung lập** | Kênh **plugin** ([ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md)/[ADR-012](../todo/ADR-012-2026-07-26-minipower-cursor-plugin.md)) **không đổi** — plugin và CLI là hai đường cài song song, ADR-020 QĐ-4 vẫn buộc chúng cùng hành vi |
| **Trung lập** | Số điều kiện cứng **vẫn là 7** (C5) — `init --check` là verifier gọi theo yêu cầu, không phải hook thứ 7 |
