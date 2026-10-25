# minipower-architecture-tenant-org

Xếp mô hình khách vào Root, Tenant, Org và OrgStructure trước khi dựng hệ thống. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Mô tả chi nhánh, đại lý, phòng ban, khách xuất hóa đơn | [workflows/classify.md](./workflows/classify.md) |

**Không dùng cho:** viết ADR hoặc API → [minipower-architecture-sad](../minipower-architecture-sad/README.md). Khảo sát painpoint → [minipower-discovery-survey](../../../discovery/skills/minipower-discovery-survey/README.md).

## Cách gọi

```text
Xếp mô hình này vào Tenant, Org, OrgStructure:
- …
```

Hoặc mô tả việc bằng lời — skill kích hoạt qua `description`.

## Quy tắc (tóm tắt)

- Ai tạo Org khách thì là Tenant.
- Ai đứng tên trên hóa đơn thì là Org.
- Phòng ban, và kênh không tạo Org, là OrgStructure.
- Đại lý thuộc chi nhánh là Tenant con của Tenant chi nhánh.

## Liên quan

- Bản đồ module: [architecture/README.md](../../README.md)
- Mẫu cây Jarvis: `jarvis/docs/guides/multitenancy/multi-tenant-multi-org.md` khi repo Jarvis có trong workspace
