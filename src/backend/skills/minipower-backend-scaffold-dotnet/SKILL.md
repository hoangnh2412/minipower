---
name: minipower-backend-scaffold-dotnet
description: Scaffold solution .NET 9 phân lớp + cài Jarvis framework từ folder trống — F5 chạy Swagger. Dùng khi tạo project backend mới, cài package Jarvis, hoặc thêm module vào solution có sẵn.
metadata:
  workflow: github
  version: 1.0.0
---

# Jarvis Framework — Orchestrator

Skill điều phối **scaffold solution chuẩn** và **cài đặt Jarvis** trên ASP.NET Core **.NET 9**.

## Luồng chính (khuyến nghị)

```text
Folder trống → skill minipower-backend-scaffold-dotnet → solution phân lớp + Jarvis → F5
```

| Bước | Workflow |
|---|---|
| 1. Scaffold từ đầu | **[workflows/scaffold.md](workflows/scaffold.md)** |
| 2. Thêm module Jarvis | [workflows/add.md](workflows/add.md) |
| 3. Chỉ cài package (solution có sẵn) | [workflows/init.md](workflows/init.md) |

## Cấu trúc solution tiêu chuẩn

```text
{product}-backend/
├── src/{Product}.sln
│   ├── {Product}.Domain.Shared
│   ├── {Product}.Domain
│   ├── {Product}.Application      → Jarvis.DDD.Application
│   ├── {Product}.Infrastructure   → Jarvis.EntityFramework
│   └── {Product}.Host             → Jarvis.Mvc, OTEL, HealthChecks, Swagger
└── tests/
```

Chi tiết folder, DI convention, Jarvis mapping: [reference/solution-structure.md](reference/solution-structure.md).

**Composition root:** `Program.cs` chỉ gọi `AddHostLayer()` / `UseHostLayer()`.

## Templates scaffold

| Tài nguyên | Path |
|---|---|
| Bản đồ scaffold → skill | [templates/SKILLS.md](templates/SKILLS.md) |
| Architecture test R1–R7 | [minipower-backend-architecture-dotnet/templates/ArchitectureTests/](../minipower-backend-architecture-dotnet/templates/ArchitectureTests/) |
| Cây thư mục | [templates/solution-tree.txt](templates/solution-tree.txt) |
| Layer extensions + Host | [templates/layers/](templates/layers/) |
| csproj Jarvis refs | [templates/layer-csproj/](templates/layer-csproj/) |
| README / Architecture | [templates/docs-README.md](templates/docs-README.md) |
| `.editorconfig` + `Directory.Build.props` | [minipower-backend-convention-dotnet/templates/](../minipower-backend-convention-dotnet/templates/) |

## Hai cách cài Jarvis

| Cách | Khi nào |
|---|---|
| **ProjectReference** | Monorepo cạnh repo Jarvis (`{JarvisRoot}`) — packages cross-cutting trong `{JarvisRoot}/frameworks/` |
| **NuGet** | Repo độc lập, feed nội bộ |

**PackageId:** `Jarvis.Authentication.*` folder → NuGet `Jarvis.Authentications.*`.

## Catalog package (NuGet)

Phiên bản tham chiếu từ repo Jarvis (`develop`):

| Module | PackageId | Version | Layer |
|---|---|---|---|
| Domain shared | `Jarvis.DDD.Domain.Shared` | 1.0.0 | Domain.Shared |
| Domain | `Jarvis.DDD.Domain` | 1.1.1 | Host (enricher) |
| Application | `Jarvis.DDD.Application` | 1.2.1 | Application |
| Application contracts | `Jarvis.DDD.Application.Contracts` | 1.2.1 | Application |
| Entity Framework | `Jarvis.EntityFramework` | 1.0.0 | Infrastructure |
| Caching | `Jarvis.Caching` | 1.1.0 | Infrastructure (**bắt buộc trước EF**) |
| Caching Redis | `Jarvis.Caching.Redis` | 1.1.0 | Infrastructure (tùy chọn) |
| MVC | `Jarvis.Mvc` | 1.1.0 | Host — kéo transitive `Jarvis.Common` + `Jarvis.DDD.Domain.Shared` + `Jarvis.OpenTelemetry`, cân nhắc khi chỉ cần domain thuần |
| Swashbuckle | `Jarvis.Swashbuckle` | 1.0.1 | Host |
| Health checks | `Jarvis.HealthChecks` | 1.0.0 | Host |
| OpenTelemetry | `Jarvis.OpenTelemetry` | 1.0.1 | Host |
| Authentication | `Jarvis.Authentications.*` | 1.0.1 | Host |

Bảng đầy đủ / monorepo ProjectReference: [workflows/init.md](workflows/init.md), csproj repo Jarvis.

## Quy tắc DI (develop)

| Thứ tự | Lý do |
|---|---|
| `AddJarvisCaching()` → `AddEntityFramework()` | EF bọc `ITenantConnectionStringResolver` qua `ICacheService` |
| `AddCoreDbContext` sau `AddEntityFramework` | Multitenancy + interceptor |
| `AddJarvisOpenTelemetry` trước `Build()` | Plug-in trong callback `configureServices` |

Skill chuyên sâu: [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md) · [minipower-backend-caching-dotnet](../minipower-backend-caching-dotnet/README.md) · [minipower-backend-telemetry-dotnet](../minipower-backend-telemetry-dotnet/README.md)

## Modules (atomic)

| Module | Skill chuyên sâu |
|---|---|
| Kiến trúc + tính năng mới | [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/README.md) |
| Authentication | [minipower-backend-authentication-dotnet](../minipower-backend-authentication-dotnet/README.md) |
| Notification | [minipower-backend-notification-dotnet](../minipower-backend-notification-dotnet/README.md) |
| Entity Framework | [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md) |
| Caching | [minipower-backend-caching-dotnet](../minipower-backend-caching-dotnet/README.md) |
| Blob storing | [minipower-backend-blobstoring-dotnet](../minipower-backend-blobstoring-dotnet/README.md) |
| Swashbuckle | [minipower-backend-swashbuckle-dotnet](../minipower-backend-swashbuckle-dotnet/README.md) |
| OpenTelemetry | [minipower-backend-telemetry-dotnet](../minipower-backend-telemetry-dotnet/README.md) |
| Health checks | [minipower-backend-healthcheck-dotnet](../minipower-backend-healthcheck-dotnet/README.md) |

Mở rộng module: dùng [templates/SKILLS.md](templates/SKILLS.md) và skill `*-dotnet` trong `.opencode/skills/`.

## F5 sau scaffold

- Startup project: `{Product}.Host`
- `launchSettings.json` → Swagger
- `GET /api/ping` — không cần DB
- `/health/live` — OK; `/health/ready` cần PostgreSQL nếu bật DB check

## Output bắt buộc (scaffold)

- Solution 5 project + **3** test projects (gồm `{Product}.ArchitectureTests`)
- `*LayerExtension.cs` mỗi layer
- `Program.cs` mỏng
- `appsettings` + `launchSettings`
- `.editorconfig` (root) + `src/Directory.Build.props` — [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md)
- `dotnet build` thành công; `dotnet test -c Debug` xanh — kể cả luật kiến trúc R1–R7 ([minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md))
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
