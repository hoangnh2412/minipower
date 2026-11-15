# Ánh xạ luật work-breakdown → Lark Task

Luật loại việc, log giờ, estimate là tool-neutral: [pm-plan › work-breakdown](../../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md). File này chỉ nói **Lark gọi những thứ đó là gì**. Dự án có convention Lark riêng (bộ custom field, tasklist chuẩn) thì áp thêm — không chép vào đây.

Không load mặc định — mở ở L2 khi điền `loại / chỗ chứa / trạng thái`.

> **Bản nháp v0.6.** Bộ loại, cây phân cấp, bảng section, luật chuyển trạng thái, việc tách hai ticket BA/DEV và cách đóng việc đã chốt. Chưa kiểm trên dữ liệu thật: ghi chú cuối §2.

## 0. Lark Task có gì

Lark Task **không có** type, status nhiều bước, project, version hay time entry. Nó có:

| Cơ chế Lark | Dùng vào việc gì ở đây |
|---|---|
| `task` ↔ `subtask` | Cây cha–con. Subtask **là một task đầy đủ** (API ghi rõ "giống hệt tạo task, chỉ thêm guid cha") nên **lồng sâu được nhiều tầng** |
| `custom_fields` trên **tasklist** — số, ngày, người, chọn một, chọn nhiều, văn bản | Thay cho type, ước lượng, giờ thực tế |
| `is_milestone` (boolean) | Cờ mốc — native |
| `tasklist` → `section` | Chỗ chứa và **trạng thái** |
| `tasklists[]` — một task thuộc **nhiều** list | Một việc vừa ở list nhóm vừa ở list dự án |
| `addDependencies` / `removeDependencies` | Quan hệ chặn — dùng cho Epic |
| `due{timestamp,is_all_day}` · `start` · `members[{id,type,role}]` | Hạn, ngày bắt đầu, người làm và người theo dõi |
| `comment` | Ghi chú tiến độ |

Ba điều phải biết trước khi dựng:

1. **`taskSubtask.create` không nhận `custom_fields` và `is_milestone`.** Tạo xong phải `task.patch` lần hai để gắn `Loại`. Mọi workflow ghi đều là **hai bước**, không phải một.
2. **Custom field gắn theo từng tasklist.** Ticket phải nằm trong tasklist có khai bộ field thì mới set `Loại` được — nên bước tạo luôn phải truyền `tasklists[]`.
3. **Lark không có spent time.** Giờ thực tế là field số người tự điền, không có rollup từ con lên cha.

## 1. Bộ loại việc

`Loại` là **custom field chọn-một** khai trên tasklist. Lark không có type sẵn.

| Loại | Dùng cho | work-breakdown §2 | Ghi chú |
|---|---|---|---|
| **Milestone** | Mốc ngày / checkpoint | Milestone | Bật kèm `is_milestone: true`. Báo cáo tiến độ lọc theo cờ này |
| **Sprint** | Một sprint trên lịch | Sprint container | `summary` = tên sprint |
| **Release** | Một đợt bàn giao | Version / đợt bàn giao | `summary` = tên version của thành phần cần release |
| **Epic** | Gom nhóm Story và Task | Epic | **Line riêng**, không nằm trong cây sub-task — xem §2 |
| **Story** | Mang giá trị người dùng, có AC | User story | AC trong `description`, chỉ ghi mã `{MOD}-AC-*`, không copy body FR |
| **Task** | Việc kỹ thuật thuần, hạ tầng | Task | |
| **Sub-Task** | Sản phẩm con trong Story/Task | Task con | Danh từ sản phẩm (WB-04) |
| **Support** | Họp, daily, planning, retro, review | *(hoạt động)* | Chỗ log giờ cho hoạt động — xem §4 |
| **Bug** | Sai hành vi so với AC đã chốt | Bug | |

**Về `Support`:** WB-01 nói hoạt động thì không tạo việc. Lark không có time entry nên không còn chỗ nào khác để log giờ họp — `Support` chính là hiện thực của "một Task Activities mỗi sprint" ở work-breakdown §4. Không dùng `Support` cho việc có sản phẩm bàn giao.

