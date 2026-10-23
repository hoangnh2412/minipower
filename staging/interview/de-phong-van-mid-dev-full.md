# Đề phỏng vấn Mid Dev — 4 trục tư duy

Oct 19, 2026 · @LLA Team

Bộ 20 đề phỏng vấn cho vị trí mid dev, chia 4 trục: tư duy hệ thống, tư duy giải quyết vấn đề, tư duy thiết kế hệ thống, kinh nghiệm vận hành thực chiến. Mỗi đề gồm đề bài, yêu cầu cụ thể và bảng tiêu chí chấm 3 mức.

## Hướng dẫn sử dụng

- Mỗi đề gồm 3 phần: **Đề bài** (ngữ cảnh cụ thể), **Yêu cầu cụ thể** (ứng viên phải trả lời/làm gì), **Bảng tiêu chí** (3 mức: Chưa đạt / Đạt / Tốt).
- Thời lượng gợi ý: 5–10 phút/đề. Không cần làm hết 20 đề — chọn 2–3 đề mỗi trục tuỳ thời gian buổi phỏng vấn.
- Nên hỏi xen giữa 4 trục (không dồn hết 1 trục liên tiếp) để giữ nhịp và tránh ứng viên đoán được hướng câu hỏi tiếp theo.
- Mục tiêu không phải tìm câu trả lời "đúng chuẩn" — mà nghe **cách ứng viên lập luận, đặt câu hỏi làm rõ, và thừa nhận giới hạn hiểu biết của mình**.

## A. Tư duy hệ thống

### A1. Nguyên nhân vs triệu chứng

**Đề bài:** Web (React) và mobile app (React Native) đều gọi chung một Backend API. Giỏ hàng lưu trong Redis theo session token, chỉ ghi xuống DB chính khi checkout thành công. Service Auth xử lý đổi mật khẩu bằng cách revoke toàn bộ session cũ và phát event `session_revoked` qua message queue cho các service khác tự xử lý. Trong bối cảnh đó, bộ phận support nhận được 2 báo cáo lỗi riêng biệt từ 2 khách hàng khác nhau, cả hai đều mô tả cùng một hiện tượng: "giỏ hàng bị trống". User X gặp ngay sau khi thanh toán xong trên web; User Y gặp khi mở lại app trên mobile sau khi đổi mật khẩu. Hai user, hai thiết bị, hai thời điểm khác nhau — nhưng cùng một triệu chứng được báo cáo.

&#91;embedded content: giỏ hàng theo session · 2 đường ảnh hưởng\]

**Yêu cầu cụ thể:**

- Giải thích vì sao 2 user X và Y đang gặp 2 vấn đề khác nhau?
- Nguyên nhân xảy ra lỗi là gì? Vì sao?
- Đề xuất giải pháp xử lý vấn đề này: sửa tận gốc nguyên nhân (không chỉ vá triệu chứng), và nêu hướng giảm rủi ro tái diễn cho các trường hợp tương tự sau này.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Phân biệt triệu chứng/nguyên nhân | Cho rằng 2 case chắc chắn cùng 1 bug | Nhận ra có thể khác nguyên nhân nhưng chưa giải thích cơ chế | Giải thích rõ ≥2 cơ chế khác nhau có thể dẫn tới cùng triệu chứng |
| Đặt câu hỏi làm rõ | Không hỏi gì, suy đoán ngay | Hỏi 1-2 câu cơ bản | Hỏi đủ để khoanh vùng (thời điểm, thiết bị, version, log) |
| Phương pháp thu thập dữ liệu | Không đề xuất gì cụ thể | Đề xuất chung ("xem log") | Đề xuất cụ thể, có thứ tự ưu tiên rõ |
| Đề xuất giải pháp | Không đề xuất được, hoặc chỉ vá triệu chứng | Đề xuất được nhưng chưa rõ cách triển khai | Đề xuất rõ giải pháp tận gốc + giảm rủi ro tái diễn |

**Lời giải mẫu theo từng tiêu chí**

**Phân biệt triệu chứng/nguyên nhân**

- Đạt: Hai case này có thể không cùng nguyên nhân, dù cùng mô tả "giỏ hàng trống" — cần kiểm tra thêm trước khi kết luận.
- Tốt: Đây là 2 cơ chế khác nhau. User X gặp vì hệ thống chủ động clear giỏ sau khi checkout thành công (đúng thiết kế, chỉ thiếu thông báo rõ cho user). User Y gặp vì đổi mật khẩu khiến Auth service revoke session cũ, trong khi giỏ hàng đang gắn theo session token thay vì theo account nên "biến mất" khi có session mới.

**Đặt câu hỏi làm rõ**

- Đạt: Giỏ hàng trống hoàn toàn hay chỉ thiếu vài món? User có thao tác gì trước đó không?
- Tốt: Thời điểm chính xác xảy ra so với lúc checkout/đổi mật khẩu là bao lâu? Thiết bị/app version? User có đăng nhập lại không? Session\_id trước và sau khi xảy ra có khác nhau không?

**Phương pháp thu thập dữ liệu**

- Đạt: Xem log server quanh thời điểm xảy ra lỗi.
- Tốt: Log event `session_revoked`, log thời điểm checkout, đối chiếu session\_id trước/sau khi đổi mật khẩu để xác nhận giả thuyết; kiểm tra dữ liệu Redis xem giỏ hàng bị xóa theo session hay theo account.

**Đề xuất giải pháp**

- Đạt: Thêm thông báo rõ cho User X sau checkout; với User Y thì merge giỏ hàng cũ sang session mới khi đổi mật khẩu.
- Tốt: Tách rõ 2 hướng xử lý: (1) User X — chỉ cần thêm UX thông báo giỏ đã được xử lý, không phải bug; (2) User Y — sửa tận gốc bằng cách gắn giỏ hàng theo `account_id` thay vì session token, hoặc thêm cơ chế merge giỏ hàng khi tạo session mới sau revoke; thêm handler lắng nghe `session_revoked` để chủ động di chuyển dữ liệu thay vì để mất.

### A2. Coupling ẩn qua cache

**Đề bài:** Khi tạo đơn hàng, hệ thống đã snapshot giá vào `order_item.price` tại thời điểm đặt hàng. ProductService vừa thêm Redis cache (TTL 10 phút) trước khi trả API đọc giá sản phẩm cho trang khách xem. Team Pricing có 1 dashboard nội bộ "Price Audit" để kiểm tra giá niêm yết hiện tại, đọc trực tiếp bảng `products.price` trong DB chính, không qua cache, để luôn thấy giá mới nhất. Khi admin cập nhật giá, code ghi thẳng vào DB rồi mới gọi API invalidate cache ở bước sau — hai bước này không nằm trong cùng 1 transaction. 2 tuần sau khi thêm cache, có bug report: trong vài phút sau mỗi lần admin đổi giá, dashboard Price Audit (đọc thẳng DB) và trang sản phẩm (qua cache) hiển thị 2 giá khác nhau cho cùng 1 sản phẩm — khiến team sales báo giá sai cho khách ngay lúc tư vấn.

&#91;embedded content: update giá · 2 đường đọc, 2 độ trễ\]

**Yêu cầu cụ thể:**

