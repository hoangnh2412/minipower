# L2 — Preview (chưa ghi)

Gồm **hai phần**: một bảng hành động, và nội dung đầy đủ của mỗi thẻ sắp tạo. Người duyệt cả hai rồi mới sang L3.

## 1. Tìm trùng — bắt buộc, chặn trước

Bước này **không được bỏ** khi bảng có dòng `tạo`. Chưa chạy thì không trình bảng.

1. Rút **2 tới 3 từ khóa định danh** từ tiêu đề dự kiến: tên lá, tên module, tên file, tên nhãn.
2. Gọi tìm, **chỉ lấy tiêu đề**:

   ```
   list_issues    state: tất cả   fields: ["number", "title", "state"]
   search_issues  query: <từ khóa>   fields: ["number", "title", "state"]
   ```

   Repo còn ít thẻ thì `list_issues` đủ và rẻ hơn. **Không** truyền `body` vào `fields`, và **không** gọi `issue_read` ở bước này.
3. So khớp **trên tiêu đề**. Chỉ khi một tiêu đề nghi trùng thật thì mới mở thân đúng **một** thẻ đó để xác nhận.
4. **Không thấy tiêu đề nào gần giống** → đi tiếp mục 2.
5. **Thấy tiêu đề gần giống** → **dừng ngay**, chưa trình bảng. Báo người:

   ```
   Nghi trùng với #NN — <tiêu đề> (<mở|đã đóng, lý do>)
   Vì sao nghi: <một dòng>

   Anh chọn:
     a. Gộp vào #NN, không mở thẻ mới
     b. Bình luận bổ sung vào #NN
     c. Vẫn mở thẻ mới
   ```

6. **Người quyết, không tự chọn.** Chọn c thì ghi một dòng lý do vào thân thẻ mới, nói rõ khác #NN ở chỗ nào.

## 2. Đọc nhãn thật

Điền cột nhãn bằng tên **đã biết** trong phiên hoặc do người nói. **Không** liệt kê toàn bộ nhãn của repo. Chỉ khi không chắc một tên mới gọi `get_label` cho đúng tên đó. Không chắc và không xác minh được → bỏ trống, ghi ở cột ghi chú là **cần người xác nhận nhãn**, không tự tạo.

## 3. Bảng hành động

`hành động | tiêu đề | nhãn | trạng thái | map ID | ghi chú`

- `hành động`: tạo · sửa · bình luận · gắn nhãn · nối thẻ con · đóng
- `trạng thái`: mở, hoặc đóng kèm lý do `completed` / `not_planned` / `duplicate`

## 4. Nội dung đầy đủ — bắt buộc cho mọi dòng sẽ ghi chữ

Với **mỗi** dòng `tạo`, `sửa nội dung`, hoặc `bình luận`, in thêm một khối:

```
#1  <tiêu đề đúng như sẽ đăng>
    nhãn: <danh sách>

    <lời của người, nguyên văn, đúng như sẽ thành thân issue>
```

Ba luật của khối này:

- **Thân thẻ là lời của người.** Lấy đúng câu chữ người gửi, chỉ tách đoạn và sửa lỗi gõ rõ ràng. Nhận xét, phân tích, câu hỏi của AI **không** vào đây — chúng xuống bình luận sau khi thẻ đã tạo.
- **In nguyên văn, không tóm tắt, không cắt.** Người phải đọc đúng thứ sắp lên repo công khai. Trình một bản rút gọn rồi đăng bản dài là đăng thứ người chưa duyệt.
- **Ngắn thì hỏi người rút, đừng tự rút.** Lời người dài quá thì nêu ra và đề nghị bỏ đoạn nào, người quyết. Tự rút gọn là viết lại lời người.
- **Tiêu đề vừa phải nói được vấn đề, vừa phải tìm lại được.** Nó là thứ duy nhất bước tìm trùng đọc, nên phải mang danh từ định danh: tên lá skill, tên module, tên file, tên nhãn, tên lệnh. Khoảng 6 tới 12 từ, không mở đầu bằng động từ mơ hồ.

  | Kém | Khá |
  |---|---|
  | Cải thiện việc quản lý issue | `minipower-tasks-github`: tìm trùng chỉ đọc tiêu đề, không đọc thân |
  | Vấn đề với nhãn | Nhãn `cause:*` chưa dùng được vì thiếu mô tả trên GitHub |

  Người duyệt tiêu đề và nội dung như hai thứ tách bạch, sửa cái nào cũng được.

## 5. Soát trước khi trình

Áp cho mọi repo, không hỏi GitHub xem repo công khai hay không. Kiểm: không secret, không tên khách hàng, không tên người. Có thì thay bằng X, Y, A, B và **nói rõ đã thay chỗ nào**.

## 6. Người duyệt

Người bỏ tick dòng không muốn, sửa tiêu đề hoặc nội dung nếu cần. Sửa xong thì **trình lại khối đã sửa**, không ghi thẳng.

Một câu OK cho phần còn lại. Không ghi lẻ im lặng.

OK → [l3-write.md](l3-write.md). Không OK → dừng, không gọi tool ghi.
