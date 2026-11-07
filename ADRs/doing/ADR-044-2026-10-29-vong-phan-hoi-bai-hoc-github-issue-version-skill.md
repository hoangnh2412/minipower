# Vòng phản hồi: bài học thành GitHub Issue cho tác giả · skill có version · agent định kỳ đánh giá, người quyết nâng

| | |
|---|---|
| **Ngày** | 2026-10-29 (viết lại theo khuôn người-đọc 2026-11-07) |
| **Trạng thái** | 🟡 Doing — Q1–Q5 §9 chốt 2026-11-07 (theo đề xuất); chưa thi hành §10 |
| **Phạm vi** | Skill mới `minipower-router-retro` · sổ bài học `docs/00-governance/lessons.md` · GitHub Issue trên repo minipower · số phiên bản cho mọi skill · workflow `upgrade-from-lesson` trong `skill-author` |
| **Ngoài phạm vi** | Tự cải thiện (auto improve) ở mọi mức · công thức đánh giá chất lượng skill (ADR riêng của chủ repo) · cài `gh` / CLI · file bài học ngoài skeleton · hook máy chấm "tốt / chưa tốt" · đổi `profile.json` |
| **Nối tiếp** | [ADR-026](../doing/ADR-026-2026-08-27-phuong-phap-danh-gia-chat-luong-minipower.md) P4 · [ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) §3.5 · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1 · QĐ-7 · QĐ-9 · QĐ-12 · [ADR-038](../done/ADR-038-2026-09-26-init-be-mat-docs-va-code.md) · [ADR-043](../done/ADR-043-2026-10-28-router-triage-plan-nhieu-task-review-cuoi.md) QĐ-7 · [cross-repo-bridge](../../contracts/cross-repo-bridge.md) · [shared-conventions](../../contracts/shared-conventions.md) §Bảo mật · [l1-l2-l3](../../src/tasks/rules/l1-l2-l3-tasks.md) |
| **Mục đích** | Bài học đi đâu khi skill làm chưa tốt; issue nói gì và không được nói gì; số phiên bản để làm gì; agent định kỳ được làm tới đâu |
| **Ảnh hưởng (khi accepted)** | Xem [Kỹ thuật] §10 |

---

## §1. Bối cảnh — chuyện gì đang xảy ra

Khi một skill của Minipower làm việc chưa tốt, người dùng sửa tại chỗ trong phiên rồi bài học đó mất. Dự án sau lại mắc đúng lỗi đó. Tác giả không biết skill nào hay hỏng.

Skill cũng không có số phiên bản. Vì vậy không ai nói được "lỗi xảy ra ở bản nào, đã sửa ở bản nào". Dự án đích dùng skill qua đường link trỏ thẳng về repo minipower, nên luôn chạy bản mới nhất mà không có dấu vết.

Minipower đã có công cụ soát skill (8 tiêu chí trong `skill-author`), nhưng chưa có đầu vào có cấu trúc cho nó. Repo minipower nằm trên GitHub, công khai, có mục Issues nhưng chưa có khuôn issue hay nhãn.

## §2. Quyết định — làm gì

**Một.** Thêm skill `retro` để bắt bài học. Khi người dùng nói "chỗ này làm chưa tốt", AI làm theo thứ tự cố định: liệt kê điểm chưa tốt có trích dẫn → đề xuất nguyên nhân thuộc loại nào (skill viết sai · dự án thiếu tiền đề · model hiểu sai · khác) → rút bài học một câu *"trong tình huống X, làm Y thay vì Z"* → ghi vào sổ bài học của dự án → soạn nháp issue cho người duyệt → đăng → hỏi một lần: **nâng skill ngay** hay **gom lại xử lý sau**.

**Hai.** Bài học lưu ở hai nơi, hai vai trò:

- **Sổ `docs/00-governance/lessons.md`** trong repo dự án là bản ghi của dự án. Sổ có sẵn từ lúc init bề mặt tài liệu, lưu và publish theo đúng cách dự án đã chọn (git hoặc Outline). Sổ ghi ngữ cảnh thật. Mọi bài học đều vào sổ, kể cả bài không đăng.
- **GitHub Issue** trên repo minipower là kênh gửi về tác giả. Mọi loại vấn đề đều có thể thành issue, nhưng **chỉ khi người quyết**. Issue phải ẩn danh: không tên dự án, không tên khách, không tên người, không thông tin dự án; đối tượng gọi là X, Y, A, B.

