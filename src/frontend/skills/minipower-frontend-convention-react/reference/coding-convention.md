# Quy ước code TypeScript / React — kit `@platform/core`

Toàn văn quy ước. Không load mặc định — mở khi cần tra một mục. Luật hành động nằm ở [SKILL.md](../SKILL.md). Mục đánh dấu **[máy]** đã có `tsc` / ESLint gác — đừng nhắc bằng lời trong review.

## 1. Đặt tên

| Tạo tác | Mẫu | Ví dụ |
|---|---|---|
| Page (mount vào route) | `{Feature}{Màn}Page` | `EmployeeListPage`, `EmployeeFormPage` |
| Props / ctx slot của page | `{Tên}Props` · `{Tên}ContentContext` | `EmployeeListPageProps` |
| Component | PascalCase, trùng tên thư mục | `components/EmployeeTable/EmployeeTable.tsx` |
| Hook | `use{Tên}` | `useEmployeeForm` |
| Hàm gọi API | `call{Động từ}{Feature}[…]` | `callGetEmployeeList`, `callSetEmployeeStatus` |
| Hàm mock — chỉ nhánh mock tạm | `mock{…}` cùng chữ ký `call*` | `mockGetEmployeeList` |
| Zod schema · kiểu · mặc định | `{feature}FormSchema` · `{Feature}FormData` · `{feature}FormDefaultValues` | `employeeFormSchema` |
| Payload · query · kết quả | `Create{Feature}Payload` · `Get{Feature}ListParams` · `{Feature}ListResult` | |
| Hằng enum | `{Feature}Status` + `{Feature}StatusValue` + `{FEATURE}_STATUS_LABEL` + `{FEATURE}_STATUS_OPTIONS` | |
| Route · điều hướng | `{FEATURE}_ROUTES` · `get{Feature}{Màn}Path(id)` · `configure{Feature}Navigate` · `navigate{Feature}` | |
| Menu · quyền | `{feature}MenuItems` · `{FEATURE}_PERMISSIONS` · `has{Feature}Permission` | |
| Text | `get{Feature}Messages(locale)` · kiểu `{Feature}Messages` · `{Feature}Locale` | |
| Slot | `resolve{Feature}Content` · `{Feature}SlotContent` | |
| Dữ liệu giả — chỉ nhánh mock tạm | `FAKE_{FEATURES}` | `FAKE_EMPLOYEES` |

Đọc tên là biết việc — host không cần mở source feature. Mọi tên export mang tiền tố feature vì barrel module dùng `export *` (trùng tên ⇒ `tsc` đỏ **[máy]**).

## 2. File & thư mục

- Component / page: thư mục PascalCase + file cùng tên + `index.ts` barrel. Một component chính mỗi file; component con nhỏ chỉ dùng nội bộ (vd. `FieldError`, `MetaRow`) được ở cùng file.
- Hook, service, util: camelCase (`useEmployeeForm.ts`, `employee.ts`, `apiData.ts`).
- Named export — **không** `export default` trong feature (dễ đổi tên lệch khi import).
- File nội bộ (`apiData.ts`, `fieldStyles.ts`, `*Mock.ts`) không đi qua barrel feature.

## 3. TypeScript

- `strict` + `verbatimModuleSyntax` + `erasableSyntaxOnly` **[máy]** — import kiểu phải có `type`; không `enum`, `namespace`, parameter property.
- Enum = object `as const` + kiểu giá trị suy ra + `Record` nhãn + mảng options (mẫu: `types/index.ts` của skill api). Giá trị khớp backend (số hay chuỗi) — đừng đổi kiểu cho "đẹp".
- `type` alias, không `interface` — trừ khai báo cần merge (`ImportMetaEnv` trong `vite-env.d.ts`).
- Không `any` **[máy]** — dùng `unknown` rồi thu hẹp (mẫu: `getErrorMessage`, `unwrap*`).
- Kiểu API (DTO, payload) ở `types/`; kiểu form là `z.infer` ở `validation/`. Không dùng chung một kiểu cho cả hai — form có `null` cho ô trống, payload theo DOC-12.
- Trường tuỳ chọn từ API: `?: T | null` (backend .NET trả `null`), đừng chỉ `?: T`.

