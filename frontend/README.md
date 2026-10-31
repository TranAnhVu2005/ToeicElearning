# TOEIC Learning — Frontend

React 19 + Vite SPA. Cài dependencies bằng `npm install`, chạy dev server bằng `npm run dev`, build bằng `npm run build`, và lint bằng `npm run lint`.

Frontend mặc định gọi backend local `http://localhost:8080/api`. Khi chạy môi trường khác, đặt `VITE_API_BASE_URL` (đầy đủ base path, ví dụ `https://api.example.com/api`) trong `.env.local` hoặc build environment. Đăng nhập Google đọc `VITE_GOOGLE_CLIENT_ID` (cần khớp `GOOGLE_CLIENT_ID` của backend).

Trang liên hệ mở email bằng `mailto:`. Đặt `VITE_SUPPORT_EMAIL` trong `.env.local` để bật form và chỉ định địa chỉ nhận. Giá trị này là địa chỉ công khai, không phải secret. Nếu chưa cấu hình, form sẽ ở trạng thái disabled. Không commit `.env.local` hoặc thông tin bí mật.

Backend production phải đặt `APP_CORS_ALLOWED_ORIGINS` thành danh sách origin chính xác, phân tách bằng dấu phẩy (chỉ scheme + host + port, không path; ví dụ `https://learn.example.com`). Không dùng `*`; mặc định trong source chỉ dành cho hai origin local development.

Các trang, routes và REST client hiện có là một phần của SPA; tính năng mới tiếp tục dùng cấu trúc `pages/`, `components/`, `context/` và `services/` hiện hành.
