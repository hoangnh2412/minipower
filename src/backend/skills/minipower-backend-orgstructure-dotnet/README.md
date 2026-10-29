# minipower-backend-orgstructure-dotnet

Gắn **cây tổ chức trong một org** (`Platform.OrgStructure`). Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

Phòng ban, chi nhánh không tạo org khách, pháp nhân, chức danh, vị trí trên sơ đồ.

## Khi nào không dùng

Tạo tenant hoặc org. Chi nhánh tự xuất hóa đơn cho khách của nó là tenant con, không phải nút trên cây này.

## Cách gọi

```text
@minipower-backend-orgstructure-dotnet

Gắn cây đơn vị trong org. Gán OrganizationalUnitId và PositionId lên user khi thêm thành viên.
```
