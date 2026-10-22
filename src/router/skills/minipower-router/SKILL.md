---
name: minipower-router
description: Phân loại intent Minipower rồi gợi ý đúng một pack nghề hoặc kênh. Dùng khi làm gì tiếp, chọn skill, dispatcher, không biết mở pack nào — không tự gọi MCP L3, không spawn agent.
metadata:
  workflow: github
---

# minipower-router

Dispatcher, không orchestrator runtime. **Route = LLM** (ADR-034 QĐ-4). Keyword [`intent-dispatch.js`](../../lib/intent-dispatch.js) chỉ gợi ý / test vàng — *Khởi tạo dự án sample* → lá init **để nhắc CLI**, không để LLM ghi profile.

## Cách chọn lá

1. Đọc catalog lá đã cài (`minipower-*`, `name:` trong SKILL.md).
2. LLM chọn **đúng một** lá khớp việc (đúng pack + đúng capability). Không bịa tên.
3. **Thông báo rồi mới đọc SOP:**

   `Sẽ chạy \`minipower-…\` để xử lý {việc}.`

4. Việc nhiều bước: kế hoạch, **chờ người OK** rồi mới làm. Không spawn pack thứ hai. Không L3 hộ nghề.

Hai lá ngang nhau → hỏi người.

Bảng dưới là **gợi ý pack** khi LLM định hướng, không phải matcher máy thay bước 2.

## Gợi ý pack (một phiên = một pack)

| Intent (gõ) | Pack / skill |
|---|---|
| init project, khởi tạo, project_mode | `minipower-router-init` |
| premise, có nên làm, nghị luận | `minipower-router-deliberation` |
| soát tiền đề trước code/test/deploy | `minipower-router-readiness` |
| khảo sát, DOC-01/02/03, painpoint | `discovery/` |
| UC FR BR AC SRS NFR prototype CR nội dung | `analyst/` |
| SAD ADR API data integration giải pháp bán SOL | `architecture/` |
| WBS kế hoạch rủi ro ticket CR | `pm/` |
| registry họp nhắc thiếu publish chỉ đạo kênh | `support/` |
| test strategy TEST autotest | `qa/` |
| DOC-17 deploy incident metrics | `ops/` |
| báo giá ULNL estimate quotation trước ký | `presales/` |
| Outline wiki publish docs | `docs/` |
| task Lark / OpenProject | `tasks/` |
| tin nhắn Slack/Lark | `chat/` |
| MR GitLab commit push | `vcs/` |
| code .NET Jarvis | `backend/` |
| code React kit `@platform/core` | `frontend/` |
| as-built / maintain legacy | `minipower-architecture-as-built` |

Thiếu input tối thiểu của pack → **hỏi một lượt**, không bịa, không làm hộ pack trước (QĐ-19).

## Gọi chung

Người không cần nhớ tên lá. Prompt kiểu *minipower* · *làm gì tiếp* · mô tả việc trong Agent là đủ.

1. LLM map việc → **một** lá catalog (bảng pack chỉ định hướng).
2. **Thông báo** — một dòng `Sẽ chạy \`minipower-…\` để xử lý {việc}.`
3. Đọc `SKILL.md` của đúng lá. Không spawn pack thứ hai. Không L3 hộ nghề.

Loader Cursor có thể tự gắn lá theo `description`; dispatcher vẫn bắt buộc bước 2.

## Phân tầng công việc (micro / light / full)

**Chi phí tương xứng:** không phải việc nào cũng qua đủ gate. Trước khi áp workflow, tự phân tầng — **hook token-guard đã hạ cảnh báo cho micro rõ ràng và có thể tiêm gợi ý "[Minipower tier]"; nhưng verdict cuối là của bạn** (hook chỉ đoán bề mặt).

**Phép thử:** *việc này có đổi nội dung/quyết định, hay ảnh hưởng DOC khác không?* Không → micro. Đổi nội dung trong DOC đã có → light. Cấu trúc/quyết định mới, hoặc đụng baseline → full.

