# TOEIC Learning — Bảng kiểm tiến độ triển khai

> Đây là ảnh chụp trạng thái repository ngày 2026-10-31, không thay thế đặc tả sản phẩm. Mã nguồn cho biết phần đã được viết; compile/build chỉ chứng minh biên dịch/đóng gói, không chứng minh luồng chạy đúng với DB, trình duyệt hoặc nhà cung cấp thanh toán.

## Quy ước trạng thái

- **Có code, chưa xác minh runtime**: có route/page/service tương ứng trong repo; cần kiểm tra dữ liệu và hành vi thật trước khi coi hoàn tất.
- **Chưa xác minh tích hợp**: phụ thuộc MySQL, Google, Cloudinary, VNPAY, HTTPS/proxy hoặc môi trường triển khai.
- **Ngoài scope đã chốt**: là đề xuất trong docs; không tự triển khai nếu chủ dự án chưa duyệt.

## Đối chiếu yêu cầu lõi

| Nhóm | Dấu hiệu code hiện tại | Trạng thái thực tế |
|---|---|---|
| Admin: CRUD/publish/archive đề, duyệt nội dung | `ExamController`, `ExamServiceImpl`, `TestManagementPage.jsx`, `/admin/tests` | Có code; compile/build đạt. Chưa chạy CRUD trên MySQL hoặc rà trực quan toàn studio. |
| Admin: khóa/mở user | `AdminController`, `AdminServiceImpl`, `/admin/users` | Có code; JWT `authVersion` thu hồi token cũ. Chưa kiểm chứng với DB đang chạy. |
| Admin: giao dịch/metrics/audit/duyệt giáo viên | `/api/admin/payments`, `/metrics/**`, `/audit-events`, `/teacher-applications`; các trang admin tương ứng | Có code. DB query/pagination và quyền thực tế chưa được integration test. |
| Người học: hồ sơ, đổi/đặt mật khẩu | `/api/user/**`, `ProfilePage.jsx` | Có code; xác minh Google thật và revoke token cần runtime check. |
| TOEIC: full/Part, lưu phiên, timer, submit, history/review, sai/bỏ trống | `/api/exam/**`, `ExamSession`, `ExamTakePage.jsx`, `TestResultPage.jsx` | Có code; compile/build đạt. Chưa test chấm điểm/submit/resume cạnh tranh trên DB; điểm 200 câu chỉ là ước tính tuyến tính, không phải bảng quy đổi ETS. |
| Giáo viên: đăng ký/thu phí/duyệt, lớp, roster, tài liệu, đề lớp, assignment, chấm/feedback | `module/teacher`, `module/classroom`, `ClassroomsPage.jsx`, các trang application/admin | Có code; chưa chạy tích hợp DB/Cloudinary/VNPAY và chưa xác minh quyền trong nhiều tài khoản thật. |
| Học sinh: lớp, bài tập, hạn nộp, báo cáo và notification | `ClassRoomController`, `NotificationController`, `/classrooms`, `/notifications` | Có code; thiếu runtime verification đa vai trò. Notification là in-app; không phải push/email realtime. |
| Đề VIP: giá riêng, checkout, quyền vĩnh viễn | `PaymentController`, entitlement, trang catalog/payment | Có code; entitlement chỉ cấp qua IPN hợp lệ. Chưa có bằng chứng từ VNPAY sandbox/merchant thật. |
| UI Neo-brutalism | token/layout/pages quy định ở `docs/05_UI_UX_SPEC.md` | Nhiều màn đã được restyle; build không chứng minh visual fidelity. Chưa hoàn thành browser review responsive, keyboard, contrast và mọi state. |

## Việc còn phải làm trước khi tuyên bố đồ án hoàn tất

### P0 — xác minh dữ liệu và luồng chạy

