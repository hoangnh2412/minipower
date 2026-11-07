---
name: minipower-frontend-architecture-react
description: Kiến trúc frontend React theo kit @platform/core — cây feature module (pages · components · hooks · services · validation · types · routes · menu · permission · localization), file đặt ở folder nào, folder nào được import folder nào, barrel public API, lát cắt dọc khi thêm feature mới, luật ESLint R1–R7 chặn import sai chiều + M1 chặn merge khi page còn gọi mock. Dùng khi thêm feature/màn hình/module mới, phân vân đặt code ở đâu, hoặc dựng lint kiến trúc cho repo frontend.
metadata:
  workflow: github
  version: 1.0.0
---

# Kiến trúc frontend React (@platform/core) — Orchestrator

Skill cắt ngang mọi skill `minipower-frontend-*-react`: code sinh ra hoặc sửa đổi phải nằm **đúng folder** và **đúng hướng import**.

Ranh giới với [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md):

| Skill | Trả lời câu hỏi | Cổng cứng |
|---|---|---|
| **architecture** (skill này) | **File nằm ở đâu? Import thế nào?** | `npm run lint` — luật R1–R7 + M1 |
| **convention** | **Code trong file viết thế nào?** | `npm run typecheck` + `npm run lint` |

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Thêm feature mới (màn hình + API) — chạm nhiều folder | **[workflows/add-feature.md](workflows/add-feature.md)** |
| Repo chưa có lint kiến trúc | [workflows/add-arch-lint.md](workflows/add-arch-lint.md) |

## Ba tầng — mũi tên đọc là "được phép import"

```text
App host            src/main.tsx · App.tsx · src/app/*     ghép route · menu · NavigateBridge · cấu hình HTTP
  ↑
Feature module      src/features/{feature}/                pages · components · hooks · services · …
  ↑
@platform/core      entry "@platform/core"                 primitive PrimeReact · common · AdminLayout · lib
```

Feature **không** biết host (không import `react-router`, không đọc `useParams`); host **không** đâm vào ruột feature (chỉ qua barrel). Ngược chiều mũi tên là vi phạm — lint bắt.

## Ba nơi đặt feature

| Nơi | Đường dẫn | Import phần dùng chung |
|---|---|---|
| App host | `src/features/{feature}/` | `@platform/core` |
| Module package (gói chức năng, app khác import) | `src/features/{feature}/` của package; entry package export barrel `src/features` | `@platform/core` |
| Bên trong kit | `src/features/{feature}/` của kit | Tương đối: `../../../../lib/handleAction`, `../../../../common/Toaster`… — kit không tự import `@platform/core` |

Cấu trúc feature **giống hệt** ở cả ba nơi. Template viết cho hai nơi đầu; viết trong kit thì đổi dòng import `@platform/core` sang đường tương đối, và thêm export vào danh sách named của entry kit.

## Cây feature chuẩn

[templates/feature-tree.txt](templates/feature-tree.txt) — cây đầy đủ từ app host xuống feature, kèm vai từng file. **Folder nào chưa cần thì không tạo**; thêm folder đặc thù (vd. `styles/`) chỉ khi feature có CSS riêng.

## Đặt file ở đâu

| Tạo tác | Folder | Tên |
|---|---|---|
| Màn mount vào `<Route>` | `pages/{Name}/` | `{Name}Page.tsx` + `index.ts` |
| UI nội bộ feature (bảng, form, shell) | `components/{Name}/` | `{Name}.tsx` + `index.ts` |
| Class Tailwind dùng chung trong feature | `components/` | `fieldStyles.ts` (nội bộ) |
| Hook form / state | `hooks/` | `use{Name}.ts` |
| Gọi API | `services/` | `req.ts` · `{domain}.ts` (`call*`) |
| Zod schema + giá trị mặc định + map entity → form | `validation/` | `{entity}.ts` |
| DTO · payload · list params · hằng enum `as const` | `types/` | `index.ts` |
| Hằng số của feature | `constants/` | `index.ts` |
| Mock tạm — **chỉ nhánh tuỳ chọn** [api › add-mock](../minipower-frontend-api-react/workflows/add-mock.md) (DOC-12 có, backend chưa chạy) | `mocks/` · `constants/` · `services/` | `get-{feature}-list.json` · `fake{Entities}.ts` · `{feature}Mock.ts` |
| Path + điều hướng | `routes/` | `paths.ts` · `navigation.ts` |
| Mục menu | `menu/` | `items.ts` |
| Khoá quyền + hàm kiểm | `permission/` | `keys.ts` · `hasPermission.ts` |
| Text UI vi / en | `localization/` | `vi.ts` · `en.ts` · `index.ts` |
| Helper slot, unwrap response | `utils/` | `resolveContent.ts` · `apiData.ts` (nội bộ) |
| Public API của feature | gốc feature | `index.ts` — [templates/index.ts](templates/index.ts) |
| Barrel tầng module | `src/features/` | `index.ts` — [templates/features-index.ts](templates/features-index.ts) |
| Route, wrapper `useParams`, bridge, menu chính | host `src/app/` | `routes/{feature}.tsx` · `NavigateBridge.tsx` · `navigation.ts` |

## Tầng bên trong một feature

