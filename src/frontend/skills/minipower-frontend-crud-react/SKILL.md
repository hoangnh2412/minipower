---
name: minipower-frontend-crud-react
description: Màn CRUD theo kit @platform/core — trang danh sách (DataTable compound, useListPagination + ListPagination, tìm kiếm debounce, lọc trạng thái, RowActions, xoá qua ConfirmDialog, đổi trạng thái), trang tạo/sửa, trang chi tiết; chọn mẫu theo route (List/Form/Detail riêng) hoặc theo dialog (FeatureDialog). Mọi thao tác ghi qua handleAction, page hỗ trợ controlled + slot content + callback. Dùng khi làm màn quản lý danh mục / hồ sơ, bảng có phân trang, form thêm-sửa-xoá, trang chi tiết bản ghi.
metadata:
  workflow: github
  version: 1.0.0
---

# Màn CRUD (@platform/core) — Orchestrator

Skill dựng **page** — tầng điều phối: giữ state, gọi API qua `handleAction`, ghép component, toast, điều hướng. Kiểu + `call*` thuộc [api](../minipower-frontend-api-react/SKILL.md); schema + component trường thuộc [form](../minipower-frontend-form-react/SKILL.md); path + điều hướng thuộc [navigation](../minipower-frontend-navigation-react/SKILL.md).

Hướng dẫn người: [README.md](README.md).

## Chọn mẫu

Hai mẫu loại trừ nhau **cho một thực thể** — chọn một, đọc đúng một file:

| | Theo route | Theo dialog |
|---|---|---|
| Màn hình | List · Form (tạo/sửa) · Detail — mỗi màn một route | Một route danh sách; tạo / sửa / xem trong `FeatureDialog` |
| Hợp khi | Nhiều trường, có tab / khối con, cần link trực tiếp tới bản ghi, có resource con | Ít trường (≤ ~8), thao tác nhanh, danh mục nhỏ |
| Ví dụ trong kit | `tenant` (tenant + connection + domain) | `role` |
| Đọc | **[patterns/route-pages/SKILL.md](patterns/route-pages/SKILL.md)** | **[patterns/dialog/SKILL.md](patterns/dialog/SKILL.md)** |

Không chắc ⇒ hỏi người; mặc định **theo route** khi DOC-19 có màn chi tiết riêng.

## Giải phẫu một page

```text
props ─▶ controlled? ──có──▶ hiển thị items/item của host, báo query qua onQueryChange
             └──không──▶ tự nạp: useCallback reload + useEffect(() => { void reload() }, [reload])
state  : lọc · trang (useListPagination) · pendingDelete · deleting
ghi    : handleAction({ ctx, callback, defaultSubmit: call*, getPayload, onSuccess: reload/điều hướng })
ghép   : DefaultToolbar · DefaultTable · DefaultPagination · DefaultContent  ─▶  resolve{Feature}Content(content, ctx, mặc định)
khung  : withShell ? <{Feature}PageShell title … headerActions> : nội dung trần;  withDialogs ? dialog mặc định : không
```

Hợp đồng props / ctx / `callback` (dùng chung với page có sẵn của kit): [customization/reference/page-contract.md](../minipower-frontend-customization-react/reference/page-contract.md).

## Quy tắc cốt lõi

- **Mọi thao tác ghi qua `handleAction`** với `callback` tương ứng — host thay được API mà không fork; `outcome.status === 'cancelled'` ⇒ return trước toast.
- **Chặn response cũ**: bộ đếm `useRef` trong `reload` — gõ tìm / đổi trang nhanh không làm dữ liệu cũ đè dữ liệu mới.
- **Tìm kiếm debounce 350 ms** rồi về trang 1; đổi bộ lọc / kích thước trang cũng về trang 1.
- **Sort / lọc thật gửi lên API** (`sort`, `filter`) — `DataTable.Sort` / `DataTable.Filter` chỉ xếp trang đang hiện.
- **Xoá luôn qua `ConfirmDialog`**, mô tả nêu mã bản ghi; nút xác nhận `loading` khi đang xoá.
- **Thao tác chỉ hiện khi có handler** — bảng ẩn nút thiếu handler; đó cũng là cách host ẩn theo quyền.
- **Page không đọc router**: id vào qua prop (`{feature}Id`), điều hướng qua `navigate{Feature}` (lint R1).
- **Controlled**: `onQueryChange` / `defaultValues` từ host phải giữ tham chiếu ổn định — ghi trong JSDoc của prop.

## Templates

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

| Template | Đích | Mẫu |
|---|---|---|
| [templates/shared/components/{Feature}PageShell/](templates/shared/components/{Feature}PageShell/) | `components/{Feature}PageShell/` | cả hai |
| [templates/shared/components/{Feature}Table/](templates/shared/components/{Feature}Table/) | `components/{Feature}Table/` | cả hai |
| [templates/route-pages/pages/](templates/route-pages/pages/) | `pages/{Feature}List` · `{Feature}Form` · `{Feature}Detail` | route |
| [templates/dialog/pages/](templates/dialog/pages/) | `pages/{Feature}List` | dialog |

Phụ thuộc phải có trước: `types/` · `services/` · `utils/apiData.ts` (api) · `validation/` · `hooks/` · `components/{Feature}Form` (form) · `routes/` (navigation) · `utils/resolveContent.ts` (customization) · `localization/` · `components/fieldStyles.ts` (convention). Thứ tự đầy đủ: [architecture › add-feature](../minipower-frontend-architecture-react/workflows/add-feature.md).

## Output bắt buộc

- Page theo đúng một mẫu; mọi thao tác ghi qua `handleAction`
- `npm run typecheck` + `npm run lint` xanh
- Chạy thật: danh sách tải + phân trang; tạo → toast → về danh sách có bản ghi mới; sửa nạp dữ liệu cũ; xoá qua xác nhận; lỗi API hiện toast có nghĩa
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md); file đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Dùng / tuỳ biến page CRUD **có sẵn** trong kit (tenant, role…): [minipower-frontend-customization-react](../minipower-frontend-customization-react/README.md)
- Gắn route + menu cho page vừa dựng: [minipower-frontend-navigation-react](../minipower-frontend-navigation-react/README.md)
