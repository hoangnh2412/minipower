---
name: minipower-router-mistake
description: Ghi nhật ký sai lầm/lần thử theo một khuôn chung — Lần, Tiêu chí chưa đạt, Cách xử lý, Kết quả — dùng xuyên các skill thực thi (selfcheck, implement, kế hoạch của router-plan). Dùng khi ghi nhật ký, ghi lại sai lầm, log lần thử khi tự kiểm không đạt — không phải sổ bài học cho chính Minipower (đó là minipower-router-retro/ADR-044).
metadata:
  workflow: github
  version: 0.1.0
---

# minipower-router-mistake

Ghi nhật ký sai lầm/lần thử theo một khuôn chung — dùng xuyên các skill thực thi. Không sinh DOC.

**Pack:** router · **Loại:** skill cross-phase.

Dùng trong [minipower-router-selfcheck](../minipower-router-selfcheck/SKILL.md), [minipower-router-implement](../minipower-router-implement/SKILL.md), hoặc trực tiếp trong kế hoạch của [minipower-router-plan](../minipower-router-plan/SKILL.md) — một khuôn, không mỗi skill bịa bảng riêng.

## Khuôn nhật ký

| Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả |
|---|---|---|---|

Mỗi dòng: lần thử thứ mấy · tiêu chí nào chưa đạt (trích rõ, không mơ hồ) · đã sửa gì · kết quả sau sửa (đạt / còn / dừng + lý do).

## Khi ghi

- Mỗi lần `minipower-router-selfcheck` không đạt.
- Mỗi lần review cuối (trong luồng `minipower-router-plan`) ra finding.
- Bất kỳ lúc một bước thực thi sai, dù không nằm trong vòng tự kiểm chính thức — ghi để không lặp lại trong cùng việc.

## Nơi lưu

Sống trên chat/báo cáo theo mặc định, giống `minipower-router-plan` — không tự ghi file. Người muốn giữ lâu hơn phiên làm việc → người quyết ghi vào `memory/memory.md` hoặc `memory/doc-debt.md`; skill **không** tự ghi file ra ngoài khi chưa được yêu cầu.

## Ranh giới

- Không tự đánh giá đúng/sai thay người khi nguyên nhân mơ hồ — ghi "chưa rõ nguyên nhân", không đoán.
- Không gộp nhật ký của nhiều việc khác nhau vào một bảng.
- **Khác** [ADR-044](../../../../ADRs/doing/ADR-044-2026-10-29-vong-phan-hoi-bai-hoc-github-issue-version-skill.md) (`minipower-router-retro`): ADR-044 bắt bài học khi **một skill của Minipower** (công cụ) làm chưa tốt, gửi về tác giả qua GitHub Issue. Skill này ghi nhật ký lỗi khi **thực thi một việc của dự án đích** — không gửi đi đâu, không đụng version/CHANGELOG của skill nào.

## Anti-patterns

- Ghi mơ hồ ("làm lại", "sửa") không trích tiêu chí/chỗ sai cụ thể.
- Dùng skill này để báo lỗi của chính một skill Minipower — đó là việc của `minipower-router-retro`.

Hướng dẫn người: [README.md](README.md).
