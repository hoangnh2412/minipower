/**
 * Test của chính bộ check nhóm A.
 *
 * evals: không soát — file này CHỨA mã mẫu có lỗi cố ý làm fixture; để check
 * tự quét nó thì mọi fixture dương thành một phát hiện giả.
 *
 * Mỗi check có ĐỦ HAI case (ADR-026 §7.3.1 N7):
 *   dương — gài đúng lỗi, check phải bắt;
 *   âm    — mã sạch cùng hình dạng, check phải IM.
 * Thiếu case âm thì một check "luôn báo" cũng đạt 100%, nên hai case là bắt buộc.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run as a04 } from "./a04-skill-reference.mjs"
import { run as a05 } from "./a05-no-llm-in-ci.mjs"
import { run as a06 } from "./a06-skill-length.mjs"
import { run as a07 } from "./a07-must-without-gate.mjs"
import { run as a09 } from "./a09-hook-registry.mjs"
import { run as a10 } from "./a10-duplicate-content.mjs"
import { run as a11 } from "./a11-hardcoded-counts.mjs"
import { run as a12 } from "./a12-decided-removed.mjs"
import { run as a13 } from "./a13-silent-catch.mjs"
import { run as a16 } from "./a16-hook-runnable.mjs"

/** Dựng một gốc repo giả; `files` là map đường-dẫn-tương-đối → nội dung. */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "mp-evals-"))
  for (const [p, body] of Object.entries(files)) {
    const abs = join(root, p)
    mkdirSync(join(abs, ".."), { recursive: true })
    writeFileSync(abs, body)
  }
  return root
}

const HOOKS = "src/router/hooks"
const RULES = `${HOOKS}/lib/rules.json`
const BIN = `${HOOKS}/bin`

// ── A09 ──────────────────────────────────────────────────────────────────────

test("A09 dương — khai shim nhưng thiếu file bin/", () => {
  const root = fixture({
    [RULES]: JSON.stringify({ install_hooks: [{ shim: "ghost", slot: "prompt" }] }),
    [`${BIN}/_io.js`]: "export const x = 1\n",
  })
  const r = a09(root)
  assert.equal(r.findings.length, 1)
  assert.match(r.findings[0].message, /không có bin\/ghost\.js/)
  rmSync(root, { recursive: true, force: true })
})

test("A09 dương — file tự khai là shim nhưng không có trong sổ", () => {
  const root = fixture({
    [RULES]: JSON.stringify({ install_hooks: [] }),
    [`${BIN}/orphan.js`]: "/**\n * CLI shim @ UserPromptSubmit\n */\n",
  })
  const r = a09(root)
  assert.equal(r.findings.length, 1)
  assert.match(r.findings[0].message, /không bao giờ được cài/)
  rmSync(root, { recursive: true, force: true })
})

test("A09 âm — khớp hai chiều, và file không phải shim thì bỏ qua", () => {
  const root = fixture({
    [RULES]: JSON.stringify({ install_hooks: [{ shim: "real", slot: "prompt" }] }),
    [`${BIN}/real.js`]: "/**\n * CLI shim @ UserPromptSubmit\n */\n",
    [`${BIN}/trace-check.js`]: "/**\n * Công cụ CLI, không phải hook.\n */\n",
    [`${BIN}/skipped.js`]: "/**\n * CLI shim @ beforeReadFile\n * không đăng ký: baseline-guard gọi hộ\n */\n",
  })
  const r = a09(root)
  assert.deepEqual(r.findings, [])
  assert.ok(r.checked > 0, "phải soát được gì đó, không được 0")
  rmSync(root, { recursive: true, force: true })
})

// ── A10 ──────────────────────────────────────────────────────────────────────

const BODY = `-- một file đủ dài để vượt ngưỡng MIN_BYTES của A10, lặp cho chắc chắn\n`.repeat(3)

test("A10 dương — hai file giống hệt, không ai khai bản sao", () => {
  const root = fixture({ "a/one.sql": BODY, "b/two.sql": BODY })
  const r = a10(root)
  assert.equal(r.findings.length, 1)
  assert.match(r.findings[0].message, /giống hệt 2 chỗ/)
  rmSync(root, { recursive: true, force: true })
})

