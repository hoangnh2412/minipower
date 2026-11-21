# minipower-work-report

Soạn báo cáo ngắn từ dữ liệu board, để gửi đi hoặc lưu lại.

## Ba bản

Cùng một khuôn. Khác ở kỳ.

| Bản | Workflow | Kỳ | Phạm vi |
|---|---|---|---|
| Ngày | `daily` | ngày đọc | `scope`, hoặc dự án người nêu |
| Tuần | `weekly` | 7 ngày tới lúc đọc | dự án đang hoạt động |
| Tháng | `monthly` | tháng dương lịch vừa kết thúc | một người |

Ba mục, đúng thứ tự đọc `milestone` → `release` → `story` → `bug` → `support`:

1. Milestone, rồi Release, nào sắp đến hạn — và việc phát sinh gắn với nó trong kỳ.
2. Story, Bug, Support cập nhật trong kỳ — tóm tắt từ 10 comment mới nhất: đang trao đổi gì, có vấn đề thì đã thống nhất và xác nhận chưa.
3. Ticket chậm deadline trong năm loại — trường vai trò `note` đã có lý do chưa.

Mỗi ticket có đủ Dự án, PIC, Assign, StartDate, EndDate, Loại.

## Một điều cần nói rõ về "định kỳ"

Lá này **không tự chạy theo lịch**. Minipower giữ *cách làm*, không phải nơi chạy nền — không có agent nào thức dậy lúc 7h sáng để soạn báo cáo.

Muốn chạy đúng nhịp thì nhịp đến từ bên ngoài: người mở phiên và gọi, hoặc một lịch bên ngoài gọi vào. Lá này lo phần *"soạn một bản báo cáo cho đúng"*, không lo phần *"ai bấm nút lúc mấy giờ"*.

## Khác gì `work-status`

| | `work-status` | `work-report` |
|---|---|---|
| Trả lời cho | người đang hỏi | người sẽ đọc sau |
| Hình thức | tóm tắt + bảng, ngay trong phiên | văn bản có khuôn, mang đi được |
| Nhấn vào | hiện trạng | ba câu: sắp hạn, cập nhật trong kỳ, chậm deadline |

Hỏi nhanh thì dùng `work-status`. Cần thứ gửi đi được thì dùng lá này.

## Luật giữ cho báo cáo dùng được

**Có mốc thời gian.** Mỗi bản ghi rõ đọc lúc nào, lọc theo gì, kỳ nào.

**Đủ sáu mục trên mỗi ticket.** Thiếu giá trị thì ghi `thiếu`, không điền hộ.

**Không đếm, không nhận xét.** Không số lượng ticket, không phân bố trạng thái, không câu đánh giá.

**Comment chỉ lấy 10 cái mới nhất** của Story, Bug, Support có cập nhật trong kỳ. Raise vấn đề là ticket Support tiêu đề `[Vấn đề]`. Kết quả thống nhất là comment `[Kết luận]` trên ticket đó. Chi tiết nằm trong thread. Người đang hỏi là quản lý thì ghi lời nhắc lên ticket; là thành viên thì nhắc chính người đó trong bản.

**Mục rỗng thì ghi "không có".** Giữ tiêu đề để người đọc biết đã kiểm.

## Phụ thuộc

Cần `memory/tasks-config/` — chưa có thì dựng bằng [minipower-work-profile](../minipower-work-profile/README.md).

Đọc comment qua [minipower-tasks-lark](../../../tasks/skills/minipower-tasks-lark/README.md). Catalog thiếu tool list comment thì bản ghi rõ không đọc được comment.

## Prompt mẫu

```
làm báo cáo tiến độ hôm nay
báo cáo tuần
báo cáo tháng trước của tôi
báo cáo ngày cho dự án A
```

## Không làm

- Gửi báo cáo vào nhóm chat → mặt `chat`
- Lưu thành tài liệu → mặt `docs`
- Thao tác ticket → [minipower-work-desk](../minipower-work-desk/README.md)
- Trả lời nhanh tại chỗ → [minipower-work-status](../minipower-work-status/README.md)
