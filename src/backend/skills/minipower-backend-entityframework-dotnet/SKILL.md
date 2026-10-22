---
name: minipower-backend-entityframework-dotnet
description: Thiết lập Jarvis.EntityFramework — repository, multitenancy, AddCoreDbContext, UoW. Dùng khi tích hợp EF Core .NET với single DB, separate tenant DB, hybrid, hoặc custom DI resolver.
metadata:
  workflow: github
---

# Jarvis.EntityFramework — Orchestrator

Skill điều phối `Jarvis.EntityFramework` trên ASP.NET Core. Hướng dẫn vận hành: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Chưa có EF Jarvis | [workflows/init.md](workflows/init.md) |
| Đổi / thêm mô hình multitenancy | [workflows/add.md](workflows/add.md) |

## Quy tắc cốt lõi

- **`AddJarvisCaching()` trước `AddEntityFramework()`** — `CachingTenantConnectionStringResolver`.
- `AddCurrentTenant()` / `AddTenantIdResolvers()` → keyed `ITenantIdResolver` + factory (`Platform.Multitenancy`).
- `AddEntityFramework()` → repository + shared/master `AddCoreDbContext<T>` (không interceptor).
- `AddMultitenancyEntityFramework()` + `AddCoreDbContext<TDb, TResolver>()` → dedicated tenant DB (`Platform.Multitenancy.EntityFramework`).
- App đăng ký inner `ITenantConnectionStringResolver` qua overload 2 generic.
- Sau `SwitchDbContextAsync` → **`GetRepositoryAsync` lại**.
- UoW không đọc `ICurrentTenantAccessor` khi `SetTenantId` — tránh nhầm tenant.

## Packages

| PackageId | Layer |
|---|---|
| `Jarvis.EntityFramework` / `Platform.EntityFramework` | Infrastructure (foundation) |
| `Platform.Multitenancy.EntityFramework` | Infrastructure (tenant–EF satellite) |
| `Jarvis.Caching` / `Platform.Caching` | Infrastructure (trước EF) |
| `Npgsql.EntityFrameworkCore.PostgreSQL` (hoặc MySQL provider) | Infrastructure |

## Patterns (atomic)

| Mô hình | Path |
|---|---|
| Single DB + `TenantId` | [patterns/single-db/SKILL.md](patterns/single-db/SKILL.md) |
| Separate tenant DB | [patterns/separate-tenant-db/SKILL.md](patterns/separate-tenant-db/SKILL.md) |
| Hybrid | [patterns/hybrid/SKILL.md](patterns/hybrid/SKILL.md) |
| Custom DI resolver | [patterns/custom-di/SKILL.md](patterns/custom-di/SKILL.md) |
| Auto migrate Host (`EnsureMigrateDb` / Template / Registered) | [patterns/auto-migrate/SKILL.md](patterns/auto-migrate/SKILL.md) |

**Luôn đọc:** [reference/setup.md](reference/setup.md).

## `AddCoreDbContext`

| Overload | Interceptor | Khi dùng |
|---|---|---|
| `AddCoreDbContext<TDb>(configure)` | Không | Single DB, Master cố định — `Platform.EntityFramework` |
| `AddCoreDbContext<TDb, TResolver>(configure)` | `TenantDbConnectionInterceptor` | Per-tenant connection — `Platform.Multitenancy.EntityFramework` |

## Templates

- [templates/infrastructure-extension.cs](templates/infrastructure-extension.cs)

## Output bắt buộc

- `InfrastructureLayerExtension` — caching + EF + DbContext
- `AppDbContext`, `AppUnitOfWork`, entities
- `appsettings` `ConnectionStrings`, `Cache:Items:ConnectionString`
- `dotnet build`; migrate nếu bật `AutoMigrate`
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer + hướng phụ thuộc theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`

