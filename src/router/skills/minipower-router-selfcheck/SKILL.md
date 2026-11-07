---
name: minipower-router-selfcheck
description: Tự kiểm một bước việc đối chiếu tiêu chí hoàn thành (AC) đã có, tối đa 3 lần thử, dừng theo bốn điều kiện cố định. Dùng khi tự kiểm, kiểm theo tiêu chí, kiểm AC sau khi làm xong một bước — không tự nới tiêu chí, không phải review cuối của pack.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-router-selfcheck

Tự kiểm một bước việc đối chiếu tiêu chí hoàn thành đã có — tối đa 3 lần thử. Gate mềm, người quyết khi dừng.

**Pack:** router · **Loại:** skill cross-phase · **Không** sinh DOC — sinh *bảng tự kiểm + verdict đạt/dừng*.

Tách từ cơ chế "Tự kiểm — tối đa 3 lần thử" của [minipower-router-plan](../minipower-router-plan/SKILL.md) để gọi được độc lập ngoài luồng lập kế hoạch nhiều task — ví dụ trong [minipower-router-implement](../minipower-router-implement/SKILL.md), hoặc một việc ĐƠN không qua router-plan.

## Khi nào dùng

Việc đang nằm trong kế hoạch của `minipower-router-plan` → dùng cơ chế tự kiểm **đã có sẵn trong đó**, không cần gọi skill này riêng. Skill này cho việc **ĐƠN**, hoặc khi `minipower-router-implement` cần một khung tự kiểm từng bước.

## Cách làm

Làm xong một bước → đối chiếu từng tiêu chí hoàn thành đã có (do người hoặc kế hoạch đưa ra, không tự bịa) → ghi đạt / chưa. Có tiêu chí chưa đạt → sửa → kiểm lại. **Tối đa 3 lần thử** = lần làm đầu + 2 lần sửa.

## Bốn điều kiện dừng

Gặp một là dừng, báo cáo, không thử tiếp:

| | Điều kiện | Ghi chú |
|---|---|---|
| a | Hết 3 lần vẫn có tiêu chí chưa đạt | Trần |
| b | Thấy **không xử lý được**: thiếu điều kiện cần, ngoài phạm vi, cần quyết định nghiệp vụ, tiêu chí sai | Trình người, không tự đoán |
| c | Hai lần liên tiếp **cùng một cách** xử lý cho cùng tiêu chí | Phán đoán LLM, so với lần trước |
| d | Sửa đòi **ghi ra ngoài** phạm vi việc đang làm, hoặc đụng việc khác | Dừng ngay, không tính lần |

## Nhật ký

Dùng khuôn chung ở [minipower-router-mistake](../minipower-router-mistake/SKILL.md) — bảng Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả.

## Báo cáo khi dừng

Nhật ký + output hiện tại + tiêu chí đã đạt / còn lại + đề xuất cho người.

## Ranh giới

- Không tự nới, không tự thêm/bớt tiêu chí giữa chừng — tiêu chí sai thì báo, không tự sửa.
- Không agent bàn giao agent (ADR-022 QĐ-1) — tự kiểm diễn ra trong chính agent đang làm việc đó.
- Không phải review cuối của pack (`*-review`) — review cuối soi **tổng thể** sau khi việc xong, skill này soi **từng bước** trong lúc làm.

## Anti-patterns

- Thử quá 3 lần.
- Đổi tiêu chí khi thấy khó đạt.
- Ghi "đạt" mà không đối chiếu từng tiêu chí cụ thể.

Hướng dẫn người: [README.md](README.md).
