# L2 — Một bảng đề xuất (chưa ghi)

1. Đã đọc L1 đủ để biết **giá trị hiện tại** của thứ sắp đổi. Chưa đọc thì đọc trước, không đề xuất mò.
2. Một bảng, mỗi dòng một hành động:

   `hành động | đối tượng | giá trị hiện tại | giá trị mới | lý do | tool`

   Hành động trong phạm vi lá này:

   | Hành động | Tool sẽ gọi ở L3 |
   |---|---|
   | Tạo combo mới (chuỗi model + strategy) | `omniroute_create_combo` |
   | Bật / tắt combo | `omniroute_switch_combo` |
   | Đổi chiến lược routing của combo | `omniroute_set_routing_strategy` |
   | Đặt trần chi phí phiên và hành vi khi chạm (degrade / block / alert) | `omniroute_set_budget_guard` |
   | Đổi profile resilience (aggressive / balanced / conservative) | `omniroute_set_resilience_profile` |

3. Dòng **ngoài phạm vi mặc định** — chỉ đưa vào bảng khi người nêu đích danh, và ghi chú rủi ro ngay trên dòng: `omniroute_cache_flush` (mất cache toàn cục) · `omniroute_test_combo` (gọi upstream thật, tốn tiền) · `omniroute_db_health_check` (có auto-repair).
4. Nêu hậu quả với client đang chạy: đổi strategy hay tắt combo ảnh hưởng **ngay** mọi request đang trỏ vào combo đó. Người cần biết điều này trước khi OK.
5. Người **bỏ tick** dòng không muốn, sửa giá trị nếu cần. Sửa xong thì trình lại dòng đã sửa, không ghi thẳng.
6. Một câu OK cho phần còn lại → [l3-write.md](l3-write.md). Không OK → dừng, không gọi tool ghi.
