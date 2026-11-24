# Minipower — harness đa vai, không gate nội bộ

| | |
|---|---|
| **Ngày** | 2026-08-20 |
| **Trạng thái** | 🟣 **CANCEL** (2026-08-20, cùng ngày viết) — thay bởi [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md): giữ kiến trúc + tham-số-hoá gate theo **3 chế độ dự án** thay vì bỏ mọi gate. **Kế thừa:** QĐ-5 advisory (→ hành vi mode mvp/maintain) · QĐ-6 `trace:check` CI · §3 ánh xạ vai→công cụ · §2 phân loại gate |
| **Phạm vi** | Toàn `minipower/` — **pivot định vị**: từ *pipeline 6 phase có cổng* sang *harness hỗ trợ 7 vai, không block ở bước nào*. Chạm §0 và toàn bộ mô hình gatekeeper |
| **Nối tiếp** | **Huỷ** [ADR-003](../cancel/ADR-003-2026-07-20-minipower-gated-fanout-execution.md) · [ADR-013](../cancel/ADR-013-2026-07-26-minipower-senior-junior-execution.md) · [ADR-017](../cancel/ADR-017-2026-08-20-minipower-toolchain-openproject-github-outline-slack.md) · [ADR-018](../cancel/ADR-018-2026-08-20-minipower-phe-duyet-openproject-publish-outline.md) · **giữ** [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) (wrap-not-build) · [ADR-008](../todo/ADR-008-2026-07-25-minipower-proposal-suite.md) · [ADR-016](../todo/ADR-016-2026-08-02-minipower-discovery-tom-tat-tai-lieu-lon.md) |
| **Mục đích** | Chốt: minipower là **bộ công cụ gọi khi cần** cho mọi vai SDLC; **mọi phê duyệt sống ở công cụ ngoài**; kháng thể chống hallucination giữ lại dưới dạng **khuyến nghị, không chặn** |
| **Ảnh hưởng** | [AGENTS.md](../../AGENTS.md) §0 + mục gatekeeper + phân tầng micro/light/full · [minipower/SKILL.md](../../src/router/skills/minipower-router/SKILL.md) router · [rules.json](../../src/router/hooks/lib/rules.json) (`approval_gates`, `prereq_by_intent`) · `agents/approval-gate.md` · 3 skill [deliberation](../../src/router/skills/minipower-router-deliberation/SKILL.md) / [readiness-gate](../../src/router/skills/minipower-router-readiness/SKILL.md) / [doc-review](../../src/router/docs/parallel-work.md) · [COORDINATION.md](../../contracts/README.md) H1–H6 · [docs/pipeline.md](../../src/router/docs/pipeline.md) · `install/*` (`permissions.deny`) |

---

## §0. Quyết định

| # | Nội dung |
|---|---|
| **QĐ-1** | **Minipower = harness.** Bộ skill + template + memory + dữ liệu, **gọi khi cần**, không có luồng tuần tự bắt buộc. 6 phase / 19 DOC trở thành **thư viện**, không phải đường ray |
| **QĐ-2** | **Không block ở bất kỳ bước nào.** Không skill nào được từ chối làm việc vì "thiếu tiền đề" hay "chưa có DEC chốt" |
| **QĐ-3** | **Mọi phê duyệt sống ở công cụ ngoài:** OpenProject (công việc, duyệt) · **Gitlab** (mã nguồn, MR review, CI) · Outline (tài liệu đã publish) · Slack (thông báo) |
| **QĐ-4** | **Phục vụ 7 vai:** PM · BA · SA · DEV · DevOps · QC · Operation — mọi skill dùng được cho bất kỳ vai nào |
| **QĐ-5** | **Kháng thể giữ lại dạng khuyến nghị:** `readiness-gate` **advisory** — liệt kê trọn gói cái còn thiếu + rủi ro, rồi **vẫn làm** nếu người bảo làm. `doc-review` giữ 5 chiều nhưng verdict là **báo cáo**, không BLOCK |
| **QĐ-6** | **Trace UC→FR→AC→Test giữ nguyên là moat**, kiểm bằng **script đối chiếu ID** (`trace:check`) — Node thuần trong `hooks/`, có golden test — và **chạy trong CI Gitlab** của dự án đích. CI **được phép fail**: đó là cưỡng chế ở **công cụ ngoài**, đúng QĐ-3, **không** mâu thuẫn QĐ-2 (skill minipower vẫn không chặn ai). Mức nghiêm: **fail** khi ID trỏ sai / ID trùng · **warn** khi FR thiếu AC hoặc AC thiếu Test |

