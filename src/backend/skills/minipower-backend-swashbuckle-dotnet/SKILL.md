---
name: minipower-backend-swashbuckle-dotnet
description: Thiết lập Jarvis.Swashbuckle — Swagger/OpenAPI đa phiên bản, BaseResponse schema, security JWT/API Key. Dùng khi tích hợp Swagger .NET với Jarvis API response wrapper.
metadata:
  workflow: github
  version: 1.0.0
---

# Jarvis.Swashbuckle — Orchestrator

Skill điều phối `Jarvis.Swashbuckle` trên ASP.NET Core. Hướng dẫn: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Project chưa có Swagger Jarvis | [workflows/init.md](workflows/init.md) |
| Thêm version / security scheme | [workflows/add.md](workflows/add.md) |

## Quy tắc cốt lõi

- `builder.AddCoreSwagger()` sau `AddCoreWebApi` / API versioning.
- `app.UseCoreSwagger()` trước `MapControllers` (theo pipeline Host Jarvis).
- Section `Swagger` trong appsettings — `Enable`, `Versions`, `SecuritySchemes`.
- API versioning: host đăng ký `AddApiVersioning` + `AddApiExplorer` (không nằm trong package Swashbuckle).
- XML examples: `IExamplesProvider<>` + `<GenerateDocumentationFile>true</GenerateDocumentationFile>`.

## Package

| PackageId | Version* |
|---|---|
| `Jarvis.Swashbuckle` | 1.0.1 |

Phụ thuộc `Jarvis.DDD.Domain.Shared`, Swashbuckle, Asp.Versioning (host).

## Providers (atomic)

| Provider | Path |
|---|---|
| JWT security | [providers/jwt-security/SKILL.md](providers/jwt-security/SKILL.md) |
| API Key security | [providers/api-key-security/SKILL.md](providers/api-key-security/SKILL.md) |

## Templates

- [templates/program-setup.cs](templates/program-setup.cs)
- [templates/appsettings-swagger.json](templates/appsettings-swagger.json)

## Output bắt buộc

- `AddCoreSwagger` / `UseCoreSwagger`
- `appsettings` section `Swagger`
- Swagger UI mở được; schema `BaseResponse` cho path `/api`
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer + hướng phụ thuộc theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`
