# L3 — Ghi OpenProject (sau OK)

1. Chỉ dòng còn tick trên bảng L2.
2. Catalog có tool create/update **đúng tên trong schema** (`create_work_package`, `update_work_package`, …) → gọi từng dòng; lỗi 4xx → báo, không retry vô hạn cùng payload.
3. **Không có** tool ghi → **không gọi MCP**, không bịa tên tool. Trả: hướng dẫn tạo/sửa tay trên OpenProject + copy subject/type/project từ bảng L2. Deep-link chỉ khi người đã đưa URL instance.
4. Thành công: in `WP#` / id MCP. Back-ref `memory/memory.md` **chỉ khi** người yêu cầu một dòng.
5. Không sửa `docs/`, không publish Outline từ đây.
