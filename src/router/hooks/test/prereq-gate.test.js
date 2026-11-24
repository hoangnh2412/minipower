/**
 * Test ĐỎ cho prereq-gate (ADR-020 C2, QĐ-11d, QĐ-13 · việc #2 §8).
 * Viết TRƯỚC hook (QĐ-10). Mức chặn là số khai `rules.json → gate_levels.prereq`.
 *
 * Ba tính chất phải đúng, theo thứ tự quan trọng:
 *  1. **Theo module** (QĐ-13) — module lệch nhịp là bình thường: kêu cho module
 *     thiếu tài liệu, IM cho module đã đủ. Không nêu module → im, chỉ kiểm cấp dự án.
 *  2. **Người quyết cuối** (QĐ-11d) — chặn luôn mở được bằng BYPASS.
 *  3. **Fail-open** (R2) — không đọc được profile thì cũng không bao giờ ném.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { GATE_LEVELS } from "../lib/rules.js"
import { checkPrereqGate, extractModuleId } from "../lib/prereq-gate.js"

const BASE_PROFILE = {
  user_name: "Hoàng",
  honorific: "anh",
  roles: ["BA"],
  project_name: "demo",
  project_summary: "Hệ thống đặt hàng chuỗi cửa hàng",
  current_phase: "requirements",
  minipower_experience: "returning",
}

/** Dự án minipower giả: docs/ + memory/memory.md. */
function makeProject() {
  const root = mkdtempSync(join(tmpdir(), "mp-prereq-"))
  mkdirSync(join(root, "memory"), { recursive: true })
  mkdirSync(join(root, "docs", "01-project"), { recursive: true })
  mkdirSync(join(root, "docs", "03-modules"), { recursive: true })
  mkdirSync(join(root, "docs", "04-platform"), { recursive: true })
  writeFileSync(join(root, "memory", "memory.md"), "# Memory\n", "utf8")
  return root
}

/** Ghi profile v2 hợp lệ. */
function setProfile(root) {
  writeFileSync(
    join(root, "memory", "profile.json"),
    JSON.stringify({
      ...BASE_PROFILE,
      version: 2,
      approval_source: { docs: "local", tasks: "local", code: "local" },
    }),
    "utf8",
  )
}

/** Ghi profile v1 — nhánh legacy của R2. */
function setLegacyProfile(root) {
  writeFileSync(
    join(root, "memory", "profile.json"),
    JSON.stringify({ ...BASE_PROFILE, version: 1 }),
    "utf8",
  )
}

const DOC_FILE = {
  "03": "01-project/DOC-03-brd.md",
  "13": "04-platform/DOC-13-nfr.md",
}

/** Tạo DOC cấp dự án. */
function addProjectDoc(root, doc) {
  writeFileSync(join(root, "docs", DOC_FILE[doc]), `# DOC-${doc}\n`, "utf8")
}

/** Tạo DOC trong một module. */
function addModuleDoc(root, mod, doc) {
  const dir = join(root, "docs", "03-modules", mod)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `DOC-${doc}-x.md`), `# DOC-${doc}\n`, "utf8")
}

/** Tạo folder module rỗng (đã đăng ký, chưa có tài liệu). */
function addModule(root, mod) {
  mkdirSync(join(root, "docs", "03-modules", mod), { recursive: true })
}

// ─── extractModuleId — Q9 ───────────────────────────────────────────────────

