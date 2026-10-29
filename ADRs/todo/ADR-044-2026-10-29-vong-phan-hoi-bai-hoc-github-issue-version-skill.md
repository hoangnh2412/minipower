# Vòng phản hồi: bài học thành GitHub Issue cho tác giả · skill có version · agent định kỳ đánh giá, người quyết nâng

| | |
|---|---|
| **Ngày** | 2026-10-29 |
| **Trạng thái** | ⚪ Todo — hướng chốt với chủ repo 2026-10-28→29 (điều chỉnh 29/10: cho sổ bài học local theo skeleton `docs`); Q1–Q5 §5 là giả định |
| **Phạm vi** | **A.** Lá `minipower-router-retro`: phản hồi "chưa tốt" của người → sổ bài học của dự án (`docs/00-governance/lessons.md`, theo skeleton bề mặt `docs`) → issue trên repo minipower qua MCP khi người quyết. **B.** `metadata.version` + `CHANGELOG.md` cho mọi lá. **C.** Workflow `upgrade-from-lesson` trong `skill-author` cho agent định kỳ |
| **Ngoài phạm vi** | AI tự nâng rồi tự merge · cài `gh` / CLI · file bài học ngoài skeleton (tự đặt chỗ) · hook máy chấm "tốt / chưa tốt" · eval case theo bài học (Q4) · đổi `profile.json` |
| **Nối tiếp** | [ADR-026](../doing/ADR-026-2026-08-27-phuong-phap-danh-gia-chat-luong-minipower.md) P4 (thiếu tín hiệu ngược) · [ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) §3.5 (bẫy autoimprove) · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1 · QĐ-7 · QĐ-9 · QĐ-12 · [ADR-043](../doing/ADR-043-2026-10-28-router-triage-plan-nhieu-task-review-cuoi.md) QĐ-7 (finding review cuối là một nguồn retro) · [cross-repo-bridge](../../contracts/cross-repo-bridge.md) · [lingua-franca](../../contracts/lingua-franca.md) §Bảo mật · [l1-l2-l3](../../src/tasks/rules/l1-l2-l3-tasks.md) |
| **Mục đích** | Bài học đi đâu khi skill làm chưa tốt; issue nói gì và không được nói gì; version lá để làm gì; agent định kỳ được làm tới đâu |
| **Ảnh hưởng (khi accepted)** | `src/router/skills/minipower-router-retro/` (mới) · `src/router/PACK.md` · hub router + `README.md` gốc · `AGENTS.md` · `src/router/docs-skeleton/00-governance/lessons.md` (mới) + `docs-skeleton/README.md` + `skeleton.test.js` · `.github/ISSUE_TEMPLATE/lesson.yml` (mới) · `rules.json` khối `feedback` + `gen-agents-doc.js` · mọi `SKILL.md` lá + `CHANGELOG.md` mỗi lá (mới) · `skill-author/` (workflow + template mới) · test `minipower-catalog` · `feedback.test.js` (mới) · `version-check.js` (mới) + CI |

---

## §1. Bối cảnh và vấn đề

| # | Hiện trạng (đối chiếu 2026-10-28) | Hệ quả |
|---|---|---|
| P1 | Không có chỗ ghi bài học — `memory/` chỉ có decision-log · open-questions · doc-debt · memory.md | Lỗi skill sửa tại chỗ rồi mất; dự án sau mắc lại; tác giả không biết lá nào hay hỏng |
| P2 | Lá không có version — chỉ `PACK.md` có `version`; installer symlink lá nên dự án đích luôn chạy HEAD | Không nói được "lỗi ở bản nào, sửa ở bản nào" |
| P3 | `skill-author` đã có *Soát skill có sẵn* (8 tiêu chí) nhưng không có đầu vào có cấu trúc | Nâng cấp theo trí nhớ |
| P4 | Repo `hoangnh2412/minipower` public, Issues bật, chưa có template / nhãn; phiên hiện tại không có GitHub MCP, máy không có `gh` | Kênh về tác giả phải tự khai; nội dung issue phải ẩn danh |

