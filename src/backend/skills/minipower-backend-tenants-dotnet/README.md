# minipower-backend-tenants-dotnet

Gắn **catalog tenant** Jarvis (`Platform.Tenants`) vào Host. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

Host cần tạo, sửa, vô hiệu hóa tenant và API `/platform/tenants`.

## Khi nào không dùng

Chỉ cần biết request đang ở tenant nào (`ICurrentTenant`, header). Việc đó thuộc `Platform.Multitenancy`, không thuộc skill này.

## Cách gọi

```text
@minipower-backend-tenants-dotnet

Gắn Platform.Tenants vào Host. Entity trên Master DB. Route /platform/tenants.
```

## Quy tắc ngắn

- Không xóa cứng tenant.
- Chuỗi kết nối bắt buộc.
- Không tạo org mặc định khi tạo tenant.