## 2. Cây phân cấp

Hai cơ chế khác nhau, đừng trộn:

```text
CÂY CHÍNH — quan hệ sub-task
[Milestone]                        is_milestone = true
└── [Sprint]
    └── [Release]
        └── [Story | Task | Support | Bug]
            └── [Sub-Task]

LINE RIÊNG — quan hệ chặn
[Epic]  ←── bị block bởi ──  các [Story] và [Task] bên trong nó
```

- Cây chính đi bằng `taskSubtask.create`, truyền guid của cha.
- `Epic` **không** là cha trong cây sub-task. Nó đứng riêng, gom việc bằng `addDependencies`: Epic **bị chặn bởi** từng Story/Task thuộc về nó. Epic chỉ xong khi mọi con xong — đúng nghĩa quan hệ chặn, không phải mượn tạm.
- Một Story vì vậy có **hai** mối nối: là sub-task của một `Release`, đồng thời chặn một `Epic`.
- **Một yêu cầu nghiệp vụ sinh hai ticket** — một cho việc phân tích của BA, một cho việc code của DEV (§3.2), nối nhau bằng quan hệ chặn. Đây đúng là điều work-breakdown §5 đã đòi: *"BA và Dev không log chung một story"*.

**Chưa kiểm được:** API cho phép lồng sâu, nhưng app Lark hiển thị cây 5 tầng ra sao thì chưa thử trên dữ liệu thật. Dựng thử một nhánh trước khi đổ cả backlog vào.

## 3. Trạng thái = section của tasklist

Tasklist đang dùng đã có sẵn các section thể hiện trạng thái. **Dùng luôn các section đó**, không khai thêm field trạng thái. Chuyển trạng thái = đổi `section_guid` của ticket trong `tasklists[]`.

### 3.1 Bảng section

Giữ nguyên phần mô tả sau tên, chỉ số là mới.

| Số | Group | Ai giữ | Vào khi | Đi tiếp khi |
|---|---|---|---|---|
| `0` | Remove | — | Huỷ bỏ, không thực hiện | *(điểm cuối)* |
| `01` | Backlog | — **chưa assign ai** | Bất kỳ việc nào, mọi việc đều vào đây trước | Được chọn ưu tiên |
| `02` | Request | Lead BA **hoặc** Lead DEV, tuỳ loại việc | Muốn đẩy vào sprint tiếp, kéo từ Backlog | Bắt đầu lập kế hoạch |
| `03` | Planning | Lead BA **và** Lead DEV | Lập kế hoạch tổng quan, kéo từ Request | Brainstorm xong, chốt làm |
| `04` | Todo | Nhân sự BA hoặc DEV | Đã duyệt sẽ làm, kéo từ Planning | Bắt tay làm |
| `05` | Doing | Nhân sự đang làm | Đang thực hiện, kéo từ Todo | Báo xong → **chuyển assign sang leader** |
| `06` | Review | Leader | Người làm báo xong | Review đạt — **hai lối ra**, xem §3.2 |
| `07` | Ready Deploy | DEV | Review code đạt, chờ deploy | Đã deploy TEST |
| `08` | Verify TEST | TEST | Đã deploy Testing | Test đạt |
| `09` | Deploy STAG | DEV | Đã kiểm thử trên Testing | Đã lên STAG |
| `10` | Verify STAG | TEST | Đã lên STAG | Test đạt |
| `11` | Deploy PROD | DEV | Đã kiểm thử UAT | Đã release |
| `12` | Verify PROD | TEST | Đã release | Test đạt |
| `13` | Released | DEV · BA | Đã golive *(ticket DEV)* · review tài liệu đạt *(ticket BA)* | Hoàn thiện runbook nếu có; tick Completed ở retro cuối sprint |
| — | Default Group | — | Lark tự đẩy vào khi lệnh tạo không chỉ định section | *(giữ nguyên, không dọn)* |

`0. Remove` và `Default Group` **giữ nguyên, không dọn** — đây là quyết định của chủ repo, không phải nợ kỹ thuật.

