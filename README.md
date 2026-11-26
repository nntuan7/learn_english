# Cú Bông học tiếng Anh – lớp 3

Trang học tiếng Anh cho bé lớp 3, giảng bằng tiếng Việt:

- **Bài giảng** (`index.html`): video ~7 phút về chủ ngữ, động từ, vị ngữ, thì hiện tại đơn, am/is/are, do/does.
- **Bài tập** (`bai-tap.html`): 9 bài tương tác, bấm "Kiểm tra" để chấm điểm (83 câu), có nút loa đọc câu tiếng Anh,
  lưu bài làm trên trình duyệt, in được phiếu.

Trang tĩnh, không cần build. Chạy thử trên máy: `python3 -m http.server` rồi mở http://localhost:8000.

## Deploy lên Vercel

1. Vào https://vercel.com/new → Import Git Repository → chọn `learn_english`.
2. Framework Preset: **Other**, không cần Build Command, Output Directory để trống.
3. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel tự cập nhật.
