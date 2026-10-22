# Phương pháp đọc code vào `architecture-as-built` — rút 4 file reading khỏi `staging/`

| | |
|---|---|
| **Ngày** | 2026-10-22 |
| **Trạng thái** | 🟡 Doing — chủ repo chốt hướng, QĐ-4 (4 nhãn) và Q2–Q5 ngày 2026-10-22; **thi hành §7 bước 1–7 cùng ngày**, T1–T3 xanh. Còn T4–T5 smoke (chủ repo). Đã chuyển `doing/` 2026-10-22 |
| **Phạm vi** | Bốn file `staging/{csharp,java,reactjs,flutter}-source-code-reading-skill.md` (7.207 dòng): gộp phần chung thành `reference/` + `templates/` của [minipower-architecture-as-built](../../src/architecture/skills/minipower-architecture-as-built/SKILL.md), phần theo stack thành `patterns/{dotnet,java,react,flutter}/`; hoà bộ nhãn bằng chứng; mở rộng `description` của as-built; rút 4 file khỏi `staging/` |
| **Ngoài phạm vi** | Lá mới hay module mới (`mobile/`, `java/`) · skill *sửa* code · tích hợp CodeGraph sâu hơn mức as-built đang có · bộ artifact riêng `01-system-context.md…` của các file reading (không đem vào — đầu ra đi về DOC-NN) · 13 mục còn lại trong `staging/` |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 (3 câu hỏi) · [ADR-028](ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) (`staging/` chỉ rút, mỗi đợt có ADR) · [ADR-029](ADR-029-2026-08-28-skill-architecture-dotnet-thay-foundation-application.md) (tiền lệ rút nhiều file một đợt, nguồn chân lý là code thật) · [ADR-041](ADR-041-2026-10-22-dua-convention-du-an-vao-minipower.md) (khuôn tách chung / riêng) |
| **Mục đích** | Ghi lại vì sao một phương pháp không chép bốn lần, vì sao nằm trong as-built thay vì lá riêng theo pack, và cách hoà hai bộ nhãn bằng chứng |
| **Ảnh hưởng (khi accepted)** | `src/architecture/skills/minipower-architecture-as-built/` (SKILL.md · README.md · `reference/reading-method.md` mới · `templates/TPL-flow-map.tpl` mới · `patterns/{dotnet,java,react,flutter}/SKILL.md` mới) · [`role-pack.test.js`](../../src/router/hooks/test/role-pack.test.js) nếu kiểm provider/pattern con · `staging/` (−4 file) · catalog lá **không đổi** (53) |

---

## §1. Bối cảnh

Bốn file reading được nạp vào `staging/` ngày 2026-10-03, không có trong bảng §5a của ADR-028 (bảng đó khai 13 file + `interview/`). Mỗi file tự xưng là "skill" với frontmatter `name: {stack}-source-code-reading`, không theo hệ tên `minipower-{module}-{capability}`.

Đo trùng lặp 2026-10-22: **40 heading xuất hiện ở cả bốn file** — mô hình 6 tầng L0–L5, trace theo 5 câu hỏi (Entry · Transformation · Decision · Side Effect · Error/Recovery), chiến lược 3 pass với tỉ lệ effort, bốn nhãn bằng chứng, template Flow Map 16 mục, Call Graph, Data Flow, Dependency Map, Output artifacts, anti-pattern, quy trình 10 bước, Definition of Done. Chỉ phần "ngữ pháp" từng stack khác nhau: entry point, DI, persistence, state, routing, config, test.

