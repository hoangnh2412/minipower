# PACK — router

Manifest máy-đọc (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)).

Pack **dispatcher** (ADR-033 QĐ-1/QĐ-14 · ADR-043): triage đơn hay phức, gợi ý một lá cho mỗi task; init hỏi `project_mode` + 4 provider. Hook máy vẫn neo `sdlc/hooks/` đến Đợt E.

```yaml
pack: router
version: 0.1.0
owner: hoangnh
roles: []
stage: cross-cutting
repo: any
consumes: ["intent", "profile.json"]
produces: ["tên pack gợi ý", "profile.json"]
handoff-in: []
handoff-out: []
memory: memory/
mcp: []
```
