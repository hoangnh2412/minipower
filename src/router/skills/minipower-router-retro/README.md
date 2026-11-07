# minipower-router-retro

Biến phản hồi "làm chưa tốt" của bạn thành một dòng ghi trong sổ dự án, và (nếu bạn OK) một GitHub Issue ẩn danh gửi về tác giả Minipower. Agent đọc [SKILL.md](./SKILL.md).

Atomic pack `router/`. Không tự sửa skill, không tự đăng khi chưa bạn OK, không auto improve (ADR-044 §3).

## Khi nào dùng

| Dấu hiệu | Ví dụ |
|---|---|
| Bạn nói skill vừa chạy chưa tốt | *"Chỗ này sai rồi"*, *"rút kinh nghiệm chỗ này"* |
| Finding review cuối mà bạn quy cho một skill | Sau vòng review của [minipower-router-plan](../minipower-router-plan/README.md), bạn chỉ ra lỗi do SKILL.md viết sai, không do dữ liệu dự án |

**Không dùng cho:** báo bug hạ tầng/hook (mở issue trực tiếp trên GitHub, không qua retro) · yêu cầu thêm feature mới (không phải "làm chưa tốt") · đánh giá chất lượng skill theo thước đo số (ADR-026, ADR riêng) · tự động nâng skill không người duyệt (không bao giờ có ở Minipower).

## Cách gọi

Nói thẳng trong Agent, ngay sau lúc gặp vấn đề:

```text
Chỗ minipower-backend-orgs-dotnet vừa làm chưa tốt — nó seed org mẫu dù SKILL.md ghi rõ "không seed org".
```

Agent chạy 8 bước ở [SKILL.md](./SKILL.md): điểm lỗi có trích dẫn → đoán nguyên nhân (`skill`/`prereq`/`model`/`other`) → rút bài học một câu → ghi vào `docs/00-governance/lessons.md` → nháp GitHub Issue ẩn danh → bạn duyệt → đăng qua MCP `feedback` → hỏi nâng ngay hay gom lại.

## Ví dụ — một vòng retro

**Bạn:** "minipower-backend-orgs-dotnet vừa seed org mẫu, trong khi README nói rõ không seed."

**Agent (bước 1–3):**

```text
Điểm chưa tốt: workflows/init.md bước 3 gọi SeedData.AddSampleOrg() — README.md dòng 7
ghi "không seed org, không xóa cứng".
Nguyên nhân đề xuất: skill — workflows/init.md tự mâu thuẫn với README cùng lá.
Bài học: trong tình huống "init catalog org", làm "chỉ tạo bảng rỗng" thay vì
"seed sẵn dữ liệu mẫu".
```

**Agent (bước 4, người OK):** ghi `LSN-003` vào `lessons.md` với `Skill@version: minipower-backend-orgs-dotnet@1.0.0`.

**Agent (bước 5):** in nháp issue theo [lesson.yml](../../../../.github/ISSUE_TEMPLATE/lesson.yml) — bối cảnh đổi tên dự án thành "X", skill ghi rõ, loại `skill`, ưu tiên `p2` (sai nhưng dễ thấy sau khi đọc README).

**Bạn (bước 6):** OK.

**Agent (bước 7):** đăng qua MCP `feedback` → `#NNN`, cập nhật dòng `LSN-003`.

**Bạn (bước 8):** chọn "gom lại" → issue giữ `status:batched`, chờ đợt nâng sau.

## Không có MCP `feedback`

Sổ `lessons.md` vẫn ghi đủ (bước 1–4). Agent in nháp issue đầy đủ trong chat, nói rõ **chưa đăng được**, và hướng dẫn bạn thêm server MCP GitHub vào `mcp.json` (giống cách kết nối [minipower-tasks-openproject](../../../tasks/skills/minipower-tasks-openproject/workflows/connect.md), nhưng target là repo tác giả `hoangnh2412/minipower`, không phải dự án của bạn).

## Liên quan

- [lesson.yml](../../../../.github/ISSUE_TEMPLATE/lesson.yml) — khuôn issue 11 trường
- `docs/00-governance/lessons.md` (project-skeleton) — sổ bài học của dự án
- [minipower-toolbox-skill-author](../../../toolbox/skills/minipower-toolbox-skill-author/README.md) — nơi nâng skill thật khi bạn chọn "nâng ngay"
- Pack hub: [router/README.md](../../README.md)
