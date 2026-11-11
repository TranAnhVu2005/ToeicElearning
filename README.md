# TOEIC Learning

Website luyện thi TOEIC gồm catalog đề, phòng thi và xem lại kết quả; các luồng giáo viên/lớp học, assignment và đề VIP/VNPAY cũng được phát triển trong cùng ứng dụng.

## Cấu trúc

- `backend/`: một ứng dụng Spring Boot 4.1.0, Java 17, Maven, Spring Data JPA và MySQL.
- `frontend/`: React 19, Vite, React Router, Tailwind CSS 4 và Axios.
- `docs/01_OVERVIEW.md`–`docs/06_SECURITY_SPEC.md`: đặc tả nghiệp vụ, dữ liệu, API, luồng, UI và bảo mật.
- `docs/07_IMPLEMENTATION_STATUS.md`: bảng kiểm trạng thái code và các xác minh còn thiếu.
- `PROJECT_CONTEXT.md`: bản đồ nhanh về module, entry point và trạng thái gần nhất.

Kiến trúc hiện tại là backend modular monolith cung cấp REST API và một React SPA. Tính năng mới cần mở rộng cấu trúc đó; không suy ra rằng một yêu cầu trong docs đã có trong code.

## Chạy local

1. Cài Java 17, Node.js/npm và MySQL.
2. Tạo/cấu hình database local riêng theo [backend/README.md](backend/README.md). Không chạy bootstrap SQL trên database có dữ liệu cần giữ: `backend/database_script.sql` có lệnh `DROP DATABASE`.
3. Khởi động backend từ `backend/` bằng `mvnw.cmd spring-boot:run`.
4. Khởi động frontend từ `frontend/` bằng `npm install` rồi `npm run dev`.

Frontend mặc định gọi `http://localhost:8080/api`. Xem [frontend/README.md](frontend/README.md) và các file `.env.example` để biết cấu hình môi trường. Không đưa secret vào tài liệu, frontend hoặc Git.

## Trước khi sửa dự án

Đọc [AGENTS.md](AGENTS.md), rồi [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Trước mọi thay đổi dự án, đọc đủ sáu tài liệu đặc tả `docs/01`–`docs/06`; kiểm tra working tree và mã nguồn/schema liên quan. Chỉ triển khai tính năng đã được yêu cầu rõ; giữ riêng yêu cầu đã chốt, đề xuất và điểm chưa xác minh.
