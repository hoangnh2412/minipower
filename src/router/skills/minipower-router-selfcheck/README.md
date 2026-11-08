# minipower-router-selfcheck

Tự kiểm một bước việc đối chiếu tiêu chí hoàn thành, tối đa 3 lần thử, dừng đúng lúc thay vì thử vô hạn. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Việc |
|---|---|
| Vừa làm xong một bước, có tiêu chí hoàn thành rõ | Đối chiếu, ghi đạt/chưa |
| `minipower-router-implement` cần khung tự kiểm từng bước | Gọi skill này sau mỗi bước |

**Không dùng cho:** việc đang nằm trong kế hoạch của `minipower-router-plan` → dùng cơ chế tự kiểm sẵn có trong [minipower-router-plan](../minipower-router-plan/README.md) · review tổng thể sau khi xong → lá `*-review` của pack sinh artifact.

## Cách gọi

```text
Vừa viết AC cho FR-012. Tiêu chí: mỗi FR có ≥ 1 AC Given/When/Then; 0 AC mâu thuẫn BR-002.
Tự kiểm theo tiêu chí này.
```

## Quy tắc (tóm tắt)

- Đối chiếu từng tiêu chí, không gộp chung "coi như đạt".
- Tối đa 3 lần thử; gặp 1 trong 4 điều kiện dừng → báo cáo, không thử tiếp.
- Nhật ký theo khuôn chung ở [minipower-router-mistake](../minipower-router-mistake/README.md).

## Liên quan

- [minipower-router-plan](../minipower-router-plan/README.md) — nguồn gốc cơ chế, dùng trực tiếp khi có kế hoạch nhiều task
- [minipower-router-mistake](../minipower-router-mistake/README.md) — khuôn nhật ký dùng chung
- [minipower-router-implement](../minipower-router-implement/README.md) — gọi skill này sau mỗi bước thực thi
- Bản đồ pack: [router/README.md](../../README.md)