| Gate | Micro | Light | Full |
|------|:---:|:---:|:---:|
| Ví dụ | typo, format, đổi version, thêm 1 dòng đã soạn | sửa/thêm 1 FR, cập nhật 1 section | module/DOC mới, đổi kiến trúc, trước baseline |
| Khai `Phase:` | không cần | ✅ | ✅ |
| Token-guard scope (Phase+Module+DOC) | bỏ qua | ✅ | ✅ |
| [minipower-router-deliberation](../minipower-router-deliberation/SKILL.md) Premise Check | ❌ | ❌ | ✅ |
| `minipower-*-review` trong pack nghề | ❌ | ⚠ khuyến nghị | ✅ (người ký) |
| `decision-log.md` | ❌ | chỉ khi có quyết định thật | ✅ |
| Verdict gate (PROCEED/PASS) | ❌ | ❌ | ✅ |

**Ràng buộc cứng — không tầng nào phá được:**
- `discovery` (scope dự án mới) và `change-control` (CR sau baseline) **luôn Full**.
- Đụng `docs/02-baseline/` → **luôn Full**; baseline-guard chặn baseline ở **mọi** tầng và **mọi** chế độ.
- Không chắc micro hay light → chọn **light** (an toàn hơn: micro sai bỏ mất gate).

## Chế độ dự án (`project_mode`)

**Chiều thứ hai, độc lập với phân tầng.** Tầng (micro/light/full) hỏi *"việc này to hay nhỏ"*; chế độ hỏi *"dự án này cần bao nhiêu tài liệu"*. Chế độ sống ở `memory/profile.json`, hỏi khi init (câu 6), đổi được nhưng phải kèm DEC.

<!-- BEGIN generated: project-modes (nguồn: hooks/lib/rules.json — chạy `npm run gen`) -->

| Chế độ | Tình huống | DOC cần điền (`docs_focus`) | prereq | `02-baseline` | `_legacy` |
|--------|------------|------------------------------|:------:|:-------------:|:---------:|
| **Chuẩn chỉnh** (`standard`) | Sản phẩm mới / outsource; hoặc MVP lên đời | **tất cả 19 DOC** | block | deny | deny |
| **MVP** (`mvp`) | Chỉ cần chạy được, tài liệu cơ bản | DOC-01, 03, 06–07, 09, 17 | warn | deny | deny |
| **Maintain legacy** (`maintain`) | Hệ chạy nhiều năm, tài liệu cũ rời rạc | DOC-04, 08–12, 17–18 | warn | deny | allow |

<!-- END generated: project-modes -->

**Một cấu trúc folder cho cả 3 chế độ.** Init luôn copy **đủ** 7 folder `docs/` + 6 folder `memory/` ở **mọi** chế độ; folder chưa dùng thì để rỗng kèm README nêu lý do. Chế độ chỉ đổi *điền gì trước*, **không** cắt khung — nhờ vậy `mvp`/`maintain` lên `standard` **không có bước di trú cấu trúc**, chỉ điền tiếp.

**Chế độ × tầng:**

| | `mvp` | `standard` | `maintain` |
|---|---|---|---|
| Tầng mặc định | light | full | light (theo vùng chạm) |
| Trần tầng | full khi đụng baseline | — | full khi đụng baseline |
| `prereq-gate` thiếu DOC | nhắc, vẫn chạy | **chặn** — gõ `BYPASS` để đi tiếp | nhắc, vẫn chạy |
| doc-review | rút chiều | đủ 5 chiều, ≥3 góc nhìn | chỉ vùng chạm |
| Nợ tài liệu | ghi `memory/doc-debt.md` | — | điền dần theo vùng chạm |

**ID ổn định (`{MOD}-FR-`, `DEC-`, `ADR-`) dùng từ ngày đầu ở CẢ 3 chế độ** — rẻ lúc viết, và là thứ khiến bước lên `standard` khả thi.

> Chế độ **không** nới hai thứ: `docs/02-baseline/` luôn deny, và `token-guard` luôn chặn `@` cả thư mục.

## Cursor — hooks (`profile-guard`, …)

`minipower install --client cursor` ghi `.cursor/hooks.json` gọi:

`node .cursor/skills/minipower-router/hooks/bin/*.js`

**`.cursor/skills/minipower-router` phải trỏ cả pack `src/router/`** (có `hooks/`, `lib/`, `templates/`), **không** chỉ folder lá skill (`skills/minipower-router/` — chỉ `SKILL.md`).

CLI: sau `installSkills`, symlink `sdlcLinkName` → factory `src/router`. Kiểm tra: `test -f .cursor/skills/minipower-router/hooks/bin/profile-guard.js`.

Hướng dẫn người: [README.md](README.md) · [cli/cursor/README.md](../../../../cli/cursor/README.md).
