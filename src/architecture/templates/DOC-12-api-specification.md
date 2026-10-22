# DOC-12 — Đặc tả API

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **OpenAPI Specification (OAS) 3.x** — tiêu chuẩn de facto REST API

---

## 1. Tổng quan

| Mục | Giá trị |
|-----|---------|
| **API title** | |
| **Version** | v1 |
| **Base URL** | `https://api.example.com/v1` |
| **OpenAPI file** | `openapi.yaml` (source of truth) |

## 2. Xác thực & Phân quyền

| Method | Mô tả |
|--------|-------|
| Bearer JWT | Header: `Authorization: Bearer {token}` |
| OAuth2 | Scopes: `read`, `write` |
| API Key | Header: `X-API-Key` |

Scheme chọn **một** khi có DEC; trước DEC endpoint mới không tự bịa header xác thực riêng. Backend .NET đăng ký qua Jarvis Authentication.

**Tenant / user từ phiên:** request đã authenticated **không** nhận `tenantId` / `userId` trong body hay query để ghi đè phiên.

**RBAC / ABAC:** [Rule tóm tắt — trace BR/FR]

## 3. Quy ước chung

### Ranh giới HTTP

| Loại | Hành vi trên dây |
|------|------------------|
| Command | Đổi state. Body là DTO đầu vào; kết quả là DTO hoặc định danh — **không** entity domain |
| Query | Không đổi state. Filter, phân trang, sort là tham số của request đọc |
| Một action | Một use case. Không tách hai action để né DTO, không gộp hai use case |

### Request / Response

| Convention | Value |
|------------|-------|
| Content-Type | `application/json` |
| Tên field | **camelCase** trên JSON (`createdAt`) ↔ PascalCase trong code ↔ `snake_case` trên DB — cùng một khái niệm, không đổi nghĩa khi đổi tầng |
| `id` và khoá ngoại | chuỗi **UUIDv7**, cùng giá trị cột `id` bảng đích; không identity số nguyên |
| Date format | ISO 8601, **UTC+0** (`2026-01-15T02:00:00Z`). Không gắn offset nghiệp vụ vào giá trị; múi giờ (nếu có) là field riêng `…Timezone` |
| Pagination | `?page=1&size=20` |
| Sort | `?sort=createdAt:desc` |
| Huỷ | Action nhận `CancellationToken`, truyền xuống handler |

### Phản hồi lỗi chuẩn

Body lỗi có đúng hai thành phần người dùng cần; UI hiển thị `[code] message`.

```json
{
  "code": "INV-API-012",
  "message": "Không thể ký hoá đơn — chưa cấu hình chứng thư số"
}
```

| Thành phần | Quy tắc |
|------------|---------|
| `code` | Token đã khai trong `IErrorCode` phía backend; UI bọc `[]` |
| `message` | Tiếng Việt, câu đầy đủ, cho người dùng cuối |
| Cấm | Stack trace, message exception của framework, object domain, body lỗi không có `code` |

| Họ `code` | Khi nào |
|-----------|---------|
| `{MOD}-VAL-NNN` | Dữ liệu đầu vào không hợp lệ |
| `{MOD}-BR-NN` | Vi phạm business rule |
| `{MOD}-API-NNN` | Từ chối ở use case API |
| `SYS-NNN` | Lỗi hệ thống, mất kết nối, không có quyền (`SYS-403`) |
| *(dự án)* | Họ riêng cho đối tác ngoài — khai trong convention dự án |

Wrapper response của framework (Jarvis `BaseResponse`) bao ngoài hai field này — hình dạng theo `minipower-backend-swashbuckle-dotnet`. HTTP status đi kèm, không thay `code`.

### Mã trạng thái HTTP

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 500 | Internal error |

### Bảo mật hợp đồng HTTP

| # | Quy tắc |
|---|---------|
| 1 | Response lỗi không lộ nội bộ (stack, exception framework, object domain) |
| 2 | Tenant từ phiên — không ghi đè qua body khi phiên đã có tenant |
| 3 | DTO ở ranh giới — không entity trên dây; list / detail chỉ field use case cần, không dump graph quan hệ |
| 4 | Production chỉ HTTPS; CORS cấu hình ở host, không `*` kèm credential |
| 5 | Không tin client — mọi kiểm tra nhạy cảm lặp trên handler; contract không thay AuthZ |
| 6 | Rate limit / WAF: `TBD` platform, ghi DOC-13 / DOC-17 |

## 4. Danh mục endpoint

| Method | Path | Summary | Auth | FR trace |
|--------|------|---------|------|----------|
| POST | `/auth/login` | Login | Public | FR-001 |
| GET | `/orders/{id}` | Get order | Bearer | FR-002 |

## 5. Chi tiết endpoint — [METHOD] [PATH]

### `[METHOD] /resource/{id}`

**Description:** [FR-xxx]

**Path parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUIDv7) | Y | |

**Query parameters:**

| Name | Type | Required | Default |
|------|------|----------|---------|
| | | | |

**Request body:**

```json
{
  "field": "value"
}
```

**Response 200:**

```json
{
  "id": "01936b8e-7c2a-7a1e-8f3b-9c0d1e2f3a4b",
  "field": "value",
  "createdAt": "2026-01-15T02:00:00Z"
}
```

**Response 4xx/5xx:** → Phản hồi lỗi chuẩn (§3)

## 6. Khung OpenAPI (copy to openapi.yaml)

```yaml
openapi: 3.0.3
info:
  title: API Name
  version: 1.0.0
paths:
  /auth/login:
    post:
      summary: Login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Success
```

## 7. Giới hạn tốc độ & SLA

| Limit | Value |
|-------|-------|
| Rate | 100 req/min per client |
| Timeout | 30s |

## 8. Truy vết

| Endpoint | FR | UC | INT |
|----------|----|----|-----|
| | | | |
