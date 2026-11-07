---
name: minipower-frontend-api-react
description: Tích hợp API backend cho frontend kit @platform/core — configurePlatformHttp một lần, services/req.ts dùng chung platformHttp, hàm call* path tương đối, tham số danh sách khớp PagedListRequest (page/size/search/filter/sort/columns), unwrap { items, total }, lỗi qua getErrorMessage, gắn Bearer token bằng interceptor; mock tạm khi DOC-12 đã có mà backend chưa chạy (không phải prototype). Dùng khi thêm service gọi REST, nối màn hình với endpoint DOC-12, đổi mock sang API thật, hoặc gặp lỗi baseURL / proxy / API key / 401.
metadata:
  workflow: github
  version: 1.0.0
---

# Tích hợp API (@platform/core) — Orchestrator

Skill sở hữu tầng **tích hợp** của feature: `types/` (kiểu theo DOC-12) · `services/` (`call*`) · `utils/apiData.ts` (unwrap). Page gọi `call*` qua `handleAction` — phần đó thuộc [crud](../minipower-frontend-crud-react/SKILL.md).

Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Nối màn hình với endpoint đã có trong DOC-12 | [workflows/add-service.md](workflows/add-service.md) |
| DOC-12 **đã có** contract nhưng backend chưa chạy được — chạy trước bằng mock tạm, rồi đổi sang API thật | [workflows/add-mock.md](workflows/add-mock.md) (nhánh tuỳ chọn, cần người duyệt hoãn) |
| DOC-12 **chưa có** contract | **Dừng** — chưa viết UI trên dữ liệu giả; hỏi một lượt ở cổng readiness |
| Bộ lọc / sắp xếp / phân trang gửi lên API | [reference/list-query.md](reference/list-query.md) |

Mock ở đây là **chỗ đứng tạm cho code thật**, không phải prototype. Prototype / wireframe là DOC-19 của [analyst](../../../analyst/README.md), làm trước SRS — frontend nhận việc sau H4.

## Luồng dữ liệu

```text
page / hook ──handleAction──▶ call{…}{Feature}()  ──▶ services/req.ts = platformHttp (axios dùng chung)
                                                          │ request: baseURL ← VITE_API_URL · header API key (nếu cấu hình)
                                                          │ response lỗi: reject BODY lỗi (không phải AxiosError)
page ◀── unwrap{Feature}ListResult / unwrap{Feature} ◀────┘
```

Host gọi `configurePlatformHttp({ baseURL, apiKey, apiKeyHeader })` **một lần** trước render — mẫu: [scaffold `src/app/http.ts`](../minipower-frontend-scaffold-react/templates/src/app/http.ts).

## Xác thực request

| Backend dùng | Làm gì |
|---|---|
| Cookie phiên (HttpOnly) | Không làm gì — instance của kit bật `withCredentials` |
| API key | `VITE_API_KEY` + `VITE_API_KEY_NAME` → `configurePlatformHttp`. Giá trị **lộ trong bundle** — chỉ hợp hệ nội bộ |
| Bearer token | Kit chưa có sẵn ⇒ [templates/app/auth.ts](templates/app/auth.ts): interceptor gắn lên `platformHttp` **và** `accountHttp` (account dùng instance riêng) một lần ở bootstrap. Lưu token ở đâu là quyết định bảo mật của dự án — hỏi, đừng tự chọn |

## Hợp đồng lỗi

- Interceptor của kit reject bằng **`error.response.data`** (body lỗi backend). Không có response (mất mạng, timeout, CORS) ⇒ `{ Status: 0, Message: 'Không thể kết nối tới máy chủ' }`. Response có nhưng body rỗng ⇒ reject bằng chuỗi `''` — mất cả mã HTTP.
- Hệ quả: trong `catch`, **không có** `error.response.status`. Hiển thị lỗi bằng `getErrorMessage(error, fallback)` — đọc `message`/`Message`/`title`/`detail`/`error.message` của body, không đọc được thì dùng `fallback`.
- Cần phân biệt 401/403: backend phải trả mã trong body (`status` của ProblemDetails, hoặc `Status`) — đừng trả 401 body rỗng.

