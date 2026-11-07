---
name: minipower-frontend-plan-react
description: Breakdown kỹ thuật frontend React (feature/page/component) cho một module, gắn độ phức tạp và trace {MOD}-UC-*/{MOD}-FR-*/{MOD}-AC-*. Dùng khi PM cần input kỹ thuật frontend để lập WBS/Story Point — không gán Story Point cuối, không tạo ticket, không quyết cây import/folder.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-frontend-plan-react

Breakdown kỹ thuật frontend (kit `@platform/core`) cho một module/feature React — input bổ sung (không bắt buộc) cho PM lập WBS ([minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md)). Không thay luật cây feature/import ([minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)) hay quy ước coding ([minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md)) — đầu việc breakdown ra khi thành code thật vẫn đi qua hai lá đó.

Hướng dẫn người: [README.md](README.md).

## Input

- UC/FR/AC của module đang bàn giao: `{MOD}-UC-*`, `{MOD}-FR-*`, `{MOD}-AC-*`.
- DOC-12 (API spec) + DOC-19 (prototype/UI) nếu đã có — thiếu thì ghi `TBD`, không bịa.

## Việc làm

1. Theo lát cắt dọc của feature, liệt kê đầu việc frontend cần có: page · component · hook · service · form. Tên đầu việc là **danh từ sản phẩm** (`Màn danh sách Employee`, `Form tạo Retry Policy`) — không dùng động từ thuần (`viết`, `code`, `fix`).
2. Mỗi đầu việc gắn: mô tả ngắn · tín hiệu độ phức tạp (**nhỏ/vừa/lớn** — tín hiệu riêng cho từng đầu việc, khác rubric 5 chiều của PM dùng cho cả module: [complexity-rubric.md](../../../pm/skills/minipower-pm-plan/complexity-rubric.md)) · trace `{MOD}-UC-*`/`{MOD}-FR-*`/`{MOD}-AC-*`.
3. FR/UC nào chưa có AC tương ứng → ghi rõ, không tự bịa AC.

## Không làm

- Không gán Story Point cuối cùng — PM quyết, quy đổi theo velocity team.
- Không tạo ticket/task board (đó là kênh `tasks/`).
- Không quyết định cây feature/folder/hướng import (`minipower-frontend-architecture-react`).
- Không viết code, không sinh DOC mới.

## Output bắt buộc

Bảng, súc tích, PM ghép trực tiếp vào WBS:

| Đầu việc | Mô tả ngắn | Độ phức tạp | Trace UC/FR/AC |
|---|---|---|---|

Dòng cuối: tổng số đầu việc + danh sách FR/UC chưa có AC (nếu có).
