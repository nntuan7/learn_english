// Cấu hình Supabase. Khoá "publishable" được thiết kế để nằm công khai trong trang web;
// dữ liệu được bảo vệ bằng PIN kiểm tra phía database (hàm record_attempts / get_summary).
window.KCONFIG = {
  supabaseUrl: "https://tzlzwkviqdmxyondbgxs.supabase.co",
  supabaseKey: "sb_publishable__UTCw1M_1pAsDRSg300-Vw_vbhvvUoI",
  defaultLearner: "Kevin",
  weakThreshold: 0.8
};