- Giải thích cơ chế cụ thể khiến 2 nơi (dashboard Price Audit và trang sản phẩm) hiển thị giá khác nhau trong vài phút sau khi đổi giá.
- Chỉ ra đây là biểu hiện của "coupling ẩn" (hidden coupling) — 2 module không gọi nhau trực tiếp nhưng vẫn ảnh hưởng nhau.
- Đề xuất cách phát hiện sớm loại coupling này trước khi lên production (review, test, monitoring).
- Đề xuất cách giảm coupling (TTL ngắn, invalidate chủ động, versioning dữ liệu...).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Xác định đúng cơ chế gốc | Không liên hệ được cache với bug báo cáo | Liên hệ được nhưng mô tả mơ hồ ("do cache stale") | Mô tả chính xác: cache trả data cũ, module khác đọc trực tiếp DB nên lệch nhau |
| Nhận diện coupling ẩn | Coi đây là 2 bug không liên quan | Nhận ra có liên quan nhưng không gọi tên được bản chất | Gọi đúng tên hiện tượng (coupling ẩn/qua dữ liệu chia sẻ) và vì sao khó phát hiện |
| Đề xuất phòng ngừa | Không đề xuất, hoặc chỉ đề xuất fix bug cụ thể | Đề xuất 1 biện pháp chung | Đề xuất cụ thể cho cả phát hiện sớm và giảm coupling |

**Lời giải gợi ý:**

- Cơ chế: admin update giá → ghi DB → gọi invalidate cache ở bước riêng (không transaction) → trong khoảng trễ đó (tới gần 10 phút TTL, hoặc lâu hơn nếu invalidate lỗi), cache vẫn trả giá cũ cho trang sản phẩm.
- Dashboard Price Audit đọc thẳng DB nên thấy giá mới ngay, trong khi trang sản phẩm (qua cache) vẫn thấy giá cũ trong khoảng trễ đó. Hai nơi lệch nhau không phải do sai dữ liệu, mà do hai đường đọc có độ trễ khác nhau trên cùng 1 nguồn.
- Đây là coupling ẩn: 2 module không gọi nhau nhưng cùng phụ thuộc 1 nguồn dữ liệu, đọc nó qua 2 tầng có độ trễ khác nhau (cache vs trực tiếp DB) mà không ai đồng bộ khoảng trễ đó.
- Phát hiện sớm: test tích hợp mô phỏng update giá rồi đọc cả 2 đường ngay sau đó; giám sát khoảng lệch giởa cached price và DB price theo thời gian.
- Giảm coupling: gộp update DB + invalidate cache trong cùng 1 transaction/outbox pattern, hoặc giảm TTL xuống rất ngắn, hoặc dùng cơ chế invalidate theo event ngay khi giá đổi (pub/sub) thay vì chỉ dựa vào TTL.

### A3. Điểm gãy khi tăng tải x10

