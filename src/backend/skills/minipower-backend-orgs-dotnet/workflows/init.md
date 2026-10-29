# Init catalog org

1. Reference `Platform.Orgs`, `Platform.Orgs.EntityFramework`, `Platform.Orgs.Api`, `Platform.Orgs.Abstractions`.
2. Entity host implement catalog: `Id`, `TenantId`, `Code`, `Name`, `IsActive`. Cột thêm (mã số thuế, …) qua hook, không sửa package.
3. Đăng ký `AddPlatformOrgs` + EF + `UseAsCurrentOrgStore` + `UseHttpApi`.
4. Không gọi seed org trong `Program` / hosted service.
5. Aligner chỉ được sửa dữ liệu legacy (đổi mã cũ), không `Add` org mới.
6. Sau tạo org, host có thể tạo user admin của org đó (role `ORG_ADMIN`, `OrgId` = org vừa tạo).
7. `dotnet build`.
