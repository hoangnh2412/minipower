# minipower-presales-quotation

Ước lượng BA data model 3 tầng (Bronze · Silver · Gold) → báo giá. `estimate.json → to_xlsx.py` (công thức sống, hiệu chỉnh tay) `→ from_xlsx.py` (báo giá nội bộ md/html) `→ to_customer_html.py` (báo giá khách hàng, lược bỏ phần nội bộ). Không chứa đơn giá/tên khách hàng mặc định — truyền qua `00-THAMSO` hoặc `--set`/cờ CLI.
