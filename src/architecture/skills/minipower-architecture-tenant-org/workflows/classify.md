# Xếp mô hình vào Tenant, Org, OrgStructure

## Việc của agent

1. Đọc mô tả của người. Liệt kê hết node họ nêu (công ty, chi nhánh, đại lý, phòng ban, khách).
2. Với mỗi node, trả lời lần lượt, dừng ở câu đầu tiên đúng:

| # | Câu hỏi | Lớp |
|---|---------|-----|
| 1 | Node quản trị toàn bộ nền sau khi cài đặt, không giữ hóa đơn? | **Root** (chỉ một) |
| 2 | Node cần vùng riêng để tự tạo Org cho khách? | **Tenant**. Nếu nó thuộc một Tenant khác thì ghi `ParentTenantId` = Tenant đó |
| 3 | Node là người bán trên hóa đơn? | **Org** trong Tenant đang chứa nó |
| 4 | Node chỉ là phòng ban, hoặc chỉ là chỗ tạo hóa đơn mà hóa đơn vẫn thuộc Org khác? | **OrgStructure** của Org sở hữu hóa đơn |

3. Vẽ cây:

```text
Root
  └── Tenant
        ├── Org
        │     └── OrgStructure
        └── Tenant con
              └── Org
                    └── OrgStructure
```

4. In bảng:

| Thành phần | Lớp | Nằm trong |
|------------|-----|-----------|
| … | Tenant / Org / OrgStructure | Tenant cha hoặc Org cha |

5. Nếu chưa biết ai đứng tên hóa đơn hoặc ai tạo Org khách, ghi dòng đó là **chưa xếp** và hỏi một lần. Không đoán.

## Mẫu đã chốt

| Tình huống | Xếp |
|------------|-----|
| Minvoice, EPAY, VNA là khách của nền tảng | Ba Tenant gốc dưới Root |
| Chi nhánh HCM của Minvoice tạo Org cho khách của HCM | Tenant con của Tenant Minvoice |
| Khách do HCM bán | Org trong Tenant HCM |
| Khách do Minvoice bán trực tiếp | Org trong Tenant Minvoice |
| Phòng ban của Minvoice, của HCM, của khách, của EPAY | OrgStructure của Org cùng tên |
| Đại lý thuộc HCM | Tenant con của Tenant HCM |
| Đại lý do Minvoice quản lý trực tiếp | Tenant con của Tenant Minvoice |
| Chi nhánh, phòng vé, đại lý VNA; hóa đơn vẫn của VNA | OrgStructure của Org VNA. Phòng ban của chi nhánh là con của node chi nhánh |

## Không làm trong workflow này

- Không tạo `ParentOrgId`.
- Không biến phòng ban thành Tenant.
- Không viết migration, ADR hay code. Người bảo ghi tài liệu thì chuyển `minipower-architecture-sad`.
