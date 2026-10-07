# minipower-tasks-openproject

SOP **OpenProject work package** (đọc / tìm / nháp / ghi nếu MCP có tool). Cài khi pack `tasks/` nằm trong `minipower install`.

Persona (tuỳ phiên): [agents/minipower-tasks-openproject.md](../../agents/minipower-tasks-openproject.md).

## L1 / L2 / L3

| Mức | Làm gì | Cổng người |
|-----|--------|------------|
| L1 | Tìm, lọc, list/get WP | Không |
| L2 | Bảng đề xuất | Chờ một lần OK |
| L3 | Tool ghi **nếu catalog có** | Chỉ dòng còn tick |

## Cài MCP (máy người)

Skill [workflows/connect.md](workflows/connect.md) hướng dẫn khi MCP chưa sẵn sàng.

**Khuyến nghị (stdio, npx):** [@crunchymonkies/mcp-openproject](https://github.com/CrunchyMonkies/mcp-openproject) — env `OPENPROJECT_BASE_URL`, `OPENPROJECT_API_TOKEN`.

**Enterprise:** instance có endpoint `/mcp` — cấu hình HTTP trong Cursor (xem [tài liệu OpenProject MCP](https://www.openproject.org/docs/system-admin-guide/integrations/mcp-server/)).

Token: OpenProject → **My account → Access tokens** (quyền đọc/ghi theo nhu cầu).

Sau cài: `memory/profile.json`:

```json
"tasks_provider": "openproject",
"mcp": { "tasks": "openproject" }
```

Tên `"openproject"` phải **khớp** key trong `~/.cursor/mcp.json`. Đổi tên server → cập nhật `mcp.tasks`.

`minipower install` với pack `tasks`. Agent-file không qua CLI registry.

## Không làm

- Outline / GitLab / Lark
- SDK hoặc script REST OpenProject trong repo Minipower
- Ghi secret vào `profile.json` commit
