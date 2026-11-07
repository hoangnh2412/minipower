# Shared conventions — quy ước dùng chung (QUY ƯỚC)

**Trạng thái:** 🟡 Đang sống trong `sdlc/` (memory · decision-log · versioning · ownership); phần mở rộng prefix DEC theo vai (`DEC-BE-`…) **chưa áp dụng** — bật cùng pack code cắm vào spine.

Mọi pack — bất kể repo — "nói cùng ngôn ngữ". Đây là phần khiến agent ở pack A hiểu output của pack B mà không cần đọc lại từ đầu.

| Primitive | Nguồn (đã có) | Chuẩn chung |
|-----------|---------------|-------------|
| `memory/memory.md` | `sdlc` | Đọc **đầu phiên** (cá nhân, gitignore); DEC/open-Q phẳng cạnh đó |
| `decision-log.md` | [schema](../src/router/docs/decision-log.md) | Prefix ID mở rộng theo vai trò: `DEC-BE-`, `DEC-FE-`, `DEC-QA-`, `DEC-OPS-` (bên cạnh `DEC-DIS/REQ/ARC/PLN/DLV/CHG`) |
| Versioning | [doc-versioning](../src/router/docs-skeleton/00-governance/doc-versioning.md) | `Version` chỉ sau sign-off; trước đó `—` + Draft — áp cho mọi artifact có baseline |
| Ownership | [parallel-work.md](../src/router/docs/parallel-work.md) | Một module — một owner; một boundary — một producer |
| Anatomy skill | backend + sdlc | Mọi pack: `SKILL.md` (agent) + `README.md` (người) + `workflows/` + `templates/` |

## decision-log — schema chung

```text
### DEC-{ROLE|PHASE}-NNN — <tiêu đề> · [YYYY-MM-DD]
- Status: proposed | accepted | superseded-by DEC-xxx
- Context / Options / Decision / Why (loại B,C vì) / Consequences
- Trace: DOC-XX · {MOD}-FR-xxx · ADR-xxx · {MOD}-CMP-xxx
- Confidence: cao | vừa | thấp
```

Quyết định kiến trúc nặng → nâng lên ADR (DOC-09). Decision-log là bản nhẹ cho **mọi** pack.

## Bảo mật artifact — luật ứng xử của agent

Áp cho mọi pack, mọi kênh (ADR-041 QĐ-6). Đây là *cách làm* của agent khi tạo hoặc đẩy artifact — không thay convention bảo mật của từng bề mặt code (dự án giữ trong `docs/00-governance/`), không thay pentest.

| # | Luật | Chi tiết |
|---|------|----------|
| 1 | **Secret không vào artifact** | Token, mật khẩu, connection string, khoá API, nội dung `.env` không ghi vào `docs/`, `AGENTS.md`, `brainstorm/`, MR, commit message, chat. Ví dụ cấu hình: tên biến + placeholder (`<REDACTED>`, `VITE_API_BASE_URL`) |
| 2 | **Dữ liệu máy không commit** | `memory/memory.md`, `memory/profile.user.json`, `memory/trace.db`, SQLite trong `.minipower/` — chỉ local (đã gitignore trong skeleton) |
| 3 | **Dữ liệu giả trong artifact** | Log mẫu, screenshot, JSON / dòng ERD minh hoạ: synthetic. Không dùng dữ liệu khách thật; tên người trong ví dụ là `{Author}` / `Nguyễn Văn A (mẫu)` trừ khi đã đồng ý công bố |
| 4 | **Nguồn ngoài có kiểm soát** | Không copy danh bạ, chat, ticket từ MCP (L1) vào DOC khi người chưa chỉ đúng bản ghi và phạm vi |
| 5 | **L3 có chủ đích** | Push git, Outline, Lark, OpenProject, GitLab: một bảng L2 + người OK ([cổng L1–L3](../src/tasks/rules/l1-l2-l3-tasks.md)). Không đẩy secret hay PII thật ra ngoài máy |
| 6 | **Phát hiện secret trong repo** | Báo **vị trí** (file, dòng) — không paste giá trị vào chat / log; gợi ý rotate nếu đã lộ. Thấy secret trong diff → dừng, báo người |
| 7 | **Baseline bất biến** | `docs/02-baseline/` chỉ đọc — hook `baseline-guard` gác; sửa qua CR |

Cổng máy duy nhất ở đây là `baseline-guard` (7). Secret scan là việc CI của repo đích (gitleaks hoặc tương đương) — minipower không thêm hook; sáu luật còn lại là lời, người soát.

