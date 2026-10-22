---
name: minipower-architecture-as-built-dotnet
description: Bảng tra đọc code C#/.NET khi khai quật hệ cũ — nhận diện solution, entry point ASP.NET Core (Controller, Minimal API, BackgroundService, MediatR, consumer), DI, middleware pipeline, EF Core / Dapper, transaction, messaging, auth, cấu hình appsettings. Dùng khi reverse-engineer repo .NET, đọc Program.cs, trace một endpoint hay worker.
metadata:
  workflow: github
---

# Đọc code .NET — bảng tra theo stack

Phương pháp (6 tầng · 5 câu hỏi · 3 pass · 4 nhãn): [reference/reading-method.md](../../reference/reading-method.md). File này chỉ nói **.NET gọi những thứ đó là gì và tìm ở đâu**. Repo theo framework Jarvis: layer và luật phụ thuộc đã có ở [minipower-backend-architecture-dotnet](../../../../../backend/skills/minipower-backend-architecture-dotnet/SKILL.md) — đọc trước, không suy luận lại.

## 1. Nhận diện repo (Pass 1)

| Tìm | Cho biết |
|-----|----------|
| `*.sln` / `*.slnx`, `*.csproj`, `Directory.Build.props`, `Directory.Packages.props`, `global.json`, `NuGet.config` | Số project, SDK, package tập trung, analyzer |
| `Program.cs` / `Startup.cs`, `WebApplication`, `IHostBuilder` | Composition root, thứ tự middleware |
| `src/` · `tests/` · `Dockerfile` · `docker-compose*` · `k8s/` · `helm/` | Runtime và deploy |
| Tên project `*.Api` · `*.Application` · `*.Domain` · `*.Infrastructure` · `*.Worker` | Layer và module (L2) |

## 2. Entry point (câu hỏi 4.1)

| Loại | Dấu hiệu |
|------|----------|
| HTTP | `[ApiController]`, `[Route]`, `[HttpGet/Post/Put/Delete]`; Minimal API `app.MapGet/MapPost/…`, `MapGroup` |
| gRPC / realtime | `Grpc.Core` service, `MapGrpcService`, `Hub`, `MapHub` |
| Nền | `BackgroundService`, `IHostedService`, `PeriodicTimer`, Hangfire `RecurringJob`, Quartz `IJob` |
| Message | `IConsumer<T>` (MassTransit), `KafkaListener`-kiểu, `IRequestHandler` / `INotificationHandler` (MediatR) |
| CLI | `Main`, `CommandLineRunner`-kiểu, `IHostedService` chạy một lần |

Ai gọi · request DTO / command / message nào · model binding và validation xảy ra trước action ở đâu.

## 3. Thứ tự đọc

```text
README → .sln / .csproj → Directory.*.props → Program.cs → DI registration (AddXxx, *LayerExtension)
→ middleware / filter → authentication / authorization → Controller / Minimal API / gRPC
→ consumer / producer → Application handler → Domain → Repository → EF / Dapper / ADO.NET
→ external client → BackgroundService → appsettings → tests → Docker / K8s
```

## 4. Composition — DI (mục 5 reference)

| Tìm | Chú ý |
|-----|-------|
| `services.AddTransient / AddScoped / AddSingleton`, `AddKeyedScoped`, `TryAdd*` | Lifetime; Scoped trong Singleton là bẫy |
| Nhiều implementation một interface, `Decorate`, factory lambda, open generic | Cái nào thật sự được inject |
| Đăng ký theo môi trường (`IsDevelopment`), feature flag, `IOptions<T>` | Behavior đổi theo config |
| Behavior ngoài thân method: `IPipelineBehavior` (MediatR), `ActionFilter`, `IEndpointFilter`, middleware, interceptor EF | Validation / transaction / logging nằm ở lớp bọc |

## 5. Pipeline HTTP (mục 5, 7 reference)

```text
HTTP → Middleware (UseExceptionHandler · UseCors · UseAuthentication · UseAuthorization · UseRouting) → Endpoint → Filter → Controller / Minimal API → Application → Response
```

