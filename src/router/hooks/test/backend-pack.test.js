/**
 * Golden test — cấu trúc module backend/ (ADR-021 + ADR-022 QĐ-4/QĐ-5).
 *
 * Invariant sinh ra từ đợt đổi tên 2026-08-25, trước giờ giữ bằng kỷ luật:
 *  - tên skill lá = minipower-backend-{capability}-{stack}, kebab, ≤64, ≡ tên thư mục
 *  - lá-rời sống nhờ description (agent kích hoạt theo ngữ cảnh) → bắt buộc có
 *  - provider/pattern con: name = <tên skill cha>-<provider>
 *  - bảng skill trong backend/README.md khớp thư mục thật (bằng chứng cần test:
 *    bảng đã từng thiếu 2 dòng realtime/troubleshooting suốt nhiều tháng)
 */

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

// test/ → hooks/ → router/ → src/
const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const SKILLS = join(ROOT, "backend", "skills")

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

test("backend: mỗi skill lá có SKILL.md, name ≡ tên thư mục", () => {
  assert.ok(skillDirs.length >= 14, `chỉ thấy ${skillDirs.length} skill — thiếu?`)
  for (const dir of skillDirs) {
    const p = join(SKILLS, dir, "SKILL.md")
    assert.ok(existsSync(p), `${dir} thiếu SKILL.md`)
    assert.equal(fmField(frontmatter(p), "name"), dir, `${dir}: name lệch thư mục`)
  }
})

test("backend: tên theo hệ minipower-backend-{capability}-{stack} — kebab, ≤64 (QĐ-4)", () => {
  for (const dir of skillDirs) {
    assert.match(dir, /^minipower-backend-[a-z0-9]+(-[a-z0-9]+)*$/, `${dir}: không đúng kebab/tiền tố`)
    assert.ok(dir.length <= 64, `${dir}: ${dir.length} ký tự — vượt ngưỡng 64`)
  }
})

test("backend: lá-rời bắt buộc có description (bề mặt kích hoạt — QĐ-5b)", () => {
  for (const dir of skillDirs) {
    const fm = frontmatter(join(SKILLS, dir, "SKILL.md"))
    const desc = fmField(fm, "description")
    assert.ok(desc && desc.trim().length > 0, `${dir}: thiếu description`)
  }
})

test("backend: provider/pattern con — name = <skill cha>-<provider>, ≤64", () => {
  let checked = 0
  for (const dir of skillDirs) {
    for (const sub of ["providers", "patterns"]) {
      const subDir = join(SKILLS, dir, sub)
      if (!existsSync(subDir)) continue
      for (const p of readdirSync(subDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
        const skillFile = join(subDir, p.name, "SKILL.md")
        if (!existsSync(skillFile)) continue
        const name = fmField(frontmatter(skillFile), "name")
        assert.ok(name && name.startsWith(`${dir}-`), `${dir}/${sub}/${p.name}: name "${name}" không bắt đầu bằng "${dir}-"`)
        assert.ok(name.length <= 64, `${name}: vượt 64 ký tự`)
        checked++
      }
    }
  }
  assert.ok(checked >= 20, `chỉ kiểm được ${checked} provider — walk hỏng?`)
})

test("backend/README.md: bảng skill khớp thư mục thật — đủ và không thừa", () => {
  const readme = readFileSync(join(ROOT, "backend", "README.md"), "utf8")
  for (const dir of skillDirs) {
    assert.ok(readme.includes(`**${dir}**`), `README thiếu dòng bảng cho ${dir}`)
    assert.ok(readme.includes(`skills/${dir}/README.md`), `README thiếu link tới ${dir}`)
  }
  const rows = readme.match(/^\| \*\*minipower-backend-[a-z0-9-]+\*\* \|/gm) || []
  assert.equal(rows.length, skillDirs.length, `bảng có ${rows.length} dòng, thư mục có ${skillDirs.length}`)
})

test("backend/PACK.md tồn tại (manifest — ADR-022 QĐ-8)", () => {
  assert.ok(existsSync(join(ROOT, "backend", "PACK.md")))
})

// Hai luật cắt ngang (ADR-029 Điều chỉnh 2026-08-29): mỗi skill lá phải MANG theo con trỏ
// tới convention (viết code thế nào) và architecture (đặt file ở đâu). Minipower không ép
// được agent tuân thủ — nhưng ép được invariant "skill nào cũng chở đủ hai luật", để dù
// skill nào kích hoạt thì luật cũng đi cùng. Không có test, mỗi skill mới lại quên một cái.
const CROSS_CUTTING = [
  { skill: "minipower-backend-convention-dotnet", what: "convention (code trong file viết thế nào)" },
  { skill: "minipower-backend-architecture-dotnet", what: "architecture (file nằm ở đâu, reference thế nào)" },
]

for (const { skill, what } of CROSS_CUTTING) {
  test(`backend: mọi skill lá trỏ tới ${what}`, () => {
    assert.ok(skillDirs.includes(skill), `thiếu chính skill ${skill}`)
    for (const dir of skillDirs) {
      if (dir === skill) continue // không tự trỏ về mình
      const body = readFileSync(join(SKILLS, dir, "SKILL.md"), "utf8")
      assert.ok(
        body.includes(`../${skill}/SKILL.md`),
        `${dir}/SKILL.md không trỏ tới ${skill} — agent kích hoạt skill này sẽ không thấy luật ${what}`,
      )
    }
  })
}
