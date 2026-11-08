# minipower-tasks-github

SOP **GitHub Issue** (đọc / tìm / nháp / ghi), kèm nhãn, sub-issue và thẻ Project khi quyền cho phép. Cài khi pack `tasks/` nằm trong `minipower install`.

Persona (tuỳ phiên): [agents/minipower-tasks-github.md](../../agents/minipower-tasks-github.md).

## L1 / L2 / L3

| Mức | Làm gì | Cổng người |
|-----|--------|------------|
| L1 | Tìm, lọc, đọc issue, đọc nhãn, đọc board | Không |
| L2 | **Tìm trùng trước**, rồi bảng đề xuất kèm tiêu đề và nội dung nguyên văn | Chờ một lần OK; nghi trùng thì hỏi riêng |
| L3 | Tool ghi **nếu catalog có** | Chỉ dòng còn tick |

## Repo đích lấy từ đâu

Từ `git remote get-url origin`, không khai trong file nào. Nhờ vậy cùng một lá dùng được cho repo dự án lẫn repo công cụ, và không có tên repo nào nằm rải rác trong cấu hình.

Thiếu remote hoặc nhiều remote thì skill hỏi, không đoán.

## Hai ngữ cảnh

| Đang đứng ở | Dấu hiệu | Kiểm provider |
|---|---|---|
| Dự án đích | có `memory/profile.json` | có, `tasks_provider` phải là `github` |
| Repo công cụ | không có file đó | không kiểm |

## Cài MCP (máy người)

Skill [workflows/connect.md](workflows/connect.md) hướng dẫn khi MCP chưa sẵn sàng.

**Khuyến nghị:** GitHub MCP bản remote — `https://api.githubcopilot.com/mcp/`, xác thực bằng header `Authorization: Bearer <token>`.

Token cần quyền đọc ghi **Issues** của repo. Muốn dùng cả Projects thì cấp thêm quyền **Projects** ở cấp tài khoản, nếu không thì mọi tool Projects trả 403 và skill sẽ báo chưa đọc được board.

Sau cài, với dự án đích thì `memory/profile.json`:

```json
"tasks_provider": "github",
"mcp": { "tasks": "github" }
```

Tên `"github"` phải **khớp** key server MCP trong cấu hình client.

## Không làm

- Pull request, commit, review code — đó là pack [`vcs/`](../../../vcs/README.md)
- Tự tạo nhãn chưa tồn tại
- Đổi cột Status thay người
- Đóng issue mà không nêu lý do
- Ghi secret vào `profile.json` commit
