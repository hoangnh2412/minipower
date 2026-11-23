/**
 * Golden test — cấu trúc module ops/ (ADR-023, cùng khuôn backend-pack.test.js).
 *
 * Invariant:
 *  - tên skill lá = minipower-ops-{capability}[-{stack}], kebab, ≤64, ≡ tên thư mục
 *  - lá-rời sống nhờ description (agent kích hoạt theo ngữ cảnh) → bắt buộc có
 *  - bảng skill trong ops/README.md khớp thư mục thật
 *  - PACK.md tồn tại (manifest — ADR-022 QĐ-8)
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

// test/ → hooks/ → router/ → src/
const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const SKILLS = join(ROOT, "ops", "skills")

const skillDirs = readdirSync(SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

function frontmatter(path) {
  const t = readFileSync(path, "utf8")
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(m, `${path} thiếu frontmatter`)
  return m[1]
}
const fmField = (fm, key) => (fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m")) || [])[1]

test("ops: mỗi skill lá có SKILL.md, name ≡ tên thư mục", () => {
  assert.ok(skillDirs.length >= 1, `chỉ thấy ${skillDirs.length} skill — thiếu?`)
  for (const dir of skillDirs) {
    const p = join(SKILLS, dir, "SKILL.md")
    assert.ok(existsSync(p), `${dir} thiếu SKILL.md`)
    assert.equal(fmField(frontmatter(p), "name"), dir, `${dir}: name lệch thư mục`)
  }
})

test("ops: tên theo hệ minipower-ops-{capability}[-{stack}] — kebab, ≤64 (QĐ-4)", () => {
  for (const dir of skillDirs) {
    assert.match(dir, /^minipower-ops-[a-z0-9]+(-[a-z0-9]+)*$/, `${dir}: không đúng kebab/tiền tố`)
    assert.ok(dir.length <= 64, `${dir}: ${dir.length} ký tự — vượt ngưỡng 64`)
  }
})

test("ops: lá-rời bắt buộc có description (bề mặt kích hoạt — QĐ-5b)", () => {
  for (const dir of skillDirs) {
    const fm = frontmatter(join(SKILLS, dir, "SKILL.md"))
    const desc = fmField(fm, "description")
    assert.ok(desc && desc.trim().length > 0, `${dir}: thiếu description`)
  }
})

test("ops/README.md: bảng skill khớp thư mục thật — đủ và không thừa", () => {
  const readme = readFileSync(join(ROOT, "ops", "README.md"), "utf8")
  for (const dir of skillDirs) {
    assert.ok(readme.includes(`**${dir}**`), `README thiếu dòng bảng cho ${dir}`)
    assert.ok(readme.includes(`skills/${dir}/README.md`), `README thiếu link tới ${dir}`)
  }
  const rows = readme.match(/^\| \*\*minipower-ops-[a-z0-9-]+\*\* \|/gm) || []
  assert.equal(rows.length, skillDirs.length, `bảng có ${rows.length} dòng, thư mục có ${skillDirs.length}`)
})

test("ops/PACK.md tồn tại (manifest — ADR-022 QĐ-8)", () => {
  assert.ok(existsSync(join(ROOT, "ops", "PACK.md")))
})