test("extractModuleId (Q9) — 4 pattern tường minh", async (t) => {
  const root = makeProject()
  try {
    await t.test("Module: {id}", () => {
      assert.equal(extractModuleId("Phase: requirements — Module: INV", [], { root }), "INV")
    })

    await t.test("module: — không phân biệt hoa thường", () => {
      assert.equal(extractModuleId("module: inv, viết SRS", [], { root }), "inv")
    })

    await t.test("đường dẫn 03-modules/{id}/", () => {
      assert.equal(
        extractModuleId("xem @docs/03-modules/INV/DOC-06-srs.md", [], { root }),
        "INV",
      )
    })

    await t.test("đường dẫn dấu Windows", () => {
      assert.equal(extractModuleId("docs\\03-modules\\INV\\DOC-06-srs.md", [], { root }), "INV")
    })

    await t.test("ID có prefix module — INV-FR-012", () => {
      assert.equal(extractModuleId("cập nhật INV-FR-012 cho rõ", [], { root }), "INV")
    })

    await t.test("attachment filePaths", () => {
      assert.equal(
        extractModuleId("viết SRS", ["D:/p/docs/03-modules/ORD/DOC-06-srs.md"], { root }),
        "ORD",
      )
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("extractModuleId (Q9) — đối chiếu folder có thật", async (t) => {
  const root = makeProject()
  addModule(root, "billing")
  addModule(root, "ORD")
  mkdirSync(join(root, "docs", "03-modules", "_template"), { recursive: true })
  mkdirSync(join(root, "docs", "03-modules", "_legacy"), { recursive: true })
  try {
    await t.test("tên module tự nhiên trong câu → nhận ra vì folder tồn tại", () => {
      assert.equal(extractModuleId("viết SRS cho module billing", [], { root }), "billing")
    })

    await t.test("không phân biệt hoa thường khi đối chiếu folder", () => {
      assert.equal(extractModuleId("viết SRS cho module ord", [], { root }), "ORD")
    })

    await t.test("tên KHÔNG có folder tương ứng → null (không đoán mò)", () => {
      assert.equal(extractModuleId("viết SRS cho module kho", [], { root }), null)
    })

    await t.test("_template và _legacy KHÔNG phải module", () => {
      assert.equal(extractModuleId("đọc _template", [], { root }), null)
      assert.equal(extractModuleId("đọc _legacy", [], { root }), null)
      assert.equal(
        extractModuleId("docs/03-modules/_legacy/x.md", [], { root }),
        null,
      )
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("extractModuleId (Q9) — không nhận ra thì im lặng, không ném", async (t) => {
  const root = makeProject()
  try {
    await t.test("prompt không nhắc module nào → null", () => {
      assert.equal(extractModuleId("viết SRS giúp tôi", [], { root }), null)
    })

    await t.test("prompt null / undefined → null, không ném", () => {
      assert.equal(extractModuleId(null, null, { root }), null)
      assert.equal(extractModuleId(undefined, undefined, { root }), null)
    })

    await t.test("root không tồn tại → vẫn chạy được pattern tường minh", () => {
      assert.equal(
        extractModuleId("Module: INV", [], { root: join(root, "khong-co") }),
        "INV",
      )
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── checkPrereqGate — cho qua sớm ──────────────────────────────────────────

test("prereq-gate — cho qua sớm", async (t) => {
  const root = makeProject()
  setProfile(root)
  try {
    await t.test("BYPASS → allow (QĐ-11d: thao tác OK tường minh của người)", () => {
      assert.equal(
        checkPrereqGate("BYPASS viết SRS cho Module: INV", [], { root }).action,
        "allow",
      )
    })

    await t.test("prompt không khớp intent nào → allow", () => {
      assert.equal(checkPrereqGate("chào bạn", [], { root }).action, "allow")
    })

    await t.test("ngoài dự án minipower → allow", () => {
      assert.equal(checkPrereqGate("viết SRS", [], { root: tmpdir() }).action, "allow")
    })

    await t.test("prompt null → allow, không ném", () => {
      assert.equal(checkPrereqGate(null, null, { root }).action, "allow")
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── Mức khai: warn ─────────────────────────────────────────────────────────

test("prereq-gate — mức khai `gate_levels.prereq` = warn: nhắc, không chặn", async (t) => {
  assert.equal(GATE_LEVELS.prereq, "warn", "test này viết cho mức warn — đổi số khai thì đổi test")

  await t.test("thiếu DOC-03 → warn, nêu đúng DOC thiếu, nhắc ghi nợ", () => {
    const root = makeProject()
    setProfile(root)
    try {
      const r = checkPrereqGate("phan tich yeu cau cho du an", [], { root })
      assert.equal(r.action, "warn")
      assert.match(r.message, /DOC-03/)
      assert.match(r.message, /doc-debt/, "phải nhắc ghi nợ tài liệu")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  await t.test("có DOC-03 → allow", () => {
    const root = makeProject()
    setProfile(root)
    addProjectDoc(root, "03")
    try {
      assert.equal(checkPrereqGate("phan tich yeu cau", [], { root }).action, "allow")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

// ─── QĐ-13 — theo module, module lệch nhịp ──────────────────────────────────

test("prereq-gate (QĐ-13) — module lệch nhịp: kêu module thiếu, im module đủ", async (t) => {
  const root = makeProject()
  setProfile(root)
  addModuleDoc(root, "ORD", "04") // Đặt hàng đã có Business Rules
  addModule(root, "INV") // Kho đã đăng ký, chưa có gì
  try {
    await t.test("module ĐỦ tài liệu → im lặng", () => {
      assert.equal(
        checkPrereqGate("ve prototype cho Module: ORD", [], { root }).action,
        "allow",
      )
    })

    await t.test("module THIẾU tài liệu → warn, nêu đúng tên module", () => {
      const r = checkPrereqGate("ve prototype cho Module: INV", [], { root })
      assert.equal(r.action, "warn")
      assert.match(r.message, /DOC-04/)
      assert.match(r.message, /INV/, "phải nêu module nào đang thiếu")
    })

    await t.test("KHÔNG nêu module → im lặng (không kêu oan, không kêu bừa)", () => {
      assert.equal(checkPrereqGate("ve prototype", [], { root }).action, "allow")
    })

    await t.test("một module xong KHÔNG tắt chuông cho module khác", () => {
      // Đây là lý do bỏ phương án "có ≥1 file là đủ" (QĐ-13).
      assert.equal(checkPrereqGate("ve prototype cho Module: ORD", [], { root }).action, "allow")
      assert.equal(checkPrereqGate("ve prototype cho Module: INV", [], { root }).action, "warn")
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("prereq-gate (QĐ-13) — intent trộn hai cấp kiểm đúng từng cấp", async (t) => {
  // design-architecture đòi DOC-03 (dự án) + DOC-06 (module) + DOC-13 (dự án).
  const root = makeProject()
  setProfile(root)
  addModuleDoc(root, "ORD", "06")
  addProjectDoc(root, "13")
  try {
    await t.test("thiếu DOC-03 cấp dự án → warn, chỉ nêu DOC-03", () => {
      const r = checkPrereqGate("thiet ke kien truc cho Module: ORD", [], { root })
      assert.equal(r.action, "warn")
      assert.match(r.message, /DOC-03/)
      assert.doesNotMatch(r.message, /DOC-06/, "DOC-06 của ORD đã có — không được kêu")
      assert.doesNotMatch(r.message, /DOC-13/, "DOC-13 đã có — không được kêu")
    })

    await t.test("đủ cả hai cấp → allow", () => {
      addProjectDoc(root, "03")
      assert.equal(
        checkPrereqGate("thiet ke kien truc cho Module: ORD", [], { root }).action,
        "allow",
      )
    })

    await t.test("DOC module-scope KHÔNG được thoả bằng file của module khác", () => {
      addModule(root, "INV")
      const r = checkPrereqGate("thiet ke kien truc cho Module: INV", [], { root })
      assert.equal(r.action, "warn")
      assert.match(r.message, /DOC-06/, "INV chưa có DOC-06 dù ORD đã có")
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// ─── R2 — fail-open ─────────────────────────────────────────────────────────

test("prereq-gate (R2) — fail-open: không đọc được mode thì chỉ WARN, không bao giờ block", async (t) => {
  await t.test("chưa có profile.json → warn", () => {
    const root = makeProject()
    try {
      const r = checkPrereqGate("phan tich yeu cau", [], { root })
      assert.equal(r.action, "warn", "thiếu profile không được chặn oan")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  await t.test("profile v1 (chưa khai mode) → warn", () => {
    const root = makeProject()
    setLegacyProfile(root)
    try {
      assert.equal(checkPrereqGate("phan tich yeu cau", [], { root }).action, "warn")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  await t.test("profile.json hỏng JSON → warn, không ném", () => {
    const root = makeProject()
    writeFileSync(join(root, "memory", "profile.json"), "{ hong", "utf8")
    try {
      assert.equal(checkPrereqGate("phan tich yeu cau", [], { root }).action, "warn")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
