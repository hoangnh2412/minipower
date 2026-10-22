---
name: minipower-backend-architecture-dotnet
description: Kiến trúc DDD/Clean của backend .NET theo framework Jarvis — file đặt ở layer nào, layer nào được reference layer nào, lát cắt dọc khi thêm tính năng, architecture test ép luật lúc dotnet test. Dùng khi thêm tính năng/API/entity/handler mới, khi phân vân đặt code ở đâu, hoặc khi dựng kiểm tra kiến trúc cho solution.
metadata:
  workflow: github
---

# Kiến trúc backend .NET (Jarvis) — Orchestrator

Skill cắt ngang mọi skill `minipower-backend-*-dotnet`: code sinh ra hoặc sửa đổi phải nằm **đúng layer** và **đúng hướng phụ thuộc**.

Ranh giới với [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md):

| Skill | Trả lời câu hỏi |
|---|---|
| **architecture** (skill này) | **File nằm ở đâu? Reference thế nào?** |
| **convention** | **Code trong file viết thế nào?** |

Không chồng lấn — skill này không nói một chữ nào về đặt tên biến, nullable, async hay LINQ.

## Khi nào dùng workflow nào

| Tình huống | Workflow |
|---|---|
| Thêm tính năng mới (API, use case) — chạm nhiều layer | **[workflows/add-feature.md](workflows/add-feature.md)** |
| Chỉ thêm một command/query handler vào feature có sẵn | [workflows/add-handler.md](workflows/add-handler.md) |
| Solution chưa có kiểm tra kiến trúc | [workflows/add-arch-test.md](workflows/add-arch-test.md) |

## Năm layer — mũi tên đọc là "được phép biết"

```text
{Product}.Host              composition root · Controller · middleware · Workers
  ↑
{Product}.Infrastructure    EF · cache · blob · adapter ngoài · implement Repository
  ↑
{Product}.Application       Command · Query · Handler · DTO · Mappings
  ↑
{Product}.Domain            Aggregate · Entity · Value Object · Repository interface
                            · Domain Service · Domain Event · IUnitOfWork
  ↑
{Product}.Domain.Shared     enum · constant · exception marker — không phụ thuộc gì
```

Ngược chiều mũi tên là **vi phạm**, và là thứ architecture test bắt.

## Đặt file ở đâu

| Tạo tác | Project | Thư mục |
|---|---|---|
| Aggregate root, entity con | `Domain` | `Entities/` |
| Value object | `Domain` | `ValueObjects/` |
| Repository interface (chỉ aggregate root) | `Domain` | `Repositories/` |
| `IUnitOfWork` của product | `Domain` | `Repositories/` |
| Domain event, domain service | `Domain` | `Events/` · `Services/` |
| Command / Query / DTO | `Application` | `Commands/<Feature>/` · `Queries/` · `DTOs/` |
| Handler | `Application` | `Features/<Feature>/<UseCase>/` |
| Profile AutoMapper | `Application` | `Mappings/` |
| Implement repository, EF configuration, migration | `Infrastructure` | `Persistence/` |
| Adapter HTTP/SDK bên thứ ba | `Infrastructure` | `ExternalServices/<Vendor>/` |
| Controller | `Host` | `Controllers/` |
| `BackgroundService` | `Host` | `Workers/` — **không** đặt trong Application |
| `*LayerExtension.cs` | mọi layer | `DependencyInjection/` |

Cây thư mục đầy đủ + câu hỏi định hướng trước khi scaffold: [minipower-backend-scaffold-dotnet/reference/solution-structure.md](../minipower-backend-scaffold-dotnet/reference/solution-structure.md).

## Quy tắc cốt lõi

Phần mềm, hay sai nhất khi viết tính năng mới:

- **Handler chỉ điều phối**: load aggregate → gọi method domain → lưu. Invariant nghiệp vụ nằm **trong entity/root**, không nằm trong handler.
- **Handler inject interface**, không inject `DbContext` / `SqlConnection` / `IHttpClientFactory`.
- **Controller gọi dispatcher**, không inject `DbContext`, không nhồi logic.
- **Không trả domain entity ra API** — trả DTO / primitive / ID.
- **Aggregate tham chiếu aggregate khác bằng ID**, không bằng object.
- **Một transaction ưu tiên sửa một aggregate root**; xuyên aggregate dùng domain event.
- **`BackgroundService` đặt ở Host**, mỏng, gọi vào handler của Application — cùng vai Controller, chỉ khác cách kích hoạt.
- **Tenant / user hiện tại lấy qua Jarvis** — `ICurrentTenant<T>` / `ICurrentUser<T>` inject vào handler và domain service; **không** `IHttpContextAccessor` trong Application, **không** nhận `TenantId` từ body / query khi phiên đã có danh tính. Worker: `ICurrentTenantAccessor.BeginScope` trước khi gọi handler. Bảng marker đầy đủ: [convention mục 13](../minipower-backend-convention-dotnet/reference/coding-convention.md#13-jarvis--audit-tenant-và-phiên-làm-việc).

Chi tiết: [reference/clean-architecture.md](reference/clean-architecture.md) (quy tắc phụ thuộc) · [reference/ddd-tactical.md](reference/ddd-tactical.md) (entity, aggregate, repository, event, anti-pattern). Không load mặc định — mở khi cần tra một mục.

## Hai tầng — đừng lẫn

| Tầng | Nội dung | Ai gác |
|---|---|---|
| **Cứng** — `dotnet test` FAIL được | Hướng phụ thuộc giữa layer · Controller inject `DbContext` · Handler đặt sai assembly · Application chạm `Microsoft.AspNetCore.Mvc` | Architecture test ([workflows/add-arch-test.md](workflows/add-arch-test.md)) |
| **Mềm** — advisory, người quyết | Entity public setter · `DateTime.Now` trong Domain · repository trả `IQueryable` · một transaction sửa nhiều root · ranh giới aggregate | Agent nhắc khi viết code · [review-dotnet](../minipower-backend-review-dotnet/SKILL.md) khi review PR |

Rule máy kiểm được thì **đừng nhắc bằng lời** — để test báo. Rule máy không kiểm được thì **đừng viết "bắt buộc"** — nêu lý do, người quyết.

## Một service hay nhiều service

Ranh giới service = **bounded context** ([reference/ddd-tactical.md](reference/ddd-tactical.md) mục 6.A), không phải ranh giới kỹ thuật. Mỗi service vẫn là **đúng năm layer trên** — skill này không đổi gì khi tách microservice.

Phần hạ tầng liên-service dùng lá đã có: [telemetry](../minipower-backend-telemetry-dotnet/README.md) (distributed tracing) · [healthcheck](../minipower-backend-healthcheck-dotnet/README.md) (readiness) · [caching](../minipower-backend-caching-dotnet/README.md) (Redis) · [realtime](../minipower-backend-realtime-dotnet/README.md) (SignalR backplane). Event bus / outbox-inbox / integration event: framework Jarvis khai **roadmap, chưa ship** — chưa có skill, đừng tự chế.

## Nguồn chân lý

Kiến trúc lấy từ **repo framework Jarvis** (`hoangnh2412/jarvis`, nhánh `develop`), không phải từ tài liệu Clean Architecture chung. Chuỗi phụ thuộc thật của framework:

```text
Jarvis.DDD.Domain.Shared  →  Newtonsoft.Json
Jarvis.DDD.Domain         →  Domain.Shared · Jarvis.OpenTelemetry · Microsoft.Extensions.*.Abstractions
Jarvis.DDD.Application.Contracts  →  Jarvis.DDD.Domain
Jarvis.DDD.Application    →  Jarvis.DDD.Application.Contracts
Jarvis.ORM.EntityFramework →  Jarvis.Caching · Jarvis.DDD.Domain · Jarvis.Common
```

Hệ quả cần nhớ: `Domain` **được phép** dùng `Newtonsoft.Json` và `Microsoft.Extensions.*.Abstractions` (Jarvis dùng); `Domain` **không** chạm EF Core; `Application` **không** cần `FrameworkReference Microsoft.AspNetCore.App`.

## Output bắt buộc

- File mới nằm đúng project theo bảng *Đặt file ở đâu*
- `dotnet build` xanh, không vòng phụ thuộc
- `dotnet test -c Debug` xanh — kể cả `{Product}.ArchitectureTests`
- Code C# theo [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/SKILL.md) — `dotnet format --verify-no-changes` sạch trên file đã chạm

## Liên quan

- Scaffold solution (nơi architecture test được đặt vào repo mới): [minipower-backend-scaffold-dotnet](../minipower-backend-scaffold-dotnet/README.md)
- Quy ước viết code: [minipower-backend-convention-dotnet](../minipower-backend-convention-dotnet/README.md)
- Review PR: [minipower-backend-review-dotnet](../minipower-backend-review-dotnet/README.md)
- Persistence: [minipower-backend-entityframework-dotnet](../minipower-backend-entityframework-dotnet/README.md)
