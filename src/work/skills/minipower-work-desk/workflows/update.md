# Update — sửa nội dung ticket

Sửa thông tin, **không** sửa trạng thái — chuyển trạng thái đi [move.md](move.md).

## 1. Sửa được gì

| Người nói | Chạm |
|---|---|
| "đổi tên", "sửa mô tả" | tiêu đề, mô tả |
| "dời hạn", "bắt đầu từ…" | hạn, ngày bắt đầu |
| "ước lượng…" | trường ước lượng theo `field_roles` |
| "đổi dự án" | trường dự án |
| "giao cho…" | người được giao |
| "đổi người phụ trách" | trường người phụ trách — **hỏi lại một lần**, xem §3 |
| "đổi loại việc" | trường loại — **hỏi lại một lần**, xem §3 |
| "ưu tiên…" | trường ưu tiên |

Trường người đang nói không có trong `field_roles` ⇒ **dừng**, nói rõ đội chưa khai trường đó, không chọn trường gần giống.

## 2. Luật khi sửa

**Mọi lệnh sửa phải liệt kê đúng những trường đang đổi.** Trường có tên trong danh sách mà không có giá trị mới sẽ **bị xoá trắng** — đây là cách công cụ hoạt động, không phải lỗi. Nên chỉ liệt kê trường thật sự đổi.

**Không tự suy giá trị.** Người nói "ước lượng 3 ngày" mà trường là kiểu ngày tháng chứ không phải số ⇒ hỏi ngày bắt đầu và ngày kết thúc, đừng tự quy đổi.

**Giá trị phải có thật.** Dự án không có trong `projects.json`, người không có trong `members.json` ⇒ dừng và hỏi.

## 3. Hai thứ hỏi lại trước khi đổi

**Người phụ trách chính** là hằng số của ticket — luật trả việc khi không đạt bám vào nó. Đổi là đổi cả cách ticket được định tuyến về sau. Hỏi: *"đổi người phụ trách hay chỉ đổi người đang làm bước này?"*

**Loại việc** quyết định cây phân cấp và cách ticket vào báo cáo. Đổi loại khi ticket đã có cha hoặc đã có con ⇒ nêu rõ quan hệ hiện tại có thể không còn hợp lệ theo `hierarchy`.

## 4. Trình và ghi

```
hành động | ticket | trường | cũ | mới
sửa       | …      | …      | …  | …
```

Người OK rồi ghi qua lá kênh, một lệnh cho mỗi ticket. Báo lại mã ticket và những trường đã đổi.
