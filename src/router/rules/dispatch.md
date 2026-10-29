# dispatch

Chỉ khi workspace (CWD đi lên) **có** `.minipower/`. Không có marker → không pack, không soi folder khác, làm đúng việc người hỏi.

Một task: **một** lá. Không agent bàn giao agent; task độc lập fan-out theo kế hoạch người đã OK, đích về agent chính. Không L3 hộ nghề.

**Route = LLM** (ADR-034 QĐ-4). Triage đơn hay phức (ADR-043): một lá phủ trọn → chọn **đúng một** `name:` skill lá trong catalog; không → `minipower-router-plan` lập kế hoạch, mỗi task một lá. Keyword `intent-dispatch.js` = gợi ý / test, không thay LLM.

**Thông báo trước khi chạy.** In một dòng rồi mới đọc `SKILL.md`:

`Sẽ chạy {tên skill} để xử lý {việc người hỏi}.`

Không chắc hai lá → hỏi người. Gatekeeper: kế hoạch nhiều bước, L3 MCP, Git, baseline — chờ người OK trước khi thực thi.

**Ngoại lệ script:** init / install → nhắc CLI, không route bằng phỏng vấn LLM.
