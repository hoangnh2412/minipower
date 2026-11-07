---
name: minipower-frontend-scaffold-react
description: Dựng app frontend React (Vite + TypeScript + Tailwind v4 + PrimeReact 11) gắn kit @platform/core từ folder trống — npm run dev ra AdminLayout có sidebar; hoặc gắn kit vào app Vite có sẵn; hoặc mount module có sẵn của kit (đăng nhập, tenant, vai trò, dashboard, planner, timesheet, craft PDF/DOCX, file manager, import). Dùng khi tạo frontend mới, cài @platform/core, cấu hình configurePlatformHttp / PrimeReactProvider / Tailwind @source / Vite proxy, hoặc gặp UI trắng, Invalid hook call, lỗi kiểu trùng bản React sau khi link kit.
metadata:
  workflow: github
  version: 1.0.0
---

# App host React + @platform/core — Orchestrator

Skill dựng **tầng host**: bootstrap, CSS, Vite, env, khung route. Feature nghiệp vụ thêm sau bằng [architecture › add-feature](../minipower-frontend-architecture-react/workflows/add-feature.md).

## Luồng chính

```text
Folder trống → scaffold → app chạy (AdminLayout + trang chủ) → add-feature từng nghiệp vụ
```

| Bước | Workflow |
|---|---|
| 1. Dựng app từ folder trống | **[workflows/scaffold.md](workflows/scaffold.md)** |
| 2. App Vite + React có sẵn — gắn kit | [workflows/init.md](workflows/init.md) |
| 3. Mount module có sẵn của kit (đăng nhập, tenant…) | [workflows/add.md](workflows/add.md) |
| Sự cố sau khi cài / link kit | [reference/troubleshooting.md](reference/troubleshooting.md) |

## Cấu trúc app

```text
{app}/
├── index.html · vite.config.ts · tsconfig.json · eslint.config.js · eslint.architecture.js
├── .env.example · .env.development (không commit)
└── src/
    ├── main.tsx        configureAppHttp() → BrowserRouter → PrimeReactProvider(kitPrimeReactConfig) → <App/> + <Toaster/>
    ├── App.tsx         <Routes>: AdminLayout(mainNav) + route feature; login / editor ngoài layout
    ├── index.css       layer order + @source kit + theme.css + styles.css
    ├── vite-env.d.ts   khai VITE_*
    ├── app/            http.ts · navigation.ts · (NavigateBridge.tsx · routes/ — navigation)
    └── features/       nghiệp vụ — architecture
```

Cây đầy đủ tới feature: [architecture templates/feature-tree.txt](../minipower-frontend-architecture-react/templates/feature-tree.txt).

## Hai cách cài kit

| Cách | `package.json` | `@source` trong `index.css` | Khi nào |
|---|---|---|---|
| **Registry** | `"@platform/core": "^x.y.z"` | `../node_modules/@platform/core/dist` | Repo độc lập, CI |
| **Link `file:`** | `"@platform/core": "file:{KitPath}"` | giữ dòng `dist`, hoặc `{KitPath}/src` để quét source | Monorepo cạnh repo kit; build kit trước (`npm run build` trong kit) |

Link `file:` mang `node_modules` riêng của kit ⇒ bắt buộc ba lớp chống trùng bản: `resolve.dedupe` + `alias` (Vite — *Invalid hook call*), `paths` (tsconfig — *Two different types with this name exist*). Template đã có sẵn.

## Quy tắc cốt lõi

