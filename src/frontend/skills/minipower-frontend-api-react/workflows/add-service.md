# Workflow: Nối feature với endpoint backend

Áp dụng khi endpoint **đã có trong DOC-12** (hoặc Swagger của backend). DOC-12 có mà backend chưa chạy → nhánh tuỳ chọn [add-mock.md](add-mock.md). DOC-12 chưa có → dừng, hỏi ở cổng readiness.

## Checklist

```text
- [ ] 1. Đọc DOC-12: method · path · query · body · response · enum · mã lỗi
- [ ] 2. types/ — DTO, payload, list params, list result, hằng enum
- [ ] 3. services/req.ts (một lần mỗi feature) + services/{feature}.ts (call*)
- [ ] 4. utils/apiData.ts — unwrap khớp dạng response thật
- [ ] 5. Page gọi call* qua handleAction (crud) — lấy body bằng unwrap*
- [ ] 6. Xác thực: cookie / API key / Bearer — đúng cơ chế backend
- [ ] 7. typecheck + lint + gọi thật qua proxy
```

## Bước 1 — Đọc DOC-12, hỏi một lượt

| Cần | Nếu DOC-12 thiếu |
|---|---|
| Path tương đối (`v1/hrm/employees`) | Hỏi — không tự đặt theo tên màn hình |
| Enum: số hay chuỗi, giá trị cụ thể | Hỏi — sai kiểu là badge / select hiện sai, không lỗi biên dịch |
| Dạng response danh sách (`items/total`? envelope `data`?) | Gọi thử qua Swagger, chép một mẫu response vào câu hỏi |
| Trường bắt buộc, độ dài | Đưa sang [form](../../minipower-frontend-form-react/README.md) — schema phải khớp |

## Bước 2 — types/

Copy [templates/types/index.ts](../templates/types/index.ts), sửa theo DOC-12:

- Enum = object `as const` + `…Value` + `…_LABEL` + `…_OPTIONS`; giá trị đúng như backend.
- Trường backend có thể trả `null` ⇒ `?: T | null`.
- `Get{Feature}ListParams`: giữ `page` · `size` · `search` · `filter` · `sort` · `columns`, thêm lọc riêng của DOC-12.

## Bước 3 — services/

| Template | Đích |
|---|---|
| [templates/services/req.ts](../templates/services/req.ts) | `services/req.ts` |
| [templates/services/{feature}.ts](../templates/services/{feature}.ts) | `services/{feature}.ts` |
| [templates/services/index.ts](../templates/services/index.ts) | `services/index.ts` — bỏ khối mock nếu không dùng |

Một `call*` cho một endpoint, tên theo động từ: `callGet…List` · `callGet…` · `callCreate…` · `callUpdate…` · `callDelete…` · `callSet…Status`. Resource con (vd. địa chỉ của nhân viên): file riêng `services/{subResource}.ts`, path `${BASE}/${id}/addresses`.

## Bước 4 — Unwrap

Copy [templates/utils/apiData.ts](../templates/utils/apiData.ts). So với **response thật**: backend bọc thêm envelope `{ data: … }` ⇒ thêm một lần `unwrapData` ở hàm tương ứng. Chi tiết dạng chấp nhận: [reference/list-query.md § 3](../reference/list-query.md#3-kết-quả-danh-sách).

## Bước 5 — Dùng trong page

```ts
const result = unwrap{Feature}ListResult(await callGet{Feature}List(query))

await handleAction({
  ctx: { item },
  callback: callback?.delete,                       // host thay API được
  defaultSubmit: async (target: {Feature}) => {
    await callDelete{Feature}(target.id)
  },
  getPayload: ({ item }) => item,
  onSuccess: () => reload(),
})
```

Mẫu đầy đủ (chặn response cũ, toast, controlled): [crud templates](../../minipower-frontend-crud-react/templates/route-pages/pages/).

## Bước 6 — Xác thực

| Backend | Việc |
|---|---|
| Cookie | Không làm gì |
| API key | Đặt `VITE_API_KEY` / `VITE_API_KEY_NAME` trong `.env.development` — không commit giá trị thật |
| Bearer | [templates/app/auth.ts](../templates/app/auth.ts) → `installBearerAuth(getToken)` một lần ở `main.tsx`, sau `configureAppHttp()`; `getToken` đọc từ chỗ dự án đã chốt |

## Bước 7 — Validate

```bash
npm run typecheck
npm run lint
npm run dev     # backend chạy ở VITE_API_PROXY_TARGET
```

Mở màn hình, xem tab Network: request đi `/api/{apiPath}`, query đúng tên tham số, response unwrap ra đủ `items` + `total`. Tắt backend: toast hiện *"Không thể kết nối tới máy chủ"* — không trắng màn hình.

## Anti-patterns

| ❌ | Vì sao |
|---|---|
| `axios.create()` trong feature | Mất baseURL, API key, chuẩn hoá lỗi — lint R2 đỏ |
| `fetch('/api/…')` trong page | Như trên, và không qua `handleAction` ⇒ host không thay được API |
| Path có `/` đầu hoặc host tuyệt đối (`http://…/v1/…`) | Bỏ qua `VITE_API_URL` — vỡ khi đổi môi trường |
| Đọc `error.response.status` trong catch | Interceptor của kit đã thay lỗi bằng body + `status` — dùng `error.status`, `error.response` luôn `undefined` |
| Tự dựng câu lỗi trong service / page (`new Error('Không tải được…')`, ghép tiền tố, đổi `status` sang câu) | Mất `code` backend, người dùng không báo được mã — hiện nguyên qua `getErrorMessage` ([convention § 5.1](../../minipower-frontend-convention-react/reference/coding-convention.md#51-lỗi-từ-backend--không-bọc-lại)) |
| `res.data.items` rải khắp page | Lệch dạng response là vỡ nhiều chỗ — gom về `unwrap*` |
| Kiểu payload = kiểu form | Gửi thừa trường (vd. `status` khi sửa); map tường minh trong `defaultSubmit` |
