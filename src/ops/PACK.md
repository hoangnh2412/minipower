# PACK — ops

Manifest máy-đọc của module (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)). Consumer: installer `--with` · bảng router sinh tự động · trace liên-pack · Skill Registry tương lai.

```yaml
pack: ops
version: 0.1.0
owner: hoangnh
roles: [devops]                # vai khai bằng metadata, không vào tên skill (ADR-023 QĐ-4)
stage: ops
repo: any
consumes: [DOC-17, "dashboard Grafana", "metrics Prometheus"]
produces: ["metrics JSON chuẩn hoá", "chẩn đoán sự cố", "incident report đầu vào"]
handoff-in:  [H6]
memory: memory/ops/
mcp: [runtime, gateway]        # tên trừu tượng (ADR-022 QĐ-9) — runtime: dự kiến grafana/prometheus, hiện tools gọi API trực tiếp · gateway: MCP OmniRoute (lá minipower-ops-gateway, bản nháp #21)
```
