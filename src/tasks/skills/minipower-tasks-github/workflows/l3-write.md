# L3 — Ghi GitHub (sau OK)

1. **Điều kiện vào L3:** bảng L2 đã trình, người đã OK, và mọi dòng `tạo` đã qua bước tìm trùng ở [l2-preview.md](l2-preview.md) mục 1. Thiếu một trong ba → quay lại L2, không ghi.
2. Chỉ những dòng còn tick trên bảng L2. Ghi **đúng** tiêu đề và nội dung đã duyệt ở khối L2, không thêm bớt một chữ. Muốn đổi câu chữ → quay lại L2, trình lại, không tự sửa lúc ghi.
2. Catalog có tool ghi **đúng tên trong schema** (`issue_write`, `add_issue_comment`, `sub_issue_write`, …) → gọi từng dòng. Lỗi 4xx → báo nguyên văn mã lỗi, **không** thử lại cùng payload nhiều lần.
3. **Không có** tool ghi → **không gọi MCP**, không bịa tên tool. Trả hướng dẫn thao tác tay kèm nội dung đã soạn để người dán vào.
4. **Đóng issue luôn kèm lý do.** Thiếu lý do thì hỏi, không mặc định `completed`.
5. Thân thẻ ghi **đúng lời người**. Nhận xét của AI về thẻ này, nếu có, đăng thành **bình luận riêng sau khi thẻ đã tạo**, không trộn vào thân.
6. Nhãn: chỉ gắn nhãn có thật. Dòng nào cần nhãn mới mà người chưa tạo → ghi issue trước, báo lại là **chưa gắn nhãn**, không bỏ qua im lặng.
7. Thẻ trên Project: nếu repo đã bật auto-add thì GitHub tự đưa lên board, không cần làm gì. Không có quyền Projects → nói rõ không xác nhận được thẻ đã lên board.
8. Thành công: in `#NNN` + link. Back-ref `memory/memory.md` **chỉ khi** người yêu cầu một dòng.
9. Không sửa `docs/`, không đụng pull request, không commit từ đây.