## Quy tắc cốt lõi

- **Một axios instance.** `services/req.ts` re-export `platformHttp`; feature **không** `axios.create` — lint R2 chặn `import axios` trong feature.
- **Path tương đối, không `/` đầu** (`'v1/hrm/employees'`) — ghép sau `VITE_API_URL`; nguồn path là **DOC-12**, không tự đặt.
- **`call*` trả nguyên AxiosResponse**; page lấy body bằng `unwrap*`.
- **Kiểu theo DOC-12**: enum số hay chuỗi đúng như backend, trường tuỳ chọn `?: T | null`. Thiếu thông tin ⇒ hỏi, không đoán.
- **Tham số danh sách khớp `PagedListRequest`** — `size` (không `pageSize`), `filter` là chuỗi JSON, `sort` dạng `Property:desc` ([reference/list-query.md](reference/list-query.md)).
- **Mock là nhánh tạm, không nằm trong luồng mặc định.** Chỉ mở khi DOC-12 đã có contract mà backend chưa chạy, người duyệt hoãn và có ghi nợ. Page còn gọi `mock*` ⇒ lint **M1**: cảnh báo trên máy dev, **lỗi khi CI** — không merge được.

## Templates

Placeholder: [architecture § Placeholder](../minipower-frontend-architecture-react/SKILL.md#placeholder-trong-template).

| Template | Đích |
|---|---|
| [templates/types/index.ts](templates/types/index.ts) | `src/features/{feature}/types/index.ts` |
| [templates/services/req.ts](templates/services/req.ts) | `services/req.ts` |
| [templates/services/{feature}.ts](templates/services/{feature}.ts) | `services/{feature}.ts` — `call*` |
| [templates/services/index.ts](templates/services/index.ts) | `services/index.ts` |
| [templates/utils/apiData.ts](templates/utils/apiData.ts) | `utils/apiData.ts` — nội bộ |
| [templates/app/auth.ts](templates/app/auth.ts) | `src/app/auth.ts` — chỉ khi Bearer |

Nhánh mock tạm — **chỉ** theo [workflows/add-mock.md](workflows/add-mock.md):

| Template | Đích |
|---|---|
| [templates/mock/mocks/](templates/mock/mocks/) | `mocks/` — seed JSON chép hình response DOC-12 |
| [templates/mock/constants/](templates/mock/constants/) | `constants/` — `FAKE_*` đọc từ seed |
| [templates/mock/services/{feature}Mock.ts](templates/mock/services/{feature}Mock.ts) | `services/{feature}Mock.ts` — `mock*` |

## Tham chiếu

- [reference/list-query.md](reference/list-query.md) — tham số `PagedListRequest`, cây `filter` + toán tử + giới hạn, dạng kết quả unwrap nhận được. Không load mặc định.

## Output bắt buộc

- Mỗi endpoint DOC-12 dùng tới có đúng một hàm `call*`; kiểu payload / params ở `types/`
- Không file nào trong feature import `axios` — `npm run lint` xanh (R2)
- Khi merge: không page nào còn gọi `mock*` — `CI=true npm run lint` xanh (M1)
- `npm run typecheck` xanh
- Chạy thật: danh sách tải được qua proxy `/api`; lỗi backend hiện toast có nghĩa (không phải *"Request failed with status code 500"*)
- Code theo [minipower-frontend-convention-react](../minipower-frontend-convention-react/SKILL.md); file đặt đúng folder theo [minipower-frontend-architecture-react](../minipower-frontend-architecture-react/SKILL.md)

## Liên quan

- Page gọi API qua `handleAction`: [minipower-frontend-crud-react](../minipower-frontend-crud-react/README.md)
- Thay API của page có sẵn trong kit bằng `callback.onSubmit`: [minipower-frontend-customization-react](../minipower-frontend-customization-react/README.md)
- API phía backend .NET: [backend](../../../backend/README.md)
