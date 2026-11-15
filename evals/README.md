# evals — đo chất lượng Minipower

**Trạng thái:** 🟡 Một phần sống — nhóm A có 10 check (A04 · A05 · A06 · A07 · A09 · A10 · A11 · A12 · A13 · A16); nhóm B đã kiểm chứng runner chạy được nhưng chưa có case nào.

Bộ này đo **chính repo Minipower**, không đo dự án khách. Thiết kế gốc: [ADR-026](../ADRs/doing/ADR-026-2026-08-27-phuong-phap-danh-gia-chat-luong-minipower.md).

## Hai nhóm, hai cách chạy

| | Nhóm A | Nhóm B |
|---|---|---|
| Cần LLM | không | có |
| Chạy khi nào | mọi lúc, vào CI | chỉ khi người tự chạy |
| Trạng thái | 10 check đã có | runner đã kiểm chứng, chưa có case |

Nhóm B **không** được gắn vào CI, hook, hay `npm test` — nó tốn tiền và cần người đọc kết quả.

## Nhóm B — kết quả kiểm chứng runner (2026-11-14)

Đã chạy thật 4 lần qua `claude -p --plugin-dir src/router --output-format stream-json --verbose`, CLI 2.1.260, tổng **$1,21**. Kết luận: **runner dùng được**.

| Đo được bằng máy | Bằng chứng trên transcript |
|---|---|
| Lá nào được kích hoạt (C1) | `tool_use` tên `Skill`, input `{"skill":"minipower:minipower-router-readiness"}` — có cả namespace plugin |
| Vượt ranh giới (C6) | `system/permission_denied` kèm `tool_name`, `decision_reason_type`; `result.permission_denials` |
| Chi phí, số lượt, token | `result.total_cost_usd`, `num_turns`, `usage`, `modelUsage` |
| Plugin có nạp đúng | `system/init` → `plugins: [{name:"minipower", version:"0.1.0"}]` |

Bốn điều phải sửa trong ADR-026 trước khi viết case:

1. **`max_turns: 3` (§8.2) quá chặt.** Một case readiness thật dừng ở `subtype: error_max_turns`, `num_turns: 4`, chưa kịp ra verdict. Nâng lên, hoặc chấm theo "đã ra verdict chưa" thay vì "chạy xong chưa".
2. **Hook production CÓ chạy qua `--plugin-dir`** (đã chứng minh bằng marker ghi file), nhưng **hook event và output của hook không hiện trên `stream-json`**. Nên không chấm hành vi hook qua runner — phần đó thuộc test đơn vị trong `src/router/hooks/test/`. Giả định "transcript thấy được hook" của §4.2 H3 là sai một nửa.
3. **Fixture phải tự chứa mọi thứ.** Agent đọc ra ngoài thư mục làm việc là bị `permission_denied` ở chỗ ngẫu nhiên, làm lệch case.
4. **Phải truyền `< /dev/null`**, nếu không CLI chờ stdin 3 giây rồi cảnh báo.

## Chạy

```bash
npm run check:integrity        # 10 check, in báo cáo
npm run check:integrity -- --json
npm run check:integrity:test   # test của chính bộ check
npm run check                  # gói nhóm A đầy đủ: test + gen:check + link:check + trace:check + 10 check này
```

## Mười check hiện có