**Ba.** Chỉ đi qua MCP. Không cài công cụ dòng lệnh, không tự tạo file ở chỗ khác. Phiên chưa có MCP GitHub thì AI dừng ở bản nháp và nói rõ chưa đăng.

**Bốn.** Issue có khuôn cố định 11 mục theo thứ tự: bối cảnh → công việc → hiện tượng → nguyên nhân → giải pháp đề xuất → skill và phiên bản → loại → mức ưu tiên → mức ảnh hưởng → phần ảnh hưởng → ô tick xác nhận đã ẩn danh. Không tick thì GitHub không cho gửi.

**Năm.** Mọi skill có số phiên bản và sổ thay đổi. Sửa câu chữ tăng số cuối; thêm năng lực tăng số giữa; đổi đầu ra tăng số đầu. Máy kiểm hai việc: skill nào cũng phải có số phiên bản, và sửa skill mà quên tăng số thì CI nhắc.

**Sáu.** Agent định kỳ của chủ repo chỉ được **đánh giá**, không được tự sửa. Nó đọc issue đang mở, phân tích bằng chính tiêu chí soát skill của Minipower, viết nhận xét lên từng issue, gom thành một bản tổng hợp theo kỳ. Người đọc bản tổng hợp rồi quyết: sửa, bỏ, hay gộp. Chỉ sau khi người quyết, bước **thi hành** mới chạy: vẫn chờ xác nhận trước khi ghi file, tăng phiên bản, ghi sổ thay đổi, đóng issue. Không bao giờ tự merge.

## §3. Lý do — vì sao chọn như vậy

- **Người quyết, AI chuẩn bị.** Tín hiệu "chưa tốt" phải đến từ người, vì không máy nào tự chấm được việc mình làm. Mọi bước đẩy ra ngoài (đăng issue, comment, đóng issue) đều có người OK bản nháp trước.
- **Tránh bẫy "AI tự cải thiện".** ADR-001 §3.5 đã chỉ ra dự án superpowers chết vì để AI tự sửa skill theo một thước đo không phải thứ đang chạy. Khi chưa có thước đo thật, tự sửa chỉ là tự thay đổi. Vì vậy ADR này dừng ở đánh giá và tổng hợp; thước đo để ADR riêng.
- **Một hàng đợi chung, một bản ghi riêng.** Issue trên GitHub cho agent định kỳ chỉ quét một chỗ. Sổ trong dự án giữ bài học kể cả khi người chọn không đăng, và không bị ràng buộc ẩn danh.
- **Số phiên bản là ngôn ngữ chung** giữa issue (lỗi ở bản nào), agent (đã nâng lên bản nào) và người (dự án đang chạy bản nào). Không phải để khoá bản, vì dự án vẫn dùng link thẳng.
- **Không mở module mới.** Bắt bài học là việc của pack `router` vì pack này luôn được cài; nâng cấp là năng lực sẵn có của `skill-author`, chỉ thêm một workflow.

## §4. Hệ quả — được gì, trả giá gì

- **Được:** bài học có bản ghi trong dự án và một kênh chung về tác giả, có số hiệu, có trạng thái. Ba bên nói cùng một số phiên bản. Agent làm phần đọc và phân tích tốn thời gian; người giữ quyết định. Không module mới, không hook chặn mới.
- **Trả giá:** mỗi skill thêm hai dòng khai báo và một file sổ thay đổi. Việc tăng phiên bản chỉ được máy nhắc, chưa chặn. Ẩn danh là lời cộng một ô tick; không máy nào đọc được ngữ nghĩa, nên vẫn phải người soát trước khi đăng vì repo công khai.
- **Để sau, không nối vào đây:** nâng kiểm tra phiên bản từ nhắc sang chặn · nhắc tự động khi gọi skill đang có bài học mở · thước đo chất lượng và mọi dạng tự cải thiện (ADR riêng).

---

## §5. [Kỹ thuật] Phương án đã cân nhắc