test("A10 âm — có marker thì im; file khác nội dung thì không báo", () => {
  const marked = `${BODY}-- bản sao có chủ đích: bộ cài chép sang dự án đích\n`
  const root = fixture({ "a/one.sql": marked, "b/two.sql": marked, "c/other.sql": `${BODY}-- khác\n` })
  const r = a10(root)
  assert.deepEqual(r.findings, [])
  rmSync(root, { recursive: true, force: true })
})

// ── A11 ──────────────────────────────────────────────────────────────────────

test("A11 dương — đếm tồn kho repo: hằng nhập từ lib/ và biến từ phép quét", () => {
  const root = fixture({
    "t/imported.test.js": `import { INSTALL_HOOKS } from "../lib/rules.js"\nassert.equal(INSTALL_HOOKS.length, 6)\n`,
    "t/scanned.test.js": `const leaves = readdirSync(ROOT)\nassert.equal(leaves.length, 71)\n`,
  })
  const r = a11(root)
  assert.equal(r.findings.length, 2)
  rmSync(root, { recursive: true, force: true })
})

test("A11 âm — kết quả mong đợi trên fixture tự dựng, và marker", () => {
  const root = fixture({
    "t/fixture.test.js": `const r = checkRepo(dir)\nassert.equal(r.broken.length, 1)\n`,
    "t/marked.test.js": `import { INSTALL_HOOKS } from "../lib/rules.js"\n// khoá có chủ đích: thêm slot thứ ba là đổi hợp đồng cài đặt\nassert.equal(INSTALL_HOOKS.length, 6)\n`,
  })
  const r = a11(root)
  assert.deepEqual(r.findings, [])
  rmSync(root, { recursive: true, force: true })
})

// ── A13 ──────────────────────────────────────────────────────────────────────

test("A13 dương — catch trả giá trị trung tính trong im lặng", () => {
  const root = fixture({
    "s/io.mjs": `export function readJson(raw) {\n  try {\n    return JSON.parse(raw)\n  } catch {\n    return {}\n  }\n}\n`,
    "s/empty.mjs": `try {\n  risky()\n} catch {\n  // schema lệch: không phá bước sau\n}\n`,
  })
  const r = a13(root)
  assert.equal(r.findings.length, 2)
  rmSync(root, { recursive: true, force: true })
})

test("A13 âm — nói ra, ném lại, có marker, hoặc có xử lý thật", () => {
  const root = fixture({
    "s/speaks.mjs": `try { a() } catch (e) { process.stderr.write(e.message) ; return {} }\n`,
    "s/rethrows.mjs": `try { a() } catch (e) { throw e }\n`,
    "s/marked.mjs": `try { a() } catch {\n  // cố ý im lặng: thiếu file là trạng thái bình thường lúc init\n  return null\n}\n`,
    "s/handles.mjs": `try { a() } catch (e) { findings.push({ msg: e.message }) }\n`,
  })
  const r = a13(root)
  assert.deepEqual(r.findings, [])
  assert.ok(r.checked >= 4, "phải soát đủ 4 khối catch")
  rmSync(root, { recursive: true, force: true })
})

// ── A12 ──────────────────────────────────────────────────────────────────────

const LEDGER = "evals/decided-removed.md"

test("A12 dương — từ khoá `đã gỡ` còn sót ngoài ADRs/", () => {
  const root = fixture({
    [LEDGER]: "- `GHOST_MECH` — đã gỡ — ADR-001 ngày 2026-01-01\n",
    "src/leftover.md": "Tài liệu này còn mô tả GHOST_MECH như đang sống.\n",
    "ADRs/done/ADR-001-x.md": "Quyết định gỡ GHOST_MECH.\n",
  })
  const r = a12(root)
  assert.equal(r.findings.length, 1, "chỉ src/ bị bắt, ADRs/ là bản ghi lịch sử nên bỏ qua")
  assert.equal(r.findings[0].file, "src/leftover.md")
  rmSync(root, { recursive: true, force: true })
})

test("A12 âm — `đang gỡ` thì im, và `đã gỡ` đã sạch thì im", () => {
  const root = fixture({
    [LEDGER]: "- `WIP_MECH` — đang gỡ — còn S5\n- `CLEAN_MECH` — đã gỡ — ADR-002\n",
    "src/leftover.md": "Chỗ này còn WIP_MECH, việc chưa xong nên không báo.\n",
  })
  const r = a12(root)
  assert.deepEqual(r.findings, [])
  rmSync(root, { recursive: true, force: true })
})

