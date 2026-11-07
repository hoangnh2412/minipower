---
name: minipower-router-model
description: Chọn model phù hợp cho một việc/skill cụ thể theo độ phức tạp, tiết kiệm ngân sách token — việc đơn giản dùng model rẻ, việc ảnh hưởng nhiều/rủi ro cao dùng model mạnh, nêu lý do khi chọn model đắt. Dùng khi chọn model, tiết kiệm token, phân bổ model theo task — không tự chốt model cho việc ảnh hưởng lớn mà không giải trình.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-router-model

Chọn model theo việc, không theo thói quen. Verdict cuối do **người** khi chọn model đắt cho việc ảnh hưởng lớn.

**Pack:** router · **Loại:** skill cross-phase · **Không** sinh DOC — sinh *gợi ý model + lý do*.

Dùng trước khi [minipower-router-implement](../minipower-router-implement/SKILL.md) thực thi một task, hoặc bất cứ lúc nào cần quyết model cho một việc cụ thể.

## Bậc phức tạp → bậc model

| Loại việc | Ví dụ | Bậc model gợi ý |
|---|---|---|
| Đọc/tóm tắt/tra file, format câu chữ, việc lặp đơn giản | tóm tắt log, đổi tên biến, liệt kê file | Rẻ/nhanh |
| Sinh/soát code vừa, viết DOC theo template có sẵn, review theo checklist | scaffold CRUD, điền DOC-06 | Trung |
| Kiến trúc mới, quyết định ảnh hưởng ≥ 2 module/baseline, review sâu nhiều file, debug khó | SAD, đổi hợp đồng H-boundary, điều tra lỗi lan | Mạnh nhất |

## Nêu lý do khi chọn đắt

Chọn model mạnh cho việc nhìn tưởng đơn giản, hoặc việc ảnh hưởng ≥ 2 pack/đụng baseline → nêu lý do một dòng để người xác nhận trước khi dùng, nếu chi phí token là mối quan tâm của dự án.

## Ranh giới

- Không tự đổi model giữa một task đang chạy nếu không có lý do mới.
- Không quyết thay người về ngân sách token tổng của dự án — chỉ gợi ý theo từng việc.
- Gate mềm: không hook nào chặn, chỉ advisory.

## Anti-patterns

- Dùng model mạnh nhất cho mọi việc "để chắc ăn".
- Dùng model rẻ cho việc đụng baseline/ảnh hưởng nhiều module.

Hướng dẫn người: [README.md](README.md).
