# TOEIC Learning — Bảng kiểm tiến độ triển khai

> Tài liệu được rà lại ngày 2026-11-10; không thay thế đặc tả sản phẩm. Các dòng trạng thái compile/build/browser bên dưới là bằng chứng có thời điểm được ghi rõ hoặc được lưu từ các lần làm việc trước, không phải kết quả chạy lại trong lần rà tài liệu này. Có code không chứng minh luồng chạy đúng với DB, trình duyệt hoặc nhà cung cấp thanh toán.

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
| UI Editorial | token/layout/pages quy định ở `docs/05_UI_UX_SPEC.md`; lớp toàn cục `frontend/src/editorial.css` | Editorial tokens áp dụng qua toàn bộ shell/routes, giữ các ảnh nội bộ; cần xác minh lại responsive/contrast và state trên browser. QA ghi nhận trước đó không chứng minh lần refactor hiện tại đã đạt. |

## Việc còn phải làm trước khi tuyên bố đồ án hoàn tất

### P0 — xác minh dữ liệu và luồng chạy

1. Với cài mới, dùng `backend/toeic_learning_fresh_install.sql` trên DB trống. Hai bootstrap cũ `database_script.sql`/`database_script_20de.sql` có thể DROP database; không dùng trên DB có dữ liệu cần giữ. File mới đã được rà tĩnh nhưng chưa chạy MySQL.
2. Xây migration có thể áp dụng an toàn trên schema hiện hữu cho mọi thay đổi còn thiếu. Đã có migration `V20261031_01__add_classroom_description.sql` và `V20261031_02__sync_latest_schema.sql` (bổ sung an toàn các cột `auth_version`, `google_sub`, VIP/classroom trong test, Cloudinary fields, submission key/score type/deadline snapshot trong test_result, các bảng `auth_login_attempt`, `exam_media_asset`, `user_presence`, `test_entitlement`, `exam_session`, `audit_event` mà không DROP DATABASE).
3. Chạy backend với DB sạch riêng và DB nâng cấp riêng; xác nhận JPA startup, seed, các truy vấn metrics/history/assignment/payment, FK/index/unique và session persistence. Ghi lại rollback/backup trước migration.
4. Thực hiện scenario smoke/integration theo sáu docs: đăng ký/login/khóa user; tạo/publish đề; full/Part/resume/submit/review; teacher approval; tạo lớp/join/duyệt/assignment/feedback; VIP checkout/IPN/entitlement. Đặc biệt thử ownership, khóa quyền khi đang thao tác, duplicate callback và retry idempotency.

### P0 — kiểm chứng dịch vụ và bảo mật triển khai

5. Cấu hình merchant VNPAY sandbox, callback IPN HTTPS có thể truy cập từ provider, đối chiếu chữ ký/amount/order/status và tình huống callback lặp, đến trễ, sai chữ ký. Đối soát payment hết hạn hiện chưa có UI/API vận hành chuyên dụng.
6. Xác minh Cloudinary private upload/delivery/cleanup/quota trên tài khoản tích hợp; rà media legacy và quyền phân phối hợp pháp cho đề, audio, ảnh, transcript, lời giải.
7. Hoàn thiện auth/deployment gate theo `docs/06_SECURITY_SPEC.md`: MFA cho ADMIN trước production, quy trình reset/verify email, đánh giá TTL/localStorage JWT, secret manager/env, HTTPS, CORS, trusted proxy headers, CSP frontend host, security headers, log/audit, backup/restore và quan sát lỗi. MFA/reset cần thiết kế luồng tương thích trước khi code vì thay đổi đáng kể auth hiện tại; chưa được triển khai.

### P1 — kiểm tra sản phẩm và trải nghiệm

8. Browser QA Editorial theo role ADMIN/TEACHER/USER trên desktop và các route/state chưa quan sát: empty/loading/error/retry/success/disabled, timer reload/restore, upload media, payment return, keyboard/focus/contrast/reduced motion/responsive. Sửa các lỗi tìm được rồi chạy lại build.
9. Chạy lint/build/compile và test phù hợp sau khi người dùng cho phép kiểm thử; hiện lượt rà 2026-10-31 chỉ chạy backend `mvnw.cmd -q -DskipTests compile` và frontend `npm run build`, cả hai thành công. Chưa chạy test suite.

