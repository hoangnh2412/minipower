/**
 * Golden test — version:check (ADR-044 §8.1 Q2), fixture git giả.
 * Việc quan trọng nhất cần chứng minh: WARN đúng case gài (đổi lá, quên bump) và
 * KHÔNG WARN khi bump đúng hoặc lá mới — tránh false-positive khiến WARN bị tắt tai.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { checkVersionBumps } from "../lib/version-check.js"

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" })
}

function skillMd(version) {
  return `---\nname: minipower-fixture-x\ndescription: fixture\nmetadata:\n  workflow: github\n  version: ${version}\n---\n\n# fixture\n`
}

function proj() {
  const root = mkdtempSync(join(tmpdir(), "mp-version-check-"))
  git(root, ["init", "-q"])
  git(root, ["config", "user.email", "test@example.com"])
  git(root, ["config", "user.name", "Test"])
  return root
}

const leafPath = (root) => join(root, "src", "backend", "skills", "minipower-fixture-x", "SKILL.md")

test("version:check — lá đổi, version KHÔNG tăng → WARN", () => {
  const root = proj()
  try {
    const skillDir = join(root, "src", "backend", "skills", "minipower-fixture-x")
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, "SKILL.md"), skillMd("1.0.0"))
    writeFileSync(join(skillDir, "README.md"), "v1\n")
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "base"])

    writeFileSync(join(skillDir, "README.md"), "v2 — sửa mà quên bump\n")
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "sửa README, quên bump"])

    const leaves = [{ name: "minipower-fixture-x", skillMd: leafPath(root) }]
    const warnings = checkVersionBumps(leaves, root, "HEAD~1")
    assert.equal(warnings.length, 1, "phải WARN đúng case gài")
    assert.equal(warnings[0].name, "minipower-fixture-x")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("version:check — lá đổi, version CÓ tăng → không WARN", () => {
  const root = proj()
  try {
    const skillDir = join(root, "src", "backend", "skills", "minipower-fixture-x")
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, "SKILL.md"), skillMd("1.0.0"))
    writeFileSync(join(skillDir, "README.md"), "v1\n")
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "base"])

    writeFileSync(join(skillDir, "README.md"), "v2 — có bump\n")
    writeFileSync(join(skillDir, "SKILL.md"), skillMd("1.1.0"))
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "sửa README, có bump"])

    const leaves = [{ name: "minipower-fixture-x", skillMd: leafPath(root) }]
    const warnings = checkVersionBumps(leaves, root, "HEAD~1")
    assert.deepEqual(warnings, [], "bump đúng thì không được báo sai")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("version:check — lá mới (chưa có ở base) → không WARN", () => {
  const root = proj()
  try {
    writeFileSync(join(root, "README.md"), "root\n")
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "base rỗng"])

    const skillDir = join(root, "src", "backend", "skills", "minipower-fixture-x")
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, "SKILL.md"), skillMd("1.0.0"))
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "thêm lá mới"])

    const leaves = [{ name: "minipower-fixture-x", skillMd: leafPath(root) }]
    const warnings = checkVersionBumps(leaves, root, "HEAD~1")
    assert.deepEqual(warnings, [], "lá mới không có gì để so, không được báo sai")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("version:check — base không tồn tại (ref lạ) → trả về rỗng, không ném", () => {
  const root = proj()
  try {
    writeFileSync(join(root, "README.md"), "root\n")
    git(root, ["add", "-A"])
    git(root, ["commit", "-q", "-m", "base"])
    const leaves = [{ name: "minipower-fixture-x", skillMd: leafPath(root) }]
    assert.deepEqual(checkVersionBumps(leaves, root, "HEAD~1"), [])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
