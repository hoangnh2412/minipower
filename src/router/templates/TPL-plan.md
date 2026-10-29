# Kế hoạch — {yêu cầu, một câu}

| Tầng | Mode | Ngày | Trạng thái |
|------|------|------|------------|
| micro \| light \| full | standard \| mvp \| maintain | YYYY-MM-DD | chờ OK \| đã OK \| PASS |

**Khi nào dùng:** [minipower-router](../skills/minipower-router/SKILL.md) triage ra **PHỨC** (một lá không phủ trọn yêu cầu) → [minipower-router-plan](../skills/minipower-router-plan/SKILL.md) điền khuôn này. Kế hoạch **sống trên chat**, không ghi file DOC; kéo dài nhiều phiên → người quyết ghi `memory/memory.md` dạng checklist `[ ] #n`.

Nguyên tắc: kế hoạch và tiêu chí là **tờ giấy người duyệt** trước khi chạy. Mỗi task một lá. Không agent bàn giao agent. Người ký PASS cuối.

## Tổng quan

| # | Việc | Lá | Module | Phụ thuộc | ∥ | Gate |
|---|---|---|---|---|---|---|
| 1 | {một câu} | `minipower-…` | {MOD} | — | ∥ | readiness |
| N | Review {pack} | `minipower-{pack}-review…` hoặc *(chưa có — self-check theo PACK.md)* | | #… | | review |

- **Lá** = đúng `name:` trong catalog đã cài. Không bịa tên.
- **∥** chỉ đánh khi cả ba đúng: không chờ task khác · không ghi cùng file · khác module hoặc khác artifact. Một module một owner.
- Dòng cuối luôn là **review** của pack sinh artifact; nhiều pack → mỗi pack một dòng review, đặt sau task sinh artifact của pack đó.

## Chi tiết task

Mỗi task một khối, đủ bảy mục. Lặp khối cho từng task.

### Task #{n} — {việc}

| Mục | Nội dung |
|---|---|
| Mô tả | Làm gì, trên vùng nào, cho ai |
| Điều kiện cần | Phải có gì **trước** khi bắt đầu mới đạt hết tiêu chí: DOC, ID, quyết định, quyền, dữ liệu. Thiếu → ghi rõ ai cấp, hoặc task không khởi động |
| Tiêu chí hoàn thành | Cơ bản B1–B7 (kế thừa, không chép lại) · tiêu chí riêng, mỗi dòng đo được (xem *Thế nào là đo được*) |
| Phụ thuộc | #k: cần **cái gì** từ #k (ID, file, quyết định) — không chỉ số thứ tự |
| Input tối thiểu | Từ bảng I/O trên `PACK.md` của pack |
| Output | Artifact hoặc ID sinh ra |
| Gate | `—` · `readiness` · `⏸ người` · `review` |

## Gate

| Gate | Nghĩa |
|---|---|
| `—` | Soạn nháp, phân tích. Chạy sau khi người OK kế hoạch, không hỏi lại |
| `readiness` | Task thực thi đầu tiên của một intent có tiền đề. Gọi [minipower-router-readiness](../skills/minipower-router-readiness/SKILL.md), hỏi thiếu sót **một lượt** |
| `⏸ người` | Dừng chờ người: MCP ghi ra ngoài, Git, ghi `docs/02-baseline/`, ghi DOC cuối ở tầng Full |
| `review` | Task review, finding đi vào vòng review–rework |

## Thế nào là đo được

Một tiêu chí hợp lệ trả lời được **đúng / sai** bằng một kiểm tra cụ thể: file tồn tại ở đường dẫn X · đếm được N mục · lệnh Y chạy xanh · grep Z bằng 0 · mỗi ID dạng A có ≥ 1 ID dạng B trỏ tới · người ký.

