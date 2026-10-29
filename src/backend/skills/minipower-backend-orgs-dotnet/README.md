# minipower-backend-orgs-dotnet

Gắn **catalog org** Jarvis (`Platform.Orgs`). Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

Cần người bán trên hóa đơn, gán `User.OrgId`, header `X-Org-Id`.

## Khi nào không dùng

Cây phòng ban, pháp nhân, chức danh — skill `minipower-backend-orgstructure-dotnet`. CRUD tenant — skill `minipower-backend-tenants-dotnet`.

## Cách gọi

```text
@minipower-backend-orgs-dotnet

Gắn Platform.Orgs. Không seed org mặc định. Không xóa cứng.
```
