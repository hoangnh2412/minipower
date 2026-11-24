/**
 * Golden test — checkProfileGuard @ beforeSubmitPrompt
 */

import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import {
  checkProfileGuard,
  checkUserIdentity,
  isMinipowerProject,
  resolveSurfaces,
  isProfileComplete,
  osUsername,
  providersFromProfile,
  validateProfile,
  validateUserProfile,
  PROFILE_VERSION,
} from "../lib/profile-guard.js"

function makeProject() {
  const root = mkdtempSync(join(tmpdir(), "mp-profile-"))
  mkdirSync(join(root, "memory"), { recursive: true })
  mkdirSync(join(root, "docs"), { recursive: true })
  writeFileSync(join(root, "memory", "memory.md"), "# Memory\n", "utf8")
  return root
}

const VALID_PROFILE = {
  version: 1,
  user_name: "Hoàng",
  honorific: "anh",
  agent_pronoun: "em",
  roles: ["BA", "PM"],
  project_name: "demo",
  project_summary: "Hệ thống hóa đơn điện tử",
  current_phase: "discovery",
  minipower_experience: "new",
  completed_at: "2026-07-25",
}

test("validateProfile", async (t) => {
  await t.test("profile hợp lệ", () => {
    const r = validateProfile(VALID_PROFILE)
    assert.equal(r.valid, true)
    assert.equal(r.errors.length, 0)
  })

  await t.test("thiếu user_name", () => {
    const r = validateProfile({ ...VALID_PROFILE, user_name: "" })
    assert.equal(r.valid, false)
  })

  await t.test("role không hợp lệ", () => {
    const r = validateProfile({ ...VALID_PROFILE, roles: ["CEO"] })
    assert.equal(r.valid, false)
  })
})

// ─── ADR-020 — schema v2 (approval_source) ──────────────────────────────────

const VALID_PROFILE_V2 = {
  ...VALID_PROFILE,
  version: 2,
  approval_source: { docs: "local", tasks: "local", code: "local" },
}

test("profile v2 (QĐ-1, QĐ-12)", async (t) => {
  await t.test("schema hiện hành là v3", () => {
    assert.equal(PROFILE_VERSION, 3)
  })

  await t.test("v2 đầy đủ → hợp lệ", () => {
    assert.equal(validateProfile(VALID_PROFILE_V2).valid, true)
  })

  await t.test("v1 vẫn hợp lệ — không chặn oan dự án cài bản cũ (QĐ-2a)", () => {
    assert.equal(validateProfile(VALID_PROFILE).valid, true)
  })

  await t.test("version lạ → không hợp lệ", () => {
    assert.equal(validateProfile({ ...VALID_PROFILE_V2, version: 99 }).valid, false)
  })

  // nhắc tên cũ có chủ đích: test tương thích — profile đã cài còn trường này phải vẫn hợp lệ
  await t.test("v2 còn trường project_mode cũ (bất kỳ giá trị) → vẫn hợp lệ, không chặn oan dự án đã cài", () => {
    for (const m of ["gia-tri-cu", "turbo"]) {
      assert.equal(validateProfile({ ...VALID_PROFILE_V2, project_mode: m }).valid, true, m) // nhắc tên cũ có chủ đích: tương thích
    }
  })

  await t.test("v2 approval_source thiếu một loại → không hợp lệ", () => {
    const r = validateProfile({
      ...VALID_PROFILE_V2,
      approval_source: { docs: "local", tasks: "local" },
    })
    assert.equal(r.valid, false)
    assert.ok(r.errors.some((e) => e.includes("approval_source.code")))
  })

  await t.test("v2 approval_source nhận tên MCP, không chỉ 'local'", () => {
    const r = validateProfile({
      ...VALID_PROFILE_V2,
      approval_source: { docs: "outline", tasks: "openproject", code: "gitlab" },
    })
    assert.equal(r.valid, true)
  })
})

