# Daily — báo cáo ngày

Bản ngắn cho ngày đọc. Khuôn và luật: [SKILL.md](../SKILL.md).

## 1. Kỳ

Ngày dương lịch của lúc đọc. Cập nhật trong kỳ = `updated_at` trong ngày đó. Việc phát sinh = ticket tạo trong ngày đó.

Người nêu một ngày khác ⇒ lấy ngày đó.

## 2. Phạm vi

Theo `scope`. Người nêu dự án ⇒ theo họ. Loại trừ `exclude_stages` khỏi danh sách đọc. Việc loại trừ không thành một mục trong bản.

## 3. Cửa sổ sắp đến hạn

Từ lúc đọc đến hết ngày hôm sau, trừ khi người nêu cửa sổ khác.

## 4. Đọc

Theo thứ tự `milestone` → `release` → `story` → `bug` → `support`.

Với từng Story, Bug, Support cập nhật trong ngày: lá kênh lấy 10 comment mới nhất, rồi tóm tắt theo luật ở SKILL.
