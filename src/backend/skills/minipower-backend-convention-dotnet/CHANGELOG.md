# Changelog — minipower-backend-convention-dotnet

## 1.1.0 · 2026-11-13

- Mục 3.1 / 3.2: **controller (Host) không xử lý lỗi** — không `try`/`catch`, không `throw`, không trả lỗi tay (`BadRequest` / `NotFound` / `StatusCode(4xx)` / `Problem`); họ `BusinessException` chỉ ném ở Application / Domain / Infrastructure (guard đầu vào, phạm vi tenant/org, "không tìm thấy" nằm ở đó). Thêm ví dụ *Tránh* + dòng *Quy tắc cốt lõi*.
- Mục 14 + **14.1 Dải mã lỗi**: format mã lỗi Platform thay họ `{MOD}-VAL-` / `-BR-` / `-API-` / `SYS-` — chuỗi 5 chữ số (`int.Parse`), duy nhất toàn solution (`ErrorCodeHelper` `Dictionary.Add`); Platform `9xxxx`, sản phẩm `0xxxx`–`8xxxx` khối 10.000 / module, `99xxx` = mã framework bọc HTTP status (`99404`…); trên dây `{EntryAssembly}:{mã}`. Bảng *Khối đang dùng* là nguồn duy nhất cho cả module Platform lẫn module sản phẩm (không khai ở tài liệu dự án). Khối `1xxxx` cấp cho host `Sample`.
- Mục 14: dòng *Câu có tham số* — `Description` có `{0}`…, ném `BusinessException(mã, new ErrorMessageArgs(...))`; tham số chỉ dữ liệu nghiệp vụ.
- Mục 14: `error.message` là câu cuối người dùng đọc — FE hiện nguyên `[code] message`, không bọc lại (cặp với frontend convention § 5.1). Thêm dòng *Lỗi thiếu message*: không trả 401/403/404/5xx body rỗng hoặc chỉ có `code`; message exception vào `systemMessage` / log.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
