---
name: minipower-backend-orgstructure-dotnet
description: Thiết lập cây tổ chức Jarvis Platform.OrgStructure — đơn vị, pháp nhân, chức danh, vị trí, path. Dùng khi thêm phòng ban trong một org, gán OrganizationalUnitId hoặc PositionId cho user.
metadata:
  workflow: github
---

# Platform.OrgStructure — Orchestrator

Cây **bên trong một org**. Không đựng tenant con và không đựng catalog org. Hướng dẫn người: [README.md](README.md).

Luật code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md). Đặt file: [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md).

Catalog org: [minipower-backend-orgs-dotnet](../minipower-backend-orgs-dotnet/SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Host chưa có cây đơn vị | [workflows/init.md](workflows/init.md) |

## Quy tắc

- Mọi dòng thuộc một `OrgId`. Đổi cha không tạo vòng, cùng org.
- Phạm vi user: claim `OrganizationalUnitId`, `UnitType`. Vị trí làm việc là claim `PositionId` (quyền truy cập), song song với dòng thành viên.
- Không tự seed cây khi tạo org. Mẫu chỉ ghi sau khi người xem trước và xác nhận.
- `UnitType` nghiệp vụ do host seed, không seed danh mục VNA trong package platform.

## Output

- `AddPlatformOrgStructure` (hoặc facade host bọc `IOrgStructureManager`).
- API dưới scope org, không dưới `/platform`.
- `dotnet build`.
