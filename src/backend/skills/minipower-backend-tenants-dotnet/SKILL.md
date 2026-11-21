---
name: minipower-backend-tenants-dotnet
description: Thiết lập catalog tenant Jarvis Platform.Tenants — ITenantManager, entity host trên Master, tenant cha-con, khoá 2 mức, API /platform/tenants và /app/tenants, UseAsCurrentTenantStore. Dùng khi thêm tenant cha-con, chuỗi kết nối tenant, hoặc màn vận hành nền tảng.
metadata:
  workflow: github
  version: 1.1.0
---

# Platform.Tenants — Orchestrator

Catalog tenant tách khỏi ambient `Platform.Multitenancy`. Hướng dẫn người: [README.md](README.md).

Luật code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md). Đặt file: [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md). Catalog org: [minipower-backend-orgs-dotnet](../minipower-backend-orgs-dotnet/SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Host chưa có catalog tenant | [workflows/init.md](workflows/init.md) |

## Quy tắc

- Bảng tenant và user Platform nằm Master. `TenantId` / `OrgId` của user Platform là null.
- Tenant cha-con qua `ParentId`; không vòng. Đổi cha qua `PUT /platform/tenants/{id}/parent`.
- Chuỗi kết nối **không bắt buộc** lúc tạo; ghi một lần qua `PUT …/{id}/connection` (quyền `Platform.Tenant.Connection`). Danh sách không trả chuỗi kết nối.
- Không xoá cứng, không `IsActive`. Khoá hai mức `Write` / `ReadWrite` qua `PATCH /platform/tenants/{id}/lock` (quyền `Platform.Tenant.Delete` = khoá/mở khoá). Mức thật = cao nhất trên chuỗi cha; khoá tenant lan xuống mọi tenant con và org trong đó.
- Hai vùng API: `/platform/tenants` CRUD + khoá (site Platform); `/app/tenants` chỉ đọc, giới hạn trong cây của tenant phiên, DTO không có chuỗi kết nối.
- Tạo tenant **bắt buộc** `initialAdmin`; host tạo user `TENANT_ADMIN` qua `IPlatformCatalogAdminProvisioner`.
- `AddCurrentTenant` vẫn của Multitenancy. Bridge catalog: `UseAsCurrentTenantStore()`. `ITenantScopeTree` trả lời "tenant X có trong cây của phiên không".
- Không bịa tên tenant (`tenant-{guid}`). `ICurrentTenantStore` đọc catalog.

Quyết định nền: ADR `realm-scope-lock` (D1–D4) của dự án áp dụng skill.

## Output

- Entity host implement `ITenantCatalogEntity`, migration Master.
- `AddPlatformTenants<T>().UseHttpApi().UseAsCurrentTenantStore()` + đăng ký `IPlatformCatalogAdminProvisioner`.
- `dotnet build` project Host.
