# Backend TOEIC Learning

Backend là một ứng dụng Java 17 / Spring Boot 4.1.0 đóng gói WAR, dùng Spring Data JPA, Spring Security, JWT bearer và MySQL. Các module nghiệp vụ nằm dưới `src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/`; giữ module và convention hiện có khi thêm chức năng.

## Chạy local

- Cần Java 17 và MySQL.
- Tạo database local riêng và cấu hình `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` cùng các cấu hình cần cho tính năng đang chạy. Danh sách biến môi trường và security constraints nằm trong `docs/06_SECURITY_SPEC.md`.
- Từ thư mục `backend/`, chạy `mvnw.cmd spring-boot:run` trên Windows (hoặc `./mvnw spring-boot:run` trên Unix). Mặc định ứng dụng dùng port 8080 và database `toeiclearning` trên localhost.
- Frontend dev mặc định cần origin `http://localhost:5173` hoặc `http://127.0.0.1:5173` trong CORS allowlist.

## Schema và dữ liệu

`database_script.sql` và `database_script_20de.sql` là bootstrap/seed scripts, không phải migration an toàn; script đầu có `DROP DATABASE toeiclearning`. Chỉ dùng với database disposable sau khi xác nhận đúng target. Migration cho database hiện hữu nằm trong `migrations/`; trước khi chạy, kiểm tra schema đích, backup và nội dung migration. Không chạy script hoặc migration tự động như một phần của khởi động ứng dụng.

Hibernate hiện cấu hình `ddl-auto=update`; production profile có yêu cầu chặt hơn. Đối chiếu entity, migration và schema thực trước khi phát hành thay đổi dữ liệu. Xem [../docs/02_DATABASE.md](../docs/02_DATABASE.md) và [../docs/07_IMPLEMENTATION_STATUS.md](../docs/07_IMPLEMENTATION_STATUS.md).

Không ghi giá trị secret/config nhạy cảm vào README, log hoặc Git. Không bật SQL logging production; `JPA_SHOW_SQL` mặc định tắt.
