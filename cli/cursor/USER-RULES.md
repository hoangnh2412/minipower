# Always-on Cursor — User Rules (toàn máy)

Agent Chat trên Cursor **không luôn đọc** `~/.cursor/rules/*.mdc` (file CLI ghi). Chủ repo **chấp nhận setup thủ công** (2026-09-26, smoke T5 PASS): dán always-on vào **User Rules**.

Nguồn chữ: mọi file trong [`rules/`](rules/) (`minipower-always-on.mdc`, `codegraph-when-indexed.mdc`, …). `install --print-user-rules` in **ghép** tất cả `.mdc` — dán một lần vào User Rules (hoặc dán từng file nếu Cursor tách rule).

## Cài

Cursor **không** có CLI ghi ô User Rules (sync cloud từ ~0.50). `minipower install` chỉ ghi `~/.cursor/rules/` trên máy — Agent Chat có thể bỏ qua.

**Copy rồi dán Settings** (một lệnh + một lần dán):

```bash
# macOS
node cli/minipower.mjs install --print-user-rules | pbcopy

# Linux (xclip)
node cli/minipower.mjs install --print-user-rules | xclip -selection clipboard

# Windows PowerShell
node cli/minipower.mjs install --print-user-rules | Set-Clipboard
```

Rồi: Settings → Rules → **User Rules** → dán → lưu → New Agent chat.

Không ghi `state.vscdb` / cloud account bằng script (Cursor đè lại, không ổn định).

## Kiểm tra

**T5 — không marker** (bắt buộc để User Rules có nghĩa)

1. **File → Open Folder** chỉ một thư mục trống (không `.minipower/`, không mở kèm sample/factory).
2. **New Agent chat** (không tiếp thread Minipower).
3. Prompt: `Viết FR cho module ORD`

Pass:

- Không `Sẽ chạy minipower-*`
- Không bảng DOC-03/`standard`/readiness-gate
- Xin mô tả nghiệp vụ **hoặc** viết FR thường
- Tối đa một dòng: muốn Minipower thì `minipower init` trên folder đang mở

Fail: Phase requirements, DOC-06, mode mặc định `standard` → User Rules chưa vào phiên (sai ô, chat cũ, hoặc nhiều root).

**T6 — có marker** (sau `install` + `init` trên sample)

1. Mở **đúng** folder sample (có `.minipower/`).
2. New chat. Prompt: `Tóm tắt task Lark` (hoặc việc khác).

Pass: một dòng `Sẽ chạy minipower-…` rồi SOP pack đó. `tasks_provider: none` → không gọi Lark MCP.