---

## §1. "Harness" nghĩa là gì ở đây

| | Trước (pipeline có cổng) | Sau (harness) |
|---|---|---|
| Thứ tự làm việc | 6 phase tuần tự, cổng giữa các chặng | **Không thứ tự** — gọi skill nào cũng được, lúc nào cũng được |
| Điều kiện bắt đầu | `prereq_by_intent` chặn nếu thiếu DOC | **Không điều kiện** — thiếu thì báo, vẫn làm |
| Vai trò | BA + SA + TPM là chính | **7 vai ngang nhau** |
| Phê duyệt | `approval_gates` + DEC trong repo | **Ở OpenProject / Gitlab MR** |
| Vai của DOC-01…19 | Chặng phải qua | **Template lấy ra dùng khi cần** |
| Vai của `auto-routing` | Ép đúng phase | **Gợi ý** skill/template hợp ngữ cảnh |

**Vẫn là harness có tri thức, không phải prompt library** — nhờ ba thứ giữ nguyên: `rules.json` (rules-as-data + golden test), memory theo chủ đề + ID ổn định, và 19 template chuẩn nghề. Xem rủi ro §6.

---

## §2. Số phận từng loại "gate" (phải phân biệt, không gộp làm một)

| Loại | Là gì | Sau ADR này |
|---|---|---|
| **Approval gate** (`approval_gates`, 7 cổng ký) | Chữ ký người giữa các chặng | 🟣 **Bỏ khỏi minipower** → OpenProject / Gitlab MR approval |
| **Premise gate** ([deliberation](../../src/router/skills/minipower-router-deliberation/SKILL.md)) | "Việc này có đáng làm không" | ⚪ **Giữ làm skill gọi khi cần** — không tự bật, không chặn |
| **Readiness gate** ([readiness-gate](../../src/router/skills/minipower-router-readiness/SKILL.md)) | Soát tiền đề trước khi sinh artifact | 🟡 **Advisory** (QĐ-5) — hỏi trọn gói một lượt, ghi nợ `open-questions.md`, **rồi vẫn làm** |
| **QC gate** ([doc-review](../../src/router/docs/parallel-work.md)) | Đối kháng 5 chiều, BLOCK baseline | 🟡 **Báo cáo** — vẫn 5 chiều, vẫn fan-out per-module, nhưng verdict là thông tin |
| **Read-guard / `permissions.deny`** | Hook chặn đọc baseline/legacy | 🟡 **Nhắc thay vì chặn** |
| **Xác nhận hành động ra ngoài** | Gửi Slack, tạo MR, publish Outline | 🔒 **KHÔNG bỏ** — xem §5 |

---

## §3. Ánh xạ vai → công cụ *(kế thừa ADR-017 §1, đổi Github → Gitlab)*

| Vai | Việc chính (skill minipower) | Công cụ ngoài |
|---|---|---|
| **PM** | Kế hoạch, WBS, ước tính, báo cáo, change request | OpenProject · Slack |
| **BA** | Biên bản → BR/FR/NFR/UC/AC → DOC-03…07, 13, 19 | Outline · OpenProject |
| **SA** | SAD, ERD, API spec, integration spec | Outline · Gitlab |
| **DEV** | Code + unit test trace về FR/AC | **Gitlab** (branch/MR/CI) · OpenProject |
| **DevOps** | Deployment guide, pipeline, vận hành | Gitlab CI · Slack |
| **QC** | Test strategy, test case per-FR, kết quả | Gitlab · OpenProject |
| **Operation** | Incident, postmortem, runbook | Slack · OpenProject · Outline |

Chưa có MCP cho công cụ nào → **vẫn làm việc bình thường trên markdown trong repo**; công cụ ngoài là nơi đến, không phải điều kiện.

---

## §4. Nguyên tắc bị đụng — và việc phải điều chỉnh

