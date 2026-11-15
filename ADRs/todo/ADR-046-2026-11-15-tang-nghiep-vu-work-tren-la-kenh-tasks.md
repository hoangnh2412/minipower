# Tầng nghiệp vụ `work/` trên lá kênh `tasks/`, cấu hình doanh nghiệp ra khỏi repo

| | |
|---|---|
| **Ngày** | 2026-11-15 |
| **Trạng thái** | chốt 2026-11-15 (Q1–Q3 §6), chưa thi hành |
| **Phạm vi** | Module mới `src/work/` (4 lá) · sửa lá `minipower-tasks-lark` · thư mục cấu hình `memory/tasks-config/` ở workspace dự án đích |
| **Ngoài phạm vi** | Ba báo cáo định kỳ cụ thể (issue #15) — ADR này chỉ dựng chỗ cho chúng. Provider khác Lark (Jira, Asana) — thiết kế có tính đến nhưng chưa làm |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1/QĐ-7 · [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) · [ADR-036](ADR-036-2026-09-26-agent-skill-lark-tasks.md) · [ADR-041](../doing/ADR-041-2026-10-22-dua-convention-du-an-vao-minipower.md) QĐ-12 |
| **Mục đích** | Ghi lại vì sao tách nghiệp vụ quản lý công việc khỏi lá kênh, và vì sao tri thức riêng của từng doanh nghiệp phải nằm ngoài repo |
| **Ảnh hưởng** | `src/work/**` (mới) · `src/tasks/skills/minipower-tasks-lark/**` · `src/router/hooks/lib/rules.json` · `src/router/project-skeleton/memory/` |

---

## §1. Bối cảnh

Ngày 2026-11-14 soát lá `minipower-tasks-lark` trên dữ liệu thật thì lộ ra ba điều.

**Lá kênh đang gánh việc không thuộc về nó.** File `reference/lark-mapping.md` vừa viết chứa lẫn ba loại nội dung: sự thật về công cụ Lark (đúng với mọi doanh nghiệp), cách ánh xạ luật phân rã việc (còn chung chung), và **bảng 15 section cùng luật chuyển trạng thái của một công ty cụ thể**. Loại thứ ba không được nằm trong repo.

**Thiết kế trên giấy lệch thực tế.** Mô hình chốt hôm trước dự kiến 9 loại việc gồm `Sprint` và `Release`, trường `Loại`, dùng cờ `is_milestone` native. Đọc tasklist thật thì thấy: trường tên `Type`, 7 lựa chọn, không có `Sprint`, milestone là một lựa chọn trong `Type` chứ không dùng cờ native, và viết sai chính tả thành `Millestone`. Không có chỗ nào ghi giờ công. Điều đáng nói không phải là "ta thiết kế sai", mà là **mỗi doanh nghiệp sẽ lệch một kiểu** — nên không có bộ nào đúng để hardcode.

**Chủ repo nêu yêu cầu mới:** cần tách hai tầng rõ ràng — một tầng chỉ biết thao tác với Lark, một tầng làm nghiệp vụ và **cấu hình được theo từng doanh nghiệp**; và cần làm được công việc hằng ngày mà không phải mở Lark.

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Lá kênh chứa quy trình riêng của một doanh nghiệp | Trái ADR-022 QĐ-1 "giữ cách làm, không giữ dữ liệu". Doanh nghiệp thứ hai dùng là sai ngay |
| P2 | Không có chỗ khai tri thức riêng: danh mục dự án, nhân sự, luật chuyển trạng thái | Mỗi phiên agent phải hỏi lại người, hoặc tệ hơn là đoán |
| P3 | Nghiệp vụ theo dõi và báo cáo chưa có nhà | Nhét vào lá kênh thì phá nguyên tắc một-mặt-một-lá; nhét vào `pm/` thì gắn với một vai, trong khi dev, BA, QA đều dùng |
| P4 | Muốn thao tác một ticket vẫn phải mở Lark | Ngắt mạch làm việc; và người làm tay thì không ai canh được luật chuyển trạng thái |
| P5 | Luật chuyển trạng thái chỉ sống trong đầu người | API Lark không trả về được. Không viết ra thì không có gì canh việc nhảy cóc hay lùi bước mà không nêu lý do |

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | ADR-022 QĐ-1 — Minipower là lớp giữ **cách làm**, không giữ **dữ liệu**. Tri thức nghiệp vụ của doanh nghiệp nằm ngoài repo |
| C2 | Một mặt một lá — lá kênh `tasks/` chỉ lo gọi MCP, không biết nghiệp vụ |
| C3 | Con người là gatekeeper — mọi thao tác ghi vẫn qua cổng L2 → người OK → L3 của lá kênh |
| C4 | Tên lá không được gắn vai (`pm`, `ba`, `dev`), vì bất kỳ ai cũng dùng |
| C5 | Không thêm build step, không thêm dependency |

## §4. Phương án

Hai câu hỏi có trade-off thật.

**Cấu hình doanh nghiệp lấy ở đâu**

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Chép toàn bộ danh mục vào file khai báo | Ổn định, không tốn lượt gọi API, đọc nhanh | File dài; lệch khi Lark đổi mà chưa cập nhật | ✅ chọn |
| O2 | Chỉ khai vai trò của từng trường, danh mục đọc sống từ Lark mỗi phiên | Không bao giờ lệch | Tốn lượt gọi; vẫn không đủ — luật chuyển trạng thái API không trả về | ❌ |
| O3 | Lai: khai vai trò + luật chuyển, đọc sống danh mục | Cân bằng | Hai nguồn, khó nói chỗ nào là chuẩn | ❌ |

Chọn O1 vì chủ repo chấp nhận tự báo khi Lark đổi, và vì tính ổn định quan trọng hơn tính tươi mới trong bối cảnh này. Ba chốt chặn ở QĐ-3 bù lại nhược điểm.

**Số lá cho tầng nghiệp vụ**

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O4 | Một lá, nhiều workflow | Dùng chung cấu hình và tham chiếu; ít lá | Một `description` phải gánh nhiều ý → loader chọn nhầm; lá phình to | ❌ |
| O5 | Bốn lá theo bốn việc | `description` riêng nên kích hoạt chính xác; version độc lập | Nhân bản phần đọc cấu hình | ✅ chọn |

Ranh giới rút từ chính repo: **workflow là các bước của cùng một việc; lá là việc khác nhau**. Lá kênh có `connect/l1/l2/l3` là bốn bước của một việc; pack `pm/` có hai lá là hai việc.

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| **QĐ-1** | **Ba lớp, trách nhiệm tách bạch** | Lá kênh `tasks/` biết gọi MCP · module `work/` biết nghiệp vụ · `memory/tasks-config/` giữ tri thức doanh nghiệp. Lớp nghiệp vụ **không được viết tên trường cụ thể** vào bất kỳ dòng nào |
| **QĐ-2** | **Module mới `src/work/`, 4 lá** | `minipower-work-profile` (quản trị cấu hình) · `minipower-work-desk` (làm việc trên ticket) · `minipower-work-status` (xem tình hình) · `minipower-work-report` (xuất bản định kỳ). Tên không gắn vai (C4) |
| **QĐ-3** | **Cấu hình khai đủ, chia 5 file, đọc khi cần** | `memory/tasks-config/` gồm `profile` · `status` · `projects` · `members` · `scope`. Kèm ba chốt chặn: có `synced_at`; gặp giá trị lạ thì **dừng và hỏi**, không đoán; có đường sinh lại từ Lark để người không phải gõ tay |
| **QĐ-4** | **Trường nào đóng vai gì là khai báo, không phải quy ước** | Lớp nghiệp vụ hỏi "trường đóng vai loại-việc tên là gì" và nhận về `Type`. Doanh nghiệp khác trả `Loại việc` thì skill vẫn chạy nguyên |
| **QĐ-5** | **Luật chuyển trạng thái viết theo chuỗi + ngoại lệ** | Không liệt kê đủ cặp từ-đến. Khai luồng chính của từng nhánh, cộng đường lỗi và đường huỷ. Lùi bước **bắt buộc kèm lý do** — máy kiểm được nên được phép viết "bắt buộc" |
| **QĐ-6** | **Người phụ trách chính là hằng số của ticket** | Người được giao đổi theo trạng thái; người phụ trách chính thì không. Review hoặc test không đạt ⇒ trả việc về người phụ trách chính, nhánh suy từ vai của người đó. Không cần thêm trường mới |
| **QĐ-7** | **Tách `lark-mapping.md` làm ba** | Sự thật về Lark ở lại lá kênh · ánh xạ luật phân rã về `work-breakdown.md` · bảng section và luật chuyển sang `memory/tasks-config/` của workspace. Repo giữ một bản ví dụ có nhãn rõ "không phải chuẩn" |

```
┌─ LỚP 1 · lá kênh tasks/ ────── trong repo, dùng chung
│  biết: tên tool, tạo ticket là hai lệnh, phân trang, lỗi
│  không biết: dự án nào, ai phụ trách, trạng thái nào sang được trạng thái nào
└──────────────────────────── ▲ gọi
┌─ LỚP 2 · module work/ ──────── trong repo, dùng chung
│  biết: luật phân rã việc, cách tổng hợp tiến độ, khuôn báo cáo
│  không biết: tên trường, tên lựa chọn
└──────────────────────────── ▲ đọc
┌─ LỚP 3 · memory/tasks-config/ ─────── workspace dự án, KHÔNG trong repo
│  khai: tasklist, vai trò từng trường, luật chuyển, nhân sự, phạm vi
└────────────────────────────
```

## §6. Confirm

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…7? | **Có** — chốt 2026-11-15 |
| Q2 | Module `work/` nằm ngang hàng pack nghề, hay là tầng riêng trong cây `src/`? | **Ngang hàng pack nghề** |
| Q3 | Chia 4 đợt giao? | **Không** — làm trọn một lượt |

## §7. Việc triển khai

Giao **một lượt**, không chia đợt (Q3). Thứ tự dưới là thứ tự phụ thuộc kỹ thuật, không phải mốc bàn giao.

| Bước | Việc | Done khi |
|---|---|---|
| 1 | Tách `lark-mapping.md` theo QĐ-7; lá kênh đọc cấu hình thay vì hardcode | Không còn tên trường cụ thể nào trong `src/` |
| 2 | `rules.json` thêm module `work` ngang hàng pack nghề, chạy `npm run gen` | `gen:check` xanh |
| 3 | 5 file cấu hình ví dụ ở skeleton | Khai đủ một tasklist thật, có nhãn "không phải chuẩn" |
| 4 | `minipower-work-profile` | Sinh và cập nhật được cấu hình từ Lark |
| 5 | `minipower-work-desk` | Làm trọn vòng đời một ticket không mở Lark |
| 6 | `minipower-work-status` và `minipower-work-report` | Trả lời được ba câu hỏi tình hình; dựng khung cho issue #15 |

Vì giao một lượt nên khối lượng dồn vào một lần review — khoảng 30 file. Bù lại bằng `§8`: bốn hàng xác minh phải xanh trước khi coi là xong.

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Đổi tên một lựa chọn trên Lark, sửa đúng một dòng cấu hình | Skill chạy lại không cần sửa file nào trong `src/` | 🔴 chưa chạy |
| T2 | Smoke | Chuyển một ticket qua trọn luồng bằng `work-desk` | Người được giao đổi đúng; lùi bước mà thiếu lý do thì bị chặn | 🟡 2026-11-15: chạy trên `TechGroup` thật bằng hai ticket thử (BA `70f77b93…` → Released, DEV `17eaf05a…` → Verify TEST, nối chặn), 48 lệnh ghi xanh, bước lùi-không-lý-do bị từ chối. Chạy qua script gọi thẳng gói MCP chứ chưa qua lá `work-desk` trong phiên thật — thành 🟢 khi chủ repo chạy lại bằng lá |
| T3 | Mới | Grep `src/work/` tìm tên trường và tên lựa chọn cụ thể | 0 kết quả | 🟢 2026-11-15 |
| T4 | Regression | `npm test` · `gen:check` · `link:check` 0 gãy mới | xanh | 🟢 2026-11-15 — 644/644 |

## §9. Hệ quả

| Hướng | Hệ quả |
|---|---|
| Tốt | Doanh nghiệp thứ hai chỉ cần khai cấu hình, không sửa code. Luật chuyển trạng thái từ chỗ truyền miệng thành thứ máy canh được. Làm việc không phải rời công cụ |
| Xấu / chi phí | Thêm một module và bốn lá — nhiều thứ phải bảo trì hơn. Cấu hình khai đủ nên sẽ lệch khi Lark đổi mà chưa báo; chốt chặn ở QĐ-3 chỉ giảm chứ không khử |
| Trung lập | Cấu hình nằm ở workspace nên không theo repo — mỗi máy mỗi bản, cần tự lo sao lưu |

---

## Điều chỉnh 2026-11-15 — tên thư mục cấu hình

Bản chốt ban đầu đặt cấu hình ở `memory/tasks/`. Khi thi hành thì **4 test đỏ** và cả `minipower init --check` cũng chặn: [ADR-035](../done/ADR-035-2026-09-26-memory-mot-file-thay-overview.md) QĐ-9 đã cấm đúng đường dẫn đó.

Đọc kỹ thì hai bên nói về hai thứ khác nhau. ADR-035 cấm `memory/tasks/` làm **nơi chứa việc đội** khi không có provider — việc đội đã chuyển sang `trace.db`. Còn ADR này dùng nó cho **cấu hình ánh xạ**, không chứa việc nào. Nhưng tên trùng, nên máy chặn — và chặn là đúng: hai thứ khác bản chất không nên chung một tên.

**Đổi sang `memory/tasks-config/`.** Tên nói đúng bản chất, không đụng điều cấm. Mọi QĐ và sơ đồ ở trên đã cập nhật theo tên mới; không có quyết định nào đổi nội dung.

Bài học cho lần sau: trước khi chọn một đường dẫn trong `memory/`, chạy `npm test` sớm — hệ thống đã có test canh những chỗ từng bị cấm, và nó biết nhiều hơn người viết ADR nhớ được.

## Điều chỉnh 2026-11-15 — §7 bước 2 nói "rules.json", thực tế là ba chỗ khác

`rules.json` không khai danh sách pack. Khi thi hành mới thấy một pack mới phải vào **ba chỗ**, và chỗ nào thiếu thì hỏng theo một kiểu khác nhau:

| Chỗ | Thiếu thì |
|---|---|
| `SKILL_PACKS` trong `hooks/lib/skill-catalog.js` | `npm run gen` không quét pack ⇒ `module-registry.json` không có ⇒ `install --with work` từ chối |
| Bảng `kind` / `installDefault` trong `hooks/lib/module-registry.js` | Pack bị gán nhầm là `role` — trái C4 |
| `MODULES` trong `test/pack-manifest.test.js` + số lá trong `test/minipower-catalog.test.js` | Test đỏ |

`module-registry.json` là **file generated** từ hai chỗ đầu — sửa tay vào đó sẽ bị `gen` ghi đè, đúng như tôi đã bị. Vòng `gen → test → gen:check` vì thế vẫn bắt buộc dù không đụng `rules.json`. Pack `work` lấy `kind: business` (kind mới, chỉ dùng để hiển thị) và `install.default: false` — chỉ cài khi `--with work`, vì nó cần cấu hình riêng mới chạy được.

## Điều chỉnh 2026-11-15 — module khai ở đâu

`§7` bước 2 viết "`rules.json` thêm module `work`". **Sai.** `rules.json` không khai pack hay module — nó giữ map DOC→phase, project-mode, roles, prereq. Danh sách module nằm cứng trong `test/pack-manifest.test.js`, cùng một test canh nó khớp cây `src/` (ADR-032 T5).

Thực tế phải làm: thêm `"work"` vào danh sách đó, và viết `src/work/PACK.md` theo schema [pack-manifest](../../contracts/pack-manifest.md). Không chạm `rules.json`, nên cũng không cần vòng `gen → test → gen:check` — `gen:check` vẫn chạy để chắc.

Mục **Ảnh hưởng** ở đầu ADR ghi `rules.json` là thừa; giữ nguyên dòng đó làm dấu vết, đọc kèm mục này.
