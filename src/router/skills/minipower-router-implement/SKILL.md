---
name: minipower-router-implement
description: Thực thi một task cụ thể theo chiến lược tiết kiệm token — chọn model trước, làm, tự kiểm theo tiêu chí hoàn thành, ghi nhật ký khi sai. Dùng khi thực thi một task đã rõ, tiết kiệm token lúc làm, thực thi task trong kế hoạch — không tự lập kế hoạch nhiều task, không agent bàn giao agent.
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-router-implement

Thực thi một task theo chiến lược tiết kiệm token — chọn model, làm, tự kiểm, ghi nhật ký khi sai. Gate mềm.

**Pack:** router · **Loại:** skill cross-phase · **Không** sinh DOC riêng — thực thi hộ nội dung của lá nghề được chọn cho task đó.

## Khi nào dùng

Khi đã biết rõ **một** việc cần làm — từ `minipower-router` triage, hoặc một task trong kế hoạch đã OK của [minipower-router-plan](../minipower-router-plan/SKILL.md) — và cần thực thi tiết kiệm token. **Không** dùng để tự lập kế hoạch nhiều task → đó là `minipower-router-plan`.

## Cách làm

1. Gọi [minipower-router-model](../minipower-router-model/SKILL.md) chọn model phù hợp cho việc này trước khi bắt đầu.
2. Đọc đúng SOP/file cần cho đúng lá nghề đang chạy — không mở SOP lá khác "để chắc".
3. Làm.
4. Gọi [minipower-router-selfcheck](../minipower-router-selfcheck/SKILL.md) đối chiếu tiêu chí hoàn thành.
5. Có tiêu chí chưa đạt/sai lầm → gọi [minipower-router-mistake](../minipower-router-mistake/SKILL.md) ghi lại.
6. Đạt → báo kết quả. Dừng theo bốn điều kiện (ở `minipower-router-selfcheck`) → báo cáo, không tự thử tiếp.

## Chiến lược tiết kiệm token

- Chỉ đọc SOP của đúng lá đang chạy, không mở SOP lá khác "để chắc".
- Agent con (nếu có, qua harness) nhận context sạch — không cõng theo lịch sử việc khác.
- Việc đơn giản/lặp lại dùng model rẻ theo gợi ý của `minipower-router-model` — không mặc định model mạnh nhất.
- Không đọc lại file đã đọc trong cùng lượt trừ khi file đã đổi.

## Ranh giới

- **Không phải orchestrator runtime** tự spawn nhiều agent thay người (ADR-022 QĐ-1). Skill này mô tả cách **một** agent đang chạy tự thực thi tiết kiệm — không tự giao task cho agent khác.
- Task nằm trong kế hoạch đã có cơ chế riêng của `minipower-router-plan` → dùng cơ chế đó; skill này cho việc **ĐƠN**, hoặc khi lá nghề/agent đang chạy cần một khung thực thi tiết kiệm + tự kiểm rõ ràng ngoài luồng plan.
- Không tự chọn lá nghề thay router — việc chọn lá vẫn qua `minipower-router`.

## Anti-patterns

- Dùng model mạnh nhất mặc định "cho chắc".
- Bỏ qua tự kiểm vì "chắc đúng rồi".
- Tự thử lại quá 3 lần mà không báo cáo.

Hướng dẫn người: [README.md](README.md).
