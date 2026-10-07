# Connect — Cài / kiểm tra MCP OpenProject

Chạy **trước** L1 khi MCP chưa sẵn sàng hoặc người yêu cầu “kết nối OpenProject”.

## 1. Face profile

1. Đọc `memory/profile.json`.
2. Nếu `tasks_provider !== "openproject"` → hỏi **một lượt**: chuyển sang OpenProject (`minipower init` hoặc sửa profile) hay chỉ xem hướng dẫn cài MCP? Không gọi MCP khi provider lệch.

## 2. Kiểm tra catalog

1. `GetDynamicTools` — tìm namespace trong `profile.mcp.tasks` (nếu có) hoặc quét tên có `openproject` / `op`.
2. **Có namespace + tool** → gọi smoke **chỉ đọc** (ví dụ `search_projects` hoặc `search_work_packages` page 1). PASS → báo “MCP đã kết nối”, quay [l1-read.md](l1-read.md). FAIL → bước 3.
3. **`needsAuth`** → `mcp_auth` **một lần**, thử lại smoke. Vẫn lỗi → bước 3.
4. **Không namespace** → bước 3.

## 3. Hỏi thông tin (một lượt)

Thiếu thì hỏi cùng lúc, không nhỏ giọt:

| # | Hỏi | Ghi chú |
|---|-----|---------|
| 1 | **URL instance** | Ví dụ `https://openproject.company.com` — không dấu `/` cuối |
| 2 | **API token** | My account → Access tokens — **không** paste vào `profile.json` git |
| 3 | **Tên server MCP** | Mặc định `openproject` (key trong `mcp.json`) |
| 4 | **Cách cài** | A) npx community (mặc định) · B) HTTP `/mcp` Enterprise |

Người không muốn đưa token trong chat → hướng dẫn tự điền `env` trong file local.

## 4. In snippet cấu hình

### A — npx (mặc định, khuyến nghị)

Thêm vào `~/.cursor/mcp.json` (merge vào `mcpServers`, không xoá server khác):

```json
"openproject": {
  "command": "npx",
  "args": ["-y", "@crunchymonkies/mcp-openproject"],
  "env": {
    "OPENPROJECT_BASE_URL": "https://YOUR_INSTANCE",
    "OPENPROJECT_API_TOKEN": "YOUR_TOKEN"
  }
}
```

Gói khác (OliverRhyme, sidecar, …): giữ cùng pattern `command`/`args`/`env` theo README upstream — **không** chép secret vào repo Minipower.

### B — Enterprise HTTP `/mcp`

```json
"openproject": {
  "type": "http",
  "url": "https://YOUR_INSTANCE/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  }
}
```

## 5. Cập nhật profile dự án

Sau người xác nhận đã lưu `mcp.json` và **reload MCP** (Settings → MCP → Restart, hoặc restart Cursor):

```json
"tasks_provider": "openproject",
"mcp": {
  "docs": "...",
  "tasks": "openproject",
  "chat": "...",
  "code": "..."
}
```

Chỉ sửa `tasks` và `tasks_provider` nếu các mặt khác đã có. `mcp.tasks` **bắt buộc** khớp key server (bước 3).

## 6. Verify lại

1. `GetDynamicTools` namespace vừa cấu hình.
2. Liệt kê ngắn tool đọc WP/project có trong catalog.
3. Smoke 1 tool đọc → in 1–3 bản ghi mẫu (id, subject, status).
4. **FAIL** → checklist: URL sai, token hết hạn, chưa reload MCP, tên namespace lệch `mcp.tasks`, firewall.

Không giả PASS. Không gọi tool ghi trong bước verify.
