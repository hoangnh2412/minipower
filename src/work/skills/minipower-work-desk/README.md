# minipower-work-desk

Bàn làm việc. Làm trọn vòng đời một ticket từ chỗ đang ngồi, không phải mở app.

## Năm việc

| Nói thế này | Workflow |
|---|---|
| "tạo task cho màn hình đăng nhập" | `create` |
| "dời hạn sang thứ sáu", "giao cho X" | `update` |
| "chuyển sang review", "test fail rồi" | `move` |
| "ghi chú là đang chờ bên đối tác" | `comment` |
| "xong rồi", "đóng hết ticket sprint này" | `close` |

## Bốn luật hay chạm phải

**Tạo ticket là hai lệnh.** Công cụ không cho gắn trường tuỳ biến ngay lúc tạo, phải tạo rồi sửa. Nếu hỏng giữa chừng, skill sẽ nói rõ ticket đã có nhưng thiếu trường — không im lặng.

**Lùi bước phải nêu lý do.** Review không đạt, test fail — thiếu lý do thì skill **từ chối ghi**. Đây là luật cứng, không phải lời nhắc.

**Trả việc về người phụ trách chính.** Người đang làm đổi theo từng bước; người phụ trách chính thì không. Fail thì việc quay về họ, nhánh suy từ vai trong cấu hình.

**Đóng việc chỉ ở bước cuối.** Muốn đóng ở giữa luồng thì skill sẽ cho biết đang bỏ qua mấy bước rồi mới hỏi.

## Phụ thuộc

Cần `memory/tasks-config/` — chưa có thì dựng bằng [minipower-work-profile](../minipower-work-profile/README.md).

Tên trường, tên trạng thái, loại việc đều đọc từ cấu hình. Skill này **không biết** board của anh gọi chúng là gì, và đó là cố ý: đội khác dùng tên khác thì vẫn chạy nguyên.

## Prompt mẫu

```
tạo task "API lấy danh sách hoá đơn" cho dự án A, giao cho tôi
ticket ABC chuyển sang review
ticket ABC test fail, lỗi phân trang khi quá 100 bản ghi
dời hạn ticket ABC sang 20/11
đóng hết ticket đang ở bước cuối
```

## Không làm

- Xem tình hình, đếm việc → [minipower-work-status](../minipower-work-status/README.md)
- Báo cáo định kỳ → [minipower-work-report](../minipower-work-report/README.md)
- Sửa cấu hình → [minipower-work-profile](../minipower-work-profile/README.md)
- Chia việc lớn thành Epic/Story → [minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md)
- Xoá ticket → không hỗ trợ; xoá không khôi phục được qua API, người tự làm trên app
