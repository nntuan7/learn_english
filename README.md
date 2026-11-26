# Kevin học tiếng Anh – lớp 3

Trang học tiếng Anh cho bé lớp 3, giảng bằng tiếng Việt:

- **Bài giảng** (`index.html`): 5 bài video ngắn (~1 phút mỗi bài, `assets/bai1..5.mp4`) về chủ ngữ + động từ, hiện tại đơn và s/es, am/is/are, phủ định và câu hỏi, ôn tập; kèm video trọn bộ 3,5 phút (`assets/bai-giang.mp4`).
- **Học tương tác** (`bai-hoc.html`): Đoàn tàu câu (xếp chủ ngữ – động từ – phần thêm nếu có), Máy làm câu
  (chọn chủ ngữ + động từ + dạng câu, máy giải thích vì sao), Thử thách nhanh 10 câu có đếm giờ.
- **Luyện thêm** (`luyen-tap.html`): ngân hàng câu hỏi theo 6 mảng (`assets/bank.js`), tự chọn mảng yếu nhất.
- **Kết quả** (`ket-qua.html`): tỉ lệ đúng lần làm đầu theo từng mảng; nhập PIN để lưu online lên Supabase
  (xem `supabase/README.md`).
- **Bài tập** (`bai-tap.html`): 9 bài tương tác, bấm "Kiểm tra" để chấm điểm (83 câu), có nút loa đọc câu tiếng Anh,
  lưu bài làm trên trình duyệt, in được phiếu.

Trang tĩnh, không cần build. Chạy thử trên máy: `python3 -m http.server` rồi mở http://localhost:8000.

## Deploy lên Vercel

1. Vào https://vercel.com/new → Import Git Repository → chọn `learn_english`.
2. Framework Preset: **Other**, không cần Build Command, Output Directory để trống.
3. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel tự cập nhật.
