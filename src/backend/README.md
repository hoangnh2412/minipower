# Code backend .NET (backend) — framework Jarvis

Module `backend` của **Minipower** — 14 skill **lá-rời** dạy dựng backend .NET theo framework Jarvis chuẩn công ty. Lá-rời nghĩa là: mô tả việc bằng lời (*"thêm cache Redis"*, *"API cần JWT"*) là skill tương ứng **tự kích hoạt** — không cần nhớ tên. Trong quy trình chung, module này nhận bàn giao từ **Quy trình phát triển** (`sdlc`) tại H4: DOC-08 (SAD) · DOC-11 (data model) · DOC-12 (API) + FR/AC theo module — xem [PACK.md](PACK.md).

Mỗi skill có **README** (người dùng) và **SKILL.md** (agent).

## Cài vào Cursor

Cursor nhận skill tại **`.cursor/skills/{tên-skill}/SKILL.md`**. Repo `minipower` là **source of truth** — link hoặc copy vào workspace đang làm việc.

Chạy lệnh **từ root workspace**. Thay `/path/to/minipower` bằng path thực tế (tương đối hoặc tuyệt đối).

### macOS / Linux — từng skill

```bash
mkdir -p .cursor/skills
BACKEND=/path/to/minipower/backend
for d in "$BACKEND"/skills/*/; do
  name=$(basename "$d")
  ln -snf "$d" ".cursor/skills/$name"
done

# Kiểm tra
test -f .cursor/skills/minipower-backend-scaffold-dotnet/SKILL.md && echo "OK"
```

### Windows — PowerShell

```powershell
New-Item -ItemType Directory -Force -Path .cursor\skills
$backendSkills = Join-Path (Get-Location) "minipower\backend\skills"
Get-ChildItem -Directory $backendSkills | ForEach-Object {
  New-Item -ItemType SymbolicLink -Force `
    -Path (Join-Path ".cursor\skills" $_.Name) -Target $_.FullName
}

