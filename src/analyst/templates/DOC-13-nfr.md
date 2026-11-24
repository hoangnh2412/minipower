# DOC-13 — Yêu cầu Phi chức năng (NFR)

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **ISO/IEC 25010** (quality model); van Lamsweerde goal-oriented NFR; phần NFR trong ISO/IEC/IEEE 29148

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = điền khi tiến trình cần tới (bàn giao / nghiệm thu); chưa cần thì ghi nợ.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Giới thiệu
[Phạm vi; tham chiếu DOC-06 SRS §5, DOC-08 SAD]

## 2. Ma trận tóm tắt NFR
| NFR ID | Category | Requirement (measurable) | Priority | Verification | Owner |
|--------|----------|--------------------------|----------|--------------|-------|
| NFR-001 | Performance | Response ≤ 2s @ 100 concurrent users | Must | Load test | |

## 3. Phân loại ▸ full
### 3.1 Hiệu năng

| NFR ID | Metric | Target | Measurement method | Environment |
|--------|--------|--------|--------------------|-------------|
| NFR-P01 | Response time (p95) | ≤ 2s | JMeter / k6 | Staging |
| NFR-P02 | Throughput | 500 TPS | | |

### 3.2 Khả dụng & Độ tin cậy

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-A01 | SLA uptime | 99.9% / month |
| NFR-A02 | RTO | 4 hours |
| NFR-A02 | RPO | 1 hour |

### 3.3 Bảo mật

| NFR ID | Requirement | Tiêu chuẩn / control |
|--------|-------------|------------------|
| NFR-S01 | Authentication | SSO + MFA for admin |
| NFR-S02 | Authorization | RBAC + ABAC |
| NFR-S03 | Encryption at rest | AES-256 |
| NFR-S04 | Encryption in transit | TLS 1.2+ |
| NFR-S05 | Audit log | Immutable, 7-year retention |

### 3.4 Khả năng bảo trì & Vận hành

| NFR ID | Requirement |
|--------|-------------|
| NFR-M01 | Deploy without downtime (blue-green) |
| NFR-M02 | Structured logging (JSON) |

### 3.5 Khả năng mở rộng

| NFR ID | Requirement |
|--------|-------------|
| NFR-SC01 | Horizontal scale to 500 users |

### 3.6 Tuân thủ & Pháp lý

| NFR ID | Regulation / policy |
|--------|---------------------|
| NFR-C01 | PDPA / data residency VN |

### 3.7 Khả năng sử dụng & Tiếp cận

| NFR ID | Requirement |
|--------|-------------|
| NFR-U01 | WCAG 2.1 AA (nếu áp dụng) |

## 4. Mẫu chi tiết NFR ▸ full
### NFR-[ID] — [Tên]

| Mục | Nội dung |
|-----|----------|
| **Statement** | The system shall … |
| **Rationale** | |
| **Acceptance criteria** | → DOC-07 AC-NFR-xxx |
| **Architectural impact** | → DOC-08, ADR-xxx |
| **Test approach** | Load / Pen test / Audit |

## 5. Truy vết ▸ full
| NFR ID | SAD section | AC ID | Test (DOC-16) | Monitoring |
|--------|-------------|-------|---------------|------------|
| NFR-001 | Deployment view | AC-NFR-001 | TC-perf-001 | APM dashboard |

## 6. Phê duyệt ▸ full
| Vai trò | Ngày |
|---------|------|
| Architect | |
| Security | |
