# Lingua franca — quy ước dùng chung (QUY ƯỚC)

**Trạng thái:** 🟡 Đang sống trong `sdlc/` (memory · decision-log · versioning · ownership); phần mở rộng prefix DEC theo vai (`DEC-BE-`…) **chưa áp dụng** — bật cùng pack code cắm vào spine.

Mọi pack — bất kể repo — "nói cùng ngôn ngữ". Đây là phần khiến agent ở pack A hiểu output của pack B mà không cần đọc lại từ đầu.

| Primitive | Nguồn (đã có) | Chuẩn chung |
|-----------|---------------|-------------|
| `memory/memory.md` | `sdlc` | Đọc **đầu phiên** (cá nhân, gitignore); DEC/open-Q phẳng cạnh đó |
| `decision-log.md` | [schema](../src/router/docs/decision-log.md) | Prefix ID mở rộng theo vai trò: `DEC-BE-`, `DEC-FE-`, `DEC-QA-`, `DEC-OPS-` (bên cạnh `DEC-DIS/REQ/ARC/PLN/DLV/CHG`) |
| Versioning | [doc-versioning](../src/router/docs-skeleton/00-governance/doc-versioning.md) | `Version` chỉ sau sign-off; trước đó `—` + Draft — áp cho mọi artifact có baseline |
| Ownership | [parallel-work.md](../src/router/docs/parallel-work.md) | Một module — một owner; một boundary — một producer |
| Anatomy skill | backend + sdlc | Mọi pack: `SKILL.md` (agent) + `README.md` (người) + `workflows/` + `templates/` |

## decision-log — schema chung

```text
### DEC-{ROLE|PHASE}-NNN — <tiêu đề> · [YYYY-MM-DD]
- Status: proposed | accepted | superseded-by DEC-xxx
- Context / Options / Decision / Why (loại B,C vì) / Consequences
- Trace: DOC-XX · {MOD}-FR-xxx · ADR-xxx · {MOD}-CMP-xxx
- Confidence: cao | vừa | thấp
```

Quyết định kiến trúc nặng → nâng lên ADR (DOC-09). Decision-log là bản nhẹ cho **mọi** pack.

## Bảo mật artifact — luật ứng xử của agent

Áp cho mọi pack, mọi kênh (ADR-041 QĐ-6). Đây là *cách làm* của agent khi tạo hoặc đẩy artifact — không thay convention bảo mật của từng bề mặt code (dự án giữ trong `docs/00-governance/`), không thay pentest.

| # | Luật | Chi tiết |
|---|------|----------|
| 1 | **Secret không vào artifact** | Token, mật khẩu, connection string, khoá API, nội dung `.env` không ghi vào `docs/`, `AGENTS.md`, `brainstorm/`, MR, commit message, chat. Ví dụ cấu hình: tên biến + placeholder (`<REDACTED>`, `VITE_API_BASE_URL`) |
| 2 | **Dữ liệu máy không commit** | `memory/memory.md`, `memory/profile.user.json`, `memory/trace.db`, SQLite trong `.minipower/` — chỉ local (đã gitignore trong skeleton) |
| 3 | **Dữ liệu giả trong artifact** | Log mẫu, screenshot, JSON / dòng ERD minh hoạ: synthetic. Không dùng dữ liệu khách thật; tên người trong ví dụ là `{Author}` / `Nguyễn Văn A (mẫu)` trừ khi đã đồng ý công bố |
| 4 | **Nguồn ngoài có kiểm soát** | Không copy danh bạ, chat, ticket từ MCP (L1) vào DOC khi người chưa chỉ đúng bản ghi và phạm vi |
| 5 | **L3 có chủ đích** | Push git, Outline, Lark, OpenProject, GitLab: một bảng L2 + người OK ([cổng L1–L3](../src/tasks/rules/l1-l2-l3-tasks.md)). Không đẩy secret hay PII thật ra ngoài máy |
| 6 | **Phát hiện secret trong repo** | Báo **vị trí** (file, dòng) — không paste giá trị vào chat / log; gợi ý rotate nếu đã lộ. Thấy secret trong diff → dừng, báo người |
| 7 | **Baseline bất biến** | `docs/02-baseline/` chỉ đọc — hook `baseline-guard` gác; sửa qua CR |

Cổng máy duy nhất ở đây là `baseline-guard` (7). Secret scan là việc CI của repo đích (gitleaks hoặc tương đương) — minipower không thêm hook; sáu luật còn lại là lời, người soát.

---

*Liên quan:* [trace-spine.md](trace-spine.md) (ID) · [pack-manifest.md](pack-manifest.md) (khai `memory:` namespace)
