# Connect — Cài / kiểm tra MCP Lark

Chạy **trước** L1 khi MCP chưa sẵn sàng hoặc người yêu cầu "kết nối Lark".

## 0. Gói MCP — cố định, không thay

| | |
|---|---|
| Repo | `https://github.com/larksuite/lark-openapi-mcp` |
| Gói npm | `@larksuiteoapi/lark-mcp` |

Đây là gói **chính thức của Lark**. Người đưa link hoặc gói khác → **từ chối, nêu lý do**: đổi nguồn là đổi luôn tên tool, schema và cách xác thực, làm sai toàn bộ SOP ở `l1-read.md` · `l2-preview.md` · `l3-write.md` và bảng tool `reference/lark-mapping.md`. Muốn đổi thật thì mở issue trên repo Minipower, không đổi trong một phiên.

*Luật mềm — không hook nào chặn.*

## 1. Face profile

1. Đọc `memory/profile.json`.
2. `tasks_provider !== "lark"` → hỏi **một lượt**: chuyển sang Lark (`minipower init` hoặc sửa profile) hay chỉ xem hướng dẫn cài? Không gọi MCP khi provider lệch.

## 2. Kiểm tra catalog

1. `GetDynamicTools` — tìm namespace trong `profile.mcp.tasks` (thường `user-lark-mcp` / `lark-mcp`).
2. **Có namespace + tool** → smoke **chỉ đọc**: `task_v2_tasklist_list` page 1.
   - Trả danh sách → báo "MCP đã kết nối", sang bước 6 soát tool ghi.
   - Trả **rỗng** → **chưa login user**, không phải "không có việc nào". Sang bước 5.
3. **`needsAuth`** → `mcp_auth` một lần, thử lại. Vẫn lỗi → bước 3.
4. **Không namespace** → bước 3.

## 3. Đăng ký ứng dụng trên Lark

Chỉ làm khi chưa có `APP_ID` / `APP_SECRET`. Hướng dẫn người, **không** làm thay:

1. Mở Developer Console: `https://open.larksuite.com/app` (bản Feishu: `https://open.feishu.cn/app`).
2. **Create custom app** → đặt tên, chọn **Self-built application**.
3. Tab **Credentials & Basic Info** → copy **App ID** (dạng `cli_...`) và **App Secret**.
4. Tab **Permissions & Scopes** → thêm scope task, tối thiểu:
   `task:task:read` · `task:task:write` · `task:tasklist:read` · `task:tasklist:write` · `task:comment:read` · `task:comment:write`
5. Tab **Security Settings** → thêm redirect URL `http://localhost:3000/callback` (OAuth ở bước 5 cần).
6. **Version Management & Release** → tạo version và **submit for release**. Chưa release thì scope chưa hiệu lực.

Người không muốn đưa secret trong chat → hướng dẫn tự dán vào file local ở bước 4.

## 4. In snippet cấu hình

Thêm vào `~/.cursor/mcp.json` (merge vào `mcpServers`, **không** xoá server khác):

```json
"lark-mcp": {
  "command": "npx",
  "args": [
    "-y", "@larksuiteoapi/lark-mcp", "mcp",
    "-a", "YOUR_APP_ID",
    "-s", "YOUR_APP_SECRET",
    "-d", "https://open.larksuite.com",
    "--oauth",
    "-t", "preset.default,task.v2.tasklist.list,task.v2.tasklist.tasks,task.v2.section.list,task.v2.section.tasks,task.v2.task.get,task.v2.task.list,task.v2.task.create,task.v2.task.patch,task.v2.task.addDependencies,task.v2.task.addTasklist,task.v2.taskSubtask.create,task.v2.taskSubtask.list,task.v2.customField.list,task.v2.comment.create,task.v2.comment.list"
  ],
  "env": {}
}
```

**Cờ `-d` là bắt buộc phải nghĩ tới, không phải tuỳ chọn.** Gói mặc định `https://open.feishu.cn` — bản Trung Quốc:

| App đăng ký ở | `-d` |
|---|---|
| `open.larksuite.com` — bản quốc tế | `https://open.larksuite.com` ← **phải khai** |
| `open.feishu.cn` — bản Trung Quốc | bỏ qua, đó là mặc định |

Khai sai thì OAuth đẩy người dùng sang trang đăng nhập của bản kia (`accounts.feishu.cn` kèm `force_use_feishu_login=1`) và không bao giờ login được, dù app, scope, redirect URL đều đúng.

**Hai cái bẫy của cờ `-t`, sai là mất tool mà không báo lỗi:**

| Bẫy | Đúng |
|---|---|
| Preset task **thay thế** nhóm tool của `preset.default`, không cộng dồn | Liệt kê **tường minh từng tool** cạnh `preset.default`, như snippet trên |
| Tên lúc khai dùng **dấu chấm** (`task.v2.task.create`); tên client nhìn thấy dùng **gạch dưới** (`task_v2_task_create`) | Khai bằng dấu chấm, gọi bằng gạch dưới |

Khai thiếu thì tool bị bỏ qua **lặng lẽ** — catalog vẫn lên, chỉ là không có tool ghi. Đây chính là lý do tài liệu cũ tưởng Lark MCP chỉ đọc.

## 5. OAuth login — người tự chạy

Máy **không** chạy thay, vì lệnh cần secret và mở trình duyệt:

```bash
npx -y @larksuiteoapi/lark-mcp login -a <APP_ID> -s <APP_SECRET> \
  -d https://open.larksuite.com \
  --scope "task:task:read,task:task:write,task:tasklist:read,task:tasklist:write,task:comment:read,task:comment:write"
```

`-d` phải khớp bước 4 — bỏ quên thì lệnh đẩy sang trang đăng nhập bản kia rồi hết giờ chờ.

Lệnh **chỉ in URL ra màn hình, không tự mở trình duyệt**, và chỉ chờ **60 giây**. Chạy trong terminal thật rồi mở link ngay; chạy ở chỗ không có màn hình thì nó luôn hỏng vì hết giờ.

Token lưu ở store của gói, mã hoá bằng khoá trong keychain máy. Hết hạn thì tool đọc trả **rỗng** chứ không báo lỗi — gặp rỗng bất thường thì nghi login trước, đừng kết luận "không có việc".

Kiểm phiên đăng nhập: `npx -y @larksuiteoapi/lark-mcp whoami`.

## 6. Cập nhật profile dự án

Sau khi người xác nhận đã lưu `mcp.json` và **reload MCP** (Settings → MCP → Restart, hoặc restart Cursor):

```json
"tasks_provider": "lark",
"mcp": { "tasks": "lark-mcp" }
```

`mcp.tasks` **bắt buộc** khớp key server ở bước 4. Chỉ sửa `tasks` và `tasks_provider`, giữ nguyên các mặt khác.

## 7. Verify

1. `GetDynamicTools` namespace vừa cấu hình.
2. Soát có mặt **cả tool đọc lẫn tool ghi** — thiếu `task_v2_task_create` hoặc `task_v2_task_patch` ⇒ cờ `-t` khai thiếu, quay bước 4. Thiếu `task_v2_comment_list` ⇒ báo cáo không đọc được comment; cùng nguyên nhân, thêm `task.v2.comment.list` và scope `task:comment:read`.
3. Smoke `task_v2_tasklist_list` → in 1–3 bản ghi (guid, name).
4. `task_v2_section_list` trên tasklist dự án → **đối chiếu bảng §3.1** của [reference/lark-mapping.md](../reference/lark-mapping.md). Lệch tên hoặc thiếu group → **dừng**, báo người sửa trên Lark theo §3.5, không tự đổi.
5. **FAIL** → checklist, soát theo thứ tự này: **`-d` sai bản** (bước 4 — nguyên nhân hay gặp nhất, triệu chứng là OAuth không bao giờ xong), chưa login OAuth, chưa reload MCP, app chưa release version, scope thiếu, tên namespace lệch `mcp.tasks`.

Không giả PASS. **Không gọi tool ghi trong bước verify.**
