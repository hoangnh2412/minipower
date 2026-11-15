# Agent + skill Lark Tasks — một mặt kênh, wrap MCP, không module mới

| | |
|---|---|
| **Ngày** | 2026-09-26 |
| **Trạng thái** | Confirm §6 chốt 2026-09-26; đang thi hành §7 |
| **Phạm vi** | Pack kênh `src/tasks/`: **một** skill `minipower-tasks-lark` (làm dày SOP) + **một** agent-file persona cùng tên; ranh giới với `chat/` · `lark-work-assistant.md` · `memory/` (ADR-035). |
| **Ngoài phạm vi** | OpenProject (`minipower-tasks-openproject`) · IM/wiki/Base/Drive · SDK/adapter Lark trong repo · hook `face-mismatch` toàn kênh (vẫn ADR-033) · đổi `tasks_provider` schema v3 · CLI npx (ADR-031) · Control Plane / spawn subagent |
| **Nối tiếp** | [ADR-033](../doing/ADR-033-2026-09-25-dispatcher-role-channel-ssot-provider.md) QĐ-5 · QĐ-7 · QĐ-8 · QĐ-11 · §5.1b · D1 · [ADR-022](../done/ADR-022-2026-08-24-minipower-nen-tang-cong-cu-ai-toan-cong-ty.md) QĐ-1 · QĐ-7 · [ADR-014](../todo/ADR-014-2026-07-28-minipower-spine-tong-hop-wrap-not-build.md) · [ADR-034](../done/ADR-034-2026-09-26-minipower-marker-always-on-dispatch.md) · [ADR-035](../done/ADR-035-2026-09-26-memory-mot-file-thay-overview.md) (sổ cá nhân ≠ board Lark) · [pack-manifest](../../contracts/pack-manifest.md) · skill-author 3 câu hỏi |
| **Mục đích** | Chốt **nhà**, **tầng**, **I/O MCP**, **cổng người** cho “quản lý task Lark” — hết god-prompt, hết nhầm skill với runtime agent |
| **Ảnh hưởng** | `src/tasks/skills/minipower-tasks-lark/` (SKILL · README · `workflows/`) · `src/tasks/agents/minipower-tasks-lark.md` (**mới**) · `src/tasks/rules/` (**mới**, lát tasks) · `src/tasks/README.md` · `src/router/agents/lark-work-assistant.md` (cắt SOP task) · `src/router/agents/README.md` · `channel-pack.test.js` (nếu canh agent-file) · `minipower-router` bảng gợi ý (đã có hàng tasks — không thêm pack) |

---

## §1. Bối cảnh

Đã có **lá kênh** và **MCP thật**, nhưng chưa có kiến trúc “agent + skill” đúng nghĩa Minipower.

| Thành phần | Hiện trạng 2026-09-26 |
|------------|------------------------|
| Pack | `src/tasks/` — `PACK.md` `mcp: [tasks]`, `consumes: preview L2`, `roles: [pm, support]` |
| Skill | `minipower-tasks-lark` — SKILL ~36 dòng + `workflows/l1-l3.md` 9 dòng; `description` kích hoạt được; **channel-pack.test.js** đã canh |
| MCP | `user-lark-mcp`: **chỉ đọc** — `task_v2_task_list` (`type=my_tasks`) · `task_v2_task_get` · `task_v2_tasklist_list` · `task_v2_tasklist_tasks`. **Không** có `task_create` / `task_update` trên catalog phiên này ⚠️ **mô tả này sai — xem đính chính §5.4** |
| God-file | `src/router/agents/lark-work-assistant.md` (~260 dòng) gộp task + IM + wiki + Base + Drive; ADR-017 từng gỡ khỏi router; ADR-033 D1 ưu tiên pack kênh |
| Chat | `minipower-chat-lark` — mặt `chat_provider`, **không** đụng `task_v2_*` |
| Profile | `tasks_provider`: `openproject` \| `lark` \| `none` (v3). `none` → `memory/tasks/` local, không MCP |
| Hook/rule kênh | ADR-033 liệt `rules/l1-l2-l3.md` · `one-face.md` · hook `face-mismatch` — **chưa có trên đĩa** |
| Smoke | ADR-033 T2 🟢: `tasks_provider=none` → không gọi Lark, không nạp analyst |