1. Khởi chạy MySQL dùng riêng cho đồ án; so sánh schema thực với entity và hai bootstrap SQL. Không chạy `database_script.sql`/`database_script_20de.sql` trên DB có dữ liệu cần giữ vì chúng có thể tạo lại database.
2. Xây migration có thể áp dụng an toàn trên schema hiện hữu cho mọi thay đổi còn thiếu. Đã có migration `V20261031_01__add_classroom_description.sql` và `V20261031_02__sync_latest_schema.sql` (bổ sung an toàn các cột `auth_version`, `google_sub`, VIP/classroom trong test, Cloudinary fields, submission key/score type/deadline snapshot trong test_result, các bảng `auth_login_attempt`, `exam_media_asset`, `user_presence`, `test_entitlement`, `exam_session`, `audit_event` mà không DROP DATABASE).
3. Chạy backend với DB sạch riêng và DB nâng cấp riêng; xác nhận JPA startup, seed, các truy vấn metrics/history/assignment/payment, FK/index/unique và session persistence. Ghi lại rollback/backup trước migration.
4. Thực hiện scenario smoke/integration theo sáu docs: đăng ký/login/khóa user; tạo/publish đề; full/Part/resume/submit/review; teacher approval; tạo lớp/join/duyệt/assignment/feedback; VIP checkout/IPN/entitlement. Đặc biệt thử ownership, khóa quyền khi đang thao tác, duplicate callback và retry idempotency.

### P0 — kiểm chứng dịch vụ và bảo mật triển khai

5. Cấu hình merchant VNPAY sandbox, callback IPN HTTPS có thể truy cập từ provider, đối chiếu chữ ký/amount/order/status và tình huống callback lặp, đến trễ, sai chữ ký. Đối soát payment hết hạn hiện chưa có UI/API vận hành chuyên dụng.
6. Xác minh Cloudinary private upload/delivery/cleanup/quota trên tài khoản tích hợp; rà media legacy và quyền phân phối hợp pháp cho đề, audio, ảnh, transcript, lời giải.
7. Hoàn thiện auth/deployment gate theo `docs/06_SECURITY_SPEC.md`: MFA cho ADMIN trước production, quy trình reset/verify email, đánh giá TTL/localStorage JWT, secret manager/env, HTTPS, CORS, trusted proxy headers, CSP frontend host, security headers, log/audit, backup/restore và quan sát lỗi. MFA/reset cần thiết kế luồng tương thích trước khi code vì thay đổi đáng kể auth hiện tại; chưa được triển khai.

### P1 — kiểm tra sản phẩm và trải nghiệm

8. Browser QA theo role ADMIN/TEACHER/USER trên desktop/mobile: empty/loading/error/retry/success/disabled, timer reload/restore, upload media, payment return, keyboard/focus/contrast/responsive và style Neo-brutalism. Sửa các lỗi tìm được rồi chạy lại build.
9. Chạy lint/build/compile và test phù hợp sau khi người dùng cho phép kiểm thử; hiện lượt rà 2026-10-31 chỉ chạy backend `mvnw.cmd -q -DskipTests compile` và frontend `npm run build`, cả hai thành công. Chưa chạy test suite.

## Giới hạn và scope mở

- Tại lần kiểm tra 2026-10-31, `127.0.0.1:3306` không reachable; vì vậy không thể khẳng định JPA/schema/migration/API chạy được trên DB. Không chạy bootstrap SQL để né rủi ro xóa dữ liệu.
- Không có xác minh VNPAY sandbox/production, IPN công khai, tài khoản Google/Cloudinary thật hoặc browser visual QA trong lượt rà này.
- Chưa có chính sách/luồng refund và thu hồi quyền VIP, endpoint hỗ trợ đối soát payment hết hạn, thao tác xóa lớp, giới hạn số lần làm assignment, đồng bộ dictation lên server, CAPTCHA/reset password, MFA, antivirus/sanitization PDF, push/email notification. Các mục chưa được chủ dự án chốt thì không tự xem là scope bắt buộc; các biện pháp security production được quy định ở docs vẫn cần đánh giá theo môi trường.
- Diagnostic/study plan, spaced repetition, content issue queue, notification preferences và payment funnel vẫn là đề xuất, không tính là thiếu sót của scope đã chốt.

