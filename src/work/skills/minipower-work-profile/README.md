# minipower-work-profile

Giữ cho cấu hình board của đội khớp với thực tế. Đây là lá **duy nhất** được ghi vào `memory/tasks-config/`.

## Ba việc

| Lệnh đời thường | Workflow | Làm gì |
|---|---|---|
| "dựng cấu hình cho board của đội" | `init` | Đọc board, hỏi phần board không biết, ghi 5 file |
| "board đổi rồi, cập nhật đi" | `sync` | So cấu hình với board, trình bảng lệch, ghi phần được duyệt |
| "thêm X vào đội DEV" | `edit` | Sửa file theo lời, kiểm liên kết trước khi ghi |

## Năm file nó quản

```
memory/tasks-config/
  profile.json    board nào · trường nào đóng vai gì · loại việc · cây phân cấp
  status.json     các trạng thái · luồng đi · đường lỗi · khi nào đóng việc
  projects.json   danh mục dự án
  members.json    nhân sự và vai
  scope.json      mặc định lọc gì khi người không nói rõ
```

Khuôn và ví dụ: [project-skeleton/memory/tasks-config/](../../../router/project-skeleton/memory/tasks-config/).

## Hai điều hay bị hiểu nhầm

**Cấu hình không tự cập nhật.** Đội chọn khai đủ thay vì đọc sống mỗi phiên (ADR-046 §4 O1), nên board đổi mà không ai báo thì cấu hình lệch âm thầm. Đổi gì trên board thì chạy `sync`.

**`key` không bao giờ đổi.** Mỗi dự án, mỗi trạng thái có một `key` ổn định và một `name` là chuỗi thật trên board. Đổi tên trên board ⇒ chỉ `name` đổi. Báo cáo cũ và câu lệnh đã lưu bám vào `key`.

## Prompt mẫu

```
dựng cấu hình board cho đội mình
board vừa thêm dự án mPay, cập nhật giúp
thêm X vào đội dev
từ nay Verify PROD fail thì về thẳng Doing chứ không về Todo
cấu hình hiện đang khai những gì
```

## Không làm

- Tạo, sửa, xoá ticket → [minipower-work-desk](../minipower-work-desk/SKILL.md)
- Xem tình hình → [minipower-work-status](../minipower-work-status/SKILL.md)
- Gọi MCP thẳng → qua lá kênh `tasks/`
- Sửa trên board (tạo trường, tạo nhóm) → người tự làm; lá này chỉ ghi lại thực tế
