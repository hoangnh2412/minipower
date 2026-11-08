---
name: minipower-backend-plan-dotnet
description: Breakdown kỹ thuật backend .NET (component/entity/handler/API) cho một module/feature, gắn độ phức tạp và trace {MOD}-FR-*/{MOD}-AC-*. Dùng khi PM cần input kỹ thuật backend để lập WBS/Story Point — không gán Story Point cuối, không tạo ticket, không quyết layer/dependency.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-backend-plan-dotnet

Breakdown kỹ thuật backend cho một module/feature .NET — input bổ sung (không bắt buộc) cho PM lập WBS ([minipower-pm-plan](../../../pm/skills/minipower-pm-plan/SKILL.md)). Không thay luật layer/dependency ([minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md)) hay quy ước coding ([minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md)) — đầu việc breakdown ra khi thành code thật vẫn đi qua hai lá đó.

Hướng dẫn người: [README.md](README.md).

## Input

- FR/AC của module đang bàn giao: `{MOD}-FR-*`, `{MOD}-AC-*`.
- DOC-08/DOC-11/DOC-12 nếu đã có (SAD/API spec) — thiếu thì ghi `TBD`, không bịa.

## Việc làm

1. Theo lát cắt dọc của feature, liệt kê đầu việc backend cần có: component · entity · handler · API. Tên đầu việc là **danh từ sản phẩm** (`API /billing/retry`, `Entity RetryPolicy`) — không dùng động từ thuần (`viết`, `code`, `fix`).
2. Mỗi đầu việc gắn: mô tả ngắn · tín hiệu độ phức tạp (**nhỏ/vừa/lớn** — tín hiệu riêng cho từng đầu việc, khác rubric 5 chiều của PM dùng cho cả module: [complexity-rubric.md](../../../pm/skills/minipower-pm-plan/complexity-rubric.md)) · trace `{MOD}-FR-*`/`{MOD}-AC-*`.
3. FR nào chưa có AC tương ứng → ghi rõ, không tự bịa AC.

## Không làm

- Không gán Story Point cuối cùng — PM quyết, quy đổi theo velocity team.
- Không tạo ticket/task board (đó là kênh `tasks/`).
- Không quyết định layer/dependency code (`minipower-backend-architecture-dotnet`).
- Không viết code, không sinh DOC mới.

## Output bắt buộc

Bảng, súc tích, PM ghép trực tiếp vào WBS:

| Đầu việc | Mô tả ngắn | Độ phức tạp | Trace FR/AC |
|---|---|---|---|

Dòng cuối: tổng số đầu việc + danh sách FR chưa có AC (nếu có).
