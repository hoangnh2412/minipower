# Tool MCP OmniRoute — phân tầng cho lá `minipower-ops-gateway`

Nguồn: `docs/frameworks/MCP-SERVER.md` và `llm.txt` của [cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute), đọc 2026-11-20. **Chưa đối chiếu với catalog trên server thật** — catalog runtime là nguồn chân lý, lệch thì sửa file này và bump version lá. Tên tool đổi theo release; dự án ra bản mới rất nhanh.

Không chép schema tham số. Chỉ ghi tên, scope và tầng để agent biết tool nào gọi được ở đâu.

## Trong phạm vi lá

| Tầng | Tool | Scope | Việc |
|---|---|---|---|
| L1 | `omniroute_get_health` | `read:health` | uptime, bộ nhớ, circuit breaker, rate limit |
| L1 | `omniroute_check_quota` | `read:quota` | quota đã dùng / tổng, % còn, giờ reset |
| L1 | `omniroute_cost_report` | `read:usage` | chi phí theo kỳ, theo provider/model |
| L1 | `omniroute_get_session_snapshot` | `read:usage` | ảnh chụp phiên hiện tại |
| L1 | `omniroute_list_combos` · `omniroute_get_combo_metrics` | `read:combos` | danh mục combo, strategy, metric |
| L1 | `omniroute_explain_route` | `read:health` `read:usage` | vì sao request đi provider đó |
| L1 | `omniroute_simulate_route` | `read:health` `read:combos` | dry-run cây fallback, không gọi upstream |
| L1 | `omniroute_best_combo_for_task` | `read:combos` `read:health` | gợi ý combo theo ràng buộc budget/latency |
| L1 | `omniroute_get_provider_metrics` | `read:health` | p50/p95/p99 từng provider |
| L1 | `omniroute_list_models_catalog` | `read:models` | model, năng lực, giá |
| L1 | `omniroute_cache_stats` · `omniroute_compression_status` | `read:cache` `read:compression` | cache và nén đang tiết kiệm bao nhiêu |
| L3 | `omniroute_create_combo` · `omniroute_switch_combo` · `omniroute_set_routing_strategy` | `write:combos` | tạo, bật/tắt, đổi strategy combo |
| L3 | `omniroute_set_budget_guard` | `write:budget` | trần chi phí phiên, hành vi khi chạm |
| L3 | `omniroute_set_resilience_profile` | `write:resilience` | preset aggressive / balanced / conservative |

## Chỉ khi người nêu đích danh

| Tool | Scope | Rủi ro |
|---|---|---|
| `omniroute_test_combo` | `execute:completions` `read:combos` | gọi upstream thật, tốn tiền |
| `omniroute_cache_flush` | `write:cache` | mất cache toàn cục |
| `omniroute_db_health_check` | `read:health` `write:resilience` | auto-repair đổi dữ liệu nền |
| `omniroute_sync_pricing` | `pricing:write` | đổi bảng giá dùng để tính chi phí |
| `omniroute_compression_configure` · `omniroute_set_compression_engine` | `write:compression` | đổi cách nén mọi request |

## Ngoài phạm vi — cắt khỏi catalog nếu được

| Nhóm | Vì sao không thuộc lá này |
|---|---|
| `omniroute_route_request` · `omniroute_web_search` · `omniroute_x_search` · `omniroute_web_fetch` | completion và tìm kiếm là việc của client, không phải vận hành gateway |
| `omniroute_memory_*` · `omniroute_skills_*` · `omniroute_agent_skills_*` | memory và skill nội bộ của OmniRoute, trùng vai với Minipower |
| `omniroute_ccr_*` · `omniroute_rtk_*` | kho nén nội dung, không phải vận hành |
| `omniroute_oneproxy_*` | proxy marketplace |
| `notion_*` · `obsidian_*` · `local_corpus_*` | nguồn context ngoài — Minipower dùng Outline qua lá `docs/` |
| `gamification_*` · `plugin_*` | không liên quan |

Cắt bằng scope key (không cấp `read:notion`, `read:obsidian`, `read:gamification`, `read:plugins`, `read:memory`, `read:skills`, `read:compression` nếu không cần) hoặc `MCP_TOOL_ALLOW` phía server. Catalog gọn thì description tool chiếm ít context hơn và agent ít chọn nhầm.

## Kết nối

| Transport | Địa chỉ | Ghi chú |
|---|---|---|
| stdio | `omniroute --mcp` | chỉ khi client cùng máy với server |
| HTTP streamable | `POST {host}/api/mcp/stream` | dùng cho server ở xa; header `Authorization: Bearer {KEY}` bắt buộc ngoài loopback |
| SSE | `GET {host}/api/mcp/sse` | cho client trình duyệt |

Scope tối thiểu để mở kết nối từ xa: `mcp:connect`. Server chỉ ghi audit log cho tool ghi, **không** có xác nhận — cổng L2 của lá là chốt chặn duy nhất về phía người.
