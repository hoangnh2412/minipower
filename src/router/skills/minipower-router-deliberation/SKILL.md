---
name: minipower-router-deliberation
description: Premise check trước khi làm việc Full: PROCEED RESHAPE STOP. Dùng khi có nên làm, nghị luận, deliberation — verdict người, máy không FAIL.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-router-deliberation

Gate mềm — Premise Check + nghị luận đa góc nhìn. Verdict cuối của **người** (QĐ-11).

**Pack:** minipower · **Loại:** skill dùng chung (cross-phase, **không** phải phase) · **Không** sinh DOC — sinh *quyết định + khung vấn đề*.

Chạy **trước** khi vào phase để tránh: viết DOC vô ích, chốt giải pháp sớm, bỏ sót góc nhìn. Output feed vào [minipower-discovery-survey](../../../discovery/skills/minipower-discovery-survey/SKILL.md) (problem/scope), [minipower-architecture-sad](../../../architecture/skills/minipower-architecture-sad/SKILL.md) (ADR), [minipower-analyst-cr](../../../analyst/skills/minipower-analyst-cr/SKILL.md) (CR lớn).

> **Theo tầng** ([minipower-router](../minipower-router/SKILL.md#phân-tầng-công-việc-micro--light--full)): Premise Check **bắt buộc ở Full** (module/DOC mới, đổi kiến trúc, discovery, đụng baseline). **Bỏ ở micro/light** (typo, sửa 1 FR trong DOC đã có) — trừ khi có bằng chứng mới làm nghi ngờ tiền đề.

**Ghi kết quả vào:** `brainstorm/YYYY-MM-DD.md` + assumption/decision → `memory/decision-log.md` / `memory/open-questions.md`. **Không** tự sinh file DOC.

---

## Protocol 1 — Premise Check (Cổng 0)

Trước khi bỏ công phân tích/viết: xác nhận **việc này đáng tồn tại**.

| # | Câu hỏi | Cần trả lời |
|---|---------|-------------|
| 1 | **Vấn đề gốc?** | Đây là gốc hay triệu chứng? (hỏi "tại sao" ~3 lần) |
| 2 | **Ai đau, đo được?** | Có stakeholder thật chịu đau; đo được (số, tần suất, chi phí) |
| 3 | **Đã có giải pháp?** | Process/tool hiện hữu giải quyết được mà không cần dự án/DOC này? |
| 4 | **Do-nothing baseline** | Không làm thì hậu quả gì? So với chi phí làm |
| 5 | **DOC có consumer?** | (Cho từng DOC) có người dùng thật — dev, test, khách ký? Hay chỉ "cho đủ bộ"? |
| 6 | **Tiền đề còn đúng?** | Có bằng chứng mới (khảo sát, phản hồi) làm lung lay động cơ ban đầu? |

**Verdict (bắt buộc chọn 1):**

| Kết luận | Khi nào | Hành động |
|----------|---------|-----------|
| ✅ **PROCEED** | Tiền đề vững, có consumer, đau đo được | Vào phase, ghi assumption |
| ♻️ **RESHAPE** | Vấn đề thật nhưng phát biểu/scope sai | Sửa problem statement trước khi làm |
| ⛔ **STOP** | Triệu chứng, đã có giải pháp, hoặc không consumer | Ghi lý do vào `brainstorm/`, không viết DOC |

**Reassessment trigger:** đang giữa phase mà #6 bật (bằng chứng mới) → **dừng**, chạy lại Premise Check.

### Theo chế độ dự án

Chế độ đọc từ `memory/profile.json`; định nghĩa ở [minipower-router § Chế độ dự án](../minipower-router/SKILL.md#chế-độ-dự-án-project_mode) — **không lặp lại ở đây**.

| | `standard` | `mvp` | `maintain` |
|---|---|---|---|
| Premise Check | **đủ 6 câu** ở Full | rút còn **1 · 2 · 4** (gốc · ai đau · do-nothing) | rút còn **1 · 4 · 6**; thêm *"hệ cũ đang làm gì ở chỗ này?"* |
| Câu 5 (DOC có consumer?) | luôn hỏi | bỏ — `docs_focus` đã chọn sẵn DOC nào cần | hỏi theo vùng chạm |
| Nghị luận đa góc nhìn | ≥3 góc | 1–2 góc, hoặc bỏ nếu quyết định đảo ngược được rẻ | ≥2 góc — sửa hệ đang chạy khó đảo ngược |
| Verdict | ghi `decision-log.md` | ghi khi là quyết định thật, không ghi cho mọi lựa chọn | ghi — hệ cũ thiếu "vì sao" là nợ đắt nhất |

Vì sao `mvp` giữ câu 1 · 2 · 4: chúng chặn thứ **tốn nhất là làm nhầm việc**. Bỏ câu 3 và 5 vì ở `mvp` chưa có bộ DOC để hỏi "có consumer không", còn "đã có giải pháp chưa" thường đã rõ lúc chọn làm MVP.

`maintain` giữ câu 6 (**tiền đề còn đúng?**) vì đây là chế độ dễ dính nhất: tài liệu cũ mô tả một hệ không còn tồn tại, tin theo là quyết định sai từ gốc.

> Gate này **mềm ở mọi chế độ** — không hook nào chặn trên verdict PROCEED/RESHAPE/STOP (QĐ-11). Verdict là **phán đoán ngữ nghĩa**, máy không kiểm được; nó chỉ thành điều kiện máy kiểm khi vật chất hoá thành DEC hoặc thành DOC mà `prereq-gate` soát sự tồn tại.

---

## Protocol 2 — Deliberation (Nghị luận đa góc nhìn)

Khung lại **đúng vấn đề + trade-off** trước khi chốt — chống chốt giải pháp sớm.

**Quy tắc:** mỗi góc nói **một lượt**, **không** tranh luận, **không** chốt giải pháp giữa chừng.

### Bước 1 — Chọn 3–5 góc nhìn (theo bài toán)

| Góc nhìn | Quan tâm chính | Sợ mất |
|----------|----------------|--------|
| Sponsor / Business | ROI, mục tiêu KD | Ngân sách, thời gian ra thị trường |
| End-user | Dễ dùng, đúng việc | Thao tác rườm rà, học lại |
| Operations / Support | Vận hành, giám sát | Sự cố, khó rollback |
| Security / Compliance | Rủi ro, tuân thủ | Rò rỉ, vi phạm audit |
| Finance / Cost | Chi phí sở hữu | Chi phí ẩn, license |
| Engineering / Architect | Khả thi, nợ kỹ thuật | Coupling, khó bảo trì |
| QC | Testable, coverage | Yêu cầu mơ hồ, không đo được |

### Bước 2 — Mỗi góc phát biểu 1 lượt

Với mỗi góc đã chọn: **mối lo #1** · **tiêu chí thành công của họ** · **điều họ nhất định không chấp nhận**.

### Bước 3 — Tổng hợp

- **Điểm hội tụ** — mọi góc đồng ý (→ ràng buộc cứng).
- **Căng thẳng còn sống** — trade-off chưa giải (→ câu hỏi cần sponsor/owner quyết).

### Bước 4 — Khung vấn đề (KHÔNG chốt giải pháp)

Phát biểu lại vấn đề + liệt kê trade-off cần quyết + assumption. Chuyển sang phase để giải.

**Khi nào dùng:** discovery (chốt problem/scope) · architecture (ADR có ≥2 phương án) · change-control (CR ảnh hưởng lớn).

---

## Format phản hồi

1. **Premise verdict** — PROCEED / RESHAPE / STOP + lý do (2–3 dòng)
2. **Góc nhìn** — bảng 3–5 vai, mỗi vai 1 lượt
3. **Điểm hội tụ** (ràng buộc cứng)
4. **Căng thẳng còn sống** (trade-off cần quyết)
5. **Vấn đề đã khung lại** (1 đoạn — chưa có giải pháp)
6. **Assumption / Unknowns** (kèm mức tin cậy: cao/vừa/thấp)
7. **Tiếp →** phase phù hợp ([minipower-discovery-survey](../../../discovery/skills/minipower-discovery-survey/SKILL.md) / [minipower-architecture-sad](../../../architecture/skills/minipower-architecture-sad/SKILL.md) / [minipower-analyst-cr](../../../analyst/skills/minipower-analyst-cr/SKILL.md))

## Exit criteria

- [ ] Có verdict Premise Check rõ ràng
- [ ] ≥3 góc nhìn, mỗi góc 1 lượt — không tranh luận vòng
- [ ] Điểm hội tụ + căng thẳng tách bạch
- [ ] Vấn đề được khung lại **không** kèm giải pháp
- [ ] Assumption/DEC ghi vào `memory/decision-log.md` hoặc `open-questions.md`, không nhồi `memory.md`

## Anti-patterns

- Nhảy sang giải pháp khi chưa khung xong vấn đề · bỏ qua góc Security/QC
- Viết DOC khi verdict là STOP · để các góc tranh luận qua lại (đúng ra: mỗi góc 1 lượt)
- Coi assumption là sự thật · bỏ reassessment khi có bằng chứng mới

Hướng dẫn người: [README.md](README.md).
