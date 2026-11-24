# Hỗ trợ OpenAI Codex CLI — kênh cài thứ tư, SSOT không đổi

| | |
|---|---|
| **Ngày** | 2026-08-26 |
| **Trạng thái** | đề xuất, chờ Confirm §6 |
| **Phạm vi** | Thêm adapter cài đặt cho **OpenAI Codex CLI** vào `sdlc/install/codex/`; mở rộng test parity từ 3 kênh → 4 kênh. Áp dụng cho cả skill lá-rời `backend/` · `ops/` (chỉ ở mức hướng dẫn symlink). |
| **Ngoài phạm vi** | Không đổi format SKILL.md, không đổi logic guard trong `hooks/lib/*.js`, không đổi `rules.json`. Không làm "plugin Codex" đóng gói (chưa có nhu cầu — tương tự phân biệt kênh settings vs plugin ở Claude, ADR-011). Không cài MCP/toolchain cho Codex (địa hạt ADR-022 QĐ-9). |
| **Nối tiếp** | [ADR-011](../done/ADR-011-2026-07-26-minipower-claude-code-plugin.md) (kênh Claude) · [ADR-012](../todo/ADR-012-2026-07-26-minipower-cursor-plugin.md) (kênh Cursor — khuôn "vòng thực nghiệm trước, wire sau") · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-4 (đồng bộ hành vi các kênh cài) · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-2/QĐ-4 (hệ tên) |
| **Mục đích** | Ghi lại quyết định: IDE/AI client chỉ là **tầng adapter đặc thù nền tảng**; thêm Codex là thêm một lớp glue mỏng, mọi logic hook · skill · rule · agent giữ nguyên SSOT hiện hành. |
| **Ảnh hưởng** | `sdlc/install/codex/` (mới) · `sdlc/hooks/test/install-parity.test.js` (mở rộng 4 kênh) · `sdlc/hooks/gen-agents-doc.js` (nếu fragment Codex sinh-từ-SSOT) · `AGENTS.md` §Build/Test (câu "ba kênh" → "bốn kênh") · `sdlc/README.md` dòng liệt kê client · `README.md` bản đồ repo |

---

## §1. Bối cảnh

Minipower hiện cài lên 3 client qua adapter trong `sdlc/install/`: **Cursor** (rules `.mdc` + `hooks/hooks.fragment.json`), **Claude Code** (`settings.fragment.json` + `install.mjs`, hoặc kênh plugin ADR-011), **OpenCode** (plugin TS + `opencode.fragment.json`). Cả ba tuân một bất biến: **logic guard sống một chỗ duy nhất `sdlc/hooks/lib/*.js`**, adapter chỉ là glue gọi 6 shim `hooks/bin/*.js` (5 `UserPromptSubmit` + 1 `PreToolUse` matcher `Read|Write|Edit`), có `install-parity.test.js` canh cả ba kênh khai cùng bộ guard (ADR-020 QĐ-4).

Đội bắt đầu có người dùng **OpenAI Codex CLI**. Khảo sát docs chính thức (developers.openai.com/codex → learn.chatgpt.com, **đọc 2026-08-26**) cho thấy Codex đã có đủ 3 bề mặt khớp kiến trúc hiện hành:

