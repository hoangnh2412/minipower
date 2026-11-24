<!-- Reference của skill minipower-backend-convention-dotnet — toàn văn quy ước, không load mặc định. -->

# Quy ước coding C# / .NET

## Khi nào áp dụng

Tuân thủ các mục dưới đây khi chỉnh sửa hoặc tạo mã C# trong dự án .NET (API, domain, infrastructure).

---

## 1. Đặt tên (Naming)

| Thành phần | Quy tắc | Ví dụ đúng | Ví dụ sai |
|------------|---------|------------|-----------|
| Namespace | PascalCase, `công ty.dự án.module` | `ViettelPay.Core.Services` | `viettel_pay.core.services` |
| Class, Struct, Record | PascalCase, danh từ | `CustomerRepository`, `OrderDto` | `customerRepo`, `orderDTO` |
| Interface | PascalCase, tiền tố `I` | `ILogger`, `IPaymentGateway` | `LoggerInterface` |
| Method | PascalCase, động từ | `CalculateTotal()`, `SaveChanges()` | `calcTotal()`, `save_changes()` |
| Property | PascalCase | `public string FirstName { get; set; }` | `public string firstName` |
| Field (private, instance) | `_` + camelCase | `private readonly IOrderRepository _orderRepository` | `private OrderRepository orderRepository` |
| Field (private, **static**) | PascalCase, **không** `_` | `private static readonly TimeSpan DefaultCacheTimeout` | `private static readonly TimeSpan _defaultCacheTimeout` |
| Type parameter | `T`, `TKey`, `TItem` + `where` rõ ràng | `Dictionary<TKey, TValue> where TKey : notnull` | `T1`, `Foo` không mô tả |
| Parameter / biến local | camelCase | `customerId`, `orderDate` | `CustomerId`, `order_date` |
| Constant | PascalCase | `const int MaxRetryCount = 3;` | `MAX_RETRY_COUNT` (kiểu C cũ) |
| Enum | PascalCase (tên enum số ít) | `enum Status { Active, Inactive }` | `enum Statuses` cho tên enum |

**Lưu ý:** Biến local và parameter luôn `camelCase`. Không dùng Hungarian notation (`strName`, `iCount`).

---

## 2. Tổ chức class

**Một type công khai, một file.** Tên file khớp tên type (`Invoice.cs` → `Invoice`). Handler, command, DTO, entity, repository interface, error code class — mỗi cái một file; không gom `CreateInvoiceCommand` + `CreateInvoiceHandler`, hay hai DTO vào `Dtos.cs` chỉ vì "cùng feature". Ngoại lệ duy nhất: **cùng họ generic** (`IEntity` và `IEntity<TKey>` trong `IEntity.cs`). Type `private` / `file`-scoped lồng trong type cha được phép. **[máy]** StyleCop `SA1402` (nhiều type một file) + `SA1649` (tên file khác tên type) — mức `warning` trong [templates/editorconfig](../templates/editorconfig).

Thứ tự gợi ý trong một class:

1. Constants  
2. Private static fields  
3. Private instance fields  
4. Constructor(s)  
5. Public properties  
6. Public methods  
7. Private methods (helper)

```csharp
using System.Text.Json;

namespace MyCompany.MyProduct.Features.Orders
{
    public class OrderService : IOrderService
    {
        // 1. Constants
        private const int MaxOrderItems = 100;
        private static readonly TimeSpan DefaultCacheTimeout = TimeSpan.FromMinutes(5);

        // 2. Private static fields (hạn chế; ưu tiên inject qua DI)
        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // 3. Private instance fields
        private readonly IOrderRepository _orderRepository;
        private readonly IPaymentGateway _paymentGateway;
        private readonly ILogger<OrderService> _logger;

        // 4. Constructor(s)
        public OrderService(
            IOrderRepository orderRepository,
            IPaymentGateway paymentGateway,
            ILogger<OrderService> logger)
        {
            ArgumentNullException.ThrowIfNull(orderRepository);
            ArgumentNullException.ThrowIfNull(paymentGateway);
            ArgumentNullException.ThrowIfNull(logger);
            _orderRepository = orderRepository;
            _paymentGateway = paymentGateway;
            _logger = logger;
        }

        // 5. Public properties
        public bool IsReady { get; private set; }

        // 6. Public methods
        public async Task<OrderResult> ProcessOrderAsync(OrderRequest request, CancellationToken cancellationToken)
        {
            // implementation
        }

        // 7. Private methods
        private decimal CalculateTax(decimal subtotal) { }
    }
}
```

