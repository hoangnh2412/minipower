---
name: minipower-frontend-convention-react
description: Quy ước code TypeScript/React theo kit @platform/core — đặt tên (*Page, use*, call*, *Schema, *_ROUTES, configure*Navigate…), `as const` thay enum, PrimeReact 11 compound + `unstyled` + Tailwind, text qua get*Messages, dùng ConfirmDialog/FeatureDialog/ListPagination/notify của kit, xử lý lỗi qua handleAction + getErrorMessage. Dùng khi viết hoặc sửa file .ts/.tsx, và khi cần dựng tsconfig strict + ESLint để ép convention lúc CI.
metadata:
  workflow: github
---

# Quy ước code TypeScript / React — Orchestrator

Skill cắt ngang mọi skill `minipower-frontend-*-react`: code sinh ra hoặc sửa đổi phải theo quy ước này.

Đi cặp với [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md) — hai skill trả lời hai câu hỏi khác nhau, không chồng lấn:

| Skill | Trả lời câu hỏi | Cổng cứng |
|---|---|---|
| **convention** (skill này) | **Code trong file viết thế nào?** | `npm run typecheck` + `npm run lint` |
| **architecture** | **File nằm ở đâu? Import thế nào?** | `npm run lint` — luật R1–R7 + M1 |

Toàn văn quy ước (11 mục): [reference/coding-convention.md](reference/coding-convention.md). Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Repo chưa có `tsconfig` strict + `eslint.config.js` | [workflows/init.md](workflows/init.md) |
| Repo mới dựng bằng scaffold | Đã có sẵn — [scaffold bước 3](../minipower-frontend-scaffold-react/workflows/scaffold.md) |
| Đang viết / sửa code | Không cần workflow — theo *Quy tắc cốt lõi* + reference |
| Review PR | Không nitpick style bằng tay — [review-react](../minipower-frontend-review-react/SKILL.md) lo rủi ro, lint lo style |

## Hai tầng — đừng lẫn

| Tầng | Nội dung | Ai gác |
|---|---|---|
| **Cứng** — CI FAIL được | Null-safety, implicit any (`strict`) · `import type` (`verbatimModuleSyntax`) · cấm `enum`/`namespace` (`erasableSyntaxOnly`) · rules-of-hooks · exhaustive-deps · `no-explicit-any` · biến thừa · `console.log` · `==` · `en.ts` thiếu key so với `vi.ts` · trùng tên export giữa feature | [templates/tsconfig.json](templates/tsconfig.json) + [templates/eslint.config.js](templates/eslint.config.js) |
| **Mềm** — advisory, người quyết | Hệ đặt tên export (mục 1) · tổ chức file (2) · controlled/uncontrolled (4) · PrimeReact compound + `unstyled` (6) · text qua localization (8) · dùng sẵn của kit (9) · bảo mật (10) | Agent nhắc khi viết · [review-react](../minipower-frontend-review-react/SKILL.md) khi review |

Rule máy kiểm được thì **đừng nhắc bằng lời** — để `tsc`/lint báo. Rule máy không kiểm được thì **đừng viết "bắt buộc"** — nêu lý do, người quyết.

## Quy tắc cốt lõi

Phần mềm, hay sai nhất:

- **PrimeReact 11 là API compound** (`Dialog.Root`, `Select.Root`, `DataTable.Root`…). API v10 (`<Column>`, `visible`/`onHide`, `value=` cho DataTable) không chạy — đối chiếu mục 6 trước khi viết UI.
- **Control dùng `unstyled` + class** từ `components/fieldStyles.ts`; nút dùng skin `pr-btn-*` của kit.
- **Dùng sẵn của kit trước khi tự viết** — toast `notify`, `ConfirmDialog`, `FeatureDialog`, `ListPagination`, `RowActions`, `FieldSelect` (bảng mục 9).
- **Thao tác ghi đi qua `handleAction`**; kiểm `outcome.status === 'cancelled'` trước toast; lỗi ⇒ `notify.error(getErrorMessage(error, fallback))` — thông báo mang mã `[code] message`, không `error.message` thô (mục 5).
- **Cột số căn phải + `tabular-nums`**, cột chữ căn trái (mục 6).
- **Text người dùng thấy qua `get{Feature}Messages(locale)`**, không hard-code trong JSX.
- **Enum là object `as const`** + `…Value` + `…_LABEL` + `…_OPTIONS`, giá trị khớp backend.

## Templates

| Template | Đích trong repo | Nhiệm vụ |
|---|---|---|
| [templates/tsconfig.json](templates/tsconfig.json) | `tsconfig.json` | `strict` · `verbatimModuleSyntax` · `erasableSyntaxOnly` · `paths` chống trùng bản React khi link kit |
| [templates/eslint.config.js](templates/eslint.config.js) | `eslint.config.js` | typescript-eslint + hai rule hooks + luật kiến trúc (spread `eslint.architecture.js`) |
| [templates/fieldStyles.ts](templates/fieldStyles.ts) | `src/features/{feature}/components/fieldStyles.ts` | Class ô nhập, nhãn, nút — khớp kit |
| [templates/localization/](templates/localization/) | `src/features/{feature}/localization/` | `vi.ts` chuẩn · `en.ts` khoá cùng shape · `get{Feature}Messages` |

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

**Không** bật preset `recommended-latest` của `eslint-plugin-react-hooks` v7 trên code theo kit — rule React Compiler (`set-state-in-effect`, `refs`) đánh đỏ mẫu nạp dữ liệu chuẩn `useEffect(() => { void reload() }, [reload])`.

## Kiểm tra

```bash
npm run typecheck   # tsc --noEmit — strict, import type, cấm enum
npm run lint        # eslint . — hooks, any, console, luật kiến trúc R1–R7 (+ M1: lỗi khi CI=true)
```

Hai lệnh này trong CI là chỗ convention thành **điều kiện cứng**; phần còn lại của skill là lời.

## Output bắt buộc

- Code mới/sửa: `npm run typecheck` và `npm run lint` xanh, không thêm `eslint-disable`
- Khi dựng mới ([workflows/init.md](workflows/init.md)): `tsconfig.json` + `eslint.config.js` trong repo, hai lệnh kiểm tra nằm trong CI
- File đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Dựng app (nơi hai template được đặt vào repo mới): [minipower-frontend-scaffold-react](../minipower-frontend-scaffold-react/README.md)
- Review PR: [minipower-frontend-review-react](../minipower-frontend-review-react/README.md)
