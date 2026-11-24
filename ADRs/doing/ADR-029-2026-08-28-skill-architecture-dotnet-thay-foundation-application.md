# Gộp `foundation-dotnet` + `application-dotnet` thành một skill kiến trúc DDD cho module `backend`

| | |
|---|---|
| **Ngày** | 2026-08-28 |
| **Trạng thái** | QĐ-1…13 chốt 2026-08-28 · 11/11 bước §7 thi hành xong cùng ngày · T4–T9 xanh, **T1–T3 chờ chủ repo chạy trên solution .NET thật** |
| **Phạm vi** | `backend/skills/` — xoá 2 skill lá, mở 1 skill lá mới `minipower-backend-architecture-dotnet`; thêm template architecture test vào `minipower-backend-scaffold-dotnet` |
| **Ngoài phạm vi** | Không đụng `sdlc/` · không đụng `rules.json` (skill lá-rời không qua router — [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-5) · không mở module mới · không đổi 12 skill lá còn lại |
| **Nối tiếp** | [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) (đặt tên 15 lá) · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-4/QĐ-5/QĐ-7 (hệ tên, lá-rời, quy tắc 3 câu hỏi) · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-3 ("cứng bằng máy, mềm bằng lời") · **[ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a hàng #3 + #4** — ADR này là đợt rút hai file đó khỏi `staging/` |
| **Mục đích** | Ghi lại vì sao hai skill lá bị xoá và vì sao thứ thay thế chúng là *một* skill kiến trúc có cổng cứng, không phải hai skill wiring |
| **Ảnh hưởng** | `backend/skills/minipower-backend-foundation-dotnet/` (xoá) · `backend/skills/minipower-backend-application-dotnet/` (xoá) · `backend/skills/minipower-backend-architecture-dotnet/` (mới) · `backend/skills/minipower-backend-scaffold-dotnet/{SKILL.md,README.md,workflows/add.md,templates/SKILLS.md,templates/docs-Architecture.md,templates/layers/appsettings.json,templates/tests/}` · `backend/skills/minipower-backend-review-dotnet/SKILL.md` · `backend/README.md` · `backend/PACK.md` · `ADRs/ADR-021…md` (gỡ href, giữ chữ) · `staging/dotnet-clean-architecture.md` + `staging/dotnet-ddd.md` (rút, xoá) |

---

## §1. Bối cảnh

Module `backend` hiện có **15 skill lá** ([ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md)). Ba trong số đó chồng lấn nhau ở vùng "dựng bộ khung": `scaffold` (cấp solution), `foundation` (cấp Host), `application` (cấp Application layer).

Đối chiếu file thật ngày **2026-08-28**:

| Tài sản của `foundation-dotnet` | Đối chiếu |
|---|---|
| `workflows/init.md` — `AddCoreJson → AddCoreCors → AddCoreDomain → AddCoreWebApi`, pipeline `UseCoreCors → UseCoreMiddleware<ApiResponseWrapperMiddleware> → MapControllers` | Trùng nguyên văn `scaffold/templates/layers/HostLayerExtension.cs` |
| `templates/appsettings-foundation.json` | **Tập con** của `scaffold/templates/layers/appsettings.json` — `Json` và `Middlewares` giống hệt, chỉ thiếu `"Cors": {}` ở bản scaffold |
| `templates/program-setup.cs` | **Tập con** của `scaffold/templates/program-setup.cs` — `diff` chỉ có dòng thêm, không có dòng sửa |
| Ca brownfield "solution có sẵn" | `scaffold/workflows/init.md` đã lo: *"Nếu chưa có `HostLayerExtension`, copy từ `templates/layers/HostLayerExtension.cs`"* |
| `workflows/add.md` — đổi CORS / `Includes` / `IgnoreNull` | Thực chất là sửa 3 dòng `appsettings` |

| Tài sản của `application-dotnet` | Đối chiếu |
|---|---|
| `workflows/init.md` | Trùng `scaffold/templates/layers/ApplicationLayerExtension.cs` — nội dung thật là 3 dòng (`AddCoreApplication()`) |
| `workflows/add.md` + `templates/command-handler.cs` | **Không trùng ở đâu.** Đây là thứ duy nhất còn sống — và là bề mặt kích hoạt **tần suất cao nhất** của cả module: mỗi tính năng mới đều thêm command/query |

Cùng lúc, README framework Jarvis (`hoangnh2412/jarvis`, đọc 2026-08-28) khai kiến trúc là **hai trục bổ sung** — Clean Architecture theo chiều dọc (5 layer, *"phụ thuộc một chiều"*) và Atomic Module theo chiều ngang (`Jarvis.Caching`, `Jarvis.BlobStoring`, … đăng ký bằng extension). Repo `minipower` hiện chỉ có skill cho **trục ngang** (12 lá module) — trục dọc, tức *code mới đặt ở layer nào và được phép nhìn thấy layer nào*, **không có skill nào giữ**.

Đó là lỗ hổng đúng chỗ agent hay sai nhất khi viết tính năng mới ("vibe code"): handler viết thẳng vào `Host`, `DbContext` inject vào controller, entity kéo theo `Microsoft.EntityFrameworkCore` vào `Domain`.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | `foundation-dotnet` trùng ~90% với template scaffold; sau khi scaffold chạy, tần suất kích hoạt thật ≈ 0 | Ba nguồn cho cùng một đoạn wiring Host — sửa một chỗ, hai chỗ kia lệch âm thầm; đã lệch sẵn (`"Cors": {}` có ở foundation, thiếu ở scaffold) |
| P2 | `application-dotnet` mang tên và `description` của việc *khởi tạo* (`"Thiết lập Jarvis.DDD.Application"`), trong khi giá trị thật nằm ở việc *thêm handler* | Lá-rời sống nhờ `description` ([ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-5b). `description` mô tả việc chỉ chạy một lần ⇒ skill không được gọi vào đúng lúc cần nhất |
| P3 | Không skill nào giữ **trục dọc**: quy tắc phụ thuộc giữa 5 layer, chỗ đặt Entity/Repository/Handler/Adapter | Agent vibe code tính năng mới không có nguồn tra; sai kiến trúc chỉ lộ ra ở review PR — muộn và đắt |
| P4 | Nhu cầu *"agent phải LUÔN tuân thủ kiến trúc"* không có cơ chế thi hành | Viết chữ "bắt buộc" vào markdown không FAIL được bằng máy ⇒ vi phạm chính phép thử của [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-3 |
| P5 | `foundation` giữ 2 anti-pattern có giá trị thật (`UseCoreMiddleware` đặt sau `MapControllers`; bỏ `AddCoreDomain` khi app dùng `IWorkContext`) + note `Jarvis.Mvc` kéo transitive `Common`/`Domain.Shared`/`OpenTelemetry` | Xoá thẳng là mất tri thức |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | Hệ tên giữ nguyên: `minipower-backend-{capability}[-{stack}]`, kebab, ≤64, `name` ≡ tên thư mục ([ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-4; có `backend-pack.test.js` canh) |
| C2 | Skill lá-rời **không** đăng ký vào `rules.json` / router — sống nhờ `description` ([ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-5) |
| C3 | "Cứng bằng máy, mềm bằng lời" ([ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-3): chỉ viết "bắt buộc" cho thứ FAIL được bằng máy. Không mở lại trong ADR này |
| C4 | Không mở module mới ([ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 luật 2); skill mới nằm trong `backend/` |
| C5 | "Co lại trước khi mở rộng" ([AGENTS.md](../../AGENTS.md)): tổng số lá **không được tăng** sau đợt này |
| C6 | Framework Jarvis là repo ngoài — ADR này **không** đề xuất sửa gì trong `hoangnh2412/jarvis`, chỉ mô tả lại kiến trúc của nó |

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Giữ nguyên 3 skill | Không phải sửa gì | P1–P5 còn nguyên; 3 nguồn cho một đoạn wiring | ❌ |
| O2 | Xoá `foundation`, giữ `application` thu hẹp về "thêm handler" | Rẻ nhất; đúng tần suất kích hoạt | P3/P4 chưa giải: vẫn không ai giữ trục dọc; skill "thêm handler" chỉ phủ 1 trong 5 layer, mà một tính năng thật chạm cả 5 | ❌ |
| O3 | Xoá cả hai; mở `minipower-backend-architecture-dotnet` — kiến trúc DDD 5 layer + **lát cắt dọc** thêm tính năng, kèm architecture test làm cổng cứng | Giải P1–P5; số lá 15 → **14** (giảm, đúng C5); khớp đúng khuôn `convention-dotnet` (hai tầng cứng/mềm) đã chứng minh hoạt động | Phải viết mới template architecture test + chọn thư viện; đụng 9 file có ref | ✅ chọn |
| O4 | Như O3 nhưng skill kiến trúc chỉ là văn bản, không có architecture test | Rẻ hơn O3 | Rơi thẳng vào P4 — "luôn tuân thủ" viết bằng lời thì không phải cổng, chỉ là advisory dài hơn | ❌ |

**Vì sao O3 chứ không O2 — chỗ này là lõi của quyết định.** Một tính năng backend thật không phải "một handler": nó là **lát cắt dọc** xuyên 5 layer — Entity/Repository interface ở `Domain`, Command + Handler + DTO ở `Application`, implement repository ở `Infrastructure`, Controller ở `Host`. Skill chỉ dạy tầng Application thì đúng 1/5 việc, và **không** trả lời được câu agent hay hỏi sai nhất: *"đặt cái này ở đâu, được reference cái gì"*. Trục dọc mới là đơn vị công việc, không phải một layer.

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Xoá `minipower-backend-foundation-dotnet`** | Trùng lặp (P1). Không deprecate, không alias — xoá thư mục |
| **QĐ-2** | **Xoá `minipower-backend-application-dotnet`** | Nửa `init` thừa (P1); nửa `add` chuyển vào skill kiến trúc cùng `templates/command-handler.cs` (P2) |
| **QĐ-3** | **Mở `minipower-backend-architecture-dotnet`** — kiến trúc DDD/Clean của Jarvis | 39 ký tự, đạt C1. Nội dung: (a) 5 layer + **luật phụ thuộc một chiều**; (b) chỗ đặt từng loại tạo tác DDD (Aggregate · Entity · Value Object · Repository interface · Domain Service · Domain Event ở `Domain`; Command/Query/Handler/DTO ở `Application`; adapter EF/cache/blob ở `Infrastructure`; Controller/middleware/composition root ở `Host`); (c) **Layer Extension pattern** — `Program.cs` chỉ `AddHostLayer()`/`UseHostLayer()`; (d) trục ngang Atomic Module → trỏ sang 12 skill module, **không** nhân đôi |
| **QĐ-4** | Workflow chính của skill mới là **lát cắt dọc**, không phải "thêm handler" | `workflows/add-feature.md`: Domain → Application → Infrastructure → Host, mỗi bước nêu chỗ đặt + reference được phép + anti-pattern. `workflows/add-handler.md` kế thừa từ `application-dotnet/workflows/add.md` làm bước con |
| **QĐ-5** | **Cổng cứng = architecture test, không phải chữ trong markdown** | Skill mang `templates/ArchitectureTests/` → đặt vào `tests/{Product}.ArchitectureTests` của dự án đích. Luật kiểm bằng máy tối thiểu: `Domain` không reference `Application`/`Infrastructure`/`Host`/`Microsoft.EntityFrameworkCore` · `Application` không reference `Host`/`Infrastructure` · Controller không inject `DbContext` · Handler nằm trong assembly `*.Application`. Sai ⇒ `dotnet test` **đỏ**. Đây là câu trả lời cho P4: *"luôn tuân thủ"* nghĩa là **build/test đỏ khi làm sai**, không phải một dòng chữ |
| **QĐ-6** | Skill mới theo **khuôn hai tầng của `convention-dotnet`** | Bảng "Cứng — `dotnet test`/`dotnet build` FAIL được" vs "Mềm — advisory, người quyết". Rule máy kiểm được thì **đừng nhắc bằng lời**; rule máy không kiểm được thì **đừng viết "bắt buộc"** |
| **QĐ-7** | Ranh giới với `convention-dotnet` — **không** chồng lấn. **Phát biểu chuẩn (chủ repo, 2026-08-28):** *architecture* trả lời **"File nằm ở đâu? Reference thế nào?"** · *convention* trả lời **"Code trong file viết thế nào?"** — dùng nguyên hai câu này làm câu mở đầu mục ranh giới trong cả hai `SKILL.md` | `architecture` lo *chỗ đặt code + hướng phụ thuộc* (cấp file/project); `convention` lo *cách viết dòng code* (cấp dòng). Skill mới **trỏ sang** convention ở mục "Output bắt buộc", không chép lại quy ước nào. Cặp cổng cứng bổ sung nhau: `dotnet format` + analyzer (convention) · `dotnet test` architecture test (architecture) |
| **QĐ-8** | Tri thức của `foundation` **tán, không xoá** (P5) | 2 anti-pattern + note transitive `Jarvis.Mvc` → `review-dotnet/SKILL.md` (đã có sẵn 1 mục check `Includes`, đặt cạnh) · `"Cors": {}` → bổ sung vào `scaffold/templates/layers/appsettings.json` (vá luôn chỗ lệch đã phát hiện ở P1) · thứ tự pipeline → comment trong `HostLayerExtension.cs`. **Kiểm kê chính xác 4 mảnh — xem §5b** |
| **QĐ-9** | ADR cũ: **chữ giữ nguyên, gỡ href** | [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) liệt kê 15 lá như bản ghi lịch sử. Hai tên bị xoá đổi từ link sang code span để `link:check` sạch mà câu chữ không đổi — biến thể của [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-11 cho ca file biến mất |
| **QĐ-10** | **Rút `staging/dotnet-clean-architecture.md` + `staging/dotnet-ddd.md` vào skill mới** — thi hành [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a hàng #3/#4 | Hai file (54 + 121 dòng) đã được ADR-028 khai đích là *"`backend/` — skill kiến trúc layer (mới)"* và *"cùng #3, hoặc `reference/` của nó"* — **skill của ADR này chính là cái đích đó**. Rút thành `reference/clean-architecture.md` + `reference/ddd-tactical.md` theo khuôn `convention-dotnet` (*"không load mặc định; mở khi cần tra một mục cụ thể"*), `SKILL.md` giữ mỏng. Xoá khỏi `staging/` sau khi rút — kho **13 → 11** file gốc. Ba việc phải làm khi rút, không được bê nguyên: (a) cả hai file trỏ `skills/architechture-dotnet.md` — file **không tồn tại**, nằm trong 27 nợ link baseline ⇒ đổi sang `scaffold/reference/solution-structure.md`; (b) mâu thuẫn nội bộ *"interface repository ở Domain"* (ddd 6.C) vs *"Domain hoặc Application"* (clean 3.3) ⇒ chốt **Domain**, theo README Jarvis; (c) bỏ mọi chỗ tự xưng "Skill …" trong tiêu đề — chúng là `reference/`, không phải skill |
| **QĐ-11** | **Chưa mở skill microservice.** Trục dọc phục vụ cả monolith lẫn microservice, không sửa gì | Lọc qua [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7: câu (2) *"framework/stack có vòng đời riêng, hoặc người dùng khác hẳn?"* = **không** — vẫn .NET/Jarvis, vẫn backend dev. Phần đặc thù microservice mà Jarvis hỗ trợ **hôm nay** đã có lá riêng (telemetry · healthcheck · caching Redis · realtime backplane); phần đặc thù thật — **event bus (RabbitMQ/Kafka), outbox/inbox, integration events** — README Jarvis khai **📋 roadmap, chưa ship** ⇒ skill viết bây giờ không wrap được gì, chỉ là lý thuyết microservice chung, trái *wrap-not-build* ([ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md)) và trái QĐ-7 luật 2 (*"chưa có skill thật thì chưa tạo thư mục"*). **Chỗ trú tạm:** ranh giới service = **bounded context**, thuộc strategic DDD (`reference/ddd-tactical.md` mục 6.A) ⇒ skill mới có một mục ngắn *"Một service hay nhiều service"* trỏ sang các lá đã có. **Dấu hiệu mở ADR riêng:** Jarvis chuyển event bus + outbox/inbox từ 📋 sang ✅ |
| **QĐ-12** | **Nguồn chân lý kiến trúc = repo Jarvis, nhánh `develop`** — không phải 2 file `staging/` | Chốt 2026-08-28 (Q7–Q11). Chỗ nào `staging/` nghịch Jarvis thì **sửa `staging/` theo Jarvis**, không đàm phán. Chuỗi phụ thuộc thật, đọc csproj `develop` ngày 2026-08-28 — xem §5a. Hệ quả trực tiếp: 3 điều cấm trong `dotnet-clean-architecture.md` 3.1 **sai so với Jarvis** và phải bỏ khi rút (`Newtonsoft.Json`, `Microsoft.Extensions.*`, và luật "UoW interface ở Application"); ngược lại 1 chỗ **scaffold sai so với Jarvis** và phải sửa (`Application.csproj` thừa `FrameworkReference`) |
| **QĐ-13** | **Gộp `staging/dotnet-structure.md` (295 dòng) vào `minipower-backend-scaffold-dotnet`** trong cùng đợt | Chốt 2026-08-28 (Q17) — thi hành thêm [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a **hàng #5**. Kho `staging/` **13 → 10** file gốc. Ràng buộc khi gộp: ADR-028 §5a hàng #5 tự ghi *"kiểm trùng với scaffold hiện có trước"* — phần nào `scaffold/reference/solution-structure.md` đã nói thì **không chép lại**, chỉ bổ sung phần thiếu |

### Số lá: 15 → 14

```text
xoá   minipower-backend-foundation-dotnet     (−1)
xoá   minipower-backend-application-dotnet    (−1)
mới   minipower-backend-architecture-dotnet   (+1)
                                              ───
                                              14   ✓ C5 (không tăng)
```

`backend-pack.test.js` khẳng định `skillDirs.length >= 14` — 14 vẫn qua, **không nới ngưỡng**.

### Bản đồ 5 layer (nội dung lõi của skill mới)

```text
Host              composition root · Controller · middleware · AddHostLayer/UseHostLayer
  ↑
Infrastructure    EF · cache · blob · adapter ngoài · implement Repository
  ↑
Application       Command · Query · Handler · DTO · ICommandDispatcher/IQueryDispatcher
  ↑
Domain            Aggregate · Entity · Value Object · Repository interface · Domain Service · Domain Event
  ↑
Domain.Shared     enum · const · kiểu dùng chung — không phụ thuộc gì
```

Mũi tên đọc là *"được phép biết"*. Ngược chiều mũi tên là vi phạm, và là thứ QĐ-5 bắt bằng `dotnet test`.



### §5b. QĐ-8 — kiểm kê chính xác cái gì đi đâu

`foundation-dotnet` có 6 file. Bốn mảnh dưới đây là **toàn bộ** phần không trùng ở đâu khác; mọi thứ còn lại đã có bản sao trong scaffold (§1). Xoá skill mà không tán 4 mảnh này thì mất hẳn.

| # | Mảnh tri thức | Đang nằm ở | Chuyển tới | Vì sao chỗ đó |
|---|---|---|---|---|
| 1 | *"`UseCoreMiddleware` đặt sau `MapControllers` ⇒ middleware không chạy"* | `foundation/workflows/add.md` mục Anti-patterns | `review-dotnet/SKILL.md` | Là **lỗi phát hiện lúc đọc code**, không phải lúc dựng — đúng vai review. File đó đã có sẵn một dòng cùng chủ đề (*"`ApiResponseWrapper` `Includes` khớp route API thực tế"*), đặt cạnh nhau |
| 2 | *"Bỏ `AddCoreDomain` khi app dùng `IWorkContext` / enricher tenant"* | như trên | `review-dotnet/SKILL.md` | như trên — triệu chứng là `IWorkContext` null lúc chạy, review bắt được |
| 3 | *"`Jarvis.Mvc` kéo transitive `Jarvis.Common` + `Domain.Shared` + `OpenTelemetry` — cân nhắc khi chỉ cần domain thuần"* | `foundation/SKILL.md` mục Quy tắc cốt lõi | Catalog package trong `scaffold/SKILL.md` | Là thông tin **chọn package lúc dựng**, thuộc bảng catalog. Đã đối chiếu `develop` 2026-08-28: `Jarvis.Mvc.csproj` → `Domain.Shared` · `Common` · `OpenTelemetry` — **đúng nguyên văn** |
| 4 | `"Cors": {}` | `foundation/templates/appsettings-foundation.json` | `scaffold/templates/layers/appsettings.json` | Đây là **chỗ lệch đã tồn tại** (P1): bản foundation có section, bản scaffold thiếu. Tán mảnh này chính là **vá lỗi**, không chỉ di chuyển |

Kèm theo (không phải tri thức mới, chỉ chống tái phạm): thứ tự `UseCoreCors → UseCoreMiddleware<ApiResponseWrapperMiddleware> → MapControllers` viết thành **comment ngay trên `UseHostLayer`** trong `templates/layers/HostLayerExtension.cs` — để người sửa file thấy luật tại chỗ, khỏi phải nhớ đã đọc ở đâu.

Sau bước này `foundation-dotnet` **không còn gì chưa có nhà** ⇒ xoá được (QĐ-1).

### §5a. Chuỗi phụ thuộc Jarvis thật — đọc csproj nhánh `develop` ngày 2026-08-28

```text
Jarvis.DDD.Domain.Shared   → Newtonsoft.Json
Jarvis.DDD.Domain          → Domain.Shared · Jarvis.OpenTelemetry
                             · Microsoft.Extensions.{Configuration,DependencyInjection,Hosting}.Abstractions
Jarvis.DDD.Application.Contracts → Jarvis.DDD.Domain
Jarvis.DDD.Application     → Jarvis.DDD.Application.Contracts
Jarvis.ORM.EntityFramework → Jarvis.Caching · Jarvis.DDD.Domain · Jarvis.Common
```

Vị trí tạo tác (nhánh `master`, cùng cây thư mục): `ICommand`/`IQuery` ở **`Domain.Shared/Messaging/`** · `ICommandHandler`/`IQueryHandler`/dispatcher ở **`Application.Contracts/`** · `IRepository`/`ICommandRepository`/`IQueryRepository`/**`IUnitOfWork`** ở **`Domain/Repositories/`** · `IEntity`/`BaseEntity` ở **`Domain/Entities/`** · `IWorkContext` ở **`Domain/Services/`**.

**Năm điều rút ra, ghi đè tài liệu `staging/`:**

| # | `staging/dotnet-clean-architecture.md` nói | Jarvis thật | Kết luận |
|---|---|---|---|
| 1 | Domain **không** phụ thuộc `Newtonsoft.Json` | `Jarvis.DDD.Domain.Shared` → `Newtonsoft.Json` ⇒ Domain thừa hưởng | **Bỏ** điều cấm khi rút |
| 2 | Domain **không** phụ thuộc `Microsoft.Extensions.*` | `Jarvis.DDD.Domain` → 3 gói `Microsoft.Extensions.*.Abstractions` | **Bỏ** điều cấm |
| 3 | UoW interface *"thường ở Application"* (3.3 + `ddd` 6.C) | `IUnitOfWork` nằm ở `Jarvis.DDD.Domain/Repositories/` — scaffold cũng đặt `IAppUnitOfWork` ở `{Product}.Domain.Repositories` | **Domain** (Q7 đóng) |
| 4 | Domain **không** phụ thuộc EF Core | `Jarvis.DDD.Domain` **không** reference EF; `Jarvis.ORM.EntityFramework` reference ngược vào Domain | **Đúng — giữ**, thành luật R2 |
| 5 | Application **không** biết ASP.NET Core | `Jarvis.DDD.Application` **không** có `FrameworkReference` nào | **Đúng — và scaffold đang sai**: `templates/layer-csproj/Application.csproj.xml` thừa `<FrameworkReference Include="Microsoft.AspNetCore.App" />` ⇒ **bỏ** (Q8 đóng) |

**Trôi lệch phát hiện thêm — ngoài phạm vi ADR này, ghi để không quên:** catalog scaffold ghi `Jarvis.EntityFramework` 1.0.0, nhưng trên `develop` project đã đổi tên thành **`Jarvis.ORM.EntityFramework`**; `develop` còn có `Jarvis.Multitenancy(.EntityFramework)` · `Jarvis.ORM.Dapper` · `Jarvis.OpenTelemetry.DDD` · `modules/Jarvis.Modules.{Notifications,Setting}` mà README `master` vẫn khai 📋 roadmap. Cần một đợt soát catalog riêng — **không** kéo vào ADR-029.

## §6. Confirm *(bắt buộc trước khi thi hành)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…QĐ-13? | **2026-08-28: OK 12/13** — QĐ-1…7, 9, 10, 12, 13 duyệt; **QĐ-11 "chưa cần làm ngay"** ⇒ hiệu lực không đổi (không mở skill microservice), chỉ là chưa cần bàn thêm; **QĐ-8 chờ giải thích** — chưa thi hành bước 5 |
| Q2 | Tên skill + nguồn nội dung | **Chốt 2026-08-28: `minipower-backend-architecture-dotnet`.** ⚠️ Chủ repo viết `…architecture.dotnet` (dấu **chấm**) — hiểu là gõ nhầm: `backend-pack.test.js` ép regex `^minipower-backend-[a-z0-9]+(-[a-z0-9]+)*$` (C1, [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-4 — namespace bằng **gạch nối**, để mọi loader hiểu). Dấu chấm ⇒ test đỏ. Thi hành bằng **gạch nối**; nếu thật sự muốn chấm thì phải sửa cả QĐ-4 ADR-022 + test, và ADR này không mở lại (C1). **Nguồn nội dung chốt 2026-08-28:** lấy nội dung 2 file `staging/` bổ sung cho skill (⇒ QĐ-10) |
| Q3 | Thư viện architecture test — số liệu NuGet đọc **2026-08-28**, xem bảng §6a | **Chốt 2026-08-28: `TngTech.ArchUnitNET` + `TngTech.ArchUnitNET.xUnit`** |
| Q4 | Architecture test vào scaffold mặc định hay theo yêu cầu — xem §6b | **Chốt 2026-08-28: phương án A — mặc định luôn kiểm kiến trúc**, reference sai phải **báo lỗi** (cơ chế báo lỗi ⇒ Q12) |
| Q5 | Xác nhận QĐ-8 — tán tri thức `foundation` về `review-dotnet` + `scaffold`? | **Chốt 2026-08-28: OK** |
| Q6 | Xác nhận QĐ-10 (rút 2 file `staging/`) và QĐ-11 (chưa mở skill microservice, dấu hiệu mở = Jarvis ship event bus)? | **Chốt 2026-08-28: đúng** |

### §6a. Q3 — ba phương án, số liệu NuGet đọc 2026-08-28

| | `NetArchTest.Rules` | `NetArchTest.eNhancedEdition` | `TngTech.ArchUnitNET` | Tự viết, 0 package |
|---|---|---|---|---|
| Bản mới nhất | 1.3.2 | 1.4.5 | **0.13.4** | — |
| Ngày phát hành | **2021-05-23** | 2025-06-04 | **2026-08-20** (8 ngày trước) | — |
| Nhịp phát hành | **~5 năm không có bản nào** | ~1 bản/năm | 0.13.1 (12/2025) · 0.13.2 (01/2026) · 0.13.3 (03/2026) · 0.13.4 (08/2026) | — |
| Downloads | 15.0M | 912.5K | 5.1M (adapter xUnit) | — |
| Người bảo trì | Ben Morris — **ngưng** | NeVeS — **một người**, fork của 1.3.2, *"không 100% tương thích ngược"* với bản gốc | **TNG** (công ty; họ ArchUnit — chuẩn de-facto bên Java) | chính minipower |
| License | MIT | MIT | Apache 2.0 | — |
| Rủi ro | Chết. .NET mới phá là **không ai vá** | Bus factor **1** | API **0.x** — chưa cam kết ổn định, breaking change hợp lệ; cần chạy `dotnet test -c Debug` để đọc bytecode đúng | Nợ bảo trì vĩnh viễn của minipower |
| Cú pháp | Ngắn nhất | ~như bản gốc | Dài hơn: `Types().That().ResideInNamespace(…).Should().NotDependOnAny(…)` + `rule.Check(Architecture)` | tự định |

**Đề xuất: `TngTech.ArchUnitNET` + `TngTech.ArchUnitNET.xUnit`.** Lý do quyết định **không** phải cú pháp đẹp mà là **vòng đời**: skill này xuất một *template* xuống nhiều repo product của công ty, sống nhiều năm; template ghim một package đã 5 năm không release là món nợ tính bằng ngày .NET kế tiếp phá nó. Trong ba lựa chọn có người bảo trì thật, chỉ ArchUnitNET có nhịp release đều và có tổ chức đứng sau (bus factor > 1). Cái giá phải trả và **chấp nhận có ý thức**: bản `0.x` nên API có thể breaking — nhưng vùng ta dùng (`Types().That()…Should().NotDependOnAny()`) là lõi ổn định nhất của thư viện, và nếu vỡ thì vỡ ở **một** file template, không lan ra skill nào khác.

**Phương án 4 (tự viết) không bị loại vì kém** — nó rẻ hơn thật: 3 trong 4 luật của QĐ-5 là cấp **ProjectReference**, đọc `.csproj` bằng XML là kiểm được, ~40 dòng, 0 dependency. Chỉ 2 luật cấp **kiểu** (Controller inject `DbContext`; Handler nằm trong `*.Application`) mới cần reflection. Loại nó vì trái *wrap-not-build* ([ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md)): đổi nợ "package của người khác có thể chết" lấy nợ "code của mình phải nuôi mãi" — mà nợ thứ hai chắc chắn xảy ra, nợ thứ nhất chỉ là rủi ro. Giữ nó làm **đường lui** nếu Q3 chọn "không thêm dependency vào repo product".

### §6b. Q4 — "mặc định" nghĩa là gì

Hai lựa chọn cụ thể, không phải khái niệm:

| | **A — mặc định có** (đề xuất) | **B — chỉ khi yêu cầu** |
|---|---|---|
| `workflows/scaffold.md` | Tạo thêm `tests/{Product}.ArchitectureTests` trong **mọi** solution mới ⇒ output bắt buộc đổi từ *"5 project + 2 test"* thành *"5 project + **3** test"* | Không tạo |
| Cách bật | Không cần bật — có sẵn từ commit đầu | Người dùng gọi `architecture-dotnet/workflows/add-arch-test.md` |
| Chi phí | +1 test project, +2 package trong mọi repo — kể cả POC 2 tuần rồi vứt | 0 |
| Cổng cứng hoạt động từ | Commit đầu tiên | Lúc nào đó, nếu có ai nhớ |

**Đề xuất A**, vì một lý do thực nghiệm chứ không phải nguyên tắc: **architecture test thêm muộn là architecture test bị xoá.** Thêm vào lúc codebase đã lệch thì lần chạy đầu ra hàng chục lỗi, và phản ứng tự nhiên của người đang gấp là tắt nó đi, không phải sửa 30 chỗ. Thêm từ commit đầu thì mỗi vi phạm đỏ **đúng một cái** ngay lúc vừa gây ra — rẻ để sửa. Giá trị của cổng này nằm đúng ở giai đoạn code nhanh nhất, tức là giai đoạn `mvp`, nên "miễn cho `mvp`" là bỏ đúng lúc cần nhất.

Chốt xong: ghi ngày vào **Trạng thái** + cập nhật ghi chú [index](../README.md).

### §6c. Điểm phải chốt trước khi viết luật máy — phát hiện khi đối chiếu 2 file `staging/` với scaffold thật (2026-08-28)

Bốn mâu thuẫn dưới đây **không phải lỗi biên tập**: luật cứng viết đúng chữ tài liệu thì **solution vừa scaffold ra đã đỏ**. Phải chốt trước bước 3.

| # | Câu hỏi | Bằng chứng đối lập | Đề xuất | Trả lời |
|---|---|---|---|---|
| Q7 | **Interface Unit of Work đặt ở layer nào?** | `staging/dotnet-ddd.md` 6.C + `dotnet-clean-architecture.md` 3.3: *"interface thường ở **Application**"*. Scaffold thật: `templates/layers/IAppUnitOfWork.cs` khai `namespace {Product}.Domain.Repositories`, kế thừa `Jarvis.DDD.Domain.Repositories.IUnitOfWork` ⇒ **Domain** | **Domain** — theo Jarvis + scaffold; sửa lại 2 file `reference/` khi rút | **Đóng 2026-08-28 bằng QĐ-12** — `IUnitOfWork` ở `Jarvis.DDD.Domain/Repositories/` ⇒ **Domain** |
| Q8 | **Application có được reference ASP.NET Core?** | `dotnet-clean-architecture.md` 3.1 cấm thẳng. Scaffold thật: `templates/layer-csproj/Application.csproj.xml` có `<FrameworkReference Include="Microsoft.AspNetCore.App" />`; `ApplicationLayerExtension.cs` dùng `IHostApplicationBuilder` (`Microsoft.Extensions.Hosting`) | **(b)** — không cấm cả framework, cấm ở **cấp namespace kiểu** (`Microsoft.AspNetCore.Mvc`, `Microsoft.AspNetCore.Http`); nếu vẫn đỏ thì cộng **(c)** miễn trừ `*LayerExtension.cs`. Cần xác minh vì sao `FrameworkReference` có ở đó — nếu chỉ do `IHostApplicationBuilder` thì **(a)** đổi sang `IServiceCollection` và bỏ hẳn là sạch nhất | **Đóng 2026-08-28 bằng QĐ-12 — (a)**: `Jarvis.DDD.Application` **không** có `FrameworkReference` nào ⇒ **scaffold đang sai**, bỏ `<FrameworkReference Microsoft.AspNetCore.App>` khỏi `Application.csproj.xml` |
| Q9 | **Domain có được reference `Jarvis.DDD.Domain`?** | `scaffold/reference/solution-structure.md` bảng package ghi Domain *"(không bắt buộc Jarvis — giữ domain thuần)"*, nhưng `IAppUnitOfWork.cs` lại `using Jarvis.DDD.Domain.Repositories` ⇒ buộc phải reference. Ngoài ra `templates/layer-csproj/` **thiếu hẳn `Domain.csproj.xml`** | **Cho phép** (base interface thuần, không kéo EF), ghi rõ vào bảng + **bổ sung `Domain.csproj.xml`** đang thiếu | **Đóng 2026-08-28 bằng QĐ-12: cho phép.** `Jarvis.DDD.Domain` không reference EF (§5a điều 4) nên Domain product reference nó vẫn sạch; vẫn phải bổ sung `Domain.csproj.xml` |
| Q10 | **Host có được reference Domain trực tiếp?** | `dotnet-clean-architecture.md` 3.1: Host **không** phụ thuộc `Domain` trực tiếp. Jarvis bắt buộc ngược lại: Host cài `Jarvis.DDD.Domain` cho `IWorkContext`/enricher, `HostLayerExtension.cs` gọi `AddCoreDomain()` | **Cho phép ở cấp project** (composition root), **cấm ở cấp kiểu**: Controller không dùng type `{Product}.Domain.*` — khớp `ddd` 6.E *"không trả domain entity ra Host/API"* | **Đóng 2026-08-28: theo đề xuất.** Lưu ý trung thực: đây là **luật duy nhất KHÔNG rút được từ Jarvis** — `Sample/` của Jarvis là một project đơn, controller dùng entity trực tiếp, nên nó không phát biểu gì về ranh giới này. Là quy ước của minipower ⇒ nếu gây ma sát thì hạ xuống advisory trước tiên |
| Q11 | **Chốt danh sách luật cứng đợt đầu** (bao nhiêu luật đỏ được) | — | 7 luật, bảng ở §6d. Rủi ro cần cân: luật càng nhiều, false positive càng dễ khiến người ta **tắt test** — đúng thất bại mà QĐ-5 muốn tránh | **Đóng 2026-08-28 bằng QĐ-12** — bộ luật §6d **viết lại theo Jarvis thật**: R2 bỏ `Newtonsoft.Json` (§5a điều 1) và bỏ `Microsoft.Extensions.*` (điều 2), chỉ giữ EF Core (điều 4) |
| Q12 | **Báo lỗi lúc `build` hay lúc `test`?** — Q4 chốt *"reference sai phải báo lỗi"*, chưa chốt **ở đâu** | — | **(c) cả hai**: reference sai **cấp project** → `Directory.Build.targets` làm `dotnet build` **đỏ ngay** (khuôn `convention-dotnet`: analyzer ép lúc build); luật **cấp kiểu** → `dotnet test` đỏ. Phản hồi tính bằng giây thay vì chờ test | **Chốt 2026-08-28: CHỈ `dotnet test`.** Bỏ hẳn `Directory.Build.targets` — mọi luật R1–R7 về một cơ chế duy nhất, ArchUnitNET |
| Q13 | **Cấu hình chạy arch test** | ArchUnitNET khuyến nghị `dotnet test -c Debug` để đọc bytecode đầy đủ; CI thường chạy `-c Release` | Chạy arch test ở **Debug** thành job riêng trong CI | **Chốt 2026-08-28: OK** |
| Q14 | **Ép namespace hay chỉ ép assembly?** | `ddd` 6.I cho **2** kiểu (`Domain.Entities.Order` ↔ `Domain.Orders.Order`); `solution-structure.md` Q1 thêm kiểu **thứ 3** (`Domain/Features/<Context>/`) | Chỉ ép **assembly** (`*.Domain`, `*.Application`), **không** ép namespace con ⇒ cả 3 kiểu hợp lệ, khỏi phải chốt một kiểu | **Chốt 2026-08-28: ép assembly** — ví dụ đối chiếu ở §6e |
| Q15 | **Còn khuyến nghị AutoMapper không?** | `ddd` 6.E và `solution-structure.md` Q4 đều khuyến nghị AutoMapper | **Cần xác minh tình trạng license AutoMapper trước khi chốt** (có thông tin chuyển thương mại) — ba đường: giữ · đổi sang source-generator MIT (vd. Mapperly) · bỏ khuyến nghị, map thủ công | **Chốt 2026-08-28: giữ AutoMapper.** Ghi nhận đã xác minh — bản mới nhất **16.2.0 (2026-07-02)**, trang NuGet hướng dẫn *"register for your license key at AutoMapper.io"* ⇒ có **ràng buộc license thương mại**. Chủ repo quyết giữ; ghi lại để khi license thành vấn đề thì biết mở lại ở đâu |
| Q16 | **Luật "entity không public setter" — cứng hay mềm?** | `ddd` 6.H liệt kê là cấm kỵ; nhưng EF Core cần setter để materialize ⇒ false positive cao | **Mềm** — để `review-dotnet`, không đưa vào arch test đợt đầu | **Chốt 2026-08-28: mềm** |
| Q17 | **`staging/dotnet-structure.md` (295 dòng) có gộp trong đợt này không?** | [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a hàng #5 khai đích là gộp vào `scaffold`; nó cũng là nguồn của mấy mâu thuẫn trên | **Không** — đợt riêng, giữ ADR-029 một quyết định | **Chốt 2026-08-28: GỘP** (lật đề xuất) ⇒ **QĐ-13**. Kho `staging/` 13 → **10**. Đánh đổi chấp nhận có ý thức: ADR-029 thành ADR-đợt rộng hơn, trái [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) QĐ-4 (*"rút từng file một, mỗi file một thay đổi Full"*) — bù lại 3 file cùng nói về kiến trúc/cấu trúc solution, tách ra thì phải đọc chéo nhau 3 lần |

### §6d. Q11 — bộ luật chốt đợt đầu (viết lại theo Jarvis thật, QĐ-12)

Mọi luật chạy bằng **ArchUnitNET, đỏ khi `dotnet test`** (Q12 — không còn cổng build).

| # | Luật | Cấp | Căn cứ |
|---|---|---|---|
| R1 | Kiểu trong `*.Domain` không phụ thuộc `*.Application` / `*.Infrastructure` / `*.Host` | project | §5a chuỗi một chiều |
| R2 | Kiểu trong `*.Domain` không phụ thuộc namespace `Microsoft.EntityFrameworkCore` | kiểu | §5a điều 4 — **đã bỏ** `Newtonsoft.Json` (điều 1) và `Microsoft.Extensions.*` (điều 2) vì Jarvis dùng chúng |
| R3 | Kiểu trong `*.Application` không phụ thuộc `*.Infrastructure` / `*.Host` | project | §5a chuỗi một chiều |
| R4 | Kiểu trong `*.Application` không dùng `Microsoft.AspNetCore.Mvc` / `.Http` | kiểu | §5a điều 5 |
| R5 | Controller không inject `DbContext` / kiểu `*.Infrastructure` | kiểu | `ddd` 6.E |
| R6 | Controller không dùng kiểu `{Product}.Domain.*` làm tham số / kiểu trả về | kiểu | `ddd` 6.E — **quy ước minipower, không rút từ Jarvis** (Q10) |
| R7 | Cài đặt `ICommandHandler<>` / `IQueryHandler<>` chỉ nằm trong assembly `*.Application` | kiểu | §5a — handler contract ở `Application.Contracts` |

Mềm (advisory, `review-dotnet` lo): entity public setter (Q16) · `DateTime.Now` trong Domain · repository trả `IQueryable` · một transaction sửa nhiều aggregate root.

### §6e. Q14 — "ép assembly" khác "ép namespace" thế nào

**Assembly** = một project `.csproj` = một file `.dll`. **Namespace** = dòng `namespace …;` trong file — một assembly chứa rất nhiều namespace.

Cùng một project `Acme.Domain.csproj` (assembly `Acme.Domain`), tài liệu cho **ba** cách đặt folder đều hợp lệ:

```text
kiểu 1  (ddd 6.I, cột A)      Domain/Entities/Order.cs        → namespace Acme.Domain.Entities;
kiểu 2  (ddd 6.I, cột B)      Domain/Orders/Order.cs          → namespace Acme.Domain.Orders;
kiểu 3  (solution-structure)  Domain/Features/Sales/Order.cs  → namespace Acme.Domain.Features.Sales;
```

| Luật viết kiểu | ArchUnitNET | Kết quả |
|---|---|---|
| **Ép namespace** — *"Entity phải ở `*.Domain.Entities`"* | `Types().That().ResideInNamespace("Acme.Domain.Entities")` | kiểu 2 và 3 **đỏ** — dù cùng assembly, dù kiến trúc **hoàn toàn đúng**. Máy ép chọn một kiểu folder |
| **Ép assembly** — *"Entity phải ở assembly `*.Domain`"* ✅ | `Types().That().ResideInAssembly("Acme.Domain")` | cả 3 kiểu **xanh**; chỉ đỏ khi Entity bị đặt nhầm sang `Acme.Infrastructure` — **đúng thứ cần bắt** |

Nói ngắn: ép assembly bắt *"đặt sai layer"* (lỗi kiến trúc thật); ép namespace bắt thêm *"đặt sai folder"* (chỉ là sở thích tổ chức). R1–R7 vì thế đều nói theo assembly.

## §7. Việc triển khai

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| 1 | Dựng `backend/skills/minipower-backend-architecture-dotnet/` — `SKILL.md` (frontmatter `name`/`description` theo C1) + `README.md` | `backend-pack.test.js` xanh | Q1, Q2 |
| 2 | Viết `workflows/add-feature.md` (lát cắt dọc) + `workflows/add-handler.md` (kế thừa `application/workflows/add.md`) | Cả hai có checklist + anti-pattern | Bước 1 |
| 3 | Chuyển `application/templates/command-handler.cs` → skill mới; thêm `templates/ArchitectureTests/` | Test biên dịch được trên solution scaffold | Q3 |
| 4 | Thêm `tests/{Product}.ArchitectureTests` vào `scaffold/templates/solution-tree.txt` + `workflows/scaffold.md` + `templates/SKILLS.md` | `dotnet test` xanh trên solution mới scaffold | Q4, Bước 3 |
| 5 | QĐ-8: `"Cors": {}` vào `scaffold/templates/layers/appsettings.json` · 2 anti-pattern + note transitive vào `review-dotnet/SKILL.md` · comment thứ tự pipeline vào `HostLayerExtension.cs` | Grep thấy đủ 3 chỗ | Q5 |
| 5a | QĐ-12: sửa `templates/layer-csproj/Application.csproj.xml` — **bỏ `<FrameworkReference Include="Microsoft.AspNetCore.App" />`** (§5a điều 5); **bổ sung `Domain.csproj.xml`** đang thiếu (Q9) | `dotnet build` xanh trên solution scaffold mới | Q1 |
| 5c | QĐ-13: gộp `staging/dotnet-structure.md` vào `scaffold` — kiểm trùng với `reference/solution-structure.md` trước, chỉ bổ sung phần thiếu; xoá khỏi `staging/` | Kho `staging/` còn **10** file gốc | Q1 |
| 5b | QĐ-10: rút `staging/dotnet-clean-architecture.md` → `reference/clean-architecture.md` + `staging/dotnet-ddd.md` → `reference/ddd-tactical.md`; sửa 3 chỗ (a)(b)(c) nêu ở QĐ-10; xoá 2 file khỏi `staging/` | Rút kèm **sửa 5 điều §5a** cho khớp Jarvis; `link:check` không thêm gãy mới | Q6, Bước 1 |
| 6 | Xoá 2 thư mục skill; sửa **9 file** đang ref: `backend/README.md` (bảng 15→14) · `backend/PACK.md` (comment "15 lá") · `scaffold/{SKILL.md,README.md,workflows/add.md,workflows/scaffold.md,templates/SKILLS.md,templates/docs-Architecture.md}` · `review-dotnet/SKILL.md` | `grep -r "foundation-dotnet\|application-dotnet"` = 0 hit ngoài ADR | Bước 1–5c |
| 7 | QĐ-9: gỡ href 2 tên trong [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md), giữ nguyên câu chữ | `diff` chỉ đổi cú pháp link | Bước 6 |
| 8 | Cập nhật [ADRs/README.md](../README.md): trạng thái ADR-029 | Index khớp thực tế | Bước 7 |

## §8. Xác minh (định nghĩa xong)

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Scaffold solution mới từ `workflows/scaffold.md`, chạy `dotnet test -c Debug` | Architecture test chạy và **xanh** — **chủ repo tự chạy** (repo này không có .NET SDK) | 🔴 |
| T2 | Smoke | Cố tình thêm `ProjectReference` từ `{Product}.Domain` → `{Product}.Infrastructure` + dùng một kiểu của nó, chạy `dotnet test -c Debug` | **Đỏ** ở R1, message nêu đúng luật bị vi phạm — bằng chứng cho QĐ-5 | 🔴 |
| T3 | Smoke | Trong Cursor thật: prompt *"thêm API tạo đơn hàng cho backend"* (không gõ tên skill) | `minipower-backend-architecture-dotnet` tự kích hoạt — **chủ repo tự chạy** | 🔴 |
| T4 | Regression | `npm test` + `npm run gen:check` | 🟢 **441/441 xanh**, `gen:check` đồng bộ; `backend-pack.test.js` ngưỡng `>= 14` không nới, bảng `backend/README.md` khớp 14 thư mục thật |
| T5 | Regression | `npm run link:check` | 🟢 **241 file · 1814 link · 27 gãy (27 nợ baseline) · 0 MỚI** |
| T6 | Regression | `grep -rn "foundation-dotnet\|application-dotnet" --include="*.md"` | 🟢 **0 hit ngoài `ADRs/`** |
| T9 | Smoke | `Application.csproj.xml` sau bước 5a: không `<ItemGroup>` nào chứa `FrameworkReference` | 🟢 **Xanh** — chuỗi chỉ còn trong **comment cảnh báo** *"KHÔNG thêm … luật R4 sẽ đỏ"*; `ItemGroup` hoạt động chỉ có 2 `PackageReference` |
| T8 | Regression | `grep -rn "architechture-dotnet" backend/` sau bước 5b | 🟢 **0 hit** — ref chết đã vá khi rút, không khiêng sang skill mới |
| T7 | Regression | `diff` [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) trước/sau bước 7 | 🟢 **File không đổi một byte** — QĐ-9 hoá ra **no-op**: hai tên đã xoá chỉ xuất hiện dưới dạng **code span** và trong khối ```` ``` ```` ở §3, chưa từng là href. `link:check` xác nhận 0 gãy mới. Ghi lại để không ai đi tìm diff không tồn tại |

Icon: 🟢 xong · 🟡 có sẵn, cần giữ xanh · 🔴 chưa có. **Không 🟢 Done khi còn T đỏ.**

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| **Tốt** | **Chốt được nguồn chân lý kiến trúc là repo Jarvis** (QĐ-12) — 3 điều cấm sai trong `staging/` bị loại trước khi kịp thành luật máy, và phát hiện **scaffold đang sai** ở `Application.csproj` · Một nguồn cho wiring Host (hết P1 và hết chỗ lệch `Cors`) · trục dọc lần đầu có người giữ (P3) · *"luôn tuân thủ kiến trúc"* thành **cổng cứng thật** thay vì chữ (P4) · `description` khớp bề mặt kích hoạt tần suất cao — thêm tính năng, không phải khởi tạo (P2) · số lá **giảm** 15→14 |
| **Xấu / chi phí** | ADR-029 thành **ADR-đợt rộng** (Q17 gộp thêm `dotnet-structure.md`), trái tinh thần *"rút từng file một"* của [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) QĐ-4 — đánh đổi có ý thức · **AutoMapper giữ dù có ràng buộc license thương mại** (bản 16.2.0, 2026-07-02) — nợ đã ghi, không phải nợ vô chủ · Xoá 2 skill là **breaking** với prompt/bookmark đang trỏ tên cũ — nội bộ, chưa publish rộng, đổi sớm rẻ (khuôn [ADR-024](../done/ADR-024-2026-08-25-backend-hub-publish-nguon-minipower.md) QĐ-3) · thêm 1 test project vào mọi solution scaffold (~1 package, thời gian build tăng không đáng kể) · architecture test là tài sản phải bảo trì khi kiến trúc Jarvis đổi |
| **Trung lập** | Kho `staging/` 13 → 11 file gốc — thi hành [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a hàng #3/#4, không mở lại quyết định nào của nó · Microservice vẫn **chưa có skill** (QĐ-11) — cố ý, dấu hiệu mở đã ghi sẵn nên không phải nợ vô chủ · Framework Jarvis không đổi (C6) · `rules.json`/router không đụng (C2) · architecture test chỉ canh **hướng phụ thuộc**, không canh chất lượng thiết kế bên trong layer — phần đó vẫn là việc của `review-dotnet` |

---

## Điều chỉnh 2026-08-29 — hai luật cắt ngang phải đi theo mọi skill lá

**Yêu cầu chủ repo:** *"Agent code C# phải tuân thủ `convention-dotnet`; Agent dùng Jarvis phải tuân thủ `architecture-dotnet`."*

**Soát 14 skill lá ngày 2026-08-29** — con trỏ thiếu hơn tưởng:

| Luật | Có | Thiếu |
|---|---|---|
| `convention-dotnet` | 8/14 | blobstoring · healthcheck · notification · observability · swashbuckle · telemetry |
| `architecture-dotnet` | 3/14 | 11 skill còn lại |

**Nói thẳng giới hạn:** minipower **không** ép được agent tuân thủ — không có cơ chế nào bắt một model đọc file. Hai thứ nó ép được, và cả hai đều đã dựng:

| Tầng | Cơ chế | Trạng thái |
|---|---|---|
| **Repo (minipower)** | Mọi skill lá **mang theo** cả hai con trỏ ⇒ skill nào kích hoạt thì luật cũng đi cùng | **mới** — 2 test canh trong `backend-pack.test.js` |
| **Dự án đích** | `.editorconfig` + analyzer + `dotnet format` (convention) · `{Product}.ArchitectureTests` R1–R7 (architecture) | đã có (QĐ-5, QĐ-6) |

Đây đúng "cứng bằng máy, mềm bằng lời" ([ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-3): *"agent phải tuân thủ"* không FAIL được bằng máy ⇒ không viết thành lời suông; thứ FAIL được là **invariant repo** (skill nào cũng chở đủ hai luật) và **cổng ở dự án đích**.

### Đã làm

| # | Việc | Kết quả |
|---|---|---|
| 1 | Chuẩn hoá 2 dòng trong `## Output bắt buộc` của 13 skill có mục đó | 14/14 skill lá nay trỏ **cả hai** |
| 2 | `convention-dotnet` nhận bảng ranh giới hai câu hỏi (QĐ-7) + trỏ sang `architecture` | không tự trỏ về mình |
| 3 | `review-dotnet` (không có mục Output) nhận mục **"Hai nguồn luật khi PR chạm C# / Jarvis"**, nêu rõ phần nào **máy đã gác** để review khỏi nitpick tay | soát phần mềm, không lặp việc của analyzer/arch test |
| 4 | `observability-dotnet` dùng câu riêng thay 2 bullet — output của nó là dashboard/alert, không phải solution .NET | thêm luật đặt chỗ: *metric/enricher là adapter, thuộc `Host`/`Infrastructure`, không nhét vào `Domain`* |
| 5 | **2 test mới** trong `sdlc/hooks/test/backend-pack.test.js` | **443/443** (441 → 443) |

**Không** đụng 32 SKILL.md con trong `providers/` · `patterns/`: chúng là đoạn snippet luôn đi qua skill cha, thêm boilerplate vào 32 file là nhiễu và là 32 chỗ phải giữ đồng bộ.

### Xác minh

| # | Loại | Case | Kết quả |
|---|---|---|---|
| T10 | Mới | 2 test invariant con trỏ cắt ngang | 🟢 **443/443** |
| T11 | Smoke | Gỡ link `architecture-dotnet` khỏi `caching-dotnet/SKILL.md` → chạy `npm test` | 🟢 **ĐỎ đúng chỗ**, message: *"caching-dotnet/SKILL.md không trỏ tới architecture-dotnet — agent kích hoạt skill này sẽ không thấy luật…"*; khôi phục → xanh lại. Cổng sống, không phải test trang trí |
| T12 | Regression | `gen:check` + `link:check` | 🟢 đồng bộ · 0 gãy mới |
