# Đề phỏng vấn TESTER Mid — Hướng dẫn chấm

Nov 20, 2026 · @LLA Team

Bản dành cho **người phỏng vấn** — không đưa cho ứng viên. Đề phát cho ứng viên: [de-phong-van-mid-tester-rut-gon.md](de-phong-van-mid-tester-rut-gon.md).

Bộ đề giữ triết lý của đề DEV: đánh giá năng lực giải quyết vấn đề thực tế, **không** kiểm tra lý thuyết kiểm thử (định nghĩa Test Case, Test Plan, Smoke Test…). Một TESTER Mid tốt nhìn hệ thống từ góc độ chất lượng: đánh giá rủi ro, tìm tình huống bất thường, truy nguyên nhân lỗi — và phát hiện được những rủi ro mà BA chưa đặc tả, DEV chưa nghĩ tới, quy trình kiểm thử thông thường chưa bao phủ.

## Hướng dẫn sử dụng

- Thời lượng gợi ý: 7–10 phút/câu. Không bắt buộc làm hết 8 câu — buổi 60 phút chọn 5–6 câu, ưu tiên giữ câu 1, 3, 4.
- Mục tiêu không phải câu trả lời "đúng chuẩn", mà nghe **cách ứng viên lập luận, đặt câu hỏi làm rõ, và thừa nhận giới hạn hiểu biết**.
- **Không gợi hướng giải quyết khi hỏi.** Đừng hỏi "em dùng Correlation ID thế nào", "em kiểm tra Dead Letter Queue ra sao". Hỏi mở: em điều tra thế nào, cần thông tin gì, kiểm chứng giả thuyết nào trước, kết quả nào khiến em loại bỏ giả thuyết đó. Ứng viên tự gọi đúng khái niệm là tín hiệu tốt; ứng viên thuộc thuật ngữ nhưng không dùng được vào tình huống là tín hiệu xấu.
- **Đào sâu sau mỗi giải pháp** ứng viên đưa ra: Tại sao chọn cách này? Có phương án khác không? Ưu/nhược từng phương án? Nếu cách này không hiệu quả thì bước tiếp theo là gì?
- **Câu 4, 7, 8 — yêu cầu ví dụ thật:** "Em kể một tình huống tương tự em đã gặp trong dự án. Em đã điều tra thế nào và kết quả cuối cùng ra sao?" Câu trả lời thật thường phân biệt rõ người đã trực tiếp xử lý với người chỉ biết lý thuyết.

## Cấu trúc bộ đề

| Câu | Chủ đề | Năng lực chính | Trọng số |
|---|---|---|---:|
| 1 | Phân tích nghiệp vụ, phát hiện lỗ hổng logic | Tư duy phân tích | 15 |
| 2 | Kiểm thử hệ thống nhiều thành phần phụ thuộc | Tư duy hệ thống | 15 |
| 3 | Chiến lược kiểm thử cho hệ thống lớn | Tư duy kiến trúc | 15 |
| 4 | Truy vết lỗi không tái hiện được | Tư duy truy vết | 15 |
| 5 | Kiểm thử hệ thống bất đồng bộ | Tư duy hệ thống + thực chiến | 10 |
| 6 | Kiểm thử API và tình huống đồng thời | Tư duy phân tích + kỹ thuật | 10 |
| 7 | Kiểm thử khi triển khai phiên bản mới | Vận hành thực chiến | 10 |
| 8 | Điều tra lỗi production với quyền hạn chế | Truy vết + vận hành | 10 |

## Cách tính điểm

