# Monthly — báo cáo tháng của một người

Cùng khuôn [SKILL.md](../SKILL.md). Khác hai bản kia ở chỗ **lọc một người** trước, rồi mới xét ba mục.

## 1. Ai và kỳ nào

Mặc định `scope.me`. Người nêu tên khác ⇒ tra `members.json`. Không khớp ⇒ hỏi, không ghép người gần giống.

Kỳ mặc định: tháng dương lịch vừa kết thúc. Người nêu tháng khác ⇒ theo họ.

Lấy ticket người này là PIC (`field_roles.owner`) hoặc Assign (`members` role assignee). Một ticket đủ một trong hai vai thì đưa vào bản nếu nó thuộc một trong ba mục.

## 2. Cửa sổ sắp đến hạn

Từ lúc đọc đến hết tháng hiện tại — tháng của lúc đọc, không phải tháng của kỳ. Người nêu cửa sổ khác ⇒ theo họ.

Kỳ chỉ lọc cập nhật và việc phát sinh. Câu "sắp đến hạn" luôn tính từ lúc đọc.

## 3. Đọc

Cùng thứ tự `milestone` → `release` → `story` → `bug` → `support`, trong tập ticket của người đó.

Cập nhật trong kỳ = `updated_at` trong tháng. Việc phát sinh = ticket tạo trong tháng, gắn với mốc hoặc đợt sắp đến hạn, và người này là PIC hoặc Assign của việc phát sinh.