Minipower đã có [minipower-architecture-as-built](../../src/architecture/skills/minipower-architecture-as-built/SKILL.md): giữ **cổng người** (một vùng chạm, đầu ra nháp + câu hỏi, không chạy nền, không sửa code), bằng chứng `path:line`, ba nhóm Sự thật / Phỏng đoán / Mâu thuẫn, đích theo DOC-04/08/10/11/12/17, tầng CodeGraph tuỳ chọn. Nhưng as-built **không nói đọc code thế nào** — đúng chỗ bốn file reading lấp.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Một phương pháp chép bốn lần | Sửa một ý phải sửa bốn chỗ; đã thấy lệch nhỏ (Java thiếu mục Tests riêng, tỉ lệ pass viết khác) |
| P2 | File 1.500–1.960 dòng không load được như skill | `token-guard` và luật "SKILL.md là mục lục" đều chống; agent chỉ dùng được nếu là `reference/` không load mặc định |
| P3 | Hai bộ nhãn bằng chứng song song (4 nhãn reading · 3 nhóm as-built) | Cùng một bản nháp hai cách gọi; Documented không có chỗ trong 3 nhóm, Mâu thuẫn không có chỗ trong 4 nhãn |
| P4 | Reading đề xuất bộ artifact riêng (`01-system-context.md`, `flows/`) lệch hệ DOC-NN | Agent sinh thêm một thư viện tài liệu song song, chính thứ R5 của as-built cấm |
| P5 | Pass 1 "reconnaissance" quét cả repo, as-built ép "một vùng chạm" | Hai luật đọc như mâu thuẫn nếu không nói rõ ranh giới |
| P6 | `description` as-built chỉ có "maintain, legacy, as-built" | Người gõ "đọc source", "trace flow", "codebase lạ" không kích hoạt được lá |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | ADR-022 QĐ-7: 3 câu hỏi theo thứ tự; *chưa có skill thật thì chưa tạo thư mục module* — Java không có pack, `mobile/` chưa mở |
| C2 | ADR-028: `staging/` chỉ rút; rút nhiều file một đợt phải chốt có ý thức (tiền lệ ADR-029 QĐ-13) |
| C3 | Luật as-built đang có không hạ: một vùng chạm · đầu ra nháp + câu hỏi · không chạy nền · không sửa code · chỉ mục đã xác nhận mới thành DOC |
| C4 | "Cứng bằng máy, mềm bằng lời" — phương pháp đọc toàn là lời; không viết "bắt buộc" |
| C5 | Khuôn `skill-author`: SKILL.md là mục lục; chi tiết ở `reference/`; biến thể là **mô hình** → `patterns/`; file trong `templates/` chứa link giả không đuôi `.md` |
| C6 | Catalog lá không tăng (53) — không lá mới |

## §4. Phương án

