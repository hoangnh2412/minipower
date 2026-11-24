# Mở module `presales/` — ước lượng & báo giá, giữ nguyên `discovery`

| | |
|---|---|
| **Ngày** | 2026-08-29 |
| **Trạng thái** | **Thi hành D3 2026-09-26** (chủ repo bật theo ADR-033). Q1–Q9 §6: mặc định đề xuất ADR — `roles: [presales]` · `owner: hoangnh` · H0 giữ ULNL §4 · `risk()` tín hiệu đếm `*4`/assumption (catalog `risk-bands.json`) · `adjust_pct>0.10` **FAIL cứng** · **một** `rate_md` local · `mh_per_md=7.5` · survey hoãn |
| **Phạm vi** | **Mở module thứ năm `presales/`** với **hai skill lá có nội dung thật**, rút từ hàng #11 bảng [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a (`staging/ULNL.md` đã rút). Đụng `presales/`, `contracts/{handoff,pack-manifest}.md`, `sdlc/hooks/test/`, `README.md` + `AGENTS.md` gốc |
| **Ngoài phạm vi** | **`sdlc/skills/discovery/` — không sửa một chữ** (QĐ-3) · skill `survey` · `proposal` (GPKT) · slide/pitch — chỉ là tên trong README (QĐ-2) · phương pháp UCP (QĐ-18) · timeline ([ADR-008](../todo/ADR-008-2026-07-25-minipower-proposal-suite.md) §5) |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 (3 câu hỏi — §1.3 chạy **đủ cả hai câu**, khác bản 2) · QĐ-8 (PACK.md) · [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) QĐ-4/QĐ-6 (*"chờ ADR mở module"* — đây là ADR đó) · [ADR-023](../done/ADR-023-2026-08-25-tach-module-ops-tu-backend-troubleshooting.md) (khuôn mở module gần nhất) · [ADR-008](../todo/ADR-008-2026-07-25-minipower-proposal-suite.md) §3 (hướng gốc, hệ tên cũ) |
| **Mục đích** | Ghi lại nơi ở của giai đoạn **trước khi ký hợp đồng**, và đặc biệt là **ranh giới với `discovery`** — thứ đã làm hai bản ADR trước đó sai |
| **Ảnh hưởng** | `presales/` · [`contracts/handoff.md`](../../contracts/handoff.md) (**H0**) · [`contracts/pack-manifest.md`](../../contracts/pack-manifest.md) · README + AGENTS · `sdlc/hooks/test/presales-pack.test.js` |

---

## §1. Bối cảnh

### §1.1. File cần rút

File `staging/ULNL.md` (đã rút 2026-09-26 vào `presales/`) — 364 dòng: quy trình 5 bước (§5), 7 nhóm mã loại (§6), CSDL 23 mã × GP/PT/KT (§7), 12 hạng mục phi chức năng (§8), MH→MD→tiền (§10), buffer rủi ro (§10.3), format báo giá (§11), ví dụ kiểm chứng (§12: 77 MH ≈ 10.3 MD), anti-pattern (§13). [ADR-028](../doing/ADR-028-2026-08-28-ha-fundamentals-thanh-kho-tam.md) §5a hàng **#11** ghi đích *"→ skill · chờ ADR-008"*; [ADR-008](../todo/ADR-008-2026-07-25-minipower-proposal-suite.md) §3 chốt đúng hướng kỹ thuật nhưng viết **trước** [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md)/[ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) — `minipower/skills/proposal-quotation/`, `minipower/tools/proposal/`, `SOPs/ULNL.md` đều không còn tồn tại. Sau 1 tháng, R1→R6 của ADR-008 chưa khởi động bước nào.

### §1.2. Vì sao không đặt trong `sdlc/` — ba luận điểm

Đối chiếu template [`DOC-14`](../../src/pm/templates/DOC-14-wbs-estimate.md) với ULNL ngày 2026-08-29:

| # | Luận điểm | Đối chiếu |
|---|---|---|
| 1 | **DOC-14 khác họ phương pháp** | DOC-14 §2–§4: WBS `1.1.1` → Epic · Feature · **User Story** · **Story Point** + trace `FR-NNN`; §5 chấm điểm 5 chiều 0–20. ULNL: Phân hệ → **chức năng nguyên tử** → **mã loại catalog** → MH tra bảng. Hai họ khác nhau, không phải hai mức chi tiết của cùng một bảng |
| 2 | **DOC-14 không có chi phí** | §6 đúng ba cột `Role \| Person-days/hours \| Ghi chú`. Không đơn giá, không buffer, không ROM |
| 3 | **Lúc báo giá chưa thể có DOC-14** | DOC-14 thuộc phase `planning`. ULNL §5 tự khai: *"Lần 1 — khảo sát sơ bộ, **trước** khi chốt kế hoạch với khách"*. Và thứ báo giá bắt buộc phải có — **chi phí rủi ro cộng thêm** (§10.3: buffer 10–15% / 25–40%, ROM A–B) — **không tồn tại trong bất kỳ DOC nội bộ nào** |

### §1.3. Câu hỏi quyết định: presales có phải là discovery không?

Bản 2 mở module bằng câu 2 của [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 (*"người dùng khác hẳn"*) mà **chưa loại được câu 1** (*"tác động lên chính tài liệu/pipeline minipower sở hữu?"*) — trong khi ba câu hỏi đó **có thứ tự**. Chạy lại cho đủ:

**Chỗ trùng — lớn hơn bản 2 thừa nhận.** Đối chiếu [`discovery/SKILL.md`](../../src/discovery/skills/minipower-discovery-survey/SKILL.md) với ULNL §4 *"Đầu vào tối thiểu"*:

| ULNL §4 cần | Discovery đã sinh |
|---|---|
| In/out scope + assumption log | DOC-03 §4.1/4.2 · exit criteria *"Assumption log"* |
| Cây Phân hệ → Nhóm → chức năng nguyên tử | DOC-03 *"danh sách module"* → `03-modules/` |
| Pain point, mục tiêu, bên liên quan | DOC-01 §3–4 · DOC-02 |
| Tín hiệu độ khó, tích hợp | DOC-03 §4.3 *"Biên giới & Giao diện"* |

Gần như **toàn bộ đầu vào của ULNL là đầu ra của discovery**; DOC-01 §6.2 còn có sẵn bảng CAPEX/OPEX; ULNL §5 tự gọi thời điểm của nó là *"khảo sát sơ bộ"* — đúng chữ discovery. Câu 1 của QĐ-7 vì vậy trả lời **CÓ**.

**Chỗ khác — nằm ở kết luận, không nằm ở thu thập:**

| | Discovery | Presales |
|---|---|---|
| Đầu ra | DOC-01/02/03 — tài liệu pipeline, vào baseline | Bảng MH + giá + ROM — **không DOC nào chứa**, cố ý không baseline (ADR-008 P2) |
| Giả định nền | Dự án **đã được quyết làm** (có sponsor) | **Chưa chắc có dự án** — thua thầu thì mọi thứ bị vứt |
| Gặp thiếu thông tin | **Hỏi tiếp** — exit criteria *"sponsor xác nhận"* | **Tính tiền cho sự thiếu đó** — `*4`, buffer 25–40%, vì chưa ký thì không có ai để hỏi |
| Cần thêm gì | — | Catalog MH · đơn giá · bậc rủi ro — không thứ nào thuộc `sdlc/` |

Dòng thứ ba là khác biệt hành vi thật: **discovery biến sự mơ hồ thành câu hỏi; presales biến sự mơ hồ thành tiền.** Không phương pháp nào của `sdlc/` làm việc thứ hai.

**Kết luận:** *"Presales bao gồm discovery"* đúng ở tầng **quá trình nghiệp vụ** — người presales thật sự ngồi khảo sát khách. Nhưng module trong repo không phải đơn vị mô phỏng sơ đồ tổ chức; nó là đơn vị **sở hữu một cách làm**, và một quá trình nghiệp vụ được phép đi xuyên nhiều module. Vậy: **presales *dùng* discovery, không *sở hữu* discovery** (QĐ-3). Câu 1 QĐ-7 trả lời "có" cho phần khảo sát ⇒ phần đó **ở lại `sdlc/`**; phần còn lại (định giá, bản gửi khách) không thuộc pipeline nào ⇒ sang câu 2 ⇒ module riêng.

### §1.4. Vết cắt bên trong module

Vết cắt **có sẵn trong chính tài liệu gốc**: ULNL §6–§8 là *ước lượng theo phương pháp*; ULNL §10–§11, §14 là *quy đổi tiền và bản gửi khách*, hoàn toàn không phụ thuộc phương pháp nào sinh ra Σ MH. Repo hiện có **4 module**: `sdlc` · `backend` · `ops` · `toolbox`.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | ULNL là **SOP người đọc** — không trigger, không schema, không gì gọi được | Mỗi lần báo giá chép tay bảng MH vào chat; lệch giữa các lần không ai phát hiện |
| P2 | Giai đoạn **trước khi ký** không có nhà: `sdlc/` bắt đầu từ discovery của dự án **đã quyết làm**; `backend`/`ops`/`toolbox` đều sau đó | File vô chủ nằm lại `staging/`; mọi năng lực presales tương lai (báo giá, GPKT, slide) cũng vô chủ theo |
| P3 | ADR-008 chốt hướng đúng nhưng **hệ tên và đường dẫn đã chết** | Thi hành nguyên văn đẻ ra `minipower/skills/…` sai convention ADR-022 |
| P4 | LLM tự cộng MH/MD/tiền | Số **sai mà trông đúng** — chỗ đắt nhất repo, vì đầu ra đi thẳng tới khách |
| P5 | Rubric §6 **nhìn như phán đoán nhưng toàn là ngưỡng số** (`<10`/`10–20`/`>20` trường · `<5`/`5–10`/`>10` bước · số tham chiếu · có/không công thức) | Giao LLM chọn mã ⇒ hỏi hai lần ra hai mã, lệch 7 MH/dòng, không truy được vì sao |
| P6 | **Buffer rủi ro** (§10.3) đang là bảng đọc bằng mắt: *"file khách mơ hồ → +25–40%"* | Con số quyết định giá cuối lại là con số cảm tính nhất; hai người báo giá cùng bộ chức năng ra hai giá |
| P7 | Nếu presales **tự khảo sát lại** thay vì dùng discovery | Hai bản scope song song lệch nhau — đúng thứ repo sợ nhất (mất SSOT). Bản 2 để ngỏ nguy cơ này |
| P8 | Nếu gộp ước lượng + báo giá vào **một** skill | Thêm phương pháp thứ hai (UCP) là nhân đôi cả lớp tiền; đơn giá có **hai** nhà ⇒ sớm muộn lệch |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **Người duyệt trước khi gửi khách** — AI không tự chốt giá, không tự gửi ([ADR-002](../done/ADR-002-2026-07-20-dinh-huong-minipower-ai-ho-tro-ra-quyet-dinh.md) §0) |
| C2 | **Cái gì tính được bằng số thì phải là code.** LLM chỉ đứng ở chỗ **không có công thức** |
| C3 | **Rules-as-data**: bảng MH và bảng buffer là **dữ liệu có version**, không phải prose trong `SKILL.md` |
| C4 | **Không đổi phương pháp ULNL**: công thức §5, ngưỡng ±10%, 7.5 MH/MD, bậc buffer §10.3 giữ nguyên ([ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) wrap-not-build) |
| C5 | **Không commit đơn giá / margin / VAT** |
| C6 | **`sdlc/skills/discovery/` không bị sửa** trong ADR này. Mọi gate của repo vốn đã **mềm** ([ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) QĐ-11), nên exit criteria *"sponsor xác nhận"* không chặn ai lúc chưa ký — **không cần thêm mode thứ tư** |
| C7 | **Mở module phải kèm skill thật** (ADR-022 QĐ-7 luật 2). Năng lực tương lai chỉ được **ghi tên trong README**, không tạo thư mục rỗng |
| C8 | **Không rewrite ADR-008** — ghi quan hệ ở index |

## §4. Phương án

**(a) Nơi đặt** — O1 `sdlc/skills/estimation/` ❌ (ba luận điểm §1.2) · **O2 module `presales/`** ✅ (§1.3) · O3 gộp vào `skills/planning/` ❌ (planning dùng Story Point — chính thứ luận điểm 1 nói khác họ) · O4 `toolbox/` ❌ (toolbox là công cụ **làm ra chính minipower** — [ADR-027](../doing/ADR-027-2026-08-28-module-toolbox-cong-cu-lam-ra-minipower.md)).

**(b) Tên module** — **`presales`** ✅ (gọi đúng **giai đoạn**, không gọi một chức danh; đủ rộng cho báo giá + GPKT + slide) · `proposal` ❌ (gọi theo deliverable — slide giới thiệu năng lực không phải proposal) · `sales` ❌ (kéo theo CRM, pipeline deal — thứ minipower không làm).

**(c) Vết cắt bên trong module:**

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| OA | **Một** skill ULNL làm cả ước lượng lẫn báo giá | Ít file | P8: thêm UCP là nhân đôi lớp tiền; đơn giá hai nhà | ❌ |
| OB | **Tách `estimation-{method}` + `quotation`** — vết cắt có sẵn trong ULNL (§6–8 vs §10–11) | Thêm phương pháp = thêm một lá, **không đụng lớp tiền**; đơn giá **một nhà duy nhất**; `quotation` độc lập phương pháp | Hai skill cùng đọc một file ⇒ phải chốt schema làm hợp đồng (QĐ-8) | ✅ chọn |
| OC | OB + tạo luôn `survey` | Phủ trọn quá trình presales | Nội dung `survey` hiện chỉ là ULNL §4 + §9 — nằm gọn trong `estimation`. Tạo bây giờ thì hoặc rỗng, hoặc giành việc của `estimation`, hoặc **elicit lại *tại sao/cái gì*** ⇒ đúng P7 | ❌ tạm hoãn |

## §5. Quyết định

### A. Module

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Mở module `presales/`** — thứ năm, ngang hàng `sdlc`/`backend`/`ops`/`toolbox`; phạm vi: **giai đoạn trước khi ký hợp đồng**. Khuôn `ops/` ([ADR-023](../done/ADR-023-2026-08-25-tach-module-ops-tu-backend-troubleshooting.md)): `PACK.md` + `README.md` + `skills/` lá-rời, **không router** | Thoả ADR-028 QĐ-6 và C7 |
| **QĐ-2** | **Mở với đúng hai skill có nội dung thật**: `minipower-presales-estimation-ulnl` + `minipower-presales-quotation`. **`survey` · `proposal` (GPKT) · slide/pitch = tên trong `presales/README.md`**, không thư mục. `proposal` rút từ [staging #12](../../staging/GiaiPhapKyThuat-KHUNG.md) bằng **ADR riêng** (ADR-028 QĐ-4: rút từng file một) | Thư mục rỗng là lời hứa, không phải năng lực |
| **QĐ-3** | **Presales KHÔNG sở hữu discovery.** Không có skill khảo sát trong `presales/`; **không sửa một chữ** trong [`sdlc/skills/discovery/`](../../src/discovery/skills/minipower-discovery-survey/SKILL.md). Skill presales **trỏ sang** discovery cho phần elicit và **chỉ chồng thêm lớp định giá**. Trùng phần thu thập là **cố ý dùng lại**, không phải thiếu sót | Trả lời trực tiếp P7 và câu 1 ADR-022 QĐ-7. Một quá trình nghiệp vụ đi xuyên nhiều module là hợp lệ; **hai bản scope thì không** |
| **QĐ-4** | **Boundary `H0: Discovery (sơ bộ) → Estimation`** trong [`contracts/handoff.md`](../../contracts/handoff.md) — producer owner: **BA/discovery** (không phải presales); input tối thiểu = **ULNL §4**: in/out scope + cây chức năng ở mức thao tác + assumption log. **Giữ nguyên H1–H6** | Bản 2 vẽ ngược (`Presales → Discovery`). Luồng thật: discovery **vắt ngang** vạch ký — chạy sơ bộ trước, **tiếp tục** từ chính DOC-01/02/03 đó sau khi ký, **không làm lại** |
| **QĐ-5** | **Nới enum `stage:`** trong [`contracts/pack-manifest.md`](../../contracts/pack-manifest.md) thêm `presales` (trước `discovery`) | Manifest là schema — thêm module thì schema phải biết |

### B. Vết cắt hai skill

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-6** | **`estimation-{method}` — theo phương pháp.** `minipower-presales-estimation-ulnl` sở hữu ULNL §6 (mã loại) + §7–§8 (CSDL MH). Đầu ra: **Σ MH + dòng chi tiết**, dừng ở MH | Thêm phương pháp = thêm một lá |
| **QĐ-7** | **`quotation` — độc lập phương pháp.** `minipower-presales-quotation` sở hữu ULNL §10 (MH→MD→tiền), §10.3 (buffer/ROM), §11 (format báo giá), §14 (checklist). **Đơn giá chỉ sống ở đây — một nhà duy nhất** | Trả lời P8: `estimation-ucp` sau này không phải nhân đôi lớp tiền |
| **QĐ-8** | **`estimate-vX.Y.json` là HỢP ĐỒNG giữa hai skill**, không phải file tạm: schema khai một chỗ + **test canh ngay từ đầu**, cùng tinh thần `contracts/` canh liên-module. Không vá sau | Hai skill cùng đọc một file: schema trôi thì **cả hai** gãy |

### C. Ranh giới máy / LLM / người

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-9** | **Catalog là dữ liệu**: `estimation-ulnl/catalog/ulnl-default.json` (23 mã §7 + 12 hạng mục §8) và `quotation/catalog/risk-bands.json` (§10.3), đều có `catalog_id` + `version`. `SKILL.md` **không chép bảng MH, không chép ngưỡng §6** | Chống catalog drift: báo giá ghi lại `catalog_id` đã dùng |
| **QĐ-10** | **Toàn bộ số học là hàm thuần, test riêng từng hàm** — `estimation`: `classify()` · `split()` · `lineMH()` · `sumMH()`; `quotation`: `risk()` · `toMD()` · `price()` · `rom()`; chung: `validate()`. **LLM không cộng, nhân, chia, làm tròn một con số nào** | Golden test = ví dụ §12: **77 MH · ≈10.3 MD** |
| **QĐ-11** | **`classify()` là bảng quyết định, không phải prompt.** Rubric §6.1–§6.8 dịch nguyên thành ngưỡng; cùng đầu vào luôn ra cùng mã. `unclear: true` → mã `*4` + câu hỏi bắt buộc. Luật tách dòng (`CN_WEB` ~40 trường → `2 × CN_WEB2`; `TT_DB` > 20 bước → `2 × TT_DB2`) cũng là code | Mã ngoài catalog ⇒ **lỗi**, chặn anti-pattern *"tự invent mã loại"* (§13) |
| **QĐ-12** | **LLM chỉ làm một việc: đọc mô tả → điền các con số đếm được** (`fields`, `columns`, `steps`, `refs`, `has_formula`, `special_component`) + đề xuất `kind`, **mỗi số kèm trích dẫn nguồn**. Đếm không ra → `unclear: true`, **cấm đoán** | Hai nguồn sai lớn nhất (chọn mã, cộng số) bị cắt khỏi đường đi |
| **QĐ-13** | **Chế độ không-LLM là mặc định khi đầu vào đã có số** — bảng đã có cột `fields`/`columns`/`steps` thì chạy thẳng engine, LLM đứng ngoài | Đường chính xác nhất phải là đường **có sẵn** |
| **QĐ-14** | **Rủi ro là bậc dữ liệu, không phải cảm tính (trả lời P6).** `risk()` chọn bậc bằng **tín hiệu đếm được** — số dòng `*4`, tỷ lệ MH thuộc `*4`, số assumption mở, số tích hợp bên thứ ba. Người **override được** nhưng phải ghi `reason` + `approved_by`; bản in ra **cả hai** bậc: máy chọn và người chốt | Con số quyết định giá cuối phải truy được nguồn như mọi con số khác |
| **QĐ-15** | **Anti-pattern §13 thành `validate()`** — FAIL khi: `\|adjust_pct\| > 0.10` không có `approved_by` · gán mã cho hàng nhóm có dòng con · cùng màn hình vừa `CN_WEB*` vừa `GD_WEB*` · dòng `out_of_scope` bị tính vào tổng · `catalog_id` lệch · có dòng `*4` nhưng báo **một số cứng** thay vì khoảng | 6/7 anti-pattern kiểm được bằng máy |
| **QĐ-16** | **Ba tầng dữ liệu**: catalog mặc định (repo) · override dự án · **`quotation-rates.json` — gitignore, không bao giờ commit** | Giữ C5 bằng cấu trúc file, không bằng lời dặn |
| **QĐ-17** | **Đầu vào: DOC-01/02/03 nếu có, danh sách chức năng thô là đủ. Không đòi DOC-06, không đòi DOC-14.** Quan hệ DOC-14: **không feed, không thay, không hợp nhất bảng**; ULNL *"lần cuối"* (§5, sau TKCT) chỉ **đối chiếu** chênh lệch Σ MH ↔ effort DOC-14, trace bằng ID + version catalog | Luận điểm 1–3 §1.2 |

### D. Phạm vi & kế thừa

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-18** | **UCP là lá anh em `minipower-presales-estimation-ucp`** ([staging #10](../../staging/UCP.md), ADR riêng). Nhờ QĐ-7, nó **không** phải dựng lại lớp tiền — chỉ cần xuất Σ MH đúng schema QĐ-8. **Không** tạo `presales/lib/` dùng chung | Bản 2 định giải bằng một thư mục `lib/` không có tên nghiệp vụ; `quotation` mới là cái tên đúng |
| **QĐ-19** | **Quan hệ [ADR-008](../todo/ADR-008-2026-07-25-minipower-proposal-suite.md)**: R2+R3 chuyển sang ADR này, nhà mới là `presales/`; R4 timeline + R5 GPKT + R6 routing giữ ở ADR-008 ⚪ Todo — khi làm, cân nhắc cũng thuộc `presales/`. **Không sửa file ADR-008** (C8) | Tách khối lớn P3 thành mảnh khởi động được |

```text
        ── sdlc/ ──                        ── presales/ ──                    ── sdlc/ ──
                          │  vạch ký hợp đồng chưa xảy ra  │
  discovery (sơ bộ)       │                                │              discovery TIẾP TỤC
  DOC-01/02/03 draft      │                                │              (không làm lại)
        │                 │                                │                     ▲
        └──── H0 ─────────┴──→ estimation-ulnl ──→ quotation ──→ báo giá ──→ ký ─┘
     in/out scope             §6 mã loại          §10 MD·tiền      NGƯỜI DUYỆT
     cây chức năng            §7–8 CSDL MH        §10.3 buffer/ROM
     assumption log           ↓ Σ MH              §11 format
                        estimate-vX.Y.json ─────────┘
                        (HỢP ĐỒNG — schema + test, QĐ-8)

  LLM chỉ ở một chỗ: điền số đếm được + trích nguồn (QĐ-12) · đếm không ra → *4
  Mọi phép tính: hàm thuần có test (QĐ-10) · đơn giá: chỉ trong quotation, không commit (QĐ-16)
```

## §6. Confirm *(bắt buộc trước khi thi hành)*

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…QĐ-19? | **Có** — bật D3 2026-09-26 |
| Q2 | Tên module **`presales`** và hai tên skill **`minipower-presales-estimation-ulnl`** + **`minipower-presales-quotation`**? | **Có** |
| Q3 | `PACK.md`: `roles:` khai gì (`presales` · `bidding` · `solution-consultant`)? `owner:` là ai? | **`[presales]` · `hoangnh`** |
| Q4 | **H0** (QĐ-4): input tối thiểu *"in/out scope + cây chức năng mức thao tác + assumption log"* đã đủ chưa? | **Đủ** |
| Q5 | `risk()` (QĐ-14): tín hiệu nào **thật sự** dùng ở công ty, ngưỡng mỗi bậc? | Catalog `risk-bands.json`: `*4` dòng/MH ratio / assumption mở → vague 25–40%; else 10–15% |
| Q6 | `\|adjust_pct\| > 0.10`: `validate()` **FAIL cứng** (bắt buộc `approved_by`) hay chỉ cảnh báo? *(ULNL §5 nói "phê duyệt", không nói ai)* | **FAIL cứng** |
| Q7 | Đơn giá **tách theo vai trò** GP/PT/KT hay **một `rate_md`**? *(ADR-008 Q-Q6, chưa từng trả lời)* | **Một `rate_md`** (local, không commit) |
| Q8 | `mh_per_md = 7.5` — đúng policy hiện hành? | **Có** (ULNL §1) |
| Q9 | `survey` hoãn (QĐ-2) — đồng ý, hay bạn đã có bộ câu hỏi khảo sát định lượng riêng để tách ngay? | **Hoãn** — dùng discovery |

Chốt xong: ghi ngày vào **Trạng thái** + cập nhật ghi chú index.

## §7. Việc triển khai

Thứ tự cố ý: **module → schema → engine → skill**. Bước 3–6 chạy và test được khi chưa có một chữ prompt nào; đảo lại thì `SKILL.md` sẽ lặng lẽ nhận việc đáng ra của code.

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| 1 | Dựng `presales/` — `PACK.md` (`stage: presales`, `handoff-in: [H0]`) + `README.md` (bảng 2 skill thật + lộ trình `survey`/`proposal`/slide dạng **chữ**) | `PACK.md` đủ 10 field bắt buộc | Q1–Q3 |
| 2 | `contracts/handoff.md` thêm **H0**; `pack-manifest.md` nới enum `stage`; `README.md` + `AGENTS.md` gốc thêm module thứ năm | H0 có producer owner + input tối thiểu | Q4 |
| 3 | **Schema `estimate-vX.Y.json` (QĐ-8)** + test canh — làm **trước** cả hai skill | Schema khai một chỗ, test đỏ khi thêm/xoá field | Q1 |
| 4 | `estimation-ulnl`: `catalog/ulnl-default.json` + `lib/classify.js` (§6.1–§6.8 + luật tách dòng) | Mọi ngưỡng §6 có case **hai phía biên** | Bước 3 |
| 5 | `estimation-ulnl`: `lib/calc.js` (`lineMH` + `sumMH`) + `bin/estimate.js` | Xuất đúng schema bước 3 | Bước 4 |
| 6 | `quotation`: `catalog/risk-bands.json` + `lib/money.js` (`risk` · `toMD` · `price` · `rom`) + `validate()` + `bin/quote.js` | Golden §12 đúng số; 6 luật `validate()` đều FAIL được | Bước 3, Q5–Q8 |
| 7 | `sdlc/hooks/test/presales-pack.test.js` (khuôn `ops-pack.test.js`) + `estimation.test.js` + `quotation.test.js` | `npm test` xanh | Bước 6 |
| 8 | Hai `SKILL.md` + `README.md` — ba vai QĐ-12, **cách điền số** (không phải cách chọn mã), `estimation` trỏ sang [`discovery`](../../src/discovery/skills/minipower-discovery-survey/SKILL.md) cho phần elicit (QĐ-3); frontmatter `name` ≡ thư mục + `description` | `presales-pack.test.js` xanh | Bước 7, Q2 |
| 9 | Xoá `staging/ULNL.md`, sửa href, hạ ratchet `link-check.baseline.txt` | `npm run link:check` 0 gãy mới | Bước 8 |
| 10 | Cập nhật index ADR + ghi chú ADR-028 §5a #11 (kho 10 → 9) | Dòng index khớp repo thật | Bước 9 |

## §8. Xác minh (định nghĩa xong)

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Ví dụ §12 ULNL qua `estimate` → `quote` | **77 MH · ≈10.3 MD**, ROM ≈ 9.3–11.3 MD | 🔴 chủ repo / khách |
| T2 | Smoke | Bảng đã có cột số, không gọi LLM (QĐ-13) | Ra số đầy đủ, không bước nào đòi phán đoán | 🔴 chủ repo |
| T3 | Mới | `classify()` **hai phía biên** | Mã nhảy đúng bậc | 🟢 `estimation.test.js` D3 |
| T4 | Mới | `classify()` 2 lần bit-identical | | 🟢 |
| T5 | Mới | `unclear: true` → `*4` | | 🟢 |
| T6 | Mới | Tách dòng CN_WEB / TT_DB | | 🟢 |
| T7 | Mới | 6 luật `validate()` | FAIL đúng chỗ | 🟢 `quotation.test.js` |
| T8 | Mới | `risk()` + override thiếu `reason` | | 🟢 |
| T9 | Mới | quotation đọc estimate schema | | 🟢 |
| T10 | Mới | Đơn giá không trong `estimation-ulnl/` | | 🟢 |
| T11 | Mới | `presales-pack.test.js` | | 🟢 |
| T12 | Mới | Đúng hai thư mục skill | | 🟢 catalog |
| T13 | Mới | Không đụng `sdlc/skills/discovery/` | | 🟢 D3 |
| T14 | Mới | SKILL không nhét bảng MH §6 | | 🟢 |
| T15 | Mới | `rate_md` không commit | | 🟡 `.gitignore` + example |
| T16 | Regression | `npm test` + `gen:check` + `link:check` 0 gãy mới | | 🟢 2026-09-26 (suite gốc repo) |

Icon: 🟢 xong · 🟡 có sẵn, cần giữ xanh · 🔴 chưa có. **Không 🟢 Done khi còn T đỏ.**

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Giai đoạn **trước khi ký** có nhà — GPKT/slide sau này biết đi đâu, không rơi lại `staging/` · **Khảo sát vẫn một nhà duy nhất** (`sdlc/discovery`), không có bản scope thứ hai (QĐ-3, T13) · Thêm phương pháp ước lượng = thêm một lá, **không đụng lớp tiền**; đơn giá một nhà (QĐ-7, T10) · Buffer rủi ro — con số cảm tính nhất — thành bậc truy được nguồn (QĐ-14) · LLM thu về một việc **đếm có trích nguồn** ⇒ chỗ nó sai là chỗ người soát được · Kho tạm cạn thêm một file đúng luật ADR-028 |
| Xấu / chi phí | Module thứ năm: thêm `PACK.md`, một test canh, mục bản đồ ở `README.md`/`AGENTS.md` phải giữ đồng bộ · `contracts/` sửa hai file (H0 + enum `stage`) — chạm tầng nền, cần soát kỹ · **Hai skill cùng đọc một schema** ⇒ nợ bảo trì mới, phải canh bằng test từ đầu (QĐ-8, T9) · Catalog MH phải theo kịp CSDL công ty · Đầu vào sơ sài rơi xuống `*4` thay vì được đoán cho xong — đúng ý đồ, nhưng ở khảo sát sớm sẽ thấy nhiều `*4` hơn mong đợi, và `*4` đắt rõ rệt (BC4 = 88 MH vs BC3 = 36 MH) |
| Trung lập | Không đụng hook, không đụng `rules.json`, không thêm điều kiện cứng — vòng `gen → test → gen:check` chỉ chạy để chắc không gãy · `presales/` không qua router (lá-rời như `backend`/`ops`) ⇒ `sdlc/SKILL.md` không đổi · ADR-008 vẫn ⚪ Todo cho timeline + GPKT · **Mở module cho một lộ trình, không chỉ cho một skill** — riêng ULNL thì phần "không thuộc sdlc" khá mỏng (catalog + phép tính + buffer); cái làm nó đáng một module là những thứ đi cùng sau (GPKT, slide). Đây là **đánh cược có chủ ý**, ghi ra để sau này đối chiếu chứ không tô thành tất yếu |
