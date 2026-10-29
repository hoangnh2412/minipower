---
name: minipower-backend-orgs-dotnet
description: Thiết lập catalog org Jarvis Platform.Orgs — IOrgManager, ICurrentOrg, không seed org, không xóa cứng, list theo cây tenant. Dùng khi thêm người bán trên hóa đơn, header X-Org-Id, hoặc API org.
metadata:
  workflow: github
---

# Platform.Orgs — Orchestrator

Một org là một người bán trên hóa đơn, thuộc đúng một tenant. Hướng dẫn người: [README.md](README.md).

Luật code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md). Đặt file: [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md).

Cây phòng ban không thuộc skill này — dùng [minipower-backend-orgstructure-dotnet](../minipower-backend-orgstructure-dotnet/SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Host chưa có catalog org | [workflows/init.md](workflows/init.md) |

## Quy tắc

- Không `ParentOrgId`. Không seed org (không `VNA_DEFAULT`, không tạo org khi catalog trống).
- `DeleteAsync` từ chối xóa cứng. HTTP không có DELETE.
- `ListAsync` thấy org của tenant hiện tại và tenant con.
- Bảng org nằm DB của tenant, có `TenantId`.
- Publish `OrgCreatedEvent` / `OrgUpdatedEvent` sau khi ghi thành công.
- Tạo org kèm user `ORG_ADMIN` là việc Host, gọi sau `CreateAsync`, không nhét vào facade nếu host chưa có provisioner.

## Output

- Entity host + `AddPlatformOrgs<TOrg, TTenant>().UseEntityFramework(...).UseAsCurrentOrgStore().UseHttpApi()`.
- `dotnet build`.
