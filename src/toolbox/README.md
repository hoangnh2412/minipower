# toolbox — công cụ làm ra chính Minipower

Module skill cho **maintainer repo minipower**: dựng skill mới, mở module mới, soát skill có sẵn cho đúng chuẩn. Đây là đồ nghề **để làm ra các module khác** — nó không phục vụ dự án đích, không nằm trên spine H1–H6, và không được publish sang repo product.

Skill là **lá-rời** — mô tả việc bằng lời (*"tạo skill cho việc gửi email"*) là skill tự kích hoạt, không cần nhớ tên.

Manifest máy-đọc: [PACK.md](PACK.md).

## Skill

| Skill | Tài liệu | Việc |
|---|---|---|
| **minipower-toolbox-skill-author** | [skills/minipower-toolbox-skill-author/README.md](./skills/minipower-toolbox-skill-author/README.md) | Viết và soát skill lá-rời Minipower — chọn module, dựng cây file, đặt `description` kích hoạt được, cập nhật hub + test |
| **minipower-toolbox-backlog** | [skills/minipower-toolbox-backlog/README.md](./skills/minipower-toolbox-backlog/README.md) | Tạo và quản lý issue của chính repo Minipower theo khuôn riêng — form và nhãn đọc sống, ghi qua `minipower-tasks-github` |

## Sẽ có — viết dần, không tạo folder rỗng (ADR-022 QĐ-7 luật 2)

| Skill dự kiến | Việc |
|---|---|
| `minipower-toolbox-adr` | Viết ADR theo `ADRs/TEMPLATE.md` + cập nhật index trong cùng commit |
| `minipower-toolbox-module` | Mở module mới trọn gói: folder + `PACK.md` + hub README + test canh + bản đồ repo |

Chưa có nội dung thật thì **chưa tạo thư mục** — hai dòng trên là ý định, không phải cam kết.

## Ranh giới — cái gì KHÔNG vào đây

| Việc | Thuộc về |
|---|---|
| Skill tác động lên tài liệu/pipeline dự án đích (DOC, trace, gate) | [`router/`](../router/README.md) — dispatcher + hooks |
| Skill dựng code .NET | [`backend/`](../backend/README.md) |
| Skill vận hành hạ tầng | [`ops/`](../ops/README.md) |
| Kiến thức nền đọc-để-hiểu (DDD, testing, clean architecture) | [`staging/`](../../staging/) — tài liệu chờ chuẩn hoá, không phải skill |

Phép thử: *skill này có được cài vào workspace dự án khách hàng không?* Có → không thuộc `toolbox`.

## Cài vào Cursor

Chỉ cài **trong workspace repo minipower** — đây là đồ nghề nội bộ.

```bash
# chạy từ root repo minipower
mkdir -p .cursor/skills
for d in toolbox/skills/*/; do
  ln -snf "$PWD/$d" ".cursor/skills/$(basename "$d")"
done

# kiểm tra
test -f .cursor/skills/minipower-toolbox-skill-author/SKILL.md && echo OK
```

Không rsync `toolbox/` sang `{product}-backend/.opencode/` — repo product không tạo skill minipower.

## Liên quan

- Bản đồ Minipower: [README.md](../../README.md)
- Quy ước đặt tên & thư mục: [AGENTS.md](../../AGENTS.md)
- Quyết định mở module này: `ADR-027` (xem [ADRs/README.md](../../ADRs/README.md))