---

## 3. Xử lý lỗi và exception

**Nguyên tắc chung**

- Throw kiểu cụ thể, không `throw new Exception(...)`.
- Không nuốt exception (`catch { }`, `catch` rồi `return` mà không ném lại hoặc không bọc `BusinessException`).
- Không dùng exception để điều khiển luồng thông thường — ưu tiên `TryParse`, kiểm tra `null`, v.v.
- Guard tham số trong domain/helper thuần: `ArgumentException`, `ArgumentNullException`.

### 3.1 API Platform — `BusinessException` và `ApiResponseWrapperMiddleware`

Áp handler/command/query và controller API có envelope `BaseResponse` (`erp_core/platform`, product Host CQRS).

| Việc | Quy tắc |
|------|---------|
| Ném lỗi | `throw new BusinessException(mã, systemMessage?)` hoặc subtype (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`) khi HTTP status khác 422 mặc định của `BusinessException`. |
| Ném ở đâu | **Chỉ** tầng Application / Domain / Infrastructure — handler, application service, entity / domain service, repository / adapter. Guard đầu vào (thiếu field, `Guid.Empty`, file rỗng), kiểm tra phạm vi tenant / org, "không tìm thấy" đều nằm ở Application và ném exception có mã. |
| Controller (Host) | **Không** `try`/`catch`, **không** `throw`, **không** trả lỗi tay (`BadRequest(...)`, `NotFound()`, `Unauthorized()`, `Forbid()`, `Conflict(...)`, `StatusCode(4xx/5xx)`, `Problem(...)`). Controller nhận request → gọi Application → `Ok` / `Created` / `NoContent`; lỗi nổi lên `ApiResponseWrapperMiddleware`. |
| Mã | Hằng trong class implement `IErrorCode`, `[Display(Description = "...")]`. Message user qua `ErrorCodeHelper.GetMessage(mã)` — không hard-code thay catalog (mục 14). |
| Middleware | `ApiResponseWrapperMiddleware` map exception chưa bắt → `BaseResponse` + HTTP status. Handler/controller **để exception nổi lên** — không `catch` rồi `return Unauthorized()` / `NotFound()` / `UnprocessableEntity(...)`. |
| Cấm (lỗi nghiệp vụ API) | `UnauthorizedAccessException`, `KeyNotFoundException`, `InvalidOperationException`, `throw new Exception(...)`, `return` status lỗi tay trong controller thay cho throw có mã. |
| Lỗi kỹ thuật nội bộ | Có thể `InvalidOperationException` khi không ra client; nếu response đi qua middleware vẫn ưu tiên `BusinessException` + mã module. |

Tham chiếu: `Platform.DDD.Domain.Shared/ExceptionHandling/BusinessException.cs` · `Platform.Mvc/ExceptionHandling/ApiResponseWrapperMiddleware.cs`.

**Đúng (handler + controller)**

```csharp
// Handler
if (user is null)
    throw new BusinessException(AccountErrorCode.InvalidCredentials);

// Controller
var result = await login.HandleAsync(command, cancellationToken);
return Ok(result);
```

**Tránh (nuốt — client mất code/message chuẩn)**

```csharp
catch (UnauthorizedAccessException) { return Unauthorized(); }
catch (BusinessException ex) { return UnprocessableEntity(ex.Message); }
```

**Tránh (controller tự xử lý lỗi — chuyển xuống Application)**

```csharp
// Controller
if (request.File is null) return BadRequest(new { message = "Thiếu file." });   // guard ⇒ handler ném BadRequestException(mã)
if (request.File is null) throw new BadRequestException(ImportErrorCode.FileRequired); // controller không throw
return item is null ? NotFound() : Ok(item);                                      // service ném NotFoundException(mã)
```

### 3.2 Khi cần `try` / `catch`

- **Controller: không bao giờ** `try`/`catch` — `ApiResponseWrapperMiddleware` đã bắt mọi exception (mục 3.1).
- Handler / service (Application, Infrastructure): **mặc định không** thêm `try`/`catch` mới. Muốn bắt (retry, fallback, map hạ tầng, transaction, idempotent) → **hỏi người xác nhận** trước, nêu file và lý do.
- Đã được OK: log + `throw;` hoặc `throw new BusinessException(mã, systemMessage, innerException: ex)` — không `catch { }`, không đổi sang `IActionResult` lỗi tay.
- `catch` chỉ để `return` kết quả nghiệp vụ hợp lệ (vd. “đã cài rồi”) vẫn cần người OK và comment ngắn tại chỗ.

```csharp
catch (DbUpdateException ex)
{
    _logger.LogError(ex, "Save failed");
    throw; // giữ stack — chỉ khi đã OK pattern catch này
}
```

---

## 4. Async / await

| Quy tắc | Giải thích |
|---------|------------|
| Hậu tố `Async` | `GetDataAsync()`, `SaveAsync()` |
| `CancellationToken` | API async công khai (service/repository) nhận token và truyền xuống EF/HTTP |
| Tránh `async void` | Chỉ event handler; còn lại `async Task` / `Task<T>` |
| `ConfigureAwait(false)` | **Thư viện** dùng khi không cần sync context; **ASP.NET Core app** thường không bắt buộc như library |
| Không `.Result` / `.Wait()` | Nguy cơ deadlock (đặc biệt có UI hoặc sync-over-async) |
| `ValueTask` | Khi thường trả kết quả đồng bộ có sẵn (cache); đọc kỹ trước khi lưu field |

```csharp
// Đúng — token xuyên suốt
public async Task<User> GetUserAsync(int id, CancellationToken cancellationToken)
{
    return await _repository.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
}

// Sai — deadlock tiềm ẩn
public void GetUser(int id)
{
    var user = GetUserAsync(id).Result;
}
```

---

## 5. LINQ

- Method syntax hay query syntax đều được; chọn một phong cách và nhất quán trong module/team.

```csharp
// Method syntax
var activeUsers = users
    .Where(u => u.IsActive)
    .OrderBy(u => u.LastName)
    .Select(u => new { u.Id, u.FullName });

// Query syntax — hợp join phức tạp
var result = from u in users
             join o in orders on u.Id equals o.UserId
             where u.IsActive
             select new { u.Name, o.Total };
```

**Tránh chuỗi LINQ quá dài** — tách biến trung gian hoặc method nhỏ:

```csharp
// Khó đọc
var result = orders.Where(o => o.Items.Any(i => i.Price > 100 && i.Quantity > 1))
    .GroupBy(o => o.CustomerId)
    .Select(g => new { CustomerId = g.Key, Total = g.Sum(o => o.Total) })
    .Where(x => x.Total > 1000);

// Rõ hơn
var largeItemOrders = orders.Where(o => o.Items.Any(i => i.Price > 100 && i.Quantity > 1));
var customerTotals = largeItemOrders
    .GroupBy(o => o.CustomerId)
    .Select(g => new { CustomerId = g.Key, Total = g.Sum(o => o.Total) });
var highValueCustomers = customerTotals.Where(x => x.Total > 1000);
```

**Hiệu năng / rõ ràng:** `IEnumerable` từ LINQ có thể chạy lại mỗi lần enumerate. Nếu cần duyệt nhiều lần hoặc ổn định snapshot, gọi `.ToList()` / `.ToArray()` một lần.

---

## 6. Dependency Injection

**Lifetime**

| Lifetime | Khi dùng | Ví dụ |
|----------|----------|--------|
| Singleton | Stateless, thread-safe, không gắn request | `ILogger`, `IConfiguration`, `IMemoryCache` |
| Scoped | Một request / unit of work | `DbContext`, `IRepository` |
| Transient | Nhẹ, cần instance mới mỗi lần resolve | `IStringLocalizer`, `IMediator` |

**Constructor injection là chuẩn**

```csharp
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetAsync(int id, CancellationToken cancellationToken)
        => await _orderService.GetAsync(id, cancellationToken);
}
```

**Tránh Service Locator** trong business logic (`GetService<T>()` lung tung).

---

## 7. Refactoring cơ bản

### 7.1 Extract method

```csharp
// Trước
public void RegisterUser(UserDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains("@"))
        throw new ArgumentException("Invalid email");
    if (dto.Age < 18)
        throw new ArgumentException("Underage");

    _db.Users.Add(new User { Email = dto.Email, Age = dto.Age });
    _db.SaveChanges();
}

