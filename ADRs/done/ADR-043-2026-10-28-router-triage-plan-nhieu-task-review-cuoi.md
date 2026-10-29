# Router: việc phức thì lập kế hoạch có tiêu chí đo được, task độc lập chạy song song, mỗi task tự kiểm tối đa 3 lần, review cuối người ký

| | |
|---|---|
| **Ngày** | 2026-10-28 |
| **Trạng thái** | 🟢 **Done 2026-10-29** — Q1–Q12 chốt, §7 bước 1–9 thi hành, T4–T6 xanh (629/629 · `gen:check` · `link:check` 0 MỚI), smoke T1–T3 + T7–T11 chủ repo xác nhận cùng ngày. Chuyển `done/` 2026-10-29 |
| **Phạm vi** | Pack `router/`: bước triage trong [minipower-router](../../src/router/skills/minipower-router/SKILL.md) · lá mới `minipower-router-plan` · khuôn kế hoạch `TPL-plan.md` (có tiêu chí hoàn thành, điều kiện cần, phụ thuộc) · bộ tiêu chí cơ bản dùng chung · hàm `matchIntents` · các chỗ đang viết "một lá / phiên", "không spawn" |
| **Ngoài phạm vi** | Agent tự bàn giao agent (vẫn cấm theo ADR-022 QĐ-1) · viết lá `*-review` cho pack chưa có · hook máy chấm "phức/đơn" hay chấm tiêu chí · đổi `rules.json` · lưu kế hoạch vào DB `.minipower/` |
| **Nối tiếp** | [ADR-034](ADR-034-2026-09-26-minipower-marker-always-on-dispatch.md) QĐ-5 "kế hoạch rồi người điều phối" — ADR này là SOP thi hành · [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) QĐ-1 "atomic" được điều chỉnh · [ADR-020](../todo/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-11/13/14 gate mềm, review thuộc pack, pipeline theo module · [parallel-work](../../src/router/docs/parallel-work.md) fan-out theo module · Ba ADR đã huỷ cùng chủ đề: [ADR-003](../cancel/ADR-003-2026-07-20-minipower-gated-fanout-execution.md) · [ADR-009](../cancel/ADR-009-2026-07-25-minipower-orchestrator-analysis.md) · [ADR-013](../cancel/ADR-013-2026-07-26-minipower-senior-junior-execution.md) — xem §0 vì sao không lặp lại |
| **Mục đích** | Ghi lại: khi nào router đi thẳng, khi nào lập kế hoạch; kế hoạch phải có gì để người duyệt được; task độc lập chạy song song ra sao; agent tự kiểm và tự sửa được tới đâu; review cuối ở đâu |
| **Ảnh hưởng** | `src/router/skills/minipower-router/` · `src/router/skills/minipower-router-plan/` (mới) · `src/router/templates/TPL-plan.md` (mới) · `src/router/lib/intent-dispatch.js` · `src/router/rules/dispatch.md` · `cli/cursor/rules/minipower-always-on.mdc` · `src/router/docs/router-and-skills.md` · `src/router/docs/parallel-work.md` · `src/router/README.md` · `README.md` gốc · `AGENTS.md` · test `minipower-catalog.test.js`, `intent-dispatch.test.js`, `router-plan.test.js` (mới) · ADR-033 thêm mục Điều chỉnh |

---

## §0. Tóm tắt một trang

**Hôm nay** router chọn đúng **một** skill cho cả yêu cầu. Yêu cầu cần hai, ba skill thì hoặc một skill làm hộ việc của skill khác, hoặc phần việc bị rơi, hoặc người phải tự cắt thành nhiều prompt.

**Sau ADR này** router làm bốn việc:

1. **Triage** — hỏi *"một skill có phủ trọn yêu cầu không?"* Có thì đi thẳng như cũ. Không thì lập kế hoạch.
2. **Kế hoạch** — mỗi task có **mô tả, skill, điều kiện cần, tiêu chí hoàn thành đo được, phụ thuộc**. Dòng cuối luôn là review. Người đọc, sửa tiêu chí, OK.
3. **Chạy** — task phụ thuộc nhau chạy tuần tự trong agent chính. Task độc lập **chia cho các agent chạy song song**. Mỗi agent **tự kiểm theo tiêu chí** của task mình, chưa đạt thì tự sửa **tối đa 3 lần**, vẫn không đạt thì dừng và **báo cáo các cách đã thử kèm kết quả**.
4. **Review cuối** — lá `*-review` của pack soi tổng thể. Còn lỗi thì chuyển về đúng task, sửa, review lại, tối đa 3 vòng. **Người ký PASS.**

```text
yêu cầu ──► triage ──┬── ĐƠN ──► một skill ──► xong
                     └── PHỨC ──► kế hoạch (mô tả · tiêu chí · điều kiện · phụ thuộc)
                                   ──► người OK
                                   ──► task phụ thuộc: tuần tự      ┐ mỗi task: làm → tự kiểm
                                   ──► task độc lập: agent song song ┘ theo tiêu chí ≤ 3 lần
                                   ──► tổng hợp ──► review (*-review) ──► còn lỗi? sửa ≤ 3 vòng
                                   ──► người ký PASS
```

**Cái gì không đổi:** mỗi agent mỗi lúc mở một skill · thông báo trước khi đọc SOP · thao tác ra ngoài (MCP, Git, baseline) luôn hỏi người · agent song song **báo về agent chính**, không bàn giao cho nhau · chữ ký cuối là của người.

**Vì sao không lặp lại ba ADR đã huỷ:** ADR-003 và ADR-013 bị huỷ vì đặt **cổng máy khoá**; ADR-009 vì hướng tới **orchestrator** tự điều phối, agent tự bàn giao. Ở đây kế hoạch và tiêu chí là **tờ giấy người duyệt** trước khi chạy; song song là **fan-out có đích về**; mọi vòng tự sửa có trần, có nhật ký; không hook nào chặn; kết thúc bằng chữ ký người. Đây là ranh giới duy nhất, các mục sau chỉ dẫn về đây, không nhắc lại.

---

## §1. Bối cảnh

Đọc repo ngày 2026-10-28:

- Router, `rules/dispatch.md` và rule always-on đều viết *"chọn đúng một lá"*, *"một phiên một pack"*, *"không spawn"*.
- Router có **một dòng** cho việc nhiều bước: *"kế hoạch, chờ người OK rồi mới làm"*. Không khuôn, không tiêu chí, không review.
- ADR-034 QĐ-5 đã chốt "soạn kế hoạch (thứ tự pack/skill, I/O, gate), cấm thực thi trước khi người OK". Chưa có SOP thi hành.
- AGENTS.md đã cho phép **fan-out**: *"harness fan-out 1 subagent / chiều hoặc / module, context sạch; agent chính dedup finding"* — nhưng chỉ nói cho review, chưa nói cho thực thi task.
- `matchIntent` trả **một** skill. Prompt chạm hai skill thì cái thứ hai bị nuốt.
- Catalog **55 lá**. Lá `*-review` có ở 6/15 pack.

Ma sát thực tế: *"thêm module Tenants: viết FR, cập nhật SAD, scaffold .NET rồi test"* chạm 3–4 skill ở 2–3 pack. Router chọn một. Phần còn lại không có chủ. Và khi AI làm xong, người không có **tiêu chí** nào để biết "xong" nghĩa là gì ngoài đọc lại từ đầu.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Một yêu cầu chỉ được một skill | Skill làm hộ pack khác, hoặc việc bị rơi, hoặc người tự cắt prompt |
| P2 | "Kế hoạch" không có khuôn | Mỗi phiên một kiểu; không soi được task nào dùng skill nào |
| P3 | Task không có **tiêu chí hoàn thành đo được** | "Xong" là cảm tính của AI; người phải đọc lại toàn bộ để biết đạt chưa |
| P4 | Không ghi **điều kiện cần** và **phụ thuộc** | Task chạy khi chưa đủ đầu vào; task độc lập vẫn chạy tuần tự vì không biết là độc lập |
| P5 | Không có tiêu chí "có cần kế hoạch không" | Việc nhỏ bị hỏi kế hoạch; việc lớn nhảy thẳng vào skill đầu |
| P6 | Review không được đặt lịch; lỗi nhỏ vẫn phải qua tay người | Không ai soi tổng thể; người thành người chuyển việc |
| P7 | `matchIntent` trả một skill | Không có tín hiệu máy rẻ cho triage, không test vàng được |
| P8 | 9/15 pack không có lá review | Task review không có skill để gọi |

## §3. Ràng buộc — những điều không mở lại

| # | Ràng buộc | Nguồn |
|---|---|---|
| C1 | **Không agent tự bàn giao agent.** Agent song song nhận task từ agent chính, làm xong **báo về** agent chính. Không agent nào gọi agent khác, không tự mở task kế | ADR-022 QĐ-1, ADR-034 C1 |
| C2 | Chọn skill là việc của LLM. Keyword chỉ gợi ý và test vàng | ADR-034 QĐ-4 |
| C3 | "Cứng bằng máy, mềm bằng lời". Verdict đơn/phức, tiêu chí đạt chưa, review PASS/BLOCK là ngữ nghĩa → **không hook nào chặn**. Máy chỉ kiểm định dạng kế hoạch | ADR-020 QĐ-3/4 |
| C4 | Mỗi agent mỗi lúc mở một skill (atomic). Đơn vị atomic đổi từ *phiên* sang *task* | ADR-033, ADR-034 QĐ-5 |
| C5 | Review dùng lá `*-review` của pack nghề. Router không viết tiêu chí review | ADR-020 QĐ-13 |
| C6 | Mọi vòng tự sửa **không phải cổng máy khoá**: có trần, có điều kiện dừng, có nhật ký, nằm trong kế hoạch đã OK. PASS cuối do người ký | §0 |
| C7 | Song song chỉ cho task **độc lập** (không phụ thuộc nhau, không ghi cùng file). Một module một owner | parallel-work, ADR-020 QĐ-14 |
| C8 | Không thêm bảng sinh tự động. Tiêu chí, khuôn kế hoạch là lời + template | Rules-as-data |
| C9 | Lá mới single-purpose, ≤ 150 dòng. Router đang 122 dòng | ADR-026 |
| C10 | Phân tầng micro/light/full và `project_mode` không đổi | — |

## §4. Phương án

| # | Phương án | Vì sao chọn / không chọn | |
|---|---|---|---|
| O1 | Giữ nguyên, người tự cắt yêu cầu | Dựa vào kỷ luật người | ❌ |
| O2 | Triage → kế hoạch có tiêu chí → người OK → tuần tự + song song có đích về → tự kiểm ≤ 3 → review ≤ 3 vòng → người ký | Phủ hết yêu cầu; "xong" đo được; người giữ tay lái ở kế hoạch, tiêu chí và chữ ký cuối | ✅ |
| O3 | Orchestrator: agent tự chia việc, tự bàn giao, tự chạy hết, không tiêu chí người duyệt | Trái C1, lặp lại ADR-003/009 | ❌ |
| O4 | Hook máy chấm đơn/phức hoặc chấm tiêu chí rồi tự quyết | Ngữ nghĩa, hook chỉ nhìn bề mặt. Giữ phần gợi ý (`matchIntents`) | ❌ |
| O5 | Nhồi triage + kế hoạch vào lá router | Vỡ ngưỡng 150 dòng | ❌ |
| O6 | Song song nhưng **không** tự kiểm; mọi lỗi dồn về review cuối | Review cuối phình to; lỗi rẻ phải đợi tới cuối mới thấy | ❌ |

## §5. Quyết định

| # | Quyết định một dòng |
|---|---|
| QĐ-1 | Router thêm bước **triage**: ĐƠN đi thẳng, PHỨC mở lá plan. Không chắc → PHỨC |
| QĐ-2 | Lá mới **`minipower-router-plan`**: lập kế hoạch, trình người, điều phối. Không thực thi hộ |
| QĐ-3 | Kế hoạch theo khuôn **`TPL-plan.md`**: mỗi task có mô tả · skill · điều kiện cần · **tiêu chí hoàn thành đo được** · output · gate · phụ thuộc |
| QĐ-4 | **Tiêu chí hoàn thành**: bộ cơ bản dùng chung + tiêu chí riêng từng task; AI gợi ý thêm, người duyệt cùng kế hoạch |
| QĐ-5 | Task **độc lập** chia cho **agent song song** (fan-out có đích về); task phụ thuộc chạy tuần tự ở agent chính |
| QĐ-6 | Mỗi agent **tự kiểm theo tiêu chí** của task, tự sửa **tối đa 3 lần**, không đạt thì dừng và báo cáo các cách đã thử |
| QĐ-7 | Task cuối luôn là **review** bằng lá `*-review` của pack; còn finding → **sửa tối đa 3 vòng**; PASS cuối người ký |
| QĐ-8 | Thêm **`matchIntents`** — tín hiệu gợi ý và test vàng |
| QĐ-9 | Sửa lời **"một lá / phiên" → "một lá / task"** và **"không spawn" → "không agent bàn giao agent"** ở mọi chỗ, cùng một đợt; ADR-033 nhận mục Điều chỉnh |
| QĐ-10 | **Test canh định dạng**: template đủ mục, skill trong ví dụ là thật, tiêu chí có dạng đo được, có review cuối, trần 3 |

### 5.1 Triage: đơn hay phức (QĐ-1)

Trước khi chọn skill, router tự hỏi: **một skill trong catalog có phủ trọn yêu cầu không?**

- Có → **ĐƠN**. Làm như hôm nay: thông báo `Sẽ chạy minipower-… để xử lý …`, đọc SOP, làm.
- Không → **PHỨC**. Mở `minipower-router-plan`.

Dấu hiệu PHỨC (gặp một là đủ):

| | Dấu hiệu | Ví dụ |
|---|---|---|
| a | Chạm ≥ 2 capability hoặc ≥ 2 pack | FR (analyst) + code (backend) |
| b | Có từ nối chuỗi | *rồi · sau đó · và review · cuối cùng · xong thì* |
| c | Đầu ra là ≥ 2 artifact khác loại | DOC + code |
| d | Đã là tầng Full | module mới, DOC mới, đụng baseline |
| e | `matchIntents` gợi ý ≥ 2 skill | xem 5.8 |

**Không chắc thì chọn PHỨC.** Kế hoạch ba dòng rẻ hơn bỏ sót một skill. Người gạt bằng *"không cần plan"* → router đi thẳng skill đầu và nhắc phần việc còn lại.

### 5.2 Lá mới `minipower-router-plan` (QĐ-2)

Một lá, một việc: nhận yêu cầu PHỨC → sinh kế hoạch theo khuôn → trình người → sau OK, điều phối: giao task độc lập cho agent song song, tự chạy task phụ thuộc theo thứ tự, tổng hợp, gọi review.

Trong lúc lập kế hoạch, lá **chỉ đọc** `name:` và `description` của catalog cùng bảng I/O trên `PACK.md`. Không mở SOP skill nghề nào. Không sinh DOC. Sau OK, mỗi task là một lượt dispatch như 5.1, thêm nhãn `(task n/N)`.

Catalog 55 → 56 lá.

### 5.3 Khuôn kế hoạch `TPL-plan.md` (QĐ-3)

Kế hoạch gồm **một bảng tổng quan** để nhìn thứ tự và phụ thuộc, rồi **một khối chi tiết cho mỗi task**.

**Bảng tổng quan** — một task một dòng:

| Cột | Nghĩa |
|---|---|
| `#` | Số thứ tự |
| Việc | Một câu |
| Lá | Đúng `name:` catalog, không bịa |
| Module | `{MOD}` nếu có |
| Phụ thuộc | Task phải xong trước. `—` nếu không |
| `∥` | Đánh dấu task độc lập, chạy song song được (xem 5.5) |
| Gate | Một trong bốn giá trị dưới |

**Khối chi tiết** — mỗi task bắt buộc có đủ bốn mục người dùng yêu cầu, cộng ba mục kỹ thuật:

| Mục | Nghĩa | Bắt buộc |
|---|---|---|
| **Mô tả** | Làm gì, trên vùng nào, cho ai | ✅ |
| **Điều kiện cần** | Phải có gì **trước** khi bắt đầu mới đạt được hết tiêu chí: DOC, ID, quyết định, quyền, dữ liệu. Thiếu → ghi rõ ai cấp, hoặc task không khởi động | ✅ |
| **Tiêu chí hoàn thành** | Checklist, mỗi dòng **đo được** (5.4). Đây là thứ agent tự kiểm và review đối chiếu | ✅ |
| **Phụ thuộc** | Task nào, và cần **cái gì** từ task đó (ID, file, quyết định) — không chỉ số thứ tự | ✅ |
| Input tối thiểu | Từ bảng I/O trên `PACK.md` | ✅ |
| Output | Artifact hoặc ID sinh ra | ✅ |
| Gate | `—` · `readiness` · `⏸ người` · `review` | ✅ |

Bốn giá trị **Gate** để người nhìn kế hoạch là biết AI sẽ dừng ở đâu:

| Gate | Nghĩa |
|---|---|
| `—` | Soạn nháp, phân tích. Chạy sau khi người OK kế hoạch |
| `readiness` | Task thực thi đầu tiên của một intent có tiền đề. Gọi [minipower-router-readiness](../../src/router/skills/minipower-router-readiness/SKILL.md), hỏi thiếu sót **một lượt** |
| `⏸ người` | Dừng bắt buộc: MCP ghi ra ngoài, Git, ghi `02-baseline/`, ghi DOC cuối ở Full |
| `review` | Task review, xem 5.7 |

Kế hoạch đi kèm một dòng tầng (micro/light/full) và mode từ `profile.json`. Kế hoạch **sống trên chat**, không ghi file DOC. Kéo dài nhiều phiên thì người quyết ghi `memory/memory.md` dạng checklist.

### 5.4 Tiêu chí hoàn thành: cơ bản dùng chung + riêng từng task (QĐ-4)

**Thế nào là đo được.** Một tiêu chí hợp lệ phải trả lời được **đúng / sai** bằng một kiểm tra cụ thể: file tồn tại ở đường dẫn X · đếm được N mục · lệnh Y chạy xanh · grep Z bằng 0 · mỗi ID dạng A có ít nhất một ID dạng B trỏ tới · người ký. Tiêu chí kiểu *"đầy đủ"*, *"rõ ràng"*, *"chất lượng tốt"* **không hợp lệ** — phải viết lại thành thứ đếm được. Cùng phép thử với AGENTS.md: *cái gì FAIL được khi làm sai?*

**Bộ cơ bản dùng chung** — nằm trong `TPL-plan.md`, mọi task kế thừa, không phải chép lại:

| # | Tiêu chí cơ bản | Cách kiểm |
|---|---|---|
| B1 | Output tồn tại đúng đường dẫn / đúng DOC đã khai | `ls`, mở file |
| B2 | ID theo hệ `{MOD}-{UC\|FR\|BR\|AC\|NFR}-NNN`, `DEC-`, `ADR-`; không trùng | `trace:check` không FAIL |
| B3 | Không còn `TBD` ở mục bắt buộc của template; `TBD` còn lại có chủ và hạn | grep `TBD` + đối chiếu |
| B4 | Cross-ref bằng ID, không copy nội dung FR giữa module | đọc chéo |
| B5 | Link markdown không gãy mới | `link:check` 0 MỚI |
| B6 | Đụng code: build / test / lint của repo đích xanh | lệnh của repo đích |
| B7 | Không ghi ra ngoài (MCP, Git, baseline) khi task không có Gate `⏸ người` | nhật ký task |

**Tiêu chí riêng** — viết tại từng task trong kế hoạch. Ví dụ task "viết FR cho TEN": *mỗi UC trong DOC-03 mục TEN có ≥ 1 FR* · *mỗi FR có ≥ 1 AC dạng Given/When/Then* · *FR Must ≥ 5, không FR nào thiếu trường Priority* · *`trace:check` 0 WARN cho module TEN*.

**AI gợi ý thêm.** Tiêu chí không cố định. Khi lập kế hoạch, AI đọc PACK.md và SOP cần dùng, **đề xuất tiêu chí riêng phù hợp hơn** cho từng task và ghi thẳng vào khối chi tiết. Người sửa, bớt, thêm, rồi OK cả kế hoạch lẫn tiêu chí **một lần**. Sau OK, tiêu chí là hợp đồng của task: agent tự kiểm theo đó, review đối chiếu theo đó. Giữa chừng thấy tiêu chí sai → agent **không tự sửa tiêu chí**, ghi vào nhật ký và trình người.

### 5.5 Chạy song song: fan-out có đích về (QĐ-5)

Sau khi người OK kế hoạch:

- Task có **Phụ thuộc** → agent chính chạy tuần tự, đúng thứ tự.
- Task đánh dấu **`∥`** (độc lập: không chờ task khác, không ghi cùng file, khác module hoặc khác artifact) → agent chính **giao mỗi task cho một agent con** chạy song song, context sạch, mang theo: mô tả · skill · điều kiện cần · tiêu chí · input.
- Agent con làm xong (hoặc dừng) → **báo về agent chính**: output, kết quả tự kiểm theo từng tiêu chí, nhật ký lần thử. Agent con **không** gọi agent khác, **không** mở task kế, **không** ghi ra ngoài.
- Agent chính **tổng hợp**: dedup finding theo `{DOC}#{section/ID}`, ghép trace, rồi mới sang task phụ thuộc kế hoặc review.

Đây là mở rộng luật fan-out đang có trong AGENTS.md từ review sang thực thi. Cơ chế spawn là của harness (Agent tool, subagent của client); Minipower chỉ định dạng **gói giao việc** và **gói báo về**, không viết runtime.

Task `∥` nhưng có Gate `⏸ người` → agent con làm tới điểm dừng, báo về, **agent chính** hỏi người. Không agent con nào hỏi người trực tiếp để tránh nhiều câu hỏi rời rạc.

### 5.6 Mỗi agent tự kiểm, tự sửa tối đa 3 lần (QĐ-6)

Áp dụng cho **mọi task**, tuần tự hay song song.

**Cơ chế.** Làm xong → đối chiếu từng tiêu chí (cơ bản + riêng) → ghi đạt / chưa. Có tiêu chí chưa đạt → tự sửa → kiểm lại. **Tối đa 3 lần thử** = lần làm đầu + 2 lần sửa (Q10 chốt 2026-10-29).

**Dừng và báo cáo** khi một trong bốn:

| | Điều kiện | Ghi chú |
|---|---|---|
| a | Hết 3 lần vẫn có tiêu chí chưa đạt | Trần |
| b | Agent thấy **không xử lý được**: thiếu điều kiện cần, ngoài phạm vi skill, cần quyết định nghiệp vụ, tiêu chí sai | Không gọi readiness trong vòng sửa (Q9) |
| c | **Hai lần liên tiếp cùng một cách xử lý** cho cùng tiêu chí | So cột *Cách* trong nhật ký. Phán đoán LLM |
| d | Sửa đòi ghi ra ngoài (`⏸ người`) hoặc đụng task khác | Dừng ngay, không tính lần |

**Báo cáo khi dừng** — bắt buộc, một bảng:

| Lần | Tiêu chí chưa đạt | Cách xử lý (một dòng) | Kết quả |
|---|---|---|---|
| 1 | *mỗi FR có ≥ 1 AC* — thiếu 3 | Viết AC cho 3 FR theo UC | còn 1 (FR-007 không có UC gốc) |
| 2 | *mỗi FR có ≥ 1 AC* — thiếu 1 | Suy AC từ mô tả FR-007 | còn 1 — AC mâu thuẫn BR-002 |
| 3 | như trên | Sửa AC theo BR-002 | **dừng — FR-007 vs BR-002 cần người quyết** |

Kèm: output hiện tại, tiêu chí đã đạt, tiêu chí còn lại, **đề xuất** cho người. Báo cáo này đi về agent chính (nếu là agent con) rồi lên người.

### 5.7 Review cuối và vòng sửa theo kế hoạch (QĐ-7)

Tự kiểm (5.6) là **từng task soi chính mình**. Review là **lá `*-review` của pack soi tổng thể** sau khi mọi task xong — hai tầng, cùng trần 3, cùng cách ghi nhật ký.

- Mọi kế hoạch **kết thúc bằng review**. Nhiều pack sinh artifact → mỗi pack một task review, đặt sau task sinh artifact của pack đó.
- Review trả **finding** có địa chỉ: `{DOC}#{section/ID}` hoặc `path:line`, và nêu tiêu chí nào của task nào bị vi phạm.
- Còn finding → AI chuyển về **đúng task** (đúng skill), sửa, review lại. Review đầu là vòng 0; mỗi lượt sửa + review lại là một vòng; **trần 3 vòng**. Bốn điều kiện dừng **giống 5.6**, thêm trường hợp finding **nằm ngoài kế hoạch** → dừng ngay, không tự thêm task. Nhật ký vòng: `Vòng · Finding · Task # · Lá · Cách xử lý · Kết quả`.
- 0 finding, hoặc vòng lặp dừng → trình người: nhật ký + finding còn lại + đề xuất. **Người ký PASS**, hoặc cho thêm vòng, hoặc tự sửa, hoặc chấp nhận nợ ghi `memory/doc-debt.md` / `open-questions.md`.
- Pack chưa có lá review: task review ghi `Lá: (chưa có — self-check theo PACK.md)`, là **nợ ghi rõ**, không phải review thật (Q4).

### 5.8 Tín hiệu máy `matchIntents` (QĐ-8)

Thêm `matchIntents(prompt)` vào `intent-dispatch.js`, trả **mọi** skill có khóa khớp; giữ `matchIntent`. ≥ 2 skill khác nhau → gợi ý PHỨC. Chỉ gợi ý và test vàng, không hook nào đọc để chặn.

### 5.9 Sửa lời cho khớp (QĐ-9)

Các chỗ đang nói "một lá / phiên" và "không spawn" phải đổi **cùng một đợt**:

| Chỗ | Đổi thành |
|---|---|
| `minipower-router` SKILL.md (bước 2, 4, § Gọi chung) | "đúng một lá **cho mỗi task**"; bước 4 trỏ lá plan |
| `rules/dispatch.md` | "một task một lá; **không agent bàn giao agent**; fan-out task độc lập chỉ sau khi người OK kế hoạch, đích về agent chính" |
| `minipower-always-on.mdc` mục 2 | như trên |
| `router-and-skills.md` §1, §2 | như trên; sơ đồ thêm nhánh plan + fan-out |
| `parallel-work.md` đoạn "AI fan-out" | mở từ review sang task độc lập theo kế hoạch |
| `src/router/README.md`, `README.md` gốc § Gọi chung | như trên |
| `AGENTS.md` mục "Theo chiều review" | Mở rộng thành "theo chiều review, và theo task độc lập của kế hoạch người đã OK"; thêm một câu trỏ `minipower-router-plan`. *(Điều chỉnh khi thi hành 2026-10-29: AGENTS.md không có chuỗi "Không spawn pack thứ hai" — chuỗi đó ở router SKILL bước 4 và § Gọi chung; dòng "không có agent bàn giao cho agent" giữ nguyên vì `docs-consistency.test.js` canh)* |
| **Thêm khi thi hành 2026-10-29** (chủ repo chọn sửa toàn repo ngoài `ADRs/`): 17 README lá nghề có câu `Không spawn pack khác (ADR-033 QĐ-1).` · `src/router/PACK.md` · `src/tasks/agents/minipower-tasks-{lark,openproject}.md` | `Không agent bàn giao agent (ADR-033 QĐ-1 · ADR-043).` — sed một lần, mỗi file một dòng |

ADR-033 nhận mục *Điều chỉnh 2026-10-28* trỏ về ADR này. ADR-034 QĐ-5 không đổi.

### 5.10 Test canh định dạng (QĐ-10)

Máy chỉ kiểm **hình thức**. `router-plan.test.js`:

- Lá `minipower-router-plan` có frontmatter hợp lệ, `description` có khóa.
- `TPL-plan.md` có bảng tổng quan đủ cột, khối chi tiết đủ 7 mục, bộ tiêu chí cơ bản B1–B7, Gate chỉ bốn giá trị.
- Ví dụ trong README lá: mọi `Lá:` là skill thật; dòng cuối là `review`; mỗi tiêu chí riêng chứa ít nhất một dấu hiệu đo được (số, lệnh, đường dẫn, `≥`/`=`/`0`).
- SKILL lá plan nêu trần **3** ở cả hai tầng, bốn điều kiện dừng, hai bảng nhật ký.
- `matchIntents("viết FR module ORD rồi scaffold backend và review")` ≥ 2 skill; `matchIntent` vẫn một.

### 5.11 Ví dụ kế hoạch

Yêu cầu: *"Thêm module Tenants (TEN) và Orgs (ORG): viết FR cho cả hai, cập nhật SAD, scaffold .NET, rồi review"*. Mode `standard`, tầng full.

**Tổng quan**

| # | Việc | Lá | Module | Phụ thuộc | `∥` | Gate |
|---|---|---|---|---|---|---|
| 1 | Premise Check: TEN, ORG có đáng là hai module? | `minipower-router-deliberation` | TEN, ORG | — | | ⏸ người |
| 2 | Viết UC/FR/AC cho TEN | `minipower-analyst-srs` | TEN | #1 | ∥ | readiness |
| 3 | Viết UC/FR/AC cho ORG | `minipower-analyst-srs` | ORG | #1 | ∥ | readiness |
| 4 | Review FR/AC hai module | `minipower-analyst-review` | TEN, ORG | #2, #3 | | review |
| 5 | Cập nhật SAD/API slice | `minipower-architecture-sad` | TEN, ORG | #4 | | readiness |
| 6 | Scaffold code .NET | `minipower-backend-scaffold-dotnet` | TEN, ORG | #5 | | ⏸ người |
| 7 | Review code | `minipower-backend-review-dotnet` | TEN, ORG | #6 | | review |

#2 và #3 độc lập (khác module, khác folder `03-modules/`) → hai agent song song. #4 chờ cả hai.

**Chi tiết task #2**

| Mục | Nội dung |
|---|---|
| Mô tả | Từ DOC-03 mục TEN, viết UC, FR, BR, AC vào `docs/03-modules/TEN/` theo DOC-05/06/07 |
| Điều kiện cần | DOC-03 có mục TEN đã review (#1 PROCEED) · ID `TEN-` chưa dùng · template DOC-05/06/07 có |
| Tiêu chí hoàn thành | Cơ bản B1–B5 · mỗi UC trong DOC-03 mục TEN có ≥ 1 FR · mỗi FR có ≥ 1 AC Given/When/Then · không FR thiếu Priority · `trace:check` 0 WARN cho TEN · AC không mâu thuẫn BR cùng module (đọc chéo) |
| Phụ thuộc | #1: cần verdict PROCEED và scope TEN chốt trong DOC-03 |
| Input tối thiểu | DOC-03 mục TEN |
| Output | DOC-05/06/07 của TEN; `TEN-UC-*`, `TEN-FR-*`, `TEN-AC-*` |
| Gate | readiness |

## §6. Confirm — câu hỏi chờ chủ repo

| # | Câu hỏi | Đề xuất | Trả lời |
|---|---|---|---|
| Q1 | Duyệt QĐ-1…10? | — | **Duyệt** — 2026-10-29 |
| Q2 | Người OK **một lần cho cả kế hoạch và tiêu chí**, hay OK **từng task**? | Một lần. An toàn nằm ở `⏸ người` và chữ ký cuối. Người nói *"từng bước"* thì đổi | **Một lần cho cả kế hoạch và tiêu chí** — 2026-10-29 |
| Q3 | Không chắc đơn/phức → tự chọn PHỨC, hay hỏi người? | PHỨC; người gạt bằng *"không cần plan"* | **PHỨC** — 2026-10-29 |
| Q4 | 9 pack chưa có lá review: chấp nhận self-check ghi nợ, hay chặn ADR? | Chấp nhận nợ; kênh ghi ra ngoài đã có `⏸ người` | **Chấp nhận nợ** — 2026-10-29 |
| Q5 | Lá mới hay nhồi vào router? | Lá mới | **Lá mới** — 2026-10-29 |
| Q6 | Kế hoạch sống trên chat + `memory.md`, hay DB `.minipower/`? | Chat + `memory.md`; DB chờ ADR-031 | **Chat + `memory.md`** — 2026-10-29 |
| Q7 | Dấu hiệu PHỨC và bộ tiêu chí cơ bản để ở lời/template, hay `rules.json`? | Lời/template; không consumer máy ngoài `matchIntents` và test định dạng | **Lời / template** — 2026-10-29 |
| Q8 | Trần 3 vòng **review** tính chung cả kế hoạch hay riêng từng task review? | Chung cả kế hoạch: một bộ đếm, một nhật ký | **Chung cả kế hoạch** — 2026-10-29 |
| Q9 | Trong vòng sửa, thiếu tiền đề thì có gọi lại readiness không? | Không; là điều kiện dừng (b) | **Không** — 2026-10-29 |
| Q10 | "Tối đa 3 lần" ở tự kiểm task: **3 lần thử** (làm + 2 sửa) hay **3 lần sửa** (làm + 3 sửa)? | 3 lần thử — khớp với "3 vòng" ở tầng review, dễ nhớ một con số | **3 lần thử** — 2026-10-29 |
| Q11 | Agent con được **tự thêm tiêu chí** trong lúc làm không, hay chỉ đề xuất ở lúc lập kế hoạch? | Chỉ lúc lập kế hoạch (người duyệt). Lúc làm, phát hiện thiếu tiêu chí → ghi nhật ký, báo về, không tự thêm | **Không thêm lúc làm; chỉ đề xuất lúc lập kế hoạch để người duyệt** — 2026-10-29 |
| Q12 | Fan-out dùng cơ chế nào? | Của harness (Agent tool / subagent của client), như AGENTS.md đang nói. Minipower không viết runtime; lá plan chỉ định dạng "gói giao việc" và "gói báo về" | **Đúng, cơ chế harness** — 2026-10-29 |

**Chủ repo xác nhận hướng §9 (2026-10-29):** bản chất vẫn là con người duyệt toàn bộ việc lớn, không phá nguyên tắc của repo. Việc lớn quá thì phải chia thành nhiều việc nhỏ để **tiện xây tiêu chí đánh giá và kiểm soát** — đó là lý do tồn tại của kế hoạch, không phải để AI tự chạy.

Chốt xong: ghi ngày vào **Trạng thái** + cập nhật ghi chú index.

## §7. Việc triển khai

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| 0 | Đóng Q1–Q12 | ✅ 2026-10-29; đã chuyển `doing/` | — |
| 1 | `TPL-plan.md`: bảng tổng quan · khối chi tiết 7 mục · bộ tiêu chí cơ bản B1–B7 · bốn Gate · hai bảng nhật ký · "gói giao việc" / "gói báo về" cho agent con | ✅ 2026-10-29 — 128 dòng; `templates/README.md` liệt kê | Q1, Q7 |
| 2 | Lá `minipower-router-plan/{SKILL.md,README.md}` theo 5.2–5.7; README có ví dụ 5.11 + nhật ký mẫu | ✅ 2026-10-29 — SKILL **109** dòng, README 88 dòng; ví dụ 7 task + chi tiết #2 + nhật ký dừng vì cùng cách + nhật ký review | Q2–Q6, Q8–Q12 |
| 3 | Router SKILL.md: § Triage; "đúng một lá cho mỗi task"; bước 4 trỏ lá plan | ✅ 2026-10-29 — **137** dòng (122 + 15); § Triage 5 dấu hiệu a–e; bảng gợi ý pack thêm dòng lá plan | Q3 |
| 4 | `intent-dispatch.js`: `matchIntents` + `minipower-router-plan` vào `INTENT_RULES` | ✅ 2026-10-29 — `matchIntents` bỏ dispatcher khỏi tập; key lá plan không dùng "lập kế hoạch" (đã của `pm-plan`); 2 test mới trong `intent-dispatch.test.js` | Q1 |
| 5 | Sửa lời theo 5.9 (8 chỗ + 20 file thêm khi thi hành) | ✅ 2026-10-29 — grep "không spawn" / "skill spawn" / "runtime spawn" / "một phiên = một pack" ngoài `ADRs/` = **0**; `docs-consistency` và `soft-layer` vẫn xanh | Q1 |
| 6 | ADR-033 mục *Điều chỉnh* | ✅ 2026-10-29 — §12 (bảng trước/sau: đơn vị atomic, "không spawn chuỗi", `rules/dispatch.md`) | Q1 |
| 7 | `minipower-catalog.test.js` **58 → 59** *(ADR ghi 55 → 56 là số cũ; chủ repo đã thêm 3 lá backend trước đó)*; `router-plan.test.js` theo 5.10; README gốc + **`src/router/README.md`** liệt kê lá mới *(`role-pack.test.js` đếm dòng bảng Skill — ADR bỏ sót)* | ✅ 2026-10-29 — `router-plan.test.js` **16 test** | 2, 4 |
| 8 | `npm test` → `gen:check` → `link:check` | ✅ 2026-10-29 — **629/629** · generated đồng bộ · 423 file / 2738 link / 0 MỚI | 1–7 |
| 9 | Index: cập nhật ghi chú; chuyển `done/` khi T xanh | ✅ 2026-10-29 — smoke chủ repo xác nhận; đã chuyển `done/` | 8 |

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Prompt ĐƠN *"viết FR cho module ORD"* | Đi thẳng `minipower-analyst-srs`, không kế hoạch | 🟢 2026-10-29 chủ repo xác nhận |
| T2 | Smoke | Prompt PHỨC ở 5.11 | Kế hoạch đúng khuôn: mỗi task đủ mô tả / điều kiện cần / tiêu chí đo được / phụ thuộc; #2 #3 có `∥`; dòng cuối review; **dừng chờ OK**, chưa mở SOP nghề nào | 🟢 2026-10-29 chủ repo xác nhận |
| T3 | Smoke | Sau OK, #2 thiếu DOC-03 | Gọi readiness, hỏi một lượt; không nhảy #3 | 🟢 2026-10-29 chủ repo xác nhận |
| T4 | Mới | `router-plan.test.js` theo 5.10 (template, ví dụ README, SKILL lá plan nêu trần 3 và bốn điều kiện dừng) | xanh | 🟢 2026-10-29 — 16 test |
| T5 | Mới | `matchIntents` prompt ghép | ≥ 2 skill; `matchIntent` một | 🟢 2026-10-29 — prompt nguyên văn ADR ra 2 lá ("và review" không khớp key); thêm "review PR" ra 3 |
| T6 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới; catalog **59**; grep "không spawn", "một pack / phiên" = 0 ngoài `ADRs/` | xanh | 🟢 2026-10-29 — 629/629 · đồng bộ · 0 MỚI · grep 0 |
| T7 | Smoke | *"không cần plan"* với prompt PHỨC | Đi thẳng skill đầu, nhắc phần còn lại | 🟢 2026-10-29 chủ repo xác nhận |
| T8 | Smoke | #2 và #3 chạy song song | Hai agent con, mỗi agent chỉ mở `minipower-analyst-srs`, báo về agent chính bảng tiêu chí đạt/chưa; agent chính tổng hợp rồi mới chạy #4 | 🟢 2026-10-29 chủ repo xác nhận |
| T9 | Smoke | Trong #2, cố ý để một UC không có FR | Agent tự thấy tiêu chí *mỗi UC có ≥ 1 FR* chưa đạt, tự sửa, kiểm lại, nhật ký lần 1; không hỏi người | 🟢 2026-10-29 chủ repo xác nhận |
| T10 | Smoke | Trong #2, cố ý để FR mâu thuẫn BR không sửa được | Dừng ở lần 2 (cùng cách) hoặc ngay khi thấy cần quyết định; báo về bảng *Lần · Tiêu chí · Cách · Kết quả* + đề xuất; agent chính trình người | 🟢 2026-10-29 chủ repo xác nhận |
| T11 | Smoke | Review #4 ra finding | Chuyển về #2 hoặc #3 đúng module, sửa, review lại, nhật ký vòng 1; 0 finding → trình người ký | 🟢 2026-10-29 chủ repo xác nhận |

Icon: 🟢 xong · 🟡 có sẵn, cần giữ xanh · 🔴 chưa có. **Không 🟢 Done khi còn T đỏ.**

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Việc lớn được chia nhỏ để **xây tiêu chí và kiểm soát từng mảnh**; người duyệt một lần ở kế hoạch, không duyệt từng câu lệnh. "Xong" đo được trước khi AI tốn token. Task độc lập chạy song song. Lỗi rẻ tự đóng ở tầng task, review cuối chỉ còn lỗi tổng thể. Mọi lần dừng có báo cáo *đã thử gì, ra sao*. ADR-034 QĐ-5 có SOP thật |
| Xấu / chi phí | Kế hoạch dài hơn (mỗi task một khối chi tiết) — chấp nhận vì đó là thứ người duyệt. Token: tối đa 3 lần thử × số task + 3 vòng review. Trần và "cùng cách xử lý" là lời, LLM có thể đếm sai — người phải soi nhật ký. Tiêu chí AI gợi ý có thể thiếu hoặc lệch — người phải đọc kỹ lúc OK. Đánh `∥` sai (hai task ghi cùng file) sẽ xung đột — luật một module một owner là lưới đỡ. 8 chỗ lời phải sửa cùng đợt; 9 pack chưa có review. **Đây là bước gần nhất tới "tự chạy" trong repo** — ranh giới ở §0 |
| Trung lập | Không đổi `rules.json`, không hook mới, không đổi phân tầng/mode. Với ADR-013 chỉ kế thừa con số 3 |