Người dùng hỏi *tạo agent và skill quản lý task Lark*. Ba câu ADR-022 QĐ-7:

| # | Câu | Trả lời |
|---|-----|---------|
| 1 | Đụng DOC/pipeline minipower sở hữu? | Không — kênh, không luật UC/FR |
| 2 | Framework/vòng đời/người dùng khác? | Không — nhà đã là `tasks/` |
| 3 | Năng lực của skill đã có? | **Có** — làm dày `minipower-tasks-lark`, **không** skill thứ hai, **không** module `lark/` |

Hai nghĩa chữ **agent** dễ lẫn — ADR này tách:

| Chữ | Nghĩa **đúng** ở đây | Nghĩa **cấm** |
|-----|----------------------|----------------|
| Agent pack | Folder `tasks/` (kênh) — SOP + rule + (sau) hook **trong pack** | Pack nghề `pm/` nuốt MCP Lark |
| Agent-file | Markdown persona `src/tasks/agents/minipower-tasks-lark.md` — vai trò, ranh giới, khi nào đọc skill | Cursor Task/subagent tự spawn, agent bàn giao agent (ADR-022 QĐ-1) |
| Skill | `SKILL.md` + workflows — **cách gọi MCP** từng việc | Copy schema OpenAPI vào repo |

---

## §2. Vấn đề

| # | Vấn đề | Hệ quả |
|---|---|---|
| P1 | Skill mỏng, SOP thật nằm god-file `sdlc/agents/` | Loader kích hoạt đúng lá nhưng agent vẫn “nhớ” IM/wiki; một phiên task dễ L3 gửi tin |
| P2 | Chữ “tạo agent” bị hiểu thành runtime / custom agent Cursor độc lập khỏi pack | Trái dispatcher atomic; hai SSOT (Cursor Agents UI vs `src/tasks/`) |
| P3 | ~~MCP task **không ghi** nhưng SOP vẫn nói "L3 tạo task"~~ ⚠️ **tiền đề sai, xem đính chính §5.4.** Vấn đề thật: cờ chọn tool khai thiếu nên tool ghi biến mất lặng lẽ | Agent kết luận nhầm "Lark không ghi được" rồi bắt người tạo tay, dù công cụ có sẵn |
| P4 | Thiếu `tasklist_guid` / `completed` / cửa sổ thời gian hỏi nhỏ giọt | Trái execution-gate “một lượt” |
| P5 | Board Lark vs sổ `memory/memory.md` (ADR-035) vs SQLite khi `none` | Ba nơi “việc”; agent copy FR vào mô tả Lark |

---

## §3. Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | **Không** agent runtime, **không** pack A spawn pack B (ADR-022 QĐ-1, ADR-033 QĐ-1) |
| C2 | Wrap MCP, **không** SDK/adapter trong repo (ADR-014 · ADR-033 QĐ-11 SOP) |
| C3 | Đúng **một** `tasks_provider`; lệch mặt → không gọi MCP (ADR-033 QĐ-8 / profile v3) |
| C4 | L3 ghi thế giới thật chỉ sau **một** bảng preview + OK người (ADR-033 QĐ-7) |
| C5 | Tên skill ≡ thư mục, `minipower-tasks-{capability}`, `description` bắt buộc (ADR-022 QĐ-4/5b) |
| C6 | Chưa có skill thật thì chưa tạo folder module — `lark/` **không** mở |
| C7 | `pm/` được Read skill kênh rồi gọi MCP; **không** nhét schema tool vào skill nghề (ADR-033 QĐ-11 ngoại lệ SOP) |
| C8 | Không copy body `{MOD}-FR-` sang Lark; map ID trong bảng phiên |

---

## §4. Phương án

| # | Phương án | Ưu | Nhược | |
|---|---|---|---|---|
| O1 | Module mới `src/lark/` + nhiều skill (task, wiki, base) | Gom theo vendor | Trái QĐ-7 câu 2; trùng `tasks/`+`chat/`; tên theo công cụ | ❌ |
| O2 | Chỉ làm dày skill, **không** agent-file | Ít file; description đã kích hoạt | Người muốn “Agent Lark Tasks” không có persona/ranh giới ổn định; god-file vẫn sống | ❌ |
| O3 | Custom agent chỉ trên máy (Cursor UI), không SSOT repo | Nhanh local | Mất nguồn chân lý; không test; lệch máy | ❌ |
| O4 | **Một skill + một agent-file trong pack `tasks/`**; cắt SOP task khỏi god-file; L3 ghi = no-op cho đến khi catalog có tool | Đúng kênh; atomic; wrap MCP; người vẫn có “agent” nghĩa persona | Phải dọn `lark-work-assistant`; CLI cài agent-file là bước sau | ✅ chọn |