test("A12 — sổ trống thì soát 0 từ khoá, không coi là sạch", () => {
  const root = fixture({ [LEDGER]: "# Sổ\n\n*(trống)*\n" })
  const r = a12(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 0, "checked = 0 là tín hiệu 'chưa kiểm gì', trình chạy phải nói ra")
  rmSync(root, { recursive: true, force: true })
})

// ── A16 ──────────────────────────────────────────────────────────────────────

const HOOKS_JSON = "src/router/hooks/hooks.json"

function hooksJson(commands) {
  return JSON.stringify({
    hooks: { UserPromptSubmit: [{ hooks: commands.map((c) => ({ type: "command", command: c })) }] },
  })
}

test("A16 dương — ba kiểu hỏng: thiếu file, cú pháp sai, thoát mã lạ", () => {
  const root = fixture({
    [HOOKS_JSON]: hooksJson([
      'node "${CLAUDE_PLUGIN_ROOT}/hooks/bin/missing.js"',
      'node "${CLAUDE_PLUGIN_ROOT}/hooks/bin/broken.js"',
      'node "${CLAUDE_PLUGIN_ROOT}/hooks/bin/crashes.js"',
    ]),
    "src/router/hooks/bin/broken.js": "const = \n",
    "src/router/hooks/bin/crashes.js": "process.exit(7)\n",
  })
  const r = a16(root)
  assert.equal(r.findings.length, 3)
  assert.match(r.findings[0].message, /không tồn tại/)
  assert.match(r.findings[1].message, /không parse được/)
  assert.match(r.findings[2].message, /thoát mã 7/)
  rmSync(root, { recursive: true, force: true })
})

test("A16 âm — shim lành: thoát 0 hoặc 2, in JSON đọc được", () => {
  const root = fixture({
    [HOOKS_JSON]: hooksJson([
      'node "${CLAUDE_PLUGIN_ROOT}/hooks/bin/allow.js"',
      'node "${CLAUDE_PLUGIN_ROOT}/hooks/bin/block.js"',
    ]),
    "src/router/hooks/bin/allow.js": 'console.log(JSON.stringify({ continue: true }))\n',
    "src/router/hooks/bin/block.js":
      'console.log(JSON.stringify({ continue: false, user_message: "chặn" }))\nprocess.exit(2)\n',
  })
  const r = a16(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 2)
  rmSync(root, { recursive: true, force: true })
})

// ── A05 ──────────────────────────────────────────────────────────────────────

test("A05 dương — ba đường tiêu tiền: script trong closure, pretest npm tự chạy, file test", () => {
  const root = fixture({
    "package.json": JSON.stringify({
      scripts: {
        check: "npm run smoke",
        smoke: "claude -p 'chạy thử'",
        test: "node --test",
        pretest: "claude --print 'hâm nóng'",
      },
    }),
    "a.test.mjs": "const cmd = 'claude -p'\n",
  })
  const r = a05(root)
  assert.equal(r.findings.length, 3)
  assert.equal(r.level, "block")
  const where = r.findings.map((f) => f.file).join(" ")
  assert.match(where, /scripts\.smoke/)
  assert.match(where, /scripts\.pretest/)
  assert.match(where, /a\.test\.mjs/)
  rmSync(root, { recursive: true, force: true })
})

test("A05 âm — eval:run tồn tại nhưng NGOÀI closure CI thì không báo", () => {
  const root = fixture({
    "package.json": JSON.stringify({
      scripts: {
        test: "node --test",
        check: "npm test",
        "eval:run": "claude -p 'chỉ người chạy'",
        "eval:plan": "node evals/plan.mjs",
      },
    }),
    "a.test.mjs": "const ok = 'node --test'\n",
  })
  const r = a05(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 3)
  rmSync(root, { recursive: true, force: true })
})

// ── A06 ──────────────────────────────────────────────────────────────────────

test("A06 dương — lá 151 dòng vượt ngưỡng 150", () => {
  const root = fixture({
    "src/x/skills/mp-a/SKILL.md": `---\nname: mp-a\n---\n${"dòng\n".repeat(148)}`,
  })
  const r = a06(root)
  assert.equal(r.findings.length, 1)
  assert.match(r.findings[0].message, /151 dòng/)
  rmSync(root, { recursive: true, force: true })
})

