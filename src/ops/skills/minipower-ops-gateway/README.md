# minipower-ops-gateway

Làm việc với **AI gateway OmniRoute** mà không mở dashboard: hỏi sức khoẻ, quota, chi phí, vì sao request đi provider nào; đề xuất rồi ghi thay đổi combo, routing, budget sau khi anh OK. Agent đọc [SKILL.md](./SKILL.md).

**Bản nháp** theo [issue #21](https://github.com/hoangnh2412/minipower/issues/21) — chưa đối chiếu tên tool với server thật, chưa có ADR.

## L1 / L2 / L3

| Mức | Làm gì | Cổng người |
|---|---|---|
| L1 | Sức khoẻ, quota, chi phí theo kỳ, metric provider, giải thích / dry-run route, danh mục combo và model | Không |
| L2 | Một bảng đề xuất: tạo/đổi combo, đổi chiến lược routing, đặt budget guard, đổi profile resilience | Chờ một lần OK |
| L3 | Gọi tool ghi, chỉ dòng còn tick, đọc lại để xác nhận | Chỉ sau L2 |

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Chưa kết nối, cần tạo key, bị 401/403 | [workflows/connect.md](./workflows/connect.md) |
| "Quota còn bao nhiêu", "tháng này tốn bao nhiêu", "sao request đi provider X" | [workflows/l1-read.md](./workflows/l1-read.md) |
| "Thêm fallback", "đổi strategy combo", "đặt trần chi phí phiên" | [workflows/l2-preview.md](./workflows/l2-preview.md) → [workflows/l3-write.md](./workflows/l3-write.md) |

**Không dùng cho:**

- Gọi chat completion qua gateway — client (Claude Code, Cursor, Codex) đã nối thẳng endpoint `/v1`, không cần skill.
- Web search, memory, skill nội bộ, Notion, Obsidian, plugin, gamification của OmniRoute — ngoài việc vận hành gateway.
- Metrics Grafana/Prometheus của app → [minipower-ops-metrics](../minipower-ops-metrics/README.md).
- Sự cố production của hệ thống khách → [minipower-ops-incident](../minipower-ops-incident/README.md).

## Cài MCP (máy người)

Server MCP là **phần tích hợp sẵn của OmniRoute** ([cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute)), không gói bên thứ ba. Các bước: tạo API key riêng cho agent với scope hẹp, dán cấu hình HTTP vào client, khai `mcp.gateway` trong `memory/profile.json`, verify → [workflows/connect.md](./workflows/connect.md).

Hai chỗ dễ sai: dùng key cá nhân full quyền cho agent (scope là chốt chặn duy nhất máy cưỡng chế được), và để nguyên catalog hơn 100 tool làm ngập context.

## Cách gọi

Mô tả việc bằng lời — skill kích hoạt qua `description`:

```text
Quota các provider trên OmniRoute còn bao nhiêu, provider nào sắp hết?
Tuần này gateway tốn bao nhiêu, theo model.
Request của Claude Code hôm qua vì sao đi sang provider X thay vì Y?
Thêm fallback cho combo "coding" sang model Z khi hết quota — đề xuất trước.
```

## Liên quan

- Khuôn SOP gốc: [minipower-tasks-lark](../../../tasks/skills/minipower-tasks-lark/README.md)
- Bản đồ module: [ops/README.md](../../README.md)
