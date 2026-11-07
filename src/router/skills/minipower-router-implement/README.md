# minipower-router-implement

Thực thi một task đã rõ theo chiến lược tiết kiệm token: chọn model, làm, tự kiểm, ghi nhật ký khi sai. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Việc |
|---|---|
| Router đã triage ra một lá cho một việc ĐƠN | Thực thi theo khung này |
| Một task trong kế hoạch đã OK của `minipower-router-plan` | Thực thi task đó theo khung này |

**Không dùng cho:** lập kế hoạch nhiều task → [minipower-router-plan](../minipower-router-plan/README.md) · chọn lá nghề nào xử lý việc → [minipower-router](../minipower-router/README.md).

## Cách gọi

```text
Task: viết AC cho FR-012 theo template DOC-07. Thực thi tiết kiệm token, tự kiểm theo tiêu chí mỗi FR có ≥ 1 AC.
```

## Quy tắc (tóm tắt)

- Chọn model trước khi làm ([minipower-router-model](../minipower-router-model/README.md)), không mặc định model mạnh nhất.
- Tự kiểm sau mỗi bước ([minipower-router-selfcheck](../minipower-router-selfcheck/README.md)), ghi nhật ký khi sai ([minipower-router-mistake](../minipower-router-mistake/README.md)).
- Không tự spawn agent khác thay người — chỉ mô tả cách một agent tự thực thi tiết kiệm.

## Liên quan

- [minipower-router-model](../minipower-router-model/README.md) · [minipower-router-selfcheck](../minipower-router-selfcheck/README.md) · [minipower-router-mistake](../minipower-router-mistake/README.md) — ba skill được gọi trong lúc thực thi
- [minipower-router-plan](../minipower-router-plan/README.md) — nơi task này có thể bắt nguồn
- Bản đồ pack: [router/README.md](../../README.md)
