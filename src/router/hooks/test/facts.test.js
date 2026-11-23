/**
 * Số liệu dùng chung (lib/facts.js) — cơ chế tiêm giá trị vào markdown.
 *
 * Assert trên fixture tự dựng, KHÔNG trên tồn kho thật của repo: con số thật
 * (bao nhiêu lá, bao nhiêu ADR) là dữ liệu, chép nó vào test là tạo nguồn chân
 * lý thứ hai — đúng thứ check A11 đi bắt.
 */

import test from "node:test"
import assert from "node:assert/strict"

import { factAt, injectInto, scanFacts } from "../lib/facts.js"

const FACTS = {
  leaves: { by_pack: { backend: 20, frontend: 10 }, total: 75 },
  adr: { total: 46, next_code: "ADR-047" },
}

test("factAt: lấy được giá trị theo đường dẫn chấm", () => {
  assert.equal(factAt(FACTS, "leaves.by_pack.backend"), 20)
  assert.equal(factAt(FACTS, "leaves.total"), 75)
  assert.equal(factAt(FACTS, "adr.next_code"), "ADR-047")
})

test("factAt: đường dẫn không có, hoặc trỏ vào nhánh, thì trả undefined", () => {
  assert.equal(factAt(FACTS, "khong.co.that"), undefined)
  assert.equal(factAt(FACTS, "leaves.by_pack.ops"), undefined)
  // trỏ vào một nhánh (object) chứ không phải giá trị — không tiêm được
  assert.equal(factAt(FACTS, "leaves.by_pack"), undefined)
})

test("injectInto: thay giá trị lệch bằng giá trị thật", () => {
  const src = "Module backend — <!--f:leaves.by_pack.backend-->99<!--/f--> lá.\n"
  const { next, bad } = injectInto(src, FACTS)
  assert.deepEqual(bad, [])
  assert.match(next, /<!--f:leaves\.by_pack\.backend-->20<!--\/f-->/)
})

test("injectInto: giá trị đã đúng thì văn bản không đổi", () => {
  const src = "Có <!--f:adr.total-->46<!--/f--> ADR.\n"
  const { next, bad } = injectInto(src, FACTS)
  assert.equal(next, src)
  assert.deepEqual(bad, [])
})

test("injectInto: nhiều marker trên một dòng đều được thay", () => {
  const src = "<!--f:adr.total-->1<!--/f--> ADR · kế tiếp <!--f:adr.next_code-->X<!--/f-->\n"
  const { next } = injectInto(src, FACTS)
  assert.equal(next, "<!--f:adr.total-->46<!--/f--> ADR · kế tiếp <!--f:adr.next_code-->ADR-047<!--/f-->\n")
})

test("injectInto: marker trỏ fact không có thì báo, và giữ nguyên văn bản", () => {
  const src = "Số <!--f:khong.co.that-->x<!--/f--> đây.\n"
  const { next, bad } = injectInto(src, FACTS)
  assert.deepEqual(bad, ["khong.co.that"])
  assert.equal(next, src, "không được tự ý xoá marker mình chưa hiểu")
})

test("scanFacts: mọi nhánh đều có mặt và đếm được, không nhánh nào rỗng", () => {
  const f = scanFacts()
  for (const key of ["leaves", "description", "adr", "checks", "repo"]) {
    assert.ok(key in f, `thiếu nhánh ${key}`)
  }
  // Không khoá con số — chỉ đòi nó là số dương, tức phép quét có chạy.
  assert.ok(f.leaves.total > 0, "không quét được lá nào")
  assert.ok(f.description.chars > 0, "không đọc được description nào")
  assert.ok(f.adr.total > 0, "không quét được ADR nào")
  assert.ok(f.checks.total > 0, "không thấy check nào đăng ký")
  assert.match(f.adr.next_code, /^ADR-\d{3}$/)
})

test("scanFacts: tổng số lá bằng tổng cộng theo pack", () => {
  const f = scanFacts()
  const sum = Object.values(f.leaves.by_pack).reduce((a, b) => a + b, 0)
  assert.equal(sum, f.leaves.total, "tổng theo pack lệch tổng chung")
})

test("factAt: mảng giá trị đơn nối thành chuỗi; mảng có object thì không tiêm được", () => {
  assert.equal(factAt({ ids: ["A03", "A04"] }, "ids"), "A03 · A04")
  assert.equal(factAt({ ids: [] }, "ids"), "")
  assert.equal(factAt({ xs: [{ a: 1 }] }, "xs"), undefined)
})
