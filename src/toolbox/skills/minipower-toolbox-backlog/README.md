# minipower-toolbox-backlog

Backlog của **chính Minipower** sống trên GitHub Issues. Lá này biết khuôn riêng của repo và lo phần hành chính của thẻ. Phần thao tác GitHub nằm ở [minipower-tasks-github](../../../tasks/skills/minipower-tasks-github/README.md).

Đồ nghề nội bộ — không cài vào workspace dự án khách hàng.

## Vì sao tách làm hai lá

| Lá | Biết gì | Dùng cho repo nào |
|---|---|---|
| `minipower-tasks-github` | cơ chế GitHub: tool, phân trang, lỗi quyền | bất kỳ |
| `minipower-toolbox-backlog` | khuôn riêng và cách làm việc của Minipower | chỉ repo minipower |

Luật trong [AGENTS.md](../../../../AGENTS.md): ở repo này, việc liên quan issue thì dùng lá backlog, không gọi thẳng lá GitHub.

## Ba việc

| Việc | Workflow | Kết quả |
|---|---|---|
| Ghi một việc mới | [intake](workflows/intake.md) | một issue mới, sau khi anh OK bản nháp |
| Tóm tắt, chốt, chỉnh thẻ đã có | [curate](workflows/curate.md) | bình luận tóm tắt phần mới của phiên, bản chốt yêu cầu, nhãn, thẻ con, đóng kèm lý do |
| Xem backlog đang có gì | [digest](workflows/digest.md) | bảng gom theo loại và theo cái đang chờ |

## Form và văn bản tự do

| Loại thẻ | Cách ghi |
|---|---|
| Bài học | Form `.github/ISSUE_TEMPLATE/lesson.yml`, 11 ô cố định vì nội dung phải ẩn danh |
| Ý tưởng · Lỗi · Cải tiến | Văn bản tự do, không form |

Với bài học, skill đọc thẳng file form rồi soạn theo các ô có thật, **không** giữ bản sao danh sách ô. Anh sửa form lúc nào thì skill chạy theo ngay.

Với các loại còn lại, skill viết liền mạch theo cách anh nói và chỉ hỏi chỗ thiếu nghĩa. Nó **không** tự dựng form.

## Nhãn nằm ở đâu

Trên GitHub, không khai trong repo. Skill đọc nhãn thật trước khi gắn và không bao giờ tự tạo nhãn mới.

## Không làm

- Gọi GitHub trực tiếp
- Gắn nhãn phán quyết thay anh
- Viết ADR, nâng skill, chia task — anh tự gọi skill tương ứng
- Chạy ở repo khác ngoài minipower
