# Đưa convention code & thiết kế của dự án đích vào Minipower — tách tầng chung / tầng sản phẩm

| | |
|---|---|
| **Ngày** | 2026-10-22 |
| **Trạng thái** | 🟡 Doing — **chủ repo chốt QĐ-1…12 ngày 2026-10-22** (§5b); **thi hành §7 bước 1–9 cùng ngày**, T1 xanh. Còn T2 / T3 / T7 (smoke trên solution và dự án thật) — chủ repo tự chạy. Không đụng `rules.json`, không template mới, không mã DOC mới; `staging/convention/` để nguyên (QĐ-8 hoãn) |
| **Phạm vi** | Chín convention trong `docs/00-governance/` của dự án e-invoice (DOC-20 UI · DOC-21 backend · DOC-22 database · DOC-23 API · DOC-24 frontend · DOC-25 security · DOC-26 mobile · DOC-27 soạn tài liệu · `openproject-convention.md` — tự khai DOC-24, **trùng số** với frontend): tách phần **chung cho mọi dự án Jarvis** đưa vào skill / template / contract của minipower; phần **đặc thù sản phẩm** ở lại dự án. **Không** cấp mã DOC cho convention (QĐ-2/3 bỏ — convention là tài liệu chung, không phải deliverable) |
| **Ngoài phạm vi** | Kết nối / schema MCP OpenProject (đã có [tasks-openproject](../../src/tasks/skills/minipower-tasks-openproject/SKILL.md)) · backlog POC và custom field của instance `vna-invoice` · hai convention con `design-database-catalog-master-convention.md` + `design-database-history-convention.md` (nghiệp vụ danh mục / lịch sử giá trị — đặc thù sản phẩm) · mở module `mobile/` · hook cứng mới trong minipower · sửa kit `@platform/core` hay framework Jarvis · nội dung nghiệp vụ e-invoice (họ mã `CQT-`, màu LA, tham chiếu M-Invoice) |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1 (Role Intelligence Layer — giữ cách làm, không giữ dữ liệu) · QĐ-7 (3 câu hỏi) · [ADR-028](ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) (`staging/` chỉ rút không nạp) · [ADR-029](ADR-029-2026-08-28-skill-architecture-dotnet-thay-foundation-application.md) QĐ-7 (convention = *code viết thế nào*, architecture = *file ở đâu*) · QĐ-12 (nguồn chân lý kiến trúc = Jarvis `develop`) · [ADR-038](../done/ADR-038-2026-09-26-init-be-mat-docs-va-code.md) (`project_surfaces`) · [ADR-040](ADR-040-2026-10-03-mo-module-frontend-kit-platform-core.md) (frontend theo kit) |
| **Mục đích** | Ghi lại vì sao không chép nguyên văn 7 file vào minipower, ranh giới tầng chung / tầng sản phẩm, chỗ nào thành cổng máy ở repo đích, và ba điểm hai bên đang nói ngược nhau phải chốt trước |
| **Ảnh hưởng (khi accepted)** | [DOC-11](../../src/architecture/templates/DOC-11-data-model.md) + [DOC-12](../../src/architecture/templates/DOC-12-api-specification.md) (sửa) · [backend-convention](../../src/backend/skills/minipower-backend-convention-dotnet/SKILL.md) + [reference](../../src/backend/skills/minipower-backend-convention-dotnet/reference/coding-convention.md) · [backend-architecture](../../src/backend/skills/minipower-backend-architecture-dotnet/SKILL.md) · [architecture-review](../../src/architecture/skills/minipower-architecture-review/SKILL.md) · [architecture-sad](../../src/architecture/skills/minipower-architecture-sad/SKILL.md) · [frontend-convention](../../src/frontend/skills/minipower-frontend-convention-react/SKILL.md) + [frontend-review](../../src/frontend/skills/minipower-frontend-review-react/SKILL.md) · [lingua-franca](../../contracts/lingua-franca.md) · [docs-skeleton `00-governance/`](../../src/router/docs-skeleton/00-governance) (`doc-versioning.md` + `business-glossary.md` sửa, **không file mới**) · prompt AGENTS trong [INIT.md](../../src/router/project-skeleton/INIT.md) · [pm-plan](../../src/pm/skills/minipower-pm-plan/SKILL.md) (reference work-breakdown) · [tasks-openproject](../../src/tasks/skills/minipower-tasks-openproject/SKILL.md) (reference mapping + con trỏ ở L2) · test canh catalog + link. **Không đụng:** `rules.json`, `staging/`, `templates/DOC-2x` |

---

## §1. Bối cảnh

Dự án e-invoice (`documents/docs/00-governance/`, ngoài repo này) đã viết 7 convention, mỗi file một bảng nguyên tắc có ID (`P-BE-`, `P-FE-`, `P-API-`, `P-DB-`, `P-SEC-`, `P-MOB-SEC-`, `P-01…14` cho UI), mục *Cứng và mềm* và *Traceability* chéo nhau. Chúng tự khai mã **DOC-20…26** — nối tiếp dãy DOC-01…19 của minipower.

