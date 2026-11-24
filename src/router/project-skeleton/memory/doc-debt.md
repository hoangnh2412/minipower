# Sổ nợ tài liệu (`doc-debt`)

**Cái gì còn thiếu, và vì sao chấp nhận thiếu.**

Dự án làm nhanh hay tiếp quản hệ cũ cố tình **không** điền đủ 19 DOC — đó là lựa chọn hợp lý, không phải cẩu thả. Nhưng lựa chọn đó chỉ lành mạnh khi món nợ **hiện hình**. File này là chỗ nợ hiện hình.

Nằm ở gốc `memory/` vì nó **cắt ngang mọi phase** — *bản đồ đường tới baseline* (ADR-020). Không nhầm với [`open-questions.md`](open-questions.md) (nợ tiền đề phiên) hay `memory.md` (nhắc việc cá nhân, gitignore).

> Dự án làm chuẩn từ đầu thường để file này rỗng. Không rỗng cũng không sao: nó thành danh sách việc trước khi chốt baseline.

## Vì sao phải ghi

- **Trả nợ được** — trước khi chốt baseline là làm theo danh sách này, không phải ngồi nhớ lại.
- **Bàn giao được** — người mới đọc một file là biết tài liệu hụt ở đâu.
- **Không tự lừa mình** — không ghi thì sau vài tháng "tạm thời thiếu" thành "vốn dĩ không có".

## Sổ nợ

| # | Thiếu gì | Module / phạm vi | Vì sao chấp nhận thiếu | Cần trước khi | Trạng thái |
|---|----------|------------------|------------------------|---------------|------------|
| 1 | | | | | ☐ nợ · ☐ đang trả · ☐ xong |

**Cách điền:**

| Cột | Ghi gì |
|-----|--------|
| **Thiếu gì** | DOC + mục cụ thể — `DOC-04 Business Rules`, không phải "tài liệu nghiệp vụ" |
| **Module / phạm vi** | `{MOD}` nếu là DOC theo module; `dự án` nếu cấp dự án |
| **Vì sao chấp nhận thiếu** | Lý do thật: *"MVP demo 3 tuần"*, *"rule chôn trong code, chưa khai quật"* |
| **Cần trước khi** | Sự kiện bắt buộc trả nợ — `chốt baseline v1.0`, `bàn giao` |

## Khi nào ghi thêm

- `prereq-gate` **nhắc thiếu tiền đề** mà bạn vẫn quyết làm tiếp → ghi vào đây. Đó chính là lúc món nợ phát sinh.
- Bỏ qua một mục trong template DOC vì việc hiện tại chưa cần.
- Khai quật hệ cũ và biết mình chưa đụng tới vùng nào.

## Điều kiện chốt baseline

Sổ này **không còn dòng nào ở trạng thái "nợ"** cho các DOC việc đang làm cần — rồi mới chốt baseline đầu tiên. Chốt baseline đi qua [change-control] và **phải kèm DEC**.

Không có bước di trú cấu trúc: khung folder đã đủ từ ngày init, chỉ là điền tiếp.

[change-control]: ../docs/06-changes/
