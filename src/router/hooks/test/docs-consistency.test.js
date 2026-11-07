/**
 * Golden test — tài liệu gốc repo khớp quyết định (ADR-020 §8 #10, #12).
 *
 * AGENTS.md và contracts/ là thứ agent đọc ĐẦU TIÊN. Một câu sai ở đó lan
 * ra mọi phiên làm việc sau — đắt hơn nhiều so với một câu sai trong skill lẻ.
 * Trước giờ chúng chỉ được canh bằng trí nhớ người sửa.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { PROJECT_MODES } from "../lib/rules.js"
import { ROOT, HOOKS, ROUTER, SRC } from "../lib/skill-catalog.js"

const read = (...p) => readFileSync(join(ROOT, ...p), "utf8")
const MODE_IDS = Object.keys(PROJECT_MODES)

// ─── #12 — AGENTS.md ────────────────────────────────────────────────────────

test("#12 — AGENTS.md nói rõ 3 gate là MỀM (QĐ-11)", () => {
  const t = read("AGENTS.md")
  assert.match(t, /gate đều MỀM|gate.*mềm/i, "phải nói 3 gate là mềm")
  assert.match(t, /QĐ-11/, "phải trỏ quyết định nguồn")
  assert.match(t, /không hook nào chặn/i)
})

test("#12 — AGENTS.md có phép thử 'cái gì FAIL được bằng máy'", () => {
  const t = read("AGENTS.md")
  assert.match(t, /FAIL được bằng máy/i, "phải có phép thử trước khi viết 'bắt buộc'")
  assert.match(t, /cứng bằng máy, mềm bằng lời/i)
})

test("#12 — AGENTS.md khai đủ 3 chế độ + không hứa permissions.deny nữa", () => {
  const t = read("AGENTS.md")
  for (const id of MODE_IDS) {
    assert.match(t, new RegExp(`\`${id}\``), `AGENTS.md chưa nhắc chế độ \`${id}\``)
  }
  assert.match(t, /[Kk]hông còn `permissions\.deny` tĩnh/, "phải nói rõ đã bỏ deny tĩnh")
  assert.match(t, /baseline-guard/, "phải nêu hook thay thế")
})

test("#12 — AGENTS.md khai mô hình mỗi module một nhịp (QĐ-14)", () => {
  const t = read("AGENTS.md")
  assert.match(t, /QĐ-14/)
  assert.match(t, /pipeline theo module/i)
  assert.match(t, /không.*agent bàn giao cho agent/i, "phải giữ ranh giới §0")
})

test("#12 — AGENTS.md nêu lệnh trace:check", () => {
  const t = read("AGENTS.md")
  assert.match(t, /trace:check/)
  const pkg = JSON.parse(readFileSync(join(HOOKS, "package.json"), "utf8"))
  assert.ok(pkg.scripts["trace:check"], "AGENTS.md nêu lệnh mà package.json không có")
})

// ─── #12 — contracts/handoff.md ──────────────────────────────────────────────────

test("#12 — contracts/handoff.md: handoff là per-module, không per-project", () => {
  const t = read("contracts", "handoff.md")
  assert.match(t, /per-module/i, "phải nói rõ handoff theo module")
  assert.match(t, /QĐ-14/)
  assert.match(t, /[Kk]hông có vạch đích chung/, "phải phủ định barrier")
  for (const h of ["H0", "H1", "H2", "H3", "H4", "H5", "H6"]) {
    assert.match(t, new RegExp(`\\*\\*${h}\\*\\*`), `thiếu boundary ${h}`)
  }
})

// ─── #12 — README use-case ──────────────────────────────────────────────────

test("#12 — README repo có use-case cho cả 3 chế độ", () => {
  const t = read("README.md")
  for (const id of MODE_IDS) {
    assert.match(t, new RegExp(`\`${id}\``), `README thiếu use-case chế độ \`${id}\``)
  }
  assert.match(t, /con người là người ra lệnh|người ra lệnh/i)
  assert.match(t, /SKILL\.md#chế-độ-dự-án-project_mode/, "phải trỏ bảng chi tiết")
})

// ─── #10 — change-control ───────────────────────────────────────────────────

test("#10 — change-control có luồng chuyển mode đủ 2 chiều lên + nhắc DEC", () => {
  const t = readFileSync(join(SRC, "analyst", "skills", "minipower-analyst-cr", "SKILL.md"), "utf8")
  assert.match(t, /mvp → standard/i, "thiếu luồng mvp → standard")
  assert.match(t, /maintain → standard/i, "thiếu luồng maintain → standard")
  assert.match(t, /QĐ-7/, "phải trỏ quyết định nguồn")
  assert.match(t, /phải kèm DEC|kèm DEC/i, "đổi mode phải kèm DEC (chặn R3)")
  assert.match(t, /trace:check/, "điều kiện lên standard phải gồm trace:check")
  assert.match(t, /[Kk]hông có bước di trú cấu trúc/, "phải khẳng định QĐ-2")
})

test("#10 — change-control định nghĩa format doc-debt khớp file skeleton", () => {
  const skill = readFileSync(join(SRC, "analyst", "skills", "minipower-analyst-cr", "SKILL.md"), "utf8")
  const debt = readFileSync(
    join(ROUTER, "project-skeleton", "memory", "doc-debt.md"),
    "utf8",
  )
  // Cùng bộ cột — skill mô tả format, skeleton là file thật; lệch nhau là bẫy.
  for (const col of ["Thiếu gì", "Module / phạm vi", "Cần trước khi", "Trạng thái"]) {
    assert.match(skill, new RegExp(col), `change-control thiếu cột "${col}"`)
    assert.match(debt, new RegExp(col), `doc-debt.md thiếu cột "${col}"`)
  }
  assert.match(skill, /prereq-gate/, "phải nói rõ KHI NÀO ghi nợ")
})

test("#10 — change-control khai per-mode và tự nhận là mềm", () => {
  const t = readFileSync(join(SRC, "analyst", "skills", "minipower-analyst-cr", "SKILL.md"), "utf8")
  for (const id of MODE_IDS) assert.match(t, new RegExp(`\`${id}\``), `thiếu chế độ \`${id}\``)
  assert.match(t, /không lặp lại ở đây/i)
  assert.match(t, /baseline-guard/, "phải phân biệt cái mềm với cái cứng còn lại")
})

// ─── #11 — wiring CI ────────────────────────────────────────────────────────

test("#11 — mọi file ADR-020 hứa đều tồn tại thật", () => {
  const must = [
    [ROUTER, "templates", "trace.sql"],
    [ROUTER, "project-skeleton", "memory", "trace.sql"],
    [ROUTER, "project-skeleton", ".gitlab-ci.yml"],
    [ROUTER, "project-skeleton", "memory", "doc-debt.md"],
    [ROUTER, "project-skeleton", "assets", "archive", "README.md"],
    [SRC, "architecture", "skills", "minipower-architecture-as-built", "SKILL.md"],
    [ROUTER, "project-skeleton", "memory", "decision-log.md"],
    [ROUTER, "project-skeleton", "memory", "open-questions.md"],
    [ROUTER, "project-skeleton", "memory", "memory.md.example"],
    [ROUTER, "docs-skeleton", "06-changes", "incident", "README.md"],
  ]
  for (const p of must) {
    const [root, ...rest] = p
    assert.ok(existsSync(join(root, ...rest)), `thiếu ${rest.join("/")}`)
  }
})

// ─── #13 — ADR-022: router name + contracts/ + index AGENTS ─────────────────

test("#13 — đúng một name minipower-router; không còn src/sdlc", () => {
  assert.equal(existsSync(join(SRC, "sdlc")), false, "src/sdlc phải đã xoá (ADR-037 E5)")
  const hits = []
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".git") continue
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name === "SKILL.md") {
        const t = readFileSync(p, "utf8")
        if (/^name:\s*minipower-router\s*$/m.test(t)) hits.push(p)
      }
    }
  }
  walk(ROOT)
  assert.deepEqual(hits.map((p) => p.slice(ROOT.length + 1)), [
    join("src", "router", "skills", "minipower-router", "SKILL.md"),
  ])
})

test("T8 — không SKILL.md nào đăng ký name minipower-sdlc", () => {
  const walk = (dir, acc = []) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".git") continue
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p, acc)
      else if (e.name === "SKILL.md") acc.push(p)
    }
    return acc
  }
  const hits = []
  for (const p of walk(ROOT)) {
    const t = readFileSync(p, "utf8")
    if (/^name:\s*minipower-sdlc\s*$/m.test(t)) hits.push(p)
  }
  assert.equal(hits.length, 0, hits.join("\n"))
})

test("#13 — contracts/ đủ 5 file chủ đề + README; mỗi file chủ đề tự khai Trạng thái (QĐ-10)", () => {
  const topics = ["trace-spine", "handoff", "shared-conventions", "cross-repo-bridge", "pack-manifest"]
  assert.ok(existsSync(join(ROOT, "contracts", "README.md")), "thiếu contracts/README.md")
  for (const f of topics) {
    const p = join(ROOT, "contracts", `${f}.md`)
    assert.ok(existsSync(p), `thiếu contracts/${f}.md`)
    assert.match(readFileSync(p, "utf8"), /\*\*Trạng thái:\*\*/, `contracts/${f}.md thiếu dòng Trạng thái — QĐ-10: mỗi file tự khai`)
  }
})

test("#13 — AGENTS.md index đủ 5 link contracts (QĐ-10: thay 3 chỗ đã gỡ)", () => {
  const t = read("AGENTS.md")
  for (const f of ["trace-spine", "handoff", "shared-conventions", "cross-repo-bridge", "pack-manifest"]) {
    assert.ok(t.includes(`contracts/${f}.md`), `AGENTS.md thiếu link contracts/${f}.md`)
  }
})
