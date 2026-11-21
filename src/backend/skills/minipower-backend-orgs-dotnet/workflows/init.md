# Init catalog org

1. Reference `Platform.Orgs`, `Platform.Orgs.EntityFramework`, `Platform.Orgs.Api`, `Platform.Orgs.Abstractions`.
2. Entity host implement `IOrgManagementEntity`: `Id`, `TenantId`, `ParentId`, `Code`, `Name`, `LockLevel`. Bảng trên **Master**. Cột thêm (mã số thuế, …) qua hook, không sửa package.
3. Đăng ký trên UoW Master: `AddPlatformOrgs<TOrg, TTenant>().UseEntityFramework<TOrg, TTenant, TMasterUnitOfWork>().UseAsCurrentOrgStore().UseHttpApi()`.
4. Đăng ký `IPlatformCatalogAdminProvisioner` (module identity có `PlatformCatalogAdminProvisioner`) để tạo user `ORG_ADMIN` khi tạo org.
5. Host cho chuyển sang tenant con: thay `SelfOrgTenantVisibility` bằng `SubtreeOrgTenantVisibility`.
6. Không gọi seed org trong `Program` / hosted service. Aligner chỉ sửa dữ liệu legacy (đổi mã cũ), không `Add` org mới.
7. Migration Master cho bảng org; `dotnet ef migrations has-pending-model-changes` exit 0.
8. `dotnet build`.
