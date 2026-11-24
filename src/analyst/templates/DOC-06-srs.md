# DOC-06 — Đặc tả Yêu cầu Phần mềm (SRS)

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **IEEE 830** · **ISO/IEC/IEEE 29148:2011/2017**

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = điền khi tiến trình cần tới (bàn giao / nghiệm thu); chưa cần thì ghi nợ.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Giới thiệu ▸ full
### 1.1 Mục đích

[Mục đích tài liệu, đối tượng đọc]

### 1.2 Phạm vi

[Tên sản phẩm, phạm vi phần mềm — tham chiếu DOC-03]

### 1.3 Định nghĩa, Viết tắt

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| | |

### 1.4 Tài liệu tham chiếu

| ID | Tài liệu |
|----|----------|
| | DOC-03 BRD, DOC-05 Use Cases |

### 1.5 Tổng quan

[Cấu trúc phần còn lại của SRS]

## 2. Mô tả tổng quan ▸ full
### 2.1 Bối cảnh sản phẩm

[Context hệ thống, interface với hệ thống khác]

### 2.2 Chức năng sản phẩm

[Tóm tắt chức năng chính theo module]

### 2.3 Phân loại người dùng

| User class | Mô tả | Kỹ năng |
|------------|-------|---------|
| | | |

### 2.4 Môi trường vận hành

| Mục | Yêu cầu |
|-----|---------|
| Client | Browser / OS |
| Server | |
| Network | |

### 2.5 Ràng buộc thiết kế & triển khai

| ID | Constraint |
|----|------------|
| | |

### 2.6 Giả định & Phụ thuộc

| ID | Mô tả |
|----|-------|
| | |

## 3. Yêu cầu chức năng
> Chi tiết NFR → **DOC-13**. AC → **DOC-07**.

| FR ID | Mô tả | Priority | Source (UC/BRQ) | Verification method |
|-------|-------|----------|-----------------|---------------------|
| FR-001 | Hệ thống shall … | Must | UC-001 | Test |

> **Không** dùng SRS làm task board. Việc theo dõi khi `tasks_provider=none` sống ở SQLite `memory/trace.db` (`artifact` `type=task`); trong DOC này chỉ **trỏ** `T-NNN` nếu cần. OpenProject/Lark = SSOT việc, không nhân bảng trạng thái vào đây.

### FR-[ID] — [Tên] (mẫu chi tiết)

| Mục | Nội dung |
|-----|----------|
| **Description** | |
| **Inputs** | |
| **Processing** | |
| **Outputs** | |
| **Preconditions** | |
| **Postconditions** | |
| **Error handling** | |

## 4. Yêu cầu giao diện bên ngoài ▸ full
### 4.1 Giao diện người dùng

[Màn hình, UX constraint — hoặc tham chiếu wireframe]

### 4.2 Giao diện phần cứng

[Nếu có]

### 4.3 Giao diện phần mềm

→ Chi tiết **DOC-10**, **DOC-12**

### 4.4 Giao diện truyền thông

[Protocol, format]

## 5. Yêu cầu phi chức năng khác (tóm tắt) ▸ full
→ Chi tiết **DOC-13**

| NFR ID | Category | Tóm tắt |
|--------|----------|---------|
| NFR-001 | Performance | |

## 6. Phụ lục ▸ full
### 6.1 Ma trận truy vết (tóm tắt)

| FR ID | UC | BR | AC | Test |
|-------|----|----|----|------|
| FR-001 | UC-001 | BR-001 | AC-001 | TC-001 |

## 7. Phê duyệt / Baseline ▸ full
| Vai trò | Họ tên | Ngày | Version baseline |
|---------|--------|------|------------------|
| Business Owner | | | v1.0 |
