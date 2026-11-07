# minipower-toolbox-skill-author

Skill để **viết và soát skill Minipower**. Agent đọc [SKILL.md](./SKILL.md); giải phẫu đầy đủ ở [reference/anatomy.md](./reference/anatomy.md).

> File này trước 2026-08-28 là `fundamentals/template-skill.md` — một tài liệu chỉ nói về skill .NET/Jarvis, chỉ có tác dụng khi có người nhớ mở nó, và có 6 link trỏ `.opencode/` đã chết. Nay là skill: tự kích hoạt khi cần, phủ **mọi** module lá-rời, và phần kiểm được thì có test canh.

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Chưa có skill cho việc này | [workflows/new-skill.md](./workflows/new-skill.md) |
| Thêm provider / pattern / workflow / template vào skill có sẵn | [workflows/extend-skill.md](./workflows/extend-skill.md) |
| Nghi một skill cũ lệch chuẩn | [workflows/extend-skill.md § Soát skill có sẵn](./workflows/extend-skill.md#soát-skill-có-sẵn) |
| Muốn mở **module** mới, không phải skill | [workflows/new-skill.md § Module mới](./workflows/new-skill.md#module-mới) — cần ADR trước |
| Nâng skill từ GitHub Issue nhãn `lesson` (ADR-044) — chủ repo chạy định kỳ hoặc gọi tay | [workflows/upgrade-from-lesson.md](./workflows/upgrade-from-lesson.md) |

**Không dùng cho:** viết SOP dispatcher/gate (xem [minipower-router](../../../router/skills/minipower-router/SKILL.md)) · viết ADR (theo [ADRs/TEMPLATE.md](../../../../ADRs/TEMPLATE.md)) · viết tài liệu nền không phải skill (→ [`staging/`](../../../../staging/), kho tạm đang rút).

Agent **không tự chốt** nội dung skill: nêu phương án, dừng chờ bạn xác nhận, rồi mới ghi file. Đọc/kiểm tra (`npm test`, `link:check`) thì làm luôn.

## Vì sao là skill chứ không phải một file template

Vì phần lớn lỗi khi viết skill **không** nằm ở chỗ quên khung file — nó nằm ở `description`. Skill lá-rời được chọn bằng `description`; viết mơ hồ là skill không bao giờ chạy, và **không test nào bắt được**. Một file template nằm im trong kho tạm không cứu được việc đó; một skill tự kích hoạt lúc bạn đang tạo skill thì có.

Skill này chia việc làm hai tầng, không giả vờ tầng nào là tầng kia:

| | Ai gác | Sai thì sao |
|---|---|---|
| **Cứng** — `name` ≡ thư mục · kebab ≤64 · có `description` · dòng trong bảng hub · link không gãy | `{module}-pack.test.js` + `link:check` trong CI | `npm test` **đỏ** |
| **Mềm** — `description` có kích hoạt đúng lúc không · SKILL.md có ngắn không · có trùng việc skill khác không | Người đọc | Nhắc, người quyết |

## Cách gọi

Không cần nhớ tên — mô tả việc bằng lời:

```text
Tạo skill mới cho việc gửi email hàng loạt bằng Jarvis.Notification
```

```text
Soát lại minipower-ops-metrics xem có lệch chuẩn skill lá-rời không
```

Hoặc gọi thẳng workflow:

```text
@toolbox/skills/minipower-toolbox-skill-author/workflows/new-skill.md

Skill thu thập log từ Loki cho module ops
```

## Ba câu hỏi trước khi tạo bất cứ thứ gì

Hỏi **theo thứ tự**, dừng ở câu đầu tiên trả lời *có* (ADR-022 QĐ-7):

1. Tác động lên chính tài liệu / pipeline `sdlc` sở hữu? → skill core trong `sdlc/`, không phải lá-rời.
2. Gắn framework/stack có vòng đời riêng, hoặc người dùng khác hẳn? → **module mới** (kèm ADR + `PACK.md` + hub + test).
3. Chỉ là một năng lực của skill đã có? → `workflows/` hoặc `providers/` bên trong skill đó.

Không câu nào *có* → skill lá mới trong module đã có.

## Templates

Copy rồi thay placeholder:

| Template | Thành file |
|---|---|
| [templates/SKILL.md.tpl](./templates/SKILL.md.tpl) | `SKILL.md` |
| [templates/README.md.tpl](./templates/README.md.tpl) | `README.md` |
| [templates/workflow-init.md.tpl](./templates/workflow-init.md.tpl) | `workflows/init.md` |
| [templates/workflow-add.md.tpl](./templates/workflow-add.md.tpl) | `workflows/add.md` |
| [templates/provider-SKILL.md.tpl](./templates/provider-SKILL.md.tpl) | `providers/<name>/SKILL.md` |

Đuôi `.tpl` là cố ý: `link:check` quét mọi `.md` trong repo, mà template chứa link placeholder (`providers/<name>/SKILL.md`) không trỏ file thật.

## Lệnh kiểm

```bash
cd src/router/hooks && npm test && npm run link:check
```

## Liên quan

- Hub module: [backend/README.md](../../../backend/README.md) · [ops/README.md](../../../ops/README.md) · [toolbox/README.md](../../README.md)
- Quy ước đặt tên & thư mục toàn repo: [AGENTS.md](../../../../AGENTS.md)
- Schema `PACK.md` khi mở module mới: [contracts/pack-manifest.md](../../../../contracts/pack-manifest.md)