## §2. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | Tín hiệu "chưa tốt" **đến từ người**; AI không tự chấm việc mình |
| C2 | Không AI tự nâng rồi tự merge (ADR-001 §3.5 · ADR-022 QĐ-1) — mọi sửa qua cổng xác nhận của `skill-author` |
| C3 | Kênh về tác giả chỉ qua MCP; không CLI. Không có MCP → dừng ở nháp trong chat |
| C3b | Sổ bài học local **theo cách lưu trữ dự án khai lúc init** (ADR-038): file có sẵn trong skeleton bề mặt `docs`, SSOT theo `docs_provider` (`local` = git; `outline` = publish qua `minipower-docs-outline`, L3). Không tạo file ở chỗ khác; dự án không có bề mặt `docs` thì không có sổ, chỉ issue |
| C4 | Ẩn danh: không tên dự án / khách / người / thông tin dự án; đối tượng gọi X, Y, A, B; không secret |
| C5 | L1 nháp → L2 người OK → L3 gọi MCP ghi — áp cho tạo issue, comment, đóng |
| C6 | Không module mới: retro là lá `router/` (QĐ-7 câu 1); nâng cấp là `workflows/` của `skill-author` (câu 3) |

## §3. Phương án

| # | Phương án | | Lý do |
|---|---|---|---|
| O1 | File local làm **kênh** về tác giả, agent gom từ nhiều repo | ❌ | Phân tán, dễ dính thông tin dự án |
| O1b | File local làm **bản ghi của dự án** (`docs/00-governance/lessons.md` trong skeleton), issue làm kênh | ✅ | Dự án giữ được bài học kể cả khi không đăng; chủ repo chốt 2026-10-29 |
| O2 | **GitHub Issue trên repo minipower** qua MCP; template + nhãn là hợp đồng với agent định kỳ | ✅ | Một hàng đợi, có trạng thái, có số hiệu để back-ref |
| O3 | Version ở `PACK.md` thôi | ❌ | Bài học trỏ về lá, không về pack |
| O4 | `version:` khoá tầng trên frontmatter | ❌ | Spec Agent Skills không có; repo đã dùng `metadata.*` |
| O5 | Agent định kỳ tự sửa và merge | ❌ | C2 |
| O6 | **Agent định kỳ: đánh giá → tổng hợp → người quyết → thi hành** | ✅ | Chủ repo chốt |

## §4. Quyết định

| # | Quyết định |
|---|---|
| QĐ-1 | Lá **`minipower-router-retro`** (§4.1). Mọi loại vấn đề đều có thể thành issue **khi người quyết**; AI phân loại và đề xuất, không tự lọc |
| QĐ-2 | Bản ghi: `docs/00-governance/lessons.md` theo skeleton (§4.5). Kênh về tác giả: GitHub Issue qua MCP tên trừu tượng **`feedback`** (C3) |
| QĐ-3 | Issue template 11 trường + bộ nhãn, SSOT `rules.json` khối `feedback` (§4.2) |
| QĐ-4 | Version lá: `metadata.version` semver · `CHANGELOG.md` mỗi lá · cổng máy (§4.3) |
| QĐ-5 | `upgrade-from-lesson` hai chế độ **đánh giá** / **thi hành**; agent định kỳ chỉ chạy đánh giá, không merge (§4.4) |
| QĐ-6 | Back-ref hai chiều: issue ghi `skill@version` lúc lỗi; CHANGELOG ghi `#NNN` lúc sửa |

### 4.1 Lá `minipower-router-retro`

Một việc: biến phản hồi của người thành bài học có cấu trúc, đưa về tác giả. Không sửa skill, không sửa DOC. Kích hoạt khi người nói *chưa tốt · sai rồi · rút kinh nghiệm · báo lỗi skill*, hoặc finding review cuối (ADR-043) mà người quy cho skill.

| Bước | Việc | Ai |
|---|---|---|
| 1 | Điểm chưa tốt: từng dòng, trích đúng chỗ trong output | AI |
| 2 | Nguyên nhân: `skill` (chỉ dòng nào của SKILL.md) · `prereq` (thiếu tiền đề dự án) · `model` · `other` | AI đề xuất |
| 3 | Bài học một câu: *trong tình huống X, làm Y thay vì Z* | AI |
| 4 | Ghi một dòng `LSN-NNN` vào sổ §4.5 (mọi bài học, kể cả sau này không đăng); `docs_provider: outline` → publish theo SOP docs-outline | AI, người OK |
| 5 | Nháp issue theo §4.2, ẩn danh (C4), kèm đề xuất ưu tiên / ảnh hưởng | AI |
| 6 | OK / sửa / bỏ (L2). `prereq` vẫn đăng được nếu người muốn; AI chỉ nhắc ghi thêm `open-questions` / `doc-debt` | Người |
| 7 | Gọi MCP tạo issue (L3), báo `#NNN`, điền `#NNN` vào dòng `LSN` | AI |
| 8 | Hỏi một lượt: **nâng ngay** (chạy §4.4 chế độ thi hành với `#NNN`) · **gom lại** (issue để mở) | Người |