Ghi **thứ tự `Use*` thật** — middleware đặt sau `MapControllers` không chạy. Tìm `ProblemDetails`, `IExceptionHandler`, correlation id, rate limiting, response wrapper.

## 6. Persistence (mục 6 reference)

| EF Core | Dapper / ADO.NET |
|---------|------------------|
| `DbContext`, `DbSet<T>`, `OnModelCreating`, `IEntityTypeConfiguration<T>`, `HasKey/HasOne/HasMany/OwnsOne/HasIndex`, `HasQueryFilter`, value converter, interceptor | `Query/QueryAsync/Execute`, `DynamicParameters`, `DbConnection/DbCommand`, stored procedure |
| Kiểm `AsNoTracking`, `Include/ThenInclude`, lazy loading, concurrency token / `RowVersion`, global filter (tenant, soft delete) | Kiểm SQL, parameter, connection lifetime, mapping tay |

Transaction: `TransactionScope`, `Database.BeginTransactionAsync`, UoW `SaveChangesAsync`, transactional behavior. Nhiều thao tác trong một method **không** mặc định cùng transaction.

## 7. Messaging · nền · concurrency

| Chủ đề | Tìm |
|--------|-----|
| RabbitMQ | exchange · queue · routing key · prefetch · ack · retry · dead-letter |
| Kafka | topic · key · partition · consumer group · offset commit · DLQ |
| Azure Service Bus | queue / topic · subscription · lock · settlement · dead-letter |
| Nền | `BackgroundService`, `Channel<T>`, Hangfire, Quartz, MassTransit; `CancellationToken`, shutdown, lock phân tán, idempotency |
| Concurrency | `Task.WhenAll`, `Parallel`, `SemaphoreSlim`, `lock`, `ConcurrentDictionary`, `IAsyncEnumerable` — `async` không phải song song |

## 8. Auth (mục 7 reference)

`AddAuthentication / AddAuthorization / AddPolicy`, `[Authorize]`, `[AllowAnonymous]`, `RequireAuthorization()`, `IAuthorizationHandler / Requirement`, `ClaimsPrincipal`; JWT / OIDC handler → claims → policy. Jarvis: `ICurrentTenant` / `ICurrentUser`, resolver tenant (header → claim → query → host). Trả lời: quyền kiểm ở endpoint hay handler; tenant tách thế nào.

## 9. Lỗi

`IExceptionHandler`, `UseExceptionHandler`, `ProblemDetails`, custom exception (`BusinessException` + `IErrorCode` ở Jarvis), `try/catch` nuốt lỗi, Polly retry / circuit breaker. Phân biệt business · validation · technical · integration khi đủ bằng chứng.

## 10. Config · runtime

`appsettings.json` → `appsettings.{Environment}.json` → user secrets → env → Key Vault / App Configuration → `IOptions<T>` / `IOptionsSnapshot<T>` / `IOptionsMonitor<T>`. Kiểm connection string, URL, feature flag, timeout, retry, tên queue / topic. Docker / K8s / Helm cũng là config. Không ghi giá trị secret.

## 11. Observability

`ILogger<T>` (template có cấu trúc), Serilog / NLog, OpenTelemetry `ActivitySource` / `Meter`, health checks `/health/*`, Prometheus. Ghi trace id / correlation id đi qua đâu.

## 12. Tests là bằng chứng

`[Fact]` / `[Theory]`, `WebApplicationFactory` / `TestServer`, Moq / NSubstitute / FakeItEasy, FluentAssertions, Testcontainers, WireMock. Test tích hợp lộ contract và thứ tự pipeline thật.

## 13. Bẫy riêng .NET

- Middleware đặt sai thứ tự — build xanh, lỗi lộ lúc gọi.
- `IQueryable` lọt ra khỏi Infrastructure — query thật nằm ở caller, không ở repository.
- `async void`, `.Result` / `.Wait()` — deadlock, lỗi mất stack.
- Global query filter (tenant, soft delete) làm "không thấy dữ liệu" trông như bug nghiệp vụ.
- Entity có setter public — state đổi ở nhiều nơi, invariant không ở một chỗ.
