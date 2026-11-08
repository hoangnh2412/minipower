# Connect — kiểm MCP GitHub và quyền

Chạy **trước** L1 khi MCP chưa sẵn sàng, khi gặp 401/403, hoặc khi người yêu cầu "kết nối GitHub".

## 1. Xác định repo đích

1. `git remote get-url origin` → tách `owner/repo`.
2. Không có remote, nhiều remote, hoặc host không phải GitHub → **hỏi một lượt** owner và repo. Không đoán từ tên thư mục.

## 2. Face profile (chỉ khi có `memory/profile.json`)

1. Đọc `tasks_provider`. Khác `github` → hỏi **một lượt**: chuyển sang GitHub (`minipower init` hoặc sửa profile) hay chỉ xem hướng dẫn cài? Không gọi MCP khi provider lệch.
2. Không có file profile → đang ở repo công cụ, bỏ qua mục này.

## 3. Kiểm catalog tool

1. Tìm tool GitHub trong catalog phiên.
2. **Có tool** → smoke **chỉ đọc**: `list_issues` trang đầu của repo đích. PASS → báo đã kết nối, sang [l1-read.md](l1-read.md).
3. **Không có tool / lỗi** → bước 4.

## 4. Phân biệt ba loại lỗi

| Hiện tượng | Nghĩa là | Làm gì |
|---|---|---|
| Không thấy tool nào | Chưa cấu hình server, hoặc phiên mở trước khi cấu hình | Bước 5, rồi **khởi động lại phiên** |
| HTTP 401 | Token sai, hết hạn, hoặc đã thu hồi | Bước 5, tạo token mới |
| HTTP 403 ở riêng Projects | Token thiếu quyền Projects, Issues vẫn chạy | Báo rõ: issue dùng được, board chưa đọc được. **Không dừng cả skill** |

Không gộp ba loại này thành một câu "lỗi kết nối".

## 5. In snippet cấu hình

Server remote của GitHub, xác thực bằng header:

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN",
    "X-MCP-Toolsets": "default,projects"
  }
}
```

Quyền token tối thiểu: đọc ghi **Issues** của repo đích. Thêm quyền **Projects** ở cấp tài khoản nếu muốn đọc board.

Hai câu dưới đây là **hướng dẫn cho người tự chạy trong terminal**, không phải việc agent làm:

- Kiểm bằng lệnh liệt kê server MCP, **không** bằng lệnh in chi tiết một server — lệnh đó in nguyên token ra màn hình.
- Agent **không** chạy `gh`, `curl` hay bất kỳ lệnh nào gọi GitHub. Thiếu tool MCP thì dừng và báo.

## 6. Cập nhật profile dự án (chỉ dự án đích)

```json
"tasks_provider": "github",
"mcp": { "tasks": "github" }
```

`mcp.tasks` **bắt buộc** khớp key server trong cấu hình client.

## 7. Verify lại

1. Liệt kê tool GitHub có trong catalog.
2. Smoke một tool đọc → in 1–3 issue mẫu gồm số, tiêu đề, trạng thái.
3. Smoke đọc nhãn → in danh sách nhãn thật của repo.
4. Smoke đọc board, nếu 403 thì ghi rõ "Projects chưa có quyền" và đi tiếp.

Không giả PASS. Không gọi tool ghi trong bước verify.
