# L3 — Ghi Lark (sau OK)

1. Chỉ dòng còn tick trên bảng L2.
2. **Soát catalog trước khi gọi.** Thiếu `task_v2_task_create` / `task_v2_task_patch` ⇒ cờ `-t` khai thiếu, **không** kết luận "Lark không ghi được" → [connect.md](connect.md) §4.
3. Lỗi 4xx → báo nguyên văn, **không** retry vô hạn cùng payload.

## Tạo một ticket — luôn là hai lệnh

`task_v2_task_create` và `task_v2_taskSubtask_create` **không nhận** `custom_fields` và `is_milestone`. Phải patch lần hai:

| Bước | Tool | Truyền gì |
|---|---|---|
| 1 | `task_v2_task_create` *(gốc)* hoặc `task_v2_taskSubtask_create` *(có cha)* | `summary` · `description` · `due` · `start` · `members` · **`tasklists[{tasklist_guid, section_guid}]`** |
| 2 | `task_v2_task_patch` | `custom_fields` (`Loại`, `Ước lượng`) · `is_milestone` nếu là mốc · kèm `update_fields` liệt đúng field đang set |

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

Loại việc, chỗ chứa, section đích: [reference/lark-mapping.md](../reference/lark-mapping.md). **Không** tự đoán tên section — đối chiếu `task_v2_section_list` thật, lệch thì dừng.

## Sau khi ghi

4. In `task_guid` từng dòng. Tạo nhiều ticket ⇒ in bảng `tiêu đề | task_guid | section`.
5. Back-ref `memory/memory.md` **chỉ khi** người yêu cầu, một dòng.
6. Không gửi tin (`im_v1_*`) — đó là `minipower-chat-lark`.
7. Không gọi `task_v2_task_delete` / `task_v2_tasklist_delete` trừ khi người nêu rõ ticket nào; xoá trên Lark không khôi phục được qua API.
