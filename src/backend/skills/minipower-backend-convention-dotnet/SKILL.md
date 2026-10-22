---
name: minipower-backend-convention-dotnet
description: Quy ước coding C#/.NET — đặt tên, nullable, async/CancellationToken, exception, logging, LINQ, DI, C# 11–12, test, bảo mật. Dùng khi viết hoặc sửa code C#, và khi cần dựng .editorconfig / Directory.Build.props để analyzer ép convention lúc build.
metadata:
  workflow: github
---

# Quy ước coding C#/.NET — Orchestrator

Skill cắt ngang mọi skill `minipower-backend-*-dotnet`: code sinh ra hoặc sửa đổi phải theo quy ước này.

Đi cặp với [minipower-backend-architecture-dotnet](../minipower-backend-architecture-dotnet/SKILL.md) — hai skill trả lời hai câu hỏi khác nhau, không chồng lấn:

| Skill | Trả lời câu hỏi | Cổng cứng |
|---|---|---|
| **convention** (skill này) | **Code trong file viết thế nào?** | `dotnet build` + `dotnet format` — analyzer |
| **architecture** | **File nằm ở đâu? Reference thế nào?** | `dotnet test -c Debug` — architecture test |

Toàn văn quy ước (14 mục): [reference/coding-convention.md](reference/coding-convention.md). Hướng dẫn người: [README.md](README.md).

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Repo chưa có `.editorconfig` + `src/Directory.Build.props` | [workflows/init.md](workflows/init.md) |
| Repo mới scaffold | Đã có sẵn — [scaffold bước 2b](../minipower-backend-scaffold-dotnet/workflows/scaffold.md) |
| Đang viết/sửa code C# | Không cần workflow — theo *Quy tắc cốt lõi* bên dưới + reference |
| Review PR | Không nitpick style bằng tay — [review-dotnet](../minipower-backend-review-dotnet/SKILL.md) lo rủi ro, analyzer lo style |

## Hai tầng — đừng lẫn

| Tầng | Nội dung | Ai gác |
|---|---|---|
| **Cứng** — build/CI FAIL được | Đặt tên (mục 1) · một type một file (2, StyleCop) · nullable (9.1) · `throw ex;` (3) · `.Result`/`.Wait()` (4) · culture & so sánh chuỗi (9.4/9.5) · logging template (9.2) · dispose (9.3) | `.editorconfig` + analyzer + `dotnet format` |
| **Mềm** — advisory, người quyết | Tổ chức class (2) · thiết kế exception (3) · LINQ readability (5) · DI lifetime (6) · refactoring (7) · code smells (8) · test (11) · marker Jarvis (13) · mã lỗi `IErrorCode` (14) | Agent nhắc khi viết code · [review-dotnet](../minipower-backend-review-dotnet/SKILL.md) khi review PR |

Rule máy kiểm được thì **đừng nhắc bằng lời** — để analyzer báo. Rule máy không kiểm được thì **đừng viết "bắt buộc"** — nêu lý do, người quyết.

## Quy tắc cốt lõi

Phần mềm, hay quên nhất:

- **Đặt tên field**: instance `_camelCase`, **static PascalCase không `_`**, const PascalCase (mục 1).
- **CancellationToken** xuyên suốt API async công khai → truyền xuống EF/HTTP, không nuốt (mục 4).
- **Exception cụ thể**, không `throw new Exception(...)`; không dùng exception để điều khiển luồng — `TryParse` (mục 3).
- **Điều kiện tách dòng**: không nhồi nhiều `&&`/`||` hay ternary lồng một dòng; extract biến `bool` có tên (mục 7.6).
- **DI lifetime**: Singleton stateless · Scoped theo request (`DbContext`, repository) · tránh Service Locator (mục 6).
- **Secret không hard-code**: User Secrets / env / secret manager; `IOptions<T>` cho config typed (mục 12).
- **Thời điểm**: property map cột datetime là `DateTime` UTC+0, **không** `DateTimeOffset`; Domain không `DateTime.Now` (mục 9.4).
- **Audit / tenant / user qua marker Jarvis**: `ILogCreatedEntity` · `ITenantEntity` · `ICurrentTenant<T>` · `ICurrentUser<T>` — không tự chế interface song song, không đọc `HttpContext` trong handler, không nhận tenant từ body khi phiên đã có (mục 13).
- **Lỗi nghiệp vụ ném bằng mã**: `BusinessException` + `IErrorCode` đã khai trong `{Product}.ErrorCodes`; `code` theo họ `{MOD}-VAL-` · `{MOD}-BR-` · `{MOD}-API-` · `SYS-` là token API và UI dùng chung (mục 14).

## Templates

| Template | Đích trong repo product | Nhiệm vụ |
|---|---|---|
| [templates/editorconfig](templates/editorconfig) | `.editorconfig` (root) | Naming mục 1 → `error`; StyleCop `SA1402` + `SA1649` → `warning` (mục 2), mọi category StyleCop khác tắt; severity CA/IDE ánh xạ từng mục reference |
| [templates/Directory.Build.props.xml](templates/Directory.Build.props.xml) | `src/Directory.Build.props` | `Nullable=enable`, `EnableNETAnalyzers`, `EnforceCodeStyleInBuild`, `WarningsAsErrors` chọn lọc, `PackageReference` StyleCop.Analyzers (chỉ 2 rule mục 2) |

**Không** bật `TreatWarningsAsErrors=true` toàn cục trên codebase có sẵn — build đỏ vì code cũ là phạt lịch sử, không phải chặn lỗi mới. Nâng dần bằng cách thêm mã rule vào `$(WarningsAsErrors)`.

## Tham chiếu

- [reference/coding-convention.md](reference/coding-convention.md) — toàn văn 12 mục, không load mặc định; mở khi cần tra một mục cụ thể.

## Kiểm tra

```bash
dotnet format --verify-no-changes --severity warn   # style/naming — FAIL nếu lệch
dotnet build --configuration Release                 # analyzer + WarningsAsErrors chọn lọc
```

Hai lệnh này trong CI của repo product là chỗ convention thành **điều kiện cứng**; phần còn lại của skill là lời.

## Output bắt buộc

- Code C# mới/sửa không sinh cảnh báo mới từ analyzer đã bật
- `dotnet format --verify-no-changes` sạch trên file đã chạm
- Khi dựng mới ([workflows/init.md](workflows/init.md)): `.editorconfig` + `src/Directory.Build.props` có trong repo, `dotnet build` xanh, 2 lệnh kiểm tra nằm trong CI

## Liên quan

- Scaffold solution (nơi 2 template được đặt vào repo mới): [minipower-backend-scaffold-dotnet](../minipower-backend-scaffold-dotnet/README.md)
- Review PR: [minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md)
