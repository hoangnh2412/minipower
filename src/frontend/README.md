# Code frontend React (frontend) — kit `@platform/core`

Module `frontend` của **Minipower** — 9 skill **lá-rời** dạy dựng frontend React theo kit UI chuẩn công ty `@platform/core` (React 19 · PrimeReact 11 · Tailwind · Zod + react-hook-form · axios). Lá-rời nghĩa là: mô tả việc bằng lời (*"thêm màn danh sách nhân viên"*, *"form tạo hợp đồng có validate"*) là skill tương ứng **tự kích hoạt** — không cần nhớ tên. Trong quy trình chung, module này nhận bàn giao tại **H4**: DOC-12 (API Spec) · DOC-19 (Prototype) + UC/FR/AC theo module — xem [PACK.md](PACK.md).

Mỗi skill có **README** (người dùng) và **SKILL.md** (agent). Code mẫu nằm trong `templates/` của từng skill — tự đứng, thay placeholder rồi dùng.

## Ba tầng — đọc trước khi chọn skill

```text
App host (main.tsx · App.tsx · .env)      ghép route + menu + NavigateBridge, cấu hình HTTP một lần
  ↑ import
Feature module (src/features/{feature}/)  pages · components · hooks · services · validation · types · routes · …
  ↑ import
@platform/core (kit)                      primitive PrimeReact · common · AdminLayout · lib (http, handleAction)
```

Skill viết cho **app host / module package import `@platform/core`**. Viết feature **bên trong** kit: cùng cấu trúc, chỉ đổi import `@platform/core` → đường tương đối tới `lib/` · `common/` — xem [architecture § Ba nơi đặt feature](skills/minipower-frontend-architecture-react/SKILL.md#ba-nơi-đặt-feature).

## Cài vào Cursor

Cursor nhận skill tại **`.cursor/skills/{tên-skill}/SKILL.md`**. Repo `minipower` là **source of truth** — link hoặc copy vào workspace đang làm việc. Chạy lệnh **từ root workspace**, thay `/path/to/minipower` bằng path thực tế.

### macOS / Linux

```bash
mkdir -p .cursor/skills
FRONTEND=/path/to/minipower/src/frontend
for d in "$FRONTEND"/skills/*/; do
  ln -snf "$d" ".cursor/skills/$(basename "$d")"
done

test -f .cursor/skills/minipower-frontend-scaffold-react/SKILL.md && echo "OK"
```

### Windows — PowerShell

```powershell
New-Item -ItemType Directory -Force -Path .cursor\skills
$frontendSkills = "C:\path\to\minipower\src\frontend\skills"
Get-ChildItem -Directory $frontendSkills | ForEach-Object {
  New-Item -ItemType SymbolicLink -Force `
    -Path (Join-Path ".cursor\skills" $_.Name) -Target $_.FullName
}

Test-Path .cursor\skills\minipower-frontend-scaffold-react\SKILL.md
```

Publish sang repo product (`{product}-frontend/.opencode/skills/`): cùng cách với backend — [backend § Publish skill sang repo consumer](../backend/README.md#publish-skill-sang-repo-consumer), thay `backend/skills/` bằng `frontend/skills/`.

---

## Skills

| Skill | README | Mô tả |
|-------|--------|--------|
| **minipower-frontend-scaffold-react** | [skills/minipower-frontend-scaffold-react/README.md](./skills/minipower-frontend-scaffold-react/README.md) | App host Vite + Tailwind v4 + PrimeReact gắn kit; gắn module có sẵn của kit (account, tenant, role…) |
| **minipower-frontend-architecture-react** | [skills/minipower-frontend-architecture-react/README.md](./skills/minipower-frontend-architecture-react/README.md) | Cây feature module, file đặt ở đâu, hướng import, lát cắt dọc thêm feature, lint kiến trúc |
| **minipower-frontend-convention-react** | [skills/minipower-frontend-convention-react/README.md](./skills/minipower-frontend-convention-react/README.md) | Quy ước TS/React + `tsconfig` strict + ESLint ép lúc CI |
| **minipower-frontend-api-react** | [skills/minipower-frontend-api-react/README.md](./skills/minipower-frontend-api-react/README.md) | `services/` + `call*`, tham số danh sách ↔ `PagedListRequest`, unwrap, lỗi, mock khi backend chưa có |
| **minipower-frontend-form-react** | [skills/minipower-frontend-form-react/README.md](./skills/minipower-frontend-form-react/README.md) | Zod schema + `use*Form` (react-hook-form) + component form + submit qua `handleAction` |
| **minipower-frontend-crud-react** | [skills/minipower-frontend-crud-react/README.md](./skills/minipower-frontend-crud-react/README.md) | Màn danh sách / tạo-sửa / chi tiết — mẫu theo route hoặc theo dialog |
| **minipower-frontend-navigation-react** | [skills/minipower-frontend-navigation-react/README.md](./skills/minipower-frontend-navigation-react/README.md) | `*_ROUTES`, `configure*Navigate` + NavigateBridge, menu lọc quyền, AdminLayout |
| **minipower-frontend-customization-react** | [skills/minipower-frontend-customization-react/README.md](./skills/minipower-frontend-customization-react/README.md) | Tuỳ biến page có sẵn của kit không fork — slot `content`, `callback`, controlled |
| **minipower-frontend-review-react** | [skills/minipower-frontend-review-react/README.md](./skills/minipower-frontend-review-react/README.md) | Review PR TypeScript/React trước khi mở MR |

## Không thuộc module này

| Việc | Đi đâu |
|---|---|
| API backend .NET (controller, handler, EF) | [backend/](../backend/README.md) |
| Viết DOC-12 API Spec, DOC-19 prototype | [architecture](../architecture/README.md) · [analyst](../analyst/README.md) — frontend **đọc**, không viết |
| Prototype / wireframe để duyệt luồng màn hình | DOC-19 của [analyst](../analyst/README.md) — làm trước SRS. Mock trong skill `api` chỉ là chỗ đứng tạm cho code thật khi DOC-12 đã có mà backend chưa chạy, **không** dùng làm prototype |
| Test strategy / autotest | [qa/](../qa/README.md) |
| Sửa chính kit `@platform/core` | Repo kit — skill ở đây chỉ **dùng** kit; thiếu điểm mở rộng thì đề xuất lên kit, không fork |

## Dự án đích dùng thế nào

Dự án giữ convention UI / frontend **riêng** trong `docs/00-governance/` (màu thương hiệu, phím tắt, pattern màn hình sản phẩm) và trỏ về skill minipower cho phần chung: `[code] message`, số căn phải, một component chính một file, strict `tsc` + ESLint R1–R7 + M1. Review trước PR: `minipower-frontend-review-react` trên diff — mẫu như backend (ADR-041 QĐ-9).

## Prompt nhanh

```text
@.opencode/skills/minipower-frontend-scaffold-react/workflows/scaffold.md
Dựng frontend cho Acme, kit cài từ registry, backend chạy https://localhost:7006
```

```text
@.opencode/skills/minipower-frontend-architecture-react/workflows/add-feature.md
Thêm feature quản lý nhân viên (Employee): danh sách + tạo/sửa + chi tiết, API v1/hrm/employees theo DOC-12
```

```text
@.opencode/skills/minipower-frontend-review-react/SKILL.md
Review diff frontend so với develop
```

Bản đồ Minipower: [README.md](../../README.md).
