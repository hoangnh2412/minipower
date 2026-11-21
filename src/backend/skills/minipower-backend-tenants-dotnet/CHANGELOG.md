# Changelog — minipower-backend-tenants-dotnet

## 1.1.0 · 2026-11-21

- Bỏ `IsActive`; khoá hai mức `Write` / `ReadWrite`, lan xuống tenant con và org.
- Chuỗi kết nối không bắt buộc lúc tạo; ghi một lần qua `PUT …/connection`.
- Bỏ luật "Org không có cha-con" (chuyển sang skill orgs 1.1.0).
- Tách vùng API `/platform/tenants` và `/app/tenants`; `ITenantScopeTree`.
- Tạo tenant bắt buộc `initialAdmin`; user `TENANT_ADMIN` qua `IPlatformCatalogAdminProvisioner`.
- Theo ADR `realm-scope-lock` của dự án Platform.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
