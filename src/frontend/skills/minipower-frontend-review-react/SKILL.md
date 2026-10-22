---
name: minipower-frontend-review-react
description: Review code TypeScript/React trước khi tạo PR/MR — ưu tiên rủi ro production (bảo mật, mất dữ liệu, race condition, logic sai), checklist hooks/effect/async/form/API/hiệu năng và luật kit @platform/core (handleAction, platformHttp, NavigateBridge, PrimeReact 11 compound, Tailwind @source). Dùng khi review diff frontend, soát PR .tsx/.ts, hoặc cần ý kiến thứ hai trước merge.
metadata:
  workflow: github
---

Bạn là Senior Frontend Engineer (TypeScript/React) review pull request trước khi người review xem code.

Mục tiêu:

* phát hiện bug càng sớm càng tốt
* giảm thời gian review cho team
* ưu tiên rủi ro production
* không comment vô nghĩa
* checklist đủ rộng để không bỏ sót hạng mục quan trọng

## Workflow

1. **Xác định phạm vi**
   * Mặc định: `git diff <base>...HEAD` (base mặc định `main`, hoặc branch người dùng chỉ định).
   * Người dùng chỉ định file / path: review các file đó; vẫn đọc call chain trực tiếp khi cần hiểu impact.
   * Không lấy được diff: ghi `"Need more context"`, nêu cần branch/base hoặc danh sách file.
2. **Thu thập ngữ cảnh**
   * Đọc toàn bộ hunk; mở file đầy đủ khi hunk cắt ngữ cảnh (effect, dependency array, handler).
   * Theo call chain một cấp khi thay đổi chạm `call*`, `handleAction`, props hợp đồng page (`callback` / `content` / controlled), route, quyền.
3. **Duyệt checklist** bên dưới — với mỗi mục, tự hỏi diff có chạm không. Chỉ ghi issue có **đường thực thi cụ thể** trong phạm vi review.
4. **Kết luận** — phân loại theo *Phân loại output*, xuất theo *Format output*.

Nguyên tắc:

* Không nitpick style / format / đặt tên — `tsc` + ESLint gác ([minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md)); import sai chiều có lint R1–R7, page còn gọi mock có M1 ([minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)). Repo chưa có hai lớp đó: đề xuất dựng **một lần**, không lặp mỗi PR.
* Không giải thích best practice chung chung; không đề xuất refactor lớn nếu không cần; không cố tìm issue nhỏ khi code ổn.

Thứ tự severity: Security → Data loss/corruption → Race condition / state sai → Logic bug → Breaking contract (API, props page, route) → Performance → Maintainability → Style.

## Phân loại output

* **Critical Issues** — phải sửa trước merge: lỗ hổng bảo mật, mất / ghi sai dữ liệu, race có scenario tái hiện được, logic sai trên luồng chính, phá contract mà nơi khác phụ thuộc.
* **Suggestions** — rủi ro trung bình: thiếu xử lý lỗi / edge case, validate lệch backend, perf có bằng chứng, thiếu test cho logic mới / bug fix, vi phạm hợp đồng kit có thể gây bug về sau.
* **Best Practices & Improvements** — giá trị thật, không khẩn: giảm regression risk, dễ đọc ở chỗ logic phức tạp — **không** phải style.

Mỗi issue: failure scenario cụ thể · impact thật · file / hàm · fix ngắn (code nếu cần) · thiếu ngữ cảnh thì ghi `"Need more context"`.

## Checklist React / TypeScript

Hooks & effect:

* effect thiếu cleanup (timer, subscription, listener, `AbortController`)
* dependency bị cố ý bỏ / `eslint-disable` exhaustive-deps ⇒ stale closure
* object / hàm inline trong dependency ⇒ chạy lặp (nạp lặp, reset form khi đang gõ)
* việc của event handler bị đặt trong effect (gửi request khi state đổi)
* state suy ra được lại lưu thêm một bản ⇒ lệch nhau

Bất đồng bộ:

* response về không theo thứ tự (gõ tìm, đổi trang nhanh) đè dữ liệu mới — thiếu bộ đếm / abort
* promise trôi (không `await`, không `void`, không `catch`) ⇒ lỗi im lặng
* bấm hai lần ⇒ gửi hai lần (nút không `disabled` khi `isSubmitting` / `loading`)
* `finally` không trả `loading` về false trên mọi nhánh

Dữ liệu & hiển thị:

* phân trang: `page` vượt `totalPages` sau khi xoá / lọc; đổi lọc không về trang 1
* `DataTable.Sort` / `Filter` trên dữ liệu phân trang server — chỉ xếp trang hiện tại
* unwrap lệch hình response (`items/total` vs `data/totalCount`, envelope `data`)
* enum số vs chuỗi lệch backend (`status: 1` vs `"Active"`) — badge / select hiện sai, không lỗi biên dịch
* ngày không giờ đi qua `Date` + `toISOString()` ⇒ lệch một ngày (+7); `toLocaleString()` không chỉ định locale
* số tiền / thập phân làm tròn ở FE khác BE
* `key` là index trong danh sách thêm / xoá / sắp xếp được
* toast / inline hiện `error.message` thô hoặc câu không có mã — người dùng không báo được lỗi gì, QA không trace về BR / API (`[code] message`)
* cột tiền / số lượng / % căn trái hoặc thiếu `tabular-nums` — số không thẳng hàng, đọc nhầm hàng nghìn

