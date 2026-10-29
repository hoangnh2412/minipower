# minipower-architecture-as-built

Khai quật hệ cũ thành tài liệu as-built — nhà `architecture/` (D2 chốt). Từ ADR-042 lá này cũng giữ **phương pháp đọc code** dùng chung mọi stack: [reference/reading-method.md](reference/reading-method.md) + bảng tra theo stack trong `patterns/` (.NET · Java · React · Flutter) + [Flow Map nháp](templates/TPL-flow-map.tpl).

Atomic pack `architecture/`. Không agent bàn giao agent (ADR-033 QĐ-1 · ADR-043). **Người trigger** — không hook nào tự gọi.

## Khi nào dùng

| Tình huống | Mở |
|------------|-----|
| Chế độ `maintain`, hệ cũ không tài liệu | [SKILL.md](SKILL.md) — quy trình 8 bước, đích theo DOC |
| Cần hiểu một luồng trong codebase lạ trước khi sửa | `reading-method.md` + pattern đúng stack |
| Phân vân flow đã hiểu đủ chưa | `reading-method.md` §12 Definition of Done |

**Không dùng cho:** sửa code (mở CR) · review PR (`minipower-backend-review-dotnet`, `minipower-frontend-review-react`) · thiết kế mới (`minipower-architecture-sad`).

## Bốn nhãn bằng chứng

Observed (có `path:line`) · Documented (kèm nguồn) · Inferred `[Suy luận]` · Unknown `[Chưa xác minh]`. Documented khác Observed cùng một điểm → mục Mâu thuẫn ⛔, người chọn bên đúng.

## Prompt mẫu

```text
Đọc luồng "phát hành hoá đơn" trong repo backend (.NET) theo as-built: Pass 1 ra bản đồ, rồi trace flow từ endpoint tới DB và CQT; ra Flow Map nháp với 4 nhãn, chưa ghi DOC.
```

```text
Màn danh sách hoá đơn (React) không đổi sau khi tạo — trace thì ghi: mutation → cache / navigation → component nào subscribe. Ghi Unknown chỗ chưa thấy.
```
