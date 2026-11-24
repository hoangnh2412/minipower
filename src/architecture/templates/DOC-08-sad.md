# DOC-08 — Tài liệu Kiến trúc Giải pháp (SAD)

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** **SEI** — *Documenting Software Architectures: Views and Beyond*; **Kruchten 4+1 View Model**

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = điền khi tiến trình cần tới (bàn giao / nghiệm thu); chưa cần thì ghi nợ.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Giới thiệu
### 1.1 Mục đích

### 1.2 Phạm vi

[In/out scope kiến trúc; tham chiếu DOC-06]

### 1.3 Định nghĩa & Tài liệu tham chiếu

| Ref | Tài liệu |
|-----|----------|
| | DOC-06 SRS, DOC-10 Integration, DOC-09 ADR |

### 1.4 Tổng quan kiến trúc

[Tóm tắt 1 trang: style, pattern, key decisions]

## 2. Mục tiêu & Ràng buộc kiến trúc ▸ full
| ID | Goal / Constraint | NFR trace |
|----|-------------------|-----------|
| AG-001 | | NFR-xxx |

## 3. Stakeholder & Mối quan tâm ▸ full
| Stakeholder | Concern | View addressing |
|-------------|---------|-----------------|
| Dev team | Maintainability | Module / Component |
| Ops | Deployability | Deployment |

## 4. Các góc nhìn kiến trúc
### 4.1 Góc nhìn logic (Component)

```text
[Component diagram — modules, layers, dependencies]
```

| Component | Trách nhiệm | Technology |
|-----------|-------------|------------|
| | | |

### 4.2 Góc nhìn tiến trình (Runtime)

[Luồng xử lý, concurrency, async, queue]

### 4.3 Góc nhìn phát triển (Module / Package)

[Cấu trúc repo, module boundaries]

### 4.4 Góc nhìn vật lý / Triển khai

```text
[Deployment diagram — nodes, network zones]
```

| Environment | Nodes | Scaling |
|-------------|-------|---------|
| Production | | |

### 4.5 Kịch bản (+1 — xác thực use case)

| Scenario | Views involved | Validates |
|----------|----------------|-----------|
| UC-001 login flow | Logical + Process + Deployment | NFR security |

## 5. Mối quan tâm xuyên suốt ▸ full
| Concern | Approach | ADR ref |
|---------|----------|---------|
| Security | RBAC + ABAC | ADR-001 |
| Logging / Audit | | |
| Error handling | | |

## 6. Tóm tắt quyết định kiến trúc
→ Chi tiết **DOC-09 ADR**

| ADR ID | Decision | Status |
|--------|----------|--------|
| ADR-001 | | Accepted |

## 7. Rủi ro & Nợ kỹ thuật ▸ full
| ID | Rủi ro | Mitigation |
|----|--------|------------|
| | | |

## 8. Phê duyệt ▸ full
| Vai trò | Họ tên | Ngày |
|---------|--------|------|
| Solution Architect | | |
| Tech Lead | | |
