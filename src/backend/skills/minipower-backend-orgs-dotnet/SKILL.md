---
name: minipower-backend-orgs-dotnet
description: Thiết lập catalog org Jarvis Platform.Orgs — IOrgManager, ICurrentOrg, org cha-con cùng tenant, khoá 2 mức, bảng org trên Master, CRUD ở /platform/orgs và chỉ đọc ở /app/orgs. Dùng khi thêm người bán trên hóa đơn, header X-Org-Id, hoặc API org.
metadata:
  workflow: github
  version: 1.1.0
---

# Platform.Orgs — Orchestrator

Một org là một người bán trên hóa đơn, thuộc đúng một tenant. Hướng dẫn người: [README.md](README.md).

Luật code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md). Đặt file: [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md).

Cây phòng ban không thuộc skill này — dùng [minipower-backend-orgstructure-dotnet](../minipower-backend-orgstructure-dotnet/SKILL.md). Catalog tenant: [minipower-backend-tenants-dotnet](../minipower-backend-tenants-dotnet/SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Host chưa có catalog org | [workflows/init.md](workflows/init.md) |

## Quy tắc

- Org **có cha-con** cùng tenant qua `ParentId`; không vòng. Chọn cha lúc tạo; chưa có API đổi cha.
- Bảng org nằm **Master**, có `TenantId` (không nằm DB nghiệp vụ của tenant).
- Không seed org (không `VNA_DEFAULT`, không tạo org khi catalog trống).
- Không xoá cứng; HTTP không có DELETE. Thay bằng khoá hai mức `Write` (chỉ đọc) / `ReadWrite` (không đăng nhập) qua `PATCH /platform/orgs/{id}/lock`. Mức thật = cao nhất trên chuỗi tenant cha → tenant → org cha → org.
- Hai vùng API: CRUD + khoá ở `/platform/orgs` (site Platform, quyền `Platform.Org.*`); site App chỉ đọc `/app/orgs`.
- `ListAsync` phía App mặc định thấy org của tenant đang làm việc. Host cho phép chuyển sang tenant con thì đăng ký `SubtreeOrgTenantVisibility` để thấy cả org của tenant con.
- Tạo org **bắt buộc** `initialAdmin`; host tạo user `ORG_ADMIN` qua `IPlatformCatalogAdminProvisioner` sau khi ghi catalog. Không đăng ký provisioner thì admin nhập vào bị bỏ.
- Publish `OrgCreatedEvent` / `OrgUpdatedEvent` sau khi ghi thành công.

Quyết định nền: ADR `realm-scope-lock` (D1–D4) của dự án áp dụng skill.

## Output

- Entity host implement `IOrgManagementEntity` + `AddPlatformOrgs<TOrg, TTenant>().UseEntityFramework(...).UseAsCurrentOrgStore().UseHttpApi()` trên UoW Master.
- `dotnet build`.