## Giới hạn và scope mở

- Tại lần kiểm tra 2026-10-31, `127.0.0.1:3306` không reachable. Ghi chú sau đó trong `PROJECT_CONTEXT.md` cho biết migration `V20261031_02__sync_latest_schema.sql` đã được áp dụng và catalog API từng trả thành công; điều đó không xác nhận toàn bộ schema/query/luồng hiện tại. Không chạy bootstrap SQL để kiểm tra vì chúng có thể xóa database.
- Không có xác minh VNPAY sandbox/production, IPN công khai, tài khoản Google/Cloudinary thật hoặc browser visual QA trong lượt rà này.
- Chưa có chính sách/luồng refund và thu hồi quyền VIP, endpoint hỗ trợ đối soát payment hết hạn, thao tác xóa lớp, giới hạn số lần làm assignment, đồng bộ dictation lên server, CAPTCHA/reset password, MFA, antivirus/sanitization PDF, push/email notification. Các mục chưa được chủ dự án chốt thì không tự xem là scope bắt buộc; các biện pháp security production được quy định ở docs vẫn cần đánh giá theo môi trường.
- Diagnostic/study plan, spaced repetition, content issue queue, notification preferences và payment funnel vẫn là đề xuất, không tính là thiếu sót của scope đã chốt.

## Việc gần nhất đã sửa

- Tinh chỉnh ticker TOEIC theo phản hồi: thay nền galaxy xanh tím bằng ảnh sách trùng với hero, làm trầm/desaturate ảnh, bỏ lớp sao/sao băng và thu chiều cao/size chữ thành ticker gọn. Giữ dữ liệu, cuộn ngang, nút pause và ảnh galaxy trong assets. Build cần xác nhận; chưa browser QA.

- Chỉnh tiếp đoạn nối Hero → ticker TOEIC theo Editorial: hero mờ dần về nền giấy ở chân ảnh, ticker có dải chuyển sáng vào nền galaxy, giảm kích thước/glow của số và độ nảy để không lấn át nội dung. Giữ ảnh galaxy, ticker chạy ngang, số liệu và nút pause. Build cần xác nhận; chưa browser QA.

- Đồng bộ các tham chiếu ảnh theo cấu trúc mới trong `frontend/src/assets/img/`: auth/About/hero dùng `hero/`, ảnh điểm TOEIC dùng `others/`, các ảnh trang chủ dùng `home-optimized/`, galaxy dùng `scroll/`. Sửa cả import JS và URL ảnh trong CSS; cần production build xác nhận sau khi tái tổ chức asset.

- Login/Register: giảm cảm giác tách rời giữa ảnh TOEIC và form bằng cách cho panel form chồng nhẹ lên cạnh ảnh, dùng lớp nền trắng hơi trong và bóng mờ rất nhẹ; ở tablet/mobile chuyển thành ảnh banner liền khối phía trên form. Giữ nguyên ảnh, field, Google sign-in, validation và luồng auth. Build pass; chưa browser QA responsive sau chỉnh sửa.

- Đồng bộ nhận diện header/footer: cả hai dùng `frontend/src/assets/img/logo1.png`, thống nhất cách viết TOEIC ELearning và khung ảnh theo token Editorial; loại bỏ icon sách Lucide chỉ xuất hiện ở footer. Các icon chức năng/navigation khác không đổi.

### Ghi nhận rà tài liệu ngày 2026-11-10

