# Phương pháp đọc code — stack-neutral

Cách đọc một codebase để **viết lại tài liệu**, dùng chung cho mọi stack. "Ngữ pháp" từng stack (file nhận diện, entry point, DI, persistence, state…) nằm ở `../patterns/{dotnet,java,react,flutter}/SKILL.md` — mở đúng một pattern theo repo đang đọc. Cổng người, vùng chạm, đích DOC: [SKILL.md](../SKILL.md). Rút từ bốn file reading trong `staging/` (ADR-042).

Không load mặc định — mở khi bắt đầu một lượt đọc, hoặc khi phân vân flow đã hiểu đủ chưa.

---

## 1. Mục tiêu

Không đọc code theo file. Đọc **behavior theo flow**, dựng mô hình hiểu theo chuỗi:

```text
Context → Architecture → Module → Execution Flow → Implementation → Runtime / Data / Side Effects → Knowledge Model
```

Giao diện (`build()`, JSX, Razor) là hình chiếu của state lên màn hình; hành vi nghiệp vụ nằm ở entry point, handler, service, store và data source — không nằm ở thứ tự thẻ trên cây.

## 2. Nguyên tắc chung

### 2.1 Xác định scope trước khi mở source

Trả lời trước: hệ thống làm gì · flow nào đang hỏi · tính năng nằm đâu · module phụ thuộc gì · data đi qua đâu · gọi hệ ngoài nào · transaction boundary ở đâu · lỗi và retry xử lý thế nào. Câu hỏi chỉ về một flow thì không cố hiểu cả repo.

### 2.2 Bốn nhãn bằng chứng

Mọi phát hiện mang **một** nhãn. Không chuyển Inferred hay Unknown thành fact.

| Nhãn | Nghĩa | Cách ghi |
|------|-------|----------|
| **Observed** | Đọc thẳng từ source hoặc cấu hình | Kèm `path:line`. Thiếu `path:line` thì chưa phải Observed |
| **Documented** | README, ADR, comment, OpenAPI, storybook, manifest deploy, tài liệu cũ trong `assets/archive/` | Kèm nguồn tài liệu. Tài liệu không thắng code |
| **Inferred** | Suy ra từ nhiều bằng chứng ghép lại | Gắn `[Suy luận]` và nêu các bằng chứng gốc |
| **Unknown** | Chưa đủ bằng chứng | Gắn `[Chưa xác minh]`; vào `memory/open-questions.md` khi cần người trả lời |

**Quy tắc dẫn xuất — Mâu thuẫn ⛔:** cùng một điểm có dòng Documented và dòng Observed nói khác nhau → gom thành **một mục riêng**, nêu cả hai bên và nguồn, **không** tự chọn bên đúng. Việc chọn là của người. Ở chế độ `maintain` đây thường là phát hiện giá trị nhất.

Ba bẫy quen: ẩn một nút trên UI không chứng minh server từ chối thao tác đó · một effect hay lifecycle gọi API không chứng minh đó là đường data chính nếu route hay store đã load trước · tên method (`validateInvoice`) không chứng minh business rule — phải đọc thân, caller, test và cấu hình.

## 3. Mô hình sáu tầng

```text
L0 Context → L1 Architecture → L2 Module → L3 Execution Flow → L4 Implementation → L5 Runtime / Data / Side Effects
```

### L0 — Context

Trả lời: hệ thống làm gì · ai dùng · input / output · business capability nào · hệ ngoài nào · nền tảng chạy ở đâu. Kết quả là một **System Context**: users / clients · capabilities · API · database · broker · external service · auth provider · observability · hạ tầng / phân phối.

### L1 — Architecture

Khảo sát repo trước khi đọc implementation: file build / manifest, cây thư mục, entry point, lớp bọc ứng dụng (composition root, provider gốc, router), middleware / filter, security, config, observability. Nhận diện kiểu ứng dụng (monolith, service, SPA, SSR, mobile, monorepo). Kết quả là **Architecture Map** dạng chuỗi `Client → Entry → Application → Domain → Persistence → Store` và các nhánh messaging / background. File nhận diện theo stack: xem pattern.

### L2 — Module

Với mỗi module / package / feature: Responsibility · Public exports · Dependencies · Entry points · Outputs · External dependencies. Hỏi thêm: *module này không nên chịu trách nhiệm về việc gì?* — câu trả lời lộ coupling và boundary đã vỡ (một màn hình vừa fetch, vừa chứa rule, vừa điều hướng, vừa ghi analytics).

Không mặc định mọi repo cắt folder cùng một kiểu. Đọc workspace / manifest và import thực tế.

### L3 — Execution Flow (tầng quan trọng nhất)

Không đọc một class / component lớn từ trên xuống. Chọn **một flow** và trace:

```text
Trigger → Entry → Transformation → Decision → Business logic → Persistence / Integration → Side effects → Output / UI cập nhật
```

Phân biệt **hai thì** ở ứng dụng có UI: *thì đọc* (vào màn: route → loader / query / initState → render) và *thì ghi* (người dùng thao tác: event → handler → mutation → cache / navigation → render lại). Đọc lẫn hai thì sẽ gán nhầm effect hay lifecycle thành xương sống nghiệp vụ.