---

## §5. Quyết định

| # | Quyết định | Chi tiết |
|---|---|---|
| QĐ-1 | **Nhà = `src/tasks/`.** Không module `lark/` hay `openproject/`. **Một provider = một skill lá**, không một skill cho mỗi động từ (tìm / tạo / sửa) | OpenProject = lá `minipower-tasks-openproject` **khi có SOP thật**, không folder trống. Tìm task = L1 của **đúng lá mặt**, không lá `minipower-tasks-search` (QĐ-14) |
| QĐ-2 | **Skill = SOP MCP.** Giữ `name: minipower-tasks-lark`. SKILL.md = mục lục; chi tiết → `workflows/` | Tách file: `l1-read.md` · `l2-preview.md` · `l3-write.md` (l3 = giới hạn catalog) · không nhét schema JSON tool vào markdown |
| QĐ-3 | **Agent-file = persona + ranh giới**, cùng identity skill | Path: `src/tasks/agents/minipower-tasks-lark.md`. Nội dung: bạn là trợ lý **tasklist/task** Lark; đọc skill trước khi gọi tool; **cấm** `im_v1_*` / wiki / bitable / drive. **Không** frontmatter tool-specific. Không spawn. |
| QĐ-4 | **Hai bề mặt kích hoạt, một SOP** | Skill: loader khớp `description`. Agent-file: người/CLI gắn phiên “Lark Tasks” (Cursor custom agent / Claude `@` rules). Cả hai **đọc cùng** `SKILL.md`. Không nhân bản checklist |
| QĐ-5 | **Face gate (mềm bằng lời ở v1)** | Đọc `memory/profile.json` → `tasks_provider`. `!== lark` → dừng, chỉ dẫn init / `memory/tasks/` nếu `none`. Hook `face-mismatch` **không** nằm ADR này |
| QĐ-6 | **Catalog MCP là SSOT tool** | Đầu phiên: `GetDynamicTools` namespace Lark, nhóm `task_v2_*`. Thiếu server / `needsAuth` → `mcp_auth` **một lần**, vẫn lỗi thì dừng + checklist cài (không copy dài từ god-file — trỏ README skill). **Cấm bịa** tên tool |
| QĐ-7 | **L1 tự do đọc · L2 bảng · L3 chỉ khi tool ghi tồn tại** | Catalog hiện tại: L3 create/update = **không gọi MCP**, trả hướng dẫn tạo tay trên Task Center + (tuỳ chọn) deep-link nếu user đưa. Khi upstream thêm tool ghi: L3 theo đúng bảng đã OK, không đổi kiến trúc |
| QĐ-8 | **Hỏi thiếu một lượt** | Thiếu: `tasklist_guid` (nếu không dùng `my_tasks`) · lọc `completed` · cửa sổ thời gian · map `{MOD}-FR-` / `T-NNN` nếu user đòi. `useUAT: true` khi schema có và việc của chính user |
| QĐ-9 | **`memory/lark.json` tùy chọn** | Chỉ `default_tasklist_guid` (+ comment version). Không bắt buộc init. Không git secrets. ID chat/wiki **không** thuộc file này (mặt chat/docs) |
| QĐ-10 | **SSOT việc** | `tasks_provider=lark` → Lark Task Center là board. `memory/memory.md` (ADR-035) = sổ cá nhân, **không** mirror toàn bộ task. `tasks=none` → SQLite `artifact` (ADR-035 QĐ-9; không còn `memory/tasks/`). Back-ref memory **không tự ghi** — user yêu cầu mới một dòng |
| QĐ-11 | **Cắt god-file** | `src/router/agents/lark-work-assistant.md`: xoá SOP task; đầu file trỏ skill. Index `router/agents/README.md`: không dùng cho task |
| QĐ-12 | **Điều phối nghề** | Intent “ticket / WBS trên Lark” → router **một** lá `minipower-tasks-lark` (không mở `pm/` để gọi MCP hộ). Intent “viết DOC-15” → `pm/`; ticket thực thi = người mở phiên kênh sau, nối bằng ID |
| QĐ-13 | **Cài skill = CLI hiện có; không sửa CLI cho agent-file** | Registry = **pack** (`tasks`), không liệt lá. `install` quét `src/{pack}/skills/*` rồi symlink. Agent-file không vào registry, không đụng `cli/minipower.mjs`. MCP OAuth ngoài repo. |
| QĐ-14 | **Tìm / lọc / “search” task = L1 của lá đúng mặt — không skill mới** | Intent “tìm task”, “quá hạn”, “tasklist X”, “WP #n” → cùng lá với `tasks_provider`. **Không** `minipower-tasks-search`, **không** một lá quét cả Lark lẫn OpenProject. Thiếu tool search trên MCP → L1 `list`/`get` + lọc trong phiên, nói rõ đã cắt trang; **cấm bịa** API search |