| Nguyên tắc | Đổi gì | File phải sửa |
|---|---|---|
| §0 `AI = trợ lý · Người quyết cuối` | **Không đổi bản chất** — chỉ dời *nơi* quyết ra ngoài | [AGENTS.md](../../AGENTS.md) §0 (diễn đạt lại) |
| "Gatekeeper — 3 gate + boundary H1–H6" | **Bỏ** — 3 skill thành dịch vụ; H1–H6 thành **gợi ý phối hợp** | AGENTS.md · [COORDINATION.md](../../contracts/README.md) · [pipeline.md](../../src/router/docs/pipeline.md) |
| "Chỉ thực thi khi tài liệu đủ rõ" | **Advisory** (QĐ-5) | [readiness-gate/SKILL.md](../../src/router/skills/minipower-router-readiness/SKILL.md) · `prereq_by_intent` trong [rules.json](../../src/router/hooks/lib/rules.json) |
| Trace UC→FR→AC→Test | **Giữ**, thêm `trace:check` + **job CI Gitlab** (QĐ-6) — cưỡng chế chuyển từ *gate trong repo* sang *pipeline ngoài* | `hooks/` (script + test) · `package.json` · template `.gitlab-ci.yml` trong [project-skeleton](../../src/router/project-skeleton/) |
| baseline / CR governance | **Định nghĩa lại**: baseline = version đã publish Outline / tag Gitlab; `change-control` ghi delta, không chặn | [change-control](../../src/analyst/skills/minipower-analyst-cr/SKILL.md) · [doc-versioning.md](../../src/router/docs-skeleton/00-governance/doc-versioning.md) |
| Phân tầng micro/light/full | **Bỏ** — không còn gate để bật/tắt | AGENTS.md · [minipower/SKILL.md](../../src/router/skills/minipower-router/SKILL.md) |
| `approval_gates` + guardrail cổng | **Xoá khỏi SSOT** hoặc đổi thành bảng ánh xạ trạng thái OpenProject | [rules.json](../../src/router/hooks/lib/rules.json) · `agents/approval-gate.md` → `gen` → `test` → `gen:check` |
| Co lại trước khi mở rộng · rules-as-data · wrap-not-build | **Không đổi** | — |

---

## §5. Cái KHÔNG đổi (đừng hiểu nhầm "không block")

| | |
|---|---|
| **Hành động ra thế giới thật vẫn cần người bấm** | Gửi Slack, tạo/sửa work package, mở MR, publish Outline — AI **soạn**, người **bấm**. Đây là ràng buộc an toàn của harness chạy AI, **không phải** quy trình SDLC của minipower, và ADR không bỏ được nó |
| **Không tự viết SDK/adapter** | Wrap MCP ([ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) §5.2) |
| **Không thêm nền tảng thứ tư** | 4 công cụ là mặt tích hợp duy nhất |
| **Rules-as-data + golden test + CI hook** | Mọi thay đổi `rules.json` vẫn theo vòng `gen → test → gen:check` |
| **Một-owner-một-module khi fan-out** | [parallel-work.md](../../src/router/docs/parallel-work.md) giữ nguyên |

---

## §6. Rủi ro & cách chặn

| # | Rủi ro | Cách chặn |
|---|---|---|
| **R1** | **Trượt thành Prompt Library** — bỏ gate + bỏ luồng, còn lại tập skill rời. Đây đúng thứ [ADR-002](../done/ADR-002-2026-07-20-dinh-huong-minipower-ai-ho-tro-ra-quyet-dinh.md) tuyên bố *không phải* | Giữ ba tài sản không-phải-prompt: `rules.json` + golden test · memory + ID ổn định · 19 template chuẩn nghề. Đo bằng: xoá hết SKILL.md đi thì còn lại gì có giá trị? |
| **R2** | **Trace rơi rụng** — không ai đối chiếu ID nữa | `trace:check` (QĐ-6) chạy tự động trong **CI Gitlab**; ID trỏ sai/trùng ⇒ **pipeline đỏ**. Đây là chỗ moat được giữ sau khi bỏ gate nội bộ |
| **R3** | **AI sinh artifact khi tiền đề rỗng** | readiness-gate advisory vẫn nói thẳng cái thiếu + rủi ro trước khi làm |
| **R4** | **Phê duyệt "ở ngoài" nhưng không ai làm** — bỏ gate trong repo mà OpenProject/Gitlab chưa dựng ⇒ mất kiểm soát ở cả hai nơi | Trước khi bỏ `approval_gates`, xác nhận OpenProject/Gitlab đã có luồng duyệt thật (§9 Q1) |
| **R5** | **Baseline mất nghĩa** ⇒ CR không biết so với cái gì | Định nghĩa lại baseline = version publish Outline / tag Gitlab (§4) trước khi sửa `change-control` |

---

## §7. ADR bị huỷ & phần kế thừa