| # | Phương án | | Lý do |
|---|---|---|---|
| O1 | Giữ 4 file, đổi tên theo hệ `minipower-*`, mỗi file một lá | ❌ | P1, P2; Java/Flutter không có module để đặt (C1) |
| O2 | Một lá mới `minipower-architecture-reading` | ❌ | QĐ-7 câu 3: *đọc code để viết lại tài liệu* là năng lực của as-built; hai lá sẽ tranh nhau cùng từ khoá |
| O3 | **Gộp vào as-built**: phần chung → `reference/reading-method.md`; Flow Map → `templates/`; phần stack → `patterns/{dotnet,java,react,flutter}/SKILL.md` | ✅ | Một phương pháp một chỗ; stack chỉ còn bảng tra; không mở module; as-built có cả cổng và cách đọc |
| O4 | Tách lá theo pack: `backend-reading-dotnet`, `frontend-reading-react`… | ❌ | Chép phương pháp vào từng pack; Java và Flutter không có nhà |
| O5 | Giữ 3 nhóm của as-built, bỏ 4 nhãn | ❌ | Mất Documented — tài liệu cũ là nguồn quan trọng ở `maintain` mà không có chỗ xếp |
| O6 | Giữ 4 nhãn, Mâu thuẫn thành **quy tắc dẫn xuất** (Documented ≠ Observed cùng một điểm) | ✅ | Chủ repo chốt 2026-10-22; từng dòng có nhãn nguồn, bảng xuất vẫn có mục ⛔ |

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Không lá mới, không module mới** — mở rộng `minipower-architecture-as-built` | QĐ-7 câu 3; C6 |
| **QĐ-2** | **`reference/reading-method.md`** chứa phần chung: 6 tầng L0–L5 · 5 câu hỏi · 3 pass · 4 nhãn + quy tắc Mâu thuẫn · Call Graph · Data Flow · Dependency Map · anti-pattern · DoD theo flow. Viết **một lần**, stack-neutral, ví dụ dùng tên trừu tượng (`Entry → Handler → Repository`), ~400 dòng. Không load mặc định | P1, P2 |
| **QĐ-3** | **`patterns/{dotnet,java,react,flutter}/SKILL.md`** — mỗi pattern chỉ là **bảng tra theo stack**, ~150 dòng: file nhận diện repo · entry point · composition/DI · thứ tự đọc · persistence hoặc state · routing/navigation · async/messaging · auth · error · config · test. `name` = `minipower-architecture-as-built-{stack}`; `description` nêu stack + từ khoá (`Program.cs`, `@RestController`, `useQuery`, `BlocProvider`…). Không lặp phương pháp | C5; khuôn `providers/` của backend |
| **QĐ-4** | **Bộ nhãn bằng chứng: 4 nhãn** Observed · Documented · Inferred `[Suy luận]` · Unknown `[Chưa xác minh]` làm trục chính. **Mâu thuẫn ⛔ là quy tắc dẫn xuất**: cùng một điểm có Documented và Observed nói khác nhau → gom thành mục riêng, agent **không** tự chọn bên đúng. As-built SKILL.md đổi bảng 3 nhóm sang bảng này; phần "Phỏng đoán" cũ = Inferred, "Sự thật" = Observed có `path:line` | **Chủ repo chốt 2026-10-22** (O6). Mọi Observed vẫn phải có `path:line` (C3) |
| **QĐ-5** | **Đầu ra theo hệ DOC, không bộ artifact riêng**: Flow Map là **nháp** (`brainstorm/` hoặc trình trong chat) → người xác nhận → distill về DOC-05 (luồng), DOC-04 (BR lộ trong `if`/validator), DOC-12 (endpoint), DOC-10 (tích hợp), DOC-17 (runbook); Unknown → `memory/open-questions.md`; vùng chưa đọc → `memory/doc-debt.md`. Bộ `01-system-context.md…` **không** đem vào | P4; C3 |
| **QĐ-6** | **Flow Map template** đặt tại `as-built/templates/TPL-flow-map.tpl` (16 mục của reading + cột nhãn + cột `path:line`), đuôi `.tpl` | C5 (link giả). Q3 chốt vị trí |
| **QĐ-7** | **Pass 1 Reconnaissance được phép quét rộng nhưng chỉ ra Architecture Map / Module Map / Entry Map** — không sinh DOC, không đọc implementation. Pass 2 và 3 bám **vùng chạm đã chốt với người**. Viết thành một đoạn "Ranh giới ba pass" ngay dưới luật *Một vùng chạm* của as-built | P5; hoà với R5. Q2 chốt |
| **QĐ-8** | **`description` as-built** thêm từ khoá kích hoạt: đọc source, reverse-engineer, hiểu luồng, trace flow, codebase lạ, hệ cũ không tài liệu; giữ ≤ giới hạn loader | P6 |
| **QĐ-9** | **Rút 4 file khỏi `staging/`** trong cùng thay đổi với bước 2–4 §7 (người chạy `git rm`); kho 17 → 13 mục | C2; không để khoảng trống hai bản |
| **QĐ-10** | **Test canh**: `patterns/*/SKILL.md` có frontmatter, `name` bắt đầu bằng tên lá cha, ≤64 ký tự (mở rộng kiểm provider con của `role-pack.test.js` cho `architecture` nếu chưa có) · `link:check` 0 gãy mới · catalog 53 | C6 |

### §5a. Bảng rút — nguồn → đích

