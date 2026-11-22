# Changelog — minipower-ops-gateway

Mới nhất lên trên. Chỉ ghi khi `metadata.version` đổi (ADR-044 §8.1).

## 0.1.0 · 2026-11-21

- Bản nháp đầu tiên theo issue #21: SOP MCP cho AI gateway OmniRoute cùng khuôn `minipower-tasks-lark` — `connect` · `l1-read` · `l2-preview` · `l3-write`, kèm `reference/omniroute-tools.md` phân tầng tool theo L1/L2/L3 và nhóm ngoài phạm vi.
- Giả định chờ chốt (#21 câu 1–5): nhà là pack `ops/`; con trỏ `mcp.gateway` trong `profile.json`; L3 giới hạn combo · routing strategy · budget guard · resilience; tên tool lấy từ tài liệu upstream, **chưa đối chiếu** catalog server thật.