Hai file thêm sau rà đợt đầu (2026-10-22): `docs-authoring-convention.md` (DOC-27, mới viết cùng ngày) và `openproject-convention.md` (PM, 2026-10-10). DOC-27 **chép lại luật của chính minipower** — khuôn ID (trace-spine), DEC `proposed/accepted/superseded-by` (lingua-franca), version `—` trước sign-off (doc-versioning skeleton), H1–H6 (handoff), làm song song (parallel-work), status DOC (glossary §1), tên skill `minipower-{module}-{capability}` — thành 9 dòng `P-DOC-` cho người soạn đọc một chỗ. Dự án cũng đã **sửa file skeleton** `doc-versioning.md`: thêm §6 *Bảo mật tài liệu* (P-DOC-SEC-01…07). File OpenProject chuyển ngữ SOP-42 / workflow LLA-SW-WF-V7.2 sang work package: 7 loại WP, sản phẩm vs hoạt động, log giờ đúng cấp, estimate không đếm đôi, sprint/version — và **tự đánh số DOC-24**, trùng với `coding-frontend-convention.md`.

Dự án **đã coi minipower là tầng dưới**: `coding-backend-convention.md` §11 trỏ thẳng `.cursor/skills/minipower-backend-{convention,architecture,review}-dotnet` và dựng "cổng commit" gọi `review-dotnet` trước `git commit`. Tức là mô hình Role Intelligence Layer (ADR-022 QĐ-1) đang chạy đúng chiều: minipower giữ *cách làm*, dự án giữ *luật riêng*.

Ngày 2026-10-11, 8 file (7 convention + `openproject-convention.md`) được chép vào `staging/convention/` và `git add`, chưa commit. Đến 2026-10-22 bản gốc đã đi tiếp: `design-database-convention.md` thêm 109 dòng (P-DB-11…14, §12 *Thảo luận và nội dung ERD*, §13 *Khung DOC-11-erd module* + checklist review, tách hai file con catalog-master / history); `coding-backend-convention.md` đổi ví dụ namespace. Bản `staging/` đã là **bản cũ**.

Rà phủ 2026-10-22 (đọc toàn bộ 53 lá + templates + contracts):

