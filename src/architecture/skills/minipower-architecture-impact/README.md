# minipower-architecture-impact

Đánh giá impact thay đổi theo góc nhìn kỹ thuật — cho người đọc là SA. Agent đọc [SKILL.md](./SKILL.md).

## Khi nào dùng

Trước khi sửa `DOC-08`/`11`/`12`, hoặc khi cần biết một thay đổi/yêu cầu đụng tới thành phần, API, data model nào và rủi ro kỹ thuật kèm theo.

**Không dùng cho:** viết SAD đầy đủ → [minipower-architecture-sad](../minipower-architecture-sad/README.md) · convention/layer .NET → [minipower-backend-architecture-dotnet](../../../backend/skills/minipower-backend-architecture-dotnet/README.md) · góc nhìn nghiệp vụ → [minipower-analyst-impact](../../../analyst/skills/minipower-analyst-impact/README.md).

## Prompt mẫu

```text
Đánh giá impact kỹ thuật cho thay đổi: {mô tả thay đổi}. Module liên quan: {MOD}.
```

## Quy tắc (tóm tắt)

- Output đúng 4 phần: tóm tắt hiểu yêu cầu → thành phần/API/data model liên quan → rủi ro kỹ thuật → giải pháp đề xuất.
- Ngắn gọn, súc tích — không viết dài dòng.
- Viết cho SA, có thể tham chiếu DOC/ADR/API.

## Liên quan

- Góc nghiệp vụ — [minipower-analyst-impact](../../../analyst/skills/minipower-analyst-impact/README.md)
- Bản đồ module: [architecture/README.md](../../README.md)
