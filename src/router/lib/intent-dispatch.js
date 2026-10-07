/**
 * Intent → gợi ý skill (test vàng / khóa). Route lúc làm việc = LLM (ADR-034 QĐ-4).
 *
 * Không đặt trong sdlc/hooks/lib — tầng cứng hook cấm phụ thuộc SOP maintain.
 */

function fold(s) {
  return String(s).normalize("NFC").toLowerCase()
}

/**
 * Khóa dài thắng khóa ngắn. Thứ tự trong mảng keys không quan trọng.
 * Không dùng khóa 1–2 ký tự (dễ khớp oan).
 */
export const INTENT_RULES = [
  { skill: "minipower-router-init", keys: ["khởi tạo dự án", "init project", "init dự án", "khởi tạo project"] },
  { skill: "minipower-router-deliberation", keys: ["có nên làm", "premise check", "nghị luận"] },
  { skill: "minipower-router-readiness", keys: ["đủ tiền đề", "readiness", "soát tiền đề"] },
  { skill: "minipower-discovery-survey", keys: ["khảo sát", "painpoint", "doc-01", "doc-02", "doc-03"] },
  { skill: "minipower-discovery-review", keys: ["review khảo sát", "soi doc-03"] },
  { skill: "minipower-analyst-srs", keys: ["viết fr", "viết uc", "srs", "acceptance criteria", "doc-06"] },
  { skill: "minipower-analyst-review", keys: ["review srs", "qc ba"] },
  { skill: "minipower-analyst-cr", keys: ["soạn cr", "đổi fr", "change request nội dung"] },
  { skill: "minipower-architecture-solution-lite", keys: ["giải pháp mức bán", "phương án module", "solution lite"] },
  { skill: "minipower-architecture-sad", keys: ["viết sad", "doc-08", "doc-12", "viết adr"] },
  { skill: "minipower-architecture-review", keys: ["review sad", "soi adr"] },
  { skill: "minipower-architecture-as-built", keys: ["khai quật", "bounded context đang chạy", "maintain legacy"] },
  { skill: "minipower-pm-plan", keys: ["lập kế hoạch", "wbs", "story point", "doc-14", "doc-15"] },
  { skill: "minipower-pm-cr-track", keys: ["ticket cr", "ghi cr", "board cr"] },
  { skill: "minipower-support-registry", keys: ["registry", "thiếu doc theo mode"] },
  { skill: "minipower-support-publish", keys: ["công bố", "publish outline"] },
  { skill: "minipower-qa-strategy", keys: ["viết test", "doc-16", "test strategy"] },
  { skill: "minipower-qa-review", keys: ["review test", "qc test"] },
  { skill: "minipower-presales-estimation-ulnl", keys: ["ulnl", "ước lượng mh", "mã loại"] },
  { skill: "minipower-presales-quotation", keys: ["báo giá", "quotation", "tờ giá"] },
  { skill: "minipower-ops-metrics", keys: ["grafana", "prometheus", "lấy panel"] },
  { skill: "minipower-ops-deploy", keys: ["runbook deploy", "doc-17", "cutover"] },
  { skill: "minipower-ops-incident", keys: ["incident", "postmortem", "sev"] },
  { skill: "minipower-backend-scaffold-dotnet", keys: ["scaffold backend", "solution mới"] },
  { skill: "minipower-backend-architecture-dotnet", keys: ["layer ddd", "archunit", "cắt dọc"] },
  { skill: "minipower-backend-convention-dotnet", keys: ["convention", "cách viết c#"] },
  { skill: "minipower-backend-authentication-dotnet", keys: ["jwt", "api key", "cognito", "bearer"] },
  { skill: "minipower-backend-caching-dotnet", keys: ["cache redis", "caching", "thêm cache"] },
  { skill: "minipower-backend-entityframework-dotnet", keys: ["entity framework", "ef core", "dbcontext"] },
  { skill: "minipower-backend-swashbuckle-dotnet", keys: ["swagger", "swashbuckle"] },
  { skill: "minipower-backend-healthcheck-dotnet", keys: ["healthcheck", "/health"] },
  { skill: "minipower-backend-telemetry-dotnet", keys: ["otel", "otlp", "telemetry"] },
  { skill: "minipower-backend-observability-dotnet", keys: ["onboard metric"] },
  { skill: "minipower-backend-notification-dotnet", keys: ["smtp", "gửi mail", "mailkit"] },
  { skill: "minipower-backend-blobstoring-dotnet", keys: ["minio", "blob", "upload chứng từ"] },
  { skill: "minipower-backend-realtime-dotnet", keys: ["signalr", "realtime"] },
  { skill: "minipower-backend-review-dotnet", keys: ["review pr", "review diff", "review c#"] },
  { skill: "minipower-frontend-scaffold-react", keys: ["scaffold frontend", "dựng frontend", "cài @platform/core"] },
  { skill: "minipower-frontend-architecture-react", keys: ["feature module", "cây feature", "lint kiến trúc"] },
  { skill: "minipower-frontend-convention-react", keys: ["convention react", "convention typescript", "cách viết react"] },
  { skill: "minipower-frontend-api-react", keys: ["platformhttp", "nối api màn hình", "mock api frontend"] },
  { skill: "minipower-frontend-form-react", keys: ["react-hook-form", "zod schema", "form zod"] },
  { skill: "minipower-frontend-crud-react", keys: ["màn danh sách", "trang danh sách", "màn crud"] },
  { skill: "minipower-frontend-navigation-react", keys: ["navigatebridge", "menu sidebar", "configure navigate"] },
  { skill: "minipower-frontend-customization-react", keys: ["tuỳ biến page", "tùy biến page", "slot content"] },
  { skill: "minipower-frontend-review-react", keys: ["review react", "review tsx", "review frontend"] },
  { skill: "minipower-toolbox-skill-author", keys: ["viết skill", "soát skill", "skill lá"] },
  { skill: "minipower-docs-outline", keys: ["outline", "wiki"] },
  { skill: "minipower-tasks-openproject", keys: ["openproject", "work package", "wp #"] },
  { skill: "minipower-tasks-lark", keys: ["tasklist", "lark task"] },
  { skill: "minipower-chat-lark", keys: ["tin nhắn lark", "lark im"] },
  { skill: "minipower-vcs-gitlab", keys: ["merge request", "gitlab", "pipeline"] },
  { skill: "minipower-router", keys: ["làm gì tiếp", "chọn pack", "chọn skill"] },
]

export function matchIntent(prompt) {
  const t = fold(prompt)
  let best = null
  let bestLen = -1
  for (const rule of INTENT_RULES) {
    for (const key of rule.keys) {
      const k = fold(key)
      if (k.length > bestLen && t.includes(k)) {
        best = rule.skill
        bestLen = k.length
      }
    }
  }
  return best
}

export function announceLine(skill, task) {
  return `Sẽ chạy \`${skill}\` để xử lý ${String(task).trim()}.`
}