## 4. React

- Function component; props destructure ngay chữ ký, giá trị mặc định ở đó.
- Chế độ **controlled / uncontrolled**: có prop dữ liệu (`items`, `item`) ⇒ controlled, page không tự gọi API; không có ⇒ page tự nạp.
- `useCallback` cho hàm nạp dữ liệu dùng trong `useEffect`; đủ dependency **[máy]** (`exhaustive-deps`).
- Effect có timer / subscription phải dọn trong cleanup (`window.clearTimeout`).
- Gọi promise không chờ: `void reload()` — có chủ đích, không để promise trôi.
- Response về không theo thứ tự (gõ tìm nhanh, đổi trang nhanh) ⇒ chặn bằng bộ đếm `useRef` — response cũ không đè dữ liệu mới.
- Ghép `className`: `[a, cond ? b : c, className].filter(Boolean).join(' ')` — không thêm thư viện `clsx` chỉ để ghép chuỗi.
- `memo` cho bảng / danh sách lớn nhận props ổn định; không rải `useMemo`/`memo` khắp nơi.
- Prop là hàm truyền xuống effect (vd. `onQueryChange`) phải **ổn định** — ghi rõ trong JSDoc của prop.
- Preset React Compiler (`recommended-latest` của `eslint-plugin-react-hooks` v7) **không bật**: nó đánh đỏ mẫu nạp dữ liệu chuẩn của kit `useEffect(() => { void reload() }, [reload])`. Chỉ bật khi dự án dùng React Compiler và đổi mẫu nạp dữ liệu.

## 5. Bất đồng bộ & lỗi

- Mọi thao tác ghi (lưu, xoá, đổi trạng thái) đi qua `handleAction` — giữ thứ tự `before → onSubmit → onSuccess của page → success → complete` và cho host thay API bằng `callback`.
- Sau `handleAction`: `if (outcome.status === 'cancelled') return` **trước** toast thành công.
- `catch (error)` ⇒ `notify.error(getErrorMessage(error, messages.x))` — fallback là câu tiếng Việt có nghĩa, không nuốt lỗi im lặng.
- Thông báo lỗi người dùng thấy mang **mã**: dạng `[code] message`, `code` là token backend trả (họ `{MOD}-VAL-` · `{MOD}-BR-` · `{MOD}-API-` · `SYS-`) — người dùng đọc được mã để báo hỗ trợ, QA trace được về BR / API. Không hiện `error.message` thô của framework, không `alert()`. Một thao tác một toast — batch fail không bắn N toast.
- Interceptor của kit reject bằng **body lỗi** (không phải AxiosError) — đừng đọc `error.response.status` trong catch; xem [api](../../minipower-frontend-api-react/SKILL.md).
- Nút submit `disabled={isSubmitting}` — chặn bấm hai lần.

## 6. UI — PrimeReact 11 + Tailwind

- PrimeReact 11 là **API compound**: `Dialog.Root/Portal/Backdrop/Positioner/Popup/Header/Title/Content/Footer`, `Select.Root/Trigger/Value/Portal/Positioner/Popup/List/Option`, `DataTable.Root/TableContainer/Table/THead/THeadRow/THeadCell/TBody/Row/Cell/EmptyTBody/Loading`, `Card.Root/Body`, `Message.Root/Content/Text`, `Toolbar.Root/Start/End`, `ProgressSpinner.Root/Track/Range`, `Popover.Root/Trigger/Portal/Positioner/Popup`. Prop kiểu v10 (`<Column>`, `visible`, `onHide`, `header=`, `value=` cho DataTable) **không chạy** — mô hình AI hay viết nhầm sang v10.
- Sự kiện compound trả object: `onOpenChange={(e) => e.value}`, `onValueChange={(e) => e.value}`, `onCheckedChange={(e) => e.checked}`.
- Primitive lấy từ `@platform/core` (re-export PrimeReact); thứ kit chưa re-export (`Tree`, `Breadcrumb`, `ProgressBar`) thì `primereact/<tên>`.
- Control hiển thị: `unstyled` + class Tailwind từ `components/fieldStyles.ts`; nút dùng skin `pr-btn-primary` · `pr-btn-outlined` · `pr-btn-text` · `pr-btn-danger` (có sẵn trong CSS kit).
- Token màu của kit: `text-ink` · `text-mute` · `border-line` · `bg-paper` · `bg-panel` · `accent` — dùng thay mã màu rời rạc cho chữ/viền.
- Icon `lucide-react`, cỡ bằng class `size-4`; icon trang trí `aria-hidden`; nút chỉ có icon phải có `aria-label`.
- Popup dùng Portal: lớp z đặt trên `Positioner` (`z-[120]` select, `z-[200]` popover) để nổi trên Dialog (`z-[110]`).
- `<form noValidate>` — Zod lo validate, tắt bong bóng HTML5.
- Bảng dữ liệu: cột **số** (tiền, số lượng, tỷ giá, %, STT) căn **phải** + class `tabular-nums` để số thẳng hàng; cột **chữ** (tên, mô tả, trạng thái) căn **trái**; header cột cùng quy tắc với ô.

