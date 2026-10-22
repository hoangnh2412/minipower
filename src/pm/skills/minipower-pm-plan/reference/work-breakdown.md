# Work breakdown — luật phân rã việc (tool-neutral)

Luật chung khi biến scope thành đơn vị việc theo dõi được (Epic · Feature · Story · Task · Bug) — **không phụ thuộc công cụ**. Ánh xạ sang từng công cụ nằm ở lá kênh: [OpenProject](../../../../tasks/skills/minipower-tasks-openproject/reference/openproject-mapping.md); Lark / Jira thêm reference tương tự khi cần. Nguồn: SOP quản lý công việc công ty, đã chạy thật trên dự án e-invoice (ADR-041 QĐ-12).

Không load mặc định — mở khi lập DOC-14, khi soạn bảng L2 tạo việc, hoặc khi phân vân "việc này loại gì, log giờ vào đâu".

## 1. Hai câu hỏi trước khi tạo một việc

| Câu hỏi | Trả lời → |
|---------|-----------|
| Đây là **sản phẩm** cần làm ra, hay chỉ **hoạt động** (viết code, test, review, họp)? | Sản phẩm → có thể tạo việc. Hoạt động → **không** tạo việc; dùng **status**, **time entry** và **comment** trên việc cha |
| Đang nói **kế hoạch** (estimate) hay **thực tế** (giờ đã làm)? | Estimate ghi trên việc kế hoạch; giờ thực tế = time entry — không nhân đôi bằng việc mới |

## 2. Loại việc — chọn từ trên xuống, dòng đầu khớp thì dừng

| Nếu là… | Loại |
|---------|------|
| Mốc ngày / checkpoint / demo | **Milestone** |
| Gom cả tuần hoặc sprint trên lịch | **Sprint container** (Summary task / Sprint) |
| Module lớn hoặc pha lớn (có BRD, nhiều tuần) | **Epic** — gắn version khi release |
| Mang giá trị người dùng, có **AC**, thuộc một Epic | **User story** |
| Gói sản phẩm kỹ thuật (ERD, module API, khung FE) chưa đủ câu user story | **Feature** (parent Epic) |
| Việc kỹ thuật thuần, hạ tầng, họp phân tích **ra specs** liên module | **Task** — ngang hàng Story, link Epic |
| Sản phẩm con trong Story (một màn, một API, một biểu mẫu) | **Task con** — parent là Story / Task cha |
| Sai hành vi so với AC đã chốt | **Bug** |
| Chỉ là hoạt động | **Không tạo** |

## 3. Nguyên tắc vàng

| # | Luật | Vì sao |
|---|------|--------|
| WB-01 | **Sản phẩm → việc; hoạt động → status + time entry** | Việc "Review", "Test", "Viết code" không bao giờ Done theo nghĩa bàn giao |
| WB-02 | **Epic và sprint container không log giờ trực tiếp** | Giờ phải rơi vào việc có sản phẩm; rollup lên từ con |
| WB-03 | **User story có AC**; không tách story theo **tầng kỹ thuật** (story DB, story UI) hay theo **hoạt động** (dev / test / review) | Tách theo sản phẩm hoặc luồng nghiệp vụ; AC trỏ `{MOD}-AC-*` của DOC-07 |
| WB-04 | **Task con = danh từ sản phẩm**, không động từ thuần | Kiểm nhanh: tên đọc lên chỉ thấy *viết / test / review / fix* → đổi thành *API … / Màn … / Module …*; *fix* dùng Bug |
| WB-05 | **Estimate ở con hoặc cha — không đếm đôi** | Đã estimate Task con → để trống estimate Story cha. Estimate Story đã gồm review và rework |
| WB-06 | **Bug khi sai AC; đổi scope → CR / Epic mới** | Bug không phải chỗ chứa yêu cầu mới; CR đi [minipower-analyst-cr](../../../../analyst/skills/minipower-analyst-cr/SKILL.md) |
| WB-07 | **Chờ bên ngoài** (dữ liệu, đối tác, quyết định) → Story / Task bị chặn + relation *blocked by* + ghi chú, không tạo loại "Risk" | Rủi ro theo dõi ở DOC-15; việc bị chặn vẫn là việc |

## 4. Log giờ đúng cấp

| Việc | Log vào |
|------|---------|
| Làm sản phẩm con | Task con |
| Review tổng, tích hợp cấp story | User story |
| Họp **đúng một** việc, review code, demo một chức năng, UAT | Time entry vào việc đó — không tạo việc mới |
| Họp phân tích liên module, chốt specs | Task riêng, link Epic |
| Daily, planning, retro, sprint review | **Một Task "Activities Sprint-N"** mỗi sprint, link Epic quản trị dự án, không gắn version release |
| Epic, sprint container | **Không** |

Không chia giờ họp cho nhiều Epic — log trọn vào Task họp; chỉ phần sửa sản phẩm log về Story từng module.

## 5. Ba pha của một module

| Pha | Vai | Sản phẩm | Xong khi |
|-----|-----|----------|----------|
| Phân tích | BA | BRD / slice DOC-04…07 | Gate review → approved |
| Thiết kế | SA | ADR, SAD, ERD, API spec | Được duyệt |
| Phát triển | Dev | Code chạy được | Released / Done trên version |

BA và Dev **không** log chung một story (story phân tích ≠ story phát triển). Giờ làm ADR log vào việc thuộc pha thiết kế, kể cả khi một người kiêm SA + Dev.

## 6. Ai tạo loại gì (gợi ý)

| Loại | Ai tạo |
|------|--------|
| Epic, Task họp / hạ tầng / Activities | Lead / PM |
| User story | BA / Lead / PO — có AC |
| Feature | Lead / SA / BA |
| Task con | Dev — ở refinement / planning, không giữa sprint trừ PM cho phép; không vượt AC story cha; có estimate con thì trống estimate cha |
| Bug | QA / tester |
| Milestone, sprint container | PM |

Mức chi tiết (**granular**: Dev tạo Task con và log vào đó · **gọn**: không Task con, log thẳng Story) — dự án chọn **một** và giữ nhất quán; ghi DEC.

## 7. Cứng và mềm

Toàn bộ là **lời** — không công cụ nào FAIL được khi tạo sai loại. Chỗ máy giúp được: bảng L2 của lá kênh **đối chiếu §2–§4 trước khi điền `type`** và nhắc lại khi tên việc chỉ có động từ. Người quyết.
