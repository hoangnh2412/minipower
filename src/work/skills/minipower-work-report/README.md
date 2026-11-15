# minipower-work-report

Soạn báo cáo có khuôn từ dữ liệu board, để gửi đi hoặc lưu lại.

## Ba bản

| Bản | Workflow | Trục | Cho ai đọc |
|---|---|---|---|
| Ngày | `daily` | việc cần hành động hôm nay | chính mình và đội |
| Tuần | `weekly` | mốc, nhiều dự án | người không ngồi trong board hằng ngày |
| Tháng | `monthly` | một người | người đó và quản lý |

## Một điều cần nói rõ về "định kỳ"

Lá này **không tự chạy theo lịch**. Minipower giữ *cách làm*, không phải nơi chạy nền — không có agent nào thức dậy lúc 7h sáng để soạn báo cáo.

Muốn chạy đúng nhịp thì nhịp đến từ bên ngoài: người mở phiên và gọi, hoặc một lịch bên ngoài gọi vào. Lá này lo phần *"soạn một bản báo cáo cho đúng"*, không lo phần *"ai bấm nút lúc mấy giờ"*.

## Khác gì `work-status`

| | `work-status` | `work-report` |
|---|---|---|
| Trả lời cho | người đang hỏi | người sẽ đọc sau |
| Hình thức | tóm tắt + bảng, ngay trong phiên | văn bản có khuôn, mang đi được |
| Nhấn vào | hiện trạng | **thay đổi so với kỳ trước** |

Hỏi nhanh thì dùng `work-status`. Cần thứ gửi đi được thì dùng lá này.

## Bốn luật giữ cho báo cáo dùng được

**Có mốc thời gian.** Mỗi bản ghi rõ đọc lúc nào, lọc theo gì. Thiếu mốc thì bản báo cáo vô dụng sau một ngày.

**Nêu thay đổi, không chỉ nêu trạng thái.** Không so được với kỳ trước thì nói thẳng là không so được.

**Không suy diễn nguyên nhân.** Nêu "việc này đứng yên 9 ngày", không nêu "X chậm".

**Mục rỗng thì ghi "không có".** Giữ tiêu đề để người đọc biết đã kiểm, chứ không phải quên.

## Phụ thuộc

Cần `memory/tasks-config/` — chưa có thì dựng bằng [minipower-work-profile](../minipower-work-profile/README.md).

## Prompt mẫu

```
làm báo cáo tiến độ hôm nay
tổng hợp tuần này theo mốc
báo cáo tháng trước của tôi
báo cáo tuần cho dự án A
```

## Không làm

- Gửi báo cáo vào nhóm chat → mặt `chat`
- Lưu thành tài liệu → mặt `docs`
- Thao tác ticket → [minipower-work-desk](../minipower-work-desk/README.md)
- Trả lời nhanh tại chỗ → [minipower-work-status](../minipower-work-status/README.md)
