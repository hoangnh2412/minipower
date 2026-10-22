# Workflow: Dựng lớp ép convention cho repo

Áp dụng khi repo **chưa** có `.editorconfig` + `src/Directory.Build.props` theo convention. Repo mới scaffold đã có sẵn (bước 2b của [minipower-backend-scaffold-dotnet](../../minipower-backend-scaffold-dotnet/workflows/scaffold.md)) — không chạy lại.

## Checklist

```text
- [ ] 1. Xác định phạm vi: repo mới hay codebase có sẵn (số project, có code legacy không)
- [ ] 2. Copy 2 template, bỏ dòng comment hướng dẫn ở đầu file
- [ ] 3. dotnet format một lần trên toàn repo → commit riêng "format only"
- [ ] 4. Nullable: enable cho project mới, annotations cho project legacy
- [ ] 5. dotnet build — đếm cảnh báo còn lại, KHÔNG bật WarningsAsErrors khi còn nhiều
- [ ] 6. Đưa 2 lệnh CI vào pipeline
```

## Bước 1 — Phạm vi

Hỏi/kiểm: repo có bao nhiêu project, có code cũ không, CI đang chạy gì. Codebase có sẵn thì **áp dần** — bật hết một lần làm build đỏ vì code cũ, phạt lịch sử chứ không chặn lỗi mới.

## Bước 2 — Copy template

| Từ | Tới |
|---|---|
| [templates/editorconfig](../templates/editorconfig) | `.editorconfig` (root repo) |
| [templates/Directory.Build.props.xml](../templates/Directory.Build.props.xml) | `src/Directory.Build.props` (cạnh `.sln`) |

Bỏ block comment ở đầu mỗi file khi copy.

## Bước 3 — Format một lần

```bash
dotnet format
```

Commit riêng, message rõ là *format only* — diff to nhưng không đổi hành vi, để review sau không lẫn với thay đổi logic.

## Bước 4 — Nullable

`Directory.Build.props` mặc định `Nullable=enable`. Project legacy nhiều cảnh báo → hạ tạm:

```xml
<PropertyGroup Condition="'$(MSBuildProjectName)' == '{Product}.Legacy'">
  <Nullable>annotations</Nullable>
</PropertyGroup>
```

Nâng lên `enable` từng project khi đã dọn.

## Bước 5 — Validate

```bash
dotnet build --configuration Release
dotnet format --verify-no-changes --severity warn
```

Còn nhiều cảnh báo: **giữ nguyên** `$(WarningsAsErrors)` mặc định (IDE1006, CA2200, CS86xx), dọn dần rồi mới thêm mã rule mới vào danh sách.

`SA1402` / `SA1649` (một type một file) ở mức `warning`: đếm riêng — codebase cũ thường nhiều; tách file là refactor cơ học, làm thành commit riêng như bước 3.

## Bước 6 — CI

Thêm 2 lệnh bước 5 vào pipeline. Đây là chỗ convention thành điều kiện cứng — trước bước này mọi thứ vẫn chỉ là lời.

## Anti-patterns

- `TreatWarningsAsErrors=true` toàn cục ngay lần đầu trên codebase có sẵn — build đỏ hàng loạt, team tắt analyzer luôn.
- Bật analyzer nhưng không đưa vào CI — cảnh báo trôi qua PR, không ai chặn.
- Sửa naming lẫn trong commit có logic — review không phân biệt được đâu là đổi hành vi.
- Thêm rule ngoài [reference/coding-convention.md](../reference/coding-convention.md) theo sở thích cá nhân — convention là tài liệu công ty, muốn đổi thì sửa reference trước.
