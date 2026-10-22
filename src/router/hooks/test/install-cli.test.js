import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HOOKS = dirname(dirname(fileURLToPath(import.meta.url)))
const CLI = join(HOOKS, "..", "..", "..", "cli", "minipower.mjs")
const node = process.execPath

function run(args, cwd, envExtra = {}) {
  const home = envExtra.MINIPOWER_CURSOR_HOME || mkdtempSync(join(tmpdir(), "mp-curhome-"))
  try {
    return execFileSync(node, [CLI, ...args], {
      encoding: "utf8",
      cwd: cwd || HOOKS,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        MINIPOWER_CURSOR_HOME: home,
        ...envExtra,
      },
    })
  } catch (e) {
    e.message = `${e.stderr || ""}${e.stdout || ""}${e.message}`
    throw e
  }
}

test("install --print-user-rules in always-on + codegraph", () => {
  const out = run(["install", "--print-user-rules"])
  assert.match(out, /Bước 0/)
  assert.match(out, /alwaysApply: true/)
  assert.match(out, /test -d \.minipower/)
  assert.match(out, /codegraph_explore/)
  assert.match(out, /codegraph-offer\.json/)
  assert.match(out, /declined/)
  assert.match(out, /colbymchenry\/codegraph/)
})

test("install --list-modules đọc registry", () => {
  const out = run(["install", "--list-modules"])
  const reg = JSON.parse(out)
  assert.ok(Array.isArray(reg) && reg.some((p) => p.pack === "router"))
  assert.ok(reg.some((p) => p.pack === "toolbox" && p.install.default === false))
})

test("install không --client thì hỏi (stdin)", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-ask-i-"))
  try {
    const out = execFileSync(node, [CLI, "install", "--dry-run"], {
      encoding: "utf8",
      input: `${dir}\n1\n\n\nY\n`,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, MINIPOWER_CURSOR_HOME: dir },
    })
    assert.match(out, /cursor/)
    assert.match(out, /dry-run/)
    assert.match(out, /user-rule/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("install --client cursor --with router", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-install-"))
  const home = mkdtempSync(join(tmpdir(), "mp-curu-"))
  try {
    run(["install", "--client", "cursor", "--with", "router", "--target", dir], undefined, {
      MINIPOWER_CURSOR_HOME: home,
    })
    assert.ok(existsSync(join(dir, ".cursor", "hooks.json")))
    const routerPack = join(dir, ".cursor", "skills", "minipower-router")
    assert.ok(existsSync(routerPack))
    const profileGuard = join(routerPack, "hooks", "bin", "profile-guard.js")
    assert.ok(
      existsSync(profileGuard),
      "minipower-router phải symlink cả router pack (hooks/bin/profile-guard.js)",
    )
    assert.ok(existsSync(join(dir, ".minipower", "clients.json")))
    assert.ok(existsSync(join(dir, ".minipower", "bin", "minipower")))
    const userRule = join(home, ".cursor", "rules", "minipower-always-on.mdc")
    const userCodegraph = join(home, ".cursor", "rules", "codegraph-when-indexed.mdc")
    assert.ok(existsSync(userRule))
    assert.ok(existsSync(userCodegraph))
    assert.match(readFileSync(userRule, "utf8"), /Bước 0/)
    assert.match(readFileSync(userCodegraph, "utf8"), /codegraph_explore/)
    assert.match(readFileSync(userCodegraph, "utf8"), /codegraph-offer\.json/)
    assert.match(readFileSync(userCodegraph, "utf8"), /declined/)
    const launcher = readFileSync(join(dir, ".minipower", "bin", "minipower"), "utf8")
    assert.match(launcher, /"cli", "minipower\.mjs"/)
    assert.doesNotMatch(launcher, /sdlc\/install\/minipower\.mjs/)
    const cfg = JSON.parse(readFileSync(join(dir, ".minipower", "clients.json"), "utf8"))
    assert.ok(cfg.factory_root)
    const hooks = JSON.parse(readFileSync(join(dir, ".cursor", "hooks.json"), "utf8"))
    assert.ok(hooks.hooks.beforeSubmitPrompt.length >= 5)
    run(["install", "--client", "cursor", "--with", "router", "--target", dir], undefined, {
      MINIPOWER_CURSOR_HOME: home,
    })
    const hooks2 = JSON.parse(readFileSync(join(dir, ".cursor", "hooks.json"), "utf8"))
    assert.equal(hooks2.hooks.beforeSubmitPrompt.length, hooks.hooks.beforeSubmitPrompt.length)
  } finally {
    rmSync(dir, { recursive: true, force: true })
    rmSync(home, { recursive: true, force: true })
  }
})

test("install --no-user-rules không ghi ~/.cursor/rules", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-nour-"))
  const home = mkdtempSync(join(tmpdir(), "mp-nourh-"))
  try {
    run(
      ["install", "--client", "cursor", "--with", "router", "--target", dir, "--no-user-rules"],
      undefined,
      { MINIPOWER_CURSOR_HOME: home },
    )
    assert.ok(!existsSync(join(home, ".cursor", "rules", "minipower-always-on.mdc")))
  } finally {
    rmSync(dir, { recursive: true, force: true })
    rmSync(home, { recursive: true, force: true })
  }
})