// Sau
public void RegisterUser(UserDto dto)
{
    ValidateUser(dto);
    SaveUser(dto);
}

private void ValidateUser(UserDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains("@"))
        throw new ArgumentException("Invalid email");
    if (dto.Age < 18)
        throw new ArgumentException("Underage");
}
```

### 7.2 Thay magic number bằng constant

```csharp
// Trước
if (order.Total > 1000000) { ApplyVipDiscount(); }

// Sau
private const decimal VipThreshold = 1_000_000m;
if (order.Total > VipThreshold) { ApplyVipDiscount(); }
```

### 7.3 Đơn giản hóa điều kiện (switch expression, pattern matching)

```csharp
// Cũ
string GetStatusText(OrderStatus status)
{
    if (status == OrderStatus.Pending) return "Đang chờ";
    else if (status == OrderStatus.Shipped) return "Đã giao";
    else return "Khác";
}

// C# 8+
string GetStatusText(OrderStatus status) => status switch
{
    OrderStatus.Pending => "Đang chờ",
    OrderStatus.Shipped => "Đã giao",
    _ => "Khác"
};
```

### 7.4 Parameter object

```csharp
// Trước
void CreateReport(string title, DateTime from, DateTime to, bool includeDetails, string format);

// Sau
record ReportOptions(string Title, DateRange Range, bool IncludeDetails, string Format);
void CreateReport(ReportOptions options);
```

### 7.5 Vòng lặp → LINQ (khi tăng độ rõ)

```csharp
// Trước
var activeNames = new List<string>();
foreach (var user in users)
    if (user.IsActive)
        activeNames.Add(user.Name);

