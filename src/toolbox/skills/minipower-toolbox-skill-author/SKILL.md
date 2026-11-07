---
name: minipower-toolbox-skill-author
description: Viết và soát skill lá-rời Minipower (minipower-{module}-{capability}) — chọn module bằng 3 câu hỏi ADR-022, dựng cây SKILL.md/README.md/workflows/providers, đặt description kích hoạt được, cập nhật hub và test canh. Hỏi người xác nhận trước mọi quyết định, không tự chốt. Dùng khi tạo skill mới, thêm provider/pattern/workflow, mở module mới, hoặc soát skill có sẵn lệch chuẩn.
metadata:
  workflow: github
  version: 1.1.0
---

# Viết skill Minipower — Orchestrator

Skill lá-rời sống nhờ `description`: người dùng mô tả việc bằng lời, loader chọn skill. Một skill có `description` mơ hồ là skill **không bao giờ được gọi** — dù ruột đúng hết. Đó là lỗi đắt nhất khi viết skill, và không máy nào bắt được.

Phạm vi: **skill lá-rời trong module** (`backend/` · `ops/` · `toolbox/` · module mới). Skill nội bộ `sdlc/` đi qua router — luật khác, xem [reference/anatomy.md § sdlc khác gì](reference/anatomy.md#sdlc-khác-gì).

Hướng dẫn người: [README.md](README.md) · giải phẫu đầy đủ: [reference/anatomy.md](reference/anatomy.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Chưa có skill cho việc này | [workflows/new-skill.md](workflows/new-skill.md) |
| Đã có skill, thêm provider / pattern / workflow / template | [workflows/extend-skill.md](workflows/extend-skill.md) |
| Skill có sẵn lệch chuẩn (thiếu README, `description` mơ hồ, SKILL.md phình) | [workflows/extend-skill.md § Soát skill có sẵn](workflows/extend-skill.md#soát-skill-có-sẵn) |
| Nâng skill từ GitHub Issue nhãn `lesson` (ADR-044) | [workflows/upgrade-from-lesson.md](workflows/upgrade-from-lesson.md) |

## Gate người — xác nhận trước khi viết

AI chuẩn bị phương án; người xác nhận rồi mới ghi. **Không tự quyết định** bất kỳ nội dung nào của skill đang viết/soát: lọc 3 câu hỏi, tên, `description`, câu chữ, chỗ đặt, cây file, new vs extend, mở module, sửa gì / không sửa gì.

- Gom **mọi quyết định còn mở của lượt đó** thành một lần hỏi — không nhỏ giọt.
- Nêu đề xuất; nếu hơn một cách hiểu thì liệt kê hết, không tự chọn. Dừng. Chờ xác nhận. Rồi mới làm bước tiếp.
- Đã xác nhận thì không hỏi lại cùng nội dung, trừ khi thông tin mới đảo phương án.
- Đọc file, đối chiếu chuẩn, chạy `npm test` / `link:check` — không cần hỏi. **Ghi hoặc đổi file skill** thì phải đã được xác nhận.

## Bước 0 — việc này có đáng một skill riêng không

Ba câu hỏi ADR-022 QĐ-7, hỏi **theo thứ tự**, dừng ở câu đầu tiên trả lời *có*:

| # | Câu hỏi | Kết quả |
|---|---|---|
| 1 | Tác động lên chính tài liệu / pipeline mà minipower sở hữu (DOC, trace, gate)? | Pack nghề (`analyst/` …) hoặc lá `router/` — **không** mặc định lá-rời toolbox |
| 2 | Gắn framework/stack có vòng đời riêng, hoặc người dùng khác hẳn? | **Module mới** ngang hàng — cần ADR + `PACK.md` + hub + test |
| 3 | Chỉ là một năng lực của skill đã có? | `workflows/` hoặc `providers/` **bên trong** skill đó — không tạo skill mới |

Không câu nào *có* → **skill lá mới trong module đã có**.

Hai luật bất biến kèm theo: **tên theo việc nó làm, không theo công cụ** (công cụ là thứ được wrap — `minipower-ops-metrics`, không phải `minipower-ops-grafana`) · **chưa có skill thật thì chưa tạo thư mục module**.

## Quy tắc cốt lõi

- **`name` ≡ tên thư mục lá** — kebab-case, `minipower-{module}-{capability}[-{stack}]`, ≤64 ký tự. Provider con: `<skill-cha>-<provider>`.
- **`description` bắt buộc, và là bề mặt kích hoạt duy nhất** — một câu WHAT + WHEN kèm từ khoá người dùng thật sự gõ (package, API, config key, triệu chứng). Ngôi thứ ba.
  - ✅ `Thiết lập Jarvis.HealthChecks — init liveness/readiness, thêm provider PostgreSQL. Dùng khi /health/ready, healthcheck .NET.`
  - ❌ `Giúp bạn làm healthcheck.` — không có trigger, loader không có gì để khớp.
- **Single-purpose.** Hai việc không liên quan = hai skill. Skill "và" (*"cache và logging"*) là dấu hiệu tách.
- **SKILL.md cho agent · README.md cho người.** Không copy nội dung qua lại — README tóm tắt, link, và nói rõ **khi nào KHÔNG dùng**.
- **SKILL.md là mục lục, không phải sách.** Chi tiết đẩy xuống `workflows/` · `providers/` · `reference/` để agent chỉ load đúng file cần. SKILL.md quá dài là dấu hiệu phải tách (advisory).
- **Hậu tố `-{stack}` chỉ khi thật sự stack-bound.** `minipower-ops-metrics` không mang `-dotnet` vì Grafana/Prometheus không gắn .NET.
- **Vai (role) khai bằng `roles:` trong `PACK.md`, không nhét vào tên skill** (ADR-023 QĐ-4).
- **"Cứng bằng máy, mềm bằng lời."** Trước khi viết chữ *bắt buộc* vào SKILL.md, trả lời được: *cái gì FAIL bằng máy khi người dùng làm sai?* Không trả lời được → viết *khuyến nghị*, nêu lý do, để người quyết.
- **Nguồn chân lý là `{module}/skills/` trong repo minipower.** `.opencode/skills/` chỉ là **đích publish** ở repo product — đừng viết nó thành nguồn.

## Giải phẫu skill lá

```text
{module}/skills/minipower-{module}-{capability}[-{stack}]/
├── SKILL.md          # BẮT BUỘC — orchestrator, agent đọc trước
├── README.md         # BẮT BUỘC — người: khi nào dùng / không dùng, prompt mẫu
├── workflows/        # checklist từng bước; tên theo việc (init · add · setup · scaffold)
├── providers/        # (tuỳ chọn) biến thể atomic — mỗi thư mục một SKILL.md
├── patterns/         # (tuỳ chọn) thay providers khi biến thể là MÔ HÌNH, không phải hạ tầng
├── templates/        # (tuỳ chọn) file copy vào repo đích
├── tools/            # (tuỳ chọn) script chạy được (khuôn minipower-ops-metrics)
└── reference/        # (tuỳ chọn) doc dài, không load mặc định
```

Chỉ tạo thư mục khi đã có nội dung thật — thư mục rỗng là lời hứa, không phải cấu trúc.

⚠️ **File trong `templates/` chứa link giả** (`providers/<name>/SKILL.md`) **không được đặt đuôi `.md`** — `link:check` quét mọi `.md` trong repo và sẽ báo gãy. Dùng `.tpl` · `.cs` · `.json` · `.xml`.

## Templates

Copy rồi thay placeholder — đừng viết lại khung từ đầu:

| Template | Thành file |
|---|---|
| [templates/SKILL.md.tpl](templates/SKILL.md.tpl) | `SKILL.md` |
| [templates/README.md.tpl](templates/README.md.tpl) | `README.md` |
| [templates/workflow-init.md.tpl](templates/workflow-init.md.tpl) | `workflows/init.md` |
| [templates/workflow-add.md.tpl](templates/workflow-add.md.tpl) | `workflows/add.md` |
| [templates/provider-SKILL.md.tpl](templates/provider-SKILL.md.tpl) | `providers/<name>/SKILL.md` |
| [templates/CHANGELOG.md.tpl](templates/CHANGELOG.md.tpl) | `CHANGELOG.md` (mọi lá — ADR-044 §8.1) |

## Tham chiếu

- [reference/anatomy.md](reference/anatomy.md) — phân vai từng file, `providers/` vs `patterns/`, skill mẫu theo độ phức tạp, `sdlc` khác gì, map từ template một-file cũ (Purpose/Role/Process). Không load mặc định.

## Output bắt buộc

Phần **máy kiểm được** — chạy trong `src/router/hooks/`:

```bash
npm test              # {module}-pack.test.js: name ≡ thư mục · description tồn tại · bảng hub khớp
npm run link:check    # 0 link gãy MỚI
```

- `SKILL.md` có frontmatter `name` ≡ tên thư mục lá và `description` không rỗng
- `README.md` tồn tại
- Bảng skill trong `{module}/README.md` có dòng `**{tên-skill}**` + link `skills/{tên-skill}/README.md`
- **Module mới** còn phải có: `{module}/PACK.md` đủ trường schema · `{module}-pack.test.js` · dòng trong `README.md` §Minipower có gì + cây thư mục · `AGENTS.md` §Quy ước đặt tên · ADR + dòng index

Phần **người soát** (không máy nào kiểm): `description` có kích hoạt đúng lúc không · SKILL.md có ngắn không · có trùng việc với skill sẵn có không · mọi quyết định đã được người xác nhận trước khi ghi.

## Liên quan

- Hub module: [backend/README.md](../../../backend/README.md) · [ops/README.md](../../../ops/README.md) · [toolbox/README.md](../../README.md)
- Quy ước đặt tên & thư mục toàn repo: [AGENTS.md](../../../../AGENTS.md)
- Hợp đồng liên-module (`PACK.md`): [contracts/pack-manifest.md](../../../../contracts/pack-manifest.md)
