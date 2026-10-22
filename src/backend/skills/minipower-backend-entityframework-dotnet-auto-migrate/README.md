# minipower-backend-entityframework-dotnet-auto-migrate

Skill **lá** — auto migrate EF khi Host start (`EnsureMigrateDb` / `EnsureMigrateTemplateDb`). Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Hành động |
|------------|-----------|
| Bật `ConnectionStrings:AutoMigrate` trên Host | Đọc SKILL.md — chọn API theo UoW vs tenant template + `ITenantEntity` |
| Chưa có EF Jarvis | [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/workflows/init.md) trước |

## Cách gọi

```text
@.cursor/skills/minipower-backend-entityframework-dotnet-auto-migrate/SKILL.md

Thêm auto migrate Host cho MyApp — App UoW + tenant DbContext có ITenantEntity.
```

## Liên quan

- Orchestrator: [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md)
- SSOT Jarvis: `jarvis/frameworks/Platform.ORM.EntityFramework/AppBuilderExtension.cs`, `jarvis/Sample/Program.cs`