| Convention dự án | Đối tác trong minipower | Mức phủ | Thiếu đáng kể |
|---|---|---|---|
| DOC-21 backend (P-BE-01…14) | `backend-convention` · `backend-architecture` · `backend-review` | **Khá** | Bảng marker Jarvis §2.3 (`ILogCreated/Updated/DeletedEntity`, `ICurrentTenant`, `ICurrentUser`) — chỉ `ITenantEntity` có trong lá EF · **`IErrorCode` + `BusinessException` + họ mã lỗi: 0 hit** · P-BE-12 một type một file: 0 hit |
| DOC-24 frontend (P-FE-01…17) | 9 lá `frontend-*-react` | **Trung bình, lệch stack** | Dự án viết `@jarvis/core` + React Query; minipower viết `@platform/core` + hook kit. `[code] message` (11), phím tắt F4/F3/F8 (16), `tabular-nums` căn phải (17): 0 hit |
| DOC-23 API (P-API-01…11) | template DOC-12 · `backend-architecture` · `swashbuckle` | **Thấp** | JSON camelCase (04), UUIDv7 (05), họ mã `{MOD}-VAL-/BR-/API-/SYS-` (07), UTC trên dây (08), tenant từ phiên (09). Envelope lỗi template DOC-12 (`error.{code,message,details}`) **khác** Jarvis `BaseResponse` |
| DOC-22 database (P-DB-01…14) | template DOC-11 | **Rất thấp** | Audit tối thiểu + xoá mềm 3 cột (04), UTC không timezone (05), n-n qua bảng thật có audit (07), **dữ liệu mẫu** (08), **query mẫu trace UC/BR/FR** (09), **lý do thiết kế mỗi bảng** (10), ERD không chứa thảo luận (11), khung ERD module §13. `architecture-review` không có chiều ERD |
| DOC-25 security (P-SEC-01…10 · P-SEC-ARC-01…06) | rải: `baseline-guard` · L1–L3 lá kênh · §12 convention · review | **Thấp, phân mảnh** | Không SSOT; phân loại thông tin, dữ liệu máy không commit, dữ liệu giả trong artifact, báo vị trí secret không paste giá trị, 6 nguyên tắc kiến trúc tin cậy, checklist "P-SEC trước, convention bề mặt sau" |
| DOC-20 UI (P-01…14 · C · E · R) | một phần `frontend-convention` §6 · `frontend-review` a11y | **Gần như không** | 5 pattern layout, taxonomy nút, badge, typography/spacing, `[code] message` + E-01…06, responsive; **ID `UI-{MOD}-{SCREEN}-{NNN}` trace về FR: 0 hit** cả `analyst` và `trace-spine` |
| DOC-26 mobile | — | **Không có** | Toàn bộ; chỉ có surface `mobile` trong `rules.json` để `init` tạo thư mục |
| DOC-27 soạn tài liệu (P-DOC-01…09) | [trace-spine](../../contracts/trace-spine.md) · [lingua-franca](../../contracts/lingua-franca.md) · [handoff](../../contracts/handoff.md) · [doc-versioning](../../src/router/docs-skeleton/00-governance/doc-versioning.md) · [parallel-work](../../src/router/docs/parallel-work.md) · glossary §1 | **Cao — nhưng ngược chiều** | Minipower có đủ luật nhưng rải 6 chỗ, không có một file dự án đọc được; P-DOC-06 tiếng Việt và P-DOC-08 "từ mới vào glossary khi người OK" chưa ghi đâu; P-DOC-07 đã có `token-guard` gác. Skeleton `doc-versioning.md` **thiếu §6 bảo mật** dự án đã thêm |
| OpenProject / work package (P-OP-01…07) | [tasks-openproject](../../src/tasks/skills/minipower-tasks-openproject/SKILL.md) · [pm-plan](../../src/pm/skills/minipower-pm-plan/SKILL.md) + DOC-14 | **Không có luật** | `tasks/` là kênh — "SOP MCP, không luật UC/FR" (ADR-033 QĐ-5): L2 chọn `type/status` mà không có tiêu chí. `pm-plan` chỉ WBS / Story Point. Sản phẩm vs hoạt động, story có AC, estimate con **hoặc** cha, Bug vs CR, Epic không log spent: 0 hit toàn repo |

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Minipower chỉ phủ "code viết thế nào / file ở đâu" cho backend + frontend; **thiết kế** (DB, API, UI, bảo mật) không có nhà | Dự án mới phải tự viết lại từ đầu; dự án e-invoice đã viết nhưng không dự án nào khác hưởng |
| P2 | `DOC-20…26` không có trong `rules.json` | `support-registry` không rà, `doc-mode` không biết mode nào cần gì, router không gợi pack; dự án tự đánh số — dự án sau có thể đánh trùng số cho DOC khác |
| P3 | `staging/convention/` là bản chép đã lệch nguồn, lại được **nạp** vào kho tạm trái ADR-028 QĐ-1 | Hai bản chân lý; kho tạm tăng số file (dấu hiệu "mở lại" ADR-028 đã cảnh báo) |
| P4 | Ba chỗ hai bên **nói ngược**: (a) `DateTime` UTC (P-BE-09) vs *ưu tiên `DateTimeOffset`* (convention §9.4) · (b) *build 0 warning* (P-BE-13) vs *không bật `TreatWarningsAsErrors` toàn cục* · (c) envelope lỗi DOC-12 vs Jarvis `BaseResponse` | Agent kích hoạt cả hai nguồn sẽ viết hai kiểu trong cùng solution |
| P5 | Không lá `*-review` nào soát ERD / hợp đồng API / bảo mật thiết kế | Sai từ ERD (thiếu audit, FK không theo tên bảng) chỉ lộ khi code |
| P6 | Phần lớn convention dự án là **lời** (mục *Cứng và mềm* của họ ghi "Review" làm cổng) | Trái phép thử ADR-020 QĐ-3 nếu bê nguyên chữ "bắt buộc" lên minipower |
| P7 | **Đã xảy ra trùng số**: `openproject-convention.md` và `coding-frontend-convention.md` cùng khai DOC-24 | Bằng chứng trực tiếp cho P2 — không có registry thì mỗi vai tự đánh số |
| P8 | Luật **work-management** (WP là gì, log giờ đâu, bug hay CR) **không có nhà**: kênh `tasks/` cố ý không giữ luật, `pm/` chỉ giữ WBS | Agent soạn WP ở L2 chọn type theo cảm tính; cùng SOP-42 nhưng mỗi dự án chuyển ngữ lại |
| P9 | Dự án phải **chép ngược** luật minipower thành DOC-27 vì minipower không ship một "rulebook soạn tài liệu" đọc được trong `docs/`; đồng thời dự án **sửa file skeleton** `doc-versioning.md` (thêm §6) mà skeleton gốc không biết | Hai bản chân lý cho luật của chính minipower; phần §6 bảo mật tài liệu tốt nhưng chỉ dự án này có |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | ADR-022 QĐ-1 — minipower **không giữ dữ liệu dự án**: tên sản phẩm, màu thương hiệu, họ mã nghiệp vụ (`CQT-`), tham chiếu M-Invoice không được lên repo này |
| C2 | "Cứng bằng máy, mềm bằng lời" — cổng máy nằm ở **repo đích** (analyzer · ESLint · ArchUnit · CI), minipower chỉ ship cấu hình; không thêm hook cứng thứ tám |
| C3 | ADR-022 QĐ-7 — 3 câu hỏi theo thứ tự; *chưa có skill thật thì chưa tạo thư mục module* |
| C4 | ADR-028 — `staging/` chỉ rút, không nạp |
| C5 | AGENTS — *co lại trước khi mở rộng*; mọi thứ mới có SSOT + test canh |
| C6 | ADR-029 QĐ-12 — nguồn chân lý kiến trúc / kiểu dữ liệu là **Jarvis `develop`**, không phải tài liệu dự án lẫn tài liệu minipower |
| C7 | Rules-as-data — bảng DOC sinh từ `rules.json`, không viết tay |

## §4. Phương án