| Mã | Bắt cái gì | Lối thoát |
|---|---|---|
| **A04** | Tên skill nhắc trần trong văn xuôi (không phải link) trỏ tới lá không ai khai — bảng README liệt kê lá chưa tồn tại thì không link nào gãy, không test nào đỏ | `nhắc có chủ đích: <lý do>` cùng dòng hoặc dòng trên |
| **A05** | Script test/CI/hook tự gọi LLM — `claude -p` hoặc `eval:run` nằm trong closure của `test`/`check*`, kể cả qua `pretest`/`posttest` mà npm chạy tự động. Vi phạm QĐ-7: máy tự tiêu tiền | — (đây là cổng bảo vệ ranh giới người-quyết, không có lối thoát) |
| **A06** | `SKILL.md` dài quá 150 dòng — lá là thứ agent nạp mỗi lượt nên độ dài là chi phí thật | `dài có chủ đích: <lý do>` trong 800 ký tự đầu của lá |
| **A07** | Chữ "bắt buộc" trong `SKILL.md` không kèm cổng máy nào — lời mạnh không có gì đỏ khi làm sai | — (ADR-026 §11 Q6: **sửa chữ, không whitelist**) |
| **A09** | Sổ `install_hooks` và cây `bin/` lệch nhau — hai chiều: khai mà thiếu file, hoặc có file shim mà quên đăng ký | `không đăng ký: <lý do>` ở header file |
| **A10** | Hai file nội dung giống hệt — tức hai nguồn chân lý cho một sự thật | `bản sao có chủ đích: <lý do>` trong một bản |
| **A11** | Test chép tay con số **tồn kho của repo** (hằng nhập từ `lib/`, hoặc biến từ phép quét cây file) | `khoá có chủ đích: <lý do>` cùng dòng hoặc dòng trên |
| **A12** | Cơ chế đã quyết gỡ còn sót dấu vết trong chữ — đọc [sổ đã quyết bỏ](decided-removed.md) | hạ trạng thái về `đang gỡ` khi việc chưa xong |
| **A13** | `catch` trả giá trị mặc định (`{}`, `[]`, `null`, `false`, `0`, `""`) hoặc rỗng, trong im lặng — fail-open | `cố ý im lặng: <lý do>` trong thân catch |
| **A16** | Lệnh hook trong `hooks.json` trỏ file không có, không parse được, hoặc ném lỗi với stdin rỗng — hook chết là fail-open | — (hỏng thì sửa, không có lối thoát) |

Một file có thể tự khai `evals: không soát — <lý do>` ở header để mọi check bỏ qua nó. Chỉ dùng cho file **chứa mã mẫu làm fixture**, nơi lỗi là cố ý.

## Ba luật của mọi check trong `checks/`

1. **Đọc từ dữ liệu, không từ danh sách chép tay.** Một check kê tên file sẽ lão hoá đúng cách nó đi bắt.
2. **Phát biểu luật tổng quát**, không nhắm vào một lỗi cụ thể đang tồn tại. Bộ này dùng chung cho mọi thay đổi về sau, không phải để vá một đợt.
3. **Có fixture dương và fixture âm.** Thiếu case âm thì một check "luôn báo" cũng đạt 100%.

## Mức cưỡng chế

**A05 ở mức chặn** — nó canh QĐ-7, và một lần lọt là CI tự tiêu tiền. Chín check còn lại ở mức **WARN** — in ra, `exit 0`. Cùng luật với `version:check` ([ADR-044](../ADRs/doing/ADR-044-2026-10-29-vong-phan-hoi-bai-hoc-github-issue-version-skill.md) §8.1): nâng lên chặn sau khi check đã bắt đúng ít nhất hai lần trên thay đổi thật. Nâng bằng cách đổi `level` của check sang `"block"`.

## Đọc kết quả

Dòng `(N phát hiện / M đã soát)` — **M là phần quan trọng**. `0 phát hiện / 0 đã soát` nghĩa là check không kiểm được gì, **không** phải repo sạch. Trình chạy tự in cảnh báo khi gặp trường hợp đó.

## Cái gì chưa có

- **Case nhóm B.** Runner đã kiểm chứng; chưa viết `case.yaml` / `prompt.md` / grader nào.
- **A03** (mỗi điều kiện cứng phải có ≥1 test làm nó FAIL) của §7.1 — chưa có test meta nào.
- **A08** (hai tỷ lệ coverage `TC_FR` / `TC_chain` in từ `trace:check`) — thuộc vùng sở hữu của [#8](https://github.com/hoangnh2412/minipower/issues/8), nên làm cùng lượt S2 thay vì sửa lẻ `lib/trace-check.js`.
- **A14** — mỗi test phải có một đột biến làm nó đỏ (mutation nhẹ). Đắt nhất, dễ phình to.
- **A15** — hợp của "vùng sở hữu" các thẻ con phải phủ kín cây file. Phải đọc thẻ từ GitHub nên không thuần offline.
