---
name: minipower-tasks-lark
description: Đọc, lọc, tìm, soạn nháp và ghi task Lark (tasklist / task) theo L1–L3. Dùng khi việc trên Lark, sprint, tasklist, "tìm task", "tạo task", tasks_provider lark — không dùng cho tin nhắn nhóm hay wiki.
metadata:
  workflow: github
  version: 1.2.0
---

# minipower-tasks-lark

SOP MCP mặt **`tasks`**, provider Lark. Wrap tool, không copy schema API. Người: [README.md](README.md). Persona: [agents/minipower-tasks-lark.md](../../agents/minipower-tasks-lark.md). Cổng L1–L3: [rules/l1-l2-l3-tasks.md](../../rules/l1-l2-l3-tasks.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| MCP chưa sẵn sàng, "kết nối Lark", chưa có app / token | [workflows/connect.md](workflows/connect.md) |
| Tìm / lọc / tóm tắt / việc tôi / quá hạn | [workflows/l1-read.md](workflows/l1-read.md) |
| Đề xuất tạo / sửa due / hoàn thành | [workflows/l2-preview.md](workflows/l2-preview.md) → OK → [workflows/l3-write.md](workflows/l3-write.md) |
| Phân vân loại việc / chỗ chứa / log giờ vào đâu | [reference/lark-mapping.md](reference/lark-mapping.md) ← luật gốc [pm-plan › work-breakdown](../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md) |

**Không dùng** cho IM, wiki, Bitable, Outline, OpenProject.

## Quy tắc cốt lõi

- `memory/profile.json` → `tasks_provider`. Khác `lark` → **dừng**, không gọi MCP Lark. `none` → artifact SQLite (không MCP). `openproject` → lá kia, không skill này. Đổi provider → người `minipower init`.
- MCP `mcp.tasks` (thường `user-lark-mcp` / `lark-mcp`). Thiếu server / `needsAuth` → `mcp_auth` một lần; vẫn lỗi → [connect.md](workflows/connect.md).
- **Gói MCP cố định:** `@larksuiteoapi/lark-mcp` ([larksuite/lark-openapi-mcp](https://github.com/larksuite/lark-openapi-mcp)). Người đưa nguồn khác → từ chối, nêu lý do, mở issue nếu muốn đổi thật.
- Schema tool **đầu phiên** — catalog runtime là SSOT. Tên dùng **gạch dưới**: `task_v2_task_list`, `task_v2_task_get`, `task_v2_task_create`, `task_v2_task_patch`, `task_v2_taskSubtask_create`, `task_v2_section_list`. **Không** bịa `task_create` / `task_search`.
- **MCP Lark ghi được task.** Catalog đầy đủ có ~50 tool task. Thiếu tool ghi là do cờ `-t` khai thiếu, **không** phải Lark không hỗ trợ → [connect.md](workflows/connect.md) §4.
- Tìm task = L1, không skill riêng.
- L3 chỉ sau **một** bảng L2 đã OK. Tạo ticket luôn là **hai lệnh** (create rồi patch) — xem [l3-write.md](workflows/l3-write.md).
- Tool đọc trả **rỗng** mà đáng lẽ có dữ liệu ⇒ nghi **hết hạn login OAuth**, không kết luận "không có việc".
- Map `{MOD}-FR-` / `T-NNN` trong bảng; **không** copy body FR.
- Hỏi thiếu một lượt: `tasklist_guid` (nếu không `my_tasks`), `completed`, cửa sổ thời gian, map ID.
- `useUAT: true` khi schema cho phép và việc của chính user.
- (Opt) `memory/lark.json` → `default_tasklist_guid`. Không tự ghi memory.

## Output

- L1: tóm tắt 3–7 bullet + mục mở (+ bảng nếu cần).
- L2: `hành động | tiêu đề | loại | cha | section | due | map ID`.
- L3: `task_guid` từng dòng; nhiều ticket ⇒ bảng `tiêu đề | task_guid | section`.