// Sau
var activeNames = users.Where(u => u.IsActive).Select(u => u.Name).ToList();
```

### 7.6 Điều kiện — tránh nhồi một dòng

- **Hạn chế** gom nhiều nhánh hoặc nhiều `&&` / `||` trên **một dòng** (ternary lồng, `?:` dài, `if` một dòng với biểu thức phức tạp).
- **Ưu tiên** `if` / `else if` / `else` (hoặc `switch` / `switch expression` khi đủ rõ) **tách dòng**, có thể **extract** biến `bool` có tên nói rõ ý nghĩa (`isEligibleForDiscount`, `hasActiveSubscription`).
- Mục tiêu: đọc lướt vẫn thấy luồng quyết định; debug đặt breakpoint từng nhánh dễ hơn.

```csharp
// Tránh — khó đọc, khó debug (nhiều toán tử + ternary lồng)
return a && b || c && !d ? x : y > z ? foo : bar;

// Rõ hơn — cùng logic: (a && b) || (c && !d) → x; else nếu y > z → foo; else bar
if ((a && b) || (c && !d))
    return x;
if (y > z)
    return foo;
return bar;
```

---

## 8. Code smells cần tránh

| Code smell | Dấu hiệu | Hướng xử lý |
|------------|----------|-------------|
| Long method | > ~20–30 dòng | Extract method |
| Large class | > ~200 dòng (tham khảo) | Tách theo SRP |
| Primitive obsession | `string`/`int` thay cho khái niệm domain | Value object (`Email`, `PhoneNumber`) |
| Switch rải rác | Cùng enum, nhiều nơi `switch` | Polymorphism hoặc dictionary |
| Điều kiện nhồi một dòng | Nhiều `&&`/`||`, ternary lồng, một dòng dài | `if`/`else` tách dòng, biến `bool` có tên, extract method |
| Comment giải thích code xấu | Comment dài để bù code khó hiểu | Viết lại code rõ ràng, bớt comment thừa |

---

## 9. Bổ sung .NET hiện đại & ASP.NET Core

### 9.1 Nullable reference types

- Bật `#nullable enable` (hoặc cấp project) và xử lý cảnh báo thay vì tắt loạn.
- Tham chiếu có thể null: `string?`. Không lạm dụng `!` để “im lặng” cảnh báo — ưu tiên guard, `Try*`, hoặc contract rõ (`required`, khởi tạo trong constructor).
- Tham số không được null: `ArgumentNullException.ThrowIfNull(x)` ở entry public API.

### 9.2 Logging có cấu trúc

- Dùng template + placeholder (tránh nối chuỗi cho giá trị động): `_logger.LogInformation("Order {OrderId} created", orderId);`
- Chọn mức phù hợp (`Trace`/`Debug`/`Information`/`Warning`/`Error`/`Critical`); không log password, token, thẻ, PII không cần thiết.

### 9.3 `IDisposable` / `IAsyncDisposable`

- Tài nguyên không quản (`Stream`, `HttpResponseMessage`, v.v.): `using var` / `await using var` hoặc `try/finally` với `DisposeAsync()`.
- Không dispose thứ DI container quản (ví dụ `DbContext` trong scope request) trừ khi bạn tự `new`.