**Đề bài:** Backend là 1 monolith ASP.NET Core (C#), kết nối 1 PostgreSQL instance, deploy trên 3 instance đứng sau load balancer. Connection pool giới hạn 100 connection/instance, chưa có cache layer, mọi request đọc đều query trực tiếp DB. Hệ thống hiện phục vụ ổn định \~500 request/phút. Ban lãnh đạo thông báo sau 1 tháng nữa traffic sẽ tăng lên \~5.000 request/phút do một chiến dịch marketing lớn. Không có thời gian để re-architect toàn bộ.

&#91;embedded content: traffic x10 · connection pool là nút nghẽn\]

**Yêu cầu cụ thể:**

- Chỉ ra phần nào của một hệ thống điển hình (DB, connection pool, cache, queue, service bên thứ 3...) thường là điểm gãy đầu tiên khi tải tăng x10, và vì sao.
- Đề xuất cách xác định điểm gãy thật của hệ thống cụ thể (đo đạc, load test) thay vì đoán.
- Đề xuất ít nhất 1 biện pháp giảm rủi ro có thể làm trong 1 tháng (không re-architect).
- Nêu rõ điều gì sẽ làm nếu không kịp xử lý hết trước ngày chiến dịch chạy.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Xác định điểm gãy có cơ sở | Đoán ngẫu nhiên, không giải thích | Chỉ ra 1 điểm hợp lý (DB/connection pool) có giải thích | Chỉ ra nhiều điểm khả nghi, ưu tiên theo mức độ rủi ro |
| Kiểm chứng thay vì đoán | Không đề cập đo đạc/load test | Có nhắc tới load test nhưng chung | Đề xuất cách đo cụ thể, chỉ số cần theo dõi |
| Giải pháp khả thi trong thời gian ngắn | Đề xuất giải pháp cần re-architect toàn bộ | Đề xuất được 1 biện pháp ngắn hạn hợp lý | Đề xuất biện pháp ngắn hạn + kế hoạch dự phòng (circuit breaker, giới hạn tải, rollback) |

**Lời giải gợi ý:**

- Điểm gãy đầu tiên: connection pool DB (100 x 3 instance = 300) sẽ bão hoà trước vì toàn bộ request đọc đi trực tiếp DB, không qua cache.
- Xác minh thật: load test với traffic pattern giống thực tế, theo dõi connection pool usage, query latency, CPU/memory từng instance — không đoán.
- Biện pháp ngắn hạn khả thi trong 1 tháng: thêm Redis cache cho các read phổ biến nhất, tăng connection pool có kiểm soát, thêm rate limit/circuit breaker.
- Dự phòng nếu chưa kịp: chuẩn bị giảm tải có kiểm soát (tắt tạm tính năng phụ qua feature flag, đưa action không cần real-time vào queue, báo cho user khi quá tải) thay vì để sập toàn bộ.

### A4. Technical debt có hệ quả

**Đề bài:** Không cần giả định hệ thống — dùng chính dự án bạn từng làm, mô tả ngắn gọn stack/kiến trúc lúc đó trước khi vào câu chuyện. Kể một tình huống thật (từ kinh nghiệm cá nhân) nơi một "quick fix" lúc triển khai tưởng vô hại, nhưng về sau gây hậu quả rõ ràng (bug lặp lại, chậm phát triển feature mới, hoặc incident).

**Yêu cầu cụ thể:**

- Mô tả rõ bối cảnh lúc đó: vì sao chọn quick fix thay vì giải pháp đầy đủ.
- Mô tả hậu quả cụ thể xảy ra sau đó (không chung chung "code khó maintain").
- Tự đánh giá: lúc fix, có dấu hiệu nào đáng lẽ giúp nhận ra rủi ro sớm hơn không.
- Nếu gặp lại tình huống tương tự, sẽ làm khác đi ở điểm nào.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Tính cụ thể của ví dụ | Kể chung, không có bối cảnh/số liệu thật | Có bối cảnh cụ thể nhưng hậu quả mơ tả chung | Bối cảnh + hậu quả cụ thể, có thể kiểm chứng được logic |
| Tự nhận thức (self-awareness) | Đổ lỗi hoàn toàn cho hoàn cảnh, không nhận phần quyết định của mình | Nhận một phần trách nhiệm trong quyết định | Phân tích rõ trade-off đã chấp nhận lúc đó và vì sao chấp nhận |
| Rút ra bài học áp dụng được | Không có bài học cụ thể | Bài học chung ("nên cẩn thận hơn") | Bài học cụ thể, có thể áp dụng lại cho tình huống khác |

**Lời giải gợi ý:** Đây là câu hỏi dựa trên kinh nghiệm thật của ứng viên, không có đáp án mẫu cố định — dùng bảng tiêu chí bên trên để đánh giá câu trả lời thực tế họ kể.

### A5. Circular dependency giữa 2 service

**Đề bài:** OrderService và UserService đều là ASP.NET Core Web API (C#), mỗi service có DB riêng (Order DB, User DB), deploy độc lập nhưng dùng chung 1 CI/CD pipeline chạy deploy theo thứ tự cố định, chưa có event bus. OrderService cần gọi UserService qua REST đồng bộ để lấy thông tin khách hàng khi tạo đơn; UserService lại cần gọi ngược lại OrderService để hiển thị lịch sử mua hàng trên trang profile. Hai service đang gọi lẫn nhau.

&#91;embedded content: Order và User gọi vòng qua REST đồng bộ\]

**Yêu cầu cụ thể:**

- Chỉ ra ít nhất 2 vấn đề có thể xảy ra.
- Đề xuất giải pháp giảm phụ thuộc giữa 2 service.
- Nêu rõ trade-off của phương án đề xuất.
- Giải thích vì sao vấn đề tương tự thường xuất hiện dần theo thời gian chứ không phải do thiết kế sai từ đầu.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Nhận diện hậu quả cụ thể | Chỉ nói chung "không tốt", không chỉ ra vấn đề cụ thể | Chỉ ra được 1 vấn đề cụ thể | Chỉ ra ≥2 vấn đề cụ thể (vd: deploy phải theo thứ tự, 1 service down kéo theo service kia lỗi) |
| Đề xuất giải pháp tách rời | Không đề xuất được phương án | Đề xuất 1 phương án chung | Đề xuất phương án cụ thể + giải thích cách triển khai |
| Nêu trade-off thành thật | Cho rằng giải pháp hoàn hảo, không đổi gì | Nhắc tới trade-off chung | Trade-off cụ thể, rõ ràng (vd: thêm độ trễ do event async, thêm phần đồng bộ dữ liệu) |

**Lời giải gợi ý:**

- Vấn đề cụ thể: (1) deploy phải đúng thứ tự — nếu Order deploy trước mà User đổi schema/API breaking thì Order lỗi ngay; (2) User service down khiến Order không tạo được đơn vì chờ response đồng bộ (cascading failure).
- Giải pháp: Order lưu snapshot thông tin khách hàng cơ bản ngay lúc tạo đơn (không cần gọi lại User để hiển thị); hoặc dùng event-driven — Order phát event `order_created`, User tự consume và lưu view riêng cho lịch sử mua hàng.
- Trade-off: dữ liệu có thể trễ (eventual consistency) hoặc dư thừa (duplicate một phần thông tin khách hàng ở Order) — đổi lại giảm phụ thuộc runtime giữa 2 service.
- Circular dependency hình thành dần vì mỗi service ban đầu chỉ có API đơn giản, nhu cầu hiển thị lịch sử xuất hiện sau nên ai đó thêm gọi ngược — không phải lỗi thiết kế ban đầu mà do thiếu rà soát định kỳ.

## B. Tư duy giải quyết vấn đề

### B1. Bug không tái hiện được

**Đề bài:** Form submit gọi API qua AJAX, validate ở cả client và server. Client có cơ chế tự động gửi lại request sau 5s nếu không nhận được response (timeout). Log hệ thống hiện chỉ ghi ở mức WARN/ERROR, không ghi log cho request xử lý thành công. Một user báo gặp lỗi "không thể submit form" 1 lần duy nhất, tuần trước. Bạn không tái hiện được lỗi từ đó đến nay, dù thử trên cùng browser, cùng tài khoản.

&#91;embedded content: log không đủ để bắt lỗi hiếm gặp\]

**Yêu cầu cụ thể:**

- Nêu thứ tự các bước điều tra, bắt đầu từ đâu.
- Nêu thông tin cần hỏi thêm user/support trước khi kết luận "không tái hiện được nên bỏ qua".
- Nêu cách giảm xác suất gặp lại (vd: thêm log chi tiết ở điểm nghi ngờ) ngay cả khi chưa tìm ra nguyên nhân gốc.
- Quyết định khi nào nên dừng điều tra tiếp và ghi nhận lại để theo dõi, thay vì đào sâu vô thời hạn.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Quy trình điều tra có thứ tự | Nhẩy việc, không có thứ tự | Có thứ tự cơ bản (check log → check code) | Thứ tự rõ, có lý do cho mỗi bước |
| Thu thập thông tin phù hợp | Không nghĩ đến hỏi thêm user | Hỏi 1-2 chi tiết chung | Hỏi đủ để khoanh vùng (thời gian, thao tác trước đó, mạng, thiết bị) |
| Biết khi nào dừng điều tra | Cố gắng tìm root cause vô thời hạn hoặc bỏ qua ngay | Có ý thức về chi phí thời gian nhưng không có tiêu chí rõ | Có tiêu chí rõ để chuyển sang theo dõi/thêm log thay vì điều tra tiếp |

**Lời giải gợi ý:**

- Bắt đầu từ: xem log backend thời điểm xảy ra lỗi — có request nào đến server trong khung giờ đó không (loại trừ mất mạng hoàn toàn phía client).
- Hỏi thêm: thiết bị/trình duyệt, mạng lúc đó, có submit liên tiếp nhiều lần không, thông báo lỗi cụ thể hiện trên UI.
- Giảm xác suất gặp lại mà chưa cần biết root cause: tạm nâng log lên ghi cả request thành công, hoặc log chi tiết hơn ở điểm nghi ngờ (validate, network call) kèm correlation ID.
- Nên dừng điều tra sâu khi: đã xác nhận không ảnh hưởng nhiều user khác và đã có log tốt hơn để bắt lần tái diễn — ghi vào backlog theo dõi thay vì đào vô thời hạn.

### B2. Loại trừ giả thuyết

**Đề bài:** Request đi qua: Client → Nginx reverse proxy → API Gateway → Backend service → DB. Mỗi lớp có log riêng, nhưng log các lớp chưa được gộp theo một request ID chung. Một request từ client bị lỗi 500. Lỗi có thể ở frontend, backend, hay network/infra — chưa biết ở đâu.

&#91;embedded content: 4 lớp, mỗi lớp có log riêng chưa gộp\]

**Yêu cầu cụ thể:**

- Trình bày quy trình thu hẹp phạm vi nghi ngờ, từng bước.
- Mỗi bước nêu rõ đang kiểm chứng giả thuyết nào, và kết quả nào sẽ xác nhận/loại bỏ giả thuyết đó.
- Giải thích cách chọn thứ tự kiểm tra (tại sao kiểm tra A trước B).
- Nêu 1 ví dụ cụ thể từ kinh nghiệm đã dùng cách này.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Có giả thuyết rõ ràng | Kiểm tra ngẫu nhiên, không nêu giả thuyết | Nêu được giả thuyết nhưng không nêu cách kiểm chứng | Mỗi bước = 1 giả thuyết + 1 cách kiểm chứng rõ (xác nhận hoặc loại bỏ) |
| Thu hẹp phạm vi hiệu quả | Kiểm tra dàn trải, không giảm được không gian nghi ngờ | Thu hẹp được nhưng chậm, nhiều bước thừa | Thu hẹp nhanh (tương tự binary search: mỗi bước loại ≈ nửa phạm vi) |
| Ví dụ thực tế | Không có ví dụ thực, chỉ lý thuyết | Có ví dụ nhưng sơ sài | Ví dụ cụ thể, đúng quy trình đã nêu |

**Lời giải gợi ý:**

- Bước 1: kiểm tra log backend — request có tới không; không tới thì loại network/gateway, tới mà lỗi thì tiếp bước 2.
- Bước 2: kiểm tra chi tiết lỗi 500 trong log backend (exception, stack trace) — xác nhận lỗi code hay DB.
- Bước 3: nếu backend sạch nhưng client vẫn thấy 500, nghi Nginx/API Gateway (timeout, giới hạn response size, cấu hình proxy) — xem log Nginx riêng.
- Lý do thứ tự: kiểm tra điểm khả năng cao và dễ kiểm tra nhất trước, rồi mới đến các lớp hạ tầng khó truy vết hơn (log chưa gộp theo request ID).
- Ví dụ thực tế: lỗi 500 do Nginx timeout 30s khi backend xử lý 35s — log backend hoàn toàn sạch khiến ban đầu nghi sai chỗ.

### B3. Degrade dần, không đột ngột

**Đề bài:** Endpoint `/search` dùng Elasticsearch, index được rebuild toàn bộ mỗi đêm. Số lượng sản phẩm tăng dần theo thời gian, chưa có giới hạn hoặc theo dõi kích thước index. Thời gian phản hồi trung bình của API này tăng dần từ 200ms lên 1.5s trong 2 tuần, không có deploy nào trùng thời điểm bắt đầu tăng.

&#91;embedded content: latency tăng dần theo thời gian, không phải đột ngột\]

**Yêu cầu cụ thể:**

- Giải thích cách điều tra khi không thể "so sánh trước/sau 1 thay đổi" như lỗi đột ngột.
- Nêu ít nhất 3 nguyên nhân điển hình gây degrade dần (không phải do deploy).
- Đề xuất cách thu thập dữ liệu theo thời gian để tìm điểm bắt đầu lệch (correlate với sự kiện khác: tăng data, tăng user, job nền...).
- Phân biệt rõ cách điều tra này khác gì so với điều tra lỗi đột ngột sau 1 deploy.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Hiểu bản chất khác biệt | Xuử lý giống lỗi đột ngột (chỉ tìm deploy gần nhất) | Nhận ra khác nhau nhưng chưa nêu được lý do | Nêu rõ degrade dần thường do yếu tố tích lũy (data tăng, leak, index hỏng dần) |
| Nguyên nhân điển hình | Không nêu được nguyên nhân nào hợp lý | Nêu được 1 nguyên nhân | Nêu được ≥3 nguyên nhân khác nhau, có cơ sở |
| Phương pháp correlate thời gian | Không đề xuất cách theo dõi theo thời gian | Đề xuất chung ("xem monitoring") | Đề xuất cụ thể: vẽ trend, đối chiếu với các sự kiện khác trong cùng khoảng thời gian |

**Lời giải gợi ý:**

- Cách điều tra khác: không tìm "deploy nào gây ra" mà tìm "yếu tố nào tích lũy theo thời gian" — vẽ trend latency theo ngày, đối chiếu với index size theo ngày.
- 3 nguyên nhân điển hình: (1) index Elasticsearch phình to dần, (2) memory leak tích lũy qua uptime dài, (3) dữ liệu log/cache tăng dần làm I/O chậm dần.
- Thu thập dữ liệu: theo dõi metric theo thời gian (index size, heap usage, latency), so khớp 2 đường cong tăng dần.
- Khác với lỗi đột ngột: lỗi đột ngột tìm "cái gì thay đổi tại thời điểm T"; degrade dần tìm "cái gì tăng liên tục" — cần dữ liệu lịch sử dài hơn, không chỉ so sánh trước/sau 1 deploy.

### B4. Local đúng, production lỗi

**Đề bài:** Local dùng SQLite + lưu file trên đĩa; production dùng PostgreSQL + S3. Biến môi trường quản lý qua file `.env` ở local, qua secret manager ở production. Một feature liên quan tới upload file chạy đúng hoàn toàn trên máy local, nhưng lỗi ngay khi deploy lên production, cùng code, cùng version.

&#91;embedded content: 2 stack hạ tầng khác nhau giữa local và production\]

**Yêu cầu cụ thể:**

- Nêu thứ tự cụ thể các nhóm nguyên nhân sẽ kiểm tra (config/env var, data thật khác data test, version dếpendency, quyền truy cập, network/firewall...).
- Giải thích vì sao chọn thứ tự đó (kiểm tra rẻ/nhanh trước).
- Nêu cách so sánh môi trường local vs production để tìm điểm khác biệt mà không cần đoán.
- Nêu rủi ro của việc debug trực tiếp trên production và cách giảm rủi ro đó.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Danh sách nguyên nhân khá đầy đủ | Chỉ nêu 1 nhóm (vd: chỉ nghĩ đến config) | Nêu được 2-3 nhóm | Nêu được ≥4 nhóm nguyên nhân khác nhau |
| Thứ tự kiểm tra hợp lý | Không có thứ tự, hoặc thứ tự ngược (kiểm tra phức tạp trước) | Có thứ tự cơ bản | Thứ tự từ rẻ/nhanh đến tốn thời gian, có lý do |
| Ý thức rủi ro khi debug production | Không đề cập rủi ro | Có nhắc tới rủi ro chung | Nêu rõ rủi ro + cách giảm (debug read-only, log thêm thay vì sửa trực tiếp) |

**Lời giải gợi ý:**

- Thứ tự kiểm tra từ rẻ đến đắt: (1) biến môi trường/config khác nhau giữa `.env` và secret manager (sai tên/thiếu biến), (2) khác hạ tầng lưu trữ (SQLite vs PostgreSQL + S3 — không tương thích kiểu dữ liệu/thao tác), (3) quyền IAM tới S3, (4) khác version dependency.
- Vì là lỗi upload file: nghi vấn hàng đầu là thiếu quyền IAM hoặc sai config SDK (region, bucket) khi gọi S3 — thứ không tồn tại ở local.
- So sánh môi trường: dump biến môi trường (ẩn secret) và log đầy đủ error message thật từ production (không chỉ "lỗi 500").
- Giảm rủi ro debug trên production: ưu tiên đọc log/readonly; nếu cần thử nghiệm thì làm trên staging có cấu hình giống production (S3 bucket riêng) trước khi đổi code production.

### B5. Ưu tiên khi 2 bug cùng lúc

**Đề bài:** Team report bug qua Jira, có kênh Slack `#incidents` riêng cho sự cố ảnh hưởng production. Bạn đang là người duy nhất xử lý ca này trong giờ làm việc, đang fix 1 bug UI nhỏ (hiển thị sai label) thì phát hiện thêm 1 bug khác: một số đơn hàng bị tính sai giá ở module thanh toán, ảnh hưởng đến doanh thu.

&#91;embedded content: 2 bug cùng lúc, mức ảnh hưởng khác nhau rõ rệt\]

**Yêu cầu cụ thể:**

- Nêu quyết định: tiếp tục bug đang làm hay chuyển hướng ngay, và tiêu chí để quyết định.
- Nêu những ai cần được thông báo ngay về bug tính sai giá, trước khi tự mình xử lý xong.
- Nêu hành động tắm thời (mitigate) có thể làm ngay trong khi chờ điều tra kỹ root cause.
- Giải thích cách báo cáo lại bug UI nhỏ đang làm (không để bị quên).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Ưu tiên đúng theo mức độ ảnh hưởng | Tiếp tục bug nhỏ vì "đang làm gặng xong" | Nhận ra cần chuyển hướng nhưng không nêu tiêu chí rõ | Nêu tiêu chí rõ (ảnh hưởng doanh thu/user > UI nhỏ) để quyết định nhanh |
| Giao tiếp kịp thời | Không nghĩ đến báo cho ai | Nghĩ đến báo nhưng không cụ thể ai | Nêu rõ cần báo PM/lead và có thể cả bên tài chính/business |
| Có hành động tạm thời hợp lý | Không nghĩ đến mitigate, chỉ định fix gốc ngay | Có ý tưởng mitigate nhưng mơ hồ | Đề xuất mitigate cụ thể (tạm khóa chập nhận đơn nghị ngờ, rollback phần tính giá) |

**Lời giải gợi ý:**

- Chuyển hướng ngay sang bug tính sai giá vì ảnh hưởng doanh thu/khách hàng thật, lớn hơn bug UI hiển thị sai label.
- Báo ngay cho PM/Lead, và cả bên kế toán/vận hành nếu đơn hàng đã hoàn tất với giá sai (ảnh hưởng hoàn tiền/truy thu).
- Hành động tạm thời: tạm khoá checkout cho nhóm sản phẩm/điều kiện gây lỗi, hoặc rollback phần logic tính giá vừa thay đổi gần nhất nếu xác định được.
- Giữ lại bug UI: ghi chú trạng thái đang làm (comment code/ticket "paused — xử lý bug giá trước"), không để quên.

## C. Tư duy thiết kế hệ thống

### C1. API trade-off: dễ dùng cho client vs dễ mở rộng cho backend

**Đề bài:** Backend expose REST API versioned theo URL (`/v1/...`). Frontend là SPA React, gọi trực tiếp nhiều API riêng lẻ (orders, customers, products) rồi tự gộp dữ liệu ở client, chưa có GraphQL hay BFF riêng. Bạn thiết kế API `GET /orders/{id}` cho màn hình chi tiết đơn hàng. Frontend muốn API trả luôn đầy đủ thông tin khách hàng, sản phẩm, vận chuyển trong 1 lần gọi để đơn giản. Backend lo rằng gộp quá nhiều sẽ khó thay đổi từng phần sau này.

&#91;embedded content: client gọi 3 API rồi tự gộp, chưa có BFF\]

**Yêu cầu cụ thể:**

- Nêu rõ ít nhất 1 rủi ro cụ thể của mỗi hướng (gộp hết vs tách nhỏ gọi nhiều lần).
- Đề xuất phương án cụ thể (cấu trúc response, có thể dùng field optional/expand param...).
- Nêu tiêu chí sẽ dùng để quyết định cho các API tương tự sau này (không phải quyết định lại từ đầu mỗi lần).
- Giải thích ảnh hưởng nếu sau này cần thay đổi cấu trúc đã chọn (versioning, breaking change).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Nhận diện đúng trade-off | Chọn 1 phương án ngay, không thấy rủi ro của phương án khác | Nêu được rủi ro của 1 hướng | Nêu rủi ro cụ thể của cả 2 hướng |
| Giải pháp cụ thể, khả thi | Chỉ nói chung "cần cân bằng" | Có đề xuất nhưng chưa cụ thể cấu trúc | Đề xuất cấu trúc cụ thể, khả thi với backend hiện tại |
| Nghĩ xa hơn 1 API đơn lả | Chỉ trả lời cho đúng API này | Có ý nghĩ đến khả năng tái dùng | Nêu được tiêu chí/quy ước áp dụng chung cho API tương tự |

**Lời giải gợi ý:**

- Hướng chọn: trả object `order` cơ bản theo default, các field quan hệ lớn (customer, items, shipping) trả qua tham số `?expand=customer,items` — không trả hết theo mặc định.
- Rủi ro gộp hết: payload nặng, khó đổi từng phần sau (breaking change ảnh hưởng mọi client), khó cache riêng.
- Rủi ro tách nhỏ: client phải gọi nhiều round-trip, chậm trên mobile mạng yếu.
- Tiêu chí chung: field luôn cần ở màn hình chính → default trả về; field ít dùng/dễ đổi cấu trúc → qua expand hoặc endpoint riêng.
- Ảnh hưởng khi đổi cấu trúc: cần versioning (`/v2`) hoặc additive-only change (chỉ thêm field mới) để tránh breaking client cũ.

### C2. Sync vs async

**Đề bài:** Khi user đặt hàng, hệ thống cần: (1) trừ kho, (2) gửi email xác nhận, (3) tính điểm tích lũy loyalty, (4) đồng bộ dữ liệu sang hệ thống kế toán. Hiện cả 4 bước này chạy đồng bộ trong cùng 1 request HTTP, gọi hàm nội bộ trong cùng service. Hệ thống đã có sẵn RabbitMQ dùng cho 1 use case khác (gửi SMS marketing), nên hạ tầng message queue không cần build mới.

&#91;embedded content: 4 bước chạy tuần tự, đồng bộ trong 1 request\]

**Yêu cầu cụ thể:**

- Phân loại từng bước nên xử lý đồng bộ (chặn request chính) hay bất đồng bộ (qua queue), và giải thích vì sao.
- Nêu tiêu chí chung để quyết định sync vs async cho một bước bất kỳ (không chỉ áp dụng cho ví dụ này).
- Nêu điều gì xảy ra nếu bước async bạn chọn bị lỗi/thất bại — user có biết không, hệ thống xử lý thế nào.
- Nêu trade-off về độ phức tạp vận hành khi thêm queue/async (không miễn phí).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Phân loại đúng từng bước | Đề xuất sai (vd: trừ kho async) hoặc làm hết sync | Phân loại đúng đa số nhưng chưa giải thích rõ | Phân loại đúng + giải thích lý do dựa trên tính chất nghiệp vụ (cần consistency ngay vs có thể trễ |
| Tiêu chí quyết định tổng quát | Không nêu được tiêu chí chung | Nêu tiêu chí mơ hồ | Nêu tiêu chí rõ (vd: cần kết quả ngay để trả user → sync; không ảnh hưởng trải nghiệm ngay → async) |
| Xử lý failure của bước async | Không nghĩ đến trường hợp lỗi | Nhắc đến cần retry chung | Nêu cụ thể cơ chế (retry, dead-letter queue, cách biết để can thiệp thủ công) |

**Lời giải gợi ý:**

- Đồng bộ: trừ kho (quyết định kết quả trả về ngay cho user — hết hàng phải báo ngay).
- Bất đồng bộ qua queue: gửi email, tính điểm loyalty, đồng bộ kế toán — không ảnh hưởng trải nghiệm ngay, có thể trễ.
- Tiêu chí: bước quyết định kết quả trả về ngay → sync; bước chỉ là hệ quả phụ, làm sau được → async.
- Nếu bước async lỗi: retry + dead-letter queue (RabbitMQ đã có sẵn), có alert khi message vào dead-letter để người vận hành xử lý tay, user không bị ảnh hưởng ngay.
- Trade-off: thêm phức tạp vận hành (theo dõi queue, dead-letter, consumer không bị stuck) — nhưng vì hạ tầng đã có, chi phí thêm chủ yếu là consumer logic.

### C3. Bảng dữ liệu lớn dần

**Đề bài:** Bảng `order_logs` trên PostgreSQL hiện có 20 triệu row, tăng \~2 triệu row/tháng, chỉ có index trên `order_id`, chưa partition. Query theo `order_id` vẫn nhanh, nhưng báo cáo thống kê theo khoảng thời gian đang chậm dần (hiện đang full table scan), và backup hàng ngày (dùng `pg_dump` toàn bộ bảng, server DB 16GB RAM) cũng đang lâu hơn.

&#91;embedded content: cùng 1 bảng, truy vấn theo ngày là điểm chậm\]

**Yêu cầu cụ thể:**

- Nêu thứ tự điều tra trước khi quyết định giải pháp (không nhảy thẳng vào partition/archive).
- So sánh ít nhất 2 trong số 3 hướng: thêm index, partition theo thời gian, archive dữ liệu cũ — nêu trade-off của mỗi hướng.
- Nêu điều kiện để chọn hướng nào (vd: dữ liệu cũ có còn cần truy vấn thường xuyên không).
- Nêu rủi ro khi triển khai giải pháp được chọn trên bảng đang chạy production (downtime, lock table).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Điều tra trước khi giải | Chọn giải pháp ngay không kiểm tra query nào chậm | Có nhắc tới điều tra nhưng sơ sài | Nêu rõ cần xác định query nào chậm, explain plan, trước khi chọn giải pháp |
| So sánh trade-off các hướng | Chỉ nêu 1 hướng, không so sánh | So sánh được nhưng sơ sài | So sánh rõ ≥2 hướng, kèm điều kiện áp dụng |
| Yú thức rủi ro triển khai trên production | Không đề cập | Nhắc chung đến rủi ro | Nêu cụ thể (lock, downtime) + cách giảm (online migration, chia batch) |

**Lời giải gợi ý:**

- Điều tra trước: dùng `EXPLAIN ANALYZE` xác nhận đúng là full table scan do thiếu index theo cột ngày.
- So sánh hướng: thêm index theo ngày — nhanh, ít rủi ro, nhưng không giải quyết bảng ngày càng lớn/backup chậm; partition theo tháng/quý — giải quyết cả query nhanh hơn và cho phép archive/drop partition cũ, nhưng tốn công triển khai hơn.
- Điều kiện chọn: dữ liệu cũ (>6-12 tháng) hiếm cần truy vấn → partition + archive hợp lý về dài hạn; cần fix nhanh ngắn hạn → thêm index trước.
- Rủi ro triển khai: tạo index lớn trên bảng 20 triệu dòng có thể lock bảng — dùng `CREATE INDEX CONCURRENTLY`; partition cần migrate theo batch nhỏ, ngoài giờ cao điểm.

### C4. Idempotency

**Đề bài:** PaymentService gọi REST tới cổng thanh toán bên thứ 3; mobile app có timeout 10s và tự động retry tối đa 2 lần khi không nhận được response. Bảng `payments` hiện có unique constraint trên `order_id`, chưa có cột riêng lưu idempotency key. API `POST /payments/charge` có thể bị gọi lại nhiều lần do client retry khi mất kết nối mạng (client không biết request trước đã thành công hay chưa). Nếu không xử lý, khách hàng có thể bị trừ tiền 2 lần.

&#91;embedded content: retry từ client có thể gọi trùng payment\]

**Yêu cầu cụ thể:**

- Thiết kế cơ chế idempotency chống xử lý trùng.
- Nêu cách xử lý khi 2 request cùng idempotency key đến **gần như cùng lúc** (race condition).
- Nêu thời gian lưu idempotency key hợp lý và lý do.
- Nêu thêm 1 chỗ khác trong hệ thống cũng cần idempotency (ngoài thanh toán).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Cơ chế chống trùng cụ thể | Không đề xuất được cơ chế nào khả thi | Nêu ý tưởng idempotency key nhưng chưa chi tiết | Nêu được cơ chế đầy đủ: key, lưu trạng thái, trả kết quả đã xử lý thay vì xử lý lại |
| Xử lý race condition | Không nghĩ đến trường hợp đồng thời | Nhận ra có rủi ro nhưng không nêu giải pháp | Nêu giải pháp cụ thể (unique constraint, lock, atomic check-and-set) |
| Tổng quát hoá được nguyên tắc | Chỉ trả lời đúng ví dụ này | Có nhắc tới chỗ khác cần tương tự | Nêu được ví dụ khác cụ thể và giải thích vì sao cùng nguyên tắc |

**Lời giải gợi ý:**

- Cơ chế: client sinh `idempotency_key` (UUID) duy nhất cho mỗi lần bấm "thanh toán" (không sinh mới khi tự retry), gửi kèm header mọi lần gọi của cùng hành động.
- Server: cột `idempotency_key` unique trên bảng `payments`; trước khi xử lý, kiểm tra key đã tồn tại chưa — có thì trả kết quả đã lưu, chưa thì xử lý và lưu kèm key.
- Race condition: dựa vào unique constraint DB làm chốt chặn cuối (atomic) — request thứ 2 bị DB từ chối do trùng key, bắt exception đó và trả kết quả của request thứ nhất, không check-rồi-insert riêng lẻ (có race).
- Thời gian lưu key: dài hơn thời gian retry tối đa có thể xảy ra (vd 24h), không cần giữ vĩnh viễn.
- Chỗ khác cần idempotency: API tạo đơn hàng, webhook nhận kết quả từ cổng thanh toán thứ 3 (họ cũng có thể gửi lại cùng event).

### C5. Service mới hay thêm logic vào service cũ

**Đề bài:** Service Order hiện có 4 người maintain, release theo sprint 2 tuần. Notification hiện gửi email qua SMTP trực tiếp ngay trong code xử lý đơn hàng (chạy chung trong service `Order`), khoảng 10.000 email/ngày. Team cần thêm tính năng gửi thông báo qua SMS/push ngoài email hiện có. Có ý kiến tách thành service `Notification` riêng, có ý kiến cứ thêm vào `Order` cho nhanh.

&#91;embedded content: notification chưa tách khỏi Order service\]

**Yêu cầu cụ thể:**

- Nêu tiêu chí cụ thể để quyết định (không phải "tách service luôn tốt hơn").
- Nêu chi phí thực của việc tách service mới (vận hành, deploy, monitoring, giao tiếp giữa service).
- Nêu chi phí thực của việc thêm vào service cũ (coupling, khó scale riêng, blast radius khi lỗi).
- Đưa ra quyết định cuối cùng cho trường hợp này cụ thể, kèm lý do (không né tránh chọn).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Tiêu chí quyết định rõ ràng | Theo "trào lưu" (microservice luôn tốt) không có lý do cụ thể | Nêu được 1 tiêu chí | Nêu ≥2 tiêu chí cụ thể (tần suất thay đổi khác nhau, tải khác nhau, team khác nhau sở hữu) |
| Chi phí vận hành được nhìn nhận thật | Bỏ qua hoàn toàn chi phí tách service | Nhắc chung đến "phức tạp hơn" | Nêu cụ thể (thêm deploy pipeline, thêm điểm lỗi network, cần observability riêng) |
| Dám quyết định cụ thể | Trả lời nước đôi, không chọn | Chọn được nhưng lý do yếu | Chọn rõ + lý do gắn với ngữ cảnh cụ thể của đề bài |

**Lời giải gợi ý:**

- Tiêu chí: tần suất thay đổi khác nhau (notification sắp thêm SMS/push, thay đổi nhiều — tách để không ảnh hưởng release Order); tải/đặc tính khác nhau (gửi email cần retry/backoff riêng, không nên làm chậm luồng tạo đơn).
- Chi phí tách service mới: thêm CI/CD riêng, observability riêng, thêm 1 điểm lỗi network giữa 2 service.
- Chi phí giữ trong Order: mỗi lần đổi logic noti đều phải deploy lại Order (rủi ro ảnh hưởng luồng chính); SMTP chậm/down có thể làm chậm luôn việc tạo đơn.
- Quyết định: tách Notification service, giao tiếp qua queue bất đồng bộ (Order publish `order_created`, Notification tự consume và gửi) — vì notification thay đổi nhiều hơn và không nên kéo rủi ro vào luồng đặt hàng cốt lõi.

## D. Kinh nghiệm vận hành thực chiến

### D1. Incident thật

**Đề bài:** Chọn 1 incident production thật mà bạn trực tiếp xử lý (không phải nghe kể lại), có ảnh hưởng thật đến user/business — không cần khớp với bối cảnh hệ thống ở các câu khác trong bộ đề này.

**Yêu cầu cụ thể:**

- Kể đầy đủ timeline: ai/cái gì phát hiện đầu tiên, các bước chẩn đoán, cách fix (tạm và gốc), thời gian phục hồi.
- Nêu rõ vai trò cụ thể của ứng viên trong incident (không nói chung "team làm").
- Nêu được làm postmortem sau đó không, và kết quả cụ thể (thay đổi gì sau incident).
- Nếu xảy ra lại hôm nay, sẽ làm khác đi ở bước nào.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Tính xác thực, cụ thể | Kể chung, không chi tiết thời gian/số liệu, nghe như lý thuyết | Có timeline cơ bản nhưng thiếu chi tiết | Timeline cụ thể, số liệu thật, vai trò rõ ràng |
| Có quy trình postmortem | Không biết/không làm postmortem | Có làm nhưng hời hợt | Nêu được thay đổi cụ thể sau postmortem (code, process, monitoring) |
| Rút kinh nghiệm thật | Không nêu được sẽ làm khác gì | Nêu chung ("sẽ cẩn thận hơn") | Nêu cụ thể, có thể áp dụng lại được |

**Lời giải gợi ý:** Đây là câu hỏi dựa trên kinh nghiệm thật của ứng viên, không có đáp án mẫu cố định — dùng bảng tiêu chí bên trên để đánh giá câu trả lời thực tế họ kể.

### D2. Rollback plan

**Đề bài:** Hệ thống dùng migration tool chạy tự động mỗi lần deploy. Bảng `orders` hiện có khoảng 5 triệu dòng, SLA cho phép downtime tối đa 5 phút mỗi lần deploy. Bạn chuẩn bị deploy một thay đổi lớn: đổi cấu trúc bảng `orders` để thêm cột mới bắt buộc, kèm migrate dữ liệu cũ.

&#91;embedded content: migration tự động, rollback dữ liệu phức tạp hơn\]

**Yêu cầu cụ thể:**

- Nêu rollback plan cụ thể cho trường hợp này (không chung "rollback code lại").
- Chỉ ra vì sao rollback 1 migration DB khó hơn rollback code thường.
- Nêu điều kiện cụ thể để quyết định rollback thay vì hotfix.
- Nêu cần test rollback plan trước khi deploy thật không, và test ở đâu.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Rollback plan cụ thể | Chỉ nói "revert code", không nghĩ đến data | Có nghĩ đến data nhưng chưa chi tiết | Nêu rõ cần backward-compatible migration, cách xử lý cột mới khi rollback |
| Hiểu độ khó của rollback DB | Coi rollback DB đơn giản như rollback code | Nhận ra khó hơn nhưng không giải thích được | Giải thích rõ (dữ liệu đã ghi mới, không thể "undo" đơn giản) |
| Kiểm thử rollback trước | Không nghĩ đến test rollback | Nghĩ đến nhưng không nêu môi trướng cụ thể | Nêu cụ thể test ở staging/môi trường giống production trước |

**Lời giải gợi ý:**

- Rollback plan cụ thể: migration backward-compatible — thêm cột mới nullable/có default trước, chưa bắt buộc NOT NULL ngay; code cũ (nếu rollback) vẫn chạy được vì cột mới không bắt buộc.
- Vì sao khó hơn code: rollback code chỉ là deploy lại version cũ; rollback DB phải xử lý dữ liệu đã được viết bởi code mới, không thể "quay lại" đơn giản mà không mất dữ liệu.
- Điều kiện chọn rollback vs fix forward: lỗi nghiêm trọng, chưa rõ nguyên nhân → rollback ngay; lỗi nhỏ, cô lập được, đã rõ hướng fix → fix forward nhanh hơn rollback DB phức tạp.
- Test rollback: chạy thử cả 2 chiều (migrate lên + rollback xuống) trên staging với dữ liệu giống thật trước khi deploy production.

### D3. Alert fatigue

**Đề bài:** Monitoring dùng Prometheus + Grafana + Alertmanager, alert gửi qua Slack channel `#alerts`, với ngưỡng cảnh báo là giá trị tĩnh được cấu hình từ lúc setup ban đầu, chưa từng cập nhật lại. Alert "CPU > 80%" hiện gửi trung bình 5 lần/ngày, hầu hết tự hạ xuống sau vài phút không cần can thiệp. Team dần thành thói quen bỏ qua (ignore) alert này.

&#91;embedded content: ngưỡng tĩnh, chưa từng được cập nhật lại\]

**Yêu cầu cụ thể:**

- Chỉ ra rủi ro cụ thể của việc "thôi quén bỏ qua alert" (alert fatigue).
- Đề xuất cách điều chỉnh alert này để giảm false positive mà không bỏ sót trường hợp thật (vd: ngề thời gian, alert theo xu hướng thay vì ngưỡng tức thời).
- Nêu cách phân biệt alert "cần hành động ngay" với alert "chỉ để biết" (severity).
- Nêu cách đo lường xem hệ thống alert có đang hiệu quả không (vd: tỉ lệ alert dẫn đến hành động thật).

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Nhận diện rủi ro | Không thấy vấn đề gì với việc ignore alert | Thấy vấn đề nhưng không nêu cụ thể | Nêu rõ: sẽ bỏ sót alert thật khi nó lẫn trong noise |
| Giải pháp giảm noise hợp lý | Không đề xuất được | Đề xuất chung ("chỉnh thềm ngưỡng") | Đề xuất cụ thể (ngề thời gian, alert theo trend, bucket theo severity) |
| Phân tầng mức độ alert | Không phân biệt mức độ | Có ý niệm nhưng mơ hồ | Phân rõ severity + kênh thông báo tương ứng |

**Lời giải gợi ý:**

- Rủi ro: khi alert thật xảy ra (CPU cao kèm memory leak dẫn tới crash), team đã quen bỏ qua nên phản ứng chậm hoặc bỏ sót hoàn toàn.
- Giảm noise: đổi ngưỡng tức thời thành "CPU > 80% liên tục 10 phút" (dùng avg theo thời gian trong PromQL), hoặc alert theo xu hướng tăng liên tục thay vì giá trị tuyệt đối tại 1 thời điểm.
- Phân tầng severity: warning (chỉ ghi nhận) vs critical (cần người trực xử lý ngay) — gửi kênh khác nhau.
- Đo hiệu quả: theo dõi tỷ lệ alert dẫn đến hành động thật (actionable rate) — nếu quá thấp, cần điều chỉnh lại ngưỡng/logic alert.

### D4. Canary/feature flag

**Đề bài:** Hệ thống chưa dùng công cụ feature flag chuyên dụng, deploy qua CI/CD lên Kubernetes; hạ tầng Ingress có khả năng chia traffic theo phần trăm nhưng chưa từng dùng tới. Bạn sẽ ra mắt 1 thay đổi lớn ở luồng thanh toán, rủi ro cao nếu lỗi (ảnh hưởng trực tiếp doanh thu). Team đang tranh luận giữa deploy thẳng cho 100% user hay dùng chiến lược khác.

&#91;embedded content: ingress chia % traffic, chưa từng được dùng tới\]

**Yêu cầu cụ thể:**

- Giải thích khác nhau giữa feature flag, canary deploy, blue-green deploy.
- Đề xuất chiến lược cụ thể cho trường hợp này, kèm lý do.
- Nêu tiêu chí cụ thể để quyết định "mở rộng dần cho 100%" hay "dừng/rollback" trong quá trình canary.
- Nêu rõ ai/cái gì giám sát trong lúc canary đang chạy.

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Hiểu đúng khái niệm | Nhầm lẫn hoặc dùng lẫn các thuậ t ngữ | Phân biệt được nhưng chưa rõ ưu/nhược điểm | Phân biệt rõ + biết khi nào dùng cái nào |
| Chiến lược phù hợp rủi ro | Chọn deploy thẳng 100% không có lý do | Chọn chiến lược an toàn hơn nhưng không giải thích rõ | Chọn đúng + giải thích gắn với rủi ro doanh thu của đề bài |
| Tiêu chí dừng/tiếp tục rõ ràng | Không nêu tiêu chí | Tiêu chí chung ("nếu có lỗi thì dừng") | Tiêu chí cụ thể (error rate > X%, theo dõi metric nào) |

**Lời giải gợi ý:**

- Khác biệt: feature flag = bật/tắt tính năng theo config không cần deploy lại; canary = triển khai bản mới cho % traffic nhỏ trước khi mở rộng; blue-green = 2 môi trường song song, chuyển toàn bộ traffic một lúc, rollback bằng chuyển lại.
- Chiến lược cho case này: canary qua Ingress (đã có khả năng chia % traffic) — vd 5% trước, theo dõi error rate/thời gian xử lý thanh toán 30-60 phút trước khi tăng dần.
- Tiêu chí mở rộng/dừng: error rate thanh toán tăng bất thường, hoặc có giao dịch bị trừ tiền sai → dừng/rollback ngay; ổn định trong khung theo dõi → tăng dần % traffic.
- Giám sát: dashboard riêng cho nhóm canary (tách metric theo version) + người trực theo dõi trực tiếp, không chỉ dựa alert tự động.

### D5. Debug không có quyền can thiệp trực tiếp

**Đề bài:** Hạ tầng production chạy trên Kubernetes. Quyền truy cập chia theo role: Dev chỉ có quyền đọc log qua Grafana/Loki và xem dashboard, DevOps/SRE mới có quyền exec vào pod. Bạn cần chẩn đoán 1 lỗi trên production với quyền hiện có, bạn không có quyền restart service (có thể ảnh hưởng user đang dùng).

&#91;embedded content: Dev chỉ đọc, DevOps/SRE mới được exec vào pod\]

**Yêu cầu cụ thể:**

- Nêu những công cụ/dữ liệu read-only có thể dùng để chẩn đoán (log, metric, trace, dashboard).
- Nêu cách xác minh giả thuyết mà không cần can thiệp trực tiếp (vd: test lại trên môi trường staging giống production).
- Nêu khi nào cần escalate xin quyền cao hơn.
- Nêu cách giao tiếp với ngưới có quyền (DevOps/SRE) để họ hỗ trợ hiệu quả (yêu cầu cụ thể gì, không chỉ "xem giúp").

| Tiêu chí | Chưa đạt | Đạt | Tốt |
| --- | --- | --- | --- |
| Tận dụng dữ liệu sẵn có | Không biết bắt đầu từ đâu khi không có quyền trực tiếp | Nêu được 1-2 nguồn dữ liệu | Nêu được nhiều nguồn (log, metric, trace) và cách kết hợp |
| Biết giới hạn của mình | Cần dùng quyền không có, hoặc bỏ cuễc | Biết cần leo thang nhưng không rõ khi nào/ai | Nêu rõ điều kiện cần escalate và đúng ngưới để hỏi |
| Giao tiếp hiệu quả với ngưới có quyền | Yêu cầu mơ hồ ("check giúp server") | Yêu cầu cụ thể hơn nhưng chưa đầy đủ | Yêu cầu rõ: xem giúp log/metric nào, trong khoảng thời gian nào, để kiểm chứng giả thuyết nào |

**Lời giải gợi ý:**

- Nguồn dữ liệu read-only: log qua Grafana/Loki (lọc theo thời gian, service, request ID nếu có), dashboard Grafana cho metric (CPU, memory, error rate, latency theo pod).
- Xác minh giả thuyết không cần can thiệp: tái hiện lỗi trên staging giống production (cùng version, cấu hình tương đương) để thử nghiệm thoải mái.
- Khi cần escalate: khi log/metric hiện có không đủ xác định nguyên nhân (cần xem biến môi trường thật trong pod hoặc chạy lệnh debug) → xin DevOps/SRE exec có giám sát, hoặc xin quyền đọc log chi tiết hơn.
- Giao tiếp hiệu quả: yêu cầu cụ thể ("giúp xem log pod X trong khung giờ Y-Z, tìm log chứa từ khoá Z, nghi do connection timeout tới service W") thay vì yêu cầu mơ hồ "check giúp server".
