# Lark Task — mô hình dữ liệu và giới hạn công cụ

Sự thật về **công cụ Lark**, đúng với mọi doanh nghiệp. Không chứa quy ước của bất kỳ đội nào — quy ước nằm ở `memory/tasks-config/` của workspace dự án (ADR-046 QĐ-1).

Không load mặc định — mở khi cần biết Lark làm được gì và không làm được gì.

## 1. Mô hình

| Cơ chế | Là gì |
|---|---|
| `tasklist` → `section` → `task` → `subtask` | Chỗ chứa. Subtask **là một task đầy đủ** (API ghi rõ *"giống hệt tạo task, chỉ thêm guid cha"*), nên lồng sâu được nhiều tầng |
| `custom_fields` trên **tasklist** — số · ngày · người · chọn-một · chọn-nhiều · văn bản | Lark **không có** khái niệm type, priority, estimate. Mọi thứ đó đều phải dựng bằng custom field |
| `is_milestone` (boolean trên task) | Cờ mốc — native, độc lập với custom field |
| `tasklists[]` | Một task thuộc **nhiều** tasklist, mỗi tasklist một section |
| `completed_at` | Xong / chưa xong. **Chỉ hai trạng thái** — không có chuỗi nhiều bước |
| `members[{id, type, role}]` | `role` là `assignee` hoặc `follower`. Đây là *người được giao*, khác với custom field kiểu người |
| `due{timestamp, is_all_day}` · `start` | Hạn và ngày bắt đầu |
| `addDependencies` / `removeDependencies` | Quan hệ chặn — **chỉ một kiểu**, không phân biệt FS/SS |
| `comment` | Ghi chú trên task |

## 2. Bảy giới hạn phải biết trước khi thiết kế

1. **Lệnh tạo không nhận `custom_fields` và `is_milestone`.** `task.create` và `taskSubtask.create` đều vậy. Phải `task.patch` lần hai. ⇒ **Mọi thao tác tạo là hai lệnh.**
2. **Custom field gắn theo từng tasklist.** Task phải nằm trong tasklist có khai field thì mới set được giá trị ⇒ lệnh tạo **luôn phải truyền `tasklists[]`**, nếu không task rơi vào section mặc định và mất field.
3. **`update_fields` là bắt buộc khi patch.** Field có tên trong `update_fields` mà không có giá trị mới sẽ **bị xoá trắng**. Field không có tên trong đó thì giữ nguyên.
4. **Không có spent time, không có time entry.** Muốn theo dõi giờ công thì phải tự dựng bằng custom field số, và **không có rollup** từ con lên cha.
5. **Không có status nhiều bước.** Chỉ `completed_at`. Chuỗi trạng thái phải dựng bằng `section` hoặc custom field chọn-một.
6. **Không có project, không có version/release.** Phải dựng bằng custom field hoặc bằng tasklist riêng.
7. **Section mặc định có tên rỗng** và `is_default: true`. Task không chỉ định section sẽ rơi vào đây.

## 3. Hai trục độc lập dễ nhầm

`section` và `completed_at` **không liên quan nhau**. Một task có thể nằm ở section cuối cùng mà `completed = false`, hoặc `completed = true` khi còn ở section giữa chừng. Lark không ràng buộc gì.

⇒ Đọc tiến độ phải dùng **cả hai**, và quy ước nối chúng lại nằm ở cấu hình, không phải ở Lark.

## 4. Xác thực — hai loại token

| Token | Thấy gì | Khi hết hạn |
|---|---|---|
| **tenant** (app) | Chỉ tài nguyên cấp tổ chức | Tự gia hạn |
| **user** (OAuth) | Tasklist và task cá nhân | **Trả danh sách rỗng, không báo lỗi** |

Đây là cái bẫy nguy hiểm nhất khi đọc: `useUAT: false` gặp tài nguyên cá nhân sẽ trả `items: []` im lặng — rất dễ đọc nhầm thành "không có việc nào". Ép `useUAT: true` thì Lark mới chịu nói `user_access_token is invalid or expired`.

Cách cài và xử lý token: [workflows/connect.md](../workflows/connect.md).

## 5. Tên tool

Catalog runtime là SSOT — soát `GetDynamicTools` đầu phiên, đừng tin bảng chép tay.

Tên khai trong cờ `-t` dùng **dấu chấm** (`task.v2.task.create`); tên gọi từ client dùng **gạch dưới** (`task_v2_task_create`). Gói có khoảng 50 tool cho mặt task.
