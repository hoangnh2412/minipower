# minipower-router-mistake

Ghi nhật ký sai lầm/lần thử theo một khuôn chung, để các skill thực thi không mỗi nơi bịa bảng riêng. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Việc |
|---|---|
| `minipower-router-selfcheck` không đạt tiêu chí | Ghi dòng nhật ký |
| Review cuối trong kế hoạch của `minipower-router-plan` ra finding | Ghi dòng nhật ký |
| Thực thi một bước bị sai, muốn nhớ lại để không lặp | Ghi dòng nhật ký |

**Không dùng cho:** báo lỗi của chính một skill Minipower (công cụ) → [ADR-044 §6](../../../../ADRs/doing/ADR-044-2026-10-29-vong-phan-hoi-bai-hoc-github-issue-version-skill.md) / `minipower-router-retro`.

## Cách gọi

```text
Lần 1: tiêu chí "mỗi FR có ≥ 1 AC" còn thiếu 3. Đã viết AC theo UC. Còn 1 (FR-007 không có UC gốc).
Ghi nhật ký.
```

## Quy tắc (tóm tắt)

- Một bảng, một khuôn: Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả.
- Không tự ghi ra file — sống trên chat/báo cáo trừ khi người yêu cầu giữ lâu.
- Nguyên nhân mơ hồ → ghi "chưa rõ", không đoán.

## Liên quan

- [minipower-router-selfcheck](../minipower-router-selfcheck/README.md) — nơi gọi skill này khi không đạt
- [minipower-router-implement](../minipower-router-implement/README.md) — nơi gọi skill này khi thực thi sai
- [minipower-router-plan](../minipower-router-plan/README.md) — khuôn nhật ký gốc
- Bản đồ pack: [router/README.md](../../README.md)