Không có MCP `feedback`: sổ vẫn ghi (bước 4), nháp in đầy đủ, nói rõ *chưa đăng*, hướng dẫn nối MCP. Không thử CLI.

### 4.2 Template và nhãn

`.github/ISSUE_TEMPLATE/lesson.yml`, thứ tự trường do chủ repo chốt; tất cả bắt buộc:

| # | Trường | Nội dung |
|---|---|---|
| 1 | Bối cảnh | Loại dự án, `project_mode`, pack, stack — không tên dự án / khách / người |
| 2 | Công việc | Yêu cầu gì, skill nào, đầu vào tóm tắt bằng X/Y/A/B |
| 3 | Hiện tượng | Sai ở đâu, trích đoạn đã ẩn danh |
| 4 | Nguyên nhân | Dòng / mục nào của SKILL.md, workflow, template; hoặc "không rõ" |
| 5 | Giải pháp đề xuất | Sửa gì, ở đâu; bài học một câu |
| 6 | Skill@version | `minipower-…@x.y.z` đọc từ `metadata.version` |
| 7 | Loại | skill · prereq · model · other |
| 8 | Ưu tiên | P1 artifact sai mà người không thấy ngay · P2 sai nhưng dễ thấy · P3 câu chữ |
| 9 | Mức ảnh hưởng | cao ≥2 pack hoặc contract/hook · vừa một lá · thấp một workflow/provider |
| 10 | Phần ảnh hưởng | Đường dẫn trong repo minipower, một dòng một mục |
| 11 | Checklist ẩn danh | Checkbox `required`: không tên dự án · khách · người · secret; đã đổi thành X/Y/A/B |

Nhãn: `lesson` · `kind:{skill,prereq,model,other}` · `priority:{p1,p2,p3}` · `impact:{high,medium,low}` · `status:{batched,assessed,decided}` · `skill:<tên-lá>` (động, test chỉ canh tiền tố). Bảng nhãn trong SKILL.md retro sinh từ `rules.json` bằng `npm run gen`.

### 4.3 Version lá

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

### 4.4 Workflow `upgrade-from-lesson`

Trong `skill-author/workflows/`. Một lần chạy một chế độ.

**Đánh giá** (cron của chủ repo chạy; người cũng chạy được): đọc issue `lesson` chưa `status:assessed` → đối chiếu skill hiện tại + 8 tiêu chí soát → xếp **update** (diff cụ thể) / **wontfix** / **gộp** `#MMM` / **cần hỏi** → comment lên issue + gắn `status:assessed` → mở hoặc cập nhật issue tổng hợp theo kỳ (Q3). **Không sửa file nào.** Khi chạy không người, comment ghi rõ *đề xuất của agent, chờ người quyết*.

**Thi hành** (chỉ khi `status:decided` hoặc người gọi trực tiếp với `#NNN`): đề xuất diff → **chờ xác nhận** → sửa · bump theo §4.3 · mục CHANGELOG `(#NNN)` → `npm test` · `link:check` · `version:check` → người duyệt commit → comment *đã nâng `skill@x.y.z`* và đóng issue (L3).

Cron, lịch, tài khoản là của chủ repo (ADR-022 QĐ-12); repo chỉ cung cấp workflow và prompt mẫu trong README skill-author. Cron có quyền ghi repo thì chỉ mở PR.

### 4.5 Sổ bài học `docs/00-governance/lessons.md`

Ship trong `src/router/docs-skeleton/00-governance/` cạnh `baseline-history.md` · `doc-versioning.md` — không mang mã DOC (ADR-041: sổ governance không cấp DOC), không vào `rules.json`. Init bề mặt `docs` copy sang dự án như mọi file skeleton; `init --check` không đòi riêng.

| Cột | Ghi gì |
|---|---|
| `LSN-NNN` | Số tăng dần trong dự án |
| Ngày | YYYY-MM-DD |
| Skill@version | Lá gây lỗi, từ `metadata.version` |
| Bài học | Một câu *trong tình huống X, làm Y thay vì Z* |
| Loại | skill · prereq · model · other |
| Trạng thái | ghi nhận · đã đăng `#NNN` · đã nâng `@x.y.z` · không đăng (lý do) |

Sổ nằm trong repo dự án nên **được** ghi ngữ cảnh thật; ẩn danh chỉ áp khi soạn issue (C4). Sổ là đầu vào cho retro ở kỳ sau cùng dự án (đã có `LSN` tương tự → gộp, không tạo issue mới).

## §5. Confirm — giả định đang dùng

