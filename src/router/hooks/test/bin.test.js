/**
 * Integration test — CLI shim (hooks/bin/*.js).
 * Spawn shim thật, pipe JSON vào stdin, kiểm tra stdout JSON + exit code.
 * Đây là lớp khoá HỢP ĐỒNG I/O mà lib (hàm thuần) không có.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const BIN = join(dirname(fileURLToPath(import.meta.url)), "..", "bin")

/** Chạy shim với input JSON. `env` để trỏ MP_PROJECT_ROOT vào fixture. Trả {code, json, stdout}. */
function run(script, input, env) {
  let stdout = ""
  let code = 0
  try {
    stdout = execFileSync("node", [join(BIN, script)], {
      input: JSON.stringify(input),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
      env: env ? { ...process.env, ...env } : process.env,
    })
  } catch (e) {
    stdout = e.stdout || ""
    code = e.status ?? 1
  }
  let json = null
  try {
    json = JSON.parse(stdout.trim())
  } catch {
    /* để nguyên null */
  }
  return { code, json, stdout }
}

test("shim token-guard", async (t) => {
  await t.test("allow → {continue:true} exit 0", () => {
    const r = run("token-guard.js", { prompt: "giải thích pipeline" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })

  await t.test("block @docs/ → {continue:false, user_message} exit 2", () => {
    const r = run("token-guard.js", { prompt: "@docs/" })
    assert.equal(r.code, 2)
    assert.equal(r.json.continue, false)
    assert.match(r.json.user_message, /1 file/)
  })

  await t.test("block attachment folder docs/03-modules [FIX-7]", () => {
    const r = run("token-guard.js", {
      prompt: "đang có những modules, features nào?",
      attachments: [{ type: "file", file_path: "/proj/docs/03-modules" }],
    })
    assert.equal(r.code, 2)
    assert.equal(r.json.continue, false)
    assert.match(r.json.user_message, /1 file/)
  })

  await t.test("warn thiếu scope → vẫn {continue:true} exit 0", () => {
    const r = run("token-guard.js", { prompt: "Phase: requirements — sửa DOC-06" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })

  await t.test("stdin rỗng → allow, không crash", () => {
    const r = run("token-guard.js", {})
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })

  await t.test("micro → allow + additional_context gợi ý tầng (R2)", () => {
    const r = run("token-guard.js", { prompt: "/minipower sửa typo trong DOC-06" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
    assert.match(r.json.additional_context, /micro/i)
    assert.equal(r.json.hookSpecificOutput.hookEventName, "UserPromptSubmit")
  })
})

test("shim auto-routing", async (t) => {
  await t.test("enrich → updated_input + hookSpecificOutput exit 0", () => {
    const r = run("auto-routing.js", { prompt: "sửa DOC-06" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
    assert.match(r.json.updated_input.prompt, /Phase: requirements/)
    assert.match(r.json.updated_input.prompt, /sửa DOC-06/) // giữ prompt gốc
    assert.equal(r.json.hookSpecificOutput.hookEventName, "UserPromptSubmit")
    assert.match(r.json.hookSpecificOutput.updatedInput.prompt, /Phase: requirements/)
  })

  await t.test("block nhiều phase → {continue:false} exit 2", () => {
    const r = run("auto-routing.js", { prompt: "review DOC-06 và DOC-08" })
    assert.equal(r.code, 2)
    assert.equal(r.json.continue, false)
    assert.match(r.json.user_message, /tách/i)
  })

  await t.test("attachments → nhận diện phase", () => {
    const r = run("auto-routing.js", {
      prompt: "sửa giúp",
      attachments: [{ type: "file", file_path: "docs/03-modules/billing/DOC-06-srs.md" }],
    })
    assert.equal(r.code, 0)
    assert.match(r.json.updated_input.prompt, /Phase: requirements/)
  })

  await t.test("không DOC → allow", () => {
    const r = run("auto-routing.js", { prompt: "giải thích pipeline" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
    assert.equal(r.json.updated_input, undefined)
  })
})

test("shim token-guard-read", async (t) => {
  await t.test("allow file thường → {permission:allow} exit 0", () => {
    const r = run("token-guard-read.js", { file_path: "docs/03-modules/billing/DOC-06-srs.md" })
    assert.equal(r.code, 0)
    assert.equal(r.json.permission, "allow")
  })

  await t.test("deny baseline → {permission:deny} exit 0 (không chặn hard)", () => {
    const r = run("token-guard-read.js", { file_path: "docs/02-baseline/v1.0/README.md" })
    assert.equal(r.code, 0)
    assert.equal(r.json.permission, "deny")
    assert.match(r.json.user_message, /02-baseline/)
  })

  await t.test("field 'path' thay cho 'file_path'", () => {
    const r = run("token-guard-read.js", { path: "docs/02-baseline/x.md" })
    assert.equal(r.json.permission, "deny")
  })

  await t.test("_legacy + prompt migrate → allow", () => {
    const r = run("token-guard-read.js", {
      file_path: "docs/03-modules/_legacy/old.md",
      prompt: "migrate billing",
    })
    assert.equal(r.json.permission, "allow")
  })
})

test("shim profile-guard", async (t) => {
  await t.test("ngoài dự án minipower → allow", () => {
    const r = run("profile-guard.js", { prompt: "Phase: requirements — DOC-06" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })

  await t.test("stdin rỗng → allow", () => {
    const r = run("profile-guard.js", {})
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })
})

test("shim decision-staleness", async (t) => {
  await t.test("prompt không liên quan → {continue:true}, không quét", () => {
    const r = run("decision-staleness.js", { prompt: "sửa DOC-06" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
    assert.equal(r.json.additional_context, undefined)
  })

  await t.test("prompt có keyword nhưng ngoài git → vẫn {continue:true} an toàn", () => {
    const r = run("decision-staleness.js", { prompt: "đánh giá lại quyết định baseline" })
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })

  await t.test("stdin rỗng → {continue:true}", () => {
    const r = run("decision-staleness.js", {})
    assert.equal(r.code, 0)
    assert.equal(r.json.continue, true)
  })
})

// ─── ADR-020 việc #3 — shim mới ─────────────────────────────────────────────

/** Dự án minipower giả để shim có profile thật mà đọc. */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "mp-shim-"))
  mkdirSync(join(root, "memory"), { recursive: true })
  mkdirSync(join(root, "docs", "01-project"), { recursive: true })
  mkdirSync(join(root, "docs", "03-modules", "ORD"), { recursive: true })
  writeFileSync(join(root, "memory", "memory.md"), "# Memory\n", "utf8")
  writeFileSync(
    join(root, "memory", "profile.json"),
    JSON.stringify({
      version: 2,
      user_name: "H",
      honorific: "anh",
      roles: ["BA"],
      project_name: "d",
      project_summary: "d",
      current_phase: "requirements",
      minipower_experience: "returning",
      approval_source: { docs: "local", tasks: "local", code: "local" },
    }),
    "utf8",
  )
  return root
}

test("shim prereq-gate", async (t) => {
  const root = fixture()
  const env = { MP_PROJECT_ROOT: root }
  try {
    await t.test("thiếu DOC-03 → warn: {continue:true} exit 0 + additional_context", () => {
      const r = run("prereq-gate.js", { prompt: "phan tich yeu cau" }, env)
      assert.equal(r.code, 0, "mức khai là warn — không được chặn")
      assert.equal(r.json.continue, true)
      assert.match(r.json.additional_context, /DOC-03/)
      assert.equal(r.json.hookSpecificOutput.hookEventName, "UserPromptSubmit")
    })

    await t.test("có DOC-03 → {continue:true} exit 0", () => {
      writeFileSync(join(root, "docs", "01-project", "DOC-03-brd.md"), "# BRD\n", "utf8")
      const r = run("prereq-gate.js", { prompt: "phan tich yeu cau" }, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.continue, true)
    })

    await t.test("BYPASS → allow, không chặn", () => {
      const r = run("prereq-gate.js", { prompt: "BYPASS ve prototype cho Module: ORD" }, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.continue, true)
    })

    await t.test("module thiếu DOC-04 → warn, nêu tên module", () => {
      const r = run("prereq-gate.js", { prompt: "ve prototype cho Module: ORD" }, env)
      assert.equal(r.code, 0)
      assert.match(r.json.additional_context, /ORD/)
    })

    await t.test("attachments → nhận diện module", () => {
      const r = run(
        "prereq-gate.js",
        { prompt: "ve prototype", attachments: [{ file_path: "docs/03-modules/ORD/DOC-06.md" }] },
        env,
      )
      assert.equal(r.code, 0)
      assert.match(r.json.additional_context, /DOC-04/, "biết module ORD qua attachment nên phát hiện thiếu DOC-04")
    })

    await t.test("prompt không khớp intent → allow", () => {
      const r = run("prereq-gate.js", { prompt: "chào bạn" }, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.continue, true)
    })

    await t.test("stdin rỗng → allow, không crash", () => {
      const r = run("prereq-gate.js", {}, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.continue, true)
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("shim baseline-guard", async (t) => {
  const root = fixture()
  const env = { MP_PROJECT_ROOT: root }
  try {
    await t.test("file thường → {permission:allow} exit 0", () => {
      const r = run("baseline-guard.js", { tool_input: { file_path: "src/a.ts" } }, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.permission, "allow")
    })

    await t.test("baseline → deny, exit 0 (không chặn hard)", () => {
      const r = run("baseline-guard.js", { tool_input: { file_path: "docs/02-baseline/v1/x.md" } }, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.permission, "deny")
    })

    await t.test("BYPASS trong prompt KHÔNG mở baseline (C4)", () => {
      const r = run(
        "baseline-guard.js",
        { tool_input: { file_path: "docs/02-baseline/v1/x.md" }, prompt: "BYPASS" },
        env,
      )
      assert.equal(r.json.permission, "deny")
    })

    await t.test("field top-level 'file_path' (không bọc tool_input) vẫn nhận", () => {
      const r = run("baseline-guard.js", { file_path: "docs/02-baseline/v1/x.md" }, env)
      assert.equal(r.json.permission, "deny")
    })

    await t.test("field 'path' thay cho 'file_path'", () => {
      const r = run("baseline-guard.js", { tool_input: { path: "docs/02-baseline/v1/x.md" } }, env)
      assert.equal(r.json.permission, "deny")
    })

    await t.test("_legacy: allow theo gate_levels.legacy_read, không cần migrate", () => {
      const f = { file_path: "docs/03-modules/_legacy/old.md" }
      assert.equal(run("baseline-guard.js", { tool_input: f }, env).json.permission, "allow")
    })

    await t.test("stdin rỗng → allow", () => {
      const r = run("baseline-guard.js", {}, env)
      assert.equal(r.code, 0)
      assert.equal(r.json.permission, "allow")
    })

    await t.test("Claude PreToolUse + baseline → hookSpecificOutput deny", () => {
      const r = run(
        "baseline-guard.js",
        { hook_event_name: "PreToolUse", tool_name: "Read", tool_input: { file_path: "docs/02-baseline/v1/x.md" } },
        env,
      )
      assert.equal(r.code, 0)
      assert.equal(r.json.hookSpecificOutput.hookEventName, "PreToolUse")
      assert.equal(r.json.hookSpecificOutput.permissionDecision, "deny")
      assert.match(r.json.hookSpecificOutput.permissionDecisionReason, /02-baseline/)
      assert.equal(r.json.permission, undefined, "không trộn format Cursor vào output Claude")
    })

    await t.test("Claude PreToolUse + Write/Edit vào baseline cũng deny", () => {
      for (const tool of ["Write", "Edit"]) {
        const r = run(
          "baseline-guard.js",
          { hook_event_name: "PreToolUse", tool_name: tool, tool_input: { file_path: "docs/02-baseline/v1/x.md" } },
          env,
        )
        assert.equal(r.json.hookSpecificOutput.permissionDecision, "deny", tool)
      }
    })

    await t.test("Claude PreToolUse + file thường → im lặng, KHÔNG trả allow (không duyệt hộ)", () => {
      const r = run(
        "baseline-guard.js",
        { hook_event_name: "PreToolUse", tool_name: "Write", tool_input: { file_path: "src/a.ts" } },
        env,
      )
      assert.equal(r.code, 0)
      assert.equal(r.stdout.trim(), "")
    })

    await t.test("Claude PreToolUse + baseline: deny; _legacy: im lặng (allow)", () => {
      const base = { hook_event_name: "PreToolUse", tool_name: "Read", tool_input: { file_path: "docs/02-baseline/v1/x.md" } }
      assert.equal(run("baseline-guard.js", base, env).json.hookSpecificOutput.permissionDecision, "deny")
      const legacy = { ...base, tool_input: { file_path: "docs/03-modules/_legacy/old.md" } }
      assert.equal(run("baseline-guard.js", legacy, env).stdout.trim(), "")
    })

    await t.test("Cursor beforeReadFile giữ format cũ", () => {
      const r = run(
        "baseline-guard.js",
        { hook_event_name: "beforeReadFile", file_path: "docs/02-baseline/v1/x.md" },
        env,
      )
      assert.equal(r.json.permission, "deny")
      assert.equal(r.json.hookSpecificOutput, undefined)
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("shim baseline-guard — _legacy mở theo gate_levels (C5)", async (t) => {
  const root = fixture()
  try {
    await t.test("không cần nhắc migrate", () => {
      const r = run(
        "baseline-guard.js",
        { tool_input: { file_path: "docs/03-modules/_legacy/old.md" } },
        { MP_PROJECT_ROOT: root },
      )
      assert.equal(r.json.permission, "allow")
    })

    await t.test("nhưng baseline vẫn deny", () => {
      const r = run(
        "baseline-guard.js",
        { tool_input: { file_path: "docs/02-baseline/v1/x.md" } },
        { MP_PROJECT_ROOT: root },
      )
      assert.equal(r.json.permission, "deny")
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
