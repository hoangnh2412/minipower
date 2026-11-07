---
name: minipower-ops-metrics
description: Thu thập metrics từ Grafana/Prometheus — lấy panel PromQL, thay biến dashboard, query 24h, chuẩn hóa JSON cho AI. Dùng khi sự cố production, spike CPU/memory, panel Grafana trống, hoặc cần số liệu thực từ Prometheus để chẩn đoán.
metadata:
  workflow: github
  version: 1.0.0
---

# Troubleshooting .NET — Orchestrator

Skill hỗ trợ agent **thu thập và phân tích metrics** từ Grafana dashboard qua Prometheus — bước đầu cho troubleshooting .NET trên production.

Hướng dẫn người dùng: [README.md](README.md).

## Luồng lấy metrics từ Grafana panel

```text
1. GET Grafana  /api/dashboards/uid/{uid}     → dashboard JSON + panels + templating
2. Duyệt panels  → targets[].expr (PromQL)
3. Thay biến     → $instance → giá trị từ templating.list[].current.value
4. Query Prom    → GET /api/v1/query_range (step=300, 24h mặc định)
5. Chuẩn hóa     → JSON { panel, unit, series[{ labels, points[{ time, value }] }] }
```

Chi tiết API và CLI: [tools/grafana/README.md](tools/grafana/README.md) · [tools/prometheus/README.md](tools/prometheus/README.md).

## Tool Node.js (bắt buộc dùng khi cần số liệu thực)

Thư mục: [tools/](tools/)

**Quy tắc biến dashboard:** mỗi dashboard Grafana đặt tên biến khác nhau (`exported_job`, `job`, `service_name`, …). **Không hardcode tên biến** — luôn gọi `list-dashboard-vars.js` trước, rồi truyền `--var <name>=<value>` theo output.

```bash
cd ops/skills/minipower-ops-metrics/tools

# 1. Liệt kê dashboard
node list-dashboards.js

# 2. Xem biến của dashboard (tên dùng trong --var)
node list-dashboard-vars.js --uid <dashboard-uid>

# 3. Lấy metrics — --var theo tên từ bước 2
node fetch-dashboard-metrics.js \
  --uid <dashboard-uid> \
  --var exported_job=<job> \
  --var exported_instance=<instance> \
  --hours 6

# Dashboard khác (ví dụ Dotnet Runtime: job + instance)
node fetch-dashboard-metrics.js \
  --uid dehk88hf0ef40a \
  --var job=<job> \
  --var instance=<instance> \
  --hours 6

# Ghi đè đường dẫn output (mặc định: artifacts/{uid}-{timestamp}.json)
node fetch-dashboard-metrics.js --uid <uid> --output /tmp/metrics.json

# Khung thời gian tuyệt đối
node fetch-dashboard-metrics.js \
  --uid <uid> \
  --var service_name=<service> \
  --start 2026-06-12T18:00:00Z \
  --end 2026-06-13T00:00:00Z

# Chỉ xem PromQL đã resolve (không query)
node fetch-dashboard-metrics.js --uid <uid> --dry-run

# Lọc panel theo title
node fetch-dashboard-metrics.js --uid <uid> --panel "CPU"
```

**Yêu cầu:** Node.js ≥ 14 (không cần `npm install`).

## Output chuẩn cho AI

Tool trả JSON:

```json
{
  "dashboard": { "uid": "...", "title": "..." },
  "timeRange": { "start": "...", "end": "...", "stepSeconds": 300 },
  "variables": { "instance": "server01" },
  "panels": [
    {
      "panel": "CPU Usage",
      "unit": "percent",
      "expr": "100 - avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100",
      "series": [
        {
          "instance": "server01",
          "points": [{ "time": "2026-06-13T00:00:00Z", "value": 23.4 }]
        }
      ],
      "summary": { "min": 20.1, "max": 45.2, "avg": 31.5, "latest": 23.4 }
    }
  ]
}
```

Agent đọc `summary` trước, drill-down `series` khi cần chi tiết theo thời gian.

## Quy tắc khi phân tích

- Panel **Dotnet Runtime** (GC, thread pool, JIT) → giải thích ý nghĩa metric từ `panel`, `unit`, `expr` và xu hướng trong `summary`/`series`.
- Panel trống / lỗi query → kiểm tra `errors[]` trong output, biến dashboard chưa resolve, hoặc Prometheus không scrape.
- Không kết luận root cause chỉ từ một panel — correlate nhiều panel + logs/trace.
- Time range: `--hours` (mặc định 24) hoặc `--start`/`--end` (ISO8601).
- Biến dashboard: **luôn** `list-dashboard-vars.js --uid <uid>` trước → `--var <name>=<value>` (lặp cho mỗi biến). Tên biến phụ thuộc dashboard, không cố định.

## Liên quan

| Skill | Khi nào |
|---|---|
| [minipower-backend-telemetry-dotnet](../../../backend/skills/minipower-backend-telemetry-dotnet/README.md) | Cài OTEL metric cho app .NET |
| [minipower-backend-healthcheck-dotnet](../../../backend/skills/minipower-backend-healthcheck-dotnet/README.md) | Readiness/liveness, khác pipeline Prometheus scrape |
