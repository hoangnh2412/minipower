---
name: minipower-backend-realtime-dotnet
description: Thiết lập Jarvis.Realtime + SignalR — AddCoreRealtime, UseSignalR, UseRedisBackplane, MapRealtimeHub. Dùng khi host cần hub/publish realtime. Không dạy inbox list/mark.
metadata:
  workflow: github
  version: 1.0.0
---

# Jarvis.Realtime — Orchestrator

Skill **transport** (hub, connection, publish). Inbox in-app → [notifications-module-dotnet](../notifications-module-dotnet/README.md). SMTP → [minipower-backend-notification-dotnet](../minipower-backend-notification-dotnet/README.md).

Hướng dẫn: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Host chưa có realtime | [workflows/init.md](workflows/init.md) |
| Bật Redis backplane (nhiều node) | [workflows/add.md](workflows/add.md) |

## Quy tắc cốt lõi

- `builder.AddCoreRealtime().UseSignalR()` rồi `app.MapRealtimeHub<TUser, TTenant>()`.
- Prereq: `AddCurrentUser` + `AddCurrentTenant` + store.
- Backplane Redis ≠ inbox Redis. Config backplane: `Realtime:SignalR` (`UseRedisBackplane`, `Redis`).
- **Không** đăng ký inbox store trong `Jarvis.Realtime`.
- Hub path inbox mặc định `/hubs/notifications` — chat sau `/hubs/chat`.
- Cầu inbox `AddNotificationAppServiceWithRealtime` thuộc skill **notifications-module**, không dạy chi tiết ở đây.

## Packages

| PackageId | Khi nào |
|---|---|
| `Jarvis.Realtime` | Bắt buộc |
| `Jarvis.Realtime.SignalR` | `UseSignalR` / `MapRealtimeHub` |

## Templates

- [templates/program-setup.cs](templates/program-setup.cs)

## Output bắt buộc

- `AddCoreRealtime().UseSignalR()`
- `MapRealtimeHub<TUser, TTenant>()`
- `dotnet build`
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm
- File đặt đúng layer + hướng phụ thuộc theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — `dotnet test -c Debug` xanh, kể cả `{Product}.ArchitectureTests`

