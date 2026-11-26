# Database (Supabase)

Project: `kevin-hoc-tieng-anh` (ap-southeast-1). Bảng nằm trong schema `app`, không mở ra API;
trang web chỉ gọi 2 hàm, cả hai đều kiểm tra PIN (sai 10 lần thì khoá 15 phút):

- `record_attempts(p_learner, p_pin, p_rows)` – ghi kết quả. Mỗi dòng: `q` mã câu, `skill` mảng,
  `a` câu trả lời, `ok` đúng/sai, `mode` main|practice, `n` lần thứ mấy của câu đó.
- `get_summary(p_learner, p_pin)` – tổng hợp theo mảng.

Mảng (skill): subject, verb_pred (= "Động từ"), to_be, s_es, negative, question.
"Lần làm đầu" = các dòng `mode='main' and attempt_no=1`.

Xem câu Kevin hay sai (chạy trong SQL editor của Supabase):

```sql
select skill, question_id, answer, count(*) as times
from app.attempts
where learner = 'Kevin' and not correct
group by 1, 2, 3 order by times desc limit 30;
```