| Tầng | Folder | Vai |
|---|---|---|
| Trình bày | `pages/` | Điều phối: state, gọi API qua `handleAction`, ghép component, toast |
| | `components/` | Thuần: props vào, callback ra — **không** gọi API |
| Ứng dụng | `hooks/` · `routes/navigation.ts` · `utils/resolveContent.ts` | Form state, điều hướng tiêm từ host, slot |
| Tích hợp | `services/` | I/O thuần qua `platformHttp` |
| Lá | `types/` · `validation/` · `constants/` · `mocks/` · `routes/paths.ts` · `menu/` · `permission/` · `localization/` · `theme/` · `utils/` | Không import tầng trên |

## Hai tầng luật — đừng lẫn

| Tầng | Nội dung | Ai gác |
|---|---|---|
| **Cứng** — `npm run lint` FAIL | R1 feature không import `react-router` · R2 không import `axios` · R3 không deep-import kit · R4 không đâm ruột feature khác (host cũng vậy) · R5 `services/` không import React/UI/`pages`·`components`·`hooks` · R6 `components/` không gọi `services/`, `hooks/` không import `components/` · R7 tầng lá không import tầng trên · **M1** `pages/` import `mock*` — cảnh báo trên máy dev, **lỗi khi `CI=true`** (chặn merge) | [templates/eslint.architecture.js](templates/eslint.architecture.js) — [workflows/add-arch-lint.md](workflows/add-arch-lint.md) |
| **Mềm** — advisory, người quyết | Page điều phối / component trình bày · barrel export có chủ đích · kiểu API ở `types/`, kiểu form là `z.infer` ở `validation/` · không tạo folder rỗng · dùng chung giữa feature qua barrel | Agent nhắc khi viết · [review-react](../minipower-frontend-review-react/SKILL.md) khi review |

Rule máy kiểm được thì **đừng nhắc bằng lời** — để lint báo. Rule máy không kiểm được thì **đừng viết "bắt buộc"** — nêu lý do, người quyết.

## Quy tắc cốt lõi (mềm)

- **Page điều phối, component trình bày.** Component nhận dữ liệu + handler; thiếu handler thì ẩn thao tác (không tự gọi API để "bù").
- **Barrel có chủ đích.** Export page + `*Props`/`*ContentContext`, component dùng lại, `call*`, schema, hook, routes, menu, permission, `get*Messages`. **Không** export `apiData`, `fieldStyles`, `mock*`, `FAKE_*` — nội bộ, đổi tự do.
- **Tên export có tiền tố feature** (`{Feature}…`, `{FEATURE}_…`, `{feature}…`) — barrel module dùng `export *`, hai feature trùng tên là `tsc` đỏ.
- **Kiểu API ≠ kiểu form.** DTO/payload ở `types/` (khớp DOC-12); dữ liệu form là `z.infer` ở `validation/`; map hai chiều tường minh (`to{Feature}FormValues`, map payload trong `defaultSubmit`).
- **Feature dùng feature khác qua barrel**; phần thực sự dùng chung nhiều feature (UI, hạ tầng) → đề xuất đưa lên kit, không copy ruột feature này sang feature kia.

## Placeholder trong template

Mọi `templates/` của module `frontend` dùng chung bộ placeholder — thay trong **cả tên file lẫn nội dung**:

| Placeholder | Ví dụ | Dùng ở |
|---|---|---|
| `{Feature}` | `Employee` | Type, component, hàm: `{Feature}ListPage`, `use{Feature}Form`, `callGet{Feature}List` |
| `{feature}` | `employee` | Thư mục feature, biến: `{feature}MenuItems`, khoá quyền `{feature}.view` |
| `{FEATURE}` | `EMPLOYEE` | Hằng: `{FEATURE}_ROUTES`, `{FEATURE}_PERMISSIONS` |
| `{features}` | `employees` | Đoạn URL route: `/{features}/:id` |
| `{apiPath}` | `v1/hrm/employees` | Path API tương đối, không `/` đầu — lấy từ DOC-12 |
| `{Label}` · `{label}` | `Nhân viên` · `nhân viên` | Text tiếng Việt |
| `{LabelEn}` · `{labelEn}` | `Employee` · `employee` | Text tiếng Anh |
| `{app}` · `{AppTitle}` · `{kitSpec}` | `acme-web` · `Acme` · `^0.1.0` | Chỉ ở scaffold |

Tên nhiều từ: `CraftPdf` · `craftPdf` · `CRAFT_PDF` · `craft-pdf`.

## Output bắt buộc

- File mới nằm đúng folder theo bảng *Đặt file ở đâu*; feature được export qua barrel `src/features/index.ts`
- `npm run typecheck` xanh — gồm cả trùng tên export giữa feature
- `npm run lint` xanh — gồm R1–R7; khi merge `CI=true npm run lint` xanh — gồm M1 (không page nào còn gọi `mock*`)
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md)

## Liên quan

- Dựng app host (nơi lint kiến trúc được đặt vào repo mới): [minipower-frontend-scaffold-react](../minipower-frontend-scaffold-react/README.md)
- Quy ước viết code: [minipower-frontend-convention-react](../minipower-frontend-convention-react/README.md)
- Review PR: [minipower-frontend-review-react](../minipower-frontend-review-react/README.md)
