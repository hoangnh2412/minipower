---
name: minipower-work-report
description: Soạn báo cáo công việc theo nhịp từ dữ liệu board — mốc và đợt sắp đến hạn, cập nhật Story/Bug/Support trong kỳ, việc chậm deadline. Dùng khi người cần một văn bản ngắn để gửi đi hoặc lưu lại. Vai quản lý thì nhắc thành viên trên ticket khi lệch nguyên tắc chat; vai thành viên thì nhắc chính người đó. Không đếm ticket, không nhận xét; không tự chạy theo lịch.
metadata:
  workflow: github
  version: 2.3.0
---

# minipower-work-report

Một việc: **biến dữ liệu board thành một bản ngắn, chỉ gồm việc đọc được.**

Người: [README.md](README.md). Luật board: `memory/tasks-config/`. Nền: [ADR-046](../../../../ADRs/todo/ADR-046-2026-11-15-tang-nghiep-vu-work-tren-la-kenh-tasks.md) QĐ-2. Đọc comment qua lá kênh — [tasks-lark › l1-read](../../../tasks/skills/minipower-tasks-lark/workflows/l1-read.md) § Comment.

## Khi nào dùng workflow nào

| Tình huống | Workflow | Kỳ |
|---|---|---|
| Trong ngày | [workflows/daily.md](workflows/daily.md) | ngày đọc |
| Trong tuần | [workflows/weekly.md](workflows/weekly.md) | 7 ngày tính tới lúc đọc |
| Trong tháng, một người | [workflows/monthly.md](workflows/monthly.md) | tháng dương lịch |

Ba bản dùng **chung một khuôn** ở dưới. Khác nhau ở kỳ và ở chỗ bản tháng lọc một người.

## Quy tắc cốt lõi

- **Không tự chạy theo lịch.** Minipower không phải nơi chạy nền (ADR-022 QĐ-1). Người mở phiên, hoặc lịch bên ngoài gọi vào.
- **Chỉ đọc board,** trừ comment nhắc nguyên tắc khi người đang hỏi là quản lý (mục 2). Không tạo ticket, không sửa, không đóng việc. Không gửi tin — gửi tin thuộc mặt `chat`.
- **Đọc cấu hình trước.** Thiếu `memory/tasks-config/` ⇒ dừng, chỉ sang [minipower-work-profile](../minipower-work-profile/SKILL.md).
- **Đọc đúng thứ tự loại.** `milestone` → `release` → `story`, rồi `bug`, rồi `support`, theo khóa `type_map`. Khóa không có trong `type_map` ⇒ một dòng "đội không khai loại này", rồi sang loại kế. Không đổi trục, không lấy loại khác thay.
- **Mỗi ticket trong bản có đủ sáu mục:** Dự án (`field_roles.project`) · PIC (`field_roles.owner`) · Assign (`members` role assignee) · StartDate (`start`) · EndDate (`due`) · Loại (khóa `type_map`). Thiếu giá trị ⇒ ghi `thiếu`. Ngày ghi `YYYY-MM-DD`.
- **Không đếm.** Không có số lượng ticket, không có phân bố trạng thái, không có "xong n / còn n".
- **Ngắn.** Không đoạn mở. Không kể diễn biến. Mỗi ticket vài dòng.
- **Không nhận xét, không đánh giá.** Không viết nguy cơ, tín hiệu, đáng chú ý, nên, chậm vì. Chỉ ghi chữ đọc được trên ticket và trong comment.
- **Mục rỗng ghi "không có"** và giữ tiêu đề.
- **Có mốc thời gian.** Cuối bản: lọc theo gì, kỳ nào, đọc lúc nào.
- **Nguyên tắc chat là của team.** Chat trong thread: trao đổi chi tiết. Chat trên ticket chỉ có hai việc — raise vấn đề bằng ticket Support tiêu đề bắt đầu `[Vấn đề]`, và chốt bằng comment chứa `[Kết luận]` ngay trên ticket đó.
- **Nhắc theo vai người đang hỏi.** Tra `scope.me` trong `members.people`. Vai chính có `branch_of` null, hoặc open_id nằm trong `oversight` ⇒ quản lý: ghi comment nhắc thành viên trên ticket. Còn lại ⇒ thành viên: nhắc chính người đó trong bản báo cáo, không ghi lên ticket. Không xác định được vai ⇒ hỏi một lần, chưa hỏi thì không ghi.

