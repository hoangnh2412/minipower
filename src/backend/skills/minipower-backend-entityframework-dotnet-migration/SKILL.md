---
name: minipower-backend-entityframework-dotnet-migration
description: Vòng đời EF Core migration ngoài Host start — tạo / xoá migration (dotnet ef migrations add, remove, --context), apply bằng dotnet ef database update hoặc CI, sinh script SQL idempotent cho production, vị trí thư mục Migrations theo DbContext / MigrationsAssembly. Dùng khi đổi entity, thêm cột, cần migration mới, migrations script, has-pending-model-changes, sửa nhầm migration cũ. Không phủ EnsureMigrateDb lúc Host start.
metadata:
  workflow: github
---

# EF Core Migration — Orchestrator

Skill điều phối **vòng đời migration** EF Core trên nền `Jarvis.EntityFramework`: đổi model → migration **mới** → apply → script SQL. Setup DbContext / UoW / multitenancy thuộc [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/SKILL.md); apply lúc Host start thuộc [minipower-backend-entityframework-dotnet-auto-migrate](../minipower-backend-entityframework-dotnet-auto-migrate/SKILL.md).

Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

> Skeleton — các file `workflows/` · `reference/` **chưa tạo**, điền ở lượt sau khi ruột đã được duyệt. Bảng này là mục lục dự kiến.

| Tình huống | Workflow (dự kiến) |
|---|---|
| Đổi entity / Fluent config → cần migration mới; bỏ migration **vừa tạo** chưa apply | `workflows/add.md` |
| Apply migration **ngoài Host**: dev local, CI, DBA (`dotnet ef database update`) | `workflows/apply.md` |
| Sinh script SQL cho production khi `AutoMigrate` = `false` (`migrations script --idempotent`) | `workflows/script.md` |
| Nhiều DbContext — thư mục con `Migrations/{Tên}` theo DbContext, `--output-dir`, namespace, `MigrationsHistoryTable` | `reference/layout.md` |
| Apply lúc Host start (`EnsureMigrateDb` / `EnsureMigrateTemplateDb`) | **Không phải skill này** → [auto-migrate](../minipower-backend-entityframework-dotnet-auto-migrate/SKILL.md) |

## Quy tắc cốt lõi

- **Migration chỉ thêm, không sửa.** _TBD — luật đã chốt: mọi thay đổi model, kể cả nhỏ nhất, là một migration mới; không sửa nội dung migration đã có; không sửa tay `*ModelSnapshot.cs`; không gộp / xoá migration cũ. Lý do: `__EFMigrationsHistory` không chạy lại migration đã apply._
- **Một DbContext một migration, một thư mục con.** Nhiều DbContext → `Migrations/{Tên}` với `{Tên}` = tên DbContext bỏ hậu tố `DbContext` (`IdentityDbContext` → `Migrations/Identity`, `SystemDbContext` → `Migrations/System`); một DbContext → `Migrations/` phẳng. Lệnh: `dotnet ef migrations add <TenThayDoi> --context IdentityDbContext --output-dir Persistence/Migrations/Identity`. Không gộp model hai context vào một migration.
- **`migrations remove` chỉ cho migration mới nhất, chưa apply, chưa commit.** _TBD — người quyết có cho phép hay không; nếu không, mục này đổi thành "không remove — luôn thêm migration đảo ngược"._
- **Production không `AutoMigrate`.** _TBD — apply bằng script idempotent qua DBA / pipeline; nối với luật "Production: `AutoMigrate` = false" bên auto-migrate._
- _TBD — đặt tên migration (khuyến nghị, máy không kiểm)._

> Rule máy kiểm được thì đừng nhắc bằng lời — để analyzer / CI báo (xem § Output bắt buộc).
> Rule máy không kiểm được thì đừng viết "bắt buộc" — nêu lý do, người quyết.

## Ranh giới — không thuộc skill này

| Việc | Nhà |
|---|---|
| Apply migration lúc Host start, `ConnectionStrings:AutoMigrate`, `ITenantEntity` → Template | [minipower-backend-entityframework-dotnet-auto-migrate](../minipower-backend-entityframework-dotnet-auto-migrate/SKILL.md) |
| `Migrations/` nằm **layer** nào (Infrastructure / Persistence) | [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — skill này chỉ quyết **bên trong** thư mục đó |
| Setup `AddCoreDbContext`, UoW, repository, multitenancy | [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/SKILL.md) |

## Packages / tool

| Thành phần | Layer | Ghi chú |
|---|---|---|
| `Microsoft.EntityFrameworkCore.Design` | Infrastructure (hoặc project migration riêng) | _TBD version_ |
| `dotnet-ef` (tool) | dev / CI | _TBD — local tool manifest hay global_ |

## Output bắt buộc

Ba điều kiện **máy kiểm được** — vì thế mới được gọi "bắt buộc":

- `dotnet ef migrations has-pending-model-changes` exit 0 (EF Core 8+) — đổi model mà chưa add migration là FAIL
- `git diff --name-status` dưới `Migrations/` không có dòng `M` ngoài `*ModelSnapshot.cs` — sửa migration cũ là FAIL
- `dotnet ef migrations script --idempotent` chạy được (CI) — script production sinh được từ mọi commit
- Mỗi `*.Designer.cs` dưới `Migrations/{Tên}/` mang `[DbContext(typeof({Tên}DbContext))]` — grep trong CI; migration lạc thư mục là FAIL _(đề xuất, chờ duyệt)_

Cắt ngang:

- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`