### L4 — Implementation

Chỉ sau khi hiểu flow. Đọc theo **semantic block** (validate → load → tính → tạo → lưu → publish), không theo dòng. Với mỗi block: làm gì · vì sao cần · tiêu thụ data gì · sinh data gì · có side effect không · fail được không · người dùng thấy gì khi đang chờ. "Vì sao" không rút được từ source → `Unknown`, không tự tạo lời giải thích nghiệp vụ.

Ở UI, tách ba phần của một màn: *data vào* (props, params, hook, state) · *quyết định* (guard, map, filter) · *hình chiếu* (markup). Rule nằm ở hai phần đầu.

### L5 — Runtime / Data / Side Effects

Map source lên runtime thật: tiến trình, DB, cache, broker, object storage, external API, CDN / store phân phối. Tìm config ở **mọi** nơi nó có thể sống (file config theo môi trường, env, secret manager, Docker / K8s / Helm, flavor, define lúc build, remote config). Phân biệt config **dính vào artifact lúc build** và config **đọc lúc chạy**. Không ghi giá trị secret vào tài liệu — chỉ tên biến.

## 4. Trace theo năm câu hỏi

| # | Câu hỏi | Tìm gì | Ghi gì |
|---|---------|--------|--------|
| 4.1 | **Entry** — flow bắt đầu ở đâu? | Endpoint, consumer, scheduler, route, event handler, deep link, push, lifecycle | Ai gọi · input · DTO / message / params |
| 4.2 | **Transformation** — input biến đổi thế nào? | Mapper, converter, factory, serializer, schema parse, view model | Chuỗi hình dạng data qua từng biên; không dừng ở mapper, trace tới handler / domain |
| 4.3 | **Decision** — rẽ nhánh ở đâu? | `if / switch`, validator, specification, policy, guard, feature flag, state machine, `enabled` / `disabled` | Condition → nhánh → ý nghĩa nghiệp vụ → **chỉ UI hay server cũng kiểm?** |
| 4.4 | **Side effect** — cái gì đổi thế giới bên ngoài? | DB write, transaction, cache, publish / consume, HTTP / gRPC, file / object storage, email, notification, navigation, storage trình duyệt / máy, analytics | Danh sách side effect của flow dạng cây |
| 4.5 | **Error / Recovery** — không chỉ happy path | try/catch, handler toàn cục, retry, timeout, circuit breaker, rollback, DLQ, compensation, idempotency, fallback, error boundary, trạng thái loading / empty / error | Failure flow điển hình: *DB xong nhưng publish fail* · *timeout → retry → retry fail* · *mutation thành công nhưng cache cũ* |

Chỉ kết luận behavior từ source và cấu hình thực tế (retry policy, `staleTime`, transformer, boundary bọc ở đâu).

## 5. Composition và phụ thuộc

Interface không phải implementation. Luôn trace `Interface → implementation cụ thể → chỗ đăng ký / nối` (DI container, provider, context, import, service locator). Chú ý nhiều implementation cùng interface, đăng ký theo môi trường / flavor / profile, decorator, factory.

Behavior có thể nằm ngoài method body: aspect, interceptor, middleware, pipeline behavior, attribute `@Transactional`-kiểu, hook / provider được gọi từ nhiều nơi. Khi method làm nhiều hơn thân nó cho thấy, tìm lớp bọc.

Không coi component / screen cha là owner của behavior nếu logic nằm trong hook, bloc, store hay repository import từ module khác.

## 6. Dữ liệu, state và đồng bộ

- **Persistence:** trace `Entity → mapping / configuration → bảng / cột → query thật → transaction`. Không suy luận DB behavior chỉ từ class entity nếu mapping nằm ở cấu hình. Kiểm lazy / eager, cascade, N+1, lock, isolation, propagation — chỉ ghi khi source cho thấy thực sự dùng.
- **Transaction:** không mặc định nhiều thao tác DB trong cùng method thuộc cùng transaction. Tìm boundary thật (scope, UoW, behavior, middleware).
- **Messaging:** trace `Producer → topic / exchange / queue → consumer → handler`; kiểm key, partition, consumer group, ack, retry, DLQ, concurrency, idempotency.
- **State ở UI:** phân loại trước khi đọc — URL · local · lifted · context / inherited · client store · server cache · form · ref · browser / device storage. Với mỗi mẩu dữ liệu: nguồn sự thật · ai ghi · ai render · sống qua reload / kill app không.
- **Sau mutation:** câu hỏi trung tâm là *cái gì làm UI đang mở đổi theo dữ liệu mới?* (invalidate, set cache, dispatch, pop result, stream DB, optimistic + rollback). Chỉ subscriber của cache / store đó mới cập nhật; gọi API thành công không làm mọi màn đúng.
- **Async không phải song song.** `async/await` là lịch của một tác vụ. Song song thật cần `WhenAll` / `Future.wait` / isolate / executor. Kiểm cancellation, race khi id đổi trước khi request cũ về, double submit.

