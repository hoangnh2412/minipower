---
name: minipower-router-retro
description: Bắt bài học từ phản hồi "làm chưa tốt" thành dòng ghi trong sổ dự án (lessons.md) và nháp GitHub Issue ẩn danh gửi về tác giả Minipower qua MCP feedback, người OK rồi mới đăng. Dùng khi người nói chưa tốt, sai rồi, rút kinh nghiệm, báo lỗi skill — không tự sửa SKILL.md, không tự đăng khi chưa người OK, không auto improve.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-router-retro

Một việc: biến phản hồi của người thành bài học có cấu trúc, đưa về tác giả. **Không** sửa skill, không sửa DOC, không tự cải thiện (ADR-044 §3, kế thừa ADR-001 §3.5).

Hướng dẫn người: [README.md](README.md). Quy trình chi tiết: [workflows/capture.md](workflows/capture.md).

## Khi nào được gọi

Người nói *chưa tốt · sai rồi · rút kinh nghiệm · báo lỗi skill*, hoặc finding review cuối ([minipower-router-plan](../minipower-router-plan/SKILL.md) §Review cuối, ADR-043 QĐ-7) mà người quy cho một skill cụ thể.

## 8 bước (xem chi tiết từng bước ở workflows/capture.md)

| Bước | Việc | Ai |
|---|---|---|
| 1 | Điểm chưa tốt: từng dòng, trích đúng chỗ trong output | AI |
| 2 | Nguyên nhân: `skill` (chỉ dòng nào của SKILL.md) · `prereq` · `model` · `other` | AI đề xuất |
| 3 | Bài học một câu: *"Trong tình huống X, làm Y thay vì Z"* | AI |
| 4 | Ghi dòng `LSN-NNN` vào `docs/00-governance/lessons.md`; `docs_provider: outline` → publish theo SOP [minipower-docs-outline](../../../docs/skills/minipower-docs-outline/SKILL.md) (L3) | AI, người OK |
| 5 | Nháp GitHub Issue theo khuôn [lesson.yml](../../../../.github/ISSUE_TEMPLATE/lesson.yml), **ẩn danh**, kèm đề xuất ưu tiên/ảnh hưởng (L1) | AI |
| 6 | OK / sửa / bỏ (L2). `prereq` vẫn đăng được nếu người muốn; AI chỉ nhắc ghi thêm `memory/open-questions.md` / `memory/doc-debt.md` | Người |
| 7 | Gọi MCP `feedback` tạo issue (L3), báo `#NNN`, điền vào dòng `LSN` | AI |
| 8 | Hỏi một lượt: **nâng ngay** (chuyển sang `minipower-toolbox-skill-author` workflow `upgrade-from-lesson`, chế độ thi hành, với `#NNN`) · **gom lại** (issue để mở, `status:batched`) | Người |

**Không có MCP `feedback`:** dừng ở bước 5 — sổ vẫn ghi (bước 4), nháp in đầy đủ trong chat, nói rõ **chưa đăng**, hướng dẫn người nối MCP. Không thử CLI, không tạo file ngoài skeleton. Dự án không có bề mặt `docs` (ADR-038) → không có sổ, chỉ còn nháp issue.

## Ẩn danh — bắt buộc trước khi đăng

Issue công khai trên GitHub. Không tên dự án, không tên khách, không tên người, không secret — đổi thành X, Y, A, B. Checkbox mục 11 của `lesson.yml` là `required`; GitHub tự chặn submit nếu chưa tick, nhưng **không máy nào đọc được ngữ nghĩa** — người soát nội dung trước khi OK (bước 6).

## Nhãn GitHub Issue

<!-- BEGIN generated: feedback-labels (nguồn: hooks/lib/rules.json — chạy `npm run gen`) -->

| Nhãn | Ý nghĩa |
|------|---------|
| `lesson` | Mọi issue bài học từ retro đều gắn nhãn này |
| `kind:skill` | Nguyên nhân: SKILL.md viết sai/thiếu |
| `kind:prereq` | Nguyên nhân: dự án thiếu tiền đề |
| `kind:model` | Nguyên nhân: model hiểu sai, không phải lỗi skill |
| `kind:other` | Nguyên nhân khác, chưa rõ loại |
| `priority:p1` | Artifact sai mà người không thấy ngay |
| `priority:p2` | Sai nhưng dễ thấy |
| `priority:p3` | Chỉ câu chữ |
| `impact:high` | Ảnh hưởng ≥2 pack hoặc contract/hook |
| `impact:medium` | Ảnh hưởng một lá |
| `impact:low` | Ảnh hưởng một workflow/provider |
| `status:batched` | Gom lại, chưa xử lý ngay |
| `status:assessed` | Agent định kỳ đã đánh giá, chờ người quyết |
| `status:decided` | Người đã quyết, chờ thi hành |

<!-- END generated: feedback-labels -->

Nhãn `skill:<tên-lá>` **không** nằm trong bảng trên — gắn động theo catalog skill lúc tạo issue, không hardcode.

## Ranh giới

- **Không** auto improve: agent định kỳ của chủ repo chỉ đánh giá issue, **không** tự sửa/merge (§8.2 ADR-044). Nâng skill luôn qua `minipower-toolbox-skill-author`, người duyệt commit.
- **Không** đăng khi chưa người OK bản nháp (bước 6) — repo công khai.
- **Không** gọi CLI `gh` hay cài công cụ dòng lệnh — chỉ qua MCP `feedback`.
- Gate **mềm**: không hook nào chặn verdict loại/ưu tiên/ảnh hưởng — người quyết.
