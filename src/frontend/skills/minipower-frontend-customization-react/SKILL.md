---
name: minipower-frontend-customization-react
description: Tuỳ biến page có sẵn của kit @platform/core (TenantListPage, TenantFormPage, RoleListPage, LoginPage, ImportPage…) mà không fork — slot content (ReactNode hoặc (ctx) => ReactNode với DefaultTable/DefaultContent), callback kiểu jQuery ajax (before/onSubmit/success/error/complete) để thay API mock bằng API thật, chế độ controlled (items/total/loading/onQueryChange), withShell/withDialogs/useRoutes, ẩn thao tác theo quyền. Dùng khi cần thêm nút toolbar hoặc banner vào page kit, nối login với backend, đổi API mặc định, ẩn nút theo quyền, hoặc nhúng page kit vào dialog / layout riêng.
metadata:
  workflow: github
  version: 1.0.0
---

# Tuỳ biến page của kit — Orchestrator

Page của kit mở **ba điểm mở rộng** — dùng chúng thay vì copy source page về sửa. Copy là mất mọi bản sửa lỗi của kit về sau.

Hướng dẫn người: [README.md](README.md) · hợp đồng đầy đủ: [reference/page-contract.md](reference/page-contract.md).

## Chọn điểm mở rộng

| Muốn | Dùng | Ví dụ chạy được |
|---|---|---|
| Thêm nút / banner, giữ UI mặc định | `content={(ctx) => <>…{ctx.DefaultContent}</>}` | [examples/tenant-list-toolbar.tsx](templates/examples/tenant-list-toolbar.tsx) |
| Thay API mặc định (mock → thật, endpoint khác) | `callback.onSubmit` / `callback.<thao tác>.onSubmit` | [examples/role-list-real-api.tsx](templates/examples/role-list-real-api.tsx) · [examples/login-with-api.tsx](templates/examples/login-with-api.tsx) |
| Chèn logic trước / sau API (chặn, log, nạp lại) | `callback.before` (trả `false` để huỷ) · `success` · `error` · `complete` | như trên |
| Host tự nạp dữ liệu (cache, store riêng) | Controlled: `items` + `total` + `loading` + `onQueryChange` ổn định | [examples/tenant-list-controlled.tsx](templates/examples/tenant-list-controlled.tsx) |
| Ẩn thao tác theo quyền | `useRoutes={false}` + chỉ truyền handler được phép; bảng dựng lại qua `content` | [examples/tenant-list-permission.tsx](templates/examples/tenant-list-permission.tsx) |
| Nhúng page vào dialog / panel | `withShell={false}` + tự bọc `<form onSubmit={ctx.submit}>` | [examples/tenant-form-no-shell.tsx](templates/examples/tenant-form-no-shell.tsx) |

Ví dụ là code host — đặt trong `src/app/` (hoặc page của host), **không** trong feature.

## Quy tắc cốt lõi

- **Không fork page của kit.** Hợp đồng thiếu chỗ cần ⇒ vòng qua bằng slot / controlled, ghi nợ, đề xuất điểm mở rộng lên kit.
- **`before` trả `false` là huỷ hẳn**: không API, không `success` / `error` / `complete`, không toast.
- **`success` chạy sau điều hướng mặc định của page** — muốn tự điều hướng thì `useRoutes={false}`.
- **Lỗi trong `onSubmit` cứ ném** — page tự toast bằng `getErrorMessage`.
- **Hàm / object truyền vào page phải ổn định**: `onQueryChange` (`useCallback`), `defaultValues` (state / `useMemo`) — tham chiếu mới mỗi render gây nạp lặp hoặc reset form.
- **`withShell={false}` trên form = mất thẻ `<form>`** — host tự bọc, không thì nút submit vô tác dụng.
- **Quyền ở UI chỉ để ẩn / hiện** — backend vẫn chặn.
- **Đối chiếu giới hạn đã biết** trước khi tuỳ biến: [reference/page-contract.md § 4](reference/page-contract.md#4-giới-hạn-đã-biết-của-page-trong-kit) (vd. `TenantListPage` cần `withQueryBuilder={false}`, `RoleListPage` nạp danh sách từ mock).

## Phía feature — làm page của mình tuỳ biến được

Page dựng bằng template [crud](../minipower-frontend-crud-react/README.md) đã theo hợp đồng này. Helper slot của feature:

| Template | Đích |
|---|---|
| [templates/utils/resolveContent.ts](templates/utils/resolveContent.ts) | `src/features/{feature}/utils/resolveContent.ts` |
| [templates/utils/index.ts](templates/utils/index.ts) | `utils/index.ts` |

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

## Output bắt buộc

- Không file nào copy source page của kit; tuỳ biến chỉ qua props / slot / callback
- `npm run typecheck` + `npm run lint` xanh
- Chạy thật: thao tác đã thay API gọi đúng endpoint (tab Network); nút bị ẩn theo quyền không còn trên UI
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md); file đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Gắn page kit vào app (peer, CSS, route): [minipower-frontend-scaffold-react › add](../minipower-frontend-scaffold-react/workflows/add.md)
- Dựng page mới theo cùng hợp đồng: [minipower-frontend-crud-react](../minipower-frontend-crud-react/README.md)
- Bearer token cho mọi request: [minipower-frontend-api-react](../minipower-frontend-api-react/README.md)
