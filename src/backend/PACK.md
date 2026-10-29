# PACK — backend

Manifest máy-đọc của module (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)). Consumer: installer `--with` · bảng router sinh tự động · trace liên-pack · Skill Registry tương lai.

```yaml
pack: backend
version: 0.1.0
owner: hoangnh
roles: [backend-dotnet]        # 17 lá phục vụ 3 lăng kính: DEV · QC (review) · DevOps (observability)
stage: implementation
repo: code
consumes: [DOC-08, DOC-11, DOC-12, "{MOD}-FR-*", "{MOD}-AC-*"]
produces: ["{MOD}-CMP-*", "source traced to {MOD}-FR-*", "traceability/from-docs.md"]
handoff-in:  [H4]
handoff-out: [H6]
memory: memory/backend/
mcp: [runtime]                 # tên trừu tượng (QĐ-9) — dự kiến grafana/prometheus; hiện tools gọi API trực tiếp
```