## 7. Security, lỗi, observability

- **Auth:** trace `request → authentication → identity / claims → authorization → business → data access`. Trả lời: ai gọi được · identity lập thế nào · quyền kiểm ở endpoint hay business layer · tenant có tách không. Ở client: ghi rõ từng kiểm tra là **presentation** (ẩn nút) hay **điều kiện gọi API**; không kết luận an toàn vì nút bị ẩn.
- **Lỗi:** map `nguồn → lan truyền → nơi bắt → response / retry / rollback / người dùng thấy gì`. Phân biệt business · validation · technical · integration · infrastructure · auth · render chỉ khi source đủ bằng chứng. `catch` nuốt lỗi là behavior, ghi lại.
- **Observability:** logger, trace / span, metric, health, crash reporter, analytics. Không mô tả hành vi sản phẩm từ tên event analytics nếu handler không gọi tới event đó.

## 8. Tests là bằng chứng

Test cho biết input · expected output · rule · edge case · contract tích hợp · dependency cần bọc (harness / provider trong test là bằng chứng composition). Không mặc định test phủ production; snapshot dễ xanh khi behavior đã đổi nghĩa.

## 9. Ba artifact tổng hợp

| Artifact | Nội dung | Lưu ý |
|----------|----------|-------|
| **Call Graph** | Cây gọi theo flow từ entry, expand node khi deep dive | Ở UI tách nhánh *render* và *event* — không đọc như chuỗi đồng bộ |
| **Data Flow** | Chuỗi hình dạng data: request → DTO → command → domain → entity → store; và chiều ngược từ form | Ghi chỗ data bị copy sang state local — bản copy có thể lệch nguồn |
| **Dependency Map** | Phân loại: internal · thư viện · DB · cache · broker · external API · storage · config · hạ tầng | Sau đó trace implementation thật của từng dependency |

Mỗi flow một **Flow Map** theo [TPL-flow-map](../templates/TPL-flow-map.tpl) — là **nháp**, không phải DOC.

## 10. Ba pass và ranh giới với "một vùng chạm"

| Pass | Effort | Làm gì | Đầu ra | Ranh giới |
|------|--------|--------|--------|-----------|
| **1 — Reconnaissance** | 10–20% | README · manifest / build · entry · composition root · router / endpoint · consumer · repository · config · test · deploy | Architecture Map · Module Map · Entry Map | **Được quét rộng cả repo**, nhưng chỉ ở mức bản đồ: không đọc implementation, **không sinh DOC**, không kết luận nghiệp vụ |
| **2 — Trace** | 50–60% | Chọn 3–5 flow trong **vùng chạm đã chốt với người**; trace năm câu hỏi | Flow Map · Call Graph · Data Flow · Dependency Map | Bám vùng chạm; flow ngoài vùng → ghi `doc-debt`, không mở |
| **3 — Deep Dive** | 20–40% | Chỉ vùng rủi ro của flow: business rule, transaction, concurrency, security, integration, error, cache sync | Mục đã xác nhận → DOC | Không mở rộng vùng; phát hiện ngoài → câu hỏi cho người |

Pass 1 không mâu thuẫn với luật *một vùng chạm* của as-built: bản đồ là điều kiện để chọn vùng chạm đúng; tài liệu chỉ sinh từ pass 2–3 và chỉ sau khi người xác nhận.

## 11. Anti-pattern

- Đọc tuần tự toàn repo theo file.
- Bắt đầu từ chi tiết (DTO, helper, design-system primitive, theme, file sinh tự động) khi chưa biết flow nào dùng.
- Suy luận business rule từ tên method / component / widget.
- Chỉ đọc happy path.
- Coi interface là implementation; coi component cha là owner behavior.
- Coi effect / lifecycle / `build()` là xương sống data flow; coi mỗi lần render là một giao dịch nghiệp vụ.
- Coi `async` là song song.
- Coi ẩn nút là phân quyền.
- Sinh tài liệu hàng loạt từ pass 1.

## 12. Definition of Done — một flow

Một flow coi là hiểu tương đối đủ khi trả lời được, mỗi câu có nhãn bằng chứng:

```text
□ Bắt đầu ở đâu (entry / route / screen)?        □ Ai trigger?
□ Input là gì?                                      □ Các bước chính?
□ Business rule nằm đâu?                            □ Decision point là gì?
□ Data đọc ở đâu?                                   □ Data ghi ở đâu?
□ Transaction boundary?                             □ Cache / store / URL nào đổi sau mutation?
□ Message publish / consume?                        □ External service / plugin nào được gọi?
□ Auth ở đâu — UI hay server?                       □ Lỗi xử lý thế nào? Người dùng thấy gì?
□ Retry / timeout / fallback / rollback?            □ Concurrency, race, idempotency?
□ Output là gì?                                     □ Source evidence (path:line) ở đâu?
□ Những điểm nào vẫn Unknown?                       □ Có mục Mâu thuẫn ⛔ nào chưa người chọn?
```

Chưa trả lời được → ghi `Unknown`, tiếp tục trace trong vùng chạm; không điền bằng giả định.
