# Changelog — minipower-tasks-lark

## 1.4.0 · 2026-11-21

- L1 đọc được comment: `task_v2_comment_list`, 10 comment mới nhất (`direction=desc`, `page_size=10`). Phục vụ báo cáo của `minipower-work-report`.
- Cờ `-t` và scope cài đặt thêm `task.v2.comment.list`, `task:comment:read`, `task:comment:write`. Thiếu tool hoặc thiếu quyền thì nói rõ, không kết luận ticket không có comment.
- Khi trả comment, kèm `reply_to_comment_id`: trống là chat trên ticket, có giá trị là chat trong thread.

## 1.3.0 · 2026-11-21

- Tạo ticket không ghi khi thiếu Dự án, Loại ticket, Assign, PIC, Start Date, Due Date. Tên trường đọc từ `field_roles` / `type_map`, không đoán trên board. Assign (`members.assignee`) và PIC (`field_roles.owner`) là hai chỗ; không gộp, không bỏ một bên.
- Start Date và Due Date là timeline thực hiện, không để trống, không tự đặt. Chưa có deadline thực hiện thì gán đúng ngày người đưa vào cả `start` và `due`.
- Comment đi cùng lúc tạo và mỗi lần sửa `start` / `due`. Có deadline thực hiện thì ghi loại đó. Chưa có thì đúng một câu: `Ngày … là mốc phản hồi deadline thực hiện`.
- Chưa có deadline thực hiện thì L2 thêm subtask `Due thực tế` (cùng người, cùng ngày mốc). Xong việc khi ghi Start/Due thực hiện lên ticket cha. Bỏ tick thì không tạo.

## 1.2.0 · 2026-11-14

- Thêm `workflows/connect.md` — cài và kiểm tra MCP Lark: đăng ký app trên Developer Console, lấy App ID / App Secret, chọn scope task, release version, snippet `mcp.json`, OAuth login do người tự chạy, verify có mặt cả tool đọc lẫn tool ghi và đối chiếu section thật với bảng ánh xạ.
- Khoá **gói MCP cố định** `@larksuiteoapi/lark-mcp` (repo chính thức của Lark). Người đưa nguồn khác → từ chối kèm lý do, muốn đổi thì mở issue. Luật mềm, không hook nào chặn.
- Sửa chỗ sai: SKILL.md, README.md và `l3-write.md` từng khẳng định MCP Lark **chỉ đọc**. Thực tế catalog đầy đủ có ~50 tool task. Thiếu tool ghi là do **cờ `-t` khai thiếu**: preset task thay thế chứ không cộng dồn `preset.default`, và tên khai bằng dấu chấm trong khi gọi bằng gạch dưới. Hai bẫy này nay ghi rõ ở `connect.md` §4.
- `l3-write.md` viết lại: tạo ticket luôn là **hai lệnh** (`task_v2_task_create` / `task_v2_taskSubtask_create` rồi `task_v2_task_patch`), vì lệnh tạo không nhận `custom_fields` và `is_milestone`; nhắc bắt buộc truyền `tasklists[]` kẻo ticket rơi vào Default Group và mất custom field; nhắc `update_fields` kẻo field bị xoá trắng. Kèm bảng tool theo việc và chặn xoá ticket khi người chưa nêu rõ.
- Nhắc trong SKILL.md: tool đọc trả rỗng bất thường ⇒ nghi hết hạn login OAuth, không kết luận "không có việc".
- `connect.md` §4 §5 §7: cờ **`-d` (domain)** nay là mục bắt buộc cân nhắc, có trong cả snippet `mcp.json` lẫn lệnh login. Gói mặc định `open.feishu.cn` (bản Trung Quốc); app đăng ký ở `open.larksuite.com` mà quên `-d` thì OAuth đẩy sang trang đăng nhập bản kia và **không bao giờ login được**, dù app, scope và redirect URL đều đúng. Checklist §7 xếp nguyên nhân này lên đầu. Ghi thêm: lệnh login chỉ in URL chứ không tự mở trình duyệt, và chỉ chờ 60 giây.

## 1.1.0 · 2026-11-14

- Thêm `reference/lark-mapping.md` — ánh xạ luật work-breakdown sang mô hình Lark Task. Chốt bộ 9 loại việc (thêm `Sprint`, `Release`, `Support`), cây sub-task Milestone → Sprint → Release → Story/Task/Support/Bug → Sub-Task, `Epic` đứng riêng gom con bằng quan hệ chặn, trạng thái dùng section của tasklist, giờ công bằng custom field người tự điền.
- `lark-mapping.md` §3: bảng 15 section đã đánh số lại theo luồng thật (`01 Backlog` → `02 Request` → `03 Planning` → `04 Todo` → `05 Doing` → `06 Review` → `07 Ready Deploy` → `08 Verify TEST` → … → `13 Released`, cùng `0 Remove` và `Default Group` giữ nguyên), kèm ai giữ từng section, hai lối ra của `06 Review`, đường lỗi mọi `Verify *` về `04 Todo`, và §3.5 bảng đổi tên group trên Lark kèm thứ tự thao tác để không có hai group trùng số giữa chừng.
- `lark-mapping.md` §4: luật một ticket một owner — hai người cùng làm thì tách hai ticket.
- `lark-mapping.md` §2 và §3.2: một yêu cầu nghiệp vụ sinh **hai ticket riêng** — ticket phân tích của BA và ticket code của DEV — nối nhau bằng quan hệ chặn, khớp đòi hỏi của work-breakdown §5. Hai ticket đi chung đường tới `06 Review`, rẽ ở đó rồi gặp lại nhau ở `13 Released`: ticket BA đi thẳng `06 Review` → `13 Released` bỏ qua chuỗi deploy, ticket DEV qua `07 Ready Deploy` và chuỗi verify rồi mới tới `13 Released`.
- `lark-mapping.md` §3.4: **một cách đóng duy nhất** cho cả hai loại — chuyển về `13 Released`, tick Completed ở retro cuối sprint, không ngoại lệ cho ticket BA. Báo cáo cần phân biệt ticket ở `13 Released` mà `completed = false` là đã xong việc nhưng chưa chốt retro.
- SKILL.md: thêm một hàng bảng trỏ tới file ánh xạ khi phân vân loại việc / chỗ chứa / log giờ.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
