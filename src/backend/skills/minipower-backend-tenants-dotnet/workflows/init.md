# Init catalog tenant

1. Thêm project reference `Platform.Tenants`, `Platform.Tenants.EntityFramework` (nếu dùng helper EF), `Platform.Tenants.Api`.
2. Entity host: `Id`, `Code`, `Name`, `IsActive`, `ParentTenantId`, `ConnectionString`. Bảng trên Master, không trên DB nghiệp vụ của tenant.
3. `ITenantStore<T>` đọc Master.
4. Đăng ký:

```csharp
builder.AddPlatformTenants<TTenant>()
    .UseAsCurrentTenantStore()
    .UseHttpApi();
```

5. Policy root: user `TenantId` và `OrgId` null, có quyền platform, mới gọi được `/platform/tenants`. Request thiếu header không được thành root.
6. User tạo lúc cài đặt là user root duy nhất trừ khi ADR host nói khác.
7. `dotnet build`.
