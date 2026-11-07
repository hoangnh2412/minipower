---
name: minipower-vcs-gitlab
description: Tra GitLab (search, issue, pipeline, MR), soạn MR/comment, tạo MR và commit/push sau L2. Dùng khi merge request, GitLab MCP, code_provider gitlab — không scaffold .NET, không force-push.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-vcs-gitlab

SOP mặt **`code`**. Wrap GitLab MCP + git local. Không copy schema. Hướng dẫn người: [README.md](README.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Tìm issue / MR / job log | [workflows/l1-l3.md](workflows/l1-l3.md) — L1 |
| Mở MR, comment, chạy pipeline | L2 → một OK → L3 MCP |
| Commit / push nhánh | L2 diff+message → OK người → git (không MCP) |

`code_provider: local` → không gọi GitLab MCP; git local vẫn theo L2/L3 người.

## Quy tắc cốt lõi

- Server từ `mcp.code` (tên namespace đổi theo máy — Apyylon / Minvoice / Cloud). Discover schema, đừng hardcode prefix tool.
- L1: search, get issue/MR, diffs, pipelines, notes, job log.
- L3 MCP: `create_merge_request`, `create_merge_request_note`, `create_issue`, `manage_pipeline` (Create), `link_work_items` — chỉ dòng còn tick.
- **Cấm** force-push, sửa lịch sử, `--no-verify` trừ khi người ra lệnh đúng từng chữ.
- Commit: người đã đồng ý nội dung hunk + message (quy ước repo Minipower: không tự commit).
- Không đụng skill backend (scaffold/cache) — pack này là kênh VCS.

## Output

- L1: bảng MR/issue + link.
- L2: title/description MR hoặc git message.
- L3: MR iid hoặc SHA.
