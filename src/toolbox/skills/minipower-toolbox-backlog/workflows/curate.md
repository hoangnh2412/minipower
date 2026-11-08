# Curate — chỉnh một thẻ đã có

Dùng khi thẻ đã tồn tại và cần tóm tắt trao đổi, chốt yêu cầu, đổi nhãn, nối thẻ con, hoặc đóng.

**Luật nền:** thân thẻ là lời của người, không ai viết đè. Bình luận là chỗ duy nhất AI được viết.

## 1. Đọc thẻ trước, và chỉ thẻ đó

Nhờ lá GitHub lấy thân thẻ cùng **toàn bộ bình luận** hiện có. Đây là lần đọc cần thiết, nhưng chỉ cho đúng thẻ đang làm — không mở thẻ khác, không liệt kê backlog.

**Không** đề xuất bất kỳ việc gì khi chưa đọc thẻ.

## 2. Tóm tắt trao đổi thành bình luận

Dùng khi người nói *tóm tắt rồi comment vào thẻ*.

**Nguồn của bản tóm tắt là cuộc trao đổi trong phiên này**, không phải thân thẻ và không phải bình luận cũ.

1. **Xác định phần mới.** Đối chiếu trao đổi trong phiên với thứ đã có trên thẻ ở bước 1. Chỉ giữ phần **chưa từng đăng**. Trùng ý thì bỏ, kể cả khi lần này diễn đạt khác đi.
2. **Chọn dạng bình luận:**

   | Dạng | Khi nào | Hình thức |
   |---|---|---|
   | **Ghi tiến trình** | mặc định, trao đổi còn đang mở | Viết liền mạch: đã bàn gì, chốt được gì, còn vướng gì |
   | **Chốt yêu cầu** | người đã đồng ý và muốn khoá lại | Khuôn bốn phần ở mục 3 |

3. **Không có gì mới thì nói thẳng và không đăng.** Một bình luận lặp lại bình luận trước là rác, và nó bắt người sau đọc hai lần cùng một thứ.
4. Trình nháp cho người OK rồi mới đăng.

## 3. Khuôn bình luận chốt yêu cầu

Bốn phần, viết bằng lời người, không bảng, không đường dẫn file:

1. **Yêu cầu** — một đoạn nói rõ muốn gì, đã thống nhất.
2. **Ngoài phạm vi** — thứ đã bàn rồi quyết không làm trong lần này.
3. **Điều kiện coi là xong** — nhìn vào đâu thì biết đã đạt.
4. **Còn mở** — chỗ chưa chắc, nếu còn.

Đăng xong thì thẻ đã có yêu cầu chốt, đủ để sang bước phân tích hoặc viết ADR.

Đây là bình luận, **không** phải artifact mới. Không sinh file, không mở thẻ khác.

## 4. Việc làm được

| Việc | Lưu ý |
|---|---|
| Bình luận | Chỗ duy nhất AI viết. Tóm tắt, phân tích, câu hỏi, mã ADR đều vào đây |
| Gắn, gỡ, đổi nhãn | Chỉ nhãn có thật. Nhãn nhóm `decision:` để người gắn |
| Nối thẻ con | Thẻ lớn tách thành nhiều việc → tạo sub-issue, giữ thẻ cha làm chỗ gom |
| Đóng thẻ | Luôn kèm lý do, xem mục 5 |
| Sửa thân thẻ | **Chỉ khi người yêu cầu rõ ràng** |

## 5. Đóng thẻ — chọn đúng lý do

Thẻ **sống tới khi việc làm xong**, không đóng sớm lúc vừa có ADR. Lý do: thân thẻ là yêu cầu, mà yêu cầu chỉ hết vai khi đã được đáp ứng.

| Tình huống | Lý do đóng |
|---|---|
| Đã làm xong | `completed` |
| Quyết không làm nữa | `not_planned`, bình luận nêu vì sao để lần sau không bàn lại |
| Trùng thẻ đã có | `duplicate`, nêu số issue gốc |

**Không đóng im lặng.** Lý do đóng là thứ duy nhất còn lại sau sáu tháng.

## 6. Giới hạn

- Không tự quyết thay người: việc nào là quyết định thì trình bảng, người OK rồi mới làm.
- Không viết ADR. Người cấp mã và đặt file; lá này chỉ bình luận mã ADR vào thẻ.
- Không nâng cấp skill từ bài học. Đó là việc của lá viết skill.
