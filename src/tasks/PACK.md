# PACK — tasks

Manifest máy-đọc (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)). Module **kênh** — SOP MCP mặt `tasks`, không luật UC/FR (ADR-033 QĐ-5). Provider: OpenProject · Lark · GitHub.

```yaml
pack: tasks
version: 0.1.0
owner: hoangnh
roles: [pm, support]
stage: cross-cutting
repo: any
consumes: ["preview L2", "tasks_provider"]
produces: ["task id / work package id"]
handoff-in:  []
handoff-out: []
memory: —
mcp: [tasks]
```
