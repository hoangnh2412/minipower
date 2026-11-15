# PACK — work

Manifest máy-đọc (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)).

Nghiệp vụ quản lý công việc trên board của đội: làm việc trên ticket · xem tình hình · báo cáo định kỳ · quản trị cấu hình. **Không gọi MCP trực tiếp** — mọi thao tác đi qua lá kênh `tasks/` (ADR-046 QĐ-1).

```yaml
pack: work
version: 0.1.0
owner: hoangnh
roles: []
stage: cross-cutting
repo: any
consumes: ["memory/tasks-config/*", "lá kênh tasks/"]
produces: ["thao tác ticket", "bảng tình hình", "báo cáo định kỳ"]
handoff-in:  []
handoff-out: []
memory: memory/tasks-config/
mcp: [tasks]
```

`roles: []` là cố ý — ai cũng dùng được, không gắn vai (ADR-046 C4).