| Nội dung trong 4 file | Đích | Ghi chú |
|---|---|---|
| Mục tiêu · Nguyên tắc chung · 6 tầng · 5 câu hỏi · L4 semantic block · 3 pass · Chuẩn evidence · Call Graph · Data Flow · Dependency Map · Anti-pattern · Quy trình 10 bước · DoD | `reference/reading-method.md` | Lấy bản đầy đủ nhất làm gốc (React/Flutter có thêm "hai thì đọc/ghi", "ẩn nút không phải phân quyền" — giữ ở dạng stack-neutral) |
| Flow Map 16 mục | `templates/TPL-flow-map.tpl` | Thêm cột nhãn + `path:line`; bỏ dòng "Observability" trùng |
| C#: §4 nhận diện · §7.1 entry · §10 thứ tự · §11 DI · §12 pipeline · §13 Controller/Minimal API · §14 MediatR · §15 DDD · §16 EF · §17 Dapper · §18 Transaction · §19 Messaging · §20 Background · §21 Async · §22 Auth · §23–§27 | `patterns/dotnet/SKILL.md` | Trỏ chéo `backend-architecture-dotnet` (layer Jarvis) để không lặp |
| Java: §4 · §10 · §11 Spring DI · §12 AOP · §13 Web · §14 JPA · §15 Kafka/Rabbit · §16 Async · §17 Security · §18–§19 | `patterns/java/SKILL.md` | Không có pack Java — pattern là chỗ duy nhất; không mở module |
| React: §4 kiểu runtime · §10 · §11 composition · §12 render pipeline · §13 routing · §14 state taxonomy · §15 hooks · §16 query/cache · §17 form · §18 sync · §19 realtime · §20–§27 | `patterns/react/SKILL.md` | Trỏ chéo `frontend-architecture-react` khi repo là kit `@platform/core` |
| Flutter: §4 · §10 · §11 composition · §12 lifecycle · §13 navigation · §14 state · §15 async/stream · §16 repository · §17 form · §18 sync · §19 realtime · §20 nền/plugin · §21–§27 | `patterns/flutter/SKILL.md` | Chưa có `mobile/`; pattern này **không** là lý do mở module (C1) |
| Output artifacts `01-…10-open-questions.md` | **Bỏ** | QĐ-5 |
| Frontmatter `name: {stack}-source-code-reading` | **Bỏ** | Hệ tên minipower |

## §6. Confirm

| # | Câu hỏi | Đề xuất | Trả lời |
|---|---|---|---|
| Q1 | Bộ nhãn bằng chứng | 4 nhãn + Mâu thuẫn dẫn xuất | **Chốt 2026-10-22: 4 nhãn** |
| Q2 | Pass 1 quét rộng ở mức Architecture Map có được phép dưới luật "một vùng chạm"? | Có, với ranh giới QĐ-7 (không DOC, không implementation) | **OK** 2026-10-22 |
| Q3 | Flow Map đặt ở `as-built/templates/` hay `router/templates/` chung? | `as-built/templates/` — chỉ as-built dùng; chuyển lên router khi lá thứ hai cần | **OK** — `as-built/templates/` |
| Q4 | Tên pattern: `-dotnet` · `-java` · `-react` · `-flutter` (theo stack) | Theo stack, như hậu tố lá backend/frontend | **OK** — theo stack |
| Q5 | Rút 4 file cùng một đợt (trái ADR-028 QĐ-4 "từng file") | Cùng đợt — bốn file là một phương pháp, tách đợt là tách một ý | **OK** — cùng đợt |

## §7. Việc triển khai

