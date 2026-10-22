---
name: minipower-architecture-as-built-react
description: Bảng tra đọc code React/TypeScript khi khai quật frontend cũ — nhận diện SPA/Next/Remix/monorepo, entry và provider gốc, router và guard, taxonomy state (URL, local, store, server cache), React Query/SWR, react-hook-form/Zod, hooks và effect, API client/BFF, env VITE_/NEXT_PUBLIC_. Dùng khi reverse-engineer repo React, trace một màn hình, hiểu vì sao UI không cập nhật sau mutation.
metadata:
  workflow: github
---

# Đọc code React — bảng tra theo stack

Phương pháp: [reference/reading-method.md](../../reference/reading-method.md). File này chỉ nói **React gọi những thứ đó là gì và tìm ở đâu**. Repo theo kit `@platform/core`: cây feature và luật import đã có ở [minipower-frontend-architecture-react](../../../../../frontend/skills/minipower-frontend-architecture-react/SKILL.md) — đọc trước.

JSX là hình chiếu của state. Behavior nằm ở route, event handler, hook, store, API client.

## 1. Nhận diện repo (Pass 1)

| Tìm | Cho biết |
|-----|----------|
| `package.json` (scripts + dependencies), lockfile, `pnpm-workspace.yaml` | Họ công cụ; monorepo `apps/*` + `packages/*` |
| `vite.config.*` · `next.config.*` · `remix.config.*` · `rsbuild.config.*` · `webpack.config.*` | Kiểu runtime: SPA · Next Pages · Next App Router · Remix · module federation |
| `src/main.tsx` / `index.tsx` / `App.tsx` · `app/layout.tsx` · `pages/_app.tsx` · `entry.client.tsx` | Entry và lớp bọc |
| Provider gốc: `RouterProvider`, `QueryClientProvider`, Redux `Provider`, `AuthProvider`, `ThemeProvider`, `ErrorBoundary` | Bản đồ phụ thuộc cả app |
| `.env*`, `VITE_*`, `NEXT_PUBLIC_*`, `public/config.js`, `window.__ENV__` | Config build-time vs runtime |

Đọc `package.json` trước khi grep mù: `react-router` / `@tanstack/react-router` / `next` · `@tanstack/react-query` / `swr` / `@reduxjs/toolkit` / `zustand` / `jotai` / `apollo` · `react-hook-form` / `formik` · `zod` / `yup` · `axios` / `ky` · `msw` / `vitest` / `playwright`.

## 2. Entry point (câu hỏi 4.1)

| Loại | Dấu hiệu |
|------|----------|
| URL | route element, `page.tsx` / `pages/*.tsx`, `loader` / `clientLoader`, `getServerSideProps`, Server Component fetch, `middleware.ts` |
| Người dùng | `onClick` / `onSubmit` / `onChange`, form action, Server Action |
| Hệ thống | timer, websocket, `BroadcastChannel`, visibility / focus refetch |

Phân biệt **thì đọc** (URL → loader / query → render) và **thì ghi** (event → handler → mutation → cache / navigation → render lại).

## 3. Thứ tự đọc

```text
README → package.json → workspace → bundler config → entry + providers → router / file routes → auth guard / middleware
→ một page của flow → feature hooks → API client / query fn → store / query key → form schema
→ shared UI chỉ khi flow đụng → i18n key nếu nhãn là bằng chứng → env / proxy → tests của flow → E2E → CI / hosting
```

## 4. Composition (mục 5 reference)

Không có DI container: phụ thuộc nối bằng **import · props · context · provider**. Trace `Page → feature container → hook → presentational → design-system primitive`. Hỏi: provider đặt ở root hay route · context là state hay service · ai là owner state (page, hook, store). Bẫy: một hook gọi ở nhiều nơi · provider bọc thiếu route · default context che lỗi thiếu provider · props drilling xuyên module.

## 5. Routing

