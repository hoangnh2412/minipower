---
name: minipower-backend-entityframework-dotnet-auto-migrate
description: Bật auto migrate EF khi Host start — chỉ EnsureMigrateDb và EnsureMigrateTemplateDb (Platform.ORM.EntityFramework). EnsureMigrateTemplateDb chỉ khi model có ITenantEntity.
dependencies:
  - Platform.ORM.EntityFramework
---

# Auto migrate (Host startup)

→ SSOT: `jarvis/frameworks/Platform.ORM.EntityFramework/AppBuilderExtension.cs`  
→ Mẫu: `jarvis/Sample/Program.cs` (sau `MapControllers`, trước seed / `Run`)  
→ Index: [SKILL.md](../../SKILL.md)

Platform chỉ cung cấp **hai** extension migrate trên `IApplicationBuilder`:

1. `EnsureMigrateDb<TUnitOfWork>()` — `T` : `IUnitOfWork`
2. `EnsureMigrateTemplateDb<TDbContext>(configure)` — `TDbContext` : `DbContext`

**Không** thêm extension migrate tùy biến trên Host (không gọi `Database.Migrate()` trực tiếp).

Cả hai đọc `ConnectionStrings:AutoMigrate`, dùng `TenantScopedContextValidation.BeginSuppressScope()`.

## Cấu hình

```json
{
  "ConnectionStrings": {
    "AutoMigrate": "false",
    "AppDbContext": "Host=...;Database=..."
  }
}
```

- Production: `AutoMigrate` = `false`.
- Development: `true` trong `appsettings.Development.json` nếu team migrate khi F5.

## Bảng quyết định

| Tình huống | API | Điều kiện |
|------------|-----|-----------|
| Storage đã có **UoW** + `AddCoreDbContext` (Master, App single DB, Identity store qua UoW, …) | `app.EnsureMigrateDb<TUnitOfWork>()` | Một lần gọi cho **một** `IUnitOfWork` / một DbContext qua factory UoW |
| Tenant DB template (connection cố định, **không** qua `TenantDbConnectionInterceptor` khi migrate) | `app.EnsureMigrateTemplateDb<TDbContext>((config, options) => …)` | Model có **ít nhất một** entity implement `ITenantEntity` |

### Quy tắc `ITenantEntity` (chỉ áp `EnsureMigrateTemplateDb`)

`ITenantEntity` (`Platform.DDD.Domain.Entities`) — `TenantId` + global filter trên `BaseStorageContext`.

**Chỉ** dùng `EnsureMigrateTemplateDb` khi kiểm tra model có entity `ITenantEntity`  
(ví dụ: `typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType)` trên các entity trong model).

**Cấm** `EnsureMigrateTemplateDb` khi model **không** có `ITenantEntity` — kể cả context “phụ” (Identity, Authorization EF, engine workflow, …). Các context đó migrate bằng **`EnsureMigrateDb`** qua **UoW** đã đăng ký cho DbContext tương ứng (nếu chưa có UoW → đăng ký `IUnitOfWork` + `AddCoreDbContext` theo [reference/setup.md](../../reference/setup.md), không tạo API migrate thứ ba).

Nhầm API → migrate sai connection (interceptor) hoặc dùng Template cho schema không phải tenant pool.

## Mẫu Host (Sample)

```csharp
using Microsoft.EntityFrameworkCore;
using Platform.ORM.EntityFramework;

app.EnsureMigrateDb<IMasterUnitOfWork>();

app.EnsureMigrateTemplateDb<TenantDbContext>((config, options) =>
    options.UseNpgsql(config.GetConnectionString("TenantDbContext")!));

// App / Identity / storage khác — mỗi UoW một dòng EnsureMigrateDb (không ITenantEntity → không Template)
app.EnsureMigrateDb<IAppUnitOfWork>();
app.EnsureMigrateDb<IIdentityUnitOfWork>();
```

`MigrationsHistoryTable(..., schema)` cấu hình lúc `AddCoreDbContext` / `AddDbContext`; `EnsureMigrateDb` mở context từ DI qua UoW — không duplicate options trong Host.

## So sánh hai API

| | `EnsureMigrateDb<TUoW>` | `EnsureMigrateTemplateDb<TDb>` |
|--|---------------------------|--------------------------------|
| Mở context | Scope DI → `uow.GetDbContextAsync()` | `Activator.CreateInstance` + `configure(config, options)` |
| Pending only | Có | Không — luôn `MigrateAsync` |
| Khi dùng | Bất kỳ DbContext có UoW; **bắt buộc** cho context không `ITenantEntity` | **Chỉ** tenant/template DbContext có `ITenantEntity` |

## Checklist agent

```text
- [ ] ConnectionStrings:AutoMigrate (mặc định false)
- [ ] using Platform.ORM.EntityFramework
- [ ] Chỉ EnsureMigrateDb và EnsureMigrateTemplateDb — không extension Migrate riêng
- [ ] Template chỉ khi model có ITenantEntity
- [ ] Mỗi DbContext/UoW cần migrate: một EnsureMigrateDb hoặc (nếu đủ điều kiện) EnsureMigrateTemplateDb
- [ ] Gọi sau build pipeline, trước traffic / seed nghiệp vụ
- [ ] dotnet build; kiểm tra schema / __EFMigrationsHistory
```

## Anti-patterns

- `EnsureMigrateTemplateDb` cho Identity hoặc model không có `ITenantEntity`.
- `GetRequiredService<TDbContext>().Database.Migrate()` bỏ qua `AutoMigrate` / suppress.
- Một `EnsureMigrateDb` cho hai DbContext khác nhau (thiếu UoW thứ hai).
- `AutoMigrate: true` production không có quyết định vận hành.

## Liên quan

- [reference/setup.md](../../reference/setup.md) — UoW, `AddCoreDbContext`  
- [patterns/separate-tenant-db/SKILL.md](../separate-tenant-db/SKILL.md) — tenant DB + template migrate