| # | Phương án | | Lý do |
|---|---|---|---|
| O1 | Chép 7 file nguyên văn vào `src/*/reference/` làm "convention chuẩn công ty" | ❌ | Vi phạm C1 (mang `CQT-`, màu LA, M-Invoice); hai chân lý — dự án sửa, minipower không biết (đang xảy ra với `staging/`) |
| O2 | **Tách hai tầng**: phần chung Jarvis-stack → skill / template / contract minipower, có cổng máy ở repo đích khi được; phần sản phẩm ở lại dự án; minipower ship **template DOC-2x** để mỗi dự án điền phần riêng theo cùng khung | ✅ | Đúng C1 + C2; dự án mới nhận khung sẵn; dự án e-invoice chỉ phải sửa header để khớp template |
| O3 | Mở module `governance/` hoặc `convention/` riêng | ❌ | QĐ-7 câu 1 trả lời *có* (tác động lên DOC / pipeline) ⇒ thuộc pack đã có, không phải module mới; "nền tảng thứ tư" |
| O4 | Không đổi minipower; dự án tự trỏ convention trong `AGENTS.md` | ❌ | Không giải quyết P1 (DB/API/UI/security thiếu hẳn), P2, P5; dự án sau không hưởng |
| O5 | Mở module `mobile/` để chứa DOC-26 | ❌ | Chưa có skill thật (C3); DOC-26 hiện 41 dòng toàn bảo mật — gộp vào khung DOC-25 §*Áp dụng theo bề mặt* |
| O6 | Thêm hook `secret-guard` trong minipower cho P-SEC-01/08 | ❌ | Trái C2 / C5; secret scan là việc CI repo đích (gitleaks / `dotnet format` không làm) — minipower ghi hướng dẫn, không gác |
| O7 | DOC-27: coi là tài liệu dự án, minipower không đổi | ❌ | P9 — luật là của minipower; để dự án giữ bản chép là mời lệch |
| O8 | DOC-27: minipower ship **một file skeleton `docs-authoring.md`** = bảng P-DOC trỏ về contract/skeleton, không chép ruột; nâng `doc-versioning.md` skeleton nhận §6 bảo mật | ✅ | Dự án có rulebook đọc một chỗ; SSOT vẫn ở `contracts/` |
| O9 | Work-management: nhét luật WP vào `tasks-openproject` | ❌ | Kênh không giữ luật (ADR-033 QĐ-5); Jira / Lark sẽ phải chép lại |
| O10 | Work-management: luật **tool-neutral** (sản phẩm vs hoạt động · story có AC · estimate một chỗ · bug vs CR · epic không log) ở `pm/`; **ánh xạ provider** (type / status / parent / time entry) ở `reference/` của lá kênh tương ứng; L2 của kênh trỏ về luật trước khi chọn type | ✅ | Đúng vai: `pm` giữ cách làm, kênh giữ cách gọi tool; Jira / Lark chỉ thêm một reference |

## §5. Quyết định (đề xuất)

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Tiêu chí tách tầng** — một nguyên tắc *đi lên minipower* khi **cả ba**: (1) lặp ở mọi dự án dùng Jarvis / kit; (2) không mang tên sản phẩm, màu, mã nghiệp vụ; (3) có ít nhất một chỗ máy kiểm được ở repo đích **hoặc** là khung tài liệu (template). Không đủ ⇒ ở lại dự án | Bảng áp dụng §5a |
| **QĐ-2** | **Đăng ký `DOC-20…28` vào `rules.json`** — `doc_scope` mới `governance` (cross-phase, không thuộc `phase_order`), owner pack theo §5a; **nhu cầu theo `project_surfaces`** (ADR-038) và provider: `backend` ⇒ DOC-21/22/23 · `frontend` ⇒ DOC-20/24 · `mobile` ⇒ DOC-26 · DOC-25 và DOC-27 luôn · DOC-28 khi `tasks_provider ≠ none`. Mode: `mvp` khuyến nghị (WARN), `standard`/`maintain` là DOC rà trong registry | Sinh lại doc-mode / router / registry bằng `npm run gen`; `trace:check` **không** phạt thiếu convention (giữ nguyên luật "không phạt vì chưa viết") |
| **QĐ-3** | **Template DOC-2x** đặt theo pack: DOC-22 · DOC-23 · DOC-25 → `architecture/templates/` · DOC-21 → `backend/templates/` (mới) · DOC-24 → `frontend/templates/` (mới) · DOC-20 → `analyst/templates/` (cạnh DOC-19 prototype; `frontend` consumes) · DOC-26 **không template riêng** — một mục trong DOC-25. Mỗi template: header version · bảng `P-{XX}-NN` chỉ chứa dòng **chung** đã điền + dòng trống cho dự án · mục *Cứng và mềm* ghi rõ cổng nào máy, cổng nào người · *Traceability* | Khung lấy từ dự án e-invoice (đã chạy thật), nội dung sản phẩm gỡ ra. `docs-skeleton/00-governance/` nhận con trỏ, không chép ruột |
| **QĐ-4** | **Nâng skill có sẵn bằng phần chung** (không mở lá mới): `backend-convention` nhận §2.3 marker Jarvis + `IErrorCode`/`BusinessException` + *một type một file* · `backend-architecture` nhận `ICurrentTenant`/`ICurrentUser` thay `IHttpContextAccessor` · [DOC-11](../../src/architecture/templates/DOC-11-data-model.md) nhận audit tối thiểu, UUIDv7, UTC không tz, n-n, **dữ liệu mẫu · query mẫu · lý do thiết kế · mục *Việc còn mở*** + checklist · [DOC-12](../../src/architecture/templates/DOC-12-api-specification.md) nhận camelCase, UUIDv7, UTC, `code`+`message` theo `BaseResponse`, họ mã `{MOD}-VAL-/BR-/API-/SYS-` (họ nghiệp vụ như `CQT-` là ô dự án điền) · `architecture-review` nhận **hai chiều** ERD (P-DB) và hợp đồng HTTP (P-API) · `frontend-convention`/`review` nhận `[code] message` và số căn phải — **nếu Q5 xác nhận là chuẩn công ty** | Theo ADR-029 QĐ-7: convention lo *dòng code*, architecture lo *chỗ đặt*; ERD/API là *thiết kế* ⇒ `architecture/` |
| **QĐ-5** | **Cổng máy ở repo đích** cho phần đi lên: `.editorconfig` thêm StyleCop `SA1402` (một type một file) + `SA1649` (tên file khớp type) — **Q7**; ESLint giữ R1–R7; `IErrorCode` không máy kiểm ⇒ lời + review. P-SEC-01/08 ⇒ hướng dẫn bật secret scan trong CI repo đích (`workflows/init.md` của convention), không hook minipower | C2 |
| **QĐ-6** | **Luật ứng xử bảo mật của agent** (P-SEC-01 secret không vào artifact · 02 dữ liệu máy không commit · 03 dữ liệu giả trong artifact · 05 nguồn ngoài có kiểm soát · 06 L3 có chủ đích · 08 báo vị trí không paste giá trị) → **một mục trong [lingua-franca](../../contracts/lingua-franca.md)** + con trỏ từ prompt `AGENTS` của `project-skeleton`. P-SEC-07 đã là `baseline-guard`. P-SEC-ARC-01…06 → template DOC-25 | Đây là *cách làm* của minipower, không phải luật dự án — đúng chỗ là contract, không phải skill |
| **QĐ-7** | **Chốt ba mâu thuẫn theo C6**: (a) kiểu thời điểm — **đọc Jarvis `develop`** (`ILogCreatedEntity.CreatedAt` là `DateTime` hay `DateTimeOffset`) rồi sửa bên lệch; (b) warning — giữ minipower (nâng dần `WarningsAsErrors`), template DOC-21 để P-BE-13 là **tuỳ chọn dự án**; (c) envelope lỗi — DOC-12 theo `BaseResponse` (đã mô tả ở `swashbuckle`) | Q4 |
| **QĐ-8** | **`staging/convention/` rút, không nạp**: gỡ 8 file khỏi index (cần người chạy `git restore --staged` + xoá) sau khi template QĐ-3 / QĐ-11 / QĐ-12 có | C4; bản chép đã lệch nguồn 11 ngày (`openproject-convention.md` cũng đã lệch header) |
| **QĐ-9** | **Ghi nhận mẫu tích hợp của dự án** — "cổng commit gọi `review-dotnet`" và "`AGENTS.md` dự án trỏ skill minipower" → một mục *Dự án đích dùng thế nào* trong `src/backend/README.md` + `src/frontend/README.md`. Không hook | Là cách làm của dự án, minipower chỉ nêu làm mẫu |
| **QĐ-10** | **Test canh**: template DOC-2x tồn tại + header đúng khung · `gen:check` phủ bảng governance · `link:check` 0 gãy mới · catalog lá **không đổi** (53, trừ khi Q11 chọn lá mới) | C5 |
| **QĐ-11** | **DOC-27 soạn tài liệu → file skeleton** `docs-skeleton/00-governance/docs-authoring.md` (O8): bảng P-DOC-01…09 **mỗi dòng một link** về nguồn (`trace-spine` · `lingua-franca` · `handoff` · `doc-versioning` · `parallel-work` · glossary §1 · AGENTS); không chép ruột. Bổ sung vào nguồn hai luật chưa có nhà: P-DOC-06 ngôn ngữ → prompt AGENTS của `init`; P-DOC-08 "từ mới vào glossary khi người OK" → glossary skeleton. Nâng `doc-versioning.md` skeleton nhận **§6 Bảo mật tài liệu** (P-DOC-SEC-01…07, bỏ ví dụ MST/HĐ) — khớp QĐ-6 | QĐ-7 câu 1: tác động lên pipeline minipower ⇒ `router/`. Test canh: mọi dòng P-DOC có link sống |
| **QĐ-12** | **Work-management hai tầng** (O10): (a) luật tool-neutral P-OP-01…06 + bảng *sản phẩm vs hoạt động* + *ba điều cấm khi tách story* + *log giờ đúng cấp* → `pm-plan/reference/work-breakdown.md`, DOC-14 nhận cột **AC** cho story; (b) ánh xạ OpenProject (7 type · vòng đời status V7.2 · parent · estimate/spent · version/sprint · Activities Sprint-N) → `tasks-openproject/reference/openproject-mapping.md`; (c) `tasks-openproject/workflows/l2-preview.md` thêm bước *đối chiếu work-breakdown trước khi điền `type`*. P-OP-07 (SOFT thay type Risk), custom field, project id, W1–W4 **ở lại dự án** | Đổi số: convention OpenProject của dự án lấy **DOC-28** (Q12). Lark / Jira sau này chỉ thêm một `reference/` mapping |

