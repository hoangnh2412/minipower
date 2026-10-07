# tasks — kênh quản lý việc

Module **kênh** (ADR-033 QĐ-5): SOP gọi MCP mặt `tasks`. Không chứa luật UC/FR. Provider: OpenProject · Lark · `none` (SQLite).

Manifest: [PACK.md](PACK.md). Cổng: [rules/l1-l2-l3-tasks.md](./rules/l1-l2-l3-tasks.md).

## Skill

| Skill | Tài liệu | Việc |
|---|---|---|
| **minipower-tasks-openproject** | [skills/minipower-tasks-openproject/README.md](./skills/minipower-tasks-openproject/README.md) | Đọc / tìm / nháp / ghi WP OpenProject; cài MCP nếu chưa kết nối |
| **minipower-tasks-lark** | [skills/minipower-tasks-lark/README.md](./skills/minipower-tasks-lark/README.md) | Đọc / tìm / nháp / ghi task Lark theo L1–L3; map ID Minipower, không copy FR |

## Agent-file (persona)

Cùng `name` với skill lá. **Không** vào `module-registry.json` (registry = pack). CLI **không** copy file này — `minipower install` chỉ symlink `skills/`.

| File | Vai trò |
|---|---|
| [agents/minipower-tasks-openproject.md](./agents/minipower-tasks-openproject.md) | Ranh giới: chỉ WP OpenProject; connect MCP trước khi L1 |
| [agents/minipower-tasks-lark.md](./agents/minipower-tasks-lark.md) | Ranh giới: chỉ task Lark; đọc SKILL trước khi gọi tool |

## Liên quan

- Chat Lark: [`chat/`](../chat/README.md) — tin nhắn, không task
- Task local (`tasks_provider: none`): SQLite `memory/trace.db` (`artifact` type=task), không MCP
