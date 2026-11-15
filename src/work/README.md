# work — nghiệp vụ quản lý công việc

Tầng nghiệp vụ nằm **trên** lá kênh `tasks/`. Lá kênh biết gọi công cụ; module này biết quy trình của đội.

Không gắn vai — BA, dev, QA, PM đều dùng ([ADR-046](../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) C4).

## Bốn lá

| Lá | Một câu | Hướng |
|---|---|---|
| [minipower-work-profile](skills/minipower-work-profile/README.md) | Giữ cấu hình board khớp thực tế | ghi `memory/` |
| [minipower-work-desk](skills/minipower-work-desk/README.md) | Làm việc trên ticket không mở app | ghi board |
| [minipower-work-status](skills/minipower-work-status/README.md) | Trả lời "đang có chuyện gì" | chỉ đọc |
| [minipower-work-report](skills/minipower-work-report/README.md) | Soạn báo cáo có khuôn | chỉ đọc |

Chưa có cấu hình thì bắt đầu từ `work-profile`; ba lá kia đều cần nó.

## Ba lớp

```
tasks/              gọi công cụ — tên tool, phân trang, lỗi, kết nối
   ▲
work/               quy trình — luật phân rã việc, luồng trạng thái, khuôn báo cáo
   ▲
memory/tasks-config/   tri thức của đội — ngoài repo, mỗi doanh nghiệp một bản
```

Điều làm module này dùng lại được: **không một tên trường, tên trạng thái hay tên dự án nào nằm trong `src/work/`**. Tất cả đọc từ cấu hình. Đội khác đặt tên khác thì skill vẫn chạy nguyên, không sửa dòng nào.

Có một test canh điều đó — grep `src/work/` tìm tên cụ thể, phải ra rỗng (ADR-046 §8 T3).

## Cấu hình

Năm file ở `memory/tasks-config/` của workspace dự án:

```
profile.json    board nào · trường nào đóng vai gì · loại việc · cây phân cấp
status.json     các trạng thái · luồng đi · đường lỗi · khi nào đóng việc
projects.json   danh mục dự án
members.json    nhân sự và vai
scope.json      mặc định lọc gì khi người không nói rõ
```

Khuôn và ví dụ: [project-skeleton/memory/tasks-config/](../router/project-skeleton/memory/tasks-config/).

Đội chọn **khai đủ** thay vì đọc sống mỗi phiên (ADR-046 §4 O1) — ổn định hơn, đổi lại board đổi mà không ai báo thì cấu hình lệch âm thầm. Đổi gì trên board thì chạy `work-profile` → `sync`.

## Không thuộc module này

- Gọi MCP → lá kênh `tasks/`
- Gửi báo cáo vào nhóm chat → mặt `chat`
- Lưu báo cáo thành tài liệu → mặt `docs`
- Chia việc lớn, ước lượng, lập kế hoạch → [pm/](../pm/README.md)
- Chạy nền theo lịch → ngoài Minipower