## Việc gần nhất đã sửa

- Đăng ký bằng Google/local nếu tài khoản có role ADMIN hiện được chuyển tới `/admin/dashboard`, khớp luồng login (trước đó nhánh register chuyển tới trang user management). `frontend/src/pages/RegisterPage.jsx`; production build sau thay đổi đã pass.
- Validation publish Part 7 hiện kiểm tra đúng start/count từng nhóm và đúng số passage theo delimiter studio lưu; không cho passage rỗng hoặc marker sai thứ tự. Áp dụng create/update PUBLISHED và direct publish; partial test được phép kết thúc ở ranh giới group. Backend compile đã pass sau thay đổi.
- Hai bootstrap script có cùng seed TOEIC; q155 trước đây thuộc paragraph email và làm lệch nhóm Part 7 so với spec. Seed giờ dùng một câu mới bám passage rạp hát trong nhóm 153–155; email còn 156–157. Marker passage đôi/ba cũ `===== DOCUMENT/TÀI LIỆU N =====` được đổi sang delimiter mà studio tách được. Các đề clone phía sau tự kế thừa seed đã sửa. Chưa chạy SQL script.
- Security route allowlist đã thu hẹp từ wildcard `/api/auth/**` sang đúng ba POST register/login/Google. Các request auth route khác nay rơi về authenticated mặc định; API/security docs đã đồng bộ. Backend compile đã pass sau thay đổi.
- Thêm migration `backend/migrations/V20261031_02__sync_latest_schema.sql`: cung cấp kịch bản nâng cấp schema an toàn cho database hiện hữu (ALTER TABLE có điều kiện IF NOT EXISTS qua prepared statement, CREATE TABLE IF NOT EXISTS cho các bảng mới `auth_login_attempt`, `exam_media_asset`, `user_presence`, `test_entitlement`, `exam_session`, `audit_event`) mà không phá hủy dữ liệu hay chạy DROP DATABASE. Đã thực thi an toàn vào database `toeiclearning` thành công.
- Khởi động Spring Boot và sửa 2 lỗi runtime phát hiện khi nạp ứng dụng: bổ sung `JacksonConfig.java` cung cấp `ObjectMapper` bean cho Spring Boot và chuyển tham số HQL `category` trong `TestRepository.findCatalogTests` sang chuỗi để tránh lỗi `ConversionException` của Hibernate 7.4.
- Đã kiểm tra kết nối API `GET /api/exam/list` trên backend (port 8080): trả mã 1000 thành công cùng danh sách đề thi.
- Đã chạy Browser QA subagent trên trình duyệt thực tế (port 5174): kiểm chứng thành công tải trang chủ (Homepage), danh mục đề thi (Course Catalog `/courses`) và màn hình đăng nhập (LoginPage `/login`) hiển thị chuẩn thiết kế Neo-brutalism.
- Hoàn thiện refactor toàn bộ giao diện theo chuẩn Neo-brutalism (docs/05_UI_UX_SPEC.md):
  - Trang Giới thiệu (`AboutPage.jsx`): banner vàng `#FFE600`, thẻ Sứ mệnh/Tầm nhìn viền 3px đen & shadow 6px cứng, lưới Giá trị cốt lõi sticker Neo-brutalist.
  - Trang 404 (`NotFoundPage.jsx`): container viền đen 3px, badge lỗi vàng, nút bấm viền đen bóng cứng.
  - Error Boundary (`ErrorBoundary.jsx`): loại bỏ hộp bo tròn mềm đỏ; chuyển thành card Neo-brutalism viền 3px đen, bóng cứng 6px 6px 0 #111, nút Tải lại trang vàng `#FFE600`.
  - Phân trang (`Pagination.jsx`), Hộp thoại (`Modal.jsx`), và Thông báo (`Toast.jsx`): đồng bộ nền giấy ngà `#FFFDF2`, viền đen sắc nét, bóng cứng không blur.
  - Kiểm tra Frontend Production Build: `npm run build` thực hiện thành công 100% không lỗi.


