---
name: minipower-docs-outline
description: Tra cứu, tóm tắt, xuất bản và migrate tài liệu trên Outline (MCP mặt docs). Dùng khi wiki Outline, publish DOC, docs_provider outline, đồng bộ local markdown ↔ Outline — không dùng cho Lark wiki hay Git.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-docs-outline

SOP MCP mặt **`docs`**. Wrap tool, không nhúng field API. Hướng dẫn người: [README.md](README.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Tìm / đọc collection Outline | [workflows/l1-l3.md](workflows/l1-l3.md) — L1 |
| Publish DOC đã duyệt / migrate | L2 bảng URI+tiêu đề → một OK → L3 |

**Không dùng** cho Lark wiki/docx (`user-lark-mcp`) hay file `docs/` local khi `docs_provider: local`.

## Quy tắc cốt lõi

- `docs_provider` phải là `outline`. Khác → dừng.
- Server từ `mcp.docs`. Catalog lỗi / `needsAuth` → `mcp_auth` một lần; vẫn chết → dừng, **không bịa tool**.
- Mỗi phiên: đọc schema thật. Không copy danh sách argument vào pack này.
- Publish / import / tạo document = **L3**. Nháp trong chat = L2.
- DOC chưa qua QC người ký → **không** publish làm bản chính thức.
- Migrate: một bảng file/URI, uncheck từng dòng, một OK (QĐ-7). Không tự xoá nguồn cũ trừ khi người bảo.
- SSOT nội dung theo provider đã chốt; git `docs/` là bản local khi provider là `local`.

## Output

- L1: tóm tắt + link Outline.
- L2: bảng `path local | collection | title | hành động`.
- L3: URI document trả về từ MCP.