### §5a. Bảng tách tầng theo QĐ-1

| DOC | Đi lên minipower (chung) | Ở lại dự án (sản phẩm) | Chủ template |
|---|---|---|---|
| DOC-21 backend | P-BE-01…14 (trừ ví dụ namespace), §2.3 marker Jarvis, §5 `IErrorCode`, §7 checklist, §9 | Ví dụ `Einvoice.*`, chứng thư số / HSM (§7.3), họ mã riêng | `backend/` |
| DOC-22 database | P-DB-01…11, §3–§12, khung §13 + checklist | P-DB-12…14 (catalog / history), link ERD module, ví dụ `invoice_detail` | `architecture/` |
| DOC-23 API | P-API-01…06, 08…11; §3–§6; §8 | P-API-07 họ `CQT-`; scheme auth cụ thể (chờ DEC dự án) | `architecture/` |
| DOC-24 frontend | P-FE-03/04/06/07/08/09/10/12/13/14; §5 `[code] message`; §7 | Tên kit viết sai trong DOC-24 (`@jarvis/core` → `@platform/core`, Q6 đã chốt — dự án tự sửa), React Query (P-FE-05) nếu kit không dùng, P-FE-15/16/17 nếu Q5 nói là sản phẩm | `frontend/` |
| DOC-25 security | §2 phân loại, P-SEC-01…10, §4, §5 ARC-01…06, §6, §7 khung bề mặt, §8 | Dòng `autotest/`, nhãn dự án | `architecture/` (+ `lingua-franca` cho phần agent) |
| DOC-20 UI | P-02 một luồng một pattern, P-05 route vs dialog, P-07, P-10 **ID `UI-*`**, P-11, P-12 `[code] message`, P-14 số phải chữ trái; §9 lỗi E-01…05; khung §4 pattern L/G/E/F/D | Màu LA (C-01…06, §8.3), M-Invoice, P-06 F-keys (**Q5**), P-08 MST, §12 MVP scope | `analyst/` |
| DOC-26 mobile | P-MOB-SEC-01…07 → mục bề mặt trong DOC-25 | P-MOB-SEC-08 mức xử lý | — (gộp DOC-25) |
| DOC-27 soạn tài liệu | P-DOC-01…09 (toàn bộ — vốn là luật minipower); §6 bảo mật của `doc-versioning.md` | Ví dụ MST / số HĐ; dòng `autotest/` | `router/` (skeleton) |
| DOC-28 work package (nay tự khai DOC-24) | §0 hai bước · §1 bảng loại (phần Jira↔OP) · §2 cây chọn · §3 nguyên tắc vàng + 3 điều cấm · §3.1 automation · §4 ba pha · §5 vòng đời · §6 estimate/log · §7 assignee · §9 họp / Activities · §10 due date · §11 ai tạo + 4 hàng rào · §12 cây parent · §13 relation · P-OP-01…06 | Phạm vi instance (`vna-invoice`, ID 3), §11.2 mức chi tiết đã chọn, §14 custom field, P-OP-07, backlog POC | `pm/` (luật) + `tasks/` (mapping) |

