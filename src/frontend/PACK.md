# PACK — frontend

Manifest máy-đọc của module (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)). Consumer: installer `--with` · bảng router sinh tự động · trace liên-pack · Skill Registry tương lai.

```yaml
pack: frontend
version: 0.1.0
owner: hoangnh
roles: [frontend-react]        # phục vụ 2 lăng kính: DEV · QC (review)
stage: implementation
repo: code
consumes: [DOC-12, DOC-19, "{MOD}-UC-*", "{MOD}-FR-*", "{MOD}-AC-*"]
produces: ["{MOD}-CMP-*", "source traced to {MOD}-FR-*"]
handoff-in:  [H4]
handoff-out: [H6]
memory: memory/frontend/
mcp: []                        # không cần tool ngoài — làm việc trên source + npm
```
