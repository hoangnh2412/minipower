# DOC-17 — Hướng dẫn Triển khai

| Phiên bản | Ngày | Tác giả | Trạng thái |
|-----------|------|---------|------------|
| 0.1 | YYYY-MM-DD | | Draft |

**Tiêu chuẩn tham khảo:** Runbook / cutover checklist; phụ thuộc hạ tầng cụ thể (cloud, on-prem)

---

> **Hai mức điền —「lõi」và「full」.** Heading **không** đánh dấu = **lõi**: điền ở mọi dự án.
> Heading có **`▸ full`** = chỉ cần khi làm chuẩn để bàn giao / nghiệm thu.
> Bỏ mục `▸ full` là **có chủ đích**, không phải làm ẩu — nhưng phải ghi nợ vào
> `memory/doc-debt.md`. **Không xoá heading**: giữ chỗ để sau chỉ việc điền tiếp.

## 1. Tổng quan
| Mục | Giá trị |
|-----|---------|
| **System / Release** | vX.Y |
| **Deployment type** | Blue-green / Rolling / Big bang |
| **Maintenance window** | YYYY-MM-DD HH:MM – HH:MM (TZ) |
| **Rollback decision maker** | |

## 2. Môi trường
| Env | URL | Purpose | Infra |
|-----|-----|---------|-------|
| DEV | | Development | |
| STAGING | | Pre-prod validation | |
| PROD | | Production | |

## 3. Prerequisites (Điều kiện tiên quyết)
| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | UAT sign-off (DOC-16) | Business | ☐ |
| 2 | Migration dry-run pass | DBA | ☐ |
| 3 | Secrets / certs in vault | DevOps | ☐ |
| 4 | Monitoring & alerts configured | Ops | ☐ |
| 5 | Rollback script tested | DevOps | ☐ |
| 6 | Communication sent to users | PM | ☐ |

## 4. Kiến trúc triển khai ▸ full
→ **DOC-08 SAD** Deployment View

```text
[Load Balancer] → [App nodes] → [DB primary / replica]
```

## 5. Các bước triển khai
| Step | Action | Command / Link | Owner | Verify |
|------|--------|----------------|-------|--------|
| 1 | Enable maintenance mode | `...` | DevOps | Page shows banner |
| 2 | Backup database | `...` | DBA | Backup ID recorded |
| 3 | Run DB migration | `flyway migrate` | DBA | Schema version OK |
| 4 | Deploy application | `kubectl apply` / CI pipeline | DevOps | Health check pass |
| 5 | Smoke test | TC-smoke-001 … | QA | All pass |
| 6 | Disable maintenance | | DevOps | Users can login |

## 6. Di chuyển dữ liệu (nếu có) ▸ full
| Step | Action | Reconcile rule | Rollback |
|------|--------|----------------|----------|
| 1 | Export source | Row count match | Restore backup |

## 7. Xác minh sau triển khai
| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| Health endpoint | 200 OK | | ☐ |
| Critical UC smoke | UC-001 login | | ☐ |
| Integration INT-001 | Sync OK | | ☐ |
| APM / logs | No error spike | | ☐ |

## 8. Quy trình rollback
| Trigger | Action |
|---------|--------|
| Smoke fail | Execute rollback within X min |
| Data corruption | Stop traffic + restore backup |

### Các bước rollback

| Step | Action | Owner |
|------|--------|-------|
| 1 | Revert app to previous version | DevOps |
| 2 | Restore DB (if migrated) | DBA |
| 3 | Verify rollback smoke | QA |
| 4 | Notify stakeholders | PM |

## 9. Hypercare (sau go-live) ▸ full
| Period | Support model | Escalation |
|--------|---------------|------------|
| Day 1–7 | War room 24/7 | On-call roster |

## 10. Liên hệ ▸ full
| Role | Name | Phone / Slack |
|------|------|---------------|
| DevOps on-call | | |
| DBA | | |
| PM | | |

## 11. Ký duyệt ▸ full
| Vai trò | Go / No-go | Ngày |
|---------|------------|------|
| DevOps Lead | | |
| QA Lead | | |
| PM | | |
