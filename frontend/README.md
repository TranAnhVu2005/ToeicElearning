# TOEIC Learning — Frontend

React 19 + Vite SPA. Cài dependencies bằng `npm install`, chạy dev server bằng `npm run dev`, build bằng `npm run build`, và lint bằng `npm run lint`.

Frontend mặc định gọi backend local `http://localhost:8080/api`. Khi chạy môi trường khác, đặt `VITE_API_BASE_URL` (đầy đủ base path, ví dụ `https://api.example.com/api`) trong `.env.local` hoặc build environment. Đăng nhập Google đọc `VITE_GOOGLE_CLIENT_ID` (cần khớp `GOOGLE_CLIENT_ID` của backend).

Trang liên hệ mở email bằng `mailto:`. Đặt `VITE_SUPPORT_EMAIL` trong `.env.local` để bật form và chỉ định địa chỉ nhận. Giá trị này là địa chỉ công khai, không phải secret. Nếu chưa cấu hình, form sẽ ở trạng thái disabled. Không commit `.env.local` hoặc thông tin bí mật.

Backend production phải đặt `APP_CORS_ALLOWED_ORIGINS` thành danh sách origin chính xác, phân tách bằng dấu phẩy (chỉ scheme + host + port, không path; ví dụ `https://learn.example.com`). Không dùng `*`; mặc định trong source chỉ dành cho hai origin local development.

Các trang, routes và REST client hiện có là một phần của SPA; tính năng mới tiếp tục dùng cấu trúc `pages/`, `components/`, `context/` và `services/` hiện hành.

## LocatorJS trong môi trường phát triển

- Chạy frontend bằng `npm run dev` và dùng URL do Vite in ra. LocatorJS chèn `data-locatorjs-id` cùng `window.__LOCATOR_DATA__` vào module `.jsx`/`.tsx` trong dev; giữ chế độ ID mặc định để tương thích extension 1.3.x. Vite config sửa registry key để escape đúng đường dẫn Windows. Production build không chứa marker Locator.
- Cài/bật extension LocatorJS cho trình duyệt đang mở ứng dụng. Giữ `Alt` và rê chuột để chọn component, rồi click để mở source trong editor.
- Sau khi thay cấu hình Vite, dừng mọi dev server frontend cũ và khởi động lại. Nếu extension vẫn báo `No source found`, tải lại tab để nhận bundle dev mới và kiểm tra extension có bật trên đúng origin `localhost`/`127.0.0.1` không.
