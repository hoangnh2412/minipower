# minipower-frontend-plan-react

Breakdown kỹ thuật frontend React cho một module/feature — bảng đầu việc + độ phức tạp + trace UC/FR/AC, để PM ghép vào WBS. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Làm gì |
|---|---|
| PM sắp lập WBS/Story Point cho module có phần frontend | Chạy skill này trước, PM dùng output làm input |
| Cần ước lượng độ phức tạp frontend trước khi báo giá/sprint planning | Chạy skill này |

**Không dùng cho:**
- Quyết cây feature/folder/hướng import → [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/README.md)
- Lập WBS, gán Story Point, tạo ticket → [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/README.md)
- Review PR → [minipower-frontend-review-react](../minipower-frontend-review-react/README.md)

## Cách gọi

```text
Breakdown kỹ thuật frontend cho module HRM theo HRM-UC-003, HRM-FR-010, HRM-AC-012
```

Hoặc mô tả việc bằng lời — skill tự kích hoạt qua `description`.

## Quy tắc (tóm tắt)

- Tên đầu việc là danh từ sản phẩm, không phải động từ.
- Không gán Story Point cuối — chỉ gắn độ phức tạp nhỏ/vừa/lớn.
- FR/UC chưa có AC → ghi rõ, không bịa.

## Liên quan

- [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/README.md) — dùng output này để lập WBS
- [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/README.md) — luật cây feature/import
- Bản đồ module: [frontend/README.md](../../README.md)
