# Move — chuyển trạng thái

Workflow nhiều luật nhất, vì đây là chỗ quy trình của đội được thi hành.

## 1. Xác định ticket và vị trí hiện tại

Đọc ticket qua lá kênh. Lấy: trạng thái đang nằm, loại việc, người phụ trách chính, người được giao.

Không tìm ra ticket ⇒ hỏi, không đoán theo tên gần giống.

## 2. Xác định đích

Người nói "sang review", "deploy xong", "fail rồi" — ánh xạ sang trạng thái qua `status.stages`.

| Người nói | Đích |
|---|---|
| Bước kế tiếp, "xong rồi" | trạng thái sau trong `status.flows` của nhánh ticket |
| "fail", "không đạt", "trả lại" | `status.on_fail.to` |
| "huỷ", "không làm nữa" | `status.on_cancel.to` |
| Tên một trạng thái cụ thể | chính nó — kiểm ở bước 3 |

Nhánh của ticket suy từ **vai của người phụ trách chính** trong `members.json` → `branch_of`. Không khai vai ⇒ hỏi người lần này, và nhắc họ bổ sung cấu hình.

## 3. Kiểm ba luật trước khi trình

**Nhảy cóc.** Đích không phải bước liền sau trong `flows` ⇒ nêu rõ **đang bỏ qua những bước nào**, hỏi xác nhận. Người đồng ý thì làm, nhưng phải hỏi.

**Lùi bước cần lý do.** Đích nằm trước vị trí hiện tại trong `flows`, hoặc đi theo `on_fail` ⇒ `require_comment` bật thì **bắt buộc có lý do**. Người chưa nói ⇒ hỏi. Không có lý do thì **từ chối ghi** — đây là luật cứng.

**Đóng việc đúng chỗ.** Đích là `done_when` ⇒ sang [close.md](close.md), vì còn một thao tác nữa ngoài chuyển trạng thái.

## 4. Đổi người được giao

Người phụ trách chính **không đổi**. Người được giao thì đổi theo bước:

| Tình huống | Người được giao mới |
|---|---|
| Vào bước do lead giữ (`stages[].holder`) | lead của nhánh, từ `members.leads` |
| Đi theo `on_fail` | **người phụ trách chính** (`on_fail.reassign_to`) |
| Bước khác | giữ nguyên, trừ khi người nói rõ |

## 5. Trình L2

```
hành động        | ticket | từ → đến | người được giao | lý do
chuyển trạng thái| …      | … → …    | … → …           | (bắt buộc khi lùi)
```

Có bước bị chặn ⇒ hiện luôn trong bảng, ghi rõ **chặn vì luật nào**, đừng lẳng lặng bỏ dòng.

## 6. Ghi

Qua lá kênh: đổi trạng thái, đổi người được giao, và ghi bình luận lý do nếu có. Lý do **ghi vào bình luận**, không nhét vào mô tả — mô tả là yêu cầu, bình luận là diễn biến.

## 7. Báo lại

Mã ticket · trạng thái mới · người được giao mới · đã ghi lý do hay chưa.
