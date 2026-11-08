# minipower-backend-plan-dotnet

Breakdown kỹ thuật backend .NET cho một module/feature — bảng đầu việc + độ phức tạp + trace FR/AC, để PM ghép vào WBS. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Làm gì |
|---|---|
| PM sắp lập WBS/Story Point cho module có phần backend | Chạy skill này trước, PM dùng output làm input |
| Cần ước lượng độ phức tạp backend trước khi báo giá/sprint planning | Chạy skill này |

**Không dùng cho:**
- Quyết layer/dependency khi code → [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/README.md)
- Lập WBS, gán Story Point, tạo ticket → [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/README.md)
- Review PR → [minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md)

## Cách gọi

```text
Breakdown kỹ thuật backend cho module BILLING theo BILL-FR-021, BILL-AC-005
```

Hoặc mô tả việc bằng lời — skill tự kích hoạt qua `description`.

## Quy tắc (tóm tắt)

- Tên đầu việc là danh từ sản phẩm, không phải động từ.
- Không gán Story Point cuối — chỉ gắn độ phức tạp nhỏ/vừa/lớn.
- FR chưa có AC → ghi rõ, không bịa.

## Liên quan

- [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/README.md) — dùng output này để lập WBS
- [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/README.md) — luật layer/dependency khi code
- Bản đồ module: [backend/README.md](../../README.md)
