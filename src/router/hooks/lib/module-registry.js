/**
 * Module registry — quét PACK.md từng pack. CLI đọc; `npm run gen` ghi bản generated.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { ROOT, SRC, SKILL_PACKS } from "./skill-catalog.js"

function yamlBlock(mod, repoRoot) {
  const p = join(repoRoot, mod, "PACK.md")
  if (!existsSync(p)) return null
  const m = readFileSync(p, "utf8").match(/```yaml\r?\n([\s\S]*?)```/)
  return m ? m[1] : null
}

function field(yaml, key) {
  const m = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))
  return m ? m[1].trim().replace(/^\[|\]$/g, "") : ""
}

export function scanModuleRegistry(repoRoot = ROOT) {
  const packRoot = repoRoot === ROOT ? SRC : repoRoot
  const packs = [...SKILL_PACKS]
  const out = []
  for (const pack of packs) {
    const yaml = yamlBlock(pack, packRoot)
    if (!yaml) continue
    const repo = field(yaml, "repo")
    const kind =
      pack === "router"
        ? "dispatcher"
        : pack === "toolbox"
          ? "toolbox"
          : pack === "work"
            ? "business"
            : ["docs", "tasks", "chat", "vcs"].includes(pack)
              ? "channel"
              : "role"
    // work: tầng nghiệp vụ, chỉ cài khi --with (ADR-046 QĐ-2) — mặc định chưa bật
    const installDefault = !["toolbox", "work"].includes(pack)
    out.push({
      pack,
      path: `${pack}/`,
      repo,
      kind,
      install: { default: installDefault },
    })
  }
  return out
}

export function loadModuleRegistry(repoRoot = ROOT) {
  const generated = join(repoRoot, "src", "router", "hooks", "lib", "module-registry.json")
  if (existsSync(generated)) {
    try {
      return JSON.parse(readFileSync(generated, "utf8"))
    } catch {
      /* fall through */
    }
  }
  return scanModuleRegistry(repoRoot)
}

export function defaultWithPacks(registry) {
  return registry.filter((p) => p.install?.default).map((p) => p.pack)
}
