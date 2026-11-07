---
name: minipower-frontend-navigation-react
description: Điều hướng, menu và quyền theo kit @platform/core — hằng {FEATURE}_ROUTES + get{Feature}*Path(id), configure{Feature}Navigate/navigate{Feature} để feature không import react-router, NavigateBridge ở host, route :id qua wrapper useParams, trang trong/ngoài AdminLayout, mainNav/secondaryNav thay menu demo của kit, {feature}MenuItems lọc theo has{Feature}Permission. Dùng khi thêm route / màn hình vào app, thêm mục sidebar, ẩn menu theo quyền, hoặc nút trong page bấm không chuyển trang.
metadata:
  workflow: github
  version: 1.0.0
---

# Điều hướng · menu · quyền (@platform/core) — Orchestrator

Feature **không biết router**: nó khai path, gọi `navigate{Feature}(path)`; host tiêm `navigate` thật của react-router qua một `NavigateBridge`. Nhờ vậy feature dùng lại được ở host khác mà không sửa.

Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Feature có page cần gắn vào URL | [workflows/add-route.md](workflows/add-route.md) |
| Thêm mục sidebar, menu theo quyền | [workflows/add-menu.md](workflows/add-menu.md) |
| Nút trong page bấm không chuyển trang | Thiếu dòng `configure{Feature}Navigate` trong `NavigateBridge` — [add-route § Bước 3](workflows/add-route.md#bước-3--navigatebridge) |

## Luồng điều hướng

```text
feature   routes/paths.ts       {FEATURE}_ROUTES · get{Feature}DetailPath(id)
          routes/navigation.ts  navigate{Feature}(to) ──▶ navigateImpl (host tiêm) ── chưa tiêm ⇒ history.pushState + popstate
host      src/app/NavigateBridge.tsx   useNavigate() ──▶ configure{Feature}Navigate(go)   (mount một lần, cùng cấp <Routes>)
          src/app/routes/{feature}.tsx <Route path={{FEATURE}_ROUTES.edit} element={<EditRoute/>}/> ── useParams ─▶ prop {feature}Id
          src/app/navigation.ts        mainNav / buildMainNav(grants) ──▶ <AdminLayout mainNav>
```

## Trong hay ngoài AdminLayout

| Loại page | Đặt |
|---|---|
| Danh sách / form / chi tiết của nghiệp vụ | Con của `<Route element={<AdminLayout … />}>` — có sidebar + header |
| Đăng nhập · đăng ký · quên mật khẩu · editor toàn màn hình | Route **ngoài** khối AdminLayout |

`AdminLayout` khớp mục menu theo **tiền tố dài nhất** của path (`/employees/123/edit` sáng mục `/employees`); tiêu đề header = nhãn mục khớp. Nút đăng xuất gọi `onLogout` rồi về `ACCOUNT_ROUTES.login` (`/login`) — app cần route này (hoặc `onLogout` trả `false` để tự xử lý).

## Quy tắc cốt lõi

- **Path chỉ khai một chỗ** — `{FEATURE}_ROUTES`; page, menu, route host đều dùng hằng / `get*Path`, không gõ chuỗi tay.
- **Id đi vào page qua prop**, host đọc bằng `useParams` trong wrapper — page không import router (lint R1).
- **Một `NavigateBridge` cho cả app**, mỗi feature (kể cả page kit đang mount: tenant, role, craftPdf, file manager, import…) một dòng `configure*Navigate`.
- **Thay menu demo của kit.** `DEFAULT_ADMIN_MAIN_NAV` trỏ cả những route app chưa có (`/users`, `/templates`, planner…) — luôn truyền `mainNav` / `secondaryNav` của app.
- **Sidebar chỉ là link** — mục menu không có `<Route>` tương ứng là trang trống.
- **Quyền**: khoá ở `{FEATURE}_PERMISSIONS` đúng chuỗi backend trả về; `has{Feature}Permission` chỉ để ẩn / hiện — backend vẫn chặn. Danh sách quyền (grants) do host lấy từ API người dùng hiện tại; kit không tự lấy.

## Templates

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

| Template | Đích |
|---|---|
| [templates/routes/](templates/routes/) | `src/features/{feature}/routes/` — `paths.ts` · `navigation.ts` · `index.ts` |
| [templates/menu/](templates/menu/) | `src/features/{feature}/menu/` |
| [templates/permission/](templates/permission/) | `src/features/{feature}/permission/` |
| [templates/app/NavigateBridge.tsx](templates/app/NavigateBridge.tsx) | `src/app/NavigateBridge.tsx` |
| [templates/app/routes/{feature}.tsx](templates/app/routes/{feature}.tsx) | `src/app/routes/{feature}.tsx` — route + wrapper `useParams` |
| [templates/app/navigation.ts](templates/app/navigation.ts) | `src/app/navigation.ts` — bản lọc quyền (thay bản tĩnh của scaffold) |

## Output bắt buộc

- Mọi path trong feature lấy từ `{FEATURE}_ROUTES`; host không gõ path tay
- `NavigateBridge` có đủ `configure*Navigate` cho mọi feature đang mount
- `npm run typecheck` + `npm run lint` xanh (R1: feature không import router)
- Chạy thật: mục menu mở đúng page; nút trong page chuyển trang; vào thẳng URL `/{features}/{id}/edit` mở đúng bản ghi
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md); file đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Page được gắn route: [minipower-frontend-crud-react](../minipower-frontend-crud-react/README.md)
- Ẩn nút trong page kit theo quyền: [minipower-frontend-customization-react](../minipower-frontend-customization-react/README.md)