### §5.1 Kiến trúc — tầng và luồng (Lark **và** OpenProject)

`tasks_provider` chọn **một** nhánh. Router mở **một** lá. Không song song hai MCP board.

```text
                    người (gatekeeper)
                           │
                           │ intent: "tìm / tóm tắt / tạo task …"
                           ▼
              ┌─────────────────────────────────────┐
              │  always-on + minipower-router       │  một lá
              │  đọc profile.tasks_provider         │
              └──────────────────┬──────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
     lark                  openproject               none
     skill:                skill:                    không MCP kênh
     minipower-            minipower-                SQLite artifact
     tasks-lark            tasks-openproject         (ADR-035 QĐ-9)
           │                     │
           ▼                     ▼
     MCP user-lark-mcp     MCP OpenProject
     (mcp.tasks, cùng      (cùng con trỏ tên
      tên trừu tượng,       mcp.tasks — server
      server khác)          khác)
           │                     │
           └──────────┬──────────┘
                      ▼
         L1 đọc/tìm  →  L2 preview  →  người OK  →  L3 ghi
```

**Không có** mũi tên `tasks/` → `chat/` hay `analyst/`. Nhắc việc bằng tin = phiên `minipower-chat-lark`.

Bảng chọn lá (kể cả khi người chỉ nói “tìm task”, không nói vendor):

| `tasks_provider` | Skill (một phiên) | Tìm task nằm ở |
|------------------|-------------------|----------------|
| `lark` | `minipower-tasks-lark` | `workflows/l1-read.md` + `task_v2_*` |
| `openproject` | `minipower-tasks-openproject` | `workflows/l1-read.md` của **lá đó** (work package list/filter) |
| `none` | không lá kênh MCP | query SQLite / artifact local |

Lá OpenProject **chưa tạo** cho đến khi có SKILL.md thật (C6). Cây dưới là **hình đích**, không phải folder rỗng hôm nay.

### §5.2 Cây pack `tasks/` khi đủ hai provider

Phần chung pack (luật cổng người, hub) **một lần**. Mỗi provider: **một** skill + **một** agent-file cùng `name`. Workflow tìm/đọc/ghi **lặp khuôn**, khác MCP.

```text
src/tasks/                                    # pack kênh — một nhà
├── PACK.md                                   # mcp: [tasks]  (tên trừu tượng, không vendor)
├── README.md                                 # bảng MỌI lá đang có trên đĩa
├── rules/
│   └── l1-l2-l3-tasks.md                    # L1 tự do · L2 một bảng · L3 sau OK
│                                             #   (dùng chung Lark và OpenProject)
├── agents/
│   ├── minipower-tasks-lark.md              # persona: chỉ tasklist Lark, cấm IM/wiki
│   └── minipower-tasks-openproject.md       # persona: chỉ WP/OpenProject — KHI có SOP
└── skills/
    ├── minipower-tasks-lark/                # CÓ trên đĩa (làm dày trong ADR này)
    │   ├── SKILL.md
    │   ├── README.md
    │   └── workflows/
    │       ├── l1-read.md                   # gồm TÌM / lọc / list / get
    │       ├── l2-preview.md
    │       └── l3-write.md
    └── minipower-tasks-openproject/         # CHƯA tạo (ADR-033 D1, ngoài phạm vi thi hành 036)
        ├── SKILL.md
        ├── README.md
        └── workflows/
            ├── l1-read.md                   # tìm WP — SOP khác, cùng tầng L1
            ├── l2-preview.md
            └── l3-write.md
```