- Chấm **mỗi câu theo thang 1–5**, dùng mốc 1 / 3 / 5 ở từng câu (2 và 4 là mức giữa).
- Điểm câu = trọng số × điểm / 5. **Tổng tối đa 100.**
- Câu không hỏi trong buổi: bỏ khỏi cả tử và mẫu, quy về thang 100 theo tổng trọng số đã hỏi.
- Tư duy tự động hóa chấm riêng (xem [Phụ lục](#phụ-lục--vị-trí-qc-automation)), **không** cộng vào tổng 100.

---

## Câu 1. Phân tích nghiệp vụ và phát hiện lỗ hổng logic

**Mục tiêu:** khả năng phân tích nghiệp vụ, không chỉ chuyển yêu cầu thành Test Case.

**Điểm cần nghe:**
- Đơn hàng và thanh toán là **hai đối tượng có vòng đời trạng thái riêng** (đơn: mới tạo → chờ thanh toán → đã thanh toán / đã hủy / hết hạn; thanh toán: khởi tạo → đang xử lý → thành công / thất bại / không rõ kết quả).
- Kiểm tra tồn kho ở bước 2 nhưng trừ ở bước 5 → **tranh chấp tồn kho** khi nhiều người mua cùng lúc.
- Trừ kho trước khi thanh toán: giữ kho bao lâu? **Hoàn kho khi nào** nếu thanh toán thất bại hoặc người dùng bỏ ngang?
- Thanh toán thành công ở cổng nhưng hệ thống **không nhận được phản hồi**; phản hồi về trễ sau khi đơn đã bị hủy.
- Quy tắc thanh toán lại chưa rõ: giới hạn số lần? thời hạn? giá thay đổi giữa hai lần thì sao?
- Câu cuối: lỗi nằm ở **yêu cầu**, không phải ở code — đưa về BA kèm tình huống cụ thể, ghi nhận là lỗ hổng đặc tả, không đổ lỗi DEV; đề xuất bổ sung quy tắc và kiểm thử lại.

**Câu hỏi đào sâu:** Trong các tình huống em nêu, cái nào gây thiệt hại lớn nhất cho khách hàng / công ty? Em sẽ hỏi BA những câu gì trước khi viết kịch bản kiểm thử?

| Mức | Tín hiệu |
|---|---|
| 1 | Liệt kê lại các bước và quy định, viết kịch bản đúng/sai cho từng bước |
| 3 | Vẽ được trạng thái đơn hàng, nêu được vài ngoại lệ (hết hàng giữa chừng, thanh toán lại) |
| 5 | Tách hai vòng đời, chỉ ra điểm lệch đơn–thanh toán–kho, nêu được lỗ hổng đặc tả và cách đưa về BA |

## Câu 2. Kiểm thử hệ thống có nhiều thành phần phụ thuộc

**Mục tiêu:** nhìn chất lượng ở cấp hệ thống — các service chạy đúng độc lập không có nghĩa cả quy trình nghiệp vụ chạy đúng.

**Điểm cần nghe:**
- Đơn tạo được nhưng kho không trừ → lỗi **tương tác**: gọi Inventory bị timeout / lỗi mà Order vẫn ghi nhận thành công, không có bước bù trừ.
- Thanh toán thành công nhưng không có email → lỗi bị nuốt ở Notification, hoặc lời gọi không chờ kết quả và không ai kiểm tra.
- Bấm đặt nhiều lần ra nhiều đơn → thiếu chặn trùng ở cả giao diện lẫn API.
- Phân biệt được các tầng kiểm thử: unit, API/component, tích hợp, end-to-end — và **mỗi tầng bắt loại lỗi gì**.
- Pass độc lập nhưng hệ thống lỗi: lệch hợp đồng API giữa hai bên, timeout/retry, thứ tự gọi, dữ liệu dùng chung, cấu hình môi trường khác nhau.
- Phạm vi hồi quy: dựa trên bản đồ phụ thuộc — service thay đổi được ai gọi tới, hợp đồng nào đổi.

**Câu hỏi đào sâu:** Nếu chỉ được chọn một tầng kiểm thử cho luồng này, em chọn tầng nào, chấp nhận bỏ sót gì?

| Mức | Tín hiệu |
|---|---|
| 1 | Chỉ kiểm thử qua giao diện, coi mỗi vấn đề là lỗi của một service |
| 3 | Phân biệt được lỗi trong service và lỗi tương tác, biết kiểm thử API và tích hợp |
| 5 | Giải thích cơ chế từng vấn đề, chọn tầng kiểm thử theo loại lỗi, xác định phạm vi hồi quy từ phụ thuộc |

## Câu 3. Chiến lược kiểm thử cho hệ thống lớn

**Mục tiêu:** tổ chức kiểm thử và quản trị rủi ro khi nguồn lực có hạn.

**Điểm cần nghe:**
- **Ưu tiên theo rủi ro**: xếp chức năng theo mức ảnh hưởng nghiệp vụ và pháp lý — phát hành, ký số, gửi cơ quan thuế, hủy/điều chỉnh đứng đầu; tra cứu và quản lý danh mục xếp sau.
- Tích hợp bên ngoài (nhà cung cấp ký số, hệ thống thuế): môi trường sandbox, giả lập khi bên ngoài lỗi hoặc chậm.
- Tải 30.000 hóa đơn/ngày: kiểm thử hiệu năng ở thời điểm cao điểm, không chỉ trung bình.
- Chức năng dùng chung dữ liệu → xác định phạm vi hồi quy.
- Có **điều kiện bắt đầu** (bản build ổn định, môi trường sẵn sàng, dữ liệu kiểm thử) và **điều kiện kết thúc / release** (không còn lỗi nghiêm trọng mở ở luồng cốt lõi, rủi ro còn lại được chấp nhận bằng văn bản).
- **Không đánh đồng chạy hết Test Case với đảm bảo chất lượng.**
- Khi thiếu thời gian: TESTER **không tự quyết** release — báo rõ cái đã kiểm, cái chưa kiểm, rủi ro còn lại; người có thẩm quyền (PO/PM) quyết.

**Câu hỏi đào sâu:** Ngày thứ 4 phát hiện lỗi nghiêm trọng ở ký số, DEV cần 2 ngày để sửa — em làm gì?

| Mức | Tín hiệu |
|---|---|
| 1 | Kiểm thử tuần tự từng chức năng, cố chạy hết Test Case |
| 3 | Có ưu tiên chức năng cốt lõi, biết kiểm thử hồi quy và tiêu chí release |
| 5 | Ưu tiên theo rủi ro có lý do, tính đến tích hợp ngoài và tải, nêu rõ rủi ro còn lại và ai quyết release |

## Câu 4. Truy vết lỗi không thể tái hiện

**Mục tiêu:** phân biệt TESTER có kinh nghiệm thực chiến với người chỉ quen kiểm thử theo Test Case. **Yêu cầu ví dụ thật.**

**Điểm cần nghe:**
- **Không kết luận "không có lỗi" vì không tái hiện được.**
- Thu thập: thời điểm chính xác, mã hóa đơn, tài khoản, thao tác trước đó, ảnh chụp thông báo thành công, cách tra cứu (bộ lọc, khoảng ngày).
- Giả thuyết và cách kiểm chứng:
  - Giao diện báo thành công khi **mới gửi message**, chưa xử lý xong → đối chiếu thời điểm báo thành công với trạng thái thật trong DB.
  - Message được publish nhưng không được consume / xử lý lỗi / retry hết / vào Dead Letter Queue → kiểm tra hàng đợi và log consumer.
  - Dữ liệu đã có nhưng tra cứu không thấy (độ trễ đồng bộ, lệch múi giờ, bộ lọc, phân quyền) → truy vấn trực tiếp theo mã hóa đơn.
- Phân biệt **mất dữ liệu**, **lệch trạng thái** và **lỗi hiển thị**.
- Đề xuất: ID xuyên suốt các service, lưu lịch sử chuyển trạng thái, cảnh báo khi message vào Dead Letter Queue.

**Câu hỏi đào sâu:** Giả thuyết nào em kiểm chứng đầu tiên, vì sao? Kết quả nào khiến em loại bỏ nó?

| Mức | Tín hiệu |
|---|---|
| 1 | Thử lại vài lần, không thấy lỗi thì báo không tái hiện được |
| 3 | Thu thập log và dữ liệu, nêu được vài nguyên nhân có thể |
| 5 | Điều tra theo giả thuyết có thứ tự, có cách loại trừ, đề xuất được thay đổi để truy vết lần sau |

## Câu 5. Kiểm thử hệ thống xử lý bất đồng bộ

**Mục tiêu:** khả năng kiểm thử hệ thống phân tán.

**Điểm cần nghe:**
- Hiểu **dữ liệu nhất quán dần** (eventual consistency): kết quả không có ngay, cần kiểm tra theo thời gian.
- Message có thể đến **nhiều hơn một lần** → mỗi consumer phải xử lý trùng an toàn (idempotency); kiểm thử bằng cách gửi lại cùng một event, kiểm tra tồn kho chỉ bị trừ một lần, email chỉ gửi một lần.
- Consumer dừng giữa chừng: tắt consumer khi đang xử lý, bật lại, kiểm tra không mất và không xử lý đôi.
- Notification lỗi nhưng kho thành công: đơn hàng **vẫn thành công** về nghiệp vụ, nhưng cần cơ chế gửi lại và theo dõi — thành công không có nghĩa là bỏ qua.
- Retry và Dead Letter Queue: số lần retry, khoảng cách giữa các lần, ai được báo khi message vào DLQ, cách xử lý lại.
- **Không chỉ kiểm tra kết quả cuối** mà kiểm tra cả quá trình chuyển trạng thái.

**Câu hỏi đào sâu:** Kế toán nhận event trước khi kho trừ xong — có vấn đề gì không?

| Mức | Tín hiệu |
|---|---|
| 1 | Kiểm thử như hệ thống đồng bộ, chỉ xem kết quả cuối |
| 3 | Biết event trùng và lỗi consumer, có tình huống kiểm thử cho từng trường hợp |
| 5 | Kiểm thử cả quá trình, phân biệt thành công nghiệp vụ với thành công từng bước, có cách kiểm thử retry/DLQ cụ thể |

## Câu 6. Kiểm thử API và xử lý tình huống đồng thời

**Mục tiêu:** thiết kế kiểm thử API có tính đến tình huống thực tế.

**Điểm cần nghe:**
- Đầu vào: số tiền 0, âm, rất lớn, sai kiểu, lệch với giá trị đơn; mã đơn không tồn tại, đã hủy, đã thanh toán; phương thức không hỗ trợ; thiếu trường — có lý do chọn từng giá trị (giá trị biên, phân lớp tương đương, kiểm thử âm), không liệt kê đại trà.
- Đồng thời: bắn hai request song song bằng công cụ, kiểm tra chỉ một giao dịch thành công.
- **Phân biệt timeout phía client với thất bại thật của giao dịch phía server** — đây là điểm phân loại chính.
- Cổng đã trừ tiền mà API không nhận phản hồi: giả lập cổng trả chậm / không trả; kỳ vọng hệ thống không trừ lần hai khi client retry, và có cơ chế đối soát lấy lại trạng thái.
- Xác minh không thu trùng: đối chiếu giao dịch phía hệ thống với dữ liệu phía cổng thanh toán, không chỉ đọc phản hồi API.
- Hiệu năng: thời gian phản hồi theo phân vị cao, tỉ lệ lỗi, thông lượng; giả lập cổng ngoài để không tải lên hệ thống thật.

**Câu hỏi đào sâu:** Client retry đúng lúc request đầu vẫn đang xử lý ở server — điều gì nên xảy ra?

| Mức | Tín hiệu |
|---|---|
| 1 | Chỉ kiểm thử trường hợp hợp lệ và vài trường hợp sai định dạng |
| 3 | Có giá trị biên, kiểm thử âm, nghĩ tới request đồng thời |
| 5 | Tách timeout với thất bại thật, có cách xác minh không thu trùng qua đối soát, kiểm thử tải có chỉ số và ngưỡng |

## Câu 7. Kiểm thử khi triển khai phiên bản mới

**Mục tiêu:** tham gia quy trình release thực tế. **Yêu cầu ví dụ thật.**

**Điểm cần nghe:**
- Trước deploy: chạy thử migration trên bản sao dữ liệu thật, đo thời gian so với giới hạn 5 phút; kiểm thử hồi quy luồng đặt hàng và thanh toán; kiểm tra phương án khôi phục.
- Trường bắt buộc mới: dữ liệu cũ được điền gì? Bản ghi tạo từ client cũ có bị từ chối?
- Tương thích: client đang dùng V1 (app chưa cập nhật) có còn chạy không; frontend deploy sau backend → có khoảng thời gian frontend cũ gọi backend mới.
- Đối chiếu dữ liệu trước/sau migration: số lượng bản ghi, tổng giá trị, mẫu ngẫu nhiên các bản ghi đặc biệt.
- Kiểm tra nhanh sau deploy: đăng nhập, xem đơn, tạo đơn, thanh toán, kiểm tra log lỗi — theo thứ tự rủi ro.
- Lỗi nghiêm trọng: báo ngay kèm bằng chứng, tham gia đánh giá mức ảnh hưởng; **rollback** khi ảnh hưởng rộng / dữ liệu đang bị ghi sai / chưa rõ nguyên nhân; **hotfix** khi phạm vi hẹp, nguyên nhân rõ, sửa nhanh và an toàn. Nhận ra rollback **khó khi migration đã ghi dữ liệu**.

**Câu hỏi đào sâu:** Rollback code nhưng migration đã chạy — dữ liệu mới ghi trong 30 phút đó xử lý thế nào?

| Mức | Tín hiệu |
|---|---|
| 1 | Chỉ kiểm thử chức năng mới sau deploy |
| 3 | Có hồi quy, kiểm tra nhanh sau deploy, nghĩ tới tương thích V1/V2 |
| 5 | Kiểm thử migration trên dữ liệu thật, thấy khoảng lệch thứ tự deploy, có tiêu chí rõ giữa rollback và hotfix |

## Câu 8. Điều tra lỗi trên production với quyền hạn hạn chế

**Mục tiêu:** kinh nghiệm vận hành và phối hợp liên phòng ban. **Yêu cầu ví dụ thật.**

**Điểm cần nghe:**
- Khai thác log và dashboard: lấy thời điểm khách báo, tìm request tương ứng, **đối chiếu log giữa các service** theo thời gian và ID request.
- Giả thuyết cho "lâu rồi lỗi, làm lại thì được": DB bị khóa hoặc hết kết nối, Redis chậm, hàng đợi ứ, pod khởi động lại hoặc thiếu tài nguyên, timeout ở gateway ngắn hơn ở backend.
- Khoanh vùng: thời gian xử lý từng tầng trên dashboard, lỗi timeout xuất hiện ở tầng nào trước, có trùng thời điểm với cao điểm tải hoặc deploy không.
- Cho DevOps/SRE: khoảng thời gian, ID request, service nghi ngờ, log đã tìm thấy, giả thuyết và **yêu cầu cụ thể** (xem sự kiện pod, chỉ số kết nối DB…).
- Escalate khi: ảnh hưởng nhiều người dùng, có dấu hiệu sai dữ liệu, hoặc hết khả năng kiểm chứng với quyền hiện có.
- **Không tự ý thao tác** có thể ảnh hưởng production.
- Sau khi sửa: xác nhận trên production, theo dõi một thời gian, bổ sung kịch bản vào bộ hồi quy, đóng lỗi kèm bằng chứng.

**Câu hỏi đào sâu:** DevOps bận, em chỉ được hỏi họ đúng một câu — em hỏi gì?

| Mức | Tín hiệu |
|---|---|
| 1 | Báo lỗi cho DEV/DevOps, chờ họ xử lý |
| 3 | Biết tìm log, nêu được vài nguyên nhân, cung cấp thông tin cơ bản |
| 5 | Đối chiếu log nhiều service, khoanh vùng có phương pháp, yêu cầu cụ thể khi escalate, có quy trình xác nhận sau sửa |

---

## Ma trận năng lực

Dùng để tổng hợp nhận xét sau buổi phỏng vấn (không thay cho điểm từng câu).

| Năng lực | Mức 1 | Mức 3 | Mức 5 |
|---|---|---|---|
| Tư duy phân tích | Chỉ kiểm tra theo yêu cầu | Phân tích được các trường hợp ngoại lệ | Phát hiện lỗ hổng nghiệp vụ chưa được mô tả |
| Tư duy hệ thống | Chỉ hiểu từng chức năng | Hiểu luồng liên kết giữa các thành phần | Nhận diện được lỗi tương tác và tác động dây chuyền |
| Tư duy kiến trúc | Chỉ biết kiểm thử UI/API | Hiểu API, DB, hàng đợi | Hiểu hệ thống phân tán và vấn đề nhất quán dữ liệu |
| Tư duy truy vết | Thử lại và báo lỗi | Thu thập log, phân tích nguyên nhân | Điều tra theo giả thuyết, có phương pháp loại trừ |
| Vận hành thực chiến | Chỉ kiểm thử trên môi trường Test | Biết tham gia hồi quy / release | Có kinh nghiệm điều tra và xác nhận lỗi production |

**Góc nhìn DEV và TESTER trên cùng năng lực** — để thống nhất tiêu chuẩn với đề DEV:

| Năng lực | DEV cần thể hiện | TESTER cần thể hiện |
|---|---|---|
| Tư duy hệ thống | Hiểu và xây dựng các thành phần | Phát hiện lỗi tương tác giữa các thành phần |
| Tư duy phân tích | Phân tích nguyên nhân, thiết kế giải pháp | Phân tích nghiệp vụ, phát hiện lỗ hổng |
| Tư duy kiến trúc | Đánh giá và thiết kế kiến trúc | Đánh giá khả năng kiểm thử, rủi ro kiến trúc |
| Tư duy truy vết | Debug, tìm nguyên nhân gốc | Xây dựng giả thuyết, thu hẹp phạm vi lỗi |
| Vận hành thực chiến | Xử lý sự cố kỹ thuật | Kiểm soát chất lượng, xác nhận hệ thống sau xử lý |

## Phân loại kết quả

| Tổng điểm | Đánh giá | Nhận định |
|---|---|---|
| 85–100 | Strong Mid | Phân tích, kiểm soát chất lượng và xử lý tình huống độc lập |
| 70–84 | Mid | Nền tảng tốt, xử lý được phần lớn tình huống thực tế |
| 55–69 | Junior+ / Mid- | Có kiến thức nhưng tư duy hệ thống và truy vết còn hạn chế |
| Dưới 55 | Chưa đạt Mid | Chủ yếu làm theo quy trình và Test Case có sẵn |

## Phụ lục — vị trí QC Automation

Nếu vị trí yêu cầu xây dựng framework kiểm thử tự động, dùng **bài thực hành riêng**, không trộn vào 8 câu tư duy trên. Chấm tư duy tự động hóa 1–5 riêng: 1 = chỉ biết dùng tool · 3 = tự xây được bộ kiểm thử tự động · 5 = thiết kế được framework, chọn phạm vi tự động hóa và đánh giá được hiệu quả.

| Chủ đề | Nội dung đánh giá |
|---|---|
| Kiến trúc framework | Thiết kế cấu trúc framework kiểm thử tự động |
| Tự động hóa API | Framework kiểm thử REST API |
| Tự động hóa UI | Tổ chức Page Object Model |
| Dữ liệu kiểm thử | Quản lý dữ liệu, dữ liệu độc lập giữa các lần chạy |
| Tích hợp CI/CD | Đưa kiểm thử tự động vào pipeline |
| Báo cáo | Báo cáo kết quả, phân tích lỗi, xử lý test chập chờn (flaky) |
| Bảo trì | Khả năng bảo trì và mở rộng framework |

### Đề Automation 3 câu

Đề phát cho ứng viên: [de-phong-van-tester.md](de-phong-van-tester.md). Câu 1 và câu 2 trùng **Câu 1** và **Câu 6** của bộ 8 câu — chấm theo các mục tương ứng phía trên. Câu 3 chấm theo mục dưới đây.

**Cách tính điểm:** mỗi câu 1–5, ba câu trọng số bằng nhau. Tổng = (điểm câu 1 + câu 2 + câu 3) / 15 × 100, phân loại theo [bảng chung](#phân-loại-kết-quả). Thời lượng gợi ý: 10 phút mỗi câu 1, 2 và 20–25 phút cho câu 3.

#### Câu 3. Thiết kế cấu trúc dự án automation test

**Mục tiêu:** khai thác ba năng lực — tổ chức test case không lặp, chọn phạm vi và chiến lược khi chạy, lưu và khai thác kết quả qua nhiều lần chạy. Đề bài cố ý chỉ mô tả **vấn đề**, không gợi cơ chế; ứng viên tự đề xuất.

**Điểm cần nghe — (1) Tổ chức test case không lặp:**
- Nhận ra **loại kiểm thử là thuộc tính của test case, không phải vị trí của nó**: giữ thư mục theo chức năng như hiện tại, gắn functional / regression / smoke bằng nhãn trên test case (tag, category, marker, group — tùy framework). Tín hiệu xấu: đề xuất thêm thư mục `smoke/`, `regression/` rồi copy hoặc di chuyển test case vào — sinh ra đúng vấn đề lặp mà đề cấm.
- Một test case mang nhiều nhãn; smoke thường là tập con của regression — chọn những luồng chính.
- Thêm nhãn ngoài loại kiểm thử: module, mức ưu tiên, tầng (API / UI), mã yêu cầu hoặc mã lỗi liên quan để truy vết.
- Tách lớp: test case · thao tác dùng chung (page object, API client) · dữ liệu kiểm thử · cấu hình môi trường. Test case không chứa URL, tài khoản, dữ liệu cứng.
- Có quy ước bắt buộc khi thêm test case mới (thiếu nhãn thì không được merge), lý tưởng là kiểm bằng review hoặc pipeline chứ không chỉ dựa kỷ luật.

**Điểm cần nghe — (2) Chọn phạm vi và chiến lược khi chạy:**
- Phạm vi chọn qua **bộ lọc theo nhãn** khi chạy (loại, module, ưu tiên, tầng), kết hợp được (ví dụ: regression **và** module Thanh toán).
- Môi trường chọn qua cấu hình, không sửa code.
- Chiến lược chạy: song song hay tuần tự, số luồng, chạy lại test lỗi bao nhiêu lần, dừng sớm khi luồng chính hỏng, thứ tự theo ưu tiên.
- Gói thành **cấu hình chạy có tên** (kiểm tra sau deploy, hồi quy trước release, chạy đêm) để không phải nhớ tham số; pipeline nhận tham số khi kích hoạt thủ công.
- Phân biệt cái chọn khi chạy (phạm vi, môi trường, số lần chạy lại) với cái cố định trong dự án (quy ước nhãn, cấu trúc lớp, ngưỡng timeout chung).

**Điểm cần nghe — (3) Lưu và khai thác kết quả:**
- Kết quả xuất ra **định dạng có cấu trúc** (JUnit XML, JSON…), không chỉ log chữ.
- Mỗi lần chạy lưu kèm thông tin ngữ cảnh: bản build / commit, môi trường, cấu hình chạy, ai hoặc cái gì kích hoạt, thời điểm, thời gian chạy từng test.
- Lưu ở nơi tồn tại lâu dài và truy vấn được (công cụ báo cáo có lịch sử, kho lưu trữ, cơ sở dữ liệu), không phụ thuộc log pipeline.
- Thống kê: xu hướng tỉ lệ đạt, test **mới lỗi** so với lỗi đã biết, test chập chờn (lúc đạt lúc không trên cùng bản build), xu hướng thời gian chạy, test chạy chậm nhất.
- Dùng số liệu để **ra quyết định**: cách ly test chập chờn, chặn release khi luồng chính lỗi mới, tối ưu test chậm, xác định bản build gây lỗi.

**Điểm cần nghe — chuyển đổi:** không đập đi làm lại; cách chạy toàn bộ hiện tại vẫn giữ nguyên trong lúc chuyển. Gắn nhãn dần theo chức năng, ưu tiên chọn bộ smoke trước (luồng chính, ít test, lợi ích thấy ngay); việc chọn test nào vào smoke / regression cần thống nhất với người nắm nghiệp vụ, không để mỗi người tự gắn. Test chưa có nhãn được phát hiện tự động (báo cáo hoặc pipeline cảnh báo) để không bị sót.

**Câu hỏi đào sâu:**
- Test case "thanh toán thành công" cần chạy trong cả smoke lẫn regression nhưng smoke chỉ cần kiểm tra nhanh, regression cần kiểm tra kỹ — em tổ chức thế nào để vẫn không lặp?
- Một test lỗi 3 trên 10 lần chạy gần nhất — em làm gì với nó? Dữ liệu nào giúp em quyết định?
- Hai lần chạy song song dùng chung dữ liệu kiểm thử thì sao?

| Mức | Tín hiệu |
|---|---|
| 1 | Tạo thêm thư mục theo loại kiểm thử và copy test case vào; vẫn chạy toàn bộ; kết quả xem trên log |
| 3 | Đề xuất gắn nhãn và lọc khi chạy, có tách cấu hình môi trường, lưu báo cáo mỗi lần chạy |
| 5 | Tách loại kiểm thử khỏi vị trí, có cấu hình chạy có tên và chiến lược chạy, lưu kết quả kèm ngữ cảnh, dùng thống kê để ra quyết định, có kế hoạch chuyển đổi dần |
