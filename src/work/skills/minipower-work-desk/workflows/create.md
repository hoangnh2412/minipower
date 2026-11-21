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
| Loại việc | bước 2 — bắt buộc, không mặc định |
| Dự án | bắt buộc. `scope.projects` chỉ một mặc định thì nêu để người xác nhận; không thì hỏi |
| Assign | bắt buộc — người đang làm (`assignee`) |
| PIC | bắt buộc — người phụ trách chính (`owner`). Không mặc định thành người đang gõ |
| Start Date, Due Date | bắt buộc — timeline thực hiện. Không để trống, **không tự đặt** |
| Cha | `hierarchy.parent_of` nói loại cha; hỏi ticket cha cụ thể |
| Ước lượng | người nói — thiếu thì để trống, **không tự đặt** |

Assign và PIC có thể trùng một người khi người nói vậy. Thiếu một trong hai thì vẫn hỏi.

Chưa có deadline thực hiện: không bịa ngày khác. Gán đúng ngày người đưa vào Start Date và Due Date. Khi ghi qua Lark, comment đúng câu `Ngày … là mốc phản hồi deadline thực hiện`, và trình thêm subtask `Due thực tế` — [tasks-lark › l3-write](../../../tasks/skills/minipower-tasks-lark/workflows/l3-write.md) § Subtask.

Thiếu nhiều thứ ⇒ hỏi **trọn gói một lượt**, không nhỏ giọt. Còn thiếu mục bắt buộc ⇒ không trình L2.

## 4. Trình L2 — nói rõ là hai lệnh

```
hành động | tiêu đề       | loại | dự án | assign | PIC | start | due | loại deadline                  | cha        | trạng thái | ghi chú
tạo       | …             | …    | …     | …      | …   | …     | …   | …                              | …          | (đầu luồng)| 2 lệnh: tạo rồi gắn trường
tạo       | Due thực tế   | …    | …     | …      | …   | …     | …   | deadline thực hiện             | (dòng trên)| (đầu luồng)| chỉ khi cha chưa có deadline thực hiện
```

Cột ghi chú phải nói thẳng *"tạo rồi gắn trường"* — để người hiểu nếu dừng giữa chừng thì ticket có tồn tại nhưng thiếu dữ liệu.

## 5. Ghi — qua lá kênh

Sau khi người OK:

1. **Lệnh tạo** — kèm chỗ chứa, trạng thái đầu luồng, Start Date, Due Date, Assign. Thiếu chỗ chứa thì ticket rơi vào nhóm mặc định và **mất hết trường tuỳ biến**.
2. **Lệnh sửa** — gắn loại việc, dự án, PIC, ước lượng nếu có.
3. **Comment** — ghi loại deadline (lá kênh).
4. Chưa có deadline thực hiện và dòng subtask còn tick ⇒ tạo subtask `Due thực tế` dưới ticket vừa tạo.
5. Có cha ⇒ nối theo `hierarchy.shape`: cây cha–con thì tạo như việc con; quan hệ chặn thì nối sau khi đã có mã ticket.

Lệnh 1 xong mà lệnh 2 hỏng ⇒ **nói rõ ticket đã tạo nhưng chưa đủ trường**, kèm mã để người sửa tay. Không im lặng, không tự xoá đi tạo lại.

## 6. Báo lại

Mã ticket · trạng thái đang nằm · những trường đã gắn · những trường còn trống.