Tiêu chí kiểu *"đầy đủ"*, *"rõ ràng"*, *"chất lượng tốt"* **không hợp lệ** — viết lại thành thứ đếm được. Phép thử: *cái gì FAIL được khi làm sai?* Không trả lời được → chưa phải tiêu chí.

## Tiêu chí cơ bản (B1–B7)

Mọi task kế thừa, không chép lại vào khối chi tiết.

| # | Tiêu chí cơ bản | Cách kiểm |
|---|---|---|
| B1 | Output tồn tại đúng đường dẫn / đúng DOC đã khai | `ls`, mở file |
| B2 | ID theo hệ `{MOD}-{UC\|FR\|BR\|AC\|NFR}-NNN`, `DEC-`, `ADR-`; không trùng | `trace:check` không FAIL |
| B3 | Không còn `TBD` ở mục bắt buộc của template; `TBD` còn lại có chủ và hạn | grep `TBD` + đối chiếu |
| B4 | Cross-ref bằng ID, không copy nội dung FR giữa module | đọc chéo |
| B5 | Link markdown không gãy mới | `link:check` 0 MỚI |
| B6 | Đụng code: build / test / lint của repo đích xanh | lệnh của repo đích |
| B7 | Không ghi ra ngoài (MCP, Git, baseline) khi task không có Gate `⏸ người` | nhật ký task |

## Gói giao việc

Agent chính → agent con, cho task đánh `∥`. Cơ chế fan-out là của harness (Agent tool / subagent của client); gói này chỉ nói **giao cái gì**.

```text
Task #{n}/{N} · Lá: minipower-… · Module: {MOD}
Mô tả: …
Điều kiện cần: …
Tiêu chí: B1–B7 + [tiêu chí riêng, từng dòng]
Input: … · Output: … · Gate: …
Vùng ghi: {đường dẫn} — ngoài vùng này không chạm
Ranh giới: không gọi agent khác · không mở task kế · không ghi ra ngoài · không hỏi người trực tiếp (báo về, agent chính hỏi)
Trả về theo "Gói báo về"
```

## Gói báo về

Agent con → agent chính. Agent chính tổng hợp (dedup finding theo `{DOC}#{section/ID}`, ghép trace) rồi mới sang task kế hoặc review.

```text
Task #{n}/{N} · Kết quả: ĐẠT | DỪNG (lý do a/b/c/d — xem Nhật ký tự kiểm)
Output: {đường dẫn / ID}
Tiêu chí:
| Tiêu chí | Đạt / Chưa | Bằng chứng |
Nhật ký tự kiểm: (bảng dưới)
Đề xuất cho người: …
```

## Nhật ký tự kiểm

Mỗi task, **tối đa 3 lần thử** (lần làm đầu + 2 lần sửa). Dừng sớm khi: (a) hết 3 lần · (b) không xử lý được · (c) hai lần liên tiếp cùng một cách · (d) sửa đòi ghi ra ngoài hoặc đụng task khác.

| Lần | Tiêu chí chưa đạt | Cách xử lý | Kết quả |
|---|---|---|---|
| 1 | … | … | còn / đã đóng |
| 2 | … | … | … |
| 3 | … | … | dừng — lý do |

## Nhật ký review

Một bộ đếm **chung cả kế hoạch**, **trần 3 vòng**. Review đầu = vòng 0; mỗi lượt sửa + review lại = một vòng. Finding ngoài kế hoạch → dừng, không tự thêm task.

| Vòng | Finding | Task # | Lá | Cách xử lý | Kết quả |
|---|---|---|---|---|---|
| 0 | `{DOC}#{section/ID}` hoặc `path:line` — vi phạm tiêu chí nào | #… | `minipower-…` | — | N finding |
| 1 | … | #… | `minipower-…` | … | còn / 0 finding |

## Ký

| Kết luận | Người ký | Ngày |
|---|---|---|
| PASS · thêm vòng · tự sửa · nhận nợ → `memory/doc-debt.md` / `memory/open-questions.md` | | |