- Source tree hiện có tokens Editorial trong `frontend/src/editorial.css`, ảnh nội bộ và favicon/app icon; đây là bằng chứng hiện diện trong code, không phải xác nhận quyền phân phối asset hay hoàn tất visual QA. Một số tên class legacy còn được giữ làm lớp tương thích.
- `README.md` và `backend/README.md` trước đó rỗng; lần rà này bổ sung hướng dẫn dự án/backend, đường dẫn đặc tả và cảnh báo rõ bootstrap SQL có thể phá hủy dữ liệu. Chỉ đọc cấu hình/mã/tài liệu; không chạy build, lint, test, migration hay SQL trong lần này.
- Tạo `backend/toeic_learning_fresh_install.sql` làm file cài mới hợp nhất: schema hiện tại, không DROP, không chèn tài khoản mẫu, và các seed bản sao được ghi nhãn local sample copy ở trạng thái DRAFT. Rà tĩnh 21 bảng và các đích FK không thiếu; chưa chạy trên MySQL. Seed Test 01 gốc vẫn cần xác minh answer key/quyền nội dung trước khi publish.
- Khắc phục lỗi `POST /api/exam/sessions` trên MariaDB: Hibernate phát sinh `FOR UPDATE OF u1_0`, cú pháp máy chủ từ chối ở `OF`. Repository nay dùng native `SELECT ... FOR UPDATE` để khóa đúng hàng user trong transaction, không thay đổi schema. Backend `mvnw.cmd -DskipTests compile` thành công; chưa chạy lại với MariaDB/browser.
- Sửa phòng thi chỉ render ảnh cho Part 1: `ContextQuestion.imageUrl` nay hiển thị ở bất kỳ Part nào có ảnh, với alt text gồm Part khi biết. Frontend production build pass; chưa kiểm tra trực quan trên browser.

