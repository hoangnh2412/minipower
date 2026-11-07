# Pack manifest — schema `PACK.md` (SCHEMA)

**Trạng thái:** 🟢 **Load-bearing** — schema cho `PACK.md` của `sdlc/` và `backend/` (đợt ADR-022 bước 7). Bốn consumer: installer `--with` · bảng router sinh tự động · trace liên-pack · hạt giống Skill Registry.

Mỗi pack thêm **một khai báo nhỏ** (`PACK.md` ở root pack — file `.md` chứa một khối yaml) để agent bất kỳ trả lời được *"input của tôi từ đâu, output giao cho ai, theo boundary nào"*. Đây là cơ chế khiến pack **tự phối hợp**.

## 1. Schema

```yaml
pack: <tên-module>               # trùng tên folder: sdlc | backend | frontend | …
version: <semver>
owner: <người chịu trách nhiệm>
roles: [<vai trò>, ...]          # bố trí theo vị trí công ty
stage: discovery | requirements | architecture | planning
       | implementation | qa | delivery | ops | cross-cutting | presales
repo: docs | code | any | minipower  # pack tác động lên loại repo nào (minipower = chính repo công cụ)
consumes: [<ID hoặc pattern>, ...]   # artifact đầu vào
produces: [<ID hoặc pattern>, ...]   # artifact đầu ra
handoff-in:  [<boundary>, ...]   # nhận tại boundary nào (H1…H6 — xem handoff.md)
handoff-out: [<boundary>, ...]   # giao tại boundary nào
memory: memory/<namespace>/      # nơi ghi/đọc context
mcp: [<tên trừu tượng>, ...]     # tool cần qua MCP, bằng TÊN (docs·tasks·chat·code·…), không endpoint
```

## 2. Ví dụ — `router` (dispatcher)

```yaml
pack: router
roles: []
stage: [init, deliberation, readiness]
repo: any
consumes: []
produces: []
handoff-out: []
memory: memory/
```

## 3. Ví dụ — `backend`

```yaml
pack: backend
roles: [backend-dotnet]
stage: implementation
repo: code
consumes: [DOC-08, DOC-11, DOC-12, "{MOD}-FR-*", "{MOD}-AC-*"]
produces: ["{MOD}-CMP-*", "source traced to {MOD}-FR-*", "traceability/from-docs.md"]
handoff-in:  [H4]
handoff-out: [H6]
memory: memory/backend/
```

## 4. Ví dụ — pack tương lai (khung để mở rộng)

```yaml
# frontend
pack: frontend
roles: [frontend-react]
stage: implementation
repo: code
consumes: [DOC-12, "{MOD}-UC-*", "{MOD}-AC-*"]
produces: ["{MOD}-CMP-*"]
handoff-in: [H4]
handoff-out: [H6]

# qa
pack: qa
roles: [qa-tester]
stage: qa
repo: any
consumes: [DOC-07, DOC-16, "{MOD}-AC-*"]
produces: ["{MOD}-TEST-*"]
handoff-in: [H5]
```

---

*Liên quan:* [handoff.md](handoff.md) (định nghĩa H1–H6) · [trace-spine.md](trace-spine.md) (ID trong consumes/produces) · [shared-conventions.md](shared-conventions.md) (`memory:` namespace)
