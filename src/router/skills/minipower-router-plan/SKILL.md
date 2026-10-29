---
name: minipower-router-plan
description: Lập kế hoạch cho yêu cầu PHỨC chạm nhiều skill — chia task có tiêu chí hoàn thành đo được, trình người OK một lần, rồi điều phối tuần tự / song song và gọi review cuối. Dùng khi lập kế hoạch nhiều skill, nhiều bước, plan trước khi làm, chia task, phân chia công việc — không phải WBS/DOC-14 (minipower-pm-plan), không thực thi hộ, không agent bàn giao agent.
metadata:
  workflow: github
---

# minipower-router-plan

Gate mềm — kế hoạch là **tờ giấy người duyệt**. Verdict cuối của **người**.

**Pack:** router · **Loại:** cross-phase · **Không** sinh DOC — sinh *kế hoạch + nhật ký* trên chat theo khuôn [TPL-plan.md](../../templates/TPL-plan.md).

Hướng dẫn người: [README.md](README.md).

## Khi nào được gọi

Từ [minipower-router § Triage](../minipower-router/SKILL.md) khi yêu cầu là **PHỨC** (một lá không phủ trọn). Việc ĐƠN không qua đây.

Người nói *"không cần plan"* → trả về router, đi thẳng lá đầu, nhắc một dòng phần việc còn lại.

## Lập kế hoạch

**Đọc:** `name:` + `description` của catalog lá đã cài · bảng I/O trên `PACK.md` của pack liên quan · `memory/profile.json` (mode) · tầng micro/light/full.

**Không mở SOP** của lá nghề nào trong lúc lập kế hoạch. **Không sinh DOC**, không ghi file.

Điền khuôn TPL-plan:

1. Bảng tổng quan: một task một dòng; cột **Lá** là đúng `name:` catalog, không bịa.
2. Khối chi tiết mỗi task đủ bảy mục: Mô tả · Điều kiện cần · Tiêu chí hoàn thành · Phụ thuộc (cần *cái gì* từ task trước) · Input tối thiểu · Output · Gate.
3. Đánh `∥` chỉ khi task không chờ task khác, không ghi cùng file, khác module hoặc khác artifact.
4. Dòng cuối là **review** bằng lá `minipower-{pack}-review…` của pack sinh artifact; nhiều pack → mỗi pack một task review. Pack chưa có lá review → ghi `Lá: (chưa có — self-check theo PACK.md)` — đây là nợ ghi rõ, không phải review thật.
5. **Đề xuất tiêu chí riêng** cho từng task, mỗi dòng đo được: có số, lệnh, đường dẫn, `≥` / `=` / `0`. Tiêu chí "đầy đủ / rõ ràng" không hợp lệ. Ví dụ: *mỗi FR có ≥ 1 AC Given/When/Then* · *`trace:check` 0 WARN cho module TEN*.

Kèm một dòng tầng + mode. Kế hoạch sống trên chat; kéo dài nhiều phiên → người quyết ghi `memory/memory.md` dạng checklist.

## Trình người OK một lần

Trình kế hoạch **và** tiêu chí một lần. Người sửa, bớt, thêm, rồi OK. Người nói *"từng bước"* → chuyển sang OK từng task.

Sau OK, tiêu chí là **hợp đồng** của task: tự kiểm đối chiếu theo đó, review đối chiếu theo đó. Giữa chừng thấy tiêu chí sai hoặc thiếu → **không tự sửa, không tự thêm**; ghi nhật ký, báo về, trình người.

## Thực thi

Mỗi task là một lượt dispatch như router: `Sẽ chạy minipower-… để xử lý {việc} (task n/N).` → đọc SOP lá đó → làm → tự kiểm → báo kết quả. Mỗi lúc một lá.

| Task | Ai chạy | Cách |
|---|---|---|
| Có **Phụ thuộc** | Agent chính | Tuần tự, đúng thứ tự |
| Đánh **`∥`** | Agent con, qua harness (Agent tool / subagent của client), context sạch | Giao bằng **gói giao việc** của TPL; nhận lại bằng **gói báo về** |
| Gate `readiness` | Agent đang chạy task | Gọi [minipower-router-readiness](../minipower-router-readiness/SKILL.md), hỏi thiếu sót một lượt |
| Gate `⏸ người` | Agent chính | Dừng, hỏi người. Agent con gặp `⏸ người` → làm tới điểm dừng, báo về, agent chính hỏi |

