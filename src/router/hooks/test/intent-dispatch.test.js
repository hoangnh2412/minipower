import test from "node:test"
import assert from "node:assert/strict"
import { matchIntent, matchIntents, announceLine, INTENT_RULES } from "../../../router/lib/intent-dispatch.js"

test("intent: Khởi tạo dự án sample → minipower-router-init", () => {
  assert.equal(matchIntent("Khởi tạo dự án sample"), "minipower-router-init")
})

test("intent: không cần /minipower — mô tả việc", () => {
  assert.equal(matchIntent("thêm cache Redis cho service đơn hàng"), "minipower-backend-caching-dotnet")
  assert.equal(matchIntent("Viết FR luồng đặt hàng module ORD"), "minipower-analyst-srs")
  assert.equal(matchIntent("làm gì tiếp"), "minipower-router")
  assert.equal(matchIntent("Thêm màn danh sách nhân viên có phân trang"), "minipower-frontend-crud-react")
})

test("intent: khóa dài thắng — không nhầm init với skill khác", () => {
  assert.equal(matchIntent("Init project ten-du-an"), "minipower-router-init")
})

test("intent: không khớp → null (dispatcher hỏi, không bịa)", () => {
  assert.equal(matchIntent("hôm nay ăn gì"), null)
})

test("ADR-043 QĐ-8 — matchIntents: prompt ghép → ≥ 2 lá, không trùng; matchIntent vẫn một", () => {
  const p = "viết FR module ORD rồi scaffold backend và review PR"
  const hits = matchIntents(p)
  for (const s of ["minipower-analyst-srs", "minipower-backend-scaffold-dotnet", "minipower-backend-review-dotnet"]) {
    assert.ok(hits.includes(s), `thiếu ${s}`)
  }
  assert.ok(hits.length >= 2, "tín hiệu PHỨC cần ≥ 2 lá")
  assert.equal(new Set(hits).size, hits.length, "không trùng")
  assert.equal(matchIntent(p), "minipower-backend-scaffold-dotnet", "khóa dài nhất thắng, vẫn một lá")
  // Nguyên văn ADR-043 §5.10: "và review" không khớp key nào — vẫn ≥ 2
  assert.ok(matchIntents("viết FR module ORD rồi scaffold backend và review").length >= 2)
})

test("ADR-043 QĐ-8 — matchIntents: ĐƠN → một; dispatcher không tính; không khớp → []", () => {
  assert.deepEqual(matchIntents("Viết FR luồng đặt hàng module ORD"), ["minipower-analyst-srs"])
  assert.deepEqual(matchIntents("làm gì tiếp"), [], "dispatcher không phải lá làm việc")
  assert.deepEqual(matchIntents("hôm nay ăn gì"), [])
  assert.equal(matchIntent("làm gì tiếp"), "minipower-router", "matchIntent không đổi")
  const plan = INTENT_RULES.find((r) => r.skill === "minipower-router-plan")
  assert.ok(plan, "INTENT_RULES phải có lá plan")
  // "lập kế hoạch" là key của minipower-pm-plan (WBS/DOC-14) — lá plan cố ý không dùng, dù description có chữ đó
  assert.ok(!plan.keys.includes("lập kế hoạch"), "trùng key minipower-pm-plan")
  assert.ok(matchIntents("plan trước khi làm: viết FR rồi scaffold backend").includes("minipower-router-plan"))
})

test("intent: dòng thông báo trước khi chạy", () => {
  const task = "Khởi tạo dự án sample"
  const skill = matchIntent(task)
  assert.equal(announceLine(skill, task), "Sẽ chạy `minipower-router-init` để xử lý Khởi tạo dự án sample.")
})