### §5b. Kết quả chốt 2026-10-22 (chủ repo)

| # | Kết quả | Hệ quả lên thi hành |
|---|---|---|
| QĐ-1 | ✅ Giữ | §5a là ranh giới; cột *Chủ template* đọc là **nơi nhận phần chung** (skill / contract), không còn là template |
| QĐ-2 | ❌ **Bỏ** | Convention là tài liệu chung, **không phải deliverable** ⇒ không cấp mã DOC, không vào `rules.json`, không doc-mode / registry. P2 và P7 đóng bằng cách *không đánh số*: dự án tự quyết có giữ chữ `DOC-2x` trong header của họ hay không |
| QĐ-3 | ❌ **Bỏ** | Không template `DOC-2x`. Phần chung đi thẳng vào skill theo QĐ-4; phần sản phẩm dự án tự giữ trong `00-governance/` như hiện nay |
| QĐ-4 | ✅ Giữ | Nâng skill có sẵn — là **thân chính** của ADR sau khi bỏ QĐ-2/3 |
| QĐ-5 | ✅ Giữ | StyleCop `SA1402` + `SA1649` vào template analyzer, severity `warning` trước |
| QĐ-6 | ✅ Giữ | Luật bảo mật agent → `lingua-franca`; P-SEC-ARC vào nơi nhận DOC-25 (xem QĐ-4: `architecture-review` chiều bảo mật thiết kế, thay cho template) |
| QĐ-7 | ✅ **Chốt (a)**: `CreatedAt` là `DateTime`; DB mặc định UTC+0 nên **không lưu offset** ⇒ sửa minipower `coding-convention.md` §9.4: property map cột datetime dùng `DateTime` quy ước UTC, không `DateTimeOffset`; Domain không `DateTime.Now`. (b) và (c) theo đề xuất | Đóng Q4 không cần đọc Jarvis |
| QĐ-8 | ⏸ Hoãn → **soát lại 2026-10-22** | Đối chiếu 8 file với skill sau §7: phần chung của backend · DB · API · frontend · OpenProject · luật agent bảo mật **đã vào** skill / contract; bản `staging/` là bản chép **cũ** (DB lệch 129 dòng, backend và OpenProject lệch 2) và bản gốc vẫn ở repo dự án. **Ba phần chung chưa có nhà** trong minipower, ghi nợ, không chặn xoá: (1) UI — pattern màn hình L/G/E/F/D, taxonomy nút, ID `UI-{MOD}-{SCREEN}-NNN`; (2) mobile — P-MOB-SEC-01…07 (chờ module `mobile/`); (3) bảo mật — bảng phân loại thông tin §2. Nguồn để rút sau: `documents/docs/00-governance/` của dự án e-invoice. **Đã xoá cả 8 file (`git rm`) 2026-10-22 theo lệnh chủ repo**; `link:check` từ 30 gãy mới về 3 (chỉ còn `tutorial.md` gãy từ trước) |
| QĐ-9 | ✅ Giữ | README backend / frontend nhận mục *Dự án đích dùng thế nào* |
| QĐ-10 | ✅ Giữ (thu hẹp) | Hết template ⇒ còn `link:check` 0 gãy mới · catalog lá không đổi (53) · `npm test` xanh |
| QĐ-11 | ✏️ **Sửa — không tạo document mới** | Không có `docs-authoring.md` skeleton. Chỉ sửa file **đã có**: `doc-versioning.md` skeleton nhận §6 bảo mật tài liệu; `business-glossary.md` skeleton nhận luật *từ mới vào glossary khi người OK*; prompt AGENTS trong `INIT.md` nhận dòng ngôn ngữ. DOC-27 của dự án giữ vai rulebook của họ |
| QĐ-12 | ✏️ **Sửa — không mã DOC mới** | Không DOC-28. Luật tool-neutral vẫn vào `pm-plan/reference/work-breakdown.md` + cột AC DOC-14; ánh xạ OpenProject vào `tasks-openproject/reference/openproject-mapping.md`; bước đối chiếu ở L2 — đây là **nội dung skill**, không phải DOC |

## §6. Confirm — chốt 2026-10-22

