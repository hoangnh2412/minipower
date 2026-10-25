---
name: minipower-architecture-tenant-org
description: Phân loại mô hình khách vào Root, Tenant, Org và OrgStructure của Jarvis. Dùng khi triển khai hệ thống mới, mô tả chi nhánh, đại lý, phòng ban, khách xuất hóa đơn, multi-tenant, multi-org, tenant con.
metadata:
  workflow: github
---

# Phân cấp Tenant / Org / OrgStructure — Orchestrator

Người mô tả mô hình kinh doanh. Skill xếp từng thành phần vào đúng lớp Jarvis rồi đưa sơ đồ cây. Không viết code và không sửa ADR trong lượt phân loại.

Hướng dẫn người: [README.md](README.md). Các bước: [workflows/classify.md](workflows/classify.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Triển khai hệ thống mới, cần xếp chi nhánh, đại lý, phòng ban, khách xuất hóa đơn | [workflows/classify.md](workflows/classify.md) |

## Quy tắc cốt lõi

- Một node chỉ tạo node ở cấp kế dưới: Root tạo Tenant, Tenant tạo Tenant con hoặc Org, Org tạo OrgStructure.
- Node tự tạo Org cho khách là Tenant (có thể là Tenant con). OrgStructure không tạo Org.
- Org là người bán trên hóa đơn. Org không có cha.
- Phòng ban luôn là OrgStructure của đúng Org đó.
- Chi nhánh chỉ là OrgStructure khi hóa đơn vẫn thuộc Org cha và chi nhánh không tạo Org khách (mẫu VNA).

## Output bắt buộc

- Bảng từng thành phần người nêu: tên, lớp, Tenant cha hoặc Org cha.
- Sơ đồ cây chữ.
- Danh sách điểm còn thiếu để xếp (ai đứng tên trên hóa đơn, ai tạo Org khách). Không bịa khi chưa đủ.
