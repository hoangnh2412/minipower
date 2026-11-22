# ops — kỹ năng vận hành hạ tầng

Module skill cho người **DevOps/SRE**: chẩn đoán sự cố production hôm nay; cài đặt server, CI/CD, deploy mai này (ADR-023). Skill là **lá-rời** — mỗi lá tự đứng trên menu loader với description sắc, không qua router.

Manifest máy-đọc: [PACK.md](PACK.md).

## Skill

| Skill | Tài liệu | Việc |
|---|---|---|
| **minipower-ops-metrics** | [skills/minipower-ops-metrics/README.md](./skills/minipower-ops-metrics/README.md) | Thu thập metrics Grafana/Prometheus → JSON chuẩn hoá cho AI |
| **minipower-ops-deploy** | [skills/minipower-ops-deploy/README.md](./skills/minipower-ops-deploy/README.md) | DOC-17 / cutover / runbook triển khai |
| **minipower-ops-incident** | [skills/minipower-ops-incident/README.md](./skills/minipower-ops-incident/README.md) | Incident report + postmortem |
| **minipower-ops-gateway** | [skills/minipower-ops-gateway/README.md](./skills/minipower-ops-gateway/README.md) | Vận hành AI gateway OmniRoute qua MCP: quota, chi phí, route, combo (L1–L3) — bản nháp #21 |

## Sẽ có — viết dần, không tạo folder rỗng (ADR-023 QĐ-3)

| Skill dự kiến | Việc |
|---|---|
| `minipower-ops-memory-leak-dotnet` | Chẩn đoán memory leak .NET (GC, heap) |
| `minipower-ops-deadlock-dotnet` | Chẩn đoán deadlock .NET (thread pool) |
| `minipower-ops-log-flow` | Đọc log vẽ sơ đồ luồng |

Các skill case dùng `minipower-ops-metrics` làm tầng lấy số liệu; hậu tố `-dotnet` chỉ gắn khi thật sự stack-bound.

## Liên quan

- [backend/](../backend/README.md) — cài OTEL/telemetry/healthcheck vào app .NET (phía **code**; `ops` đứng phía **vận hành**)
- [router/](../router/README.md) — incident report / postmortem sống ở `docs/06-changes/incident/` của dự án đích
