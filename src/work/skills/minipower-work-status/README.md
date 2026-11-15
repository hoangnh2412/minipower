# minipower-work-status

Hỏi gì đáp nấy về tình hình board. Chỉ đọc — không đụng ticket nào.

## Ba câu hỏi

| Hỏi | Workflow | Trả về |
|---|---|---|
| "tiến độ dự án X" | `project` | Mốc · phân bố theo trạng thái · việc cần chú ý |
| "việc của tôi" | `personal` | Việc đang làm và việc mình chịu trách nhiệm, tách riêng |
| "đội đang làm gì" | `team` | Chỗ ùn · khối lượng theo người |

## Ba chỗ số liệu dễ sai, skill này tránh sẵn

**"Còn bao nhiêu việc"** không đếm bằng một cờ. Ticket ở bước cuối mà chưa chốt là *đã xong, chờ chốt* — tách riêng khỏi việc tồn.

**"Việc của tôi"** có hai nghĩa: việc tôi đang cầm, và việc tôi chịu trách nhiệm tới cùng. Nhóm thứ hai rộng hơn và hay bị bỏ sót — đó là chỗ việc nằm im mà không ai hỏi.

**Việc con và việc cha** dễ đếm hai lần. Skill luôn nói rõ đang đếm cấp nào.

## Một thứ skill này cố ý không làm

**Không kết luận ai chậm.** Nó viết *"bước review đang giữ 14 việc, nhiều gấp ba bước kế tiếp"* chứ không viết *"X đang chậm"*. Số liệu thì máy thấy; bối cảnh thì người biết.

## Phụ thuộc

Cần `memory/tasks-config/` — chưa có thì dựng bằng [minipower-work-profile](../minipower-work-profile/README.md).

## Prompt mẫu

```
tiến độ dự án A
còn mốc nào chưa xong
việc của tôi hôm nay
tôi đang chờ ai
đội đang ùn ở bước nào
ai đang nhiều việc quá hạn nhất
```

## Không làm

- Tạo, sửa, chuyển trạng thái → [minipower-work-desk](../minipower-work-desk/README.md)
- Báo cáo theo nhịp cho người khác đọc → [minipower-work-report](../minipower-work-report/README.md)
- Sửa cấu hình → [minipower-work-profile](../minipower-work-profile/README.md)
