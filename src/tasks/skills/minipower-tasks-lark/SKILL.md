---
name: minipower-tasks-lark
description: Đọc, lọc, tìm, soạn nháp và ghi task Lark (tasklist / task) theo L1–L3. Dùng khi việc trên Lark, sprint, tasklist, "tìm task", "tạo task", tasks_provider lark — không dùng cho tin nhắn nhóm hay wiki.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-tasks-lark

SOP MCP mặt **`tasks`**, provider Lark. Wrap tool, không copy schema API. Người: [README.md](README.md). Persona: [agents/minipower-tasks-lark.md](../../agents/minipower-tasks-lark.md). Cổng L1–L3: [rules/l1-l2-l3-tasks.md](../../rules/l1-l2-l3-tasks.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Tìm / lọc / tóm tắt / việc tôi / quá hạn | [workflows/l1-read.md](workflows/l1-read.md) |
| Đề xuất tạo / sửa due / hoàn thành | [workflows/l2-preview.md](workflows/l2-preview.md) → OK → [workflows/l3-write.md](workflows/l3-write.md) |

**Không dùng** cho IM, wiki, Bitable, Outline, OpenProject.

## Quy tắc cốt lõi

- `memory/profile.json` → `tasks_provider`. Khác `lark` → **dừng**, không gọi MCP Lark. `none` → artifact SQLite (không MCP). `openproject` → lá kia, không skill này. Đổi provider → người `minipower init`.
- MCP `mcp.tasks` (thường `user-lark-mcp`). Thiếu server / `needsAuth` → `mcp_auth` một lần; vẫn lỗi → dừng + README cài.
- Schema tool **đầu phiên**. Tên hay gặp: `task_v2_task_list`, `task_v2_task_get`, `task_v2_tasklist_list`, `task_v2_tasklist_tasks`. **Không** bịa `task_create` / `task_search`.
- Tìm task = L1, không skill riêng.
- L3 chỉ sau **một** bảng L2 đã OK. Không có tool ghi → L3 = hướng dẫn tay.
- Map `{MOD}-FR-` / `T-NNN` trong bảng; **không** copy body FR.
- Hỏi thiếu một lượt: `tasklist_guid` (nếu không `my_tasks`), `completed`, cửa sổ thời gian, map ID.
- `useUAT: true` khi schema cho phép và việc của chính user.
- (Opt) `memory/lark.json` → `default_tasklist_guid`. Không tự ghi memory.

## Output

- L1: tóm tắt 3–7 bullet + mục mở (+ bảng nếu cần).
- L2: `hành động | tiêu đề | due | list | map ID`.
- L3: id MCP **hoặc** “chưa ghi — MCP không có tool”.
