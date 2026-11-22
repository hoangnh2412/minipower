# Connect — Kết nối MCP OmniRoute

Chạy **trước** L1 khi MCP chưa sẵn sàng, người yêu cầu "kết nối OmniRoute", hoặc tool đọc trả 401/403.

## 0. Server MCP — cố định

| | |
|---|---|
| Repo | `https://github.com/cheaper-inference/OmniRoute` |
| MCP | tích hợp sẵn trong OmniRoute, không cài thêm gói |
| Transport dùng | HTTP streamable `POST {host}/api/mcp/stream` (server ở xa, không loopback) |

Người đưa gói MCP bên thứ ba cho OmniRoute → từ chối, nêu lý do: khác tên tool, khác scope, sai toàn bộ SOP. Muốn đổi thì mở issue trên repo Minipower. *Luật mềm.*

## 1. Con trỏ trong profile

1. Đọc `memory/profile.json` → `mcp.gateway`.
2. Có giá trị → bước 2. Không có → hỏi **một lượt**: host OmniRoute, tên server muốn đặt trong client (đề xuất `omniroute`), đã có key cho agent chưa.
3. Đang ở repo công cụ (không có `profile.json`) → hỏi tên server, bỏ bước 5.

## 2. Kiểm catalog

1. Tìm namespace `mcp.gateway` trong catalog tool của phiên.
2. **Có** → smoke **chỉ đọc**: `omniroute_get_health`. Trả JSON → sang bước 6 soát scope. Trả 401/403 → key thiếu `mcp:connect` hoặc chưa gắn header → bước 3.
3. **Không có namespace** → bước 3.

## 3. Tạo API key riêng cho agent — người tự làm

Hướng dẫn, **không** làm thay, không nhận key qua chat nếu người không muốn:

1. Mở dashboard OmniRoute → mục **API Keys** (REST tương ứng `/api/v1/registered-keys`).
2. Tạo key **mới**, tên gợi ý `minipower-agent`. **Không** dùng lại key cá nhân của người.
3. Scope theo mức người cho phép:

   | Mức | Scope |
   |---|---|
   | Chỉ L1 | `mcp:connect` · `read:*` |
   | Cho L3 phạm vi lá này | thêm `write:combos` · `write:budget` · `write:resilience` |
   | Không bao giờ | `manage` · `write:cache` · `write:memory` · `write:plugins` · `execute:*` |

4. Nếu dashboard cho đặt quota riêng cho key → đặt, để agent không tiêu quota của người.
5. Cắt catalog phía server nếu muốn gọn: biến môi trường `MCP_TOOL_ALLOW` liệt kê nhóm `omniroute_*` cần dùng (xem [reference/omniroute-tools.md](../reference/omniroute-tools.md) § ngoài phạm vi). Tài liệu upstream chưa mô tả cú pháp chi tiết — người thử trên server, không đoán.

## 4. Snippet cấu hình client

Thay `{host}` và `{KEY}`; **không** commit key, file cấu hình chứa key phải nằm trong `.gitignore`.

Claude Code (dự án hoặc user scope):

```bash
claude mcp add --transport http omniroute "https://{host}/api/mcp/stream" \
  --header "Authorization: Bearer {KEY}"
```

Cursor — `~/.cursor/mcp.json`, merge vào `mcpServers`, không xoá server khác:

```json
"omniroute": {
  "url": "https://{host}/api/mcp/stream",
  "headers": { "Authorization": "Bearer {KEY}" }
}
```

Cú pháp hai client đổi theo phiên bản — lệch thì theo tài liệu client, không theo file này.

## 5. Cập nhật profile dự án

Sau khi người xác nhận đã lưu cấu hình và reload MCP:

```json
"mcp": { "gateway": "omniroute" }
```

Chỉ thêm khoá `gateway`, giữ nguyên `docs` · `tasks` · `chat` · `code`. `profile-guard` không kiểm khoá này (không có `gateway_provider`), nên lệch tên chỉ lộ ra khi catalog không thấy namespace — vì thế bước 6 bắt buộc chạy.

## 6. Verify

1. Catalog có namespace đúng tên `mcp.gateway`.
2. Soát **đúng bộ tool theo mức đã chọn** ở bước 3: chỉ L1 thì **không được thấy** tool `write:*`; thấy là key cấp thừa scope → quay bước 3.
3. Smoke đọc ba tool: `omniroute_get_health` · `omniroute_list_combos` · `omniroute_check_quota`. In 1–3 dòng mỗi tool.
4. Đối chiếu tên tool thực tế với [reference/omniroute-tools.md](../reference/omniroute-tools.md). Lệch → sửa reference, bump version lá; **không** sửa SOP cho khớp tài liệu cũ.
5. **FAIL** → soát theo thứ tự: header `Authorization` chưa tới server (proxy/ingress cắt header) · key thiếu `mcp:connect` · URL sai đường dẫn `/api/mcp/stream` · server chưa bật MCP · host không phải loopback mà dùng key không scope · key bị thu hồi.

Không giả PASS. **Không gọi tool ghi trong verify.**