test("isMinipowerProject", async (t) => {
  const root = makeProject()
  try {
    assert.equal(isMinipowerProject(root), true)
    assert.equal(isMinipowerProject(tmpdir()), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }

  await t.test("backend-only không có docs/ vẫn là dự án khi surfaces khai", () => {
    const code = mkdtempSync(join(tmpdir(), "mp-codeonly-"))
    try {
      mkdirSync(join(code, "memory"), { recursive: true })
      writeFileSync(join(code, "memory", "memory.md"), "# Memory\n", "utf8")
      assert.equal(isMinipowerProject(code), false)
      writeFileSync(
        join(code, "memory", "profile.json"),
        JSON.stringify({ ...VALID_PROFILE_V3, surfaces: ["backend"] }),
        "utf8",
      )
      assert.equal(isMinipowerProject(code), true)
    } finally {
      rmSync(code, { recursive: true, force: true })
    }
  })
})

test("checkProfileGuard", async (t) => {
  const root = makeProject()
  try {
    await t.test("chưa profile — prompt thường → allow", () => {
      assert.equal(
        checkProfileGuard("xin chào, tôi là Hoàng", [], { root }).action,
        "allow",
      )
    })

    await t.test("chưa profile — minipower work → block", () => {
      const r = checkProfileGuard("Phase: requirements — DOC-06", [], { root })
      assert.equal(r.action, "block")
      assert.match(r.message, /profile\.json/)
    })

    await t.test("init project → allow", () => {
      assert.equal(
        checkProfileGuard("Init project billing", [], { root }).action,
        "allow",
      )
    })

    await t.test("BYPASS → allow", () => {
      assert.equal(
        checkProfileGuard("BYPASS Phase: requirements DOC-06", [], { root }).action,
        "allow",
      )
    })

    writeFileSync(
      join(root, "memory", "profile.json"),
      JSON.stringify(VALID_PROFILE, null, 2),
      "utf8",
    )
    writeFileSync(
      join(root, "memory", "profile.user.json"),
      JSON.stringify(
        {
          user_name: "Hoàng",
          honorific: "anh",
          roles: ["BA"],
          minipower_experience: "new",
          os_username: osUsername(),
        },
        null,
        2,
      ),
      "utf8",
    )

    await t.test("đã profile + identity — minipower work → allow", () => {
      assert.equal(isProfileComplete(root), true)
      assert.equal(
        checkProfileGuard("Phase: requirements — DOC-06", [], { root }).action,
        "allow",
      )
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

const VALID_PROFILE_V3 = {
  version: 3,
  project_name: "demo",
  project_summary: "Hệ thống hóa đơn điện tử",
  current_phase: "discovery",
  docs_provider: "local",
  tasks_provider: "none",
  chat_provider: "none",
  code_provider: "local",
  trace_store: "sqlite",
}

const VALID_USER = {
  user_name: "Lan",
  honorific: "chi",
  roles: ["BA"],
  minipower_experience: "returning",
  os_username: "alice",
}

test("profile v3 (ADR-033)", async (t) => {
  await t.test("v3 đầy đủ local/none → hợp lệ không cần mcp", () => {
    assert.equal(validateProfile(VALID_PROFILE_V3).valid, true)
  })

  await t.test("v3 không đòi user_name trên file git", () => {
    assert.equal(validateProfile({ ...VALID_PROFILE_V3, user_name: "Hoàng" }).valid, true)
  })

  await t.test("v3 docs=outline thiếu mcp.docs → FAIL", () => {
    const r = validateProfile({ ...VALID_PROFILE_V3, docs_provider: "outline" })
    assert.equal(r.valid, false)
    assert.ok(r.errors.some((e) => e.includes("mcp.docs")))
  })

  await t.test("v3 MCP lệch mặt (tasks=none + mcp.tasks) → FAIL", () => {
    const r = validateProfile({
      ...VALID_PROFILE_V3,
      mcp: { tasks: "user-lark-mcp" },
    })
    assert.equal(r.valid, false)
    assert.ok(r.errors.some((e) => e.includes("mcp.tasks")))
  })

  await t.test("v3 outline + mcp.docs khớp → hợp lệ", () => {
    assert.equal(
      validateProfile({
        ...VALID_PROFILE_V3,
        docs_provider: "outline",
        mcp: { docs: "user-outline-mcp" },
      }).valid,
      true,
    )
  })

  await t.test("v3 bỏ surfaces vẫn hợp lệ; id lạ thì FAIL", () => {
    assert.equal(validateProfile(VALID_PROFILE_V3).valid, true)
    assert.equal(validateProfile({ ...VALID_PROFILE_V3, surfaces: ["backend", "docs"] }).valid, true)
    assert.deepEqual(resolveSurfaces(["autotest", "docs"]), ["docs", "autotest"])
    const bad = validateProfile({ ...VALID_PROFILE_V3, surfaces: ["ios"] })
    assert.equal(bad.valid, false)
    assert.ok(bad.errors.some((e) => e.includes("surfaces")))
  })

  await t.test("v3 code_provider=gitlab thiếu mcp.code → FAIL", () => {
    const r = validateProfile({ ...VALID_PROFILE_V3, code_provider: "gitlab" })
    assert.equal(r.valid, false)
  })
})

test("providersFromProfile — map v2 local tasks → none", () => {
  const p = providersFromProfile(VALID_PROFILE_V2)
  assert.equal(p.docs, "local")
  assert.equal(p.tasks, "none")
  assert.equal(p.chat, "none")
  assert.equal(p.code, "local")
})

// nhắc tên cũ có chủ đích: test tương thích — profile đã cài còn trường này phải vẫn hợp lệ
test("profile v3 còn trường project_mode cũ → vẫn hợp lệ (dự án đích không phải sửa gì)", () => {
  assert.equal(validateProfile({ ...VALID_PROFILE_V3, project_mode: "gia-tri-cu" }).valid, true) // nhắc tên cũ có chủ đích: tương thích
})

test("identity T7 — os_username lệch", async (t) => {
  const root = makeProject()
  try {
    writeFileSync(join(root, "memory", "profile.json"), JSON.stringify(VALID_PROFILE_V3), "utf8")
    writeFileSync(join(root, "memory", "profile.user.json"), JSON.stringify(VALID_USER), "utf8")

    await t.test("validateUserProfile", () => {
      assert.equal(validateUserProfile(VALID_USER).valid, true)
    })

    await t.test("khớp OS → ok", () => {
      assert.equal(checkUserIdentity(root, { osUsername: "alice" }).ok, true)
    })

    await t.test("lệch OS → os_mismatch", () => {
      const r = checkUserIdentity(root, { osUsername: "bob" })
      assert.equal(r.ok, false)
      assert.equal(r.reason, "os_mismatch")
    })

    await t.test("minipower work + lệch OS → block, không xưng Lan", () => {
      const r = checkProfileGuard("Phase: requirements — DOC-06", [], {
        root,
        osUsername: "bob",
      })
      assert.equal(r.action, "block")
      assert.match(r.message, /profile\.user\.json/)
      assert.doesNotMatch(r.message, /Lan/)
    })

    await t.test("không đọc user_name từ profile.json git", () => {
      writeFileSync(
        join(root, "memory", "profile.json"),
        JSON.stringify({ ...VALID_PROFILE_V3, user_name: "Hoàng" }),
        "utf8",
      )
      rmSync(join(root, "memory", "profile.user.json"))
      const r = checkProfileGuard("Phase: requirements — DOC-06", [], { root, osUsername: "bob" })
      assert.equal(r.action, "block")
      assert.doesNotMatch(r.message, /Hoàng/)
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
