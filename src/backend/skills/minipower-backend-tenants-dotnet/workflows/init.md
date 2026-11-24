# Init catalog tenant

1. Thêm project reference `Platform.Tenants`, `Platform.Tenants.EntityFramework` (nếu dùng helper EF), `Platform.Tenants.Api`.
2. Entity host implement `ITenantCatalogEntity`: `Id`, `Code`, `Name`, `LockLevel`, `ParentId`, `ConnectionString`. Bảng trên Master, không trên DB nghiệp vụ của tenant.
3. `ITenantStore<T>` đọc Master.
4. Đăng ký:

```csharp
builder.AddPlatformTenants<TTenant>()
    .UseAsCurrentTenantStore()
    .UseHttpApi();
builder.Services.AddScoped<IPlatformCatalogAdminProvisioner, PlatformCatalogAdminProvisioner>();
```

5. Policy Platform: user `TenantId` và `OrgId` null, token realm `platform`, có quyền `Platform.Tenant.*`, mới gọi được `/platform/tenants`. Request Platform bỏ qua header phạm vi.
6. Site App chỉ dùng `/app/tenants`; ngoài cây của phiên trả 404.
7. User tạo lúc cài đặt là user Platform duy nhất trừ khi ADR host nói khác.
8. Migration Master; `dotnet ef migrations has-pending-model-changes` exit 0.
9. `dotnet build`.