| Bước | Việc | Done khi |
|---|---|---|
| 0 | Đóng Q2–Q5 | ✅ 2026-10-22 |
| 1 | `reference/reading-method.md` stack-neutral theo §5a; bộ 4 nhãn + quy tắc Mâu thuẫn (QĐ-4) | ✅ **168 dòng** (viết bảng, đặc hơn ước lượng 400) · 12 mục: mục tiêu · nguyên tắc + 4 nhãn · 6 tầng · 5 câu hỏi · composition · data/state/sync · security/lỗi/observability · tests · 3 artifact · 3 pass + ranh giới · anti-pattern · DoD |
| 2 | `templates/TPL-flow-map.tpl` (QĐ-6) | ✅ 63 dòng, 17 mục (16 của reading + §16 Mâu thuẫn ⛔ + §17 Unknown), cột nhãn + `path:line` |
| 3 | `patterns/{dotnet,java,react,flutter}/SKILL.md` (QĐ-3) | ✅ 104 · 101 · 103 · 106 dòng; mỗi pattern 12–13 mục bảng tra; dotnet trỏ `backend-architecture-dotnet`, react trỏ `frontend-architecture-react`, flutter ghi rõ không là lý do mở `mobile/` |
| 4 | as-built `SKILL.md`: đổi bảng 3 nhóm → 4 nhãn; thêm mục *Cách đọc* (reference + pattern theo stack); đoạn *Ranh giới ba pass* (QĐ-7); đầu ra về DOC (QĐ-5); `description` mới (QĐ-8). `README.md` nhận prompt mẫu "đọc luồng X trong repo Y" | ✅ Bước 4–5 quy trình đổi; bảng 4 nhãn giữ cột *Tương ứng cũ* (Sự thật / Phỏng đoán) để test R5 cũ vẫn đúng; README từ 5 dòng thành hướng dẫn có hai prompt mẫu |
| 5 | Test canh pattern con cho `architecture` (QĐ-10) | ✅ 4 test mới trong `as-built.test.js` (reference + TPL tồn tại · 4 nhãn + dẫn xuất · 4 pattern đúng name/description/trỏ method · Pass 1 không sinh DOC). `npm test` 610/611 — 1 đỏ là `#12` AGENTS.md có sẵn từ trước (ADR-041 §7 bước 9) |
| 6 | `git rm` 4 file `staging/*-source-code-reading-skill.md` (người chạy) | ✅ Xoá 2026-10-22 theo lệnh chủ repo; `staging/` 17 → 13 mục |
| 7 | `npm test` → `gen:check` → `link:check` | ✅ `gen:check` xanh · `link:check` 0 gãy mới ngoài 3 link `tutorial.md` có sẵn · catalog 53 (pattern con không tính là lá) |

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Regression | `npm test` · `gen:check` · `link:check` | xanh; 0 gãy mới; catalog 53 | 🟢 2026-10-22 (trừ #12 đỏ sẵn) |
| T2 | Đối chiếu | 40 heading chung của 4 file đều có mặt trong `reading-method.md`; không heading stack-specific lọt vào reference | 0 thiếu, 0 lọt | 🟢 40/40 có mặt (gộp vào 12 mục); phần phương pháp không nêu tên framework |
| T3 | Đối chiếu | Mỗi pattern: mọi mục stack của file gốc (§5a) có dòng tương ứng; không câu phương pháp nào bị chép lại | 0 mồ côi, 0 lặp | 🟢 các mục §5a đều có bảng tương ứng; pattern chỉ trỏ về method, không chép 6 tầng / 5 câu hỏi |
| T4 | Smoke | Agent với as-built đọc một luồng trong solution .NET thật: ra Flow Map nháp với 4 nhãn, mọi Observed có `path:line`, có mục ⛔ khi README khác code, không sinh DOC trước khi người xác nhận | đúng QĐ-4/5/7 | ⚪ chủ repo |
| T5 | Smoke | Prompt "đọc source hiểu luồng thanh toán" (không chứa chữ as-built) kích hoạt đúng lá | `description` đủ từ khoá | ⚪ chủ repo |

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Một phương pháp đọc code ở một chỗ; as-built có cả cổng và cách đọc; bốn stack dùng được ngay mà không mở module; 7.200 dòng về ~1.000; `staging/` bớt 4 |
| Xấu / chi phí | Mất ví dụ cụ thể theo stack trong phần phương pháp (chỉ còn ở pattern); pattern phải bảo trì khi framework đổi; as-built SKILL.md dài thêm một mục |
| Trung lập | Java và Flutter lần đầu có chỗ đứng trong minipower nhưng chỉ ở mức *đọc*, không phải pack; đây không phải tín hiệu mở module — mở khi có skill *viết* thật |

---