- **`configurePlatformHttp` đúng một lần, trước render** — mọi `call*` của mọi feature dùng instance này.
- **`PrimeReactProvider {...kitPrimeReactConfig}` + một `<Toaster />` ở gốc** — thiếu Toaster thì `notify` im lặng.
- **`BrowserRouter` bọc ngoài cùng** — `AdminLayout` và page account dùng hook của router.
- **CSS: không `@import "tailwindcss"` đầy đủ** (preflight đè Aura); giữ thứ tự `@layer theme, base, primereact, utilities`; thiếu `@source` tới kit ⇒ UI trắng.
- **Thay menu demo** của kit bằng `mainNav` của app ngay từ đầu.
- **`VITE_*` nằm trong bundle** — không đặt secret thật; API key trong env chỉ hợp hệ nội bộ.
- **Sửa kit (monorepo) ⇒ `npm run build` ở kit rồi khởi động lại `npm run dev`** của app.
- Kit là **một bundle** khai `sideEffects` cả `dist` ⇒ app luôn kéo toàn bộ kit (~3 MB, ~840 KB gzip ở bản 33a023f) dù chỉ dùng AdminLayout; tách route bằng `lazy()` không giảm phần này — tối ưu thuộc kit.

## Catalog package

| Package | Version | Vai |
|---|---|---|
| `@platform/core` | registry hoặc `file:` | Kit UI |
| `react` · `react-dom` | ^19.3 | |
| `react-router-dom` | ^7.18 | Router (host) |
| `primereact` · `@primereact/core` · `@primeuix/themes` | ^11.2 · ^11.2 · ^3.0 | UI + theme |
| `axios` · `zod` · `react-hook-form` · `@hookform/resolvers` | ^1.20 · ^4.6 · ^7.89 · ^5.9 | HTTP, validate, form |
| `lucide-react` · `react-toastify` | ^1.50 · ^11.1 | Icon, toast |
| `vite` · `@vitejs/plugin-react` · `tailwindcss` · `@tailwindcss/vite` | ^8.3 · ^6.1 · ^4.3 · ^4.3 | Build |
| `typescript` | **~6.0** | `typescript-eslint` chưa hỗ trợ TS 7 |
| `eslint` · `@eslint/js` · `typescript-eslint` · `eslint-plugin-react-hooks` · `globals` | ^10 · ^10 · ^8.71 · ^7.1 · ^17 | Lint |

Peer riêng của module kit (FullCalendar, AG Grid, chart.js, gridstack, react-pdf…) do kit kéo theo — xem [workflows/add.md](workflows/add.md).

## Templates

| Template | Đích |
|---|---|
| [templates/package.json](templates/package.json) | `package.json` — thay `{app}`, `{kitSpec}` |
| [templates/vite.config.ts](templates/vite.config.ts) | `vite.config.ts` |
| [templates/index.html](templates/index.html) | `index.html` |
| [templates/env.example](templates/env.example) | `.env.example` (+ bản chạy `.env.development`, không commit) |
| [templates/src/](templates/src/) | `src/` — `main.tsx` · `App.tsx` · `index.css` · `vite-env.d.ts` · `app/http.ts` · `app/navigation.ts` |
| [convention templates/tsconfig.json](../minipower-frontend-convention-react/templates/tsconfig.json) · [eslint.config.js](../minipower-frontend-convention-react/templates/eslint.config.js) | gốc repo |
| [architecture templates/eslint.architecture.js](../minipower-frontend-architecture-react/templates/eslint.architecture.js) | gốc repo |

## Output bắt buộc (scaffold)

- `npm run typecheck` · `npm run lint` · `npm run build` xanh
- `npm run dev` mở `/`: AdminLayout có sidebar (chỉ menu của app), header, trang chủ; không lỗi console
- `tsconfig.json` + `eslint.config.js` + `eslint.architecture.js` trong repo — [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md) · [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)
- `.env.example` commit, `.env.development` / `.env.local` trong `.gitignore`

## Liên quan

- Thêm feature nghiệp vụ: [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/README.md)
- Route + menu + bridge: [minipower-frontend-navigation-react](../minipower-frontend-navigation-react/README.md)
- Backend Jarvis mà proxy `/api` trỏ tới: [minipower-backend-scaffold-dotnet](../../../backend/skills/minipower-backend-scaffold-dotnet/README.md)
