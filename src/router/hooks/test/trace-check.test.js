/**
 * Golden test — trace:check (ADR-020 QĐ-5 · C8, việc #11).
 *
 * Điều quan trọng nhất cần chứng minh: nó **không phạt vì tài liệu chưa viết**.
 * Tài liệu xây dần theo tiến trình, thiếu DOC là bình thường (QĐ-2); một `trace:check`
 * kêu inh ỏi ở đó sẽ bị người dùng tắt đi, và tắt rồi thì cả C8 mất tác dụng luôn.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { traceCheck, formatReport } from "../lib/trace-check.js"
import { closeDb, openTraceDb, sqliteDatabaseSync } from "../lib/trace-store.js"

function proj() {
  const root = mkdtempSync(join(tmpdir(), "mp-trace-"))
  mkdirSync(join(root, "docs", "03-modules", "ORD"), { recursive: true })
  mkdirSync(join(root, "docs", "01-project"), { recursive: true })
  return root
}

const write = (root, rel, text) => {
  const p = join(root, ...rel.split("/"))
  mkdirSync(join(p, ".."), { recursive: true })
  writeFileSync(p, text, "utf8")
}

const codes = (r) => r.findings.map((f) => f.code).sort()
const fails = (r) => r.findings.filter((f) => f.level === "fail")

test("trace:check — dự án rỗng / không có docs/ → không lỗi, không ném", () => {
  const root = mkdtempSync(join(tmpdir(), "mp-trace-empty-"))
  try {
    const r = traceCheck(root)
    assert.deepEqual(r.findings, [])
    assert.equal(r.stats.fails, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("trace:check — trace đủ FR → AC → TC: sạch", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | Đặt hàng | Must |\n")
    write(
      root,
      "docs/03-modules/ORD/DOC-07-acceptance-criteria.md",
      "| ORD-AC-001 | ORD-FR-001 | Must |\n",
    )
    write(
      root,
      "docs/03-modules/ORD/DOC-16-test-strategy.md",
      "| ORD-TC-001 | ORD-AC-001 | pass |\n",
    )
    const r = traceCheck(root)
    assert.deepEqual(r.findings, [], formatReport(r))
    assert.ok(r.stats.ids >= 3)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── FAIL — máy chắc chắn đúng ──────────────────────────────────────────────

test("FAIL unknown-id — nhắc ID không khai ở đâu (trace đứt)", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-07-acceptance-criteria.md", "| ORD-AC-001 | ORD-FR-999 |\n")
    const r = traceCheck(root)
    const f = fails(r)
    assert.ok(f.some((x) => x.code === "unknown-id" && x.message.includes("ORD-FR-999")))
    assert.equal(r.stats.fails > 0, true)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("FAIL duplicate-id — cùng ID khai ở hai file", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
    write(root, "docs/01-project/DOC-03-brd.md", "| ORD-FR-001 | A lần hai |\n")
    const r = traceCheck(root)
    assert.ok(fails(r).some((x) => x.code === "duplicate-id"))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("KHÔNG duplicate khi cùng ID khai một lần rồi được nhắc lại nhiều nơi", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
    write(root, "docs/01-project/DOC-03-brd.md", "Xem thêm ORD-FR-001 ở module ORD.\n")
    const r = traceCheck(root)
    assert.equal(fails(r).length, 0, formatReport(r))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── Không phạt vì chưa viết (QĐ-5, QĐ-2) ───────────────────────────────────

test("thiếu DOC có chủ đích — chưa có DOC-07 thì KHÔNG cảnh báo 'FR thiếu AC'", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n| ORD-FR-002 | B |\n")
    const r = traceCheck(root)
    assert.deepEqual(r.findings, [], "không AC nào tồn tại ⇒ im lặng, không phạt")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("WARN fr-no-ac — chỉ kêu khi ĐÃ có AC ở nơi khác mà FR này bị bỏ quên", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
    write(root, "docs/03-modules/INV/DOC-06-srs.md", "| INV-FR-001 | B |\n")
    write(
      root,
      "docs/03-modules/INV/DOC-07-acceptance-criteria.md",
      "| INV-AC-001 | INV-FR-001 |\n",
    )
    const r = traceCheck(root)
    assert.ok(codes(r).includes("fr-no-ac"), formatReport(r))
    const w = r.findings.find((f) => f.code === "fr-no-ac")
    assert.match(w.message, /ORD-FR-001/, "phải kêu đúng FR bị bỏ quên")
    assert.equal(w.level, "warn", "thiếu AC là chưa-làm, KHÔNG được fail")
    assert.equal(r.stats.fails, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("WARN ac-no-test — cùng nguyên tắc, chỉ kêu khi đã có TC ở đâu đó", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-07-acceptance-criteria.md", "| ORD-AC-001 | x |\n")
    write(root, "docs/03-modules/INV/DOC-07-acceptance-criteria.md", "| INV-AC-001 | y |\n")
    write(root, "docs/03-modules/INV/DOC-16-test-strategy.md", "| INV-TC-001 | INV-AC-001 |\n")
    const r = traceCheck(root)
    assert.ok(codes(r).includes("ac-no-test"), formatReport(r))
    assert.equal(r.stats.fails, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── Bỏ qua đúng chỗ ────────────────────────────────────────────────────────

test("bỏ qua 02-baseline · _template · _legacy", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
    // Trùng ID trong snapshot đã ký — KHÔNG được tính là duplicate.
    write(root, "docs/02-baseline/v1.0/DOC-06-srs.md", "| ORD-FR-001 | bản đã ký |\n")
    write(root, "docs/03-modules/_template/README.md", "| ORD-FR-001 | khung mẫu |\n")
    write(root, "docs/03-modules/_legacy/old.md", "| ORD-FR-001 | hệ cũ |\n")
    const r = traceCheck(root)
    assert.equal(fails(r).length, 0, formatReport(r))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("placeholder {MOD}-FR-001 trong template KHÔNG bị tính là ID", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/README.md", "ID dạng `{MOD}-FR-001`, `{MOD}-UC-001`\n")
    const r = traceCheck(root)
    assert.deepEqual(r.findings, [], formatReport(r))
    assert.equal(r.stats.ids, 0, "placeholder không phải ID thật")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("formatReport — đọc được, phân biệt FAIL và WARN", () => {
  const root = proj()
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n| ORD-AC-9 | ORD-FR-404 |\n")
    const r = traceCheck(root)
    const text = formatReport(r)
    assert.match(text, /trace:check/)
    if (r.stats.fails) assert.match(text, /FAIL/)
    // Sạch thì phải nói OK, không im lặng khó hiểu.
    const clean = traceCheck(mkdtempSync(join(tmpdir(), "mp-trace-ok-")))
    assert.match(formatReport(clean), /OK/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── Wiring: CLI + template CI ──────────────────────────────────────────────

test("#11 — shim bin/trace-check.js: exit 1 khi FAIL, exit 0 khi chỉ WARN", async (t) => {
  const { execFileSync } = await import("node:child_process")
  const { fileURLToPath } = await import("node:url")
  const { dirname } = await import("node:path")
  const HOOKS = dirname(dirname(fileURLToPath(import.meta.url)))
  const BIN = join(HOOKS, "bin", "trace-check.js")

  const run = (root) => {
    try {
      return { code: 0, out: execFileSync(process.execPath, [BIN, root], { encoding: "utf8" }) }
    } catch (e) {
      return { code: e.status ?? 1, out: e.stdout || "" }
    }
  }

  await t.test("sạch → exit 0 + báo OK", () => {
    const root = proj()
    try {
      write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
      const r = run(root)
      assert.equal(r.code, 0)
      assert.match(r.out, /OK/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  await t.test("ID trỏ sai → exit 1", () => {
    const root = proj()
    try {
      write(root, "docs/03-modules/ORD/DOC-07-acceptance-criteria.md", "| ORD-AC-001 | ORD-FR-999 |\n")
      const r = run(root)
      assert.equal(r.code, 1, "FAIL phải chặn pipeline")
      assert.match(r.out, /FAIL/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  await t.test("chỉ WARN → exit 0 (không chặn)", () => {
    const root = proj()
    try {
      write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | A |\n")
      write(root, "docs/03-modules/INV/DOC-06-srs.md", "| INV-FR-001 | B |\n")
      write(root, "docs/03-modules/INV/DOC-07-acceptance-criteria.md", "| INV-AC-001 | INV-FR-001 |\n")
      const r = run(root)
      assert.equal(r.code, 0, "WARN không được chặn pipeline")
      assert.match(r.out, /WARN/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

test("#11 — project-skeleton có template .gitlab-ci.yml gọi đúng script", async () => {
  const { readFileSync: rf, existsSync: ex } = await import("node:fs")
  const { ROUTER } = await import("../lib/skill-catalog.js")
  const p = join(ROUTER, "project-skeleton", ".gitlab-ci.yml")
  assert.ok(ex(p), "thiếu project-skeleton/.gitlab-ci.yml")
  const text = rf(p, "utf8")
  assert.match(text, /trace-check\.js/, "CI phải gọi bin/trace-check.js")
  assert.match(text, /allow_failure:\s*false/, "FAIL phải chặn pipeline")
  assert.match(text, /docs\/\*\*/, "chỉ chạy khi docs/ đổi")
})

