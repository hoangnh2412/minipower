# EF — Setup chung

Đọc sau [SKILL.md](../SKILL.md). Chọn mô hình: [single-db](../patterns/single-db/SKILL.md) | [separate-tenant-db](../patterns/separate-tenant-db/SKILL.md) | [hybrid](../patterns/hybrid/SKILL.md).

## Thành phần Jarvis

| Thành phần | Layer | Vai trò |
|---|---|---|
| `BaseStorageContext` | EF | Global query filter `TenantId == context.TenantId` (`ITenantEntity`); snapshot private + `SetTenantId` |
| `BaseUnitOfWork<T>` | EF | `IDbContextFactory`, `SetTenantId`, `SwitchDbContextAsync` |
| `ITenantIdResolver` / `ITenantIdResolverFactory` | Domain (ports) | Tenant id contracts |
| `HeaderTenantIdResolver` … + `TenantIdResolverFactory` | Multitenancy | Impl HTTP chain; `AddCurrentTenant` / `AddTenantIdResolvers` |
| `ITenantConnectionStringResolver` | Domain | `GetConnectionStringAsync(name)` |
| `TenantConnectionStringResolverFactory` | Domain | Tenant id + keyed resolver |
| `ConfigConnectionStringResolver` | Domain | `IConfiguration.GetConnectionString` |
| `CachingTenantConnectionStringResolver` | EF foundation | Cache decorator (shared + tenant keys) |
| `DbTenantConnectionStringResolver<TMaster, TTenant>` | Multitenancy.EF | Lookup `ITenantManagementEntity` trên Master |
| `TenantDbConnectionInterceptor` | Multitenancy.EF | Ghi connection lúc mở (overload 2 generic) |
| `ITenantManagementEntity` | Domain | Registry Master: `Id`, `ConnectionString` |

`AddJarvisCaching()` → `AddCurrentTenant` / `AddTenantIdResolvers` → `AddEntityFramework()` → (opt-in) `AddMultitenancyEntityFramework()` → `AddCoreDbContext*`. Mọi `ITenantConnectionStringResolver` keyed được bọc cache (`Cache:Items:ConnectionString`, `conn:{dbid}`).

## Luồng resolve tenant

1. **UoW / filter:** `_switchedTenantId` → `ITenantIdResolverFactory` (không đọc `ICurrentTenantAccessor`).
2. **Connection:** `ICurrentTenantAccessor` → `ITenantIdResolverFactory` → `TenantConnectionStringResolverFactory` → keyed resolver.
3. Overload 2 generic: interceptor gán connection khi mở.
4. `SetTenantId` cho `ITenantEntity`.

**Không có tenant:** `ConnectionStrings:{DbContextName}` (migrate, Master-only job).

## DbContext & UoW

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options)
    : BaseStorageContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
}

public class AppUnitOfWork(
    IServiceProvider services,
    IDbContextFactory<AppDbContext> factory,
    ITenantIdResolverFactory tenantIdResolverFactory,
    ICurrentTenantAccessor currentTenantAccessor)
    : BaseUnitOfWork<AppDbContext>(services, factory, tenantIdResolverFactory, currentTenantAccessor),
      IAppUnitOfWork;
```

## Entity

**`ITenantEntity`** (single DB, hybrid pool):

```csharp
public class Order : BaseEntity<Guid>, ITenantEntity
{
    public Guid TenantId { get; set; }
}
```

**`ITenantManagementEntity`** (Master, mô hình 2 & 3):

```csharp
public class Tenant : BaseEntity<Guid>, ITenantManagementEntity
{
    public required string ConnectionString { get; set; }
}
```

## appsettings.json

```json
{
  "ConnectionStrings": {
    "AutoMigrate": "true",
    "AppDbContext": "Host=localhost;...",
    "MasterDbContext": "Host=localhost;...;Database=master"
  },
  "TenantHeaderKey": "X-Tenant-Id",
  "TenantQueryName": "tenantId"
}
```

Placeholder `AppDbContext` khi dùng interceptor (connection thật từ Master / resolver).

## Migrate

Chi tiết + quy tắc `ITenantEntity`: [patterns/auto-migrate/SKILL.md](../patterns/auto-migrate/SKILL.md).

```csharp
app.EnsureMigrateDb<IMasterUnitOfWork>();
app.EnsureMigrateTemplateDb<TenantDbContext>((config, options) =>
    options.UseNpgsql(config.GetConnectionString("TenantDbContext")!));
```

`ConnectionStrings:AutoMigrate` = `true`. Context **không** có `ITenantEntity` (Identity, …): thêm `EnsureMigrateDb<TUnitOfWork>` cho UoW của context đó — **không** `EnsureMigrateTemplateDb`.

## API tham chiếu

| API | Mục đích |
|---|---|
| `AddEntityFramework()` | Repository + multitenancy |
| `AddCoreDbContext<TDb>(configure)` | Connection cố định |
| `AddCoreDbContext<TDb, TResolver>(configure)` | Per-tenant connection |
| `EnsureMigrateDb<TUnitOfWork>(app)` | Auto migrate qua UoW |
| `EnsureMigrateTemplateDb<TDb>(app, configure)` | Template tenant DB — **chỉ** khi model có `ITenantEntity` |
| `SwitchDbContextAsync(tenantId)` | Job: pin tenant + connection scope |

**Không** truyền `HeaderTenantIdResolver` vào `AddCoreDbContext` — đó là `ITenantIdResolver`.
