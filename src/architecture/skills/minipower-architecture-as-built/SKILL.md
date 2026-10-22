---
name: minipower-architecture-as-built
description: Đọc source để khai quật hệ đang chạy thành tài liệu as-built — trace một luồng theo 6 tầng / 5 câu hỏi, bằng chứng path:line với 4 nhãn, pattern theo stack .NET · Java · React · Flutter, CodeGraph tuỳ chọn. Dùng khi maintain, legacy, hệ cũ không tài liệu, đọc source, reverse-engineer, hiểu luồng, trace flow, codebase lạ — người trigger.
metadata:
  workflow: github
---

# minipower-architecture-as-built

Khai quật hệ đang chạy thành bản vẽ hoàn công. **Người trigger** — không hook tự gọi.

**Pack:** minipower · **Loại:** skill cross-phase · **Người trigger** — không hook nào tự gọi.

*As-built* là thuật ngữ xây dựng: **bản vẽ hoàn công** — mô tả cái **đã xây**, ngược chiều bản thiết kế mô tả cái **sắp xây**. Toàn bộ 19 DOC còn lại của minipower đặc tả cái sắp làm; skill này là chiều ngược.

**Điểm vào của chế độ `maintain`** ([minipower-router § Chế độ dự án](../../../router/skills/minipower-router/SKILL.md#chế-độ-dự-án-project_mode)). Dùng được ở mọi chế độ khi cần khai quật một vùng code không ai còn nhớ.

---

## Ranh giới — đọc trước khi dùng

| | |
|---|---|
| **Một vùng chạm, một lần chạy** | Không quét cả repo, không sinh DOC hàng loạt. Vùng = một module, một luồng nghiệp vụ, một file lớn |
| **Đầu ra là NHÁP + CÂU HỎI** | Không phải DOC. Người xác nhận thì mới thành DOC |
| **Mọi phát hiện phải trỏ bằng chứng** | `path:line`. Không có bằng chứng thì ghi vào phần *phỏng đoán*, không trộn vào phần *sự thật* |
| **Không chạy nền** | Không hook nào gọi skill này, không file watcher, không batch |
| **Không sửa code** | Đây là skill **đọc**. Muốn sửa thì mở CR |

**Ranh giới ba pass** ([reading-method §10](reference/reading-method.md#10-ba-pass-và-ranh-giới-với-một-vùng-chạm)): Pass 1 *Reconnaissance* được quét rộng cả repo nhưng **chỉ ra bản đồ** (Architecture · Module · Entry Map) — không đọc implementation, không sinh DOC, không kết luận nghiệp vụ; bản đồ là để chốt vùng chạm đúng. Pass 2 *Trace* và Pass 3 *Deep Dive* bám **vùng chạm đã chốt với người**; flow ngoài vùng → `doc-debt`, không mở.

> Vì sao chặt thế: agent tự khảo cổ rồi sinh hàng loạt DOC là cách nhanh nhất tạo ra một thư viện tài liệu **trông có vẻ đúng** mà không ai kiểm — tệ hơn không có tài liệu, vì người sau sẽ tin nó.

## Tầng tra cứu — codegraph (tuỳ chọn)

Wrap [codegraph](https://github.com/colbymchenry/codegraph) (tree-sitter → SQLite FTS5, 40+ ngôn ngữ, có MCP server + CLI, chạy local) làm tầng tra cứu cấu trúc.

| Có codegraph | Không có |
|---|---|
| Hỏi symbol / call graph / impact trực tiếp | Degrade về `Grep` + `Read` theo vùng hẹp |
| Rẻ token: trả đúng vùng liên quan | Đắt hơn — càng phải giữ vùng chạm hẹp |

**Kiểm khả dụng trước, không giả định.** Không có → nói ra một câu rồi làm tiếp bằng Read/Grep, **không** dừng và **không** bắt người cài. Việc đang là code và chưa ghi `.minipower/codegraph-offer.json` (`offered` hoặc `declined`) thì gợi ý cài **một lần** theo rule `codegraph-when-indexed` (lợi ích + lệnh từ repo), rồi ghi `offered`. Người bỏ qua → `declined`, không nhắc lại.

**Index sống ở local + `.gitignore`** — không commit, không CI cache. Index là dẫn xuất từ code; commit nó là tạo thứ sẽ lệch.

> Codegraph **không thay được** skill này: nó trả *cấu trúc* (symbol, call graph), skill trả *tài liệu có ID trace được, có người xác nhận* (business rule, quyết định, runbook).

## Quy trình

1. **Chốt vùng chạm với người.** "Khảo sát luồng thanh toán" — không phải "khảo sát hệ thống". Chưa rõ vùng → hỏi, đừng đoán.
2. **Kiểm codegraph** khả dụng; báo một câu chế độ đang dùng.
3. **Đọc `assets/archive/`** trước khi đọc code — nhưng theo **cột độ tin cậy** trong [`archive/README.md`](../../../router/project-skeleton/assets/archive/README.md): *"còn đúng"* đọc trước, *"đã lỗi thời"* chỉ đọc để hiểu lịch sử. **Không** tin tài liệu cũ hơn code.
4. **Khai quật theo phương pháp** — [reference/reading-method.md](reference/reading-method.md) (6 tầng · 5 câu hỏi · 3 pass) + đúng **một** pattern theo stack: [.NET](patterns/dotnet/SKILL.md) · [Java](patterns/java/SKILL.md) · [React](patterns/react/SKILL.md) · [Flutter](patterns/flutter/SKILL.md). Mỗi flow một [Flow Map nháp](templates/TPL-flow-map.tpl). Với mỗi phát hiện, ghi: điều rút ra · **bằng chứng `path:line`** · nhãn.
5. **Gắn một trong 4 nhãn bằng chứng** — không trộn (ADR-042 QĐ-4):

   | Nhãn | Nghĩa | Tương ứng cũ |
   |------|-------|--------------|
   | **Observed** | Đọc thẳng từ code / cấu hình, **có `path:line`** | ✅ Sự thật |
   | **Documented** | README, ADR, comment, OpenAPI, `assets/archive/` — kèm nguồn; tài liệu không thắng code | — |
   | **Inferred** `[Suy luận]` | Suy ra từ nhiều bằng chứng — **cần người xác nhận** | ❓ Phỏng đoán |
   | **Unknown** `[Chưa xác minh]` | Chưa đủ bằng chứng — vào câu hỏi | — |

   **Mâu thuẫn ⛔ là quy tắc dẫn xuất:** cùng một điểm có Documented và Observed nói khác nhau → gom thành mục riêng, nêu cả hai bên, **không** tự chọn bên đúng — việc đó của người.

6. **Trình người**: bản nháp + **danh sách câu hỏi**. Người xác nhận từng mục.
7. **Chỉ mục đã xác nhận mới thành DOC**, có ID (`{MOD}-BR-001`…) để `trace:check` kiểm được. Mục chưa xác nhận → `memory/open-questions.md`.
8. **Ghi nợ.** Vùng chưa khảo sát → [`memory/doc-debt.md`](../../../router/project-skeleton/memory/doc-debt.md).

## Đích đến theo DOC

Bám `docs_focus` của chế độ `maintain`:

| DOC | Khai quật cái gì | Bằng chứng điển hình |
|-----|------------------|----------------------|
| **DOC-04** Business Rules | Rule nghiệp vụ chôn trong code | `if` điều kiện, validate, bảng cấu hình |
| **DOC-08** SAD | Thành phần, ranh giới, luồng chính | cấu trúc thư mục, entrypoint, DI wiring |
| **DOC-10** Integration Spec | Hệ ngoài đang gọi/bị gọi | HTTP client, queue consumer, cron |
| **DOC-11** Data Model | Bảng, quan hệ, ràng buộc thật | migration, schema, index |
| **DOC-12** API Spec | Endpoint đang phục vụ ai | route, controller, contract test |
| **DOC-17** Deployment Guide | Deploy/rollback thế nào | CI config, Dockerfile, script vận hành |
| **DOC-09** ADR | Quyết định **mới** khi sửa hệ cũ | — (viết mới, không khai quật) |

Flow Map nháp distill về: luồng → **DOC-05**, rule lộ trong `if` / validator → **DOC-04**, endpoint → **DOC-12**, hệ ngoài → **DOC-10**. Không giữ bộ artifact riêng (`01-system-context.md`, `flows/`) song song hệ DOC.

**DOC-17 (runbook) thường có giá trị cao nhất** ở `maintain`: người tiếp quản cần biết *deploy thế nào, hỏng thì làm gì* trước khi cần biết use case là gì.

## Sự cố vận hành

Hệ đang chạy thì sự cố là đầu vào thật. Chỗ đứng: `docs/06-changes/incident/` — template [TPL-incident-report](../../../router/templates/TPL-incident-report.md) và [TPL-postmortem](../../../router/templates/TPL-postmortem.md).

Postmortem hay lộ ra business rule không ai biết — đó là **đầu vào tốt** cho as-built.

## Exit criteria

- [ ] Vùng chạm đã chốt với người, **không** phải cả repo
- [ ] Mọi mục Observed (Sự thật) có `path:line`; mỗi phát hiện đúng một nhãn
- [ ] Inferred (Phỏng đoán), Unknown và mục Mâu thuẫn ⛔ tách riêng, **không** trộn vào Observed
- [ ] Pass 1 chỉ ra bản đồ; DOC chỉ từ pass 2–3 sau khi người xác nhận
- [ ] Danh sách câu hỏi đã trình; chỉ mục **đã xác nhận** mới vào `docs/`
- [ ] Mục vào `docs/` có ID trace được
- [ ] Vùng chưa khảo sát đã ghi `memory/doc-debt.md`

## Anti-patterns

- Quét cả repo rồi sinh DOC hàng loạt (R5 — chính xác thứ skill này cấm); Pass 1 chỉ được ra bản đồ
- Đọc code theo file thay vì theo flow; suy luận rule từ tên method; coi effect / `build()` là xương sống nghiệp vụ ([anti-pattern đầy đủ](reference/reading-method.md#11-anti-pattern))
- Trình phỏng đoán như sự thật · phát hiện không `path:line`
- Tin `assets/archive/` hơn code khi hai bên mâu thuẫn
- Tự chọn bên đúng khi code khác tài liệu — việc đó của người
- Bắt người cài codegraph mới làm được
- Commit index codegraph vào repo


Hướng dẫn người: [README.md](README.md).
