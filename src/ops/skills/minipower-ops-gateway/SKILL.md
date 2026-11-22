---
name: minipower-ops-gateway
description: Vận hành AI gateway OmniRoute qua MCP theo L1–L3 — xem sức khoẻ, quota provider, chi phí token theo kỳ, giải thích route; đề xuất rồi ghi combo, chiến lược routing, budget guard sau một lần OK. Dùng khi nhắc omniroute, AI gateway, quota, chi phí model, combo, fallback, routing strategy, cổng 20128 — không dùng để gọi completion hay cài provider mới.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-ops-gateway

SOP MCP cho **AI gateway OmniRoute** — cùng khuôn [minipower-tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md): wrap tool, không chép schema API, catalog runtime là nguồn chân lý tên tool. Người: [README.md](README.md).

**Bản nháp 0.1.0** theo issue #21 — tên tool trong [reference/omniroute-tools.md](reference/omniroute-tools.md) lấy từ tài liệu upstream, **chưa đối chiếu** với catalog trên server thật. Gặp lệch thì tin catalog, sửa reference, bump version.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| MCP chưa có, "kết nối OmniRoute", thiếu key, 401/403 | [workflows/connect.md](workflows/connect.md) |
| Sức khoẻ, quota còn bao nhiêu, tốn bao nhiêu kỳ này, vì sao request đi provider X | [workflows/l1-read.md](workflows/l1-read.md) |
| Đề xuất tạo/đổi combo, chiến lược routing, budget guard, resilience | [workflows/l2-preview.md](workflows/l2-preview.md) → OK → [workflows/l3-write.md](workflows/l3-write.md) |
| Phân vân tool nào thuộc tầng nào, nhóm nào ngoài phạm vi | [reference/omniroute-tools.md](reference/omniroute-tools.md) |

**Không dùng** để gọi chat completion (client đã nối thẳng endpoint OpenAI-compatible), web search, memory/skill nội bộ của OmniRoute, Notion, Obsidian, plugin.

## Quy tắc cốt lõi

- **Con trỏ MCP:** `memory/profile.json` → `mcp.gateway` = tên server MCP (giả định của bản nháp, chờ chốt ở #21 câu 5). Thiếu → [connect.md](workflows/connect.md). Repo công cụ không có `profile.json` → hỏi tên server một lượt.
- **Server MCP cố định:** MCP tích hợp của chính OmniRoute ([cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute)), transport HTTP streamable `/api/mcp/stream`. Không gói bên thứ ba. *Luật mềm.*
- **Key riêng cho agent, scope hẹp — điều cứng duy nhất, do server cưỡng chế.** `mcp:connect` + `read:*`; thêm `write:combos` · `write:budget` · `write:resilience` **chỉ khi** người đã cho L3. Không dùng key `manage` hay key cá nhân full quyền của người. Scope là thứ FAIL được bằng máy khi agent gọi sai, nên mới được viết "bắt buộc".
- **Catalog quá rộng, phải cắt.** Hơn 100 tool, trong đó Notion · Obsidian · gamification · plugin · proxy · memory · skills nằm ngoài việc vận hành gateway. Cắt bằng scope key hoặc `MCP_TOOL_ALLOW` phía server ([connect.md](workflows/connect.md) §3). Ngược bẫy cờ `-t` của Lark: ở đây khai **thừa** mới hại.
- **Schema tool đầu phiên.** Tên dạng `omniroute_*` gạch dưới: `omniroute_get_health`, `omniroute_check_quota`, `omniroute_cost_report`, `omniroute_list_combos`. **Không bịa** tên; không thấy tool thì nói thiếu.
- **Không gọi `execute:*`** (`route_request`, `web_search`, `test_combo`, `skills_execute`). Hai lý do: completion là việc của client, và `test_combo` gọi upstream thật tốn tiền — chỉ chạy khi bảng L2 có dòng đó và người OK.
- **401/403 là thiếu scope, không phải "không có dữ liệu".** Tool đọc trả lỗi quyền → [connect.md](workflows/connect.md) §6, không kết luận gateway trống.
- **Tool ghi không có hộp xác nhận phía server**, chỉ có audit log. Cổng duy nhất là L2 → người OK → L3. Không L3 vì "tiện".
- **Dữ liệu doanh nghiệp đọc sống.** Danh mục combo, provider, quota đổi liên tục và tool đọc rẻ, nên **không** chép vào `memory/` như cách ADR-046 làm với Lark. Không tự ghi memory.
- **Hỏi thiếu một lượt:** kỳ báo cáo (ngày/tuần/tháng) · combo hay provider nào · ngưỡng budget và hành vi khi chạm (degrade/block/alert) · có cho đụng cache không.
- **Tuyệt đối không tự gọi:** `cache_flush`, `memory_clear`, `db_health_check` (có auto-repair), `plugin_*`, `ccr_delete`. Chỉ khi người nêu đích danh trong bảng L2.

## Output

- Connect: PASS/FAIL theo từng mặt (server · key · scope · tool đọc · tool ghi) + cách sửa.
- L1: 3–7 bullet có số liệu đọc được + mục mở; hỏi về chi phí thì kèm bảng `provider/model | request | token | chi phí`.
- L2: bảng `hành động | đối tượng | giá trị hiện tại | giá trị mới | lý do | tool`.
- L3: kết quả từng dòng, đọc lại sau ghi để xác nhận; lỗi in nguyên văn mã.
