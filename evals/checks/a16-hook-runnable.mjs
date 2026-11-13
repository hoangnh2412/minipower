/**
 * A16 — mọi lệnh hook đã đăng ký phải chạy được.
 *
 * Ba tầng, đọc từ `hooks.json` (file sinh từ `rules.json`):
 *   (a) đường dẫn trong `command` phải trỏ tới file có thật;
 *   (b) file đó phải parse được (`node --check`);
 *   (c) chạy thử với stdin RỖNG, phải thoát mã 0 hoặc 2 và in JSON đọc được.
 *
 * Vì sao tầng (b) và (c) quan trọng hơn vẻ ngoài: một hook ném lỗi lúc nạp —
 * cú pháp sai, import trỏ module đã xoá — thì Claude Code ghi log rồi ĐI TIẾP.
 * Cổng không chặn gì nữa mà không ai thấy: fail-OPEN. Bộ test đơn vị không bắt
 * được, vì nó gọi hàm trong `lib/` chứ không chạy shim như môi trường thật.
 *
 * Vì sao là luật chung: nó duyệt `hooks.json`, nên tự đúng với bộ hook của
 * tương lai — thêm, bớt, đổi tên hook đều được canh mà không phải sửa check.
 *
 * Lưu ý phạm vi: A16 kiểm hook CHẠY ĐƯỢC, không kiểm hook QUYẾT ĐÚNG. Phần
 * quyết định thuộc test đơn vị trong `src/router/hooks/test/`.
 */

import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { readText, relTo, result, REPO_ROOT } from "./lib.mjs"

const HOOKS_JSON_REL = ["src", "router", "hooks", "hooks.json"]
const PLUGIN_ROOT_REL = ["src", "router"]
const PLACEHOLDER = /\$\{CLAUDE_PLUGIN_ROOT\}/g

/** Rút đường dẫn script khỏi một chuỗi `command`. */
export function scriptPath(command, pluginRoot) {
  const m = command.match(/["']([^"']*\.(?:js|mjs|cjs))["']|(\S*\.(?:js|mjs|cjs))/)
  if (!m) return null
  const raw = m[1] || m[2]
  return raw.replace(PLACEHOLDER, pluginRoot)
}

/** Mọi `{event, command}` khai trong hooks.json. */
export function hookCommands(json) {
  const out = []
  const events = (json && json.hooks) || {}
  for (const [event, groups] of Object.entries(events)) {
    for (const g of Array.isArray(groups) ? groups : []) {
      for (const h of (g && g.hooks) || []) {
        if (h && h.type === "command" && typeof h.command === "string") {
          out.push({ event, command: h.command })
        }
      }
    }
  }
  return out
}

export function run(root = REPO_ROOT) {
  const jsonPath = join(root, ...HOOKS_JSON_REL)
  const pluginRoot = join(root, ...PLUGIN_ROOT_REL)
  const raw = readText(jsonPath)
  if (raw === null) {
    return result("A16", "mọi lệnh hook chạy được", [
      { file: relTo(root, jsonPath), message: "không có hooks.json — A16 không soát được gì" },
    ], 0)
  }

  let json
  try {
    json = JSON.parse(raw)
  } catch (e) {
    return result("A16", "mọi lệnh hook chạy được", [
      { file: relTo(root, jsonPath), message: `hooks.json không phải JSON hợp lệ: ${e.message}` },
    ], 0)
  }

  const cmds = hookCommands(json)
  const findings = []

  for (const { event, command } of cmds) {
    const p = scriptPath(command, pluginRoot)
    if (!p) {
      findings.push({ file: relTo(root, jsonPath), message: `${event}: không rút được đường dẫn script từ \`${command}\`` })
      continue
    }
    if (!existsSync(p)) {
      findings.push({ file: relTo(root, jsonPath), message: `${event}: lệnh trỏ tới ${relTo(root, p)} — file không tồn tại` })
      continue
    }
    // (b) parse được
    try {
      execFileSync("node", ["--check", p], { stdio: ["ignore", "ignore", "pipe"] })
    } catch (e) {
      findings.push({ file: relTo(root, p), message: `${event}: không parse được (node --check): ${String(e.stderr || e.message).trim().split("\n")[0]}` })
      continue
    }
    // (c) chạy thử với stdin rỗng
    let code = 0
    let stdout = ""
    try {
      stdout = execFileSync("node", [p], { input: "", encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
    } catch (e) {
      code = e.status ?? 1
      stdout = e.stdout || ""
    }
    if (code !== 0 && code !== 2) {
      findings.push({
        file: relTo(root, p),
        message: `${event}: stdin rỗng → thoát mã ${code} (chỉ 0 hoặc 2 là hợp lệ); hook ném lỗi thì harness đi tiếp, cổng thành fail-open`,
      })
      continue
    }
    if (stdout.trim()) {
      try {
        JSON.parse(stdout.trim())
      } catch {
        findings.push({
          file: relTo(root, p),
          message: `${event}: stdin rỗng → stdout không phải JSON đọc được (${stdout.trim().slice(0, 60)}…)`,
        })
      }
    }
  }

  return result("A16", "mọi lệnh hook chạy được", findings, cmds.length)
}