| # | Phương án | | Lý do |
|---|---|---|---|
| O1 | File local làm **kênh** về tác giả, agent gom từ nhiều repo | ❌ | Phân tán, dễ dính thông tin dự án |
| O1b | File local làm **bản ghi của dự án** (`docs/00-governance/lessons.md` trong skeleton), issue làm kênh | ✅ | Chủ repo chốt 2026-10-29 |
| O2 | **GitHub Issue trên repo minipower** qua MCP; template + nhãn là hợp đồng với agent định kỳ | ✅ | Một hàng đợi, có trạng thái, có số hiệu back-ref |
| O3 | Version ở `PACK.md` thôi | ❌ | Bài học trỏ về lá, không về pack |
| O4 | `version:` khoá tầng trên frontmatter | ❌ | Spec Agent Skills không có; repo đã dùng `metadata.*` |
| O5 | Agent định kỳ tự sửa và merge | ❌ | Bẫy ADR-001 §3.5; trái ADR-022 QĐ-1 |
| O6 | **Agent định kỳ: đánh giá → tổng hợp → người quyết → thi hành** | ✅ | Chủ repo chốt |

## §6. [Kỹ thuật] Skill `minipower-router-retro`

Một việc: biến phản hồi của người thành bài học có cấu trúc, đưa về tác giả. Không sửa skill, không sửa DOC. Kích hoạt khi người nói *chưa tốt · sai rồi · rút kinh nghiệm · báo lỗi skill*, hoặc finding review cuối (ADR-043 QĐ-7) mà người quy cho skill.

| Bước | Việc | Ai |
|---|---|---|
| 1 | Điểm chưa tốt: từng dòng, trích đúng chỗ trong output | AI |
| 2 | Nguyên nhân: `skill` (chỉ dòng nào của SKILL.md) · `prereq` · `model` · `other` | AI đề xuất |
| 3 | Bài học một câu | AI |
| 4 | Ghi dòng `LSN-NNN` vào sổ §6.1; `docs_provider: outline` → publish theo SOP docs-outline (L3) | AI, người OK |
| 5 | Nháp issue theo §7, ẩn danh, kèm đề xuất ưu tiên / ảnh hưởng (L1) | AI |
| 6 | OK / sửa / bỏ (L2). `prereq` vẫn đăng được nếu người muốn; AI chỉ nhắc ghi thêm `open-questions` / `doc-debt` | Người |
| 7 | Gọi MCP `feedback` tạo issue (L3), báo `#NNN`, điền vào dòng `LSN` | AI |
| 8 | Hỏi một lượt: **nâng ngay** (chạy §8 chế độ thi hành với `#NNN`) · **gom lại** (issue để mở) | Người |

Không có MCP `feedback`: sổ vẫn ghi (bước 4), nháp in đầy đủ, nói rõ *chưa đăng*, hướng dẫn nối MCP. Không thử CLI, không tạo file ngoài skeleton. Dự án không có bề mặt `docs` thì không có sổ, chỉ issue.

### 6.1 Sổ `docs/00-governance/lessons.md`

Ship trong `src/router/docs-skeleton/00-governance/` cạnh `baseline-history.md` · `doc-versioning.md` — không mã DOC (ADR-041), không vào `rules.json`. Init bề mặt `docs` (ADR-038) copy sang dự án như mọi file skeleton.

| Cột | Ghi gì |
|---|---|
| `LSN-NNN` | Số tăng dần trong dự án |
| Ngày | YYYY-MM-DD |
| Skill@version | Lá gây lỗi, từ `metadata.version` |
| Bài học | *Trong tình huống X, làm Y thay vì Z* |
| Loại | skill · prereq · model · other |
| Trạng thái | ghi nhận · đã đăng `#NNN` · đã nâng `@x.y.z` · không đăng (lý do) |

Sổ trong repo dự án nên **được** ghi ngữ cảnh thật; ẩn danh chỉ áp khi soạn issue. Kỳ sau gặp `LSN` tương tự → gộp, không mở issue mới.

## §7. [Kỹ thuật] Issue template và nhãn

`.github/ISSUE_TEMPLATE/lesson.yml`, tất cả trường bắt buộc, thứ tự do chủ repo chốt:

| # | Trường | Nội dung |
|---|---|---|
| 1 | Bối cảnh | Loại dự án, `project_mode`, pack, stack — không tên dự án / khách / người |
| 2 | Công việc | Yêu cầu gì, skill nào, đầu vào tóm tắt bằng X/Y/A/B |
| 3 | Hiện tượng | Sai ở đâu, trích đoạn đã ẩn danh |
| 4 | Nguyên nhân | Dòng / mục nào của SKILL.md, workflow, template; hoặc "không rõ" |
| 5 | Giải pháp đề xuất | Sửa gì, ở đâu; bài học một câu |
| 6 | Skill@version | `minipower-…@x.y.z` |
| 7 | Loại | skill · prereq · model · other |
| 8 | Ưu tiên | P1 artifact sai mà người không thấy ngay · P2 sai nhưng dễ thấy · P3 câu chữ |
| 9 | Mức ảnh hưởng | cao ≥2 pack hoặc contract/hook · vừa một lá · thấp một workflow/provider |
| 10 | Phần ảnh hưởng | Đường dẫn trong repo minipower, một dòng một mục |
| 11 | Checklist ẩn danh | Checkbox `required`: không tên dự án · khách · người · secret; đã đổi thành X/Y/A/B |

Nhãn, SSOT `rules.json` khối `feedback` (`repo` + `labels`), bảng trong SKILL.md retro sinh bằng `npm run gen`: `lesson` · `kind:{skill,prereq,model,other}` · `priority:{p1,p2,p3}` · `impact:{high,medium,low}` · `status:{batched,assessed,decided}` · `skill:<tên-lá>` (động, test chỉ canh tiền tố). MCP gọi bằng tên trừu tượng `feedback` (ADR-022 QĐ-9), khai trong `router/PACK.md`.

## §8. [Kỹ thuật] Version lá và workflow `upgrade-from-lesson`

### 8.1 Version

```yaml
metadata:
  workflow: github
  version: 1.0.0
```

| Luật | Nội dung |
|---|---|
| Ai có | Mọi lá `minipower-*`; provider / pattern con theo lá cha |
| Bump | patch: câu chữ, link · minor: thêm workflow / provider / template, mở rộng `description` · major: đổi output, ID, hợp đồng consumer dựa vào |
| CHANGELOG | `CHANGELOG.md` trong lá, mới nhất lên trên: `## x.y.z · YYYY-MM-DD`, có `#NNN` khi từ bài học; khuôn `skill-author/templates/CHANGELOG.md.tpl` |
| `PACK.md version` | Độc lập, giữ nghĩa release của pack |
| Máy kiểm | catalog test: có semver + có CHANGELOG — **cứng** · `version:check`: thư mục lá đổi so với nhánh gốc mà `version:` không đổi → WARN (Q2) |

Back-ref hai chiều theo `cross-repo-bridge`: issue ghi `skill@version` lúc lỗi; CHANGELOG ghi `#NNN` lúc sửa; issue đóng bằng comment trỏ version mới.

### 8.2 Workflow, trong `skill-author/workflows/`, một lần chạy một chế độ

**Đánh giá** (cron của chủ repo chạy; người cũng chạy được): đọc issue `lesson` chưa `status:assessed` → đối chiếu skill hiện tại + 8 tiêu chí soát → xếp **update** (diff cụ thể) / **wontfix** / **gộp** `#MMM` / **cần hỏi** → comment lên issue + gắn `status:assessed` → mở hoặc cập nhật issue tổng hợp theo kỳ (Q3). **Không sửa file nào.** Khi chạy không người, comment ghi rõ *đề xuất của agent, chờ người quyết*.

**Thi hành** (chỉ khi `status:decided` hoặc người gọi trực tiếp với `#NNN`): đề xuất diff → **chờ xác nhận** → sửa · bump theo 8.1 · mục CHANGELOG `(#NNN)` → `npm test` · `link:check` · `version:check` → người duyệt commit → comment *đã nâng `skill@x.y.z`* và đóng issue (L3).

Cron, lịch, tài khoản là của chủ repo (ADR-022 QĐ-12); repo chỉ cung cấp workflow và prompt mẫu trong README skill-author. Cron có quyền ghi repo thì chỉ mở PR.

## §9. [Kỹ thuật] Confirm — chốt 2026-11-07, theo đề xuất