- **Hooks:** khai trong `hooks.json` (user-global `~/.codex/hooks.json` hoặc project `<repo>/.codex/hooks.json`) hoặc bảng `[hooks]` trong `config.toml`; event có `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `SessionStart`…; hook là **shell command**, chặn được (`decision: "block"` / exit code 2), chèn được context (`additionalContext`). Project-local hook chỉ chạy khi layer `.codex/` được **trust**.
- **Skills:** chuẩn `SKILL.md` frontmatter `name` + `description` (theo "open agent skills standard" — agentskills.io), quét tại `.agents/skills/` (repo) · `~/.agents/skills` (user). Trùng khớp format skill hiện có của repo (đã có test canh `name`/`description` — `backend-pack.test.js`, `ops-pack.test.js`).
- **Custom instructions:** Codex đọc `AGENTS.md` của dự án đích — trùng luôn convention repo này đang dùng.

Tức là về lý thuyết Codex "khớp ổ cắm" tốt hơn cả OpenCode (nơi phải viết plugin TS). Rủi ro còn lại nằm ở chi tiết chưa xác minh trên máy thật: **schema stdin/stdout của hook Codex có giống Claude Code không** (shim `bin/*.js` hiện đọc JSON kiểu Claude/Cursor), cơ chế trust `.codex/`, và symlink trên Windows.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Người dùng Codex chưa cài được Minipower — không guard, không routing, không skill | Làm việc "tay không", trái triết lý gatekeeper; mỗi người tự chế cách cài → lệch nhau |
| P2 | Nếu thêm Codex kiểu "chép logic sang cho nhanh" (fork guard, viết lại rule) sẽ sinh **nền tảng thứ tư phải bảo trì** | Vi phạm "co lại trước khi mở rộng" + ADR-020 QĐ-4; guard trôi lệch giữa các client theo thời gian |
| P3 | Test parity hiện hard-code 3 kênh; câu "ba kênh phải khai cùng bộ guard" nằm rải ở AGENTS.md, README | Thêm kênh mà quên mở rộng parity ⇒ máy không canh được kênh mới, chỉ còn kỷ luật con người |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **SSOT không mở lại:** logic guard = `hooks/lib/*.js`; bảng sinh-tự-động = `rules.json` (`npm run gen`); nội dung rule = `sdlc/agents/*.md`; skill = `SKILL.md` trong `sdlc/skills/` · `backend/skills/` · `ops/skills/`. Adapter Codex **không được chứa logic riêng** — chỉ glue (khuôn OpenCode: "plugin là glue mỏng, import thẳng lib"). |
| C2 | ADR-020 QĐ-4: mọi kênh cài khai **cùng bộ 6 hook, cùng bộ guard** — không kênh nào ít hơn hay khác hành vi; parity phải có test canh, không dựa kỷ luật. |
| C3 | ADR-022 QĐ-2/QĐ-4: hệ tên hai tầng — artefact adapter mang tiền tố `minipower-*`; không đổi tên/format skill hiện hữu vì Codex. |
| C4 | Yêu cầu runtime giữ nguyên: **Node ≥ 18**, không build step, không dependency. Codex gọi hook bằng shell command ⇒ vẫn là `node "…/hooks/bin/*.js"`. |
| C5 | Quyết định khác biệt nền tảng (schema stdin, trust model) phải **xác minh trên Codex thật trước khi wire** — khuôn "vòng V thực nghiệm" của ADR-012, không wire theo docs suông. |

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | **Chỉ AGENTS.md** — không hook, dặn agent "tuân rule" bằng lời | Rẻ nhất, không cần thực nghiệm | Mất toàn bộ điều kiện cứng (7 guard máy-kiểm thành lời khuyên) — trái "cứng bằng máy, mềm bằng lời" | ❌ |
| O2 | **Fork bộ hook riêng cho Codex** (viết lại theo schema Codex) | Chủ động format | Sinh nền tảng thứ tư, guard trôi lệch — đúng P2 | ❌ |
| O3 | **Adapter mỏng `install/codex/`** — hooks.json fragment gọi 6 shim dùng chung; nếu schema stdin lệch thì thêm **một shim chuyển đổi** ở tầng bin, lib không đổi; skill symlink theo chuẩn `.agents/skills/`; rules qua AGENTS.md | Đúng khuôn 3 kênh hiện có; chi phí ~1 fragment + 1 README + mở rộng parity | Phải một vòng thực nghiệm trên Codex thật trước khi wire | ✅ chọn |

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| QĐ-1 | **Codex là kênh cài thứ tư, ngang hàng — không phải nền tảng mới.** Tạo `sdlc/install/codex/` theo đúng khuôn 3 kênh hiện có: `README.md` (hướng dẫn cài từ root dự án đích) + fragment cấu hình + (nếu cần) rule bản địa hoá | Bất biến tầng: **SSOT ở giữa** (`hooks/lib` · `rules.json` · `agents/*.md` · `skills/*/SKILL.md`) — **adapter ở rìa** (`install/{cursor,claude,opencode,codex}/`). Mọi kênh tương lai (Windsurf, Zed…) theo cùng khuôn này; ADR-025 là tiền lệ, không cần ADR mới trừ khi client thiếu bề mặt hook/skill |
| QĐ-2 | **Hooks: `install/codex/hooks.fragment.json`** khai đủ **6 hook** (5 `UserPromptSubmit`: token-guard → auto-routing → profile-guard → prereq-gate → decision-staleness · 1 `PreToolUse` matcher Read/Write/Edit: baseline-guard), command = `node "…/sdlc/hooks/bin/*.js"` — **cùng shim, cùng thứ tự** với Claude/Cursor | Người dùng merge fragment vào `<repo>/.codex/hooks.json` (project-local, cần trust) — README ghi rõ bước trust. Nếu vòng thực nghiệm (QĐ-5) phát hiện schema stdin/stdout lệch Claude: viết **shim chuyển đổi** trong `hooks/bin/` (hoặc flag `--codex` trên shim hiện có) — `lib/*.js` tuyệt đối không đổi vì Codex (C1) |
| QĐ-3 | **Skills: symlink theo chuẩn `.agents/skills/`** — router-gộp: `.agents/skills/minipower-sdlc` → `sdlc/`; lá-rời `backend/` · `ops/`: symlink từng thư mục lá | Skill hiện hữu đã đúng format (frontmatter `name`+`description`, tiền tố `minipower-{module}-`) ⇒ **không sửa một SKILL.md nào**. Nếu Codex không nhận router-gộp qua symlink cả pack (như Claude nhận) → fallback: symlink từng skill phase, README ghi rõ |
| QĐ-4 | **Rules: đi qua AGENTS.md của dự án đích** — README hướng dẫn chèn một khối đánh dấu `<!-- BEGIN minipower rules -->…<!-- END -->` trỏ tới 3 rule (token-guard · profile · doc-editing); nội dung rule **không copy**, chỉ trỏ file trong pack | Codex không có cơ chế `.cursor/rules` riêng — AGENTS.md là bề mặt instructions chính thống của nó. Rule bản địa hoá (nếu cần lời văn khác) đặt `install/codex/rules/*.md` theo khuôn 3 kênh kia; phần lời chung vẫn lấy từ `sdlc/agents/*.md` |
| QĐ-5 | **Vòng thực nghiệm N trước khi wire** (khuôn ADR-012 vòng V) — trên Codex CLI thật, đóng 4 ẩn số: **N1** schema stdin/stdout hook (có giống Claude không; exit 2 có chặn không; `additionalContext` chèn được không) · **N2** skill discovery qua symlink (cả pack vs từng lá; Windows) · **N3** trust `.codex/` project-local · **N4** `UserPromptSubmit` có cho sửa/chèn prompt như auto-routing cần không | Kết quả N ghi thành mục "Điều chỉnh" trong ADR này. N1 xấu (schema quá lệch) → shim chuyển đổi; N4 xấu (không chèn được prompt) → auto-routing hạ xuống advisory (chỉ cảnh báo, không chèn) — ghi rõ trong README kênh, **không** hạ các kênh khác theo |
| QĐ-6 | **Parity 4 kênh có máy canh:** mở rộng `install-parity.test.js` — Codex fragment phải khai cùng bộ shim/guard với 3 kênh kia; nếu fragment Claude đang sinh-từ-SSOT qua `npm run gen` thì fragment Codex **cũng sinh cùng đường** | Sửa câu "Ba kênh phải khai cùng bộ guard" ở AGENTS.md → "Bốn kênh". Đụng generator ⇒ vòng bắt buộc `gen → test → gen:check` |

## §6. Confirm *(bắt buộc trước khi thi hành)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…QĐ-6? | |
| Q2 | Thứ tự làm: vòng thực nghiệm N (QĐ-5) trước, wire sau — hay chấp nhận wire theo docs rồi sửa? (đề xuất: **N trước**, đúng C5) | |
| Q3 | Skill lá-rời `backend/` · `ops/` cài cho Codex ngay trong đợt này, hay chỉ `sdlc` trước? (đề xuất: chỉ `sdlc` — lá-rời thêm sau bằng một mục README, không chặn) | |

Chốt xong: ghi ngày vào **Trạng thái** + cập nhật ghi chú index.

## §7. Việc triển khai

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| 1 | Vòng thực nghiệm N1–N4 trên Codex CLI thật (máy chủ repo) | 4 ẩn số có kết luận, ghi mục "Điều chỉnh yyyy-MM-dd" vào ADR | Q1, Q2 |
| 2 | Tạo `sdlc/install/codex/`: `README.md` + `hooks.fragment.json` (+ shim chuyển đổi nếu N1 đòi) | 6 hook khai đủ, README có bước trust + symlink 2 hệ điều hành + mục Kiểm tra + Bypass (khuôn README OpenCode) | Bước 1 |
| 3 | Mở rộng `install-parity.test.js` → 4 kênh; nối fragment Codex vào `npm run gen` nếu sinh-từ-SSOT | `npm test` + `gen:check` xanh | Bước 2 |
| 4 | Cập nhật văn bản: AGENTS.md ("ba kênh"→"bốn kênh"), `sdlc/README.md` (Cursor / Claude Code / OpenCode / Codex), `README.md` bản đồ | grep "ba kênh" hết hit lỗi thời; `link:check` 0 gãy mới | Bước 3 |
| 5 | Smoke trên dự án đích thật bằng Codex | Checklist Kiểm tra trong README kênh pass — **chủ repo tự chạy** | Bước 2 |

## §8. Xác minh (định nghĩa xong)

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Trên Codex: prompt thiếu scope → token-guard cảnh báo; đọc `docs/02-baseline/` → baseline-guard chặn; `/…minipower-sdlc` init → profile-guard dẫn init (chủ repo tự chạy) | Hành vi trùng Claude/Cursor | 🔴 |
| T2 | Mới | `install-parity.test.js` 4 kênh: kênh Codex thiếu 1 shim / lệch matcher → test đỏ | Máy canh parity, không kỷ luật tay | 🔴 |
| T3 | Regression | `npm test` + `npm run gen:check` + `npm run link:check` | Xanh, 0 gãy mới | 🟡 |
| T4 | Regression | Grep "ba kênh" / danh sách client trong AGENTS.md, README | Không còn chỗ nói 3 kênh như danh sách đóng | 🔴 |

Icon: 🟢 xong · 🟡 có sẵn, cần giữ xanh · 🔴 chưa có. **Không 🟢 Done khi còn T đỏ.**

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Người dùng Codex có đủ guard + skill + rule như 3 client kia; khuôn "SSOT ở giữa — adapter ở rìa" được phát biểu thành tiền lệ, client thứ 5 trở đi thêm rẻ; format skill trùng chuẩn agentskills.io ⇒ không nợ chuyển đổi |
| Xấu / chi phí | Thêm một kênh phải giữ xanh trong parity + một README phải bảo trì; hành vi phụ thuộc bề mặt hook Codex (docs còn mới, có thể đổi) — mỗi lần Codex đổi schema là việc của tầng adapter/shim, chấp nhận vì lib không đổi |
| Trung lập | Nếu N4 xấu, auto-routing trên Codex là advisory — kênh này "mềm" hơn Claude/Cursor một bậc; ghi rõ trong README kênh để người dùng biết mình đang thiếu gì |

---

*Nguồn ngoài (đọc 2026-08-26):* [Codex Hooks](https://developers.openai.com/codex/hooks) · [Codex Skills](https://developers.openai.com/codex/skills) · [AGENTS.md](https://developers.openai.com/codex/guides/agents-md) (redirect về learn.chatgpt.com).