### 9.4 Thời gian & múi giờ

- Property map cột datetime: **`DateTime`, quy ước UTC+0** (`DateTimeKind.Utc`). DB lưu datetime **không timezone** nên không dùng `DateTimeOffset` cho các property đó — offset không có chỗ để lưu (ADR-041 QĐ-7). Múi giờ nghiệp vụ, nếu nghiệp vụ cần, là cột / field riêng (`issued_timezone`, định danh IANA).
- Domain **không** gọi `DateTime.Now` — giờ máy, lệch theo server. Thời điểm đi vào Domain từ ngoài hoặc qua abstraction clock; Infrastructure / Host lấy `DateTime.UtcNow`.
- Parse / format có văn hoá: chỉ định rõ `CultureInfo` / `IFormatProvider`. Literal thời điểm trong test, seed và SQL mẫu là UTC+0, không offset.

### 9.5 So sánh chuỗi

- So khớp kỹ thuật (identifier, path Windows): thường `StringComparison.Ordinal` hoặc `OrdinalIgnoreCase`.
- Hiển thị cho user theo locale: `StringComparison.CurrentCulture` / `CurrentCultureIgnoreCase` có chủ đích.

### 9.6 ASP.NET Core (API)

- Action nhận `CancellationToken` từ framework; truyền vào service/repository.
- Validate input (Data Annotations, FluentValidation, hoặc filter tương đương); lỗi validation trả HTTP/mã thống nhất (ví dụ Problem Details `400`).
- Ưu tiên `IActionResult` / `Results` typed; tránh logic nặng trong controller — gọi application layer.

---

## 10. C# hiện đại (file-scoped, record, `required`, collection expressions)

