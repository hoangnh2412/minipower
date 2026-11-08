# Breakdown kỹ thuật backend/frontend làm input cho PM lập WBS

| | |
|---|---|
| **Ngày** | 2026-11-07 |
| **Trạng thái** | ⚪ Todo — chốt hướng qua trao đổi với chủ repo 2026-11-07, chưa thi hành |
| **Phạm vi** | 2 skill mới: `minipower-backend-plan-dotnet` (pack `backend`) · `minipower-frontend-plan-react` (pack `frontend`) — breakdown đầu việc kỹ thuật + độ phức tạp, trace FR/AC/UC, làm input bổ sung cho PM lập WBS |
| **Ngoài phạm vi** | Gán Story Point cuối cùng · tạo ticket/task board · đổi luật layer/import của `architecture-dotnet`/`architecture-react` · đổi `rules.json` |
| **Nối tiếp** | [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-7 (3 câu hỏi) · [contracts/handoff.md](../../contracts/handoff.md) (boundary H3) |
| **Mục đích** | Ghi lại vì sao PM cần thêm input kỹ thuật trước khi lập WBS cho module có phần backend/frontend, và vì sao input này là bổ sung, không thay H3 |
| **Ảnh hưởng (khi accepted)** | Xem [Kỹ thuật] §5 |

---

## §1. Bối cảnh

`minipower-pm-plan` lập WBS/Story Point (DOC-14/15) từ FR/AC của module (DOC-06 Must-have — input tối thiểu của boundary H3 trong `contracts/handoff.md`). PM giỏi quản lý tiến độ, rủi ro, phân rã Epic/Feature/Story/Task — nhưng không nhất thiết đủ sâu kỹ thuật để ước lượng chính xác việc backend/frontend cụ thể cần làm gì, nên Story Point phần code dễ lệch.

## §2. Quyết định

Thêm hai skill mới: `minipower-backend-plan-dotnet` và `minipower-frontend-plan-react`. Mỗi skill đọc FR/AC/UC của module (và DOC-08/11/12/19 nếu đã có), ra một bảng đầu việc kỹ thuật (component/entity/handler/API cho backend; page/component/hook/form cho frontend) kèm tín hiệu độ phức tạp (nhỏ/vừa/lớn) và trace về FR/AC/UC. PM đọc bảng này làm **input bổ sung** khi lập WBS — không bắt buộc, không thay DOC-06 là input tối thiểu chính của H3.

## §3. Lý do

Tách đúng vai: backend/frontend phân tích kỹ thuật phần việc của mình, PM tổng hợp thành WBS — không bắt PM tự suy ra việc kỹ thuật nó không rành, không bắt backend/frontend tự chốt Story Point (việc đó cần nhìn cả dự án, thuộc PM). Giữ nguyên quy tắc #2 của `contracts/handoff.md` ("Input tối thiểu là hợp đồng, không phải toàn bộ") — H3 không đổi input tối thiểu, chỉ được phép dùng thêm khi có.

## §4. Hệ quả

- **Được:** Story Point/estimate phần backend/frontend sát hơn; breakdown có trace rõ về FR/AC/UC, không phải đoán.
- **Trả giá:** PM phải chủ động đọc thêm output của 1–2 skill trước khi lập WBS cho module có code (module thuần nghiệp vụ/docs thì không cần). Hai skill mới phải tự giữ ranh giới với `architecture-dotnet`/`architecture-react` (không trùng luật layer/import) — khi luật layer đổi, chỉ sửa skill architecture, không sửa hai skill breakdown này.
- **Trung lập:** Không mở module mới, không đổi `rules.json`, không tăng gate cứng — hai skill là lá mới trong module đã có (ADR-022 QĐ-7, không câu nào trả lời "có").

---

## §5. [Kỹ thuật] Ảnh hưởng

- `src/backend/skills/minipower-backend-plan-dotnet/` (SKILL.md · README.md · CHANGELOG.md — mới)
- `src/frontend/skills/minipower-frontend-plan-react/` (SKILL.md · README.md · CHANGELOG.md — mới)
- `src/backend/README.md` · `src/frontend/README.md` — thêm dòng hub
- `contracts/handoff.md` — dòng **H3**: thêm câu optional-input, không đổi cột khác
- `src/pm/skills/minipower-pm-plan/SKILL.md` — thêm một câu đọc thêm input khi có
- `ADRs/README.md` — dòng index ADR-045
- Catalog lá: 2 lá mới (không đổi `rules.json`, không đổi cấu trúc gate)

## §6. [Kỹ thuật] Việc triển khai

| Bước | Việc | Done khi |
|---|---|---|
| 1 | Viết 2 `SKILL.md` + `README.md` + `CHANGELOG.md` theo khuôn `minipower-toolbox-skill-author` | File tồn tại, `name` ≡ thư mục, `description` kích hoạt được |
| 2 | Thêm dòng hub `backend/README.md` + `frontend/README.md` | Bảng skill có dòng mới, đúng link |
| 3 | Sửa `contracts/handoff.md` dòng H3 | Chỉ thêm câu, không xoá/đổi input tối thiểu cũ |
| 4 | Sửa `minipower-pm-plan/SKILL.md` | Thêm 1 câu, không đổi cấu trúc |
| 5 | `npm test` · `npm run link:check` từ `src/router/hooks/` | Cả hai xanh |

## §7. [Kỹ thuật] Xác minh

| # | Case | Expect |
|---|---|---|
| T1 | `npm test` trên branch này | Xanh, không đỏ mới so với baseline |
| T2 | `npm run link:check` | 0 link gãy mới |
| T3 | Đọc dòng H3 sau sửa | DOC-06 vẫn là input tối thiểu chính; câu mới chỉ là "dùng thêm nếu có" |