| ADR | Kế thừa vào ADR này |
|---|---|
| [ADR-003](../cancel/ADR-003-2026-07-20-minipower-gated-fanout-execution.md) | Cơ chế **fan-out per-module** (skill `fan-out` giữ nguyên, bỏ điều kiện "phải có DEC cổng trước") · thứ tự requirements · DOC-19 |
| [ADR-013](../cancel/ADR-013-2026-07-26-minipower-senior-junior-execution.md) | **Hợp đồng giao việc 7 trường** + governance test-case → thành **template khuyến nghị** khi giao việc cho sub-agent, không phải cổng |
| [ADR-017](../cancel/ADR-017-2026-08-20-minipower-toolchain-openproject-github-outline-slack.md) | **Ánh xạ vai → công cụ** (§3) · phân loại L1/L2/L3 · ranh giới không-tự-ghi-ra-ngoài |
| [ADR-018](../cancel/ADR-018-2026-08-20-minipower-phe-duyet-openproject-publish-outline.md) | **Mô hình 3 mặt phẳng** (git authoring · công cụ ngoài approval · Outline publish) · back-ref "approved via {ref}" trong DEC |

---

## §8. Việc triển khai (thứ tự đề xuất)

| # | Việc | Xác minh |
|---|---|---|
| 1 | Viết lại [AGENTS.md](../../AGENTS.md) §0 + bỏ mục gatekeeper/phân tầng | Đọc lại: không còn câu nào hứa "chặn" |
| 2 | `rules.json`: bỏ `approval_gates`, đổi `prereq_by_intent` thành advisory | `npm run gen && npm test && npm run gen:check` xanh |
| 3 | Xoá/viết lại `agents/approval-gate.md` | `gen:check` xanh |
| 4 | Sửa 3 skill gate → dịch vụ/advisory/báo cáo | Không skill nào còn từ chối làm việc |
| 5 | Nới read-guard + `permissions.deny` từ chặn → nhắc | Smoke hook |
| 6 | Viết `trace:check` (Node thuần + golden test) **+ job CI** | `npm run trace:check` chạy đúng trên project-skeleton; template `.gitlab-ci.yml` fail khi ID trỏ sai/trùng, warn khi thiếu AC/Test |
| 7 | Sửa [COORDINATION.md](../../contracts/README.md) H1–H6 + [pipeline.md](../../src/router/docs/pipeline.md) sang ngôn ngữ gợi ý | — |
| 8 | Định nghĩa lại baseline/CR | [change-control](../../src/analyst/skills/minipower-analyst-cr/SKILL.md) |

---

## §9. Câu hỏi mở

| # | Câu hỏi | Đề xuất |
|---|---|---|
| **Q1** | OpenProject/Gitlab **đã có luồng duyệt thật** chưa, hay đang dựng? | Nếu chưa, giữ `approval_gates` ở dạng **bảng tham chiếu** (không cưỡng chế) tới khi luồng ngoài chạy — chặn R4 |
| **Q2** | 19 DOC giữ nguyên số lượng, hay rút gọn khi không còn là chặng bắt buộc? | Giữ nguyên — template thừa không hại, thiếu mới hại |
| **Q3** | `fan-out` bỏ điều kiện "DEC cổng trước" — có cần điều kiện thay thế nào không? | Không; chỉ cần biết module in-scope từ DOC-03 |
| **Q4** | [lark-work-assistant.md](../../src/router/agents/lark-work-assistant.md) (Lark rời lộ trình) | Gỡ khỏi bảng trigger router; giữ file làm tham chiếu khi viết bản OpenProject/Slack |
| **Q5** | `trace:check` phân phối thế nào tới dự án đích — script trong pack, hay copy vào mỗi repo? | Script sống trong pack (một SSOT); `.gitlab-ci.yml` của dự án đích gọi tới. Tránh mỗi repo một bản lệch nhau ([ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md): không test → drift) |

---

## §10. Tham chiếu

- [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) — wrap-not-build, bảng borrow (còn hiệu lực; bỏ S1 constitution-as-gate và P2 test-first-gate)
- [ADR-002](../done/ADR-002-2026-07-20-dinh-huong-minipower-ai-ho-tro-ra-quyet-dinh.md) — định vị *AI Project Intelligence*, cảnh báo Prompt Library (R1)
- [ADR-001](../done/ADR-001-2026-07-17-danh-gia-minipower-va-chien-luoc-phat-trien.md) — "không test → drift", kỷ luật SSOT + golden test (giữ nguyên)
- [parallel-work.md](../../src/router/docs/parallel-work.md) · [token-guard.md](../../src/router/docs/token-guard.md) — không đụng
