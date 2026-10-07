/**
 * Golden test — bốn module kênh docs/tasks/chat/vcs (ADR-033 Đợt D1).
 * Cùng invariant ops-pack: name ≡ thư mục, description, hub README, PACK.md.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const CHANNELS = ["docs", "tasks", "chat", "vcs"]

function frontmatter(path) {
  const t = readFileSync(path, "utf8")
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(m, `${path} thiếu frontmatter`)
  return m[1]
}
const fmField = (fm, key) => (fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m")) || [])[1]

function skillDirs(pack) {
  const skills = join(ROOT, pack, "skills")
  assert.ok(existsSync(skills), `${pack}/skills không tồn tại`)
  return readdirSync(skills, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
}

for (const pack of CHANNELS) {
  const dirs = skillDirs(pack)
  const prefix = new RegExp(`^minipower-${pack}-[a-z0-9]+(-[a-z0-9]+)*$`)

  test(`${pack}: mỗi skill lá có SKILL.md, name ≡ tên thư mục`, () => {
    assert.ok(dirs.length >= 1, `${pack}: không có skill — cấm folder trống`)
    for (const dir of dirs) {
      const p = join(ROOT, pack, "skills", dir, "SKILL.md")
      assert.ok(existsSync(p), `${dir} thiếu SKILL.md`)
      assert.equal(fmField(frontmatter(p), "name"), dir, `${dir}: name lệch thư mục`)
    }
  })

  test(`${pack}: tên minipower-${pack}-{capability}[-{stack}] kebab ≤64`, () => {
    for (const dir of dirs) {
      assert.match(dir, prefix, `${dir}: không đúng tiền tố kênh`)
      assert.ok(dir.length <= 64, `${dir}: vượt 64`)
    }
  })

  test(`${pack}: lá-rời bắt buộc description`, () => {
    for (const dir of dirs) {
      const desc = fmField(frontmatter(join(ROOT, pack, "skills", dir, "SKILL.md")), "description")
      assert.ok(desc && desc.trim().length > 0, `${dir}: thiếu description`)
    }
  })

  test(`${pack}/README.md: bảng skill khớp thư mục`, () => {
    const readme = readFileSync(join(ROOT, pack, "README.md"), "utf8")
    for (const dir of dirs) {
      assert.ok(readme.includes(`**${dir}**`), `README thiếu ${dir}`)
      assert.ok(readme.includes(`skills/${dir}/README.md`), `README thiếu link ${dir}`)
    }
    const rows = readme.match(new RegExp(`^\\| \\*\\*minipower-${pack}-[a-z0-9-]+\\*\\* \\|`, "gm")) || []
    assert.equal(rows.length, dirs.length, `${pack} bảng ${rows.length} vs thư mục ${dirs.length}`)
  })

  test(`${pack}/PACK.md tồn tại`, () => {
    assert.ok(existsSync(join(ROOT, pack, "PACK.md")))
  })
}

test("tasks: agent-file persona ADR-036 (không qua CLI/registry)", () => {
  assert.ok(existsSync(join(ROOT, "tasks", "agents", "minipower-tasks-lark.md")))
  assert.ok(existsSync(join(ROOT, "tasks", "agents", "minipower-tasks-openproject.md")))
  assert.ok(existsSync(join(ROOT, "tasks", "rules", "l1-l2-l3-tasks.md")))
})
