# Cài Minipower — Claude Code (skill + rules + hooks)

Chạy từ **root workspace project docs**. `$REPO` là gốc repo factory; `$MP` là `$REPO/src/router` (hook và agents).

## Đăng ký skill (để gõ `/minipower-router`)

Claude Code nhận skill tại **`.claude/skills/{tên}/SKILL.md`**. Symlink `$MP` vào `.claude/skills/minipower-router` để neo hook. `SKILL.md` gốc pack là kho. Dispatcher là lá `minipower-router` (CLI `install` symlink từng lá).

```bash
REPO=/path/to/minipower
MP=$REPO/src/router
mkdir -p .claude/skills
ln -snf "$MP" .claude/skills/minipower-router

# Kiểm tra
test -f .claude/skills/minipower-router/SKILL.md && echo "OK"
```

```powershell
$REPO = "D:\path\to\minipower"
$MP = "$REPO\src\sdlc"
New-Item -ItemType Directory -Force -Path .claude\skills
New-Item -ItemType SymbolicLink -Force -Path .claude\skills\minipower-router -Target $MP
```

> Skill con trong `skills/` **không** hiện thành `/` riêng — auto-routing tự chọn phase theo intent, không phải lỗi. Gọi phase con qua `Phase:` hoặc `@skills/{phase}/SKILL.md`.

## Cài bằng plugin (tùy chọn — gộp skill + hook)

Thay cho symlink skill + wire hook thủ công, có thể nạp cả pack như **plugin**. Gốc plugin = `src/router/`, manifest ở `.claude-plugin/plugin.json`.

```bash
# Dev/local — không cần marketplace
claude --plugin-dir /path/to/minipower/src/router
```

- **Skill namespaced:** gọi `/minipower:discovery`, `/minipower:doc-review`, … (không phải `/minipower-router` gọn như đường project-skill ở trên).
- **Hook tự nạp** từ `hooks/hooks.json` (sinh từ `settings.fragment.json` qua `npm run gen`). **KHÔNG** chạy `install.mjs` khi đã dùng plugin — nếu không hook chạy **hai lần** (settings + plugin).
- **Không còn phải tự thêm `permissions.deny`** (ADR-020 QĐ-4). Trước đây plugin không mang được `permissions.deny` nên phải chép tay 2 dòng vào `.claude/settings.json` — nay `bin/baseline-guard.js` cưỡng chế việc đó ở **cả hai kênh**, nên plugin và settings hành xử **giống hệt nhau**. Nếu bản cài cũ của bạn còn 2 dòng deny thì để nguyên cũng được (trùng chức năng, vô hại), xoá cũng được.

> Chọn **một** kênh: **project-skill + install.mjs** (mục dưới) *hoặc* **plugin** — đừng dùng cả hai, tránh trùng skill/hook.

## Lời nhắc

`AGENTS.md` và `CLAUDE.md` cùng một thân, viết từ [SAMPLE-agents.md](../../src/router/templates/SAMPLE-agents.md). Không symlink rule lặp slice / sửa DOC / profile.

## Permissions + hooks (tuỳ chọn)

**Khuyên dùng — script tự cài + verify** (thay find & replace tay, ADR R5). Đứng ở **root project docs** (nơi có/định tạo `.claude/settings.json`):

```bash
REPO=/path/to/minipower
MP=$REPO/src/router
node "$REPO/cli/claude/install.mjs"          # resolve path + merge + smoke-test 4 shim
# node "$REPO/cli/claude/install.mjs" --check  # chỉ verify shim, không ghi
# node "$REPO/cli/claude/install.mjs" --print  # in JSON đã resolve ra stdout
```

Script tự suy path pack (không cần gõ), **merge an toàn**: giữ nguyên hook/permission khác của bạn, idempotent (chạy lại không nhân đôi), backup `.claude/settings.json.bak` trước khi ghi đè, và **verify** bằng cách chạy thật 6 shim dưới `node` hiện tại. Yêu cầu **Node ≥ 18**.

Fragment gồm:

- **`hooks.UserPromptSubmit`** — token-guard → auto-routing → profile-guard → **prereq-gate** → decision-staleness (cùng logic Cursor).
- **`hooks.PreToolUse`** (`Read|Write|Edit`) — **baseline-guard**: chặn `02-baseline/` ở mọi mode, `_legacy/` trừ mode `maintain`.
- **Không còn `permissions.deny`** — dồn về `baseline-guard` để plugin và settings cùng hành vi (ADR-020 QĐ-4).

> Cài tay: vẫn merge [settings.fragment.json](settings.fragment.json) rồi thay mọi `/ABSOLUTE/PATH/TO/minipower/src/router` bằng path thật. Script ở trên làm đúng việc đó, có kiểm tra.

Tất cả gọi `node "…/src/router/hooks/bin/*.js"` — **một implementation dùng chung** với Cursor/OpenCode ([hooks/lib/*.js](../../src/router/hooks/)). Yêu cầu: **Node ≥ 18** + `git` (cho staleness). **Không còn cần `python3`**; bản `.sh`/`.ps1` cũ đã bỏ.

> Trước đây chỉ `SessionStart` (staleness) được wire, 2 prompt-guard là file chết. Nay wire đủ; staleness chuyển sang keyword-gated trên `UserPromptSubmit` như Cursor.

Chạy staleness thủ công bất kỳ lúc nào:

```bash
REPO=/path/to/minipower
MP=$REPO/src/router
echo '{"prompt":"đánh giá lại quyết định"}' | node "$MP/hooks/bin/decision-staleness.js"   # từ root dự án
```

Kiểm tra: `/memory` — thấy minipower rules.
