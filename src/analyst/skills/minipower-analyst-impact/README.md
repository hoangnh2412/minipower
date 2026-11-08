# minipower-analyst-impact

Đánh giá impact thay đổi theo góc nhìn nghiệp vụ — cho người đọc là BA, không cần đọc code. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

Trước khi soạn CR, hoặc khi cần biết một thay đổi/yêu cầu đụng tới chức năng và rủi ro nghiệp vụ nào.

**Không dùng cho:** soạn nội dung CR → [minipower-analyst-cr](../minipower-analyst-cr/README.md) · ghi ticket/board → [minipower-pm-cr-track](../../../pm/skills/minipower-pm-cr-track/README.md) · phân tích kỹ thuật/API → [minipower-architecture-impact](../../../architecture/skills/minipower-architecture-impact/README.md).

## Prompt mẫu

```text
Đánh giá impact nghiệp vụ cho thay đổi: {mô tả thay đổi}. Module liên quan: {MOD}.
```

## Quy tắc (tóm tắt)

- Output đúng 4 phần: tóm tắt hiểu yêu cầu → chức năng liên quan → rủi ro nghiệp vụ → giải pháp đề xuất.
- Ngắn gọn, súc tích — không viết dài dòng.
- Viết cho người không đọc code.

## Liên quan

- Góc kỹ thuật — [minipower-architecture-impact](../../../architecture/skills/minipower-architecture-impact/README.md)
- Bản đồ module: [analyst/README.md](../../README.md)
