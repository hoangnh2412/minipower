# minipower-backend-entityframework-dotnet-migration

Skill **lá** — vòng đời EF Core migration **ngoài Host start**: tạo / xoá migration, apply bằng CLI hoặc CI, sinh script SQL cho production, bố trí thư mục `Migrations/` khi nhiều DbContext. Agent đọc [SKILL.md](./SKILL.md).

> Skeleton — ruột đang chờ duyệt. Các `workflows/` chưa tạo.

## Khi nào dùng

| Tình huống | Hành động |
|---|---|
| Đổi entity / Fluent config, cần migration mới | Đọc SKILL.md § Quy tắc cốt lõi — luôn `dotnet ef migrations add`, không sửa migration cũ |
| Apply migration trên dev local / CI / DBA | `workflows/apply.md` _(chưa tạo)_ |
| Cần script SQL cho production (`AutoMigrate` = false) | `workflows/script.md` _(chưa tạo)_ |
| Nhiều DbContext, tách project migration | `reference/layout.md` _(chưa tạo)_ |

**Không dùng cho:**

- Apply migration lúc Host start (`EnsureMigrateDb` / `EnsureMigrateTemplateDb`) → [minipower-backend-entityframework-dotnet-auto-migrate](../minipower-backend-entityframework-dotnet-auto-migrate/README.md)
- Setup DbContext / UoW / multitenancy → [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md)
- Quyết `Migrations/` nằm layer nào → [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/README.md)

## Cách gọi

```text
@.opencode/skills/minipower-backend-entityframework-dotnet-migration/SKILL.md

Thêm cột Status cho Order trong AppDbContext — tạo migration mới, không sửa migration cũ.
```

Hoặc mô tả việc bằng lời — skill tự kích hoạt qua `description`.

## Quy tắc (tóm tắt)

- Migration **chỉ thêm, không sửa** — kể cả thay đổi nhỏ nhất.
- Mỗi DbContext một migration (`--context`); nhiều DbContext → thư mục con `Migrations/Identity`, `Migrations/System` (tên DbContext bỏ hậu tố).
- Production apply bằng script idempotent, không `AutoMigrate`.
- _TBD — 1–2 dòng về xoá migration và đặt tên, sau khi anh chốt._

## Liên quan

- Orchestrator EF: [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md)
- Auto migrate Host: [minipower-backend-entityframework-dotnet-auto-migrate](../minipower-backend-entityframework-dotnet-auto-migrate/README.md)
- Bản đồ module: [backend/README.md](../../README.md)