| # | Câu hỏi | Giả định |
|---|---|---|
| Q1 | Version ban đầu | `1.0.0` lá đã commit · `0.1.0` ba lá chưa commit (`orgs` · `orgstructure` · `tenants`) |
| Q2 | `version:check` | WARN; nâng FAIL sau 2 lần nâng skill thật |
| Q3 | Issue tổng hợp | `lesson-digest-YYYY-WW`, chỉ tạo khi có việc |
| Q4 | Eval case theo bài học | Chưa — chờ ADR-026 Đợt 1 qua Đ1.4; comment đánh giá ghi "ứng viên eval" là đủ |
| Q5 | Chỗ đặt sổ bài học | `docs/00-governance/lessons.md` (bề mặt `docs`, publish theo `docs_provider`) thay vì `memory/` (lõi, không publish) |

## §6. Việc triển khai

Máy kiểm được trước (B), rồi hợp đồng (template + nhãn), rồi lá / workflow dùng hợp đồng.

| Bước | Việc | Done khi |
|---|---|---|
| 1 | `rules.json` khối `feedback` (`repo`, `labels`); `gen-agents-doc.js` sinh bảng nhãn | `gen` · `gen:check` xanh |
| 2 | Script một lần: đóng dấu `metadata.version` (Q1) + `CHANGELOG.md` mọi lá; xoá script sau khi chạy | Diff mỗi lá: +2 dòng frontmatter, +1 file |
| 3 | Catalog test: semver + CHANGELOG — cứng | `npm test` xanh |
| 4 | `bin/version-check.js` + `npm run version:check` + bước CI (WARN) + test trên fixture git giả | WARN đúng case gài, 0 báo sai trên repo hiện tại |
| 5a | `docs-skeleton/00-governance/lessons.md` + dòng trong `docs-skeleton/README.md` + `skeleton.test.js` | `npm test` xanh |
| 5 | `lesson.yml` + `feedback.test.js` (đủ 11 trường đúng thứ tự · nhãn ⊆ rules · checkbox `required`) | `npm test` xanh |
| 6 | Lá retro (SKILL.md · README.md có *Không dùng cho* · `workflows/capture.md` gồm ghi sổ §4.5) · `router/PACK.md` `mcp: [feedback]` · hub · README gốc | catalog + router test · `link:check` 0 mới |
| 7 | `skill-author`: `workflows/upgrade-from-lesson.md` · `templates/CHANGELOG.md.tpl` · SKILL.md / README.md (prompt mẫu cho cron) | `toolbox-pack` test · `link:check` |
| 8 | `AGENTS.md`: version lá + luật bump, một đoạn · `cross-repo-bridge.md`: back-ref issue ↔ CHANGELOG | — |
| 9 | `gen` → `test` → `gen:check` → `link:check` xanh cả bốn | — |

Smoke (chủ repo, cần GitHub MCP): phiên dự án đích nói "chưa tốt" → issue thật đúng nhãn → chế độ đánh giá ra comment + digest → chế độ thi hành bump version + CHANGELOG + đóng issue.

## §7. Xác minh

| # | Kiểm | Cách |
|---|---|---|
| T1 | Mọi lá có `metadata.version` semver + `CHANGELOG.md` | catalog test |
| T2 | Nhãn template ⊆ rules; bảng nhãn SKILL.md retro là generated | `feedback.test.js` · `gen:check` |
| T3 | Lá đổi mà version không đổi → WARN | `version:check` trên fixture + PR thật |
| T4 | Chế độ đánh giá không sửa file | `git status` sạch sau khi chạy |
| T5 | Retro không MCP: dừng ở nháp · issue không chứa tên dự án / khách / người | Người soát; checkbox `required` chặn submit |
| T6 | Skeleton `docs` có `00-governance/lessons.md`; retro không tạo file ngoài skeleton | `skeleton.test.js` · người soát SKILL.md retro |
| T7 | 0 link gãy mới | `link:check` |

## §8. Hệ quả

- **Được:** bài học có bản ghi trong dự án và một kênh chung về tác giả, có số hiệu, có trạng thái; ba bên (issue · agent · người) nói cùng version; agent làm phần đọc và phân tích, người giữ quyết định. Không module mới, không hook chặn mới.
- **Trả giá:** mỗi lá thêm 2 dòng + 1 file; bump version máy chỉ nhắc WARN; ẩn danh là lời + một checkbox, không máy nào đọc ngữ nghĩa.
- **Nợ để sau:** `version:check` lên FAIL (Q2) · eval case (Q4) · nhắc trong `auto-routing` khi gợi skill có issue mở (cần MCP trong hook, chưa có tiền lệ).
