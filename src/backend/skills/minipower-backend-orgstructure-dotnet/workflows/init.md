# Init cây tổ chức

1. Reference `Platform.OrgStructure` và `Platform.Orgs.Abstractions` (kiểm org tồn tại). Không reference ngược từ Orgs sang OrgStructure.
2. Entity host: đơn vị (`ParentId`, `Path`, `UnitType`, `OrgId`), pháp nhân, chức danh, vị trí, thành viên.
3. Đăng ký facade `IOrgStructureManager`. Migration trên DB tenant.
4. Khi gán thành viên: ghi `JobPositionId` trên dòng thành viên và claim `PositionId`, `OrganizationalUnitId`, `UnitType` trên user.
5. Policy mẫu: `Resource.OrganizationalUnitId == User.OrganizationalUnitId`, `Resource.PositionId == User.PositionId`.
6. Không tạo cây mẫu trong lúc tạo org.
7. `dotnet build`.
