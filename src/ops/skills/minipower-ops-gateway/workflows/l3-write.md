# L3 — Ghi lên OmniRoute (sau OK)

1. **Điều kiện vào:** bảng L2 đã trình, người đã OK, mỗi dòng có giá trị hiện tại đọc từ L1. Thiếu một → quay L2.
2. Chỉ dòng còn tick. Ghi **đúng** giá trị đã duyệt, không làm tròn, không thêm dòng.
3. **Soát catalog trước khi gọi.** Không thấy tool ghi ⇒ key chưa có scope `write:*` tương ứng → báo "chưa ghi — thiếu scope", trỏ [connect.md](connect.md) §3. **Không** bịa tên tool, **không** rẽ sang REST hay dashboard thay người.
4. Gọi từng dòng, một tool một lượt. Lỗi 4xx → in nguyên văn mã và thông điệp, **không** thử lại cùng payload.
5. **Đọc lại sau ghi** để xác nhận: đổi combo → `omniroute_list_combos` hoặc `omniroute_get_combo_metrics`; budget → `omniroute_get_session_snapshot` nếu có; resilience → `omniroute_get_health`. Giá trị đọc lại khác giá trị đã ghi → báo ngay, không coi là xong.
6. Server **không có hộp xác nhận**, chỉ ghi audit log. Nhắc người: mọi lệnh ghi đã vào `mcp_tool_audit` phía OmniRoute, muốn soát thì xem dashboard Logs.

## Không bao giờ tự gọi

| Tool | Vì sao |
|---|---|
| `omniroute_cache_flush` | Mất cache toàn cục, mọi client chậm lại và tốn token |
| `omniroute_memory_clear` · `omniroute_ccr_delete` | Xoá dữ liệu không khôi phục được |
| `omniroute_db_health_check` | Có auto-repair, đổi dữ liệu nền |
| `plugin_install` · `plugin_uninstall` · `plugin_*` | Đổi mã chạy trên server |
| `omniroute_route_request` · `omniroute_test_combo` · `omniroute_web_search` | Gọi upstream thật, tốn tiền; completion là việc của client |

Người nêu đích danh một trong các tool trên trong bảng L2 và OK → được gọi, kèm ghi chú rủi ro đã nêu ở L2.

## Sau khi ghi

7. In kết quả từng dòng: `đối tượng | giá trị mới | xác nhận đọc lại`.
8. Không tự ghi `memory/`. Người muốn ghi một dòng back-ref thì mới ghi.