# Kiểm tra
Test-Path .cursor\skills\minipower-backend-scaffold-dotnet\SKILL.md
```

### OpenCode — symlink cả tree

Nếu prompt dùng path `.opencode/skills/`:

```bash
ln -snf /path/to/minipower/backend/skills .opencode/skills
```

Chi tiết publish sang repo product: [Publish skill sang repo consumer](#publish-skill-sang-repo-consumer) (bên dưới).

---

## Skills

| Skill | README | Mô tả |
|-------|--------|--------|
| **minipower-backend-scaffold-dotnet** | [skills/minipower-backend-scaffold-dotnet/README.md](./skills/minipower-backend-scaffold-dotnet/README.md) | Scaffold / init / add solution Jarvis |
| **minipower-backend-architecture-dotnet** | [skills/minipower-backend-architecture-dotnet/README.md](./skills/minipower-backend-architecture-dotnet/README.md) | Kiến trúc DDD 5 layer, lát cắt dọc, architecture test |
| **minipower-backend-authentication-dotnet** | [skills/minipower-backend-authentication-dotnet/README.md](./skills/minipower-backend-authentication-dotnet/README.md) | JWT, API Key, Cognito |
| **minipower-backend-notification-dotnet** | [skills/minipower-backend-notification-dotnet/README.md](./skills/minipower-backend-notification-dotnet/README.md) | Email SMTP Mailkit |
| **minipower-backend-caching-dotnet** | [skills/minipower-backend-caching-dotnet/README.md](./skills/minipower-backend-caching-dotnet/README.md) | Memory + Redis cache |
| **minipower-backend-entityframework-dotnet** | [skills/minipower-backend-entityframework-dotnet/README.md](./skills/minipower-backend-entityframework-dotnet/README.md) | EF multitenancy |
| **minipower-backend-swashbuckle-dotnet** | [skills/minipower-backend-swashbuckle-dotnet/README.md](./skills/minipower-backend-swashbuckle-dotnet/README.md) | Swagger / OpenAPI |
| **minipower-backend-healthcheck-dotnet** | [skills/minipower-backend-healthcheck-dotnet/README.md](./skills/minipower-backend-healthcheck-dotnet/README.md) | Health endpoints |
| **minipower-backend-telemetry-dotnet** | [skills/minipower-backend-telemetry-dotnet/README.md](./skills/minipower-backend-telemetry-dotnet/README.md) | OpenTelemetry |
| **minipower-backend-observability-dotnet** | [skills/minipower-backend-observability-dotnet/README.md](./skills/minipower-backend-observability-dotnet/README.md) | Thiết lập observability .NET — OTEL, Prometheus, Grafana, alert |
| **minipower-backend-blobstoring-dotnet** | [skills/minipower-backend-blobstoring-dotnet/README.md](./skills/minipower-backend-blobstoring-dotnet/README.md) | FileSystem / MinIO blob |
| **minipower-backend-realtime-dotnet** | [skills/minipower-backend-realtime-dotnet/README.md](./skills/minipower-backend-realtime-dotnet/README.md) | Jarvis.Realtime + SignalR, Redis backplane |
| **minipower-backend-review-dotnet** | [skills/minipower-backend-review-dotnet/README.md](./skills/minipower-backend-review-dotnet/README.md) | Review PR C#/.NET |
| **minipower-backend-convention-dotnet** | [skills/minipower-backend-convention-dotnet/README.md](./skills/minipower-backend-convention-dotnet/README.md) | Quy ước coding C#/.NET + `.editorconfig` / analyzer ép lúc build |

## Prompt nhanh

```text
@.opencode/skills/minipower-backend-scaffold-dotnet/workflows/scaffold.md
Scaffold backend .NET 9: Product=Acme, product=acme
```

```text
@.opencode/skills/minipower-backend-entityframework-dotnet/workflows/init.md
Init Jarvis EF + single DB cho MyApp
```

```text
@.opencode/skills/minipower-backend-observability-dotnet/workflows/setup.md
Thiết lập observability OTEL → Prometheus → Grafana → alert cho service {Product}
```

Bản đồ Minipower: [README.md](../../README.md).

## Dự án đích dùng thế nào

Mẫu đã chạy thật (dự án e-invoice, 2026-10 — ADR-041 QĐ-9): dự án giữ convention **riêng** trong `docs/00-governance/` (ví dụ tên sản phẩm, họ mã lỗi đối tác, ngưỡng warning) và trỏ về skill minipower cho phần chung:

| Việc ở dự án | Skill | Ghi chú |
|---|---|---|
| Viết / sửa `.cs` | `minipower-backend-convention-dotnet` | analyzer + StyleCop (2 rule) + `dotnet format` gác phần cứng |
| Tạo file mới, thêm tính năng | `minipower-backend-architecture-dotnet` › `add-feature` | `ArchitectureTests` R1–R7 gác layer |
| Trước khi **người đồng ý commit** diff có `.cs` | `minipower-backend-review-dotnet` trên diff sắp commit | Issue blocker → dừng commit, chờ xác nhận. Đây là **quy ước của dự án** viết trong `AGENTS.md` của họ — minipower không có hook ép |

Kiểu thời điểm, marker audit / tenant, `IErrorCode`: convention mục 9.4, 13, 14 — chung cho mọi dự án Jarvis, dự án không viết lại.

## Publish skill sang repo consumer

**Nguồn chính (source of truth):** thư mục `backend/skills/` trong repo **minipower** (repo này). Repo product (`{product}-backend`) **không** fork/sửa skill — chỉ nhận bản cập nhật từ minipower hoặc PR upstream.

### Cấu trúc bắt buộc trên consumer

```text
{product}-backend/
└── .opencode/
    ├── README.md          # copy từ minipower (file này)
    └── skills/
        ├── minipower-backend-scaffold-dotnet/
        ├── minipower-backend-caching-dotnet/
        └── ...
