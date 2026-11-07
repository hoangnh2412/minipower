---
name: minipower-backend-authentication-dotnet
description: Thiết lập Jarvis Authentication — JWT Bearer, API Key, HTTP Basic, AWS Cognito qua AddJarvisAuthentication + Composite scheme. Dùng khi API ASP.NET Core cần xác thực Bearer, header API key, Basic hoặc Cognito qua Jarvis.Authentications.*.
metadata:
  workflow: github
  version: 1.0.0
---

# Jarvis.Authentication — Orchestrator

Skill điều phối `Jarvis.Authentications.*` trên ASP.NET Core Host.

**Lưu ý PackageId:** folder repo `Jarvis.Authentication.*` → NuGet **`Jarvis.Authentications.*`** (có **s**). Namespace vẫn là `Jarvis.Authentication.*` (không s).

Hướng dẫn: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Host chưa có authentication Jarvis | [workflows/init.md](workflows/init.md) |
| Thêm scheme (JWT / API Key / Basic / Cognito) | [workflows/add.md](workflows/add.md) |

## Quy tắc cốt lõi

- Entry point **bắt buộc**: `builder.Services.AddJarvisAuthentication(configuration, auth => { ... })` — bind section `Authentication`, validate `Type`, đăng ký `IPasswordPolicyValidator`, set Default Authenticate/Challenge scheme. **Không** gọi `services.AddAuthentication()` trực tiếp.
- Satellite `AddCore*` đăng ký **trong callback**: `auth.AddCoreJwtBearer(...)` / `AddCoreApiKey<>` / `AddCoreBasic<>`.
- ≥ 2 scheme → `auth.AddJarvisCompositeScheme(includeBasic: ...)` + `DefaultAuthenticateScheme = "Composite"` (forward theo header: API key → Basic → Bearer).
- Pipeline: `UseAuthentication()` → `UseAuthorization()` **trước** `MapControllers`.
- Nguồn credential là extension point: mặc định `ConfigApiKeyProvider` / `ConfigBasicCredentialProvider` (đọc config), override sang DB/Redis/vault. Provider đăng ký **Singleton** — tra DB dùng `IDbContextFactory`.
- Dùng hằng `JarvisAuthenticationSchemes` (`Composite` / `ApiKey`=`"Default"` / `Basic` / `Bearer`) thay vì hard-code string.
- Swagger security: [minipower-backend-swashbuckle-dotnet](../minipower-backend-swashbuckle-dotnet/README.md) — `SecuritySchemes` JWT / API_KEY.
- Không commit secret/key/password — env / secret store.

## Packages

| PackageId | Khi nào |
|---|---|
| `Jarvis.Authentications` | Base (entry point, Composite, password policy, hằng scheme) |
| `Jarvis.Authentications.Jwt` | Bearer JWT |
| `Jarvis.Authentications.ApiKey` | Header API key |
| `Jarvis.Authentications.Basic` | HTTP Basic |
| `Jarvis.Authentications.Cognito` | AWS Cognito |

## Providers (atomic)

| Provider | Path |
|---|---|
| JWT Bearer | [providers/jwt/SKILL.md](providers/jwt/SKILL.md) |
| API Key | [providers/api-key/SKILL.md](providers/api-key/SKILL.md) |
| HTTP Basic | [providers/basic/SKILL.md](providers/basic/SKILL.md) |
| Cognito | [providers/cognito/SKILL.md](providers/cognito/SKILL.md) |

## Templates

- [templates/program-auth.cs](templates/program-auth.cs)
- [templates/appsettings-authentication.json](templates/appsettings-authentication.json)

## Output bắt buộc

- `AddJarvisAuthentication(config, auth => { AddCore* })` + `UseAuthentication` / `UseAuthorization`
- `appsettings` section `Authentication` (schema đúng: API Key `KeyName`+`Key`, Basic `Users`, JWT `Authority`/`IssuerSigningKeys`)
- Protected endpoint trả 401 khi thiếu credential (validate)
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer + hướng phụ thuộc theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`

