# minipower-frontend-api-react

Skill nối frontend với API backend theo kit `@platform/core`: kiểu dữ liệu theo DOC-12, hàm `call*` trên axios dùng chung, unwrap response, lỗi. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|------------|----------|
| Endpoint đã có — nối vào màn hình | [workflows/add-service.md](./workflows/add-service.md) |
| DOC-12 đã có nhưng backend chưa chạy — mock tạm, sau đó đổi sang API thật | [workflows/add-mock.md](./workflows/add-mock.md) — nhánh tuỳ chọn, cần người duyệt hoãn |
| Bộ lọc / sắp xếp / phân trang gửi lên API | [reference/list-query.md](./reference/list-query.md) |

DOC-12 chưa có ⇒ **dừng**, không viết UI trên dữ liệu giả.

**Không dùng cho:** dựng cả màn danh sách / form → [crud](../minipower-frontend-crud-react/README.md) · thay API của page có sẵn trong kit → [customization](../minipower-frontend-customization-react/README.md) · viết DOC-12 → [architecture (SA)](../../../architecture/README.md) · làm prototype / wireframe → DOC-19 của [analyst](../../../analyst/README.md) — mock ở đây không phải prototype.

## Cách gọi

```text
@.opencode/skills/minipower-frontend-api-react/workflows/add-service.md

Feature Employee: nối GET/POST/PUT/DELETE v1/hrm/employees theo DOC-12 §4.1, enum status số 0/1
```

## Quy tắc (tóm tắt)

- Một axios instance cho cả app: `configurePlatformHttp` ở bootstrap, feature dùng `platformHttp` qua `services/req.ts`.
- Path tương đối lấy từ DOC-12; `call*` trả AxiosResponse, page lấy body bằng `unwrap*`.
- Lỗi đến `catch` là **body** lỗi của backend kèm `status` — hiện nguyên `[code] message` bằng `getErrorMessage`, không tự dựng câu, không đọc `error.response.status`. Client riêng (`fetch`, axios khác) reject theo cùng hợp đồng.
- Mock là nhánh tạm ngoài luồng mặc định, cùng chữ ký `call*`. Page còn gọi `mock*` thì lint M1 cảnh báo trên máy dev và **báo lỗi trong CI** — không merge được.

## Xác thực

| Backend | Làm gì |
|---|---|
| Cookie phiên | Không gì — kit gửi cookie sẵn |
| API key | `VITE_API_KEY` / `VITE_API_KEY_NAME` (lộ trong bundle — chỉ hệ nội bộ) |
| Bearer token | [templates/app/auth.ts](./templates/app/auth.ts) — interceptor một lần ở bootstrap, gắn cả `platformHttp` lẫn `accountHttp` |

## Liên quan

- [minipower-frontend-crud-react](../minipower-frontend-crud-react/README.md) — page gọi `call*` qua `handleAction`
- [minipower-frontend-form-react](../minipower-frontend-form-react/README.md) — schema khớp ràng buộc DOC-12
- Bản đồ module: [frontend/README.md](../../README.md)
