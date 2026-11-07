---
name: minipower-frontend-form-react
description: Form theo kit @platform/core — Zod schema + *FormDefaultValues + map entity→form ở validation/, hook use{Feature}Form (react-hook-form + zodResolver, mode onChange), component form chỉ có trường nhận register/control/errors, Controller cho FieldSelect/SearchableSelect/KitDatePicker/ToggleSwitch/PasswordInput, submit qua handleAction + notify. Dùng khi thêm form tạo/sửa, thêm validation hoặc trường bắt buộc, chọn ngày / chọn bản ghi liên kết, form trong dialog, hoặc form sửa không nạp dữ liệu cũ.
metadata:
  workflow: github
  version: 1.0.0
---

# Form (@platform/core) — Orchestrator

Skill sở hữu ba mảnh của một form: **schema** (`validation/`) · **hook** (`hooks/use{Feature}Form`) · **component trường** (`components/{Feature}Form`). Ai submit, gọi API nào, đi đâu sau khi lưu — thuộc page / dialog ([crud](../minipower-frontend-crud-react/SKILL.md)).

Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Thêm form mới hoặc thêm trường vào form có sẵn | [workflows/add-form.md](workflows/add-form.md) |
| Trường là select / chọn bản ghi / ngày / giờ / bật-tắt / mật khẩu | [reference/controls.md](reference/controls.md) |

## Luồng một form

```text
validation/{feature}.ts   schema Zod · {Feature}FormData = z.infer · {feature}FormDefaultValues · to{Feature}FormValues(entity)
        │
hooks/use{Feature}Form    useForm({ resolver: zodResolver(schema), mode: 'onChange', defaultValues })
        │  register · control · errors
components/{Feature}Form  chỉ trường + lỗi — KHÔNG submit, KHÔNG gọi API
        │
page / dialog             handleSubmit(data ⇒ handleAction({ defaultSubmit: map form → payload → call* }))
```

## Quy tắc cốt lõi

- **Ràng buộc khớp backend.** `min`/`max`/bắt buộc lấy từ DOC-12 / DOC-11 — form cho qua mà API trả 400 là lỗi của schema. Thiếu số liệu ⇒ hỏi, đừng tự đặt.
- **Message lỗi tiếng Việt ngay trong schema** — hiện thẳng dưới trường, không dịch lại ở component.
- **Kiểu form ≠ kiểu payload.** Map tường minh trong `defaultSubmit` (sửa thường không gửi `status`); map ngược bằng `to{Feature}FormValues`.
- **Ô tuỳ chọn trống → `null`** (`setValueAs`) — backend .NET nhận `null`, không nhận `''`.
- **Input gốc dùng `register`; control khác bọc `Controller`** — đúng giá trị dây của control ([reference/controls.md](reference/controls.md)). Ngày không giờ giữ chuỗi `'YYYY-MM-DD'`.
- **Sửa: nạp dữ liệu rồi `reset`.** `defaultValues` của `useForm` chỉ đọc lần đầu — dữ liệu về sau phải `reset({ ...defaults, ...values })`. Tham chiếu `defaultValues` truyền vào page phải **ổn định**, không thì form reset mỗi lần render.
- **Form trong dialog dùng MỘT instance** — `reset(defaults)` khi mở tạo, `reset(to{Feature}FormValues(item))` khi mở sửa.
- **Submit**: `<form noValidate>`, nút `disabled={isSubmitting}`, lỗi API ⇒ `notify.error(getErrorMessage(error, …))`.

## Templates

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

| Template | Đích |
|---|---|
| [templates/validation/{feature}.ts](templates/validation/{feature}.ts) | `src/features/{feature}/validation/{feature}.ts` |
| [templates/validation/index.ts](templates/validation/index.ts) | `validation/index.ts` |
| [templates/hooks/use{Feature}Form.ts](templates/hooks/use{Feature}Form.ts) | `hooks/use{Feature}Form.ts` |
| [templates/hooks/index.ts](templates/hooks/index.ts) | `hooks/index.ts` |
| [templates/components/{Feature}Form/](templates/components/{Feature}Form/) | `components/{Feature}Form/` |

Class trường (`fieldInputClass`…) từ `components/fieldStyles.ts` — template của [convention](../minipower-frontend-convention-react/templates/fieldStyles.ts).

## Tham chiếu

- [reference/controls.md](reference/controls.md) — bảng control → giá trị dây → Zod → cách gắn, kèm đoạn mẫu. Không load mặc định.

## Output bắt buộc

- Schema, kiểu, mặc định, mapper ở `validation/`; component form không import `services/` (lint R6)
- `npm run typecheck` + `npm run lint` xanh
- Chạy thật: submit form trống hiện lỗi dưới từng trường bắt buộc; mở form sửa thấy dữ liệu cũ; lưu xong có toast
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md); file đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Page / dialog sở hữu submit: [minipower-frontend-crud-react](../minipower-frontend-crud-react/README.md)
- Kiểu payload theo DOC-12: [minipower-frontend-api-react](../minipower-frontend-api-react/README.md)
