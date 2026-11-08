# minipower-router-model

Gợi ý model phù hợp cho một việc cụ thể theo độ phức tạp, để không mặc định dùng model mạnh nhất cho mọi task. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Việc |
|---|---|
| Trước khi thực thi một task qua `minipower-router-implement` | Chọn model cho task đó |
| Phân vân nên dùng model rẻ hay mạnh cho một việc cụ thể | Tra bảng bậc phức tạp |

**Không dùng cho:** lập kế hoạch nhiều task → [minipower-router-plan](../minipower-router-plan/README.md) · tự kiểm kết quả → [minipower-router-selfcheck](../minipower-router-selfcheck/README.md).

## Cách gọi

Mô tả việc cần làm, để skill gợi ý bậc model:

```text
Việc: viết AC cho FR-012 theo template có sẵn. Chọn model nào?
```

## Quy tắc (tóm tắt)

- Việc đơn giản/lặp → model rẻ. Việc ảnh hưởng nhiều module/baseline → model mạnh.
- Chọn model đắt cho việc tưởng đơn giản phải nêu lý do.
- Gate mềm — không chặn máy, người quyết cuối khi có tranh cãi.

## Liên quan

- [minipower-router-implement](../minipower-router-implement/README.md) — nơi gọi skill này trước khi thực thi
- Bản đồ pack: [router/README.md](../../README.md)
