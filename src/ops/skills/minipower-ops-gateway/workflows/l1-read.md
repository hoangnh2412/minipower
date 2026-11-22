# L1 — Đọc tình hình gateway

1. Con trỏ `mcp.gateway` có, namespace sẵn trong catalog. Chưa → [connect.md](connect.md).
2. Hỏi **một lượt** nếu thiếu: kỳ (hôm nay / 7 ngày / tháng) · combo hay provider cụ thể · muốn số tổng hay theo model.
3. Gọi đọc theo câu hỏi:

   | Câu hỏi của người | Tool |
   |---|---|
   | Gateway có ổn không, circuit breaker nào đang mở | `omniroute_get_health` |
   | Quota còn bao nhiêu, provider nào sắp hết, reset khi nào | `omniroute_check_quota` |
   | Kỳ này tốn bao nhiêu, theo provider / model | `omniroute_cost_report` |
   | Có combo nào, strategy gì, combo nào đang bật | `omniroute_list_combos` · `omniroute_get_combo_metrics` |
   | Vì sao request đi provider X | `omniroute_explain_route` |
   | Nếu đổi combo thì request sẽ đi đâu | `omniroute_simulate_route` (dry-run, không gọi upstream) |
   | Provider nào chậm, p95 bao nhiêu | `omniroute_get_provider_metrics` |
   | Model nào có, giá bao nhiêu | `omniroute_list_models_catalog` |
   | Cache / compression đang tiết kiệm bao nhiêu | `omniroute_cache_stats` · `omniroute_compression_status` |

4. Tool trả 401/403 → thiếu scope, báo và trỏ [connect.md](connect.md) §3; **không** kết luận "không có dữ liệu". Tool không có trong catalog → nói thiếu, không bịa.
5. Trả 3–7 bullet có số liệu + mục mở. Hỏi về chi phí → thêm bảng `provider/model | request | token | chi phí`. Nói rõ kỳ và múi giờ nếu tool trả.
6. Dừng đây nếu người chỉ hỏi. Người muốn đổi gì → [l2-preview.md](l2-preview.md), **mang theo giá trị hiện tại vừa đọc** để điền cột so sánh.