## 7. Form

Theo [minipower-frontend-form-react](../../minipower-frontend-form-react/SKILL.md): schema + mặc định ở `validation/`, `use{Feature}Form` (`mode: 'onChange'`), component form chỉ có trường, `Controller` cho control không phải input gốc.

## 8. Text & đa ngôn ngữ

- Text người dùng thấy lấy từ `get{Feature}Messages(locale)`; mặc định `vi`. Không i18next trong feature.
- `vi.ts` là bản chuẩn; `en.ts` khai kiểu `{Feature}Messages` ⇒ thiếu key là `tsc` đỏ **[máy]**.
- Câu có biến: giá trị là hàm `(code: string) => string`, không ghép chuỗi trong JSX.
- Nhãn enum (`{FEATURE}_STATUS_LABEL`) ở `types/` cạnh options — một nguồn cho select và badge.

## 9. Dùng sẵn của kit trước khi tự viết

| Cần | Dùng |
|---|---|
| Toast | `notify.success` / `notify.error` — `<Toaster />` mount một lần ở root |
| Hỏi xác nhận | `ConfirmDialog` |
| Dialog có form | `FeatureDialog` (`onSubmit` ⇒ tự bọc `<form>` + footer) |
| Phân trang | `useListPagination` + `ListPagination` |
| Menu thao tác dòng | `RowActions` (`RowActionItem[]`) |
| Select | `FieldSelect` (trong form) · `SearchableSelect` (nhiều lựa chọn, cần gõ lọc) |
| Mật khẩu | `PasswordInput` |
| Upload | `KitFileUpload` |
| Tiêu đề trang đơn giản | `PageHeader` |
| Hàng nút cuối form | `FormActions` |
| Đang tải | `Loading` |
| Lỗi → câu hiển thị | `getErrorMessage(error, fallback)` |
| Vòng đời thao tác ghi | `handleAction` |

## 10. Bảo mật

- Không `dangerouslySetInnerHTML` với dữ liệu API / người dùng.
- Mọi `VITE_*` nằm trong bundle trình duyệt — không đặt secret thật.
- `console.log` dữ liệu API bị chặn **[máy]** (`no-console`, chỉ cho `warn`/`error`) — tránh lộ PII trên máy người dùng.
- Quyền ở UI chỉ để ẩn/hiện; backend luôn kiểm lại.
- `href` từ dữ liệu: chỉ nhận `http(s):` — chặn `javascript:`.

## 11. Công cụ — phiên bản & bẫy

- TypeScript giữ `~6.0`: `typescript-eslint` 8.x chỉ hỗ trợ `<6.1`, chưa hỗ trợ TypeScript 7.
- Kit cài kiểu `file:` có `node_modules` riêng ⇒ `tsconfig` có `paths` ép `react` / `lucide-react` về bản của app (lỗi *"Two different types with this name exist"*); `vite.config.ts` có `dedupe` + `alias` (lỗi *"Invalid hook call"*).
- Sửa kit trong monorepo ⇒ `npm run build` ở kit rồi khởi động lại `npm run dev` của app.