## Ba mục của mọi bản

Chỉ đưa ticket trả lời đúng câu của mục. Ticket không thuộc mục nào thì không xuất hiện.

### 1. Milestone và Release sắp đến hạn

Chỉ hai loại `milestone` và `release`, viết milestone trước.

**Sắp đến hạn** = `due` còn ở tương lai so với lúc đọc, và nằm trong cửa sổ:

| Bản | Cửa sổ khi người không nói khác |
|---|---|
| Ngày | từ lúc đọc đến hết ngày hôm sau |
| Tuần | 7 ngày tới |
| Tháng | từ lúc đọc đến hết tháng hiện tại |

Người nêu cửa sổ khác ⇒ theo họ, và ghi cửa sổ đó ở đầu mục.

Dưới mỗi ticket sắp đến hạn, liệt kê **việc phát sinh trong kỳ**: ticket tạo trong kỳ, gắn với mốc hoặc đợt đó theo `hierarchy` (subtask hoặc quan hệ chặn). Mỗi việc phát sinh cũng đủ sáu mục. Không đọc được quan hệ ⇒ một dòng "không đọc được việc phát sinh". Không suy từ tên ticket.

### 2. Story, Bug, Support cập nhật trong kỳ

Ticket loại `story`, `bug`, `support` có `updated_at` trong kỳ. Với từng ticket, lá kênh đọc **10 comment mới nhất**.

Tách 10 comment đó theo `reply_to_comment_id` rồi tóm tắt vài dòng:

- **Vấn đề** — ticket loại `support`, tiêu đề bắt đầu bằng `[Vấn đề]`, gắn với ticket đang đọc theo `hierarchy` hoặc quan hệ chặn. Không có ⇒ `chưa có ticket [Vấn đề]`. Khóa `support` không có trong `type_map` ⇒ một dòng "đội không khai support", không chọn loại khác.
- **Kết luận** — comment không reply, nằm trên đúng ticket `[Vấn đề]` đó, và có tag `[Kết luận]`. Chép ngắn câu đó. Không thấy ⇒ `chưa thấy`.
- **Chi tiết** — comment có reply. Việc đang được trao đổi, ai nói. Không có reply ⇒ `không có thread`.

Không suy diễn từ giọng văn. Không đọc quá 10 comment. Không có comment ⇒ `không có comment`.

**Lệch nguyên tắc** khi trong 10 comment, hoặc ở ticket đang đọc, có một trong các việc sau:

- Raise vấn đề bằng comment, mà không có ticket Support tiêu đề `[Vấn đề]`.
- Comment thống nhất kết quả nhưng không có tag `[Kết luận]`, hoặc tag đó không nằm trên ticket `[Vấn đề]`.
- Ticket `[Vấn đề]` chưa có comment `[Kết luận]` trên chính nó.
- Comment trên ticket không phải `[Kết luận]`, không phải loại deadline, không phải lời nhắc nguyên tắc — chi tiết đang nằm sai chỗ.
- Comment trong thread chứa `[Kết luận]` hoặc đang raise vấn đề.

Bỏ qua comment loại deadline của lá kênh và chính lời nhắc nguyên tắc. Hết lệch ⇒ không nhắc.

**Quản lý.** Ghi qua lá kênh, `task_v2_comment_create`, không truyền reply, một ticket một comment. 10 comment đã có lời nhắc này ⇒ không ghi lại. Nội dung đúng khuôn, không nêu tên, không thêm chữ:

