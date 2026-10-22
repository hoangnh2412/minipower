# Flow Map — {Tên flow} — NHÁP

> Nháp từ đọc code (`minipower-architecture-as-built`). **Chưa phải DOC.** Người xác nhận từng mục; mục đã xác nhận distill về DOC-05 (luồng) · DOC-04 (BR) · DOC-12 (endpoint) · DOC-10 (tích hợp) · DOC-17 (runbook). Unknown → `memory/open-questions.md`.
> Nhãn: **Observed** (kèm `path:line`) · **Documented** (kèm nguồn) · **Inferred** `[Suy luận]` · **Unknown** `[Chưa xác minh]`. Documented ≠ Observed cùng một điểm → mục ⛔ ở §16.

| Vùng chạm | Stack / pattern | Ngày | Người đọc |
|-----------|-----------------|------|-----------|
| {module / luồng} | {dotnet · java · react · flutter} | YYYY-MM-DD | {Author} |

## 1. Entry — route / endpoint / screen / consumer

| Nhãn | Nội dung | Bằng chứng |
|------|----------|------------|
| Observed | | `path:line` |

## 2. Trigger — ai / cái gì kích hoạt

## 3. Input — params · body · message · form · props

## 4. Execution Flow

```text
Trigger
  → Entry
  → ...
  → Output
```

## 5. Business Rules lộ trong code (if / validator / policy)

| ID đề xuất | Rule | Nhãn | Bằng chứng | Server có kiểm? |
|------------|------|------|------------|-----------------|
| {MOD}-BR-TBD | | | | |

## 6. Data Read

## 7. Data Write

## 8. Transaction boundary · Cache / Store / URL đổi sau mutation

## 9. Navigation / Output cho người dùng

## 10. External integrations · Messaging

## 11. Security — presentation vs điều kiện gọi API

## 12. Loading / Empty / Error — người dùng thấy gì

## 13. Retry / Recovery / Rollback

## 14. Observability

## 15. Source references (gom mọi `path:line` đã dẫn)

## 16. Mâu thuẫn ⛔ — Documented khác Observed, người chọn

| Điểm | Tài liệu nói | Code làm | Nguồn hai bên |
|------|--------------|----------|---------------|

## 17. Unknowns / câu hỏi cho người

| # | Câu hỏi | Vì sao chưa trả lời được | Ghi vào `open-questions.md`? |
|---|---------|---------------------------|------------------------------|
