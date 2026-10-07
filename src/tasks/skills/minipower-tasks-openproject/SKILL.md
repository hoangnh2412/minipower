---
name: minipower-tasks-openproject
description: Đọc, lọc, tìm, soạn nháp và ghi work package OpenProject theo L1–L3; hướng dẫn cài MCP nếu chưa kết nối. Dùng khi việc trên OpenProject, work package, WP, tasks_provider openproject — không dùng cho Outline hay GitLab.
metadata:
  workflow: github
---

# minipower-tasks-openproject

SOP MCP mặt **`tasks`**, provider OpenProject. Wrap tool, không copy schema API. Người: [README.md](README.md). Persona: [agents/minipower-tasks-openproject.md](../../agents/minipower-tasks-openproject.md). Cổng L1–L3: [rules/l1-l2-l3-tasks.md](../../rules/l1-l2-l3-tasks.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| MCP chưa có / lỗi / `needsAuth` | [workflows/connect.md](workflows/connect.md) |
| Tìm / lọc / tóm tắt / WP #n / project | [workflows/l1-read.md](workflows/l1-read.md) |
| Đề xuất tạo / sửa WP | [workflows/l2-preview.md](workflows/l2-preview.md) → OK → [workflows/l3-write.md](workflows/l3-write.md) |

**Không dùng** cho Outline, GitLab MR, Lark, sửa `docs/` FR.

## Quy tắc cốt lõi

- `memory/profile.json` → `tasks_provider`. Khác `openproject` → **dừng**, không gọi MCP OpenProject. `none` → SQLite artifact. Đổi provider → `minipower init`.
- **Đầu phiên:** `GetDynamicTools` namespace `profile.mcp.tasks`. Không thấy / lỗi / `needsAuth` → [connect.md](workflows/connect.md), không bịa dữ liệu WP.
- Schema tool = SSOT runtime. Tên hay gặp: `search_work_packages`, `get_work_package`, `search_projects`, `create_work_package`, `update_work_package` — **chỉ gọi tên có trong catalog**.
- Tìm WP = L1, không skill riêng.
- L3 chỉ sau **một** bảng L2 đã OK. Không có tool ghi → L3 = hướng dẫn tay trên OpenProject.
- Map `{MOD}-FR-` / `T-NNN` trong bảng; **không** copy body FR vào mô tả WP.
- Hỏi thiếu một lượt: `project` (id hoặc tên), trạng thái, assignee, cửa sổ thời gian, từ khóa, map ID Minipower.
- (Opt) `memory/openproject.json` → `default_project_id`. Không ghi API token vào file git.
- Back-ref `memory/memory.md` **chỉ khi** người yêu cầu một dòng.

## Output

- Connect: snippet `mcp.json` + checklist reload + kết quả smoke (PASS/FAIL).
- L1: tóm tắt 3–7 bullet + mục mở (+ bảng nếu cần).
- L2: `hành động | subject | type/status | project | map ID | ghi chú`.
- L3: id WP MCP **hoặc** “chưa ghi — MCP không có tool”.
