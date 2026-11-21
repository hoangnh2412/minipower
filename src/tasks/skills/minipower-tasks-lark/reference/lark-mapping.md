# Ánh xạ luật work-breakdown → Lark Task

Luật loại việc, log giờ, estimate là tool-neutral: [pm-plan › work-breakdown](../../../../pm/skills/minipower-pm-plan/reference/work-breakdown.md). Giới hạn của công cụ: [lark-model.md](lark-model.md). File này nói **cách bắc cầu giữa hai cái đó**.

Không load mặc định — mở ở L2 khi điền loại việc, chỗ chứa hoặc trạng thái.

> **Không có tên trường, tên lựa chọn hay tên section nào trong file này.** Chúng là quy ước của từng doanh nghiệp, sống ở `memory/tasks-config/` (ADR-046 QĐ-4). Cần biết tên thật ⇒ đọc cấu hình, không đoán, không hardcode.

## 1. Mỗi khái niệm của work-breakdown nằm ở đâu

| work-breakdown | Trên Lark | Lấy tên thật ở |
|---|---|---|
| Loại việc (Epic · Story · Task · Bug · Milestone…) | custom field **chọn-một** | `profile.json` → `field_roles.type` + `type_map` |
| Trạng thái / vòng đời | `section`, **hoặc** custom field chọn-một | `status.json` → `carrier` |
| Người phụ trách chính | custom field **kiểu người** | `profile.json` → `field_roles.owner` |
| Người đang làm bước này | `members[].role = assignee` của Lark | *(cơ chế native)* |
| Gom theo dự án / sản phẩm | custom field **chọn-nhiều** | `profile.json` → `field_roles.project` |
| Ước lượng | custom field số **hoặc** cặp ngày | `profile.json` → `field_roles.estimate_*` |
| Giờ thực tế | custom field số — **không có rollup** | `profile.json`; khai thiếu ⇒ dự án không theo dõi giờ |
| Đợt bàn giao | một lựa chọn trong `type_map`, hoặc tasklist riêng | `profile.json` |
| Quan hệ cha–con | `subtask` | *(cơ chế native)* |
| Quan hệ chặn | `addDependencies` | *(cơ chế native)* |

**Loại việc không có trong `type_map` nghĩa là doanh nghiệp đó không dùng khái niệm ấy** — không phải thiếu sót, không được tự thêm. Ví dụ không khai `sprint` thì đừng dựng ticket sprint.

## 2. Ba luật bắc cầu

**L1 — Loại việc đi qua `type_map`, không bao giờ đi thẳng.** work-breakdown nói "Story"; cấu hình nói lựa chọn thật tên gì. Không khớp được ⇒ **dừng và hỏi người**, không chọn lựa chọn gần giống.

**L2 — Trạng thái đi qua `status.carrier`.** Nơi chứa trạng thái có thể là `section` hoặc một custom field. Đọc cấu hình rồi mới biết dùng `addTasklist` với `section_guid` hay `task.patch` với giá trị field.

**L3 — Hai trục `section` và `completed_at` chỉ nối với nhau bằng cấu hình.** Lark không ràng buộc gì (lark-model §3). `status.done_when` nói trạng thái nào thì được tick xong. Chưa tới đó mà tick là sai quy trình của doanh nghiệp, dù Lark vẫn cho.

## 3. Cây phân cấp — chọn hình, không chọn tên

Lark cho lồng sâu, nên cây phân cấp là **lựa chọn của doanh nghiệp**, khai ở `profile.json` → `hierarchy`. Hai hình hay gặp:

```text
A — cây thuần sub-task             B — cây nông + quan hệ chặn
[mốc]                              [nhóm]  ←── bị chặn bởi ── [việc]
└── [đợt]                          [việc]
    └── [việc]                         └── [việc con]
        └── [việc con]
```

Hình **A** cho cây sâu, xem trực quan trên app, nhưng quan hệ chỉ có một chiều cha–con. Hình **B** giữ cây nông, hợp khi một việc thuộc nhiều nhóm — đổi lại phải đọc thêm quan hệ chặn mới dựng được bức tranh.

Lá nghiệp vụ đọc `hierarchy` để biết cha của một loại việc là loại nào. Không khai ⇒ hỏi người, không giả định.

## 4. Bảng L2 — cột đối chiếu

Khi soạn `hành động | tiêu đề | loại | cha | trạng thái | hạn | map ID`:

- `tiêu đề` là **danh từ sản phẩm** (WB-04); chỉ có động từ ⇒ đề xuất đặt lại tên, trừ loại việc dành cho hoạt động.
- `loại` tra qua `type_map`; không có trong đó ⇒ **dừng**.
- `cha` theo `hierarchy`; quan hệ chặn ghi rõ ở cột ghi chú để người phân biệt với cha–con.
- `trạng thái` tra qua `status`; **đối chiếu với dữ liệu thật trên Lark** trước khi ghi, lệch tên ⇒ dừng (lark-model §2 điểm 7).
- Story ⇒ `map ID` có `{MOD}-AC-*`; **không** copy body FR sang mô tả.
- Mọi lệnh tạo ⇒ nhắc đây là **hai lệnh** và phải truyền `tasklists[]` (lark-model §2).
- Mọi lệnh tạo ⇒ đủ Dự án, Loại ticket, Assign, PIC, Start Date, Due Date. Thiếu thì không đưa vào bảng để ghi. Chưa có deadline thực hiện ⇒ task con `Due thực tế` theo WB-08. Cách ghi trên Lark: [l3-write.md](../workflows/l3-write.md) § Trường bắt buộc.
- Việc có **hai người** cùng làm ⇒ tách **hai ticket**, mỗi ticket một người phụ trách chính. Assign và PIC vẫn là hai chỗ: cùng một người chỉ khi người nói vậy.
