# Tách module `ops/` — troubleshooting rời `backend/`, kỹ năng vận hành có nhà riêng

| | |
|---|---|
| **Ngày** | 2026-08-25 |
| **Trạng thái** | 🟢 **DONE — chủ repo xác nhận 2026-08-25.** Duyệt cả 5 QĐ + đợt §2 thi hành 6/6 bước cùng ngày. Verify: 432 test xanh (+5 test `ops-pack`) · `gen:check` đồng bộ · `link:check` 0 link gãy mới · grep tên cũ 0 hit ngoài ADR |
| **Phạm vi** | `backend/skills/minipower-backend-troubleshooting-dotnet/` → module mới `ops/`; quy ước tên skill nội bộ router-gộp `sdlc/` |
| **Nối tiếp** | Áp dụng [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-2/QĐ-4 (hệ tên hai tầng) + QĐ-7 (quy tắc 3 câu hỏi) + QĐ-8 (PACK.md manifest) · khuôn thi hành đổi-tên-không-đổi-nội-dung của [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) QĐ-5 · không đụng [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) (ruột `sdlc/` giữ nguyên) |
| **Mục đích** | Kỹ năng vận hành (chẩn đoán sự cố, tương lai: cài server, CI/CD) là của người DevOps — người dùng khác hẳn dev .NET → module ngang hàng theo ADR-022 QĐ-7 câu 2. Đồng thời chốt quy ước tên cho skill nội bộ router-gộp để hết di sản `ba-*` |
| **Ảnh hưởng** | `backend/skills/minipower-backend-troubleshooting-dotnet/` (di chuyển) · `ops/` mới (`PACK.md` + `README.md` + 1 skill) · [backend/PACK.md](../../src/backend/PACK.md) + [backend/README.md](../../src/backend/README.md) (bớt 1 lá) · bảng "Liên quan" trong skill `telemetry`/`healthcheck` · [backend-pack.test.js](../../src/router/hooks/test/backend-pack.test.js) (15→14 lá + canh pack `ops`) · [AGENTS.md](../../AGENTS.md) danh sách module · [README.md](../README.md) bản đồ · `hooks/link-check.baseline.txt` (nếu lệch) · 6 skill phase `sdlc/skills/*/SKILL.md` + [install/claude/README.md](../../cli/claude/README.md) (QĐ-5 — đã sửa) |

---

## §0. Quyết định

| # | Nội dung |
|---|---|
| **QĐ-1** | **Tạo module `ops/` — vận hành hạ tầng.** Lọc qua 3 câu hỏi ADR-022 QĐ-7: không tác động tài liệu/pipeline minipower sở hữu (câu 1: không) · người dùng là **DevOps/SRE, khác hẳn dev .NET**, và bộ kỹ năng có vòng đời riêng (câu 2: **có**) → module ngang hàng. Tên `ops` theo **việc** (vận hành), không theo **vai** (`devops`) — đúng luật "tên theo việc nó làm"; vai khai bằng metadata (QĐ-4). Phạm vi module: chẩn đoán sự cố hôm nay; **cài đặt server, CI/CD, deploy** mai này cũng vào đây — chỉ tách tiếp khi có vòng đời/người dùng tách thật |
| **QĐ-2** | **Chuyển skill hiện có → `ops/skills/minipower-ops-metrics/`.** Skill `minipower-backend-troubleshooting-dotnet` thực chất là **tầng thu thập dữ liệu** (Grafana → PromQL → Prometheus → JSON chuẩn hoá + `tools/` Node) — không gắn .NET, dashboard nào cũng lấy được → **bỏ hậu tố `-dotnet`**, đổi capability thành `metrics` (tên theo việc thật). Thi hành theo khuôn ADR-021 QĐ-5: **chỉ đổi `name:`/path, nội dung bất biến** — trừ mục "Quy tắc khi phân tích" đặc thù .NET runtime sẽ **dời sang skill case** khi viết (QĐ-3), không xoá trước khi có nhà mới |
| **QĐ-3** | **Skill chẩn đoán theo case — viết dần, không tạo folder rỗng** (ADR-022 QĐ-7 luật 2). Danh sách đã định: `minipower-ops-memory-leak-dotnet` (GC, heap) · `minipower-ops-deadlock-dotnet` (thread pool) · `minipower-ops-log-flow` (đọc log vẽ sơ đồ luồng — không gắn stack). Hậu tố `-dotnet` **chỉ gắn khi thật sự stack-bound**. Mỗi case skill là lá-rời, description sắc, dùng `minipower-ops-metrics` làm tầng lấy số liệu |
| **QĐ-4** | **Vai trò gắn bằng metadata, không vào tên.** Một người đứng được cả 7 vai; vai đổi theo tổ chức còn việc thì không. Tên skill = việc (`minipower-{module}-{capability}[-{stack}]` — ADR-022 QĐ-4, không có ô cho vai); vai = nhãn tra cứu, khai ở `roles:` trong `PACK.md` (`ops/PACK.md` khai `roles: [devops]`) + lăng kính `sdlc/roles/`. Máy route theo việc, người lọc theo vai |
| **QĐ-5** | **Skill nội bộ router-gộp `sdlc/`: tên TRƠN ≡ tên thư mục, không tiền tố.** Tiền tố `minipower-{module}-` là dấu hiệu **bề mặt đăng ký với loader** (lá-rời); skill nội bộ do router dẫn bằng Read mang tên trơn (`discovery`, `doc-review`, …) — chính sự vắng tiền tố là tín hiệu "không tự đứng trên menu". Kênh plugin Claude Code namespace sẵn bằng tên plugin (`/minipower:discovery`) nên thêm tiền tố chỉ tạo trùng lặp (`/minipower:minipower-sdlc-discovery`). **Ghi nhận đã thi hành 2026-08-25:** bỏ tiền tố di sản `ba-*` khỏi 6 skill phase + sửa install README; suite 427 test xanh |

## §1. Không làm (ranh giới)

| ❌ | Vì sao |
|---|---|
| Tạo folder `minipower-ops-{memory-leak,deadlock,log-flow}` rỗng chờ | QĐ-3 — chưa có skill thật chưa tạo folder |
| Tách module `infra/` riêng cho provision/CI-CD ngay | Chưa có skill thật, chưa có bằng chứng vòng đời tách; `ops/` chứa được |
| Đổi nội dung skill trong bước di chuyển | Khuôn ADR-021 QĐ-5 — di chuyển phải kiểm được bằng "trước sau giống hệt trừ name/path" |
| Sửa chữ "troubleshooting" trong ADR cũ | ADR-022 QĐ-11 — chỉ sửa href nếu gãy |
| Thêm phase / entry `rules.json` cho `ops` | ADR-022 QĐ-5d — module cắm kiểu lá-rời, không thêm phase |

## §2. Việc phải làm — một đợt

| # | Việc | Xong khi |
|---|---|---|
| 1 | Tạo `ops/` + `ops/PACK.md` (schema [contracts/pack-manifest.md](../../contracts/pack-manifest.md), `roles: [devops]`) + `ops/README.md` | PACK.md khớp schema |
| 2 | Di chuyển skill → `ops/skills/minipower-ops-metrics/`, sửa `name:` + description (bỏ chữ "troubleshooting .NET", giữ nội dung) | Diff nội dung rỗng trừ `name:`/path/description |
| 3 | Sửa tham chiếu: bảng "Liên quan" `telemetry`/`healthcheck` · `backend/PACK.md` · `backend/README.md` | grep `minipower-backend-troubleshooting-dotnet` = 0 hit |
| 4 | Test: `backend-pack.test.js` 15→14 lá; thêm canh tương đương cho `ops/` (name ≡ folder, tiền tố, description) | `npm test` xanh |
| 5 | AGENTS.md danh sách module + README.md bản đồ | Đọc lại nhất quán |
| 6 | `npm run gen && npm test && npm run gen:check && npm run link:check` | Cả bốn xanh (baseline update nếu cố ý) |

---

*Liên quan:* [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) (hệ tên + quy tắc phân loại) · [ADR-021](../done/ADR-021-2026-08-24-doi-ten-pack-jarvis-thanh-backend.md) (khuôn đổi tên) · [ADR-020](../cancel/ADR-020-2026-08-20-minipower-3-che-do-du-an-gate-bang-hook.md) (as-built/codegraph — QĐ-6)
