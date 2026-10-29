---
name: minipower-backend-tenants-dotnet
description: Thiết lập catalog tenant Jarvis Platform.Tenants — ITenantManager, entity host trên Master, API /platform/tenants, UseAsCurrentTenantStore. Dùng khi thêm tenant cha-con, chuỗi kết nối tenant, hoặc màn vận hành nền tảng.
metadata:
  workflow: github
---

# Platform.Tenants — Orchestrator

Catalog tenant tách khỏi ambient `Platform.Multitenancy`. Hướng dẫn người: [README.md](README.md).

Luật code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md). Đặt file: [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Host chưa có catalog tenant | [workflows/init.md](workflows/init.md) |

## Quy tắc

- Bảng tenant và user cài đặt nằm Master. `TenantId` / `OrgId` của user cài đặt là null.
- Mỗi tenant một chuỗi kết nối, bắt buộc. Không hard delete — `IsActive = false`.
- `ParentTenantId` cho tenant con. Org không có cha-con.
- Route vận hành `/platform/tenants`, không nằm trong `/he-thong`.
- `AddCurrentTenant` vẫn của Multitenancy. Bridge catalog: `UseAsCurrentTenantStore()`.
- Không bịa tên tenant (`tenant-{guid}`). `ICurrentTenantStore` đọc catalog.

## Output

- Entity host implement `ITenantCatalogEntity`, migration Master.
- `AddPlatformTenants<T>().UseHttpApi().UseAsCurrentTenantStore()`.
- `dotnet build` project Host.