| # | Câu hỏi | Trả lời chủ repo |
|---|---|---|
| Q1 | Tiêu chí tách tầng QĐ-1 + bảng §5a? | **OK** |
| Q2 | `DOC-20…28` vào `rules.json`? | **Không** — convention chung không phải deliverable, không cấp mã DOC |
| Q3 | Chủ template DOC-20 / DOC-25? | **Không có template** — phần chung vào skill (QĐ-4) |
| Q4 | Kiểu thời điểm? | **`DateTime`**, UTC+0 mặc định trong DB, không lưu offset |
| Q5 | `[code] message` · số căn phải · F-keys? | Theo đề xuất (hai cái đầu lên `frontend`, F-keys ở lại) — không phản đối |
| Q6 | `@jarvis/core` vs `@platform/core`? | **Chốt 2026-10-22: tên package là `@platform/core`** — một kit. `@jarvis/core` trong DOC-24 của dự án là viết sai; dự án sửa file của họ. Frontend pack **không có nợ** |
| Q7 | StyleCop `SA1402`/`SA1649`? | **OK** (QĐ-5) |
| Q8 | Chiều ERD / API trong `architecture-review`? | Theo đề xuất — trong, không tách lá |
| Q9 | `staging/convention/`? | **Để nguyên, xử lý sau** (QĐ-8 hoãn) |
| Q10 | `docs-authoring.md` viết tay hay sinh? | **Không tạo document mới** (QĐ-11 sửa) |
| Q11 | Work-breakdown trong `pm-plan` hay lá mới? | Trong `pm-plan` — không lá mới, không DOC mới (QĐ-12 sửa) |
| Q12 | Đổi số OpenProject → DOC-28? | **Không đánh số** |

## §7. Việc triển khai (sau chốt §5b)

Mọi bước chỉ **sửa skill / contract / skeleton đã có**. Không `rules.json`, không template mới, không file skeleton mới, không đụng `staging/`. **Thi hành 2026-10-22** — ghi chú thực tế ở cột cuối.

