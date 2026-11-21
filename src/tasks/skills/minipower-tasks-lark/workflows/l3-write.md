# L3 — Ghi Lark (sau OK)

1. Chỉ dòng còn tick trên bảng L2.
2. **Soát catalog trước khi gọi.** Thiếu `task_v2_task_create` / `task_v2_task_patch` ⇒ cờ `-t` khai thiếu, **không** kết luận "Lark không ghi được" → [connect.md](connect.md) §4.
3. Lỗi 4xx → báo nguyên văn, **không** retry vô hạn cùng payload.
4. Dòng **tạo** (và mọi lần ghi `start` / `due`) phải qua § Trường bắt buộc bên dưới. Thiếu một mục ⇒ dừng, không gọi MCP ghi.

## Trường bắt buộc khi tạo ticket

Hỏi phần thiếu **một lượt**. Không tự điền. Không ghi khi còn trống.

Tên trường thật đọc từ `memory/tasks-config/` (`field_roles`, `type_map`). Không có cấu hình ⇒ dừng, không đoán tên trên board.

| Bắt buộc | Trên Lark | Tên thật |
|---|---|---|
| Dự án | custom field vai trò `project` | `field_roles.project` |
| Loại ticket | custom field vai trò `type` | `field_roles.type` + `type_map` |
| Assign | `members[].role = assignee` | native — người đang làm |
| PIC | custom field vai trò `owner` | `field_roles.owner` |
| Start Date | `start` | native |
| Due Date | `due` | native |

Assign và PIC là hai chỗ khác nhau. Có thể là cùng một người **khi người nói vậy**; không được bỏ một trong hai, không gộp thành một trường.

### Start Date và Due Date

Hai trường này là **timeline thực hiện**. Cả hai bắt buộc.

- **Đã có deadline thực hiện** — `start` và `due` chính là timeline đó.
- **Chưa có deadline thực hiện** — không bịa timeline thực hiện. Lấy đúng ngày người đưa và gán vào cả `start` và `due`. Không tách thành hai mốc, không đổi sang ngày khác.

### Comment — ghi loại deadline

Ngay sau khi tạo (và mỗi lần sửa `start` / `due`), gọi `task_v2_comment_create`. Một ý một dòng.

Đã có deadline thực hiện:

```
1. Loại deadline: deadline thực hiện
1.1 Start: YYYY-MM-DD
1.2 Due: YYYY-MM-DD
```

Chưa có deadline thực hiện — comment đúng câu này, điền ngày người đã đưa:

```
1. Ngày YYYY-MM-DD là mốc phản hồi deadline thực hiện
```

### Subtask khi chưa có deadline thực hiện

Theo [WB-08](../../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md). Tạo **một subtask** `Due thực tế` dưới ticket cha. Sản phẩm của subtask là ngày thực hiện được ghi lên cha.

L2 có thêm một dòng. Người bỏ tick thì không tạo.

| Mục | Giá trị |
|---|---|
| Tiêu đề | `Due thực tế` |
| Cha | ticket vừa nói ở trên |
| Dự án, loại, Assign, PIC | cùng ticket cha, trừ khi người chỉ người khác |
| Start Date, Due Date | đúng ngày mốc phản hồi người đã đưa |
| Loại deadline | `deadline thực hiện` — đây là hạn của việc chốt ngày, không phải hạn thực hiện của ticket cha |
| Mô tả | Chốt Start/Due thực hiện của ticket cha, rồi ghi hai ngày đó lên cha và comment `deadline thực hiện` |

Ghi bằng `task_v2_taskSubtask_create` (guid cha), rồi patch và comment như mọi ticket tạo. `hierarchy` của đội không chặn dòng này. Cha tạo xong mà subtask lỗi ⇒ nói rõ cha đã có, subtask chưa có, kèm mã cha. Không tự xoá cha.

## Tạo một ticket — tạo, gắn trường, rồi comment

`task_v2_task_create` và `task_v2_taskSubtask_create` **không nhận** `custom_fields` và `is_milestone`. Phải patch lần hai, rồi comment loại deadline:

| Bước | Tool | Truyền gì |
|---|---|---|
| 1 | `task_v2_task_create` *(gốc)* hoặc `task_v2_taskSubtask_create` *(có cha)* | `summary` · `description` · `start` · `due` · `members` (Assign, `role = assignee`) · **`tasklists[{tasklist_guid, section_guid}]`** |
| 2 | `task_v2_task_patch` | `custom_fields`: Dự án (`project`), Loại ticket (`type`), PIC (`owner`), ước lượng nếu có · `is_milestone` nếu là mốc · kèm `update_fields` liệt đúng field đang set |
| 3 | `task_v2_comment_create` | loại deadline, khuôn ở § Comment |

Bỏ `tasklists[]` ở bước 1 ⇒ ticket rơi vào **Default Group** và **không nhận được custom field**, vì field gắn theo tasklist. Bỏ `update_fields` ở bước 2 ⇒ field không nêu tên bị **xoá trắng**.

## Tool theo việc

| Việc | Tool |
|---|---|
| Tạo ticket gốc | `task_v2_task_create` |
| Tạo ticket con | `task_v2_taskSubtask_create` (truyền guid cha) |
| Sửa nội dung, gắn `Loại`, bật `is_milestone` | `task_v2_task_patch` |
| Chuyển trạng thái | `task_v2_task_addTasklist` với `section_guid` đích |
| Nối Epic với con, đánh dấu chặn | `task_v2_task_addDependencies` |
| Đóng việc | `task_v2_task_patch` → `completed_at` |
| Ghi chú tiến độ | `task_v2_comment_create` |
| Nhắc nguyên tắc chat, khi `work-report` thấy 10 comment cuối lệch | `task_v2_comment_create`, không truyền reply. Nội dung do lá báo cáo chốt, không sửa chữ |

Loại việc, chỗ chứa, section đích: [reference/lark-mapping.md](../reference/lark-mapping.md). **Không** tự đoán tên section — đối chiếu `task_v2_section_list` thật, lệch thì dừng.

## Sau khi ghi

5. In `task_guid` từng dòng. Tạo nhiều ticket ⇒ in bảng `tiêu đề | task_guid | section | loại deadline`.
6. Back-ref `memory/memory.md` **chỉ khi** người yêu cầu, một dòng.
7. Không gửi tin (`im_v1_*`) — đó là `minipower-chat-lark`.
8. Không gọi `task_v2_task_delete` / `task_v2_tasklist_delete` trừ khi người nêu rõ ticket nào; xoá trên Lark không khôi phục được qua API.
