# PACK — presales

Manifest máy-đọc (schema: [contracts/pack-manifest.md](../../contracts/pack-manifest.md)). Ước lượng + báo giá **trước ký**. Không sở hữu discovery (ADR-030 QĐ-3).

```yaml
pack: presales
version: 0.1.0
owner: hoangnh
roles: [presales]
stage: presales
repo: any
consumes: ["H0 khảo sát", "SOL-* lite"]
produces: ["estimate-v1.0.json", "estimate-dmba-v1.0.json", "quotation", "quotation.xlsx/md/html"]
handoff-in:  [H0]
handoff-out: []
memory: —
mcp: []
```