- Sửa lỗi trang chủ ném `ReferenceError` khi render hero: JSX dùng icon `ArrowRight` nhưng import đã bị xóa ở lượt restyle trước. Thêm lại import; ảnh hero đã được Vite bundle (`hoctap.jpg`, 133.76 kB). Đây là lý do ảnh và nội dung trang chủ không xuất hiện trong ảnh chụp người dùng. `npm run build` pass; lint toàn frontend exit 0 với cảnh báo hooks/Fast Refresh hiện có; browser chưa được chụp lại sau fix.
- Restyle tiếp theo docs05: trang About dùng `toeic_980_co_ban_tay.jpg` kèm chú thích rõ ràng; thay claims ETS/điểm và contact cá nhân bằng mô tả tính năng đã có. Ảnh 980 nay còn làm nền phủ sáng cho header kho đề, luyện tập và Giới thiệu. Tạo `frontend/public/favicon.png` và `apple-touch-icon.png` bằng crop biểu tượng trung tâm từ `toeic_990_muiten.jpg`, không lấy chữ điểm số làm claim. Đổi ErrorBoundary, Footer sang Editorial.
- Header bị dồn do mọi link vai trò, link phụ và action tài khoản cùng chiếm một flex row; text link bị wrap. `Navbar.jsx` giờ phân loại link phụ/utility, giữ link chính và Lớp học/Quản trị trên desktop; CSS breakpoint chuyển sang hamburger ≤1120px, bỏ subtitle trên tablet, ẩn nút auth kề brand ≤520px (auth vẫn có trong menu). Thêm aria label/expanded/controls và panel ID ổn định. Đã xem screenshot viewport mobile hẹp: brand và menu hiển thị trọn, hero render; chưa browser QA desktop.
- Ảnh người dùng cho thấy catalog/practice vẫn bị rule `.neo-courses-*`/`.neo-practice-page` ghi đè: mảng xanh lớn, vàng/hồng, hard shadow và font-weight 900. Thêm final CSS migration overrides cho hai route, chuẩn hóa legacy utility/toàn app và các nhóm profile, admin user/studio, exam/dictation; giữ route/API/logic. Browser QA mobile thấy Home, Courses, Practice và menu; desktop/protected routes chưa xác minh.
- Đăng ký bằng Google/local nếu tài khoản có role ADMIN hiện được chuyển tới `/admin/dashboard`, khớp luồng login (trước đó nhánh register chuyển tới trang user management). `frontend/src/pages/RegisterPage.jsx`; production build sau thay đổi đã pass.
- Validation publish Part 7 hiện kiểm tra đúng start/count từng nhóm và đúng số passage theo delimiter studio lưu; không cho passage rỗng hoặc marker sai thứ tự. Áp dụng create/update PUBLISHED và direct publish; partial test được phép kết thúc ở ranh giới group. Backend compile đã pass sau thay đổi.
- Hai bootstrap script có cùng seed TOEIC; q155 trước đây thuộc paragraph email và làm lệch nhóm Part 7 so với spec. Seed giờ dùng một câu mới bám passage rạp hát trong nhóm 153–155; email còn 156–157. Marker passage đôi/ba cũ `===== DOCUMENT/TÀI LIỆU N =====` được đổi sang delimiter mà studio tách được. Các đề clone phía sau tự kế thừa seed đã sửa. Chưa chạy SQL script.
- Security route allowlist đã thu hẹp từ wildcard `/api/auth/**` sang đúng ba POST register/login/Google. Các request auth route khác nay rơi về authenticated mặc định; API/security docs đã đồng bộ. Backend compile đã pass sau thay đổi.
- Thêm migration `backend/migrations/V20261031_02__sync_latest_schema.sql`: cung cấp kịch bản nâng cấp schema an toàn cho database hiện hữu (ALTER TABLE có điều kiện IF NOT EXISTS qua prepared statement, CREATE TABLE IF NOT EXISTS cho các bảng mới `auth_login_attempt`, `exam_media_asset`, `user_presence`, `test_entitlement`, `exam_session`, `audit_event`) mà không phá hủy dữ liệu hay chạy DROP DATABASE. Đã thực thi an toàn vào database `toeiclearning` thành công.
- Khởi động Spring Boot và sửa 2 lỗi runtime phát hiện khi nạp ứng dụng: bổ sung `JacksonConfig.java` cung cấp `ObjectMapper` bean cho Spring Boot và chuyển tham số HQL `category` trong `TestRepository.findCatalogTests` sang chuỗi để tránh lỗi `ConversionException` của Hibernate 7.4.
- Đã kiểm tra kết nối API `GET /api/exam/list` trên backend (port 8080): trả mã 1000 thành công cùng danh sách đề thi.
- Lịch sử giao diện: các lượt đầu dùng Neo-brutalism, sau đó Editorial bị thay tạm bởi Retro. Lượt hiện tại thay lớp Retro bằng design layer Editorial trên toàn app, đổi font Google Fonts sang Gelasio/Ubuntu Mono và giữ ảnh nền/ảnh rải trang chủ. Cần build và visual QA lại; QA mobile cũ không đại diện cho CSS mới.
- Login/register được đồng bộ bố cục Editorial, cùng dùng ảnh `frontend/src/assets/img/toeic_980_co_ban_tay.jpg` và giữ panel ảnh không có copy text. Form có trạng thái lỗi/loading, autocomplete, label/focus, CTA và Google auth thống nhất; ở tablet/mobile ảnh chuyển lên trên form. Giữ nguyên luồng đăng nhập/đăng ký, Google, redirect theo role và validation. Frontend production build pass; chưa thực hiện browser visual QA.
- Cập nhật hero trang chủ: slideshow bốn ảnh trong `frontend/src/assets/img/hero/` giữ cố định câu “To have another language is to possess a second soul.” Có crossfade nền, zoom rất nhẹ, điều khiển trước/sau/chọn/tạm dừng; tự chuyển dừng khi tab ẩn, tắt khi `prefers-reduced-motion`. Giữ lớp phủ tương phản và không đổi route/CTA/nghiệp vụ. Frontend build pass; chưa có browser QA cho thay đổi này.
- StatsCounter được refactor theo component người dùng cung cấp: giữ ticker liên tục, galaxy.jpg làm lớp nền, thêm các lớp sao và sao băng bằng CSS trong `editorial.css` thay cho `<style>` nội tuyến; bổ sung nút pause/play thật sự, pause khi hover/focus trên ticker, và reduced-motion tĩnh hiển thị một nhóm dữ liệu. Giữ React/Tailwind và responsive spacing hiện có. Production build pass sau refactor; chưa browser QA.