```

Agent/Cursor gọi skill bằng path **tương đối repo product**:

```text
@.opencode/skills/minipower-backend-scaffold-dotnet/workflows/scaffold.md
```

### Cách đưa `.opencode/` vào repo product

| Cách | Khi nào dùng | Ghi chú |
|------|----------------|---------|
| **Git submodule** | Nhiều team, cần pin version skill | Submodule trỏ repo minipower; consumer copy `backend/skills/` → `.opencode/skills/` (xem script dưới) |
| **Symlink** | Dev local, minipower clone cạnh product repo | `ln -s ../../minipower/backend/skills .opencode/skills` — không commit symlink lên Windows CI |
| **Copy (script/CI)** | Pin release, không phụ thuộc submodule path | Script copy `backend/skills/` từ tag minipower — **khuyến nghị cho CI** |
| **Monorepo** | Product và minipower cùng workspace | Một `.opencode/` ở root monorepo hoặc symlink như trên |

**Không** commit nội dung skill đã chỉnh tay trong repo product — sửa tại repo minipower rồi sync lại.

### Submodule (khuyến nghị team)

```bash
# Trong repo {product}-backend (root)
git submodule add <url-repo-minipower> vendor/minipower
git submodule update --init --recursive

# Đồng bộ skill từ submodule (chạy sau mỗi lần update submodule)
mkdir -p .opencode
rsync -a --delete vendor/minipower/backend/skills/ .opencode/skills/
cp vendor/minipower/backend/README.md .opencode/README.md
```

Pin version: checkout tag/commit cố định trong `vendor/minipower`, commit SHA submodule, chạy lại `rsync`.

### Symlink (dev local)

```bash
cd /path/to/acme-backend
mkdir -p .opencode
ln -snf /path/to/minipower/backend/skills .opencode/skills
```

Thêm `.opencode` vào `.gitignore` nếu symlink chỉ dùng local; CI dùng copy/submodule.

### Copy một lần / release script

```bash
MINIPOWER_ROOT=/path/to/minipower
PRODUCT_ROOT=/path/to/acme-backend

rsync -a --delete \
  "$MINIPOWER_ROOT/backend/skills/" \
  "$PRODUCT_ROOT/.opencode/skills/"
cp "$MINIPOWER_ROOT/backend/README.md" "$PRODUCT_ROOT/.opencode/README.md"
```

Chạy trong pipeline khi bump `MINIPOWER_SKILLS_REF=v1.2.0` (tag trên repo minipower).

### Quy ước cập nhật

1. Thay đổi skill → PR trên **repo minipower** (review + merge `develop` / tag release).
2. Repo product: `git submodule update` hoặc chạy script `rsync` theo tag mới.
3. PR product ghi dòng: `chore: sync minipower skills @ <tag hoặc commit short>` — không trộn thay đổi skill với feature app.
4. Breaking skill (đổi workflow, package version bắt buộc): ghi trong PR minipower + tag semver skill (`minipower-skills-v1.3.0`) — consumer bump có chủ đích.

### Product repo sau khi có `.opencode/`

- README product: một dòng link `Skill AI: [.opencode/README.md](.opencode/README.md)`.
- Không duplicate bảng skill — link hub `backend` của minipower hoặc copy README hub khi `rsync` (file này đi kèm).
- Scaffold mới: luôn dùng `@.opencode/skills/minipower-backend-scaffold-dotnet/workflows/scaffold.md`.

### Checklist publish (maintainer minipower)

```text
- [ ] Tag hoặc commit trên develop ổn định
- [ ] rsync/submodule update trên ít nhất một repo product thử
- [ ] Smoke: @minipower-backend-scaffold-dotnet scaffold, @minipower-backend-authentication-dotnet jwt, @minipower-backend-review-dotnet
- [ ] Ghi tag/release note nếu breaking
```

Chi tiết thay đổi skill: lịch sử Git của `backend/` + tag `minipower-skills-*`.