### 3.2 Hai ticket riêng, dùng chung group Review

Việc phân tích của BA và việc code của DEV là **hai ticket riêng** — hệ quả thẳng của luật một-ticket-một-owner ở §4, vì hai người khác nhau log giờ. **Không** gộp thành một ticket rồi đổi assignee giữa chừng.

Hai ticket đi chung đường tới `06. Review`, rẽ ở đó, rồi **gặp lại nhau ở `13. Released`**:

```text
ticket BA    01 ─► 02 ─► 03 ─► 04 ─► 05 ─► 06. Review ─────────────────────────► 13. Released

ticket DEV   01 ─► 02 ─► 03 ─► 04 ─► 05 ─► 06. Review ─► 07. Ready Deploy
                                                      ─► 08. Verify TEST ─► 09 ─► 10 ─► 11 ─► 12
                                                      ─► 13. Released

cả hai ─► tick Completed ở retro cuối sprint, khi đang nằm 13. Released
```

| Lối ra khỏi `06. Review` | Dành cho |
|---|---|
| `13. Released` — đi thẳng, bỏ qua chuỗi deploy | Ticket BA — tài liệu đã review đạt |
| `07. Ready Deploy` | Ticket DEV — code đã review đạt |

Ticket BA kết ở `13. Released` **cho thống nhất với ticket DEV** — cùng một chỗ dừng, cùng một cách đóng. Đổi lại, tên group đọc hơi lệch với ticket phân tích, vì tài liệu thì không "golive"; đây là đánh đổi đã cân nhắc, ưu tiên quy trình thống nhất hơn ngữ nghĩa tên.

**Nối hai ticket:** `addDependencies` — ticket DEV **bị chặn bởi** ticket BA. Ticket DEV chỉ vào `03. Planning` khi ticket BA đã đóng.

Ticket BA đi qua `02. Request` và `03. Planning` **giống hệt** ticket DEV — không có đường tắt vào thẳng `04. Todo`.

### 3.3 Đường lỗi và đường huỷ

| Từ | Về | Kèm theo |
|---|---|---|
| Mọi group `Verify *` khi test fail | `04. Todo` | Assign lại DEV |
| Bất kỳ group nào, khi quyết định không làm | `0. Remove` | Comment nêu lý do |

### 3.4 Đóng việc

**Một cách đóng duy nhất cho cả hai loại ticket:** chuyển về `13. Released`, rồi **tick Completed** ở retro cuối sprint. Không có ngoại lệ cho ticket BA.

Ticket **không** chuyển section khi tick — Lark không có section "Closed", `completed` là trục riêng. Nên ticket đã đóng vẫn nằm ở `13. Released`.

Một điều báo cáo phải phân biệt: ticket ở `13. Released` mà `completed = false` ⇒ **đã xong phần việc nhưng chưa chốt ở retro**, không phải lỗi dữ liệu.

### 3.5 Việc phải làm trên Lark trước khi dùng bảng

Bảng trên Lark hiện đánh số tới `12`, bảng này tới `13`. Phải sửa trước khi chạy L3:

| Trên Lark hiện tại | Thành |
|---|---|
| `02. BA` | **`06. Review`** — đổi tên và dời xuống sau `05. Doing` |
| `03. Request` | `02. Request` |
| `04. Planning` | `03. Planning` |
| `05. Todo` | `04. Todo` |
| `06. Doing` | `05. Doing` |
| *(chưa có)* | **`07. Ready Deploy`** — tạo mới |
| `07. Verify TEST` | `08. Verify TEST` |
| `08. Deploy STAG` | `09. Deploy STAG` |
| `09. Verify STAG` | `10. Verify STAG` |
| `10. Deploy PROD` | `11. Deploy PROD` |
| `11. Verify PROD` | `12. Verify PROD` |
| `12. Released` | `13. Released` |

`0. Remove`, `01. Backlog` và `Default Group` giữ nguyên.

