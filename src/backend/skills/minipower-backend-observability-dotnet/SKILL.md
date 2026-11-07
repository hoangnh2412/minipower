---
name: minipower-backend-observability-dotnet
description: Thiết lập observability metric cho service .NET — OTEL instrumentation, Prometheus scrape, Grafana dashboard, Prometheus/Alertmanager rules và vận hành. Dùng khi onboard metric mới, tạo dashboard, gắn alert, hoặc chuẩn hóa pipeline OTEL → Prometheus → Grafana.
metadata:
  workflow: github
  version: 1.0.0
---

# Observability .NET — Orchestrator

Skill hướng dẫn **thiết lập end-to-end** pipeline metric cho ASP.NET Core: app export OTEL → collector/backend → Prometheus → Grafana → alert → vận hành.

Hướng dẫn người dùng: [README.md](README.md).

## Pipeline chuẩn

```text
ASP.NET Core (OTEL SDK)
    → OTLP exporter
        → OpenTelemetry Collector (hoặc backend tương đương)
            → Prometheus (scrape / remote write)
                → Grafana (visualize)
                → Prometheus rules → Alertmanager (notify)
```

Chi tiết kiến trúc: [reference/pipeline.md](reference/pipeline.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Onboard metric từ đầu (full stack) | [workflows/setup.md](workflows/setup.md) |
| Chỉ app — bật OTEL metric | [workflows/otel-app.md](workflows/otel-app.md) |
| Prometheus scrape / rule files | [workflows/prometheus.md](workflows/prometheus.md) |
| Dashboard Grafana + biến templating | [workflows/grafana.md](workflows/grafana.md) |
| Alert + Alertmanager routing | [workflows/alerts.md](workflows/alerts.md) |
| Baseline, verify, runbook khi firing | [workflows/operate.md](workflows/operate.md) |

## Quy tắc cốt lõi

- **App metric:** ưu tiên instrumentation OTEL chuẩn (ASP.NET Core, HttpClient, Process, Runtime) trước custom metric.
- **Label ổn định:** `service.name` / `service_name`, `job`, `instance` — thống nhất giữa app, scrape config và dashboard.
- **Không hard-code** tên service, IP, ngưỡng alert — lấy từ `{service_name}`, baseline thực tế, limit pod/container.
- **Cardinality:** tránh tag high-cardinality (user id, request id) trên metric.
- **Dashboard trước alert:** có panel + baseline 7 ngày rồi mới gắn rule `> N× baseline`.
- **Jarvis app:** cài OTEL trong code → dùng thêm [minipower-backend-telemetry-dotnet](../minipower-backend-telemetry-dotnet/SKILL.md); skill này bao **hạ tầng** scrape/visualize/alert.
- **Troubleshoot sự cố:** sau khi pipeline sẵn sàng → [minipower-ops-metrics](../../../ops/skills/minipower-ops-metrics/SKILL.md) để lấy số liệu thực.

## Họ metric khuyến nghị (.NET web API)

| Nhóm | Instrumentation OTEL | Ví dụ metric Prometheus | Mục đích |
|---|---|---|---|
| HTTP inbound | ASP.NET Core | `http_server_request_duration_seconds_*` | RPS, latency, P99 |
| HTTP outbound | HttpClient | `http_client_request_duration_seconds_*` | Dependency load |
| Process | Process | `process_memory_usage_bytes` | RAM process |
| CLR runtime | Runtime | `process_runtime_dotnet_gc_*`, `process_runtime_dotnet_thread_pool_*` | GC, thread pool |

Chi tiết: [reference/metric-families.md](reference/metric-families.md).

## Templates

| File | Dùng khi |
|---|---|
| [templates/prometheus-scrape.yaml](templates/prometheus-scrape.yaml) | Thêm job scrape collector/app |
| [templates/prometheus-rules.yaml](templates/prometheus-rules.yaml) | Rule file mẫu (RAM, GC, latency, thread pool) |
| [templates/alertmanager-route.yaml](templates/alertmanager-route.yaml) | Route theo `service` / `team` |
| [templates/grafana-variables.md](templates/grafana-variables.md) | Biến dashboard + nhóm panel |

## Output bắt buộc (khi user yêu cầu thiết lập)

1. Checklist từng tầng: app OTEL → scrape OK → dashboard → rule → notify test
2. Danh sách metric + PromQL panel chính (placeholder `{service_name}`)
3. Ngưỡng alert **đề xuất** kèm ghi chú “thay bằng baseline thực”
4. Runbook ngắn: alert firing → kiểm tra gì → hành động tiếp

Phần **code C#** đụng tới (enricher, metric custom, middleware đo đạc) vẫn theo hai luật chung: viết code theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md), đặt file đúng layer theo [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — metric/enricher là **adapter**, thuộc `Host` hoặc `Infrastructure`, không nhét vào `Domain`.

## Liên quan

| Skill | Khi nào |
|---|---|
| [minipower-backend-telemetry-dotnet](../minipower-backend-telemetry-dotnet/SKILL.md) | Gắn Jarvis.OpenTelemetry vào Host |
| [minipower-ops-metrics](../../../ops/skills/minipower-ops-metrics/SKILL.md) | Đọc metrics từ dashboard khi sự cố |
| [minipower-backend-healthcheck-dotnet](../minipower-backend-healthcheck-dotnet/README.md) | Health probe — tách khỏi metric business |
