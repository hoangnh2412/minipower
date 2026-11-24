# Giải phẫu skill Minipower — tham chiếu

Không load mặc định. Mở khi cần tra một mục cụ thể; luật hành động nằm ở [SKILL.md](../SKILL.md).

## Phân vai từng file

| File | Ai đọc | Chứa gì | Không chứa gì |
|---|---|---|---|
| `SKILL.md` | Agent | Frontmatter, bảng định tuyến, quy tắc cốt lõi, output bắt buộc | Hướng dẫn cài, prompt mẫu, giải thích nền |
| `README.md` | Người | Khi nào dùng / **không** dùng, cách gọi, bảng tra, link | Bản sao SKILL.md |
| `workflows/*.md` | Agent | Checklist từng bước, lệnh, validate | Lặp lại quy tắc cốt lõi |
| `providers/*/SKILL.md` | Agent | Một cách cấu hình: config → registration → validate | Bảng packages, quy tắc chung của orchestrator |
| `patterns/*/SKILL.md` | Agent | Một mô hình loại trừ nhau | (như trên) |
| `templates/*` | Agent | File copy nguyên vào repo đích, có placeholder | Giải thích — giải thích ở workflow |
| `tools/*` | Agent / người | Script chạy được + `.env.example` | Bí mật thật |
| `reference/*.md` | Agent khi cần | Nền dài, tra cứu | Thứ cần cho **mọi** task (thứ đó thuộc SKILL.md) |

Nguyên tắc chung: **một sự thật ở đúng một chỗ**. Nội dung lặp giữa hai file sẽ lệch nhau ngay lần sửa thứ hai.

## providers vs patterns

Hai thư mục cùng chức năng kỹ thuật (một biến thể = một `SKILL.md`), khác nhau ở **bản chất lựa chọn**:

| | `providers/` | `patterns/` |
|---|---|---|
| Bản chất | Hạ tầng cắm vào cùng một API | Mô hình tổ chức, chọn một là bỏ cái kia |
| Cộng dồn được? | Có — cắm Redis **và** Postgres probe cùng lúc | Không — single-db hoặc separate-tenant-db |
| Ví dụ | Redis / Memory (cache) · PostgreSQL / RabbitMQ (health) | single-db / separate-tenant-db / hybrid (EF multitenancy) |
| Thường kèm | `workflows/add.md` | `reference/setup.md` đọc **trước** khi chọn |

Một skill dùng **một trong hai**, không dùng cả hai. Chọn sai thì người đọc không biết mở thư mục nào.

## Skill router khác gì

`src/router/` là **plugin root + hooks**. Dispatcher = **`minipower-router`**. Pack nghề/kênh là **lá-rời** `minipower-{module}-*`.

| | Lá-rời (`backend` · `ops` · `toolbox`) | Skill router (`src/router/skills/`) |
|---|---|---|
| Đăng ký với loader | Từng lá, tên `minipower-{module}-{capability}` | Kho — `name` trơn; cửa dispatcher là `minipower-router` |
| Cách được chọn | `description` khớp lời người dùng | Router đọc intent → phase |
| Tên thư mục | Có tiền tố `minipower-{module}-` | **Tên trơn** ≡ thư mục (`discovery`, `doc-review`) — ADR-023 QĐ-5 |
| Khai trigger ở đâu | Chính `description` | `rules.json` (`phase_by_doc`) hoặc bảng trigger trong `minipower-router/SKILL.md` |

Thêm skill router là **đụng SSOT**: sửa [`rules.json`](../../../../router/hooks/lib/rules.json) rồi chạy `npm run gen` → `npm test` → `npm run gen:check`, cả ba xanh. Skill này không phủ luồng đó.

## Skill mẫu theo độ phức tạp

Đọc một cái gần với việc đang làm trước khi tự nghĩ khung:

| Mức | Skill | Đặc điểm |
|---|---|---|
| Tối giản | [minipower-backend-review-dotnet](../../../../backend/skills/minipower-backend-review-dotnet/) | Không `workflows/`, không `providers/` — checklist nằm luôn trong SKILL.md |
| Trung bình | [minipower-backend-caching-dotnet](../../../../backend/skills/minipower-backend-caching-dotnet/) | Vài provider + `reference/` |
| Đầy đủ | [minipower-backend-healthcheck-dotnet](../../../../backend/skills/minipower-backend-healthcheck-dotnet/) | Nhiều provider, nhiều template |
| Patterns | [minipower-backend-entityframework-dotnet](../../../../backend/skills/minipower-backend-entityframework-dotnet/) | `patterns/` + `reference/setup.md` thay bảng providers |
| Có `tools/` | [minipower-ops-metrics](../../../../ops/skills/minipower-ops-metrics/) | Script Node chạy được + `.env.example` + `artifacts/` |
| Cắt ngang | [minipower-backend-convention-dotnet](../../../../backend/skills/minipower-backend-convention-dotnet/) | Không thuộc một module code cụ thể — chia rõ tầng cứng (analyzer) / mềm (lời) |

## Map từ template một-file cũ

Skill viết theo kiểu một file dài **Purpose / Role / Input / Output / Rules / Process** chuyển sang chuẩn này như sau:

| Mục cũ | Đi đâu |
|---|---|
| Purpose | `description` frontmatter + đoạn mở `SKILL.md` |
| Scope | README § *Khi nào dùng* / *Không dùng cho* |
| Role | *(bỏ)* — vai khai ở `roles:` trong `PACK.md`, không nhét vào skill |
| Input | Bước 1 «Phân tích» của workflow + prompt người dùng |
| Output | `## Output bắt buộc` trong `SKILL.md` |
| Rules | `## Quy tắc cốt lõi` |
| Process | `workflows/*.md` |
| Constraints | Trong quy tắc cốt lõi, hoặc trong provider nếu chỉ áp cho một biến thể |
| Examples | `templates/` + `providers/*/SKILL.md` |
| Anti-patterns | Cuối `workflows/*.md` |

Lý do bỏ khung cũ: một file dài buộc agent load toàn bộ cho **mọi** task, kể cả phần không liên quan. Chuẩn mới cho phép load đúng một nhánh.

## Nguồn và đích publish

| | Đường dẫn | Vai |
|---|---|---|
| **Nguồn chân lý** | `{module}/skills/` trong repo minipower | Sửa ở đây |
| Đích — Cursor | `.cursor/skills/{tên-skill}/` | Symlink hoặc copy |
| Đích — OpenCode | `.opencode/skills/{tên-skill}/` | Symlink hoặc rsync |
| Đích — repo product | `{product}-backend/.opencode/skills/` | rsync theo tag `minipower-skills-vX.Y.Z` |

Prompt trong tài liệu viết theo path **đích** (`@.opencode/skills/…`) vì đó là chỗ người dùng gọi. Nhưng khi mô tả *nguồn*, luôn viết `{module}/skills/` — nhầm hai thứ này là lỗi đã từng phải sửa bằng một ADR riêng (ADR-024).

Module `toolbox/` **không** publish sang repo product: repo product không tạo skill minipower.