Agent con **không** gọi agent khác, **không** mở task kế, **không** ghi ra ngoài, **không** hỏi người trực tiếp. Fan-out task `∥` theo kế hoạch người đã OK, đích về agent chính; Minipower không viết runtime.

Agent chính **tổng hợp** sau mỗi đợt: dedup finding theo `{DOC}#{section/ID}`, ghép trace, rồi mới sang task phụ thuộc kế hoặc review.

## Tự kiểm — tối đa 3 lần thử

Cho mọi task, tuần tự hay song song. Làm xong → đối chiếu từng tiêu chí (B1–B7 + riêng) → ghi đạt / chưa. Có tiêu chí chưa đạt → sửa → kiểm lại. **Tối đa 3 lần thử** = lần làm đầu + 2 lần sửa.

**Bốn điều kiện dừng** — gặp một là dừng, báo cáo, không thử tiếp:

| | Điều kiện | Ghi chú |
|---|---|---|
| a | Hết 3 lần vẫn có tiêu chí chưa đạt | Trần |
| b | Agent thấy **không xử lý được**: thiếu điều kiện cần, ngoài phạm vi lá, cần quyết định nghiệp vụ, tiêu chí sai | **Không gọi lại readiness** trong vòng sửa — trình người |
| c | Hai lần liên tiếp **cùng một cách** xử lý cho cùng tiêu chí | So cột *Cách xử lý* trong nhật ký. Phán đoán LLM |
| d | Sửa đòi **ghi ra ngoài** (`⏸ người`) hoặc đụng task khác | Dừng ngay, không tính lần |

Báo cáo khi dừng — nhật ký + output hiện tại + tiêu chí đã đạt / còn lại + đề xuất:

| Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả |
|---|---|---|---|

Agent con gửi báo cáo về agent chính; agent chính trình người.

## Review cuối — trần 3 vòng

Lá `*-review` của pack soi **tổng thể** sau khi các task của pack đó xong. Finding có địa chỉ `{DOC}#{section/ID}` hoặc `path:line`, và nêu **tiêu chí nào của task nào** bị vi phạm.

- Còn finding → chuyển về **đúng task, đúng lá**, sửa, gọi lại lá review.
- Review đầu = vòng 0; mỗi lượt sửa + review lại = một vòng. **Trần 3 vòng**, một bộ đếm **chung cả kế hoạch**.
- Dừng theo bốn điều kiện ở mục Tự kiểm, thêm: finding **ngoài kế hoạch** (scope mới) → dừng ngay, không tự thêm task.
- Nhật ký vòng, kèm kế hoạch:

| Vòng | Finding | Task # | Lá | Cách xử lý | Kết quả |
|---|---|---|---|---|---|

## Người ký PASS

0 finding, hoặc vòng lặp dừng → trình người: nhật ký + finding còn lại + đề xuất. Người chọn một: **PASS** · cho thêm vòng · tự sửa · nhận nợ ghi `memory/doc-debt.md` hoặc `memory/open-questions.md`.

## Ranh giới

- Gate **mềm**: không hook nào chặn verdict đơn/phức, tiêu chí đạt/chưa, PASS/BLOCK. Máy chỉ canh định dạng khuôn (test).
- Không thực thi hộ lá nghề. Không L3 hộ nghề. Không ghi `docs/02-baseline/`.
- **Không agent bàn giao agent** (ADR-022 QĐ-1): agent con chỉ báo về.
- Trần 3 và điều kiện dừng là lời; nhật ký là thứ người soi.

## Anti-patterns

- Mở SOP lá nghề lúc lập kế hoạch.
- Tiêu chí "đầy đủ", "rõ ràng", "đúng chuẩn" — không đo được.
- Đánh `∥` cho hai task ghi cùng file.
- Agent con hỏi người trực tiếp, hoặc tự mở task kế.
- Đếm quá 3, hoặc tự thêm task khi finding ngoài kế hoạch.
- Tự sửa tiêu chí giữa chừng.
