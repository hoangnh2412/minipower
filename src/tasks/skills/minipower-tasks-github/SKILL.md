---
name: minipower-tasks-github
description: Đọc, lọc, tìm, soạn nháp và ghi GitHub Issue theo L1–L3, kèm nhãn, sub-issue và thẻ trên Project; repo đích lấy từ git remote. Dùng khi việc trên GitHub, issue, nhãn, board, project, tasks_provider github — không dùng cho pull request, commit, review code.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-tasks-github

SOP MCP mặt **`tasks`**, provider GitHub. Wrap tool, không copy schema API. Người: [README.md](README.md). Persona: [agents/minipower-tasks-github.md](../../agents/minipower-tasks-github.md). Cổng L1–L3: [rules/l1-l2-l3-tasks.md](../../rules/l1-l2-l3-tasks.md).

**Chỉ cơ chế.** Khuôn riêng và vòng đời backlog của chính repo minipower nằm ở [minipower-toolbox-backlog](../../../toolbox/skills/minipower-toolbox-backlog/SKILL.md) — lá đó gọi lá này ở bước đọc và ghi.

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| MCP chưa có / lỗi / thiếu quyền | [workflows/connect.md](workflows/connect.md) |
| Tìm / lọc / tóm tắt / issue #n / board | [workflows/l1-read.md](workflows/l1-read.md) |
| Đề xuất tạo / sửa / đóng issue | [workflows/l2-preview.md](workflows/l2-preview.md) → OK → [workflows/l3-write.md](workflows/l3-write.md) |
| Phân vân issue hay sub-issue, nhãn nào, đóng với lý do gì | [reference/github-mapping.md](reference/github-mapping.md) |

**Không dùng** cho pull request, commit, review code (pack [`vcs/`](../../../vcs/README.md)), Outline, OpenProject, Lark, sửa `docs/` FR.

## Quy tắc cốt lõi

- **Repo đích lấy từ `git remote`** của thư mục đang làm việc (`origin`, dạng `owner/repo`). Không khai repo trong file cục bộ. Không có remote, nhiều remote, hoặc remote không phải GitHub → **hỏi một lượt**, không đoán.
- **Hai ngữ cảnh, phân biệt bằng `memory/profile.json`:**
  - **Có** file đó → đang ở dự án đích. `tasks_provider` khác `github` → **dừng**, không gọi MCP GitHub. Đổi provider → `minipower init`.
  - **Không có** file đó → đang ở repo công cụ (minipower hoặc repo lẻ). Bỏ kiểm provider, vẫn giữ nguyên L1–L3.