test("A06 âm — đúng 150 dòng thì im, và marker `dài có chủ đích` miễn cho lá dài", () => {
  const root = fixture({
    "src/x/skills/mp-b/SKILL.md": "dòng\n".repeat(150),
    "src/x/skills/mp-c/SKILL.md": `---\ndài có chủ đích: bảng tra điều khoản không chẻ được\n---\n${"dòng\n".repeat(200)}`,
  })
  const r = a06(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 2)
  rmSync(root, { recursive: true, force: true })
})

// ── A07 ──────────────────────────────────────────────────────────────────────

test("A07 dương — câu quy tắc nói bắt buộc mà không nêu cổng nào", () => {
  const root = fixture({
    [RULES]: JSON.stringify({ install_hooks: [{ shim: "prereq-gate", slot: "prompt" }] }),
    "src/x/skills/mp-a/SKILL.md": "---\nname: mp-a\n---\n\n- Bước 2 là **bắt buộc** trước khi sinh code.\n",
  })
  const r = a07(root)
  assert.equal(r.findings.length, 1)
  assert.equal(r.findings[0].line, 5)
  rmSync(root, { recursive: true, force: true })
})

test("A07 âm — bốn phép loại (heading · phủ định · frontmatter · trích) và dòng có cổng thật", () => {
  const root = fixture({
    [RULES]: JSON.stringify({ install_hooks: [{ shim: "prereq-gate", slot: "prompt" }] }),
    "src/x/skills/mp-b/SKILL.md": [
      "---",
      "name: mp-b",
      "description: Lá mẫu — trường bắt buộc theo DOC-12.",
      "---",
      "",
      "## Output bắt buộc",
      "",
      "- Cột `note` không bắt buộc.",
      '- Đừng viết chữ "bắt buộc" khi máy không kiểm được.',
      "- Khai `module` là **bắt buộc** — `prereq-gate` chặn nếu thiếu.",
      "",
    ].join("\n"),
  })
  const r = a07(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 1)
  rmSync(root, { recursive: true, force: true })
})

// ── A04 ──────────────────────────────────────────────────────────────────────

test("A04 dương — mục `Sẽ có` được miễn, nhưng miễn HẾT ở heading kế: tên sau đó vẫn bị bắt", () => {
  const root = fixture({
    "src/ops/skills/mp-x/SKILL.md": "---\nname: minipower-ops-deploy\n---\n",
    "src/ops/README.md": [
      "## Sẽ có — viết dần, không tạo folder rỗng",
      "",
      "| Skill dự kiến | Việc |",
      "|---|---|",
      "| `minipower-ops-log-flow` | Đọc log vẽ sơ đồ luồng |",
      "",
      "## Lá đang có",
      "",
      "| `minipower-ops-ghost` | Việc gì đó |",
    ].join("\n"),
  })
  const r = a04(root)
  assert.equal(r.findings.length, 1)
  assert.match(r.findings[0].message, /minipower-ops-ghost/)
  assert.equal(r.findings[0].line, 9)
  rmSync(root, { recursive: true, force: true })
})

test("A04 âm — tám ngữ cảnh hợp lệ: lá đã khai · marker · fragment · không phải module · `không phải` · tự khai chưa có · mục Sẽ có · bảng ❌", () => {
  const root = fixture({
    "src/ops/skills/mp-x/SKILL.md": "---\nname: minipower-ops-deploy\n---\n",
    "src/ops/README.md": [
      "- Lá `minipower-ops-deploy` đã có.",
      "- `minipower-ops-grafana` — nhắc có chủ đích: ví dụ phản diện trong tài liệu.",
      "- Tiền tố `minipower-ops-*` cho mọi lá ops.",
      "- Gói npm `minipower-hooks` không phải lá.",
      "- Dùng `minipower-ops-deploy`, không phải `minipower-ops-grafana`.",
      "- Tên `minipower-ops-ingest` trong catalog — chưa có skill.",
      "",
      "## Sẽ có — viết dần",
      "",
      "| Skill dự kiến | Việc |",
      "|---|---|",
      "| `minipower-ops-log-flow` | Đọc log |",
      "",
      "## Đừng làm",
      "",
      "| ❌ | Vì sao |",
      "|---|---|",
      "| Tên theo công cụ (`minipower-ops-kibana`) | Tên phải theo việc |",
    ].join("\n"),
  })
  const r = a04(root)
  assert.deepEqual(r.findings, [])
  assert.equal(r.checked, 3)
  rmSync(root, { recursive: true, force: true })
})