```
1. Nhắc nguyên tắc
1.1 Chat trong thread: trao đổi chi tiết vấn đề
1.2 Raise vấn đề: tạo ticket Support, tiêu đề bắt đầu bằng [Vấn đề]
1.3 Mỗi vấn đề có một kết quả thống nhất. Comment thống nhất nằm trong ticket [Vấn đề] và có tag [Kết luận]
```

Ghi xong ⇒ dòng `Nhắc nguyên tắc: đã ghi`. Tool ghi thiếu ⇒ `Nhắc nguyên tắc: chưa ghi được`.

**Thành viên.** Không ghi lên ticket. Chỉ nhắc khi người đó là PIC, Assign, hoặc là người viết một comment lệch trong 10 comment. Dòng trong bản: `Nhắc nguyên tắc: nhắc người đang hỏi`, rồi đúng ba câu 1.1–1.3 ở trên.

### 3. Chậm deadline

Năm loại `milestone`, `release`, `story`, `bug`, `support`, cùng thứ tự đó.

**Chậm** = `due` đã qua lúc đọc và ticket chưa hoàn thành (`completed_at` trống). Không dùng trạng thái hay section để quyết định chậm.

Lý do lấy từ trường vai trò `note` (`field_roles.note`):

- Có chữ ⇒ chép ngắn nội dung.
- Trống ⇒ `chưa có`.
- Cấu hình không khai vai trò `note` ⇒ một dòng "chưa khai `field_roles.note`" cho cả mục, không đi tìm trường khác.

## Khuôn

```markdown
# Báo cáo {ngày | tuần | tháng} — {phạm vi}

## Milestone sắp đến hạn
Cửa sổ: {…}

### {tên}
Dự án: {…} · PIC: {…} · Assign: {…} · StartDate: {…} · EndDate: {…} · Loại: milestone
Phát sinh:
- {tên} — Dự án: {…} · PIC: {…} · Assign: {…} · StartDate: {…} · EndDate: {…} · Loại: {…}

## Release sắp đến hạn
{cùng khuôn, Loại: release}

## Cập nhật trong kỳ — Story, Bug, Support

### {tên}
Dự án: {…} · PIC: {…} · Assign: {…} · StartDate: {…} · EndDate: {…} · Loại: {story | bug | support}
Vấn đề: {ticket Support [Vấn đề] | chưa có ticket [Vấn đề]}
Kết luận: {comment [Kết luận] trên ticket đó | chưa thấy}
Chi tiết: {thread}
Nhắc nguyên tắc: {đã ghi | chưa ghi được | nhắc người đang hỏi}

## Chậm deadline

### {tên}
Dự án: {…} · PIC: {…} · Assign: {…} · StartDate: {…} · EndDate: {…} · Loại: {…}
Lý do: {nội dung note | chưa có}

---
Lọc theo {…} · kỳ {…} · đọc lúc {…}
```

Mục không có ticket ⇒ tiêu đề rồi một dòng `không có`. Dòng `Nhắc nguyên tắc` chỉ có khi lần đọc này có lệch: quản lý thì ghi lên ticket, thành viên thì nhắc trong bản.

## Ranh giới

| Việc | Thuộc về |
|---|---|
| Gọi tool, phân trang, đọc comment | lá kênh — [tasks-lark](../../../tasks/skills/minipower-tasks-lark/SKILL.md) |
| Trả lời tình hình tại chỗ | [minipower-work-status](../minipower-work-status/SKILL.md) |
| Thao tác ticket | [minipower-work-desk](../minipower-work-desk/SKILL.md) |
| Gửi báo cáo vào nhóm chat | mặt `chat` |
| Lưu báo cáo thành tài liệu | mặt `docs` |
| Đặt lịch chạy định kỳ | ngoài Minipower — xem README |

## Output

Một văn bản Markdown theo khuôn trên. Không đoạn tóm tắt. Không bảng đếm.