| Router | Tìm |
|--------|-----|
| React Router | `createBrowserRouter`, `Route`, `Outlet`, `loader` / `action`, `Navigate`, `useParams` / `useSearchParams` |
| TanStack Router | `createRoute`, `loader`, `validateSearch`, `beforeLoad` |
| Next Pages | `pages/**`, `pages/api/**`, `getServerSideProps` / `getStaticProps` |
| Next App | `app/**/page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, `middleware.ts`, `"use client"`, `redirect` |

Trace `URL → matcher → middleware / guard → layout → loader hoặc RSC fetch → page → outlet`. Search param thường là state màn danh sách — bỏ qua URL là dựng sai data flow. Redirect ở server hay client?

## 6. State (mục 6 reference)

| Loại | Dấu hiệu |
|------|----------|
| URL | path / search params |
| Local / lifted | `useState` trong component hoặc ở cha |
| Context | `createContext` / `useContext` |
| Client store | Redux (`createSlice`, `createAsyncThunk`, `persist`), Zustand, Jotai |
| Server cache | React Query / SWR / RTK Query / Apollo — **không** phải client store |
| Form | react-hook-form, Formik |
| Ref · storage | `useRef`; `localStorage` / `sessionStorage` / IndexedDB / cookie |

Server state: `useQuery` / `useMutation`, `queryKey` (có chứa filter / page / tenant?), `enabled`, `staleTime` / `gcTime`, `select`, `invalidateQueries` / `setQueryData`, optimistic + rollback. Sau mutation: `invalidate` → refetch · `setQueryData` · `dispatch` · `router.refresh()` · `revalidatePath`. Chỉ subscriber của key đó cập nhật.

## 7. Hooks · effect · render

Custom hook là service nhỏ: giấu fetch, subscription, form wiring, permission, derived flag. Với `useEffect`: đồng bộ hệ ngoài hay bắt chước data flow? dependency đủ? cleanup / abort? race khi id đổi? Strict Mode chạy effect hai lần ở dev — không kết luận production gọi API hai lần. Pipeline: `setState → render → reconcile → commit → useLayoutEffect → paint → useEffect`. Thân function component chạy lại nhiều lần — không phải một giao dịch.

## 8. Form

`useForm`, `register` / `Controller`, `resolver` (zod / yup), `handleSubmit`, `formState`, `setError`, `useFieldArray`; Server Action + form action. Kiểm: giá trị hiển thị vs submit (mask, tiền, ngày) · lỗi từ schema hay API 400 · reset khi đổi id đè dữ liệu đang gõ · double submit. Schema client là rule **hiển thị** — không nâng thành rule hệ thống nếu server có bộ validate khác.

## 9. API client · BFF · realtime

`axios` instance / `fetch` wrapper / `ky` / graphql client / codegen (`orval`, `openapi-fetch`) / Server Action / `app/api/**`; interceptor gắn auth, refresh 401, map lỗi; `rewrites` / `proxy` dev **không** phải contract production. Realtime: WebSocket, Socket.IO, SignalR client, SSE, GraphQL subscription, `refetchInterval` (polling cũng là realtime).

## 10. Auth (mục 7 reference)

`AuthProvider`, `useAuth` / `useSession`, `ProtectedRoute`, `middleware.ts`, `beforeLoad`, httpOnly cookie vs `localStorage` token, interceptor refresh, role map, `<Can>`. Ghi rõ từng guard là **presentation** hay **điều kiện gọi API**; logout xoá store / cache nào.

## 11. Lỗi · observability

`ErrorBoundary`, `error.tsx` / `global-error.tsx`, `QueryErrorResetBoundary`, `throwOnError`, `onError`, `catch` trong handler, parser ProblemDetails / `[code] message`. Boundary **không** bắt lỗi trong event handler / async. Sentry / Datadog RUM, `analytics.track`, web-vitals, source map upload.

## 12. Config · tests

`.env*` → `VITE_*` / `NEXT_PUBLIC_*` dính bundle (lộ ra browser) · biến server-only · runtime config · feature flag · cờ bật mock (`msw` start trong entry là behavior). Tests: Testing Library + `userEvent`, MSW (assert request = contract), Playwright / Cypress, Storybook play; `renderWithProviders` lộ dependency cần bọc.

## 13. Bẫy riêng React

- `useEffect` fetch song song với query cache — hai nguồn sự thật.
- `key={index}` trên list thêm / xoá — state dính nhầm hàng.
- Hydration mismatch khi render phụ thuộc `window` / `Date.now()` / random.
- `memo` / `useCallback` chặn update cần thiết; `useDeferredValue` cho UI đọc giá trị cũ hơn input.
- Ẩn nút theo role nhưng request vẫn gọi được — ghi `[Chưa xác minh]` cho lớp enforce.