test("init không ghi AGENTS.md, in prompt để người tự tạo", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-nollm-"))
  try {
    const out = run(["init", "--answers", answersFile(dir), "--target", dir])
    assert.match(out, /AGENTS\.md chưa có/)
    assert.match(out, /SAMPLE-agents\.md/)
    assert.match(out, /project_name: sample/)
    assert.match(out, /Bề mặt đang có: `docs`/)
    assert.ok(!existsSync(join(dir, "AGENTS.md")))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init --answers + --check", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-init-"))
  const answers = join(dir, "a.json")
  writeFileSync(
    answers,
    JSON.stringify({
      project_name: "sample",
      project_summary: "demo",
      project_mode: "mvp",
      current_phase: "discovery",
      docs_provider: "local",
      tasks_provider: "none",
      chat_provider: "none",
      code_provider: "local",
      user_name: "Test",
      honorific: "anh",
      roles: ["BA"],
      minipower_experience: "new",
      os_username: "test",
    }),
  )
  try {
    run(["init", "--answers", answers, "--target", dir])
    assert.ok(existsSync(join(dir, ".minipower", "identity.json")))
    assert.ok(existsSync(join(dir, ".minipower", "minipower.sqlite")))
    assert.ok(existsSync(join(dir, "memory", "profile.json")))
    const p = JSON.parse(readFileSync(join(dir, "memory", "profile.json"), "utf8"))
    assert.equal(p.version, 3)
    assert.deepEqual(p.surfaces, ["docs"])
    assert.ok(existsSync(join(dir, "docs")))
    assert.ok(!existsSync(join(dir, "backend")))
    assert.ok(existsSync(join(dir, "memory", "doc-debt.md")))
    const check = run(["init", "--check", "--target", dir])
    assert.match(check, /OK/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init --check thiếu .minipower → FAIL", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-chk-"))
  try {
    assert.throws(() => run(["init", "--check", "--target", dir]), /FAIL/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init hỏi lựa chọn qua stdin (không LLM)", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-ask-"))
  try {
    const input = Array(20).fill("").join("\n") + "\n"
    execFileSync(node, [CLI, "init", "--target", dir], {
      encoding: "utf8",
      input,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    })
    const p = JSON.parse(readFileSync(join(dir, "memory", "profile.json"), "utf8"))
    assert.equal(p.version, 3)
    assert.equal(p.project_mode, "mvp")
    assert.equal(p.docs_provider, "local")
    assert.equal(p.tasks_provider, "none")
    assert.deepEqual(p.surfaces, ["docs"])
    assert.ok(existsSync(join(dir, ".minipower", "bin", "minipower")))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

function answersFile(dir, extra = {}) {
  const answers = join(dir, "a.json")
  writeFileSync(
    answers,
    JSON.stringify({
      project_name: "sample",
      project_summary: "demo",
      project_mode: "standard",
      current_phase: "discovery",
      docs_provider: "local",
      tasks_provider: "none",
      chat_provider: "none",
      code_provider: "local",
      user_name: "Test",
      honorific: "anh",
      roles: ["DEV"],
      minipower_experience: "new",
      os_username: "test",
      ...extra,
    }),
  )
  return answers
}

test("init surfaces docs+backend+frontend — không tạo mobile/autotest, không sinh .sln", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-surf-"))
  try {
    const out = run(["init", "--answers", answersFile(dir, { surfaces: ["frontend", "backend", "docs"] }), "--target", dir])
    const p = JSON.parse(readFileSync(join(dir, "memory", "profile.json"), "utf8"))
    assert.deepEqual(p.surfaces, ["docs", "backend", "frontend"])
    assert.ok(existsSync(join(dir, "docs", "01-project")))
    assert.ok(existsSync(join(dir, "assets")))
    assert.match(readFileSync(join(dir, "backend", "README.md"), "utf8"), /scaffold/)
    assert.ok(existsSync(join(dir, "backend", "src", "README.md")))
    assert.ok(existsSync(join(dir, "backend", "tests", "README.md")))
    assert.ok(existsSync(join(dir, "backend", "docs", "Architecture.md")))
    assert.ok(!existsSync(join(dir, "backend", "src", "App.sln")))
    assert.ok(existsSync(join(dir, "frontend", "src", "README.md")))
    assert.match(out, /Bề mặt đang có: `docs, backend, frontend`/)
    assert.match(out, /backend\/src\//)
    assert.ok(!existsSync(join(dir, "AGENTS.md")))
    assert.ok(!existsSync(join(dir, "mobile")))
    assert.ok(!existsSync(join(dir, "autotest")))
    assert.match(readFileSync(join(dir, "README.md"), "utf8"), /<!-- surfaces:start -->/)
    assert.match(run(["init", "--check", "--target", dir]), /OK/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init surfaces backend — không dựng cây docs", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-be-"))
  try {
    const out = run(["init", "--answers", answersFile(dir, { surfaces: ["backend"] }), "--target", dir])
    assert.ok(existsSync(join(dir, "backend", "src", "README.md")))
    assert.match(out, /Bề mặt đang có: `backend`/)
    assert.ok(!existsSync(join(dir, "AGENTS.md")))
    assert.ok(existsSync(join(dir, "memory", "memory.md")))
    assert.ok(existsSync(join(dir, ".minipower", "identity.json")))
    assert.ok(!existsSync(join(dir, "docs")))
    assert.ok(!existsSync(join(dir, "assets")))
    assert.ok(!existsSync(join(dir, "brainstorm")))
    assert.match(run(["init", "--check", "--target", dir]), /OK/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init surfaces id lạ → FAIL", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-badsurf-"))
  try {
    assert.throws(
      () => run(["init", "--answers", answersFile(dir, { surfaces: ["ios"] }), "--target", dir]),
      /surfaces/,
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("init --check FAIL khi shim trỏ sdlc/install", () => {
  const dir = mkdtempSync(join(tmpdir(), "mp-stale-"))
  const answers = join(dir, "a.json")
  writeFileSync(
    answers,
    JSON.stringify({
      project_name: "sample",
      project_summary: "demo",
      project_mode: "mvp",
      current_phase: "discovery",
      docs_provider: "local",
      tasks_provider: "none",
      chat_provider: "none",
      code_provider: "local",
      user_name: "Test",
      honorific: "anh",
      roles: ["BA"],
      minipower_experience: "new",
      os_username: "test",
    }),
  )
  try {
    run(["init", "--answers", answers, "--target", dir])
    writeFileSync(
      join(dir, ".minipower", "bin", "minipower"),
      `#!/usr/bin/env node
const cli = join(cfg.factory_root, "sdlc/install/minipower.mjs")
`,
    )
    assert.throws(() => run(["init", "--check", "--target", dir]), /shim cũ/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("claude/install.mjs --print uỷ quyền CLI", () => {
  const shim = join(HOOKS, "..", "..", "..", "cli", "claude", "install.mjs")
  const out = execFileSync(node, [shim, "--print"], { encoding: "utf8" })
  const frag = JSON.parse(out)
  assert.ok(frag.hooks.UserPromptSubmit)
  assert.equal(frag.permissions, undefined)
})
