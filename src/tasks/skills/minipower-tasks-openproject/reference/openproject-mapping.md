# Ánh xạ luật work-breakdown → OpenProject

Luật loại việc, log giờ, estimate là tool-neutral: [pm-plan › work-breakdown](../../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md). File này chỉ nói **OpenProject gọi những thứ đó là gì**. Dự án có convention OpenProject riêng (`docs/00-governance/`, custom field, project id) thì áp thêm — không chép vào đây.

Không load mặc định — mở ở L2 khi điền `type / status / parent`.

## 1. Loại việc → Type OpenProject

| Luật (work-breakdown §2) | Type OpenProject | Ghi chú |
|--------------------------|------------------|---------|
| Epic | **Epic** | Thùng chứa module / pha; gắn **Version** khi release; không log spent |
| Feature | **Feature** | Tuỳ chọn giữa Epic và User story |
| User story | **User story** | Có AC trong description hoặc link DOC-07 |
| Task · Task con | **Task** | Instance thường **không** có type Sub-task riêng — Task con khác Task ở **parent** (parent = User story / Task cha) |
| Sprint container | **Summary task** | Tên gợi ý `{dự án} - {YYYY-MM-DD} - {YYYY-MM-DD}`; rollup % con; không log spent |
| Milestone | **Milestone** | FS tới việc then chốt; không bắt buộc parent |
| Bug | **Bug** | Link Story đang test hoặc Epic / Feature gốc |
| Hoạt động | *(không WP)* | Status + **Spent time** + comment trên WP cha |

Type bật trên instance là cấu hình dự án — L1 `search_projects` / schema tool cho biết danh sách thật; không giả định đủ 7 type.

## 2. Vòng đời User story → Status

Theo ý nghĩa, tên status trên instance có thể khác:

`New` → `In progress` → `In review` → `Ready for QA` → `In testing` → `UAT` → `Ready to deploy` → `In deployment` → `Closed`

| Tình huống | Trên OpenProject |
|------------|------------------|
| Đọc doc, code, review, fix, test | Đổi **status** + time entry — không WP "Review" / "Test" |
| Lỗi khi test thuộc chức năng đang test | **Bug** link User story; story về trạng thái fix |
| Lỗi module khác / regression | Bug độc lập link Epic / Feature gốc; story đang test vẫn `Closed` nếu AC đạt |
| Chặn | Relation **blocked by** + ghi chú; story `On hold` nếu instance có |

## 3. Kế hoạch vs thực tế

| Trục | Field OpenProject |
|------|-------------------|
| Kế hoạch | **Estimated time** (hoặc custom field ngày công của dự án) |
| Thực tế | **Spent time** — time entry, đúng WP theo work-breakdown §4 |
| Còn lại | Hệ thống tính; không tạo WP "còn 2h" |
| Đợt bàn giao | **Version** — gán User story, Bug đi chuyến; không gán cho Task Activities |
| Mốc cứng ngoài | **Due date** trên Task / Epic — không dùng thay estimate, không gắn cho Story chỉ vì nằm trong sprint |

## 4. Cây parent gợi ý

```text
[Summary task] sprint / tuần
└── [Epic] module hoặc pha
    ├── [Feature] gói kỹ thuật (tuỳ chọn)
    ├── [User story] giá trị + AC
    │   └── [Task] sản phẩm con
    └── [Task] kỹ thuật / họp specs (ngang hàng Story)

[Milestone] — FS tới WP then chốt
[Bug] — link Story đang test hoặc Epic / Feature gốc
```

## 5. Relation

| Ký hiệu | Ý nghĩa |
|---------|---------|
| FS | Predecessor xong → successor bắt đầu |
| SS | Song song sau khi predecessor bắt đầu |
| blocked by | Chặn tiến |
| *(ghi chú)* | Phụ thuộc mềm (dữ liệu tạm, chưa chốt) — ghi description, không type riêng |

## 6. Bảng L2 — cột đối chiếu

Khi soạn `hành động | subject | type/status | project | map ID | ghi chú`:

- `subject` là **danh từ sản phẩm** (WB-04); chỉ có động từ → đề xuất tên lại hoặc chuyển thành time entry.
- `type` theo §1; Task con ⇒ ghi `parent` ở cột ghi chú.
- User story ⇒ `map ID` có `{MOD}-AC-*` hoặc link DOC-07 (WB-03).
- Yêu cầu log giờ vào Epic / Summary task ⇒ từ chối, gợi WP con hoặc Task Activities (WB-02).
