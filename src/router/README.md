# router — dispatcher

Pack **dispatcher** (ADR-033 QĐ-1/QĐ-14 · ADR-043): triage đơn hay phức, gợi ý một lá cho mỗi task; không agent bàn giao agent. Init = CLI `minipower init`, không phỏng vấn LLM. Hook máy neo `src/router/hooks/` (ADR-037).

Manifest: [PACK.md](PACK.md).

## Skill

| Skill | Tài liệu | Việc |
|---|---|---|
| **minipower-router** | [skills/minipower-router/README.md](./skills/minipower-router/README.md) | Intent → triage → một lá cho mỗi task; không agent bàn giao agent |
| **minipower-router-plan** | [skills/minipower-router-plan/README.md](./skills/minipower-router-plan/README.md) | Yêu cầu PHỨC → kế hoạch có tiêu chí đo được, người OK một lần, tự kiểm ≤ 3 lần, review ≤ 3 vòng |
| **minipower-router-init** | [skills/minipower-router-init/README.md](./skills/minipower-router-init/README.md) | Nhắc CLI `minipower init`; đã có marker thì không hỏi lại |
| **minipower-router-deliberation** | [skills/minipower-router-deliberation/README.md](./skills/minipower-router-deliberation/README.md) | Premise gate mềm PROCEED/RESHAPE/STOP |
| **minipower-router-readiness** | [skills/minipower-router-readiness/README.md](./skills/minipower-router-readiness/README.md) | Soát tiền đề trước thực thi, hỏi một lượt |
| **minipower-router-retro** | [skills/minipower-router-retro/README.md](./skills/minipower-router-retro/README.md) | Bắt bài học "làm chưa tốt" → sổ dự án + nháp GitHub Issue ẩn danh, người OK rồi mới đăng |
| **minipower-router-model** | [skills/minipower-router-model/README.md](./skills/minipower-router-model/README.md) | Chọn model theo độ phức tạp việc, tiết kiệm token |
| **minipower-router-selfcheck** | [skills/minipower-router-selfcheck/README.md](./skills/minipower-router-selfcheck/README.md) | Tự kiểm một bước theo AC, tối đa 3 lần thử |
| **minipower-router-mistake** | [skills/minipower-router-mistake/README.md](./skills/minipower-router-mistake/README.md) | Ghi nhật ký sai lầm/lần thử theo khuôn chung |
| **minipower-router-implement** | [skills/minipower-router-implement/README.md](./skills/minipower-router-implement/README.md) | Thực thi một task tiết kiệm token: chọn model → làm → tự kiểm → ghi nhật ký |

## Tài liệu

- [docs/router-and-skills.md](docs/router-and-skills.md) — router, hook, phụ thuộc skill & handoff pack

## Hook (Đợt D2 — luật; máy còn ở sdlc/hooks)

- [rules/dispatch.md](rules/dispatch.md) · [rules/identity.md](rules/identity.md) · [rules/l3.md](rules/l3.md)
- [hooks/face-mismatch.md](hooks/face-mismatch.md) — L3 lệch provider → dừng (QĐ-6)

