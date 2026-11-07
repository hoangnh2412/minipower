# Workflow: Nâng skill từ bài học (GitHub Issue `lesson`)

Nguồn việc: issue nhãn `lesson` trên repo minipower (tạo bởi [minipower-router-retro](../../../../router/skills/minipower-router-retro/SKILL.md), ADR-044 §8.2). Hai chế độ **tách biệt** — không trộn trong một lượt chạy.

| Chế độ | Ai gọi | Được làm | Không được làm |
|---|---|---|---|
| **Đánh giá** | Cron định kỳ của chủ repo, hoặc người gọi tay | Đọc, phân tích, comment, gắn nhãn | Sửa file, bump version, merge |
| **Thi hành** | Chỉ khi issue `status:decided`, hoặc người gọi trực tiếp kèm `#NNN` | Sửa file, bump version, ghi CHANGELOG, đóng issue | Tự quyết **update / wontfix / gộp** mà không chờ người |

Không bao giờ tự merge hay tự tạo PR có quyền ghi mà không qua người duyệt — kế thừa ADR-022 QĐ-1 (không agent tự chạy / tự bàn giao) và tránh bẫy "AI tự cải thiện" (ADR-001 §3.5).

## Chế độ Đánh giá

1. Liệt kê issue nhãn `lesson` **chưa** có nhãn `status:assessed` (dùng MCP `feedback`; không `gh` CLI).
2. Với mỗi issue: đọc `Skill@version` (trường 6) + nội dung issue, mở skill hiện tại đúng đường dẫn trong `Phần ảnh hưởng` (trường 10), đối chiếu 8 tiêu chí soát ở [workflows/extend-skill.md § Soát skill có sẵn](extend-skill.md#soát-skill-có-sẵn).
3. Xếp loại:

| Xếp loại | Khi nào |
|---|---|
| **update** | Đúng là lỗi skill, biết rõ sửa gì — kèm diff cụ thể (không chỉ mô tả chung) |
| **wontfix** | Không phải lỗi skill (vd. `kind:prereq`, `kind:model`), hoặc sửa sẽ phá quy ước khác |
| **gộp `#MMM`** | Trùng bài học đã có issue khác đang mở |
| **cần hỏi** | Thiếu thông tin để xếp loại chắc chắn |

4. Comment lên issue: xếp loại + lý do + (nếu `update`) diff đề xuất. Ghi rõ **"đề xuất của agent, chờ người quyết"** khi chạy không có người giám sát trực tiếp (cron).
5. Gắn nhãn `status:assessed`.
6. Mở hoặc cập nhật issue tổng hợp kỳ này `lesson-digest-YYYY-WW` (chỉ tạo khi có ≥ 1 issue xếp loại trong kỳ) — liệt kê số issue theo xếp loại, link tới từng issue.
7. **Không sửa file nào trong bước này** — verify: `git status` sạch sau khi chạy xong (T4 ADR-044).

## Chế độ Thi hành

Chỉ chạy khi issue đã `status:decided` (người đã xem comment đánh giá và chọn **update**), hoặc người gọi trực tiếp với `#NNN` và nói rõ muốn sửa gì.

1. Đọc diff đề xuất (từ comment đánh giá, hoặc tự soạn nếu gọi trực tiếp) → **trình người, chờ xác nhận** (Gate người, như mọi việc khác của skill-author).
2. Sau xác nhận: sửa SKILL.md/README.md/workflow liên quan.
3. Bump `metadata.version` theo luật ở [AGENTS.md § Quy ước đặt tên](../../../../../AGENTS.md) / ADR-044 §8.1 (patch/minor/major theo loại thay đổi).
4. Thêm dòng vào `CHANGELOG.md` của skill đó theo [templates/CHANGELOG.md.tpl](../templates/CHANGELOG.md.tpl), kèm `(#NNN)`.
5. Validate:
   ```bash
   cd src/router/hooks && npm test && npm run link:check && npm run version:check -- --base <ref trước khi sửa>
   ```
6. Người duyệt commit (quy tắc Git trong AGENTS.md — AI không tự commit/push).
7. Sau commit: comment lên issue *"đã nâng `{skill}@{version mới}"* + đóng issue qua MCP `feedback`.
8. Cập nhật dòng `LSN` tương ứng trong `docs/00-governance/lessons.md` của dự án gốc (nếu còn truy cập được) — trạng thái → `đã nâng @x.y.z`. Không truy cập được (dự án khác) → bỏ qua, không bịa.

## Prompt mẫu cho cron (chế độ Đánh giá)

```text
Chạy minipower-toolbox-skill-author workflow upgrade-from-lesson, CHẾ ĐỘ ĐÁNH GIÁ:
liệt kê issue nhãn "lesson" chưa "status:assessed" trên repo hoangnh2412/minipower
qua MCP feedback, đối chiếu 8 tiêu chí soát, xếp loại update/wontfix/gộp/cần hỏi,
comment + gắn status:assessed, cập nhật digest tuần. KHÔNG sửa file nào. KHÔNG merge.
```

Lịch, tài khoản chạy cron là của chủ repo (ADR-022 QĐ-12) — không khai ở đây.

## Anti-patterns

| ❌ | Vì sao |
|---|---|
| Chế độ đánh giá sửa file "vì tiện" | Phá ranh giới đánh giá/thi hành — mất điểm kiểm `git status` sạch |
| Tự merge hoặc tự tạo PR có quyền ghi | Trái ADR-022 QĐ-1, bẫy ADR-001 §3.5 |
| Thi hành khi issue chưa `status:decided` và không có `#NNN` trực tiếp từ người | Bỏ qua cổng người quyết |
| Dùng `gh` CLI hoặc cài công cụ dòng lệnh | ADR-044 QĐ-3: chỉ qua MCP |
