# Capture — 8 bước bắt bài học

Chạy khi kích hoạt (xem [SKILL.md § Khi nào được gọi](../SKILL.md#khi-nào-được-gọi)). Không mở workflow nào khác trong lúc chạy — việc này không sửa skill, không sửa DOC.

## Bước 1 — Điểm chưa tốt

Trích đúng chỗ trong output đã sinh ra: dòng nào, file nào, hoặc câu nào của SKILL.md/README.md/workflow mâu thuẫn với kết quả thật. Không diễn giải chung ("chưa tốt" → phải cụ thể **cái gì** sai).

## Bước 2 — Nguyên nhân (AI đề xuất, không tự chốt)

| Loại | Khi nào |
|---|---|
| `skill` | SKILL.md/README.md/workflow/template của lá đó viết sai, thiếu, hoặc tự mâu thuẫn |
| `prereq` | Dự án thiếu tiền đề (DOC chưa có, profile chưa khai) — skill không có gì sai |
| `model` | Model hiểu sai yêu cầu, bỏ qua luật đã viết đúng trong skill |
| `other` | Không rõ, hoặc nguyên nhân khác ba loại trên |

Nêu rõ **dòng nào** của SKILL.md nếu chọn `skill` — không nói mơ hồ "skill viết chưa đủ rõ".

## Bước 3 — Bài học một câu

Khuôn cố định: *"Trong tình huống X, làm Y thay vì Z."* Không viết thành đoạn dài.

## Bước 4 — Ghi sổ dự án (người OK)

1. Đọc `docs/00-governance/lessons.md` (nếu dự án không có bề mặt `docs` → bỏ qua bước này, báo người, đi thẳng bước 5).
2. Số `LSN` tiếp theo = số lớn nhất đang có + 1.
3. Thêm dòng: `LSN-NNN` · ngày hôm nay · `tên-lá@version` (đọc `metadata.version` catalog) · bài học (bước 3) · loại (bước 2) · trạng thái `ghi nhận`.
4. Giữ **ngữ cảnh thật** — không cần ẩn danh ở bước này.
5. `memory/profile.json.docs_provider == "outline"` → publish theo SOP [minipower-docs-outline](../../../../docs/skills/minipower-docs-outline/SKILL.md) (L3, cần người OK riêng cho hành động publish).

## Bước 5 — Nháp GitHub Issue (ẩn danh)

Điền đủ 11 trường theo [lesson.yml](../../../../../.github/ISSUE_TEMPLATE/lesson.yml), in ra chat dạng bảng hoặc khối text để người đọc trước khi đăng:

1. Bối cảnh — loại dự án, `project_mode`, pack, stack
2. Công việc — yêu cầu gì, skill nào, input tóm tắt
3. Hiện tượng — trích đoạn đã ẩn danh
4. Nguyên nhân — dòng/mục cụ thể, hoặc "không rõ"
5. Giải pháp đề xuất — sửa gì, ở đâu + bài học
6. `Skill@version`
7. Loại (`kind:*`)
8. Ưu tiên — P1 artifact sai người không thấy ngay · P2 sai nhưng dễ thấy · P3 chỉ câu chữ
9. Mức ảnh hưởng — cao ≥2 pack/contract/hook · vừa một lá · thấp một workflow/provider
10. Phần ảnh hưởng — đường dẫn trong repo minipower, một dòng một mục
11. Checklist xác nhận ẩn danh

**Trước khi in nháp**, tự soát: còn tên dự án / khách / người / secret nào không — thay hết bằng X, Y, A, B.

## Bước 6 — Người duyệt (L2)

Người chọn: **OK** (qua bước 7) · **sửa** (quay lại bước 5 với góc sửa) · **bỏ** (dừng ở bước 4, không đăng — ghi trạng thái `không đăng (lý do)` vào dòng `LSN`).

`prereq` vẫn đăng được nếu người muốn (không có luật cấm loại nào) — AI chỉ nhắc thêm: nên ghi nợ vào `memory/open-questions.md` hoặc `memory/doc-debt.md` song song, vì nguyên nhân nằm ở dự án, đăng issue không tự sửa việc đó.

## Bước 7 — Đăng (L3, chỉ qua MCP)

1. Không có namespace MCP `feedback` trong catalog → dừng, báo rõ **chưa đăng được**, hướng dẫn người thêm server MCP GitHub (trỏ `hoangnh2412/minipower` — xem `FEEDBACK.repo` trong `rules.json`), không thử `gh` CLI.
2. Có MCP → tạo issue bằng `lesson.yml`, nhãn mặc định `lesson` + `kind:*` + `priority:*` + `impact:*` theo nội dung đã duyệt + `skill:<tên-lá>` (động).
3. Báo số `#NNN` cho người, cập nhật dòng `LSN` trong sổ dự án: trạng thái → `đã đăng #NNN`.

## Bước 8 — Hỏi một lượt

> "Issue #NNN đã đăng. Anh muốn nâng skill ngay, hay gom lại cho đợt sau?"

- **Nâng ngay** → chuyển sang `minipower-toolbox-skill-author`, workflow `upgrade-from-lesson`, **chế độ thi hành**, mang `#NNN` sang.
- **Gom lại** → không làm gì thêm; issue giữ nhãn `status:batched`, chờ agent định kỳ của chủ repo đánh giá (chế độ **đánh giá**, không sửa file nào).
