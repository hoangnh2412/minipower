# Changelog — minipower-backend-orgs-dotnet

## 1.1.0 · 2026-11-21

- Org có cha-con cùng tenant (`ParentId`); bỏ luật "Không `ParentOrgId`".
- Bảng org chuyển lên Master; `IsActive` thay bằng khoá hai mức `Write` / `ReadWrite`, lan theo chuỗi cha.
- Tách vùng API: `/platform/orgs` CRUD + khoá, `/app/orgs` chỉ đọc.
- Tạo org bắt buộc `initialAdmin`; user `ORG_ADMIN` qua `IPlatformCatalogAdminProvisioner`.
- `SubtreeOrgTenantVisibility` cho host cần chuyển sang tenant con.
- Theo ADR `realm-scope-lock` của dự án Platform.

## 1.0.0 · 2026-11-07

- Phiên bản ban đầu, đóng dấu theo ADR-044 bước 2 (lá đã có mặt trong repo trước thời điểm này).
