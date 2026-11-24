# Changelog — minipower-frontend-api-react

## 1.1.1 · 2026-11-23

- Rút gọn `description` sau khi merge `develop`: bỏ chi tiết thi hành, giữ từ khoá kích hoạt + hợp đồng lỗi mới (A17).

## 1.1.0 · 2026-11-13

- *Hợp đồng lỗi* viết lại theo nguyên tắc "không bọc lại lỗi backend": interceptor reject nguyên body **kèm `status`** (body rỗng ⇒ `{ status }`, body `Blob` JSON được đọc); `getErrorMessage` ⇒ `[code] message`, thiếu message ⇒ `[code | HTTP {status}] {reason phrase}`; client riêng (`fetch`, SSE, axios khác, wrapper) theo cùng hợp đồng.
- `add-service`: thêm bẫy tự dựng câu lỗi; `error.status` thay `error.response.status`.
- Mở rộng `description`.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