Cấm: `skills/minipower-tasks-search/` · `providers/lark` lồng trong một skill “thần” · folder OpenProject trống · script REST trong `tools/`.

Hai agent-file **không** gọi nhau. Đổi board = người `minipower init` đổi `tasks_provider`, phiên sau mở lá kia.

### §5.3 Hợp đồng I/O phiên

| Hướng | Artifact |
|--------|----------|
| Vào | Intent người · `profile.json` · (opt) `memory/lark.json` · schema MCP · filter đã hỏi |
| Ra L1 | Tóm tắt 3–7 bullet + mục mở + (opt) bảng task đã đọc — **cắt trang** phải nói |
| Ra L2 | Bảng `hành động \| tiêu đề \| due \| list \| map ID` — người bỏ dòng |
| Ra L3 | `task_guid` từng dòng; nhiều ticket ⇒ bảng `tiêu đề \| task_guid \| section` *(sửa 2026-11-14 — xem đính chính §5.4)* |
| Không ra | Body FR · tin nhắn nhóm · record Bitable · sửa `docs/` |

### §5.4 Tool map (tham chiếu, không SSOT)

SSOT = schema MCP tại runtime. Bảng này chỉ định hướng SOP; lệch catalog thì theo catalog.

> **Đính chính 2026-11-14.** Câu "MCP Lark chỉ đọc" ở §1 và vấn đề P3 là **mô tả sai**, không phải giới hạn của Lark. Soát lại gói `@larksuiteoapi/lark-mcp` 0.5.1 thấy khoảng **50 tool task**, đủ tạo, sửa, xoá, task con, section, bình luận, custom field, phụ thuộc.
>
> Nguyên nhân nhầm: gói nhận một **cờ chọn tool**, và preset task **thay thế** nhóm tool của preset mặc định chứ không cộng dồn — khai thiếu thì tool ghi bị bỏ qua **lặng lẽ**, catalog vẫn lên bình thường. Thêm một bẫy nữa: tên tool lúc khai dùng **dấu chấm**, tên client nhìn thấy dùng **gạch dưới**.
>
> Hệ quả: **L3 ghi thật là làm được**, không chờ upstream. Cách khai cờ cho đúng nằm ở `workflows/connect.md` của lá; bảng dưới giữ nguyên làm bản ghi thời điểm.

| Việc người | Tool (tên hay gặp 2026-09-26) | Tầng |
|------------|-------------------------------|------|
| Tìm / lọc (quá hạn, xong/chưa, theo list) | **Cùng** `task_v2_task_list` / `tasklist_tasks` + `completed` + phân trang — **không** skill riêng; catalog Lark **không** có `task_search` | L1 (`l1-read.md`) |
| Việc tôi đang giữ | `task_v2_task_list` `type=my_tasks` + `completed` + `useUAT` | L1 |
| Chi tiết một task | `task_v2_task_get` | L1 |
| Các list tôi đọc được | `task_v2_tasklist_list` | L1 |
| Task trong một list | `task_v2_tasklist_tasks` + `page_token` | L1 |
| Tạo / sửa / hoàn thành | ~~*không có trên catalog hiện tại*~~ → `task_v2_task_create` · `task_v2_taskSubtask_create` · `task_v2_task_patch` · `task_v2_task_addTasklist` · `task_v2_task_addDependencies` (đính chính 2026-11-14) | **L3 ghi thật** |

### §5.5 Việc cần có trước khi skill chạy được (ngoài repo)

1. App Lark/Feishu + scope Task; MCP `@larksuiteoapi/lark-mcp` (hoặc server `user-lark-mcp` đã gắn) + OAuth **user token** (UAT) — task cá nhân.
2. Workspace dự án: `.minipower/` + `minipower init` với `tasks_provider=lark`.
3. Pack `tasks/` đã cài vào loader (cùng `minipower install`).
4. (Khuyến nghị) `default_tasklist_guid` nếu làm việc theo list, không chỉ “Owned”.

Thiếu (1)–(3) → skill **dừng**, checklist ngắn, không giả dữ liệu.

---

## §6. Confirm