| Bước | Việc | Done khi |
|---|---|---|
| 1 | `backend-convention`: reference §9.4 → `DateTime` UTC (QĐ-7a) · thêm §2.3 marker Jarvis (`ILogCreated/Updated/DeletedEntity`, `ITenantEntity`, `ICurrentTenant`, `ICurrentUser`) · §5 `IErrorCode` + `BusinessException` + họ mã `{MOD}-VAL-/BR-/API-/SYS-` · P-BE-12 một type một file · template `.editorconfig` / `Directory.Build.props` nhận StyleCop `SA1402` + `SA1649` mức `warning` (QĐ-5) | ✅ reference thành **14 mục** (13 Jarvis marker · 14 `IErrorCode`), §2 mở đầu bằng một type một file; editorconfig tắt 9 category StyleCop rồi bật 2 rule, test project `SA1402 = none`; props thêm `PackageReference StyleCop.Analyzers 1.2.0-beta.556`. `backend-pack.test.js` 8/8. T2 chờ chủ repo |
| 2 | `backend-architecture`: lấy tenant / user qua `ICurrentTenant` / `ICurrentUser`, không `IHttpContextAccessor` trong Application | ✅ một bullet *Quy tắc cốt lõi*, link sang convention mục 13 |
| 3 | DOC-11 template (có sẵn) nhận: audit tối thiểu + xoá mềm 3 cột · UUIDv7 · UTC không tz · FK `{bảng}_id` · n-n bảng thật · **dữ liệu mẫu · query mẫu trỏ UC/BR/FR · lý do thiết kế · mục *Việc còn mở*** · checklist review. DOC-12 template nhận: camelCase · UUIDv7 · UTC · `code` + `message` theo `BaseResponse` (QĐ-7c) · họ mã | ✅ DOC-11: §1.2 bảng 10 quy ước, §3.1 khuôn bảng (lý do · cột · index · mẫu), §3.2 query mẫu, §8 *Việc còn mở* mới — §4–§7 **giữ số** vì dự án e-invoice đang trỏ. DOC-12: §2 tenant từ phiên, §3 thêm ranh giới HTTP + bảo mật hợp đồng; hình dạng wrapper `BaseResponse` **không có trong repo** nên chỉ ghi `code` + `message` và trỏ `swashbuckle`, không bịa field |
| 4 | `architecture-review` thêm **ba chiều**: ERD (P-DB), hợp đồng HTTP (P-API), bảo mật thiết kế (P-SEC-ARC-01…06); `architecture-sad` trỏ sang | ✅ SKILL 5 dòng → bảng 5 chiều + format output; `description` thêm từ khoá ERD / API / bảo mật; README nhận prompt mẫu. T3 chờ chủ repo |
| 5 | `frontend-convention` + `frontend-review` nhận `[code] message` và số căn phải / `tabular-nums`; soát Q6 (tên kit) và ghi nợ nếu hai kit | ✅ reference §5 + §6, SKILL 2 bullet, review 2 dòng checklist. Q6 đóng cùng ngày: kit là `@platform/core`, dự án sửa DOC-24 — không việc gì thêm ở frontend pack |
| 6 | `lingua-franca` nhận mục *Bảo mật artifact của agent* (P-SEC-01/02/03/05/06/08) · `doc-versioning.md` skeleton nhận §6 bảo mật tài liệu (bỏ ví dụ MST/HĐ) · `business-glossary.md` skeleton nhận luật từ mới · `INIT.md` prompt AGENTS nhận dòng ngôn ngữ (QĐ-6, QĐ-11) | ✅ `lingua-franca` mục 7 luật, nói rõ cổng máy duy nhất là `baseline-guard`; `doc-versioning.md` §6 (Change Log → §7). **Hai việc hoá ra đã có:** luật ngôn ngữ và luật từ mới vào glossary nằm sẵn trong `TPL-agent-profile.md` (dòng *Ngôn ngữ* / *Từ vựng*) — không sửa glossary / INIT. T6: 9/9 P-DOC có nguồn |
| 7 | `pm-plan/reference/work-breakdown.md` (P-OP-01…06 tool-neutral, sản phẩm vs hoạt động, 3 điều cấm, log đúng cấp) + DOC-14 cột **AC** · `tasks-openproject/reference/openproject-mapping.md` · bước đối chiếu trong `l2-preview.md` (QĐ-12) | ✅ work-breakdown 7 luật `WB-01…07` + bảng chọn loại + log đúng cấp + ba pha + ai tạo gì; DOC-14 §3 thêm cột *AC trace*; mapping OpenProject §1–§6; `l2-preview` thêm bước 3; SKILL + README `tasks-openproject` trỏ sang. T7 chờ chủ repo |
| 8 | README `backend` / `frontend`: mục *Dự án đích dùng thế nào* (QĐ-9) | ✅ backend: bảng 3 dòng + cổng commit là quy ước dự án; frontend: một đoạn |
| 8b | Khuôn `AGENTS.md` dự án đích (`TPL-agent-profile.md` + `SAMPLE-agents.md`) — rút từ AGENTS.md dự án e-invoice (QĐ-9 mở rộng, 2026-10-22) | ✅ Thêm §0 *Chung và riêng* (skill giữ cách làm, `*-convention.md` dự án là lớp áp thêm) · hàng `00-governance/` nhận `*-convention.md` riêng dự án · §4 nguyên tắc 6 *Tài liệu — thảo luận trước, ghi sau* và 7 *Code — chưa chốt thì không sửa* · §5 bảng *Quy ước kỹ thuật* 7 dòng: cột **Chung** trỏ skill, cột **Riêng dự án** `_(điền)_`. Không chép phần VNA (hai BRD, Lotus Airport, link `.cursor/skills/`). `templates.test` + `router.test` + `install-cli.test` 28/28 |
| 9 | `npm test` → `gen:check` → `link:check` | ✅ `npm test` **606/607** — 1 đỏ là `docs-consistency #12` (regex `Không còn \`permissions.deny\` tĩnh` không khớp chữ in đậm trong AGENTS.md), **đỏ từ trước**: AGENTS.md không đổi so với HEAD, ngoài phạm vi ADR · `gen:check` xanh · `link:check` 0 gãy mới ngoài `staging/` và 3 link `tutorial.md` đã gãy từ trước · catalog 53 lá |

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Regression | `npm test` · `gen:check` · `link:check` sau mỗi bước | xanh, 0 gãy mới, catalog 53 lá không đổi | 🟢 2026-10-22 (trừ #12 đỏ sẵn — §7 bước 9) |
| T2 | Smoke | Solution scaffold thật với template analyzer mới: 2 type trong một `.cs` → `dotnet build` **cảnh báo SA1402**; property `DateTimeOffset` map cột → review bắt | cổng sống | ⚪ chủ repo |
| T3 | Smoke | Agent viết ERD module từ DOC-11 mới: có dữ liệu mẫu, query mẫu trỏ UC/BR/FR, lý do thiết kế, *Việc còn mở* tách riêng; `architecture-review` bắt ERD thiếu audit | đúng khung | ⚪ chủ repo chạy trên dự án e-invoice |
| T5 | Đối chiếu | 9 convention của dự án đặt cạnh skill sau nâng: mọi dòng §5a cột *Đi lên* có chỗ trong minipower; không dòng nào minipower thêm mà dự án không có | §5a đúng ranh giới | ⚪ |
| T6 | Đối chiếu | P-DOC-01…09 của DOC-27 — mỗi dòng chỉ được một nguồn minipower (contract / skeleton / INIT) | 0 luật mồ côi | 🟢 01 trace-spine · 02 lingua-franca · 03 doc-versioning · 04 handoff · 05 parallel-work · 06 + 08 TPL-agent-profile · 07 token-guard · 09 glossary §1 |
| T7 | Smoke | `tasks-openproject` L2 với "tạo WP *Viết code màn danh sách*" → bảng L2 đổi sang danh từ sản phẩm và hỏi parent Story; "log 2h họp Epic" → từ chối, gợi Task Activities | đúng P-OP-01/02/04 | ⚪ chủ repo |

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Skill backend / architecture / frontend / pm / tasks nhận phần chung đã chạy thật ở dự án e-invoice; ERD / API / bảo mật thiết kế lần đầu có chiều review; luật bảo mật của agent có một nhà (`lingua-franca`); work package có luật tool-neutral. Không thêm mã DOC, không thêm template — hệ DOC-01…19 giữ nguyên |
| Xấu / chi phí | `architecture-review` dài thêm ba chiều; dự án mới **không** có khung tài liệu convention sẵn (chủ repo chọn — phần sản phẩm là việc của dự án); thêm StyleCop vào solution có sẵn có thể đỏ nhiều (giảm bằng `warning` trước); phần UI vẫn **chỉ là lời** — không máy nào kiểm layout |
| Trung lập | Dự án e-invoice là *nguồn* phần chung nhưng không phải SSOT: sau ADR, SSOT phần chung là skill minipower, SSOT phần sản phẩm là dự án. `staging/convention/` còn đó (QĐ-8 hoãn) — hai lệch đã thấy là lý do không chép ruột. Ca trùng số DOC-24 không còn là vấn đề của minipower khi convention không mang mã |

---
