---
name: minipower-backend-notification-dotnet
description: Thiết lập Jarvis.Notification — email SMTP qua Mailkit IEmailSender, NotificationBuilder. Dùng khi app gửi email transactional qua section Smtp.
metadata:
  workflow: github
  version: 1.0.0
---

# Jarvis.Notification — Orchestrator

Skill điều phối `Jarvis.Notification` + `Jarvis.Notification.Mailkit` trên Host.

**Phạm vi SMTP only.** Inbox in-app (`Jarvis.Modules.Notifications*`) là skill sóng 2 `notifications-module-dotnet` — không gộp vào đây.

Hướng dẫn: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| App chưa có email sender | [workflows/init.md](workflows/init.md) |
| Đổi SMTP / thêm sender implementation | [workflows/add.md](workflows/add.md) |

## Quy tắc cốt lõi

- `NotificationBuilder` trên `IServiceCollection`: `.AddSmtp(section)` → `.AddEmailSender<MailkitSender>()`.
- Section **`Smtp`** — Host, Port, UserName, Password, Socket (`StartTls`, …).
- **Không** commit password SMTP — env / secret store.
- Resolve `IEmailSender` (keyed theo tên type) hoặc inject `MailkitSender` trực tiếp.
- `Jarvis.Notification.AwsSES` / `AwsSNS` — stub trong repo; chưa có provider skill đầy đủ.

## Packages

| Package / Project | Vai trò |
|---|---|
| `Jarvis.Notification` | Core, `NotificationBuilder` |
| `Jarvis.Notification.Mailkit` | `MailkitSender` : `IEmailSender` |

## Providers

| Provider | Path |
|---|---|
| SMTP Mailkit | [providers/mailkit-smtp/SKILL.md](providers/mailkit-smtp/SKILL.md) |

## Templates

- [templates/notification-setup.cs](templates/notification-setup.cs)
- [templates/appsettings-smtp.json](templates/appsettings-smtp.json)

## Output bắt buộc

- `NotificationBuilder` wiring trên Host
- `appsettings` section `Smtp` (placeholder, secret ngoài repo)
- Gửi email test thành công hoặc mock trong dev
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer + hướng phụ thuộc theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`
