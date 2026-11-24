# Changelog — minipower-frontend-convention-react

## 1.1.1 · 2026-11-23

- Rút gọn `description` sau khi merge `develop`: bỏ chi tiết thi hành, giữ từ khoá kích hoạt + hợp đồng lỗi mới (A17).

## 1.1.0 · 2026-11-13

- Thêm mục 5.1 *Lỗi từ backend — không bọc lại*: FE hiện nguyên `[code] message` backend trả; thiếu message thì `[code | HTTP {status}] {reason phrase RFC 9110}`; cấm ghép tiền tố / hậu tố, đổi status / `code` sang câu FE, hiện `systemMessage`, wrapper `throw new Error(text)`. `fallback` của `getErrorMessage` chỉ cho lỗi không phải HTTP.
- Interceptor kit reject body lỗi **kèm `status`** HTTP. Cần kit `@platform/core` có `getErrorMessage` đọc `code` + `status`.
- Mở rộng `description`.
- Mục 5.1: format `code` Platform `{EntryAssembly}:{5 chữ số}` (Platform `9xxxx`, sản phẩm `0xxxx`–`8xxxx`, `99xxx` bọc HTTP status) — FE không cắt tiền tố, không parse số, không tự chế `99{status}`. Ví dụ cập nhật `[Sample.Api:98501]`, `[Sample.Api:99404]`.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