- **File-scoped namespace** (`namespace X;`) giảm thụt lề khi file chỉ thuộc một namespace.
- **`record` / `record class`**: DTO, message, value mang dữ liệu; `with` cho bản sao bất biến. Phân biệt **record** (dữ liệu) với **entity domain** có hành vi (có thể là class thường).
- **`required` + object initializer** hoặc constructor: bắt buộc field/property quan trọng khi tạo instance.
- **`init` accessor**: property chỉ set lúc khởi tạo; phù hợp immutable DTO.
- **Collection expressions** (`[1, 2, 3]`, `[..other]`) khi C# / SDK hỗ trợ; nhất quán với phần còn của project.
- **Primary constructor (C# 12)** trên class/struct: tiện inject field `readonly`; tránh nhồi logic nặng trong parameter list — vẫn tách method private khi method dài.

```csharp
namespace MyApp.Orders;

public sealed class OrderQueryService(IOrderRepository repository, ILogger<OrderQueryService> logger)
{
    public async Task<Order?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(repository);
        var order = await repository.GetByIdAsync(id, cancellationToken);
        if (order is null)
            logger.LogDebug("Order {OrderId} not found", id);
        return order;
    }
}
```

---

## 11. Kiểm thử (xUnit / NUnit / MSTest)

- **Tên test** mô tả hành vi: `MethodName_Scenario_Expected` hoặc `Should_Expected_When_Condition` — team chọn một kiểu và giữ.
- **Arrange – Act – Assert**: tách rõ; một test một lý do fail (single concern).
- **Async test**: `Task` + `await`; không `async void` (trừ framework bắt buộc).
- Dùng **fake/mock/stub** có chủ đích; tránh mock quá nhiều lớp làm test dễ vỡ khi refactor nhỏ.
- **FluentAssertions** (hoặc tương đương) nếu team đã chọn — đọc assertion dễ hơn.

---

## 12. Bảo mật & cấu hình cơ bản

- **Không** hard-code secret (connection string có password, API key). Dùng **User Secrets** (dev), **environment variables**, Key Vault / secret manager (môi trường thật).
- **`IOptions<T>` / `IOptionsSnapshot<T>`** cho cấu hình typed; validate option lúc startup (`ValidateOnStart`, `DataAnnotations`) khi phù hợp.
- **Không** tin input client: validate độ dài, phạm vi, format; parameterized query / EF (tránh nối SQL thủ công).
- **Header bảo mật**, HTTPS, authentication/authorization middleware — cấu hình ở host, không rải logic lệch trong từng action nếu có thể gom filter/policy.

---

## 13. Jarvis — audit, tenant và phiên làm việc

Nguồn chân lý: `Jarvis.DDD.Domain` (`Entities/`, `Services/`, `DataStorages/`). EF của Jarvis đọc **marker interface** trên entity và đăng ký DI cho tenant / user — **không** tự chế interface song song (`ICreatedInfo`, `IMyTenant`), **không** đọc `HttpContext` trong handler để lấy user / tenant nghiệp vụ.

| Nhu cầu | Dùng (Jarvis) | Ghi chú |
|---------|---------------|---------|
| Audit tạo | `ILogCreatedEntity` — `CreatedAt`, `CreatedBy` | Không đặt `CreatedDate` / `CreatorId` song song |
| Audit sửa | `ILogUpdatedEntity` — `UpdatedAt`, `UpdatedBy` | Cùng quy ước với tạo |
| Audit xoá mềm | `ILogDeletedEntity<T>` — `DeletedAt`, `DeletedBy`, `DeletedId` | `T` = kiểu khoá xoá logic, thường trùng kiểu `Id` |
| Dòng dữ liệu theo tenant | `ITenantEntity` — `TenantId` | Bảng nghiệp vụ tenant-scoped; chi tiết [entityframework](../../minipower-backend-entityframework-dotnet/SKILL.md) |
| Registry tenant | `ITenantManagementEntity` — `ConnectionString` | Master / catalog tenant |
| Setting theo tenant | `ISettingEntity` | Kế thừa `ITenantEntity` |
| Resolve tenant id | `ITenantIdResolver` · `ITenantIdResolverFactory` | Header → claim → query → host |
| **Tenant hiện tại** | `ICurrentTenant<TTenant>` — `GetIdAsync`, `GetAsync`, `Change` | Handler / domain service inject đây |
| Ambient tenant (job, scope) | `ICurrentTenantAccessor` — `TenantId`, `BeginScope` | Worker set scope trước khi gọi handler |
| **User hiện tại** | `ICurrentUser<TUser>` — `GetAsync` | Không parse claim thủ công trong Application |
| Profile user / tenant | `ICurrentUserStore<TUser>` · `ICurrentTenantStore<TTenant>` | Host implement store |

| Quy tắc | Chi tiết |
|---------|----------|
| Mặc định | Entity map cột audit / tenant đúng contract marker Jarvis để interceptor EF hoạt động |
| Lấy tenant / user trong code | `ICurrentTenant<T>` / `ICurrentUser<T>` — không `IHttpContextAccessor` + string claim trong handler |
| Tenant từ client | **Không** nhận / filter `TenantId` từ body hay query khi request đã authenticated và Jarvis đã resolve tenant phiên |
| Ngoại lệ | Marker riêng hoặc bypass Jarvis chỉ khi đã chứng minh Jarvis không đủ và **người** duyệt (ghi DEC) |

Phần *file đặt ở đâu* của các marker này thuộc [minipower-backend-architecture-dotnet](../../minipower-backend-architecture-dotnet/SKILL.md).

---

## 14. Mã lỗi nghiệp vụ — `IErrorCode`

| Việc | Quy tắc |
|------|---------|
| Khai báo | Class implement `IErrorCode` (`Platform.DDD.Domain.Shared.ExceptionHandling`), hằng `const string`, `[Display(Description = "...")]`. Namespace `{Product}.ErrorCodes` hoặc `{Module}ErrorCode.cs`. Mẫu: `Sample/ErrorCodes/SampleErrorCode.cs`, `Platform.Modules.Account/AccountErrorCode.cs` |
| Ném | `BusinessException` kèm mã đã khai. Không ném chuỗi tự do thay mã; không `throw new Exception("...")` cho lỗi nghiệp vụ (mục 3) |
| Giá trị `code` | Chuỗi **đúng 5 chữ số** (`"98501"`) — constructor `BusinessException` chạy `int.Parse(code)`, mã chữ (`nameof`, `{MOD}-VAL-001`) là `FormatException`. Dải theo bảng *Dải mã lỗi* dưới đây |
| Không trùng | Mã duy nhất trên **toàn solution**: `ErrorCodeHelper` gộp mọi class `IErrorCode` bằng `Dictionary.Add` — trùng một mã là mọi `BusinessException` lỗi theo. Class mã lỗi không implement `IErrorCode` thì không vào catalog (message rỗng) |
| Trên dây | `code` trả ra là `{EntryAssembly}:{mã}` (vd `Sample.Api:98501`) — `BaseResponse.GenerateCode` tự ghép, **không** tự thêm tiền tố. FE hiện nguyên văn `[Sample.Api:98501] message` |
| Message | Tiếng Việt, câu đầy đủ, gắn với mã — là **câu cuối** người dùng đọc: FE hiện nguyên văn, không dịch, không ghép. Câu sai / khó hiểu ⇒ sửa `Description` của mã ở backend, không chờ FE vá. Chi tiết kỹ thuật ghi log / `systemMessage`, không thay message |
| Câu có tham số | `Description` có chỗ trống `{0}`, `{1}`… (định dạng invariant, vd `'{0:N0}'`); ném `new BusinessException(mã, new ErrorMessageArgs(cột, số dòng…))` — câu vẫn lấy từ catalog, framework điền tham số. Tham số chỉ là dữ liệu nghiệp vụ (tên cột, mã template, số dòng); **không** truyền `ex.Message`, stack, connection string, PII. Lớp con (`NotFoundException`…) chưa có overload này — cần thì ném `BusinessException` rồi override `HttpStatusCode` như các exception domain |
| Bọc lỗi kỹ thuật | `catch (Exception ex) { log kèm id / dữ liệu lỗi; throw new BusinessException(mã, message, ex); }` — stack gốc nằm ở `InnerException`. Không `throw new BusinessException(...)` tại `catch` mà bỏ inner |
| Ra dây | Mọi response lỗi (4xx / 5xx) trả `code` + `error.message` (hình dạng body theo `BaseResponse` — [swashbuckle](../../minipower-backend-swashbuckle-dotnet/SKILL.md)); `error.systemMessage` chỉ cho kỹ thuật, FE không hiển thị. UI hiện nguyên `[code] message`, **không bọc lại** ([frontend convention § 5.1](../../../../frontend/skills/minipower-frontend-convention-react/reference/coding-convention.md#51-lỗi-từ-backend--không-bọc-lại)). Không stack, không message exception của framework trong `error.message` |
| Lỗi thiếu message | Không trả 401 / 403 / 404 / 5xx body rỗng hoặc chỉ có `code` — FE khi đó chỉ hiện được reason phrase của HTTP status (`[Sample.Api:99404] Not Found`), người dùng không biết lỗi gì. Lỗi chưa map (500) vẫn trả `code` + câu chung của catalog, message exception vào `systemMessage` / log |
| Middleware | Handler/controller **không** bọc `BusinessException` trong `try`/`catch` để trả `IActionResult` lỗi. Middleware map exception → HTTP status (`BusinessException` mặc định 422; `NotFoundException` 404; …) + `BaseResponse`. |
| `try`/`catch` | Chỉ khi người đã OK slice. Không nuốt; không `return` status tay thay throw. |

Mã lỗi không phải chỗ để `NoWarn`: hằng chưa khai thì khai thêm, không nối chuỗi tạm.

### 14.1 Dải mã lỗi

| Dải | Dành cho | Chia khối |
|-----|----------|-----------|
| `0xxxx` – `8xxxx` | **Sản phẩm** dựng trên Platform | Mỗi module một khối **10.000** — `M0000` … `M9999`, `M` là số module |
| `9xxxx` | **Platform** — framework và module đi kèm | Khối 100 trong `98xxx`; module Platform mới xin khối trống |
| `99xxx` | Mã đặc biệt của framework — **bọc HTTP status**: `99` + status (`99400`, `99401`, `99403`, `99404`, `99409`, `99422`, `99500`…) | Dùng khi lỗi không có mã nghiệp vụ riêng — `ApiResponseWrapperMiddleware` tự gán `99{status}` cho body lỗi 400/401/403/404 không có mã (câu lấy `Description` nếu body không có), lỗi chưa map ⇒ `99500`. Module (Platform hay sản phẩm) **không** cấp mã trong `99xxx` |

Bảng khối dưới đây là **nguồn duy nhất** — module mới (Platform hay sản phẩm) xin khối bằng cách thêm dòng vào bảng này, không khai ở tài liệu dự án, không tự chọn số.

Khối đang dùng:

| Khối | Class | Module |
|------|-------|--------|
| `1xxxx` | `SampleErrorCode` | host `Sample` (demo Platform) — khối sản phẩm số 1 |
| `980xx` | `AccountErrorCode` | identity · Account |
| `981xx` | `SettingErrorCode` | settings |
| `982xx` | `NotificationErrorCode` | notifications |
| `983xx` | `OrgErrorCode` | orgs |
| `984xx` | `TenantErrorCode` | tenants |
| `985xx` | `OrgStructureErrorCode` | orgstructure |
| `986xx` | `IdentityAdminErrorCode` | identity · IdentityAdmin |
| `987xx` | `CompanyProfileErrorCode` | companyprofile |
| `988xx` | `FileErrorCode` | files |
| `989xx` | `ImportExportErrorCode` | importexport |
| `99xxx` | `BaseErrorCode` | framework — `99{status}` bọc HTTP status · `99001`–`99003` (rate limit, captcha, sửa đồng thời) · `99999` lỗi chung |

**Platform:** `BusinessException` — `erp_core/platform/frameworks/Platform.DDD.Domain.Shared/ExceptionHandling/BusinessException.cs`.

---

## 15. Schema — chỉ qua migration

Không viết code tạo hoặc sửa bảng trong logic ứng dụng. Service, handler, controller, hosted service và seed nghiệp vụ không được chạy DDL.

| Cấm trong logic | Dùng thay thế |
|-----------------|---------------|
| `CREATE` / `ALTER` / `DROP` `TABLE` hoặc `INDEX` | EF migration (`dotnet ef migrations add`) |
| `ExecuteSql` / `ExecuteSqlRaw` / `ExecuteSqlInterpolated` để đổi schema | `migrationBuilder.CreateTable`, `AddColumn`, `CreateIndex`, … |
| `EnsureCreated` để “vá” bảng mới vào database đã tồn tại | `Database.Migrate` khi host khởi động |

Migration nằm cạnh `DbContext` của host (thư mục `Migrations/`). Entity và `OnModelCreating` mô tả model; file migration là chỗ duy nhất sinh DDL. Trong file đó dùng API `migrationBuilder`. `migrationBuilder.Sql` chỉ khi builder không diễn được thao tác (ví dụ áp lên database đã có bảng nhưng chưa có `__EFMigrationsHistory`). Database đã có từ trước khi có history thì migration mới phải áp được bằng `Migrate`, không vá bằng SQL trong request.

---

## 16. Catalog quyền (`IPermissionDefinition`)

Mỗi **vùng nghiệp vụ / module package** sở hữu một class quyền riêng — **một class, một file**, không gom mọi `Platform.*` vào một `*Permissions` khổng lồ.

| Quy tắc | Chi tiết |
|---------|----------|
| Vị trí | Package sở hữu API: ví dụ `Platform.Tenants/Authorization/PlatformTenantPermissions.cs`, `Platform.Orgs/Authorization/PlatformOrgPermissions.cs`, identity admin trong `Platform.Modules.IdentityAdmin/Authorization/`. |
| Interface | `public sealed class XPermissions : IPermissionDefinition` + reference `Platform.Permissions.Abstractions`. |
| Hiển thị UI | Class: `[Display(Name = "Platform", Description = "<vùng>", Order = n)]`. Field: `[Display(Description = "…", GroupName = "…", Order = n)]` — nhãn ngắn thêm `Name` trên field khi cần. |
| Mã quyền | Chuỗi ổn định `Platform.{Area}.{Action}` (ví dụ `Platform.Tenant.Create`). Hằng field PascalCase ngắn: `View`, `Create`, `Update`, `Delete`, `Manage`, `Connection` — **không** prefix lặp `TenantView` trên class `PlatformTenantPermissions`. |
| `Manage` | Chỉ mở menu FE — **không** dùng làm wildcard API; handler không coi `Manage` = full CRUD. |
| Cấm alias | Không class wrapper chỉ re-export chuỗi; không duplicate file `TenantPermissions` song song `PlatformTenantPermissions` cùng mã. |
| Policy ASP.NET | `[Authorize(Policy = XPermissions.View)]` — policy name **trùng** mã quyền; đăng ký qua `PlatformPermissionCodes` / `PermissionCatalogBuilder.Build`. |
| Host | `Platform.Host.Authorization.PlatformPermissionAssemblies` liệt kê assembly module; `AddPlatformIdentityAdmin` merge với `permissionAssemblies` của product (`PermissionCatalogBuilder.Build`). **Không** đặt danh sách assembly trong IdentityAdmin. |

Quyền **App** (tenant/org trong phiên nghiệp vụ, ví dụ `Org.View` trong `SystemPermissions`) tách khỏi **Platform** (`Platform.Org.View`) — không trộn namespace hay class.
