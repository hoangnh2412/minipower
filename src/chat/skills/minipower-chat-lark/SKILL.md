---
name: minipower-chat-lark
description: Đọc hội thoại Lark, soạn tin, gửi nhóm hoặc DM sau một lần chốt L3. Dùng khi nhắc việc trên chat, tóm tắt nhóm, im_v1, chat_provider lark — không dùng cho tasklist hay wiki.
metadata:
  workflow: github
  version: 1.0.0
---

# minipower-chat-lark

SOP MCP mặt **`chat`**. Wrap tool. Hướng dẫn người: [README.md](README.md).

## Khi nào dùng

| Tình huống | Workflow |
|---|---|
| Tóm tắt nhóm / tìm quyết định trong chat | [workflows/l1-l3.md](workflows/l1-l3.md) — L1 |
| Nhắc việc, thông báo, tạo nhóm | L2 bản tin → một OK → L3 |

**Không dùng** cho `task_v2_*` (pack `tasks/`).

## Quy tắc cốt lõi

- `chat_provider` phải `lark`. `none` → chỉ soạn trong phiên Cursor, không gửi.
- MCP `mcp.chat` (thường trùng server Lark với tasks — **skill khác**, tool khác).
- Schema lần đầu phiên. Nhóm hay gặp: `im_v1_chat_list`, `im_v1_chatMembers_get`, `im_v1_message_list` (L1); `im_v1_message_create`, `im_v1_chat_create` (L3). Resolve người: `contact_v3_user_batchGetId` trước DM.
- Không tự @mentions hàng loạt, không tự tạo nhóm trừ khi bảng L2 có dòng đó và user OK.
- `uuid` dedup khi gửi lặp. `receive_id_type` đúng (`chat_id` / `open_id` / `email`).
- Support: soạn nhắc + lịch — **gửi** là L3; không biến tin thành task trừ khi user mở skill tasks.

## Output

- L1: tóm tắt thread.
- L2: nguyên văn tin + kênh.
- L3: `message_id`.