| # | Câu hỏi | Quyết |
|---|---|---|
| Q1 | Version ban đầu | `1.0.0` lá đã commit · `0.1.0` ba lá chưa commit (`orgs` · `orgstructure` · `tenants`) |
| Q2 | `version:check` | WARN; nâng FAIL sau 2 lần nâng skill thật |
| Q3 | Issue tổng hợp | `lesson-digest-YYYY-WW`, chỉ tạo khi có việc |
| Q4 | Bài học có kèm eval case không | Không — thước đo thuộc ADR đánh giá riêng; comment đánh giá chỉ ghi "ứng viên eval" |
| Q5 | Chỗ đặt sổ bài học | `docs/00-governance/lessons.md` (bề mặt `docs`, publish theo `docs_provider`) thay vì `memory/` (lõi, không publish) |

## §10. [Kỹ thuật] Ảnh hưởng, việc triển khai, xác minh

**Ảnh hưởng (khi accepted):** `src/router/skills/minipower-router-retro/` (mới) · `src/router/PACK.md` · hub router + `README.md` gốc · `AGENTS.md` · `src/router/docs-skeleton/00-governance/lessons.md` (mới) + `docs-skeleton/README.md` + `skeleton.test.js` · `.github/ISSUE_TEMPLATE/lesson.yml` (mới) · `rules.json` khối `feedback` + `gen-agents-doc.js` · mọi `SKILL.md` lá + `CHANGELOG.md` mỗi lá (mới) · `skill-author/` (workflow + template mới) · test `minipower-catalog` · `feedback.test.js` (mới) · `version-check.js` (mới) + CI.

Thứ tự: máy kiểm được trước (version), rồi hợp đồng (template + nhãn), rồi lá / workflow dùng hợp đồng.

| Bước | Việc | Done khi |
|---|---|---|
| 1 | `rules.json` khối `feedback`; `gen-agents-doc.js` sinh bảng nhãn | `gen` · `gen:check` xanh |
| 2 | Script một lần: đóng dấu `metadata.version` (Q1) + `CHANGELOG.md` mọi lá; xoá script sau khi chạy | Diff mỗi lá: +2 dòng frontmatter, +1 file |
| 3 | Catalog test: semver + CHANGELOG — cứng | `npm test` xanh |
| 4 | `bin/version-check.js` + `npm run version:check` + bước CI (WARN) + test trên fixture git giả | WARN đúng case gài, 0 báo sai trên repo hiện tại |
| 5 | `docs-skeleton/00-governance/lessons.md` + dòng trong `docs-skeleton/README.md` + `skeleton.test.js` | `npm test` xanh |
| 6 | `lesson.yml` + `feedback.test.js` (đủ 11 trường đúng thứ tự · nhãn ⊆ rules · checkbox `required`) | `npm test` xanh |
| 7 | Lá retro (SKILL.md · README.md có *Không dùng cho* · `workflows/capture.md`) · `router/PACK.md` `mcp: [feedback]` · hub · README gốc | catalog + router test · `link:check` 0 mới |
| 8 | `skill-author`: `workflows/upgrade-from-lesson.md` · `templates/CHANGELOG.md.tpl` · SKILL.md / README.md (prompt mẫu cho cron) | `toolbox-pack` test · `link:check` |
| 9 | `AGENTS.md`: version lá + luật bump · `cross-repo-bridge.md`: back-ref issue ↔ CHANGELOG | — |
| 10 | `gen` → `test` → `gen:check` → `link:check` xanh cả bốn | — |

Smoke (chủ repo, cần GitHub MCP): phiên dự án đích nói "chưa tốt" → sổ có dòng `LSN` → issue thật đúng nhãn → chế độ đánh giá ra comment + digest → chế độ thi hành bump version + CHANGELOG + đóng issue.

| # | Xác minh | Cách |
|---|---|---|
| T1 | Mọi lá có `metadata.version` semver + `CHANGELOG.md` | catalog test |
| T2 | Nhãn template ⊆ rules; bảng nhãn SKILL.md retro là generated | `feedback.test.js` · `gen:check` |
| T3 | Lá đổi mà version không đổi → WARN | `version:check` trên fixture + PR thật |
| T4 | Chế độ đánh giá không sửa file | `git status` sạch sau khi chạy |
| T5 | Retro không MCP: dừng ở nháp · issue không chứa tên dự án / khách / người | Người soát; checkbox `required` chặn submit |
| T6 | Skeleton `docs` có `00-governance/lessons.md`; retro không tạo file ngoài skeleton | `skeleton.test.js` · người soát SKILL.md retro |
| T7 | 0 link gãy mới | `link:check` |