## Viết code — luật ứng xử của agent

Áp cho mọi pack sinh hoặc sửa code — backend · frontend · mobile · script ops · hook của chính minipower — mọi stack. Rút từ [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT, "lazy senior dev") và yêu cầu chủ repo 2026-10-29: giữ phần *cách làm*, **không** nhập cấp độ `lite/full/ultra` (minipower đã có phân tầng micro / light / full và Premise gate), **không** nhập số liệu benchmark. Toàn bộ là **lời**: không hook nào gác; `*-review` của pack soát, người quyết.

**Trước khi viết.** Đọc task và code nó chạm. Liệt kê mọi chỗ thay đổi phải với tới (caller, test, fixture, config, export) và cái nó có thể phá (dữ liệu mất hay lộ, caller ngừng chạy). Đó là phạm vi — tính năng thêm không phải.

**Thang chọn giải pháp — lấy bậc đầu tiên chạy trọn:**

| Bậc | Câu hỏi | Nếu có |
|---|---|---|
| 1 | Có cần tồn tại không? | Bỏ tính năng / tuỳ chọn / độ linh hoạt không ai yêu cầu, **nêu tên trong một dòng** để người quyết. Yêu cầu mơ hồ ⇒ bản nhỏ nhất làm được việc lõi |
| 2 | Codebase đã có chưa (helper, component, service, pattern)? | Dùng theo cách code xung quanh đang dùng |
| 3 | Thư viện chuẩn / tính năng nền tảng? | Dùng — trừ khi dự án có bản riêng (component của kit thắng widget native) |
| 4 | Dependency đã cài? | Dùng; **không** thêm dependency cho vài dòng |
| 5 | Một dòng đọc là hiểu? | Một dòng — một dòng phải giải mã thì không phải ngắn |
| 6 | Còn lại | Code tối thiểu chạy được |

| # | Luật | Chi tiết |
|---|------|----------|
| 1 | **Không tự thêm fallback** | Không viết logic dự phòng khi người **chưa đồng ý**: giá trị mặc định im lặng, `catch` rồi đi tiếp, rẽ sang nguồn / provider / đường khác khi đường chính hỏng, hardcode thay cho cấu hình thiếu, retry tự chế. Thiếu điều kiện ⇒ **fail rõ** (lỗi có mã, log, trả lỗi) và đưa vào **lượt hỏi trọn gói**. Người OK ⇒ fallback thành quyết định có ghi (DEC hoặc comment `shortcut:`). Fallback đã nằm trong convention / thiết kế đã chốt (ví dụ câu thông báo dự phòng của `getErrorMessage`) là đã có đồng ý |
| 2 | **Lười giải pháp, không lười thay đổi** | Làm trọn mọi phần task cần: caller, test, fixture mà thay đổi làm vỡ. Sửa bug: grep mọi caller trước, sửa gốc **một lần** ở code dùng chung |
| 3 | **Không "để sau"** | Không abstraction, wrapper, chuyển kiểu, option, config, boilerplate không ai yêu cầu. Giữ giá trị ở dạng nền tảng đưa. Xoá thắng thêm. Giữ layer / interface / convention codebase đang có |
| 4 | **Code chuyển đi giữ nguyên kiểm tra** | Code move / merge giữ error handling và validation. Hai phương án bằng nhau ⇒ chọn bản đúng ở biên |
| 5 | **Logic mới có kiểm chứng** | Nhánh, vòng lặp, parser, tiền, bảo mật, script / app mới ⇒ để lại **một test nhỏ** hoặc assert tự kiểm. Đổi tầm thường thì không |
| 6 | **Đường tắt có nhãn** | Giới hạn đã biết ⇒ comment đúng dạng `shortcut: <giới hạn>, <khi nào nâng>` — `grep -rn "shortcut:"` là sổ nợ kỹ thuật có địa chỉ |
| 7 | **Kết thúc lượt bằng nợ và rủi ro** | Một–hai dòng: đã bỏ qua / chưa kiểm gì, rủi ro người phải biết |

**Không bao giờ cắt:** validation ở biên tin cậy, error handling chống mất dữ liệu, bảo mật, accessibility, hiệu chuẩn mà phần cứng thật cần, và bất cứ gì người đã yêu cầu. Comment chỉ nêu *tại sao* mà code không tự nói được, một dòng.

---

*Liên quan:* [trace-spine.md](trace-spine.md) (ID) · [pack-manifest.md](pack-manifest.md) (khai `memory:` namespace)
