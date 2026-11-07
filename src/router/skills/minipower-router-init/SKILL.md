---
name: minipower-router-init
description: Init dự án bằng CLI minipower init, không phỏng vấn LLM. Đã có .minipower thì nói CLI đã xong. Chưa có thì in lệnh init. Dùng khi init project, khởi tạo dự án — support không init.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-router-init

**Không** thuộc support (QĐ-14). **Ghi cây + profile = CLI** `minipower init`. **`AGENTS.md`:** init không ghi. CLI in prompt (đường dẫn `templates/SAMPLE-agents.md` + số liệu profile). Người dán prompt vào chat để AI viết file. Skill **không** mkdir, **không** hỏi 7 câu, **không** ghi `profile.json` / `profile.user.json`, **không** tự viết `AGENTS.md`.

## Đã có `.minipower/`

Một đoạn: init đã chạy bằng script; SSOT là `memory/profile.json`. **`project_mode` / provider chỉ lấy từ file đó** — bảng hay ví dụ trong `AGENTS.md` (kể cả chữ `standard`) không phải cấu hình hiện hành; **không** hỏi “giữ mvp hay standard”.

Muốn sửa cấu hình → người chạy lại `minipower init`. Dừng. Shim: `node .minipower/bin/minipower`. Nếu shim còn trỏ `sdlc/install/minipower.mjs` → người chạy `minipower install` (CLI factory mới ghi `cli/minipower.mjs`).

## Chưa có marker

```text
node <factory>/cli/minipower.mjs init
# sau install:  node .minipower/bin/minipower init
```

CLI hỏi từng bước, kể cả bề mặt (`docs` mặc định; `backend` / `frontend` / `mobile` / `autotest` chọn thêm — chỉ folder + README). Thiếu trường → CLI FAIL, **không** đệm bằng LLM.

Hướng dẫn người: [README.md](README.md).
