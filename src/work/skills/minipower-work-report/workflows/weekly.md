# Weekly — tổng hợp tuần theo mốc

Bản cho nhiều dự án, gom theo mốc. Người đọc thường không ngồi trong board hằng ngày.

## 1. Phạm vi và kỳ

Mặc định toàn bộ dự án đang hoạt động trong `projects.json`, trừ khi người giới hạn. Kỳ mặc định là 7 ngày tính tới thời điểm đọc.

## 2. Trục chính là mốc

Lọc loại việc ứng với `milestone` trong `type_map`. Mỗi mốc gom việc con của nó theo `hierarchy`.

**Đội không khai loại mốc** ⇒ nói rõ ngay đầu báo cáo rằng không gom theo mốc được, và gom theo dự án thay thế. Đừng im lặng đổi trục.

## 3. Khuôn

```markdown
# Tổng hợp tuần {từ ngày} – {đến ngày}

**Tóm tắt.** {3–5 câu: mốc nào sắp tới, mốc nào có nguy cơ trượt, tuần này xong được gì}

## Theo mốc

### {tên mốc} — hạn {ngày}
- Xong trong tuần: {n} việc
- Còn lại: {n} việc, trong đó {n} quá hạn
- Nguy cơ: {chỉ ghi khi có việc quá hạn hoặc mốc đã qua hạn mà chưa xong}

## Việc xong trong tuần
{bảng gọn, gom theo dự án}

## Việc mới phát sinh
{bảng gọn — nhiều việc mới mà ít việc xong là tín hiệu đáng nêu}

## Còn đang chặn
{việc có việc khác chờ nó, kèm số ngày đứng yên}

---
{n} dự án · lọc theo {…} · đọc lúc {…}
```

## 4. Luật riêng của bản tuần

- **"Nguy cơ" chỉ viết khi có căn cứ đếm được** — quá hạn, hoặc mốc đã qua hạn mà việc con chưa xong. Không viết nguy cơ dựa trên cảm giác.
- **So với tuần trước nếu có dữ liệu.** Không có ⇒ ghi rõ "kỳ đầu, chưa có để so".
- **Mỗi mốc tối đa 5 dòng.** Chi tiết hơn thì người hỏi, hoặc dùng `work-status`.
- **Dự án không có hoạt động nào trong tuần** ⇒ gom hết vào một dòng cuối, đừng mỗi dự án một mục rỗng.