- **Mọi thao tác GitHub đi qua MCP, không có đường thứ hai.** Cấm `gh`, cấm `curl`, cấm `git push`, cấm cài thêm công cụ dòng lệnh. Thiếu tool MCP thì **dừng và báo**, không rẽ sang CLI — rẽ đường khác khi đường chính hỏng là fallback, mà fallback chưa được người đồng ý thì không viết. Ngoại lệ duy nhất là `git remote` để biết repo đích: nó đọc cấu hình local, không gọi GitHub.
- **Đầu phiên:** kiểm tool GitHub trong catalog. Không thấy / lỗi / 401 / 403 → [connect.md](workflows/connect.md), **không bịa dữ liệu issue**.
- Schema tool = SSOT runtime. Tên hay gặp: `list_issues`, `search_issues`, `issue_read`, `issue_write`, `add_issue_comment`, `sub_issue_write`, `get_label`, `projects_list`, `projects_get` — **chỉ gọi tên có trong catalog**.
- **Nhãn: gán thẳng, không liệt kê.** Tên nhãn đã biết trong phiên hoặc người đã nói thì dùng luôn. **Không** gọi tool liệt kê nhãn trước mỗi lần tạo — tốn một vòng gọi cho thứ hiếm khi đổi.
- **Không chắc một nhãn có tồn tại không** → xác minh bằng `get_label` đúng **một** tên, không kéo cả danh sách. Không xác minh được → **không gắn nhãn đó**, ghi vào bảng cho người quyết. Lý do: tài liệu GitHub không nói rõ nhãn lạ bị bỏ im lặng hay bị tạo mới, cả hai đều xấu.
- **Không tự tạo nhãn mới**, không gắn nhãn gần giống cho đủ.
- **Nhãn và trạng thái đóng/mở là sự thật; Project chỉ là bảng nhìn.** Không đổi cột Status thay người. Thiếu quyền Projects → nói thẳng "chưa đọc được board", không suy ra từ nhãn.
- **Thân issue là lời của người, bình luận là chỗ của AI.** Nội dung người gửi thành **thân issue**, giữ nguyên câu chữ; AI chỉ được tách đoạn và sửa lỗi gõ rõ ràng. **Không** viết lại bằng giọng AI, **không** thêm câu không phải của người, **không** tóm tắt.
- **Mọi thứ AI sinh ra đều xuống bình luận**: phân tích, câu hỏi, đề xuất, bản tóm tắt chốt yêu cầu, mã ADR. AI **không sửa thân issue**, kể cả về sau — trừ khi người yêu cầu rõ ràng.
- **Người duyệt cả tiêu đề lẫn nội dung trước khi tạo.** Bảng L2 chỉ có tiêu đề là **chưa đủ** — mọi dòng sẽ ghi chữ phải kèm khối nội dung **nguyên văn** như sắp đăng. Không bao giờ ghi một issue mà người mới chỉ thấy tiêu đề.
- **Soạn ngắn ngay từ đầu**, đọc hết một thẻ trong khoảng nửa phút. Dài thì viết lại cho gọn, **không** cắt bớt lúc trình.
- **Đóng issue luôn kèm lý do**: `completed` · `not_planned` · `duplicate`. Không đóng im lặng.
- **Tìm trùng là điều kiện chặn của việc tạo issue.** Chưa chạy tìm trùng thì **không** được trình bảng L2 có dòng `tạo`, và **không** được sang L3.
- **Tìm trùng chỉ đọc tiêu đề, không đọc thân issue.** Bắt buộc truyền `fields: ["number", "title", "state"]` cho `list_issues` hoặc `search_issues` — bỏ `body` là bỏ phần tốn token nhất. Chỉ mở thân **một** thẻ khi đã nghi trùng và cần xác nhận, không mở hàng loạt.
- **Tiêu đề phải mang từ khóa để tìm trùng chạy được.** Chứa danh từ định danh: tên lá skill, tên module, tên file, tên nhãn, tên lệnh — thứ người sau sẽ gõ khi đi tìm. Tránh mở đầu bằng động từ mơ hồ kiểu *cải thiện*, *xem xét*, *vấn đề với*. Khoảng 6 tới 12 từ.
- **Thấy thẻ gần giống → dừng, báo người, không tự quyết.** Báo gồm: số thẻ, tiêu đề, trạng thái, một dòng vì sao nghi trùng. Kèm ba lựa chọn để người chọn: **gộp** vào thẻ cũ · **bình luận** thêm vào thẻ cũ · **mở thẻ mới**. Người chọn mở mới dù biết trùng → ghi một dòng lý do vào thân thẻ mới.
- Tìm issue = L1, không skill riêng.
- L3 chỉ sau **một** bảng L2 đã OK. Không có tool ghi → L3 = hướng dẫn thao tác tay, không bịa tên tool.
- Map `{MOD}-FR-` / `T-NNN` trong thân issue; **không** copy body FR.
- **Luôn soát nội dung trước khi đăng**, không cần biết repo công khai hay riêng tư: không secret, không tên khách hàng, không tên người. Bỏ hẳn bước hỏi GitHub về trạng thái repo — ngưỡng này áp cho mọi repo nên hỏi là thừa một vòng gọi.
- Back-ref `memory/memory.md` **chỉ khi** người yêu cầu một dòng.

## Output

- Connect: kết quả kiểm tool và quyền (PASS/FAIL theo từng mặt) + cách sửa.
- L1: tóm tắt 3–7 bullet + mục mở (+ bảng nếu cần).
- L2: bảng `hành động | tiêu đề | nhãn | trạng thái | map ID | ghi chú`, **cộng khối tiêu đề và nội dung nguyên văn** cho mỗi dòng sẽ ghi chữ.
- L3: `#NNN` + link, **hoặc** "chưa ghi — thiếu tool/quyền".
