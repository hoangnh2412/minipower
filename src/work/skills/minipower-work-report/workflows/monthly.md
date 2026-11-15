# Monthly — báo cáo tháng của một người

Bản tổng kết cá nhân: tháng qua người này đã làm gì. Khác hai bản kia ở chỗ **trục là người, không phải dự án hay mốc**.

## 1. Ai và kỳ nào

Mặc định `scope.me`. Người nêu tên khác ⇒ tra `members.json`.

Kỳ mặc định là tháng dương lịch vừa kết thúc. Người nêu khoảng khác ⇒ theo họ.

## 2. Lấy cả hai vai

Như `work-status/personal.md`: **việc đang cầm** (người được giao) và **việc chịu trách nhiệm** (người phụ trách chính) là hai tập khác nhau. Báo cáo tháng lấy **việc chịu trách nhiệm** làm chính — đó mới là phần việc thuộc về người này.

## 3. Khuôn

```markdown
# Báo cáo tháng {tháng} — {tên}

**Tóm tắt.** {3–5 câu: tháng này làm xong gì đáng kể, đang dở gì, có gì vướng}

## Đã hoàn thành
{bảng: ticket · tiêu đề · dự án · loại việc · ngày đóng}
Tổng: {n} việc, trải trên {n} dự án

## Đang dở sang tháng sau
{bảng: ticket · tiêu đề · đang ở bước nào · bao lâu rồi}

## Quá hạn chưa xử lý
{bảng — rỗng thì ghi "không có"}

## Phân bố theo loại việc
{đếm theo type_map: bao nhiêu story, bao nhiêu bug, bao nhiêu hỗ trợ…}

---
Kỳ {từ} – {đến} · đọc lúc {…}
```

## 4. Luật riêng của bản tháng

- **Đếm theo ngày đóng, không theo ngày tạo.** Việc tạo tháng trước xong tháng này vẫn tính vào tháng này.
- **Phân bố theo loại việc là phần có ích nhất** — nó cho thấy tháng qua người này chủ yếu làm sản phẩm hay chủ yếu chữa cháy. Nêu số, đừng bình luận.
- **Không chấm điểm, không so sánh người.** Báo cáo mô tả việc, không đánh giá người. Muốn so thì người đọc tự so.
- **Giờ công chỉ nêu khi cấu hình có khai trường tương ứng**, và nêu kèm cảnh báo rằng số đó do người tự điền, không có cộng dồn tự động.
