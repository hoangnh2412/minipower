# presales — ước lượng & báo giá trước ký

Skill lá (ADR-030). LLM **không** cộng MH. Đơn giá không commit.

Manifest: [PACK.md](PACK.md).

## Skill

| Skill | Tài liệu | Việc |
|---|---|---|
| **minipower-presales-estimation-ulnl** | [skills/minipower-presales-estimation-ulnl/README.md](./skills/minipower-presales-estimation-ulnl/README.md) | Gán mã ULNL + Σ MH (`classify`/`lineMH` là code) |
| **minipower-presales-quotation** | [skills/minipower-presales-quotation/README.md](./skills/minipower-presales-quotation/README.md) | BA data model 3 tầng (Bronze·Silver·Gold): ước lượng → XLSX công thức sống → báo giá nội bộ → báo giá khách hàng |

## Chọn engine ước lượng

| Dự án | Engine |
|---|---|
| Phát triển phần mềm (chức năng, giao diện, báo cáo) | `estimation-ulnl` |
| BA phân tích & thiết kế data model (lakehouse, DWH, migration) | `quotation` |

Không trộn hai catalog trong một estimate. Engine `quotation` (DMBA) chia **ba cấu phần** (phí khung · gói theo nguồn · ngoại lệ) thay vì một Σ MH.

Tiêu chuẩn báo giá DMBA — điều khoản bắt buộc (ba cấu phần, không buffer, giai đoạn, nghiệm thu...) kèm phụ lục căn cứ: [phuong-phap-bao-gia.md](./skills/minipower-presales-quotation/references/phuong-phap-bao-gia.md). Bảng tham số/công thức/quy trình thuần: [huong-dan-bao-gia.md](./skills/minipower-presales-quotation/references/huong-dan-bao-gia.md).

## Sẽ có — chỉ chữ, không folder

| Tên | Việc |
|---|---|
| survey | hoãn — dùng `discovery/` |
| proposal / GPKT | ADR-008 R5 |
| slide | ADR-008 |

## Liên quan

- Khảo sát: [`minipower-discovery-survey`](../discovery/skills/minipower-discovery-survey/SKILL.md)
- Giải pháp bán: [`minipower-architecture-solution-lite`](../architecture/skills/minipower-architecture-solution-lite/SKILL.md)