| # | Câu hỏi | Trả lời |
|---|---|---|
| Q1 | Duyệt QĐ-1…14 (nhà `tasks/`, một provider một lá, tìm = L1, L3 no-op khi MCP không ghi)? | **OK** 2026-09-26 |
| Q2 | Agent-file **bắt buộc** trong pack (O4) hay v1 **chỉ skill** (O2), agent-file để đợt sau? Đề xuất: **O4** vì đúng câu hỏi “agent và skill”. | **OK** — O4 |
| Q3 | Cắt SOP task khỏi `lark-work-assistant` **cùng đợt** skill (đề xuất: có — tránh hai SOP)? | **OK** |
| Q4 | Wire CLI symlink agent-file vào Cursor/Claude **trong ADR này** hay README lệnh tay, CLI = ADR-031? | **Không sửa CLI.** Registry chỉ pack; install đã symlink lá `skills/`. Agent-file không thuộc registry/CLI. |

Chốt xong: ghi ngày Trạng thái + index; mới thi hành §7.

---

## §7. Việc triển khai

| Bước | Việc | Done khi | Phụ thuộc |
|---|---|---|---|
| 1 | Làm dày SKILL + 3 workflow + README MCP/giới hạn ghi | Agent đọc SKILL là chạy L1 được | Q1 |
| 2 | Viết `agents/minipower-tasks-lark.md` + `rules/l1-l2-l3-tasks.md` | Persona không nhắc IM/wiki | Q2 |
| 3 | Hub `tasks/README.md` dòng agent-file | Bảng khớp test | 2 |
| 4 | Cắt task khỏi `lark-work-assistant` + index agents | Grep `task_v2` trong god-file = 0 (trừ con trỏ path skill) | Q3 |
| 5 | README pack: skill đi `install`; agent-file không CLI | Đúng Q4 | Q4 |
| 6 | Test: `channel-pack` giữ xanh; (opt) canh `tasks/agents/*.md` tồn tại nếu Q2 = O4 | `npm test` | 1–3 |
| 7 | `npm run link:check` — 0 gãy mới | CI | 4 |
| 8 | Smoke Cursor: intent tóm tắt task → đúng lá, không chat/analyst; `none` không MCP | Chủ repo | 1, profile |

---

## §8. Xác minh

| # | Loại | Case | Expect | Trạng thái |
|---|---|---|---|---|
| T1 | Smoke | Cursor: “tóm tắt task quá hạn Lark” khi `tasks_provider=lark` + MCP sống | Thông báo `minipower-tasks-lark`; L1 gọi `task_v2_*`; không `im_v1_message_create` | 🔴 chủ repo |
| T2 | Smoke | Cùng intent khi `tasks_provider=none` | Không MCP Lark; trỏ `memory/tasks/` | 🟡 ADR-033 T2 đã 🟢 — giữ |
| T3 | Smoke | User bảo “tạo task …” | L2 bảng; **không** bịa `task_create`; nói MCP chưa có tool ghi | 🔴 chủ repo |
| T4 | Regression | `npm test` + `gen:check`; `link:check` **không** thêm gãy từ file ADR-036 | `npm test` + `gen:check` xanh 2026-09-26. `link:check` còn NEW sẵn (ADR-037 path `src/sdlc/docs` trên ADR cũ) — không từ pack `tasks/` | 🟢 máy / 🟡 nợ sẵn |
| T5 | Regression | Grep `task_v2` trong `src/router/agents/lark-work-assistant.md` | 0 | 🟢 |
| T6 | Mới | `description` có tasklist / tìm task / `tasks_provider` / Lark | có | 🟢 |

---

## §9. Hệ quả

| Hướng | Hệ quả |
|--------|--------|
| Tốt | Một nhà, một SOP, persona tách IM; dispatcher không mở nghề để quản lý board |
| Xấu / chi phí | L3 tạo task **chưa tự động** đến khi Lark MCP ship tool ghi; god-file vẫn giữ wiki/Base |
| Trung lập | `pm/` vẫn sở hữu DOC-14/15; ticket sống ở Lark khi provider = lark |
| Dấu hiệu mở lại | Catalog xuất hiện `task_*create*` / `task_*patch*` → chỉ sửa `l3-write.md`, không ADR mới trừ khi đổi mặt provider. Wiki/Base Lark → ADR lá kênh khác, không nhét vào skill này |
