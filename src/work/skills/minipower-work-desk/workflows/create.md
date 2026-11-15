# Create — tạo ticket mới

## 1. Đọc cấu hình

`profile.json` (vai trò trường, `type_map`, `hierarchy`) · `status.json` (trạng thái đầu luồng) · `scope.json` (dự án mặc định). Thiếu file ⇒ dừng, chỉ sang `work-profile`.

## 2. Chốt loại việc

Người nói "task", "bug", "story" — tra qua `type_map` ra lựa chọn thật.

- Không có trong `type_map` ⇒ **dừng và hỏi**. Đội không dùng khái niệm đó, không được chọn loại gần giống.
- Người không nói loại ⇒ hỏi, đừng mặc định. Đoán sai loại thì mọi báo cáo sau đều lệch.

Tên việc chỉ có động từ (*"sửa lỗi login"*) ⇒ đề nghị đặt lại thành danh từ sản phẩm, trừ loại việc dành cho hoạt động. Luật WB-04.

## 3. Gom đủ thông tin — hỏi một lượt

| Cần | Lấy từ đâu |
|---|---|
| Tiêu đề | người nói |
| Loại việc | bước 2 |
| Dự án | `scope.projects` nếu có mặc định, không thì hỏi |
| Người phụ trách chính | người nói, hoặc chính người đang gõ |
| Cha | `hierarchy.parent_of` nói loại cha; hỏi ticket cha cụ thể |
| Hạn, ước lượng | người nói — thiếu thì để trống, **không tự đặt** |

Thiếu nhiều thứ ⇒ hỏi **trọn gói một lượt**, không nhỏ giọt.

## 4. Trình L2 — nói rõ là hai lệnh

```
hành động | tiêu đề | loại | cha | trạng thái | người phụ trách | ghi chú
tạo       | …       | …    | …   | (đầu luồng)| …              | 2 lệnh: tạo rồi gắn trường
```

Cột ghi chú phải nói thẳng *"tạo rồi gắn trường"* — để người hiểu nếu dừng giữa chừng thì ticket có tồn tại nhưng thiếu dữ liệu.

## 5. Ghi — qua lá kênh

Sau khi người OK:

1. **Lệnh tạo** — kèm chỗ chứa và trạng thái đầu luồng. Thiếu chỗ chứa thì ticket rơi vào nhóm mặc định và **mất hết trường tuỳ biến**.
2. **Lệnh sửa** — gắn loại việc, dự án, người phụ trách, ước lượng.
3. Có cha ⇒ nối theo `hierarchy.shape`: cây cha–con thì tạo như việc con; quan hệ chặn thì nối sau khi đã có mã ticket.

Lệnh 1 xong mà lệnh 2 hỏng ⇒ **nói rõ ticket đã tạo nhưng chưa đủ trường**, kèm mã để người sửa tay. Không im lặng, không tự xoá đi tạo lại.

## 6. Báo lại

Mã ticket · trạng thái đang nằm · những trường đã gắn · những trường còn trống.