test("#11 — package.json có script trace:check", async () => {
  const { readFileSync: rf } = await import("node:fs")
  const { fileURLToPath } = await import("node:url")
  const { dirname } = await import("node:path")
  const HOOKS = dirname(dirname(fileURLToPath(import.meta.url)))
  const pkg = JSON.parse(rf(join(HOOKS, "package.json"), "utf8"))
  assert.ok(pkg.scripts["trace:check"], "thiếu npm script trace:check")
})

// ─── ADR-033 Đợt B — SQLite projection ──────────────────────────────────────

const hasSqlite = Boolean(sqliteDatabaseSync())

test("khuôn trace.sql skeleton ≡ templates/", async () => {
  const { readFileSync: rf } = await import("node:fs")
  const { ROUTER } = await import("../lib/skill-catalog.js")
  const a = rf(join(ROUTER, "templates", "trace.sql"), "utf8")
  const b = rf(join(ROUTER, "project-skeleton", "memory", "trace.sql"), "utf8")
  assert.equal(a, b)
  assert.match(a, /CREATE TABLE IF NOT EXISTS artifact/)
  assert.match(a, /không chứa body/)
})

test("T4 — sqlite thiếu link FR→AC → WARN (không FAIL), markdown im", async (t) => {
  if (!hasSqlite) {
    t.skip("cần node:sqlite (Node 22)")
    return
  }
  const root = proj()
  mkdirSync(join(root, "memory"), { recursive: true })
  writeFileSync(
    join(root, "memory", "profile.json"),
    JSON.stringify({
      version: 3,
      project_name: "d",
      project_summary: "d",
      current_phase: "requirements",
      docs_provider: "outline",
      tasks_provider: "none",
      chat_provider: "none",
      code_provider: "local",
      mcp: { docs: "user-outline-mcp" },
    }),
    "utf8",
  )
  const db = openTraceDb(root)
  try {
    db.prepare(
      `INSERT INTO artifact (id, type, title, status) VALUES (?, ?, '', 'draft')`,
    ).run("ORD-FR-001", "fr")
    db.prepare(
      `INSERT INTO artifact (id, type, title, status) VALUES (?, ?, '', 'draft')`,
    ).run("ORD-AC-001", "ac")
    closeDb(db)

    const r = traceCheck(root)
    assert.equal(r.stats.fails, 0, "thiếu AC là WARN")
    assert.ok(
      r.findings.some((f) => f.code === "fr-no-ac" && f.message.includes("ORD-FR-001")),
      formatReport(r),
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("docs=local — dump md → sqlite rồi check trùng markdown (sạch)", async (t) => {
  if (!hasSqlite) {
    t.skip("cần node:sqlite (Node 22)")
    return
  }
  const root = proj()
  mkdirSync(join(root, "memory"), { recursive: true })
  try {
    write(root, "docs/03-modules/ORD/DOC-06-srs.md", "| ORD-FR-001 | Đặt hàng | Must |\n")
    write(
      root,
      "docs/03-modules/ORD/DOC-07-acceptance-criteria.md",
      "| ORD-AC-001 | ORD-FR-001 | Must |\n",
    )
    const r = traceCheck(root)
    assert.deepEqual(r.findings, [], formatReport(r))
    assert.ok(existsSync(join(root, "memory", "trace.db")))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