**Thứ tự thao tác:** đổi `02. BA` → `06. Review` **trước tiên**, rồi mới dồn `03`→`02`, `04`→`03`, `05`→`04`, `06`→`05`. Làm ngược lại sẽ có hai group cùng số giữa chừng. Nhóm số tăng (`07`→`08` … `12`→`13`) thì đổi **từ dưới lên**, bắt đầu từ `12. Released`, vì lý do tương tự.

Chưa đổi xong mà đã chạy L3 thì ticket sẽ rơi vào section sai. L1 đọc `task_v2_section_list` đầu phiên và đối chiếu bảng §3.1; lệch → dừng, báo người.

| Tình huống | Trên Lark |
|---|---|
| Đọc doc, code, review, fix, test | Chuyển section + comment — không tạo ticket "Review" / "Test" |
| Lỗi khi test thuộc chức năng đang test | Ticket `Loại` = Bug, là sub-task của cùng `Release` |
| Lỗi module khác / regression | Bug độc lập; story đang test vẫn đóng được nếu AC đạt |
| Chặn | `addDependencies` + comment nêu lý do |

## 4. Kế hoạch vs thực tế

| Trục | Trên Lark |
|---|---|
| Hạn | `due` — `is_all_day: true` khi chỉ có ngày |
| Ngày bắt đầu | `start` |
| Kế hoạch | Field **số** `Ước lượng` trên tasklist |
| Thực tế | Field **số** `Thực tế` trên tasklist — **người tự điền** |
| Còn lại | Không có. Không tạo ticket "còn 2h" |
| Đợt bàn giao | Ticket `Loại` = Release (§1) |

**Một ticket một owner.** Giờ công log theo người, nên mỗi ticket chỉ có **một** người chịu trách nhiệm. Hai người cùng làm một việc ⇒ **hai ticket riêng**, không gộp rồi assign hai người. Đây cũng là lý do `Sub-Task` tồn tại: chia việc theo người làm, không chia theo công đoạn.

Hai hệ quả của việc tự điền, phải nói với dự án:

- **Không có rollup.** Giờ ở Sub-Task không tự cộng lên Story. Muốn tổng thì báo cáo tự cộng khi đọc.
- **WB-05 không có máy canh.** Luật "đã điền ở con thì để trống ở cha" chỉ còn là lời; L2 nhắc, người giữ.

Giờ họp log vào ticket `Support`, không chia cho nhiều Epic (work-breakdown §4).

## 5. Quan hệ phụ thuộc

| Luật | Trên Lark |
|---|---|
| Epic gom Story/Task | `addDependencies` — Epic bị chặn bởi con |
| FS (xong mới bắt đầu) | `addDependencies` |
| Chặn | `addDependencies` + comment |
| SS (song song) | Không có — ghi comment |
| Phụ thuộc mềm | Comment, không tạo quan hệ |

Lark không phân biệt kiểu quan hệ: mọi thứ đều là "chặn". Cần phân biệt thì ghi rõ trong comment.

## 6. Bảng L2 — cột đối chiếu

Khi soạn `hành động | tiêu đề | loại | cha | section | hạn | map ID | ghi chú`:

- `tiêu đề` là **danh từ sản phẩm** (WB-04); chỉ có động từ → đề xuất đặt lại tên, trừ `Loại` = Support.
- `loại` theo §1; `cha` theo cây §2 — Story/Task/Support/Bug thì cha là một `Release`.
- `Epic` ⇒ cột ghi chú nêu rõ sẽ nối bằng quan hệ chặn, **không** phải sub-task.
- `Milestone` ⇒ nhắc bật `is_milestone`, vì báo cáo tiến độ lọc theo cờ này.
- Story ⇒ `map ID` có `{MOD}-AC-*`; **không** copy body FR sang `description`.
- Mọi ticket tạo mới ⇒ nhắc đây là **hai lệnh**: tạo rồi patch để gắn `Loại` (§0).
- `section` theo bảng §3.1; đối chiếu `task_v2_section_list` thật trước khi điền, lệch tên ⇒ dừng (§3.5).
- Việc có **hai người** cùng làm ⇒ tách **hai ticket**, mỗi ticket một owner (§4).
