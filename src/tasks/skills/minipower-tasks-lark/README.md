# minipower-tasks-lark

SOP **Lark Tasks** (đọc / tìm / nháp / ghi nếu MCP có tool). Cài khi pack `tasks/` nằm trong `minipower install` — CLI symlink thư mục skill, không cần sửa CLI.

Persona (tuỳ phiên): [agents/minipower-tasks-lark.md](../../agents/minipower-tasks-lark.md).

## L1 / L2 / L3

| Mức | Làm gì | Cổng người |
|-----|--------|------------|
| L1 | Tìm, lọc, list, get | Không |
| L2 | Bảng đề xuất | Chờ một lần OK |
| L3 | Tool ghi: tạo, sửa, chuyển section, nối phụ thuộc | Chỉ dòng còn tick |

**MCP Lark ghi được task** — catalog đầy đủ có khoảng 50 tool task. Nếu phiên nào chỉ thấy tool đọc thì là **cờ `-t` khai thiếu**, không phải Lark không hỗ trợ.

## Cài MCP (máy người)

Gói **cố định**, không thay bằng nguồn khác: `@larksuiteoapi/lark-mcp` — [larksuite/lark-openapi-mcp](https://github.com/larksuite/lark-openapi-mcp).

Các bước đầy đủ (đăng ký app, lấy App ID / App Secret, chọn scope, snippet cấu hình, OAuth login, verify): [workflows/connect.md](workflows/connect.md).

Tóm tắt: app Feishu/Lark tự dựng → scope task → release version → dán `mcp.json` → `lark-mcp login` lấy user token. Server tên `user-lark-mcp` / `lark-mcp` trong Settings → MCP. Skill không giả kết quả khi server thiếu.

Hai chỗ dễ sai, chi tiết ở `connect.md` §4: preset task **thay thế** chứ không cộng dồn `preset.default`; tên tool khai bằng **dấu chấm** nhưng gọi bằng **gạch dưới**.

`minipower install` với pack `tasks` (mặc định trong registry). Skill đã có trên đĩa được quét `listLeafSkills()` — **không** khai từng lá trong `module-registry.json` (file đó chỉ pack).

Agent-file **không** đi qua CLI: sống trong pack; phiên Agent Chat khớp `description` là đủ. Muốn persona cứng: `@` file agent hoặc Custom Agent Cursor trỏ cùng file — thủ công, không đợt CLI.

## Không làm

- `im_v1_message_create` (`minipower-chat-lark`)
- Wiki / Bitable / Drive / Outline
- OpenProject (lá `minipower-tasks-openproject` khi có SOP)
- Đổi `tasks_provider` (người + `minipower init`)
