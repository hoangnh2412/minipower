# minipower-backend-convention-dotnet

Quy ước coding C#/.NET của công ty — dùng khi **viết hoặc sửa code C#**, và khi cần dựng lớp analyzer để convention tự ép lúc build. Agent đọc [SKILL.md](./SKILL.md); toàn văn quy ước ở [reference/coding-convention.md](./reference/coding-convention.md).

## Khi nào dùng

| Tình huống | Workflow |
|------------|----------|
| Repo chưa có `.editorconfig` + `Directory.Build.props` | [workflows/init.md](./workflows/init.md) |
| Repo mới scaffold | Đã có sẵn — [scaffold bước 2b](../minipower-backend-scaffold-dotnet/workflows/scaffold.md) |
| Đang viết code, cần tra một mục quy ước | [reference/coding-convention.md](./reference/coding-convention.md) |

**Không dùng cho:** scaffold solution → [minipower-backend-scaffold-dotnet](../minipower-backend-scaffold-dotnet/README.md) · review rủi ro production của PR → [minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md) · kiến trúc layer / Clean Architecture / DDD — ngoài phạm vi skill này.

## Vì sao là skill chứ không phải một file tài liệu

Một file tài liệu chỉ có tác dụng khi có người nhớ mở nó. Skill này chia quy ước làm hai:

| | Ai gác | Sai thì sao |
|---|---|---|
| **Cứng** — đặt tên, một type một file, nullable, `throw ex;`, `.Result`, culture, logging template | `.editorconfig` + analyzer + StyleCop (2 rule) + `dotnet format` | Build/CI **đỏ** |
| **Mềm** — tổ chức class, thiết kế exception, LINQ readability, DI lifetime, code smells, marker Jarvis (audit / tenant / user), mã lỗi `IErrorCode` | Agent nhắc lúc viết · người review | Nhắc, người quyết |

Phần cứng không cần ai nhớ. Phần mềm không giả vờ là bắt buộc.

## Cách gọi

```text
@.opencode/skills/minipower-backend-convention-dotnet/workflows/init.md

Dựng .editorconfig + Directory.Build.props cho MyApp, project MyApp.Legacy để Nullable=annotations.
```

Khi viết code thì không cần gọi tên: mô tả việc như bình thường (*"thêm handler tạo đơn hàng"*) — skill sinh code tương ứng đã trỏ về đây ở phần *Output bắt buộc*.

## Hai file được đặt vào repo product

| Template | Đích | Nội dung chính |
|---|---|---|
| [templates/editorconfig](./templates/editorconfig) | `.editorconfig` ở root | Naming mục 1 → `error` (interface `I`, field private instance `_camelCase` / static PascalCase, const PascalCase, param/local camelCase); StyleCop `SA1402` / `SA1649` → `warning` (một type một file), các category StyleCop khác tắt; severity CA/IDE ánh xạ từng mục reference |
| [templates/Directory.Build.props.xml](./templates/Directory.Build.props.xml) | `src/Directory.Build.props` | `Nullable=enable` · `EnableNETAnalyzers` · `EnforceCodeStyleInBuild` · `WarningsAsErrors` chọn lọc (IDE1006, CA2200, CS86xx) · `PackageReference` StyleCop.Analyzers |

## Lệnh CI

```bash
dotnet format --verify-no-changes --severity warn
dotnet build --configuration Release
```

Đã kiểm trên .NET SDK 9.0.306: code theo convention build xanh; code sai sinh `error IDE1006` (đặt tên — gồm cả `_` thừa ở static field và thiếu `_` ở instance field), `error CA2200` (`throw ex;`), `error CS8618`/`CS8602` (nullable). Hai rule StyleCop `SA1402` / `SA1649` thêm 2026-10-22 (ADR-041) **chưa chạy thử trên solution thật** — smoke T2 của ADR-041 do chủ repo chạy.

## Áp lên codebase có sẵn

Bốn bước, chi tiết trong [workflows/init.md](./workflows/init.md): `dotnet format` một lần thành commit riêng → `Nullable=annotations` cho project cũ → dọn cảnh báo rồi mới thêm rule vào `WarningsAsErrors` → đưa 2 lệnh CI vào pipeline.

## Ranh giới với review

[minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md) **không** comment style/format — đó là việc của analyzer. Review lo rủi ro production: security, data loss, concurrency, logic. Hai skill không chồng việc.

## Liên quan

- [minipower-backend-scaffold-dotnet](../minipower-backend-scaffold-dotnet/README.md) — nơi 2 template được đặt vào repo mới
- [minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md) — review PR
- Bản đồ module: [backend/README.md](../../README.md)