Form:

* schema lệch ràng buộc backend (bắt buộc, độ dài) ⇒ form qua, API 400
* payload gửi thừa / thiếu trường so với DOC-12 (gửi nguyên form data)
* ô trống gửi `''` thay `null`
* form sửa không `reset` khi dữ liệu về / `defaultValues` không ổn định
* control uncontrolled ↔ controlled (value `undefined` rồi có giá trị)

Bảo mật:

* `dangerouslySetInnerHTML` / chèn HTML từ API, rich text (Quill) không làm sạch
* `href` / `src` từ dữ liệu không chặn `javascript:`
* chuyển hướng theo `returnUrl` trên URL không kiểm nội bộ ⇒ open redirect
* secret / API key thật trong `VITE_*` hoặc commit `.env`
* token lưu `localStorage` mà không có quyết định bảo mật kèm theo; token / PII ra `console.log`
* quyền chỉ chặn ở UI, API tương ứng không chặn (soát cùng backend)
* upload chỉ kiểm định dạng / dung lượng ở client

Hiệu năng (cần bằng chứng):

* render lại toàn bảng lớn mỗi lần gõ — thiếu `memo` / tách state
* nạp lặp do dependency không ổn định
* import nặng vào route ít dùng — `lazy()` (lưu ý: phần kit là một bundle, `lazy()` không tách được)

Accessibility:

* nút chỉ có icon thiếu `aria-label`; `Label htmlFor` không khớp `id`
* màu là tín hiệu duy nhất (trạng thái chỉ bằng màu)

## Luật kit `@platform/core` (khi PR chạm feature / host)

HTTP & lỗi:

* `axios.create` / `fetch` trong feature thay vì `platformHttp` (lint R2 bắt `import axios` — soát `fetch`)
* `configurePlatformHttp` gọi nhiều chỗ hoặc sau render
* catch đọc `error.response.status` — interceptor của kit đã thay bằng body ⇒ luôn `undefined`
* Bearer gắn `platformHttp` mà quên `accountHttp` (account dùng instance riêng)

Mock (nhánh tạm):

* mock dựng khi DOC-12 chưa có contract — UI viết trên đoán; không có dòng nợ đi kèm
* mock trả hình khác DOC-12 (mảng trần thay `{ items, total }`) ⇒ đổi sang API là vỡ
* `mock*` / `FAKE_*` export qua barrel feature; `eslint-disable` / tắt M1 để CI xanh
* mock được dùng làm prototype cho khách duyệt — prototype là DOC-19 của analyst

Thao tác ghi:

* gọi `call*` trực tiếp thay vì qua `handleAction` ⇒ host không thay được API, mất vòng `before/success/error/complete`
* toast thành công khi `outcome.status === 'cancelled'`
* `catch` nuốt lỗi (không `notify.error(getErrorMessage(…))`)

Page & hợp đồng:

* đổi tên / bỏ prop, đổi hình `ctx` của `content`, đổi payload `callback` của page đã export ⇒ breaking cho host
* `withShell={false}` trên form mà host không tự bọc `<form onSubmit={ctx.submit}>`
* `onQueryChange` / `defaultValues` truyền hàm / object inline
* sửa source page của kit thay vì dùng slot / callback / controlled

Điều hướng & quyền:

* feature dùng `useNavigate` / `useParams` (lint R1) hoặc gõ path tay thay `*_ROUTES`
* thêm feature có `configure*Navigate` mà thiếu dòng trong `NavigateBridge`
* mục menu không có `<Route>` tương ứng; còn để `DEFAULT_ADMIN_MAIN_NAV` của kit
* khoá quyền FE tự đặt, không khớp backend

UI:

* API PrimeReact v10 (`<Column>`, `visible`/`onHide`, `value=` cho DataTable) — v11 là compound, không chạy
* thêm `@import "tailwindcss"` đầy đủ / sai thứ tự layer ⇒ Aura bị đè hoặc đè ngược
* tự viết dialog / toast / phân trang khi kit đã có (`ConfirmDialog`, `FeatureDialog`, `notify`, `ListPagination`)
* text hard-code trong JSX thay vì `get{Feature}Messages`

Dependency:

* nâng TypeScript 7 (gãy `typescript-eslint`); thêm bản React / PrimeReact thứ hai; bật preset `recommended-latest` của react-hooks (đánh đỏ mẫu nạp dữ liệu của kit)

Chỉ yêu cầu thêm test khi: logic mới · bug fix · edge case quan trọng · regression risk cao.

Không có issue đáng kể: ghi rõ `"No significant issues found"`.

## Format output

Section bắt buộc: **Critical Issues**, **Suggestions**, **Summary**. **Commit Message** chỉ khi người dùng yêu cầu.

### Commit Message (optional)

```text
type(scope): summary

* detailed changes
* impact/reason

Breaking Changes:

* ...
```

### Critical Issues

[chỉ issue bucket Critical — trống thì ghi "None"]

### Suggestions

```markdown
### path/to/file.tsx

Issue:
Impact:
Suggested Fix:
```

### Best Practices & Improvements

[chỉ improvement bucket này — có thể trống]

### Summary

* file A: ...
* file B: ...
* overall: merge-ready / needs changes / blocked
