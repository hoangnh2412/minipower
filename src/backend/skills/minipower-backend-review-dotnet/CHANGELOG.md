# Changelog — minipower-backend-review-dotnet

## 1.1.1 · 2026-11-23

- Rút gọn `description` 111 → 153 ký tự: bỏ chi tiết thi hành, giữ từ khoá kích hoạt (A17).

## 1.1.0 · 2026-11-14

- Checklist: thêm 2 dòng — controller tự xử lý lỗi (`try`/`catch`, `throw`, trả lỗi tay) và service ném exception hệ thống cho lỗi nghiệp vụ ra API (500 lộ `ex.Message`). Trỏ convention § 3.1.
- Checklist: thêm dòng mã lỗi sai format Platform (5 chữ số, không trùng, đúng dải, implement `IErrorCode`). Trỏ convention § 14.1.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
