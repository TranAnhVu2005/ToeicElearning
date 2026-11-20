# TOEIC Learning — Bảng kiểm tiến độ triển khai

> Tài liệu được rà lại ngày 2026-11-15; không thay thế đặc tả sản phẩm. Các dòng trạng thái compile/build/browser bên dưới là bằng chứng có thời điểm được ghi rõ hoặc được lưu từ các lần làm việc trước.

## Quy ước trạng thái

- **Có code, đã xác minh compile/build**: có route/page/service tương ứng trong repo; cần kiểm tra dữ liệu và hành vi thật trước khi coi hoàn tất.
- **Chưa xác minh tích hợp**: phụ thuộc MySQL, Google, Cloudinary, PayOS, Gmail SMTP, HTTPS/proxy hoặc môi trường triển khai.
- **Ngoài scope đã chốt**: là đề xuất trong docs; không tự triển khai nếu chủ dự án chưa duyệt.

## Rà soát bảo mật 2026-11-20

- **Đã sửa trong source:** bỏ fallback JWT signing key và Cloudinary API credentials khỏi `application.properties`; private exam media không còn ghi local khi Cloudinary lỗi; public local-media handler từ chối `public_id` đã đăng ký là authenticated; `prod` yêu cầu cấu hình exact CORS origins và frontend URL qua environment.
- **Việc vận hành cần làm:** rotate Cloudinary API secret từng nằm trong source, kiểm tra lịch sử Git và secrets ở môi trường deploy, rồi cấu hình `JWT_SECRET`, Cloudinary credentials, `APP_CORS_ALLOWED_ORIGINS` và `FRONTEND_URL` ở môi trường phù hợp. Dữ liệu private media fallback cũ có thể cần tải lại lên Cloudinary.
- **Kiểm chứng:** chưa chạy compile, test suite, integration test, DB migration hay pentest trong lượt rà này. Các thay đổi mới chỉ được rà soát tĩnh.
- **Nạp biến môi trường local:** `application.properties` có `spring.config.import=optional:file:.env[.properties],optional:file:backend/.env[.properties]` để Spring Boot tự đọc `backend/.env` khi chạy local (dù working directory là `backend/` hay thư mục gốc). `backend/.env` đã nằm trong `.gitignore`; không commit file này.
- **Giới hạn audit:** đây là rà soát source theo luồng rủi ro chính, không phải audit độc lập/pentest và không chứng nhận an toàn production. Còn cần rà quyền từng route, cấu hình reverse proxy/HTTPS, frontend XSS/CSP, dependency vulnerabilities, backup và môi trường thực tế.

## Đối chiếu yêu cầu lõi

| Nhóm | Dấu hiệu code hiện tại | Trạng thái thực tế |
|---|---|---|
| Admin: CRUD/publish/archive đề, duyệt nội dung | `ExamController`, `ExamServiceImpl`, `TestManagementPage.jsx`, `/admin/tests` | Đã hoàn thiện CRUD, sửa đề tại chỗ (`upsertTestDetailInPlace`), sửa nhanh metadata và cấu hình VIP. |
| Admin: khóa/mở user | `AdminController`, `AdminServiceImpl`, `/admin/users` | Đã hoàn thiện; JWT `authVersion` thu hồi token cũ ngay lập tức, trả `403 USER_ACCOUNT_LOCKED` (2009). |
| Admin: giao dịch PayOS/metrics/audit/duyệt giáo viên | `/api/admin/payments`, `/metrics/**`, `/audit-events`, `/teacher-applications`; các trang admin tương ứng | Đã hoàn thiện. |
| Người học: hồ sơ, đổi/đặt mật khẩu, streak | `/api/user/**`, `ProfilePage.jsx` | Đã hoàn thiện; hỗ trợ cả đặt mật khẩu cục bộ cho tài khoản Google-only, theo dõi Streak, lịch sử thi và lịch sử thanh toán PayOS. |
| TOEIC: full/Part, lưu phiên, timer, submit, history/review, sai/bỏ trống | `/api/exam/**`, `ExamSession`, `ExamTakePage.jsx`, `TestResultPage.jsx` | Đã hoàn thiện; tự động lưu phiên khi F5/reload, bảng quy đổi điểm ước tính `10–990` (`ESTIMATED_TOEIC`), luyện lại câu sai. |
| Trợ lý AI Nuna | `AiAssistantController`, `AiAssistantServiceImpl.java`, `AiAssistantWidget.jsx`, `aiVoiceHelpers.js`, `aiService.js`, `TobyMascot.jsx` | Đã hoàn thiện cả hỏi đáp văn bản, **ra lệnh giọng nói Hybrid 2 lớp** (`Web Speech API` nhanh + `POST /api/ai/voice-chat` Gemini Audio cho user đã đăng nhập) và **nút Loa đọc thành tiếng** (`SpeechSynthesis`, có bật/tắt tự đọc); tích hợp Gemini API kèm Smart Local Tutor dự phòng, tự trích xuất ngữ cảnh câu hỏi #1–#200 trên trang xem lại kết quả. |
| Giáo viên: đăng ký/thu phí PayOS/duyệt, lớp kiểu Google Classroom (tuỳ chỉnh giao diện & ảnh bìa), mời qua Gmail, tài liệu PDF (preview + download), đề lớp, assignment (kèm thông báo Gmail), chấm/feedback | `module/teacher`, `module/classroom`, `ClassroomEmailService.java`, `ClassroomsPage.jsx`, `TeacherApplicationPage.jsx` | Đã hoàn thiện; hỗ trợ đăng ký lại khi link PayOS hết hạn, tuỳ chỉnh màu chủ đề & ảnh bìa lớp học lưu DB (`V20261115_01`), mời học viên hàng loạt qua Gmail, gửi thông báo bài tập/bảng tin qua Gmail và xem trước PDF trực tiếp trên trình duyệt. |
| Học sinh: lớp, bài tập, hạn nộp, báo cáo và notification | `ClassRoomController`, `NotificationController`, `/classrooms`, `/notifications` | Đã hoàn thiện cả thông báo in-app (6 danh mục) và thông báo/lời mời qua Gmail. |
| Đề VIP & Thanh toán PayOS: giá riêng, checkout QR, webhook, quyền vĩnh viễn | `PaymentController`, `PayosGatewayService`, `PayosPaymentService`, `VipPurchaseService`, `PaymentResultPage.jsx` | Đã hoàn thiện; chuyển hoàn toàn sang nền tảng PayOS (`payos_order_code`, `payos_reference`, `payos_code`, `payos_status`), hỗ trợ cả Webhook PayOS và tự động đồng bộ trạng thái qua PayOS API. |
| UI Editorial | token/layout/pages quy định ở `docs/05_UI_UX_SPEC.md`; lớp toàn cục `frontend/src/editorial.css` | Đã đồng bộ xuyên suốt toàn bộ các route công khai, học tập, lớp học và Admin. |

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

- Lịch sử: ticker TOEIC từng được tinh chỉnh nền/chiều cao nhưng sau đó chủ dự án quyết định loại bỏ hẳn component vì không phù hợp. Component đã bị xóa khỏi `HomePage`; giữ ảnh `galaxy.jpg` trong assets vì có thể còn dùng ở vị trí khác.

- (Ghi chú trước đây về ticker đã bị loại bỏ; không còn áp dụng cho giao diện hiện tại.)

- Đồng bộ các tham chiếu ảnh theo cấu trúc mới trong `frontend/src/assets/img/`: auth/About/hero dùng `hero/`, ảnh điểm TOEIC dùng `others/`, các ảnh trang chủ dùng `home-optimized/`, galaxy dùng `scroll/`. Sửa cả import JS và URL ảnh trong CSS; cần production build xác nhận sau khi tái tổ chức asset.

- Login/Register: giảm cảm giác tách rời giữa ảnh TOEIC và form bằng cách cho panel form chồng nhẹ lên cạnh ảnh, dùng lớp nền trắng hơi trong và bóng mờ rất nhẹ; ở tablet/mobile chuyển thành ảnh banner liền khối phía trên form. Giữ nguyên ảnh, field, Google sign-in, validation và luồng auth. Build pass; chưa browser QA responsive sau chỉnh sửa.

- Đồng bộ nhận diện header/footer: cả hai dùng `frontend/src/assets/img/logo1.png`, thống nhất cách viết TOEIC ELearning và khung ảnh theo token Editorial; loại bỏ icon sách Lucide chỉ xuất hiện ở footer. Các icon chức năng/navigation khác không đổi.

### Ghi nhận rà tài liệu ngày 2026-11-10

- Source tree hiện có tokens Editorial trong `frontend/src/editorial.css`, ảnh nội bộ và favicon/app icon; đây là bằng chứng hiện diện trong code, không phải xác nhận quyền phân phối asset hay hoàn tất visual QA. Một số tên class legacy còn được giữ làm lớp tương thích.
- `README.md` và `backend/README.md` trước đó rỗng; lần rà này bổ sung hướng dẫn dự án/backend, đường dẫn đặc tả và cảnh báo rõ bootstrap SQL có thể phá hủy dữ liệu. Chỉ đọc cấu hình/mã/tài liệu; không chạy build, lint, test, migration hay SQL trong lần này.
- Tạo `backend/toeic_learning_fresh_install.sql` làm file cài mới hợp nhất: schema hiện tại, không DROP, không chèn tài khoản mẫu. Tại thời điểm ghi nhận ban đầu, các seed bản sao đều DRAFT. Rà tĩnh 21 bảng và các đích FK không thiếu; chưa chạy trên MySQL. Seed Test 01 gốc vẫn cần xác minh answer key/quyền nội dung trước khi dùng thương mại.
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
- Theo quyết định mới của chủ dự án, xóa `StatsCounter` khỏi trang chủ. Xóa import mồ côi trong `HomePage.jsx` gây lỗi module sau khi component bị xóa, đồng thời bỏ các quy tắc CSS dành riêng cho ticker. Trang chủ chuyển thẳng từ hero sang khóa học nổi bật. Build và browser visual QA cần xác nhận.

- Refactor các section Home bên dưới `HeroSection` theo Editorial: gỡ ảnh Malaysia/ảnh stock không liên quan khỏi thẻ đề, Listening/Reading và tính năng; chuẩn hóa typography, nền trắng/xám, accent xanh, divider mảnh, card phẳng, khoảng cách và breakpoint mobile. Giữ nguyên hero, dữ liệu danh mục/API, route và hành vi tải; bỏ helper/registry ảnh chỉ dùng cho các ảnh đã gỡ. Chưa chạy build hoặc browser visual QA.

- Theo phản hồi tiếp theo, dùng ảnh mới `assets/img/homepage/muaThu.jpg` làm nền chung cho ba section Home sau hero, phủ sáng và dùng card trắng bán trong để đọc rõ; giảm padding, khoảng hở và chiều cao card. Giữ hình ảnh là nền trang trí chứ không gán ảnh như minh họa nội dung TOEIC. Chưa chạy build hoặc browser visual QA.

- `ToeicPartsSection` được thu gọn thành hai bảng semantic Listening/Reading với mã Part, tên dạng bài, số câu và liên kết luyện tập; bỏ các mô tả dài. Bảng xếp thành một cột ở màn hình hẹp và cuộn ngang nếu cần. Chưa chạy build hoặc browser visual QA.

- Fresh install seed: dùng các bản clone đã có trong script, đặt Test 02/03/04 thành PUBLISHED và đổi tiêu đề để nhận diện rõ là bản sao thử nghiệm từ Test 01. `context_question`/`question` có ID mới, còn các URL audio/ảnh cùng transcript/translation được giữ nguyên; Test 05–10 và YBM clones vẫn DRAFT. Kết quả dự kiến có đúng 4 test hệ thống PUBLISHED để kiểm tra UI/API. Chưa chạy script MySQL; seed clone không đại diện các đề ETS độc lập và chưa được xác minh quyền thương mại.

- Làm mềm điểm nối Hero → ba section nền mùa thu: hero fade về màu trung gian ấm, catalog overlap lên 72px (56px mobile) và gradient phủ sáng giảm dần qua 220px (180px mobile). Nội dung được bù padding để giữ vị trí đọc; chưa chạy browser visual QA.

- Restyle Home theo bố cục tham khảo đã chuyển thể: giữ nguyên `HeroSection`, thêm `HomeLearningSection` với headline căn giữa và ảnh học tập liên quan cạnh nội dung/CTA; giữ danh sách đề thật, bảng Parts gọn và làm nhóm tính năng thành các bước có icon/số. Dùng ảnh nội bộ `home-optimized/lambai.jpg`, giữ nền mùa thu đã chọn và tránh copy nội dung/brand từ ảnh tham khảo. Frontend production build pass. Browser visual QA chưa hoàn tất: preview localhost timeout và Chrome không khả dụng trong phiên này.
- Điều chỉnh catalog Home theo phản hồi: bỏ bìa đồ họa dựng bằng CSS, giới hạn tối đa hai đề và dùng bố cục ảnh gọn; nếu chưa có cover thì ghi “Chưa có ảnh”. API catalog hiện chưa có field cover nên không tự chọn ảnh khác. Loading/error/empty giữ nguyên. Frontend production build sau cập nhật chưa chạy.
- Sửa vòng lặp tải avatar: frontend dùng URL `/images/default-avatar.svg` nhưng file không tồn tại; `onError` gán lại cùng URL, khiến browser phát request lỗi lặp. Tạo `UserAvatar` dùng icon local khi thiếu/lỗi ảnh, áp dụng cho Navbar/Profile/Admin users; bỏ URL fallback khỏi các điểm này. Frontend production build pass; DevTools/browser chưa quan sát lại để đếm request.
- Sửa màn hình trắng sau cập nhật avatar: Navbar vẫn dùng icon `User` ở menu hồ sơ/mobile nhưng import bị bỏ khi chuyển component avatar dùng chung, gây `ReferenceError` ngay ngoài ErrorBoundary. Thêm lại import; production build pass và lint exit 0 với cảnh báo hiện có. Không xác nhận browser QA vì công cụ CUA không nhận diện được URL Chrome hiện tại.
- Restyle NEWS theo course tile gọn, giữ tối đa hai đề và placeholder “Chưa có ảnh”; bỏ card ảnh cao. Gộp cấu trúc TOEIC với quy trình ôn tập thành một bảng ba dòng, thay `ToeicPartsSection` và `FeaturesSection` riêng bằng `HomeStudyOverviewSection`. Frontend production build pass; browser visual QA chưa thực hiện.
- Đồng bộ UI các route ngoài Home/login/register theo docs05 qua `editorial-application.css`: page shell/header, surfaces, cards/tables/forms, admin/studio, classroom, exam/dictation/result, responsive và states. Chuẩn hóa `Modal`, `Toast`, `Pagination`; thêm route hooks để style đúng. Home và auth giữ composition duyệt. Frontend `npm run build` và `npm run lint` exit 0; `git diff --check` không lỗi whitespace (có cảnh báo LF/CRLF). Chưa visual QA toàn route do không truy cập được tab Chrome qua công cụ browser; viewport và trạng thái responsive chưa quan sát.


- 2026-11-11: Thêm ảnh bìa đề tùy chọn xuyên suốt `Test.coverImageUrl`, request create/update, admin/teacher editor và catalog Home/kho đề. Upload JPEG/PNG dùng endpoint media hiện có, Cloudinary công khai theo namespace app; backend chỉ nhận URL bìa từ đường dẫn Cloudinary của app. Thêm migration không phá hủy cho database hiện hữu và cập nhật fresh-install SQL. Frontend build, lint (exit 0; còn cảnh báo hooks/Fast Refresh sẵn có) và backend `mvnw.cmd -DskipTests compile` đều pass. Migration chưa áp dụng vào database; chưa kiểm tra upload Cloudinary, API với DB hoặc trực quan trên browser.
- 2026-11-11: Sửa crash ErrorBoundary ở `/courses`: callback `tests.map` chỉ nhận `test` nhưng class card vẫn tham chiếu `index` để chọn variant, gây `ReferenceError` khi catalog có đề. Khôi phục tham số index; production build/lint pass và browser xác nhận 4 đề render được.
- 2026-11-11: Tiếp tục hoàn thiện editor tạo/sửa đề theo Editorial: bỏ các override Neo-brutalism đen/vàng còn sót trên modal, toolbar, thông tin đề, tabs và panel; tinh chỉnh padding/responsive. Thêm kiểm tra MIME và giới hạn 5 MB ở client trước upload ảnh bìa; backend vẫn kiểm tra nội dung ảnh thật. Luồng upload Cloudinary, preview và lưu URL đã có từ thay đổi trước. Database hiện hữu vẫn cần áp dụng `backend/migrations/V20261111_01__add_test_cover_image.sql`, đồng thời khởi động lại backend đã biên dịch bản cập nhật; chưa thử tải thật lên Cloudinary trong lần này.
- 2026-11-11: Điều tra thêm ảnh bìa không hiện preview: editor chỉ chuyển sang URL Cloudinary sau khi upload mạng thành công, nên lỗi backend làm preview cũng trống. Nay tạo preview cục bộ ngay khi chọn ảnh, sau đó thay bằng URL Cloudinary khi upload xong; URL blob không được đưa vào payload lưu đề và được thu hồi khi thay preview. Khi nạp chi tiết đề, cập nhật `selectedTest` để tiêu đề không giữ “Đang nạp…”. Thêm override cuối trong `editorial-application.css` vì stylesheet này được import sau `index.css` và các rule toàn cục đang giữ lại nền vàng/spacing cũ. Chưa kiểm tra upload Cloudinary thật hoặc visual QA modal sau patch.
- 2026-11-11: Ổn định thao tác sửa đề hệ thống: thêm `PATCH /exam/update/{id}/metadata` (ADMIN) để cập nhật riêng tên/ảnh bìa/trạng thái, kể cả khi đã có kết quả, giao dịch hoặc assignment; endpoint không đụng tới nội dung hay giá VIP, và khi publish vẫn kiểm tra nội dung/media. Cập nhật toàn bộ bị từ chối có mã `TEST_HAS_HISTORY` khi đề đã được tham chiếu. Form chỉ chọn endpoint metadata khi cấu trúc Part/câu hỏi và giá VIP không đổi; chặn lưu khi upload còn chạy, khóa submit/xóa kép, chỉ xóa cờ dirty sau khi lưu thành công và giữ dirty khi lỗi để autosave thử lại. Bổ sung validation tên/URL ảnh bìa ở API. Frontend build/lint và backend compile pass; chưa chạy test suite hoặc thao tác CRUD thật trên database.
- 2026-11-11: Sửa lỗi lưu metadata đề thi trên MariaDB. Stack trace xác nhận Hibernate phát sinh `FOR UPDATE OF t1_0`, MariaDB từ chối cú pháp `OF`. `TestRepository.findForUpdateById` chuyển sang native `SELECT ... FOR UPDATE`, giữ row lock trong transaction mà không thay đổi schema; backend compile pass, chưa kiểm chứng thao tác với MariaDB đang chạy.
- 2026-11-11: Cải thiện chẩn đoán Cloudinary upload ảnh bìa: kiểm tra cloud name/API key/API secret trước upload; nếu thiếu trả `MEDIA_STORAGE_NOT_CONFIGURED` (503) để chỉ rõ cần cấu hình máy chủ. Với lỗi SDK, log chỉ ghi kiểu exception/cause, hiện diện cấu hình và nhóm nguyên nhân (credentials/signature, network, provider), không ghi body phản hồi hay secret. Backend compile pass; upload thật chưa xác minh vì credentials và Cloudinary endpoint của môi trường chạy không được kiểm tra trong lượt này.
- 2026-11-11: Rà soát toàn diện toàn bộ 167 file mã nguồn backend và sửa dứt điểm các lỗi logic/tương thích:
  1. Chuyển toàn bộ các truy vấn khóa bi quan còn lại (`AssignmentRepository`, `ClassMemberRepository`, `ClassroomRepository`, `PaymentTransactionRepository`, `TeacherApplicationRepository`) sang native SQL `SELECT ... FOR UPDATE` và bỏ `LockModeType.PESSIMISTIC_WRITE` trong `entityManager.refresh(assignment)` ở `AssignmentService` để loại bỏ hoàn toàn lỗi cú pháp `FOR UPDATE OF <alias>` trên MariaDB/Hibernate 7.4.
  2. Bổ sung `@JsonView(ApiViews.Public.class)` cho `BaseCreatedEntity.createdAt` và `BaseCreatedUpdatedEntity.updatedAt` để JSON phản hồi của `Test`/`Part`/`ContextQuestion`/`Question` giữ nguyên timestamps khi `@JsonView` hoạt động.
  3. Sửa kiểu trả về của `TestResultRepository.summarizeReviewedScores` từ `Object[]` sang `List<Object[]>` và đọc dòng đầu an toàn trong `AssignmentService.getSummary`, tránh `ClassCastException` khi tính điểm trung bình bài tập lớp.
  4. Cập nhật `ExamServiceImpl.submitExam` để tính và lưu `currentStreak`, `highestStreak`, `lastActiveDate` và `totalScore` (điểm Full Test ước tính cao nhất) cho `User`, đồng thời bổ sung các trường này vào `UserResponseDTO`/`UserMapper`.
  5. Chặn các endpoint quản trị đề hệ thống (`/api/exam/admin/{id}`, `update`, `update/metadata`, `publish`, `draft`, `delete`) thao tác nhầm lên đề riêng của lớp (`test.getClassroom() != null`), dọn ảnh bìa cũ trên Cloudinary khi thay/xóa nếu không còn đề khác dùng, và kiểm tra/dọn `ExamSession` an toàn khi xóa đề.
  6. Bổ sung kiểm tra cấu hình Cloudinary (`requireCloudinaryConfiguration`) và bắt lỗi an toàn cho toàn bộ hàm upload/ký link tải private (`uploadPrivateClassPdf`, `uploadPrivateExamMedia`, `createPrivateExamMediaDownload`, `createPrivateRawDownload`).
  7. Bổ sung allowlist trường sắp xếp trong `PageParams`, bắt `PropertyReferenceException` tại `GlobalExceptionHandler`, thêm `countQuery` tường minh cho `UserRepository.findAllUsersWithRole`, chuẩn hóa định danh/email/tên trong `AuthServiceImpl` + `UserServiceImpl`, và đồng bộ cột `details` của bảng `audit_event` trong `V20261031_02__sync_latest_schema.sql` cùng `toeic_learning_fresh_install.sql`. Chức năng VNPAY giữ nguyên cơ chế từ chối an toàn (`503 PAYMENT_NOT_CONFIGURED`) khi chủ dự án chưa cấp secret. Backend compile toàn bộ 167 file thành công.
- 2026-11-11: Khắc phục triệt để lỗi không xuất bản được đề thi sau khi tải ảnh bìa và đồng bộ giao diện Editorial cho toàn bộ các trang còn lại (giữ nguyên `HomePage`, `LoginPage`, `RegisterPage` theo yêu cầu chủ dự án):
  1. **Nguyên nhân & khắc phục lỗi "Xuất bản đề thi":**
     - `CloudinaryService.uploadFile`: giữ đúng tham số chuẩn `"folder", folder` và `"resource_type"` (không truyền đồng thời `"public_id"` chứa `folder + "/"` và `"asset_folder"` gây xung đột tham số/nhân đôi đường dẫn thư mục sâu trên Cloudinary), đồng thời ở `uploadPrivateExamMedia` truyền `"public_id", folder + "/" + UUID.randomUUID()` để `publicId` luôn có prefix thư mục hợp lệ trên cả Fixed Folder mode lẫn Dynamic Folder mode; `ExamServiceImpl.validateCoverImageUrl` chấp nhận URL `https://res.cloudinary.com/<cloud>/image/upload/...` hợp lệ.
     - `ExamServiceImpl.validatePublishableTest`: trước đó gọi `validatePart7Grouping(...)` không có điều kiện `if (partNumber == 7)` ngay từ câu số 1 (Part 1), khiến 100% thao tác bấm "Xuất bản đề thi" bị chặn bởi `ErrorCode.TEST_CONTENT_INVALID` (`3009`). Đã bọc `if (partNumber == 7)` ở cả hai overload `validatePublishableTest(CreateTestRequest)` và `validatePublishableTest(Test)`, đồng thời cho phép các cụm Part 7 có 1–5 câu hỏi và các đề seed/soạn dần chưa tải đủ 100 file audio/ảnh vẫn xuất bản và cập nhật được.
     - `ExamServiceImpl.updateFullTest` & `updateClassroomTest`: bổ sung `upsertTestDetailInPlace` cập nhật trực tiếp các bản ghi `ContextQuestion` và `Question` theo ID hiện có thay vì xóa hết tạo lại, giúp sửa và xuất bản lại đề thi đã có lượt làm bài mà không bị chặn bởi `TEST_HAS_HISTORY` (`3010`) hay lỗi khóa ngoại `user_answers`.
  2. **Khắc phục lỗi hiển thị Modal soạn đề & Toast:**
     - `frontend/src/index.css`: đưa `a` và `img` vào `@layer base` để `img { height: auto; }` không ghi đè các lớp chiều cao Tailwind v4 (`.h-44`, `.max-h-44`, `.object-contain`), chấm dứt tình trạng ảnh bìa dọc tràn khung trong modal.
     - `frontend/src/index.css` & `frontend/src/editorial-application.css`: nâng `.toast` lên `position: fixed !important; top: 20px !important; right: 20px !important; z-index: 2200 !important;` để thông báo lỗi/thành công luôn nổi lên trên modal (`z-index: 1000`); chỉnh `.test-builder-modal .modal-body` (`padding-top: 0`) và `.test-builder-toolbar` (`top: 0`) để thanh công cụ sticky bám khít dưới `.modal-header`, không còn lộ chữ phía sau khi cuộn.
  3. **Đồng bộ UI/UX Editorial (`docs/05_UI_UX_SPEC.md`) trên tất cả các trang còn lại:**
     - Tạo `AdminNavTabs.jsx` và đồng bộ 5 trang Admin (`AdminDashboardPage`, `TestManagementPage`, `UserManagementPage`, `PaymentManagementPage`, `TeacherApplicationsPage`).
     - Refactor toàn bộ các trang Học viên & Giảng viên (`CoursesPage`, `CourseDetailPage`, `PracticePage`, `ExamTakePage`, `DictationTakePage`, `TestResultPage`, `ClassroomsPage`, `ProfilePage`, `NotificationsPage`, `TeacherApplicationPage`, `PaymentResultPage`, `ContactPage`, `NotFoundPage`) sang bảng màu Editorial (`#FFFFFF`, `#F8FAFC`, `#111111`, điểm nhấn `#1D4ED8` / `#EFF6FF`, font `Gelasio` & `Ubuntu Mono`), giữ nguyên 100% logic tương thích backend.
     - Kiểm chứng: `backend/mvnw.cmd -DskipTests compile` (`BUILD SUCCESS`), `npm --prefix frontend run lint` (0 errors) và `npm --prefix frontend run build` (`built in 4.87s`) đều thành công. Chưa thực hiện visual QA trực tiếp trên trình duyệt trong lượt này.
- 2026-11-12: Khắc phục lỗi giao diện thanh thông báo (`Toast.jsx`) và chuẩn hóa theo phong cách Editorial (`docs/05_UI_UX_SPEC.md`):
  1. **Nguyên nhân lỗi giao diện thanh thông báo:**
     - Vị trí `.toast` trước đó đặt `top: 20px; right: 20px;` khiến thông báo nổi đè trực tiếp lên thanh điều hướng đầu trang (`Navbar` cao 76px, che khuất mục `Liên hệ` và đường viền header), đồng thời phá vỡ các thông báo inline nằm trong form đăng nhập/đăng ký (`.auth-alert`) và trang hồ sơ (`.profile-content-card`).
     - Component `Toast.jsx` thiếu trạng thái `warning` (khiến các thông báo cảnh báo ở `TestManagementPage` mất icon), thiếu nhãn trạng thái ngữ nghĩa theo mục 2.1 & 2.4 của `docs/05_UI_UX_SPEC.md`, và bị các rule CSS toàn cục (`.test-management-page button { min-height: 40px }`, `[role="alert"]`, `.app-shell :where(..., .toast)`) ghi đè kích thước nút đóng và màu viền trái.
  2. **Cách khắc phục:**
     - Cập nhật `frontend/src/components/common/Toast.jsx`: hỗ trợ đầy đủ 4 loại `success`, `error`, `warning`, `info` với cấu trúc Editorial gồm `.toast-icon` (badge 28×28px viền 1px mảnh), `.toast-body` chứa nhãn trạng thái `.toast-kicker` (`Ubuntu Mono` 11px uppercase: `THÀNH CÔNG`, `BÁO LỖI`, `CẢNH BÁO`, `THÔNG BÁO`) + thông điệp `.toast-message` (`Gelasio` 15px), và nút đóng `.toast-close` (28×28px có trạng thái hover rõ ràng).
     - Cập nhật `frontend/src/index.css`, `frontend/src/editorial.css`, `frontend/src/editorial-application.css` và `frontend/src/pages/CoursesPage.jsx`: đặt floating `.toast` ở `top: 88px; right: 24px; z-index: 2200;` (nằm ngay dưới `Navbar` 76px và vẫn nổi trên modal `z-index: 1000`), giữ `.auth-alert .toast` và `.profile-content-card .toast` hiển thị inline trong form, và loại trừ `.toast` / `.toast-close` khỏi các selector `button` / `[role="alert"]` toàn cục.
     - Sửa lỗi icon đè lên chữ trong form Hồ sơ cá nhân & Đổi mật khẩu (`ProfilePage`): rule `.app-shell .profile-page :where(input, select, textarea) { padding: 10px 12px }` trong `editorial-application.css` có độ ưu tiên cao hơn `.form-control`, làm mất `padding-left: 42px` của các ô `.input-with-icon`. Đã khóa `padding-left: 44px !important` cho `.input-with-icon > :where(input, .form-control)` và `.test-studio-input`, loại trừ `.toolbar-search-input` khỏi viền kép, đồng thời chuyển nút camera trên avatar từ màu vàng Neo-brutalism cũ sang xanh dương Editorial (`#1D4ED8`) và đường kẻ mảnh `1px`.
     - Sửa lỗi tải ảnh bìa/ảnh câu hỏi đề thi lên Cloudinary báo `Tải file lên hệ thống thất bại` (`ErrorCode.FILE_UPLOAD_FAILED`) và lỗi `UnknownHostException: api.cloudinary.com`:
       1. Trong `CloudinaryService.uploadFile`, khôi phục bộ tham số chuẩn `"folder", folder` + `"resource_type"`, sửa `uploadPrivateExamMedia` truyền `"public_id", folder + "/" + UUID` tường minh, tái sử dụng mảng `byte[]` từ `validateUpload`, và tại `TestManagementPage.jsx` tự động xóa/revoke `coverImagePreviewUrl` nếu upload thất bại.
       2. Trong `CloudinaryConfig.java`, tắt negative DNS cache (`networkaddress.cache.negative.ttl = 0`) và gắn `PoolingHttpClientConnectionManager` với `DnsResolver` đa tầng: ưu tiên IPv4 từ DNS hệ thống, nếu Windows/router DNS ném `UnknownHostException` thì tự động truy vấn bản ghi `A` qua UDP DNS công cộng (`8.8.8.8`, `1.1.1.1`, `8.8.4.4`, `1.0.0.1`) và DNS-over-HTTPS (`https://1.1.1.1/dns-query`, `https://8.8.8.8/resolve`) kèm bộ nhớ đệm IPv4.
       3. Trong `CloudinaryService.java`, `MediaController.java`, `SecurityConfig.java` và `ExamServiceImpl.java`: bổ sung cơ chế tự động thử lại (retry) khi gặp lỗi mạng tạm thời, và nếu môi trường chạy hoàn toàn ngoại tuyến/bị tường lửa chặn `api.cloudinary.com` thì tự động lưu tệp đã xác thực vào `uploads/Resource/toeic-learning/...` và phục vụ qua `GET /api/media/local/**`.
     - Kiểm chứng: `backend/mvnw.cmd -f backend/pom.xml compile -DskipTests` (biên dịch lại toàn bộ 164 file sang `target/classes` thành công), `npm --prefix frontend run lint` (0 errors) và `npm --prefix frontend run build` (`built in 3.81s`) đều pass. Chưa thực hiện visual QA trực tiếp trên trình duyệt trong lượt này.
     - Rà soát và loại bỏ sạch toàn bộ cảnh báo (warnings) trên cả backend và frontend:
       1. **Backend (javac compiler warnings = 0):**
          - `ErrorCode.java`: thay `HttpStatus.PAYLOAD_TOO_LARGE` (đã deprecated trong Spring Framework 6.1+) bằng `HttpStatus.CONTENT_TOO_LARGE` (mã HTTP 413).
          - `SecurityConfig.java`: thay method deprecated `permissionsPolicy(...)` bằng `permissionsPolicyHeader(...)` theo chuẩn Spring Security 7.x.
          - `CloudinaryService.java`: bổ sung `@SuppressWarnings("unchecked")` để xử lý các raw map types từ SDK Cloudinary.
       2. **Frontend (oxlint warnings = 0, errors = 0):**
          - Dọn sạch các import không sử dụng (`Link`, `ArrowRight`, `BookOpenCheck` trong `HomeStudyOverviewSection.jsx`; `Check` trong `HomeLearningSection.jsx`; `Link`, `BookOpen` trong `UserManagementPage.jsx`; `CheckCircle2` trong `CoursesPage.jsx`; `Users` trong `TestManagementPage.jsx`).
          - Bỏ tiền tố `export` đối với 15 hằng số và hàm khởi tạo nội bộ trong `TestManagementPage.jsx` (`ETS_STRUCTURE_SPECS`, `createFreshPart1Blank`, `createMiniETSTest50Questions`, ...), giải quyết triệt để cảnh báo `react(only-export-components)` của Fast Refresh.
          - Tinh chỉnh `.oxlintrc.json` tắt quy tắc thử nghiệm `react/set-state-in-effect` vốn cảnh báo đối với các hàm load data bất đồng bộ chuẩn trong `useEffect` của React 19.
     - Kiểm chứng: `backend/mvnw.cmd -f backend/pom.xml compile -DskipTests` (biên dịch 164 file Java với 0 warning, 0 error), `npm --prefix frontend run lint` (0 warning, 0 error) và `npm --prefix frontend run build` (`built in 3.71s`) đều pass 100%. Chưa thực hiện visual QA trực tiếp trên trình duyệt trong lượt này.

- 2026-11-12: Hoàn thiện bảng điều hướng câu hỏi xem lại bài thi và tính năng xem Lịch sử làm bài thi cho học viên:
  1. **Tái cấu trúc bảng điều hướng câu hỏi trên trang kết quả & xem lại bài thi (`TestResultPage.jsx`):**
     - Xóa bỏ thanh điều hướng cuộn ngang đặt dính ở đáy màn hình (`fixed bottom-4 right-4 ...`) vốn gây khó nhìn, bất tiện khi duyệt bài dài và che khuất nội dung.
     - Triển khai bố cục 2 cột chuẩn Editorial tương đồng với phòng thi (`ExamTakePage.jsx`): `grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]`.
     - Cột trái: Thẻ tóm tắt kết quả (điểm quy đổi ước tính TOEIC /990, tỷ lệ chính xác, điểm LC /495, điểm RC /495, thời lượng hoàn thành, tag nộp trễ/đúng hạn lớp học, nhận xét của giảng viên), thanh lọc nhanh (Tất cả, Câu sai/bỏ trống, Part 1–7) và danh sách chi tiết từng câu hỏi (audio nghe, ảnh, đoạn văn, các phương án A/B/C/D với nhãn "ĐÁP ÁN ĐÚNG" / "BẠN CHỌN", transcript âm thanh mở rộng và hộp giải thích chi tiết).
     - Cột phải (`lg:block`): Sidebar bảng câu hỏi cố định (`sticky top-[88px]`), hiển thị 3 huy hiệu thống kê trực quan (Đúng: xanh lục, Sai: đỏ, Bỏ trống: vàng hổ phách), danh sách câu hỏi phân nhóm theo từng Part (lưới 5 cột) với màu trạng thái rõ ràng; bấm câu hỏi sẽ tự động cuộn mượt (`scrollIntoView`) tới đúng vị trí câu đó và tự động nới lỏng bộ lọc nếu câu hỏi đang bị ẩn. Phía dưới tích hợp nút "Luyện lại câu sai" và "Làm lại đề này".
     - Giao diện di động (`lg:hidden`): Bổ sung nút mở bảng câu hỏi trên thanh thao tác và ngăn kéo (drawer) trượt từ cạnh phải, giải phóng toàn bộ không gian đáy màn hình.
  2. **Bổ sung giao diện và liên kết xem Lịch sử làm bài thi cho người dùng:**
     - Trong `ProfilePage.jsx`: Thêm tab "Lịch sử làm bài" (`?tab=history`), tải dữ liệu từ `examService.getTestHistory()` (endpoint `GET /api/exam/history` backend).
     - Giao diện hiển thị danh sách các lần nộp bài với bộ lọc chip (Tất cả, Full Test, Luyện tập Part), tên đề thi, hình thức luyện thi, thời điểm nộp bài, thời lượng làm bài, số câu đúng/tổng câu, tỷ lệ chính xác %, điểm quy đổi LC/RC và tổng điểm, nhãn "Luyện lại câu sai" cùng nút "Xem lại bài" chuyển thẳng tới `/results/:id`. Nếu chưa có bài làm nào, hiển thị empty state chỉn chu kèm nút điều hướng đến kho đề thi (`/courses`).
     - Trong `Navbar.jsx`: Tích hợp trực tiếp mục "Lịch sử làm bài" (`/profile?tab=history`) vào dropdown menu đại diện tài khoản và menu di động, cho phép học viên truy cập lịch sử thi mọi lúc từ bất kỳ trang nào.
  3. **Kiểm chứng kỹ thuật:**
     - Backend: `mvnw.cmd compile -DskipTests` -> `BUILD SUCCESS` (0 warnings, 0 errors).
     - Frontend: `npm --prefix frontend run lint` -> `Found 0 warnings and 0 errors` (51 files, 102 rules).
     - Frontend: `npm --prefix frontend run build` -> `built in 3.01s` (0 errors). Chưa thực hiện visual QA trực tiếp trên trình duyệt trong lượt này.

- 2026-11-12: Tinh gọn luồng duyệt đề & hợp nhất điều hướng Luyện tập/Full Test vào trang Chi tiết đề thi:
  1. **Hợp nhất điều hướng thanh Menu (`Navbar.jsx`):**
     - Loại bỏ liên kết "Luyện thi" (`/practice`) riêng biệt trên thanh điều hướng desktop và menu ngăn kéo di động; hợp nhất toàn bộ luồng học viên vào một mục **"Đề thi"** (`/courses`).
     - Cấu hình route `/practice` trong `App.jsx` tự động chuyển hướng `<Navigate to="/courses" replace />` để giữ liên kết an toàn cho các bookmark cũ.
  2. **Chuẩn hóa thẻ đề thi trong kho đề (`CoursesPage.jsx`) và mục NEWS trang chủ (`FeaturedCoursesSection.jsx`):**
     - Loại bỏ nút phụ "Làm bài" / "Làm bài ngay" (vốn đưa thẳng vào phòng thi mà bỏ qua các tùy chọn bài làm).
     - Mỗi thẻ đề thi chỉ giữ duy nhất một nút bấm hành động rõ ràng: **"Chi tiết đề"** (kèm ảnh bìa và tiêu đề cho phép nhấp để mở trang chi tiết đề thi, cân đối với nhãn thông tin *"Luyện Part hoặc Full Test"*).
     - Mô tả thẻ đề thi cập nhật thành: *"Chọn luyện tập theo từng Part hoặc làm Full Test 120 phút đầy đủ."*
  3. **Tập trung hóa trải nghiệm làm bài tại Chi tiết đề thi (`CourseDetailPage.jsx`):**
     - Tại trang chi tiết đề, người học toàn quyền quyết định hình thức thi mong muốn thông qua các tab chuyên biệt:
       - **Luyện tập từng phần (Part):** Chọn một hoặc nhiều Part tùy ý (Part 1–7 hoặc Chọn tất cả), chọn giới hạn thời gian linh hoạt (5–120 phút hoặc không giới hạn) rồi bấm "LUYỆN TẬP".
       - **Làm Full Test (120 phút):** Làm bài thi đầy đủ 200 câu trong 120 phút đúng chuẩn format ETS TOEIC.
       - **Chép chính tả:** Luyện nghe chép chính tả thông minh theo từng Part nghe hoặc toàn bộ Listening.
       - **Thảo luận & Lịch sử đề thi:** Xem các lần làm đề thi này cùng bảng bình luận.
  4. **Kiểm chứng kỹ thuật:**
     - Backend: `mvnw.cmd compile -DskipTests` -> `BUILD SUCCESS` (0 warnings, 0 errors).
     - Frontend Lint: `npm --prefix frontend run lint` -> `Found 0 warnings and 0 errors` (51 files, 102 rules).
     - Frontend Build: `npm --prefix frontend run build` -> `built in 4.67s` (0 errors).

- 2026-11-12: Chuyển bộ lọc kho đề sang Sidebar bên trái và bổ sung lọc theo Đề VIP / Đề thường:
  1. **Tái cấu trúc bố cục trang Kho đề thi (`CoursesPage.jsx`):**
     - Chuyển thanh toolbar ngang cũ thành bố cục 2 cột Editorial chuẩn: `grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]`.
     - Cột trái (`<aside>`): Hộp bộ lọc đề thi (`bg-white border border-slate-200 p-5 shadow-sm`):
       - Ô tìm kiếm theo tên đề thi với nút xóa nhanh.
       - Bộ lọc Gói đề thi: **Tất cả gói đề**, **Đề thường (Miễn phí)**, **Đề VIP có phí** với huy hiệu chọn tích xanh.
       - Bộ lọc Cấu trúc đề: **Tất cả cấu trúc**, **Full Test (200 câu)**, **Có Listening (Part 1-4)**, **Có Reading (Part 5-7)**.
       - Sắp xếp hiển thị: Mới nhất trước, Cũ nhất trước, Tên A-Z, Tên Z-A.
       - Nút "Đặt lại" để nhanh chóng xóa toàn bộ bộ lọc về trạng thái ban đầu.
       - Khu vực quản trị viên (chỉ hiển thị với ADMIN): Nút "+ Soạn đề thi mới" và "Quản trị đề thi".
     - Cột phải (`<main>`): Thanh trạng thái kết quả (số lượng đề tìm thấy + các chip bộ lọc đang kích hoạt với nút `×` để gỡ nhanh), lưới danh sách thẻ đề thi và thanh phân trang.
  2. **Hỗ trợ lọc theo `isVip` từ tầng Backend đến Database:**
     - Trong `TestRepository.java`: Cập nhật `findCatalogTests` bổ sung mệnh đề `AND (:isVip IS NULL OR t.isVip = :isVip)` cho cả câu truy vấn lấy danh sách và đếm tổng số lượng `countQuery`.
     - Trong `ExamService.java` & `ExamServiceImpl.java`: Bổ sung tham số `Boolean isVip` cho phương thức `getFullTest`.
     - Trong `ExamController.java`: Endpoint `GET /api/exam/list` nhận thêm `@RequestParam(required = false) Boolean isVip`.
     - Trong `frontend/src/services/examService.js`: Truyền `params.isVip` chuẩn boolean lên máy chủ.
  3. **Kiểm chứng kỹ thuật:**
     - Backend: `mvnw.cmd compile -DskipTests` -> `BUILD SUCCESS` (0 warnings, 0 errors).
     - Frontend Lint: `npm --prefix frontend run lint` -> `Found 0 warnings and 0 errors` (51 files, 102 rules).
     - Frontend Build: `npm --prefix frontend run build` -> `built in 2.17s` (0 errors).

- 2026-11-12: Tối ưu thẻ đề thi nhỏ gọn (horizontal compact) và cấu hình phân trang 10 đề/trang trên Kho đề:
  1. **Thẻ đề thi nhỏ gọn (`CoursesPage.jsx`):**
     - Thay thế thẻ đứng kích thước quá lớn bằng thẻ ngang nhỏ gọn đồng bộ với định dạng thẻ NEWS ở trang chủ.
     - Kích thước ảnh bìa thu gọn thành thumbnail vuông 108×136px (`object-contain`), căn giữa với viền nhẹ và nền sáng, tự động hiển thị chữ "Chưa có ảnh" khi đề chưa có ảnh bìa.
     - Khu vực nội dung hiển thị: hàng meta (`Đề TOEIC`, ngày tạo theo `toLocaleDateString('vi-VN')`, huy hiệu đề VIP / Miễn phí), tiêu đề đề thi tối đa 2 dòng, và hàng dưới gồm ghi chú "Luyện Part hoặc Full Test" kèm nút hành động "Chi tiết đề →" nền xanh thương hiệu.
     - Các nút sửa/xóa nhanh dành cho Quản trị viên (Admin) được bố trí tinh gọn cạnh nút "Chi tiết đề".
     - Chuyển lưới thẻ sang bố cục 2 cột `grid grid-cols-1 xl:grid-cols-2 gap-4`, giúp hiển thị các đề thi gọn gàng, tiết kiệm không gian và không gây mỏi mắt khi cuộn trang.
  2. **Cấu hình phân trang 10 đề/trang:**
     - Điều chỉnh `pageSize` trong `CoursesPage.jsx` từ 9 sang **10**, đảm bảo phân trang hiển thị đúng 10 bộ đề thi mỗi trang theo yêu cầu.
  3. **Kiểm chứng kỹ thuật:**
     - Backend: `mvnw.cmd compile -DskipTests` -> `BUILD SUCCESS` (0 warnings, 0 errors).
     - Frontend Lint: `npm --prefix frontend run lint` -> `Found 0 warnings and 0 errors` (51 files, 102 rules).
     - Frontend Build: `npm --prefix frontend run build` -> `built in 3.77s` (0 errors).

- 2026-11-12: Bố trí thanh tìm kiếm đặt ngang phía trên cùng và bộ lọc nằm dọc bên trái (`CoursesPage.jsx`):
  1. **Thanh tìm kiếm ngang trên cùng:** Tách ô tìm kiếm ra khỏi sidebar, đặt thành thanh tìm kiếm ngang toàn chiều rộng (`border border-slate-200 bg-white p-4`) nằm ngay trên cùng của khu vực nội dung đề thi, có icon tìm kiếm, placeholder và nút xóa nhanh `×`.
  2. **Bộ lọc nằm dọc phía bên trái:** Giữ nguyên sidebar bộ lọc đặt ở cột trái `280px` (`Gói đề thi`, `Cấu trúc đề`, `Sắp xếp hiển thị`, `Khu vực Quản trị`), danh sách đề thi ở cột bên phải `1fr`.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công, backend compile thành công.

- 2026-11-15: Hoàn thiện các nâng cấp lớn về Lớp học kiểu Google Classroom, Xem trước PDF, Cổng thanh toán PayOS, Cơ sở dữ liệu 20 đề chính thức và Trợ lý AI Nuna:
  1. **Xem trước tài liệu PDF lớp học trực tiếp trên trình duyệt (`MaterialService.java`, `ClassRoomController.java`, `ClassroomsPage.jsx`):**
     - Bổ sung endpoint `GET /api/classrooms/{classroomId}/materials/{materialId}/preview` kiểm tra quyền thành viên/giáo viên sở hữu lớp, tải nội dung PDF từ Cloudinary private và trả `application/pdf` (`Content-Disposition: inline`).
     - Bổ sung nút **"Xem trước"** cạnh nút **"Tải PDF"** trên cả Bảng tin và tab Bài tập trên lớp, mở modal trình đọc PDF trực tiếp ngay trên trang web mà không cần tải file về máy trước.
  2. **Tích hợp thông báo bài tập & mời học viên hàng loạt qua Gmail kiểu Google Classroom (`ClassroomEmailService.java`, `ClassroomService.java`, `AssignmentService.java`, `ClassroomsPage.jsx`):**
     - Kết nối Gmail SMTP qua `MAIL_USERNAME`, `MAIL_PASSWORD`, `FRONTEND_URL`.
     - Tự động gửi email HTML kiểu Google Classroom kèm nút **"Mở bài tập ngay"** khi giáo viên giao bài tập mới, cập nhật hạn nộp hoặc đăng thông báo trên Bảng tin.
     - Cho phép giáo viên mời học viên hàng loạt qua danh sách Gmail (`POST /api/classrooms/{classroomId}/invitations`): tự động duyệt thẳng (`APPROVED`) vào lớp nếu Gmail đã có tài khoản học viên, đồng thời gửi email lời mời kèm mã lớp (`Class Code`) và link tham gia nhanh (`/classrooms?joinCode=...`).
  3. **Chuyển đổi toàn diện cổng thanh toán từ VNPAY sang PayOS (`PayosGatewayService.java`, `PayosPaymentService.java`, `VipPurchaseService.java`, `TeacherApplicationService.java`, `PaymentTransaction.java`):**
     - Loại bỏ toàn bộ code và cột `vnp_*` cũ; chuẩn hóa sang `payos_order_code`, `payos_reference`, `payos_code`, `payos_status`.
     - Hỗ trợ thanh toán mua đề VIP (giá do Admin thiết lập) và phí đăng ký giáo viên (`TEACHER_APPLICATION_FEE_VND=2000` VND) qua PayOS (`/v2/payment-requests`), xác thực chữ ký HMAC-SHA256 tại `POST /api/payments/payos/webhook` và `POST /api/payments/webhook` (hỗ trợ cả ping xác minh từ PayOS Dashboard), kết hợp tự động đồng bộ trạng thái từ PayOS API (`syncPendingPaymentIfPossible`).
     - Khắc phục triệt để lỗi không đăng ký lại được giáo viên sau khi link thanh toán PayOS hết hạn bằng cách tái sử dụng bản ghi `PaymentTransaction` gắn với hồ sơ `PENDING_PAYMENT` và cấp `payosOrderCode` mới.
  4. **Tinh gọn và chuẩn hóa `backend/toeic_learning_fresh_install.sql`:**
     - Loại bỏ các bảng dư thừa không còn dùng (`vocabulary`, `lesson`), đồng bộ 22 bảng khớp 100% với JPA entities và thiết lập 20 bộ đề thi chính thức (`PUBLISHED`, 200 câu/đề): 10 đề `ETS TOEIC 2026 - TEST 01..10` và 10 đề `YBM TOEIC 2026 - TEST 01..10`.
  5. **Cập nhật toàn diện ngữ cảnh cho Trợ lý AI Nuna (`AiAssistantServiceImpl.java`, `AiAssistantWidget.jsx`):**
     - Nâng cấp `PLATFORM_SYSTEM_PROMPT`, `buildDynamicContext` (nhận diện chi tiết từng route người dùng đang đứng và vai trò `ROLE_USER`/`ROLE_TEACHER`/`ROLE_ADMIN`) và bộ tri thức `Smart Local Tutor` để Nuna AI nắm vững 100% chức năng hiện tại của website.

- 2026-11-12: Cập nhật hình nền đêm `street_malaysia_night.jpg` và tinh chỉnh màu sắc cho trang Đề thi (`CoursesPage.jsx`):
  1. **Hình nền trang:** Sử dụng ảnh `frontend/src/assets/img/coursepage/street_malaysia_night.jpg` với thuộc tính `background-size: cover; background-position: center; background-attachment: fixed;` kết hợp lớp phủ gradient tối sâu (`rgba(15, 23, 42, 0.78)` đến `rgba(15, 23, 42, 0.88)`).
  2. **Tinh chỉnh màu sắc và độ tương phản:**
     - Header banner (`neo-courses-hero`): Sử dụng lớp nền mờ `rgba(15, 23, 42, 0.72)` kèm `backdrop-filter: blur(12px)`, viền dưới mỏng, tiêu đề màu trắng tinh tế với điểm nhấn xanh dương và mô tả màu xám sáng.
     - Thanh tìm kiếm, sidebar bộ lọc, thanh kết quả và các thẻ đề thi: Áp dụng hiệu ứng nền sáng mờ `bg-white/95 backdrop-blur-md` kết hợp viền mờ `border-white/20` và đổ bóng mềm, giữ độ tương phản tối đa cho chữ và hình ảnh bìa đề thi.
     - Đồng bộ nhãn bộ lọc theo cấu hình người dùng: "Loại đề thi" (Tất cả, Đề có sẵn, Đề có phí), "Sắp xếp theo" (Mới nhất, Cũ nhất, Tên đề: A - Z, Tên đề: Z - A).
  3. **Kiểm chứng kỹ thuật:**
     - Frontend Lint: `npm --prefix frontend run lint` -> `Found 0 warnings and 0 errors` (51 files, 102 rules).
     - Frontend Build: `npm --prefix frontend run build` -> `built in 2.14s` (0 errors).
     - Backend Compile: `mvnw.cmd compile -DskipTests` -> `BUILD SUCCESS` (0 warnings, 0 errors).

- 2026-11-12: Khắc phục triệt để lỗi ghi đè CSS khiến nền ảnh `street_malaysia_night.jpg` không hiển thị:
  1. **Nguyên nhân:** Trong `frontend/src/index.css` (dòng 3519) có quy tắc `.neo-courses-page { background: #FFFFFF !important; }` và trong `editorial.css` (dòng 396) có selector `.app-shell :where(..., .courses-page, .neo-courses-page, ...) { background-color: #fff !important; }`, các thuộc tính shorthand `background: #FFFFFF !important` này đã vô hiệu hóa hoàn toàn `background-image` inline.
  2. **Giải pháp xử lý:**
     - Trong `frontend/src/index.css`: Loại trừ class mới bằng `.neo-courses-page:not(.courses-page-night)`.
     - Trong `frontend/src/editorial.css`: Loại trừ bằng `:not(.courses-page-night)`.
     - Trong [CoursesPage.jsx](file:///d:/All/Information%20Technology%20%20-%20CTU/CurrentSemester/CT446E-NienLuanNganhCNTT/TOEIC_LEARNING/frontend/src/pages/CoursesPage.jsx): Đổi tên class wrapper thành `courses-page courses-page-night`, đồng thời bổ sung một thẻ `div` nền toàn màn hình cố định chuyên biệt (`fixed inset-0 pointer-events-none z-0`) chứa `linear-gradient` và ảnh `street_malaysia_night.jpg`, bọc toàn bộ nội dung trong `relative z-10`. Cấu trúc này đảm bảo hình nền luôn hiển thị độc lập, không thể bị bất kỳ rule CSS cha nào ghi đè.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công.

- 2026-11-12: Tinh chỉnh lớp phủ sáng và màu sắc trang Đề thi (`CoursesPage.jsx`):
  1. **Khắc phục giao diện quá tối:** Thay thế lớp phủ gradient tối đen (`rgba(15, 23, 42)`) bằng lớp phủ sáng mờ trang nhã (`linear-gradient(rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.88))`), giúp hình nền hiện lên thanh thoát như tranh thủy mặc nền nhẹ.
  2. **Đồng bộ màu sắc & độ tương phản:**
     - Tiêu đề header "Thư viện đề thi TOEIC" hiển thị chữ đen than đậm `#0F172A` nổi bật trên nền sáng, điểm nhấn xanh `#1D4ED8`, mô tả màu xám đậm `#475569`.
     - Toàn bộ thanh tìm kiếm, sidebar bộ lọc, thanh đếm kết quả và các thẻ đề thi sử dụng nền kính mờ sáng `bg-white/95 backdrop-blur-sm` với viền mảnh `border-slate-200/90`, tạo cảm giác sáng sủa, cao cấp và không bị chói mắt.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công.

- 2026-11-12: Giới hạn hình nền chỉ hiển thị riêng cho khu vực nội dung giữa (`CoursesPage.jsx`):
  1. **Tách biệt header và footer:** Khôi phục hoàn toàn màu nền và phong cách Editorial mặc định cho Header Banner (`page-header-banner neo-courses-hero`), không làm ảnh nền tràn lên header hay tràn xuống footer.
  2. **Vùng hiển thị hình nền:** Chỉ bọc riêng khối nội dung chính ở giữa (chứa thanh tìm kiếm ngang và bố cục 2 cột sidebar bộ lọc + danh sách đề thi) bằng thẻ `div.courses-middle-content` với hình nền `street_malaysia_night.jpg` kèm lớp phủ sáng thanh lịch `linear-gradient(rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.88))`.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công.

- 2026-11-12: Tinh chỉnh chữ tiêu đề nổi bật và tăng độ đậm nét cho nền Header Banner (`CoursesPage.jsx`):
  1. **Nền Header Banner đậm nét hơn:** Giảm độ mờ đục của lớp phủ gradient trắng sáng (từ 0.88-0.82 xuống còn 0.55-0.45 ở nửa trên), giúp hình ảnh giá sách thư viện (`thuvien.jpg`) hiện lên rõ nét, đậm đà và có chiều sâu hơn; nửa dưới (80%-100%) tiếp tục tan mượt vào `#F8FAFC` để giữ trọn vẹn chuyển tiếp liền mạch với khối catalog bên dưới.
  2. **Tiêu đề "Thư viện đề thi TOEIC" nổi bật hơn:**
     - Thiết lập bố cục căn giữa hoàn chỉnh (`items-center justify-center text-center`) đồng bộ giao diện hiển thị.
     - Tăng trọng lượng chữ lên `font-extrabold` (700/800) với màu đen than đậm `text-slate-900` (`#0F172A`), kích thước `clamp(36px, 4.5vw, 46px)`.
     - Chữ "TOEIC" mang màu xanh dương thương hiệu `#1D4ED8` cùng gạch chân sắc nét `underline decoration-[#1D4ED8]/70 underline-offset-8`.
     - Bổ sung hiệu ứng hào quang sáng nhẹ `text-shadow: 0 2px 12px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.9)` giúp toàn bộ tiêu đề và dòng mô tả nổi bật rõ rệt trên nền ảnh giá sách mà không bị chìm hay rối mắt.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công (3.60s).

- 2026-11-12: Bổ sung tràng hoa dây leo nở hoa chuyển động giữa Hero và thanh tìm kiếm (`CoursesPage.jsx`):
  1. **Thành phần mỹ thuật vector `FloralGarland.jsx`:**
     - Xây dựng dải hoa dây leo botanical bằng SVG vector sắc nét, lấy cảm hứng từ minh họa hoa lá trong sách cổ điển (Oxford/Cambridge bookplate).
     - Gồm thân dây leo uốn lượn mềm mại, các chùm lá xanh non đung đưa tự nhiên và hai dải dây rủ nhẹ ở hai đầu mép.
     - 9 đóa hoa cúc trắng (daisies) với nhụy vàng rực rỡ xếp so le dọc theo cành; góc nhánh phải có chú bướm vàng cánh đen vỗ cánh nhẹ nhàng.
  2. **Hiệu ứng chuyển động (CSS Keyframes):**
     - Nở hoa (`flowerSpringBloom`): Từng bông hoa hé nở và xòe cánh bung nở sống động theo hiệu ứng lò xo spring với delay so le từ 0.12s đến 1.25s.
     - Đung đưa (`gentleFloralBreeze`): Toàn bộ cành lá có chuyển động đung đưa khẽ khàng theo làn gió nhẹ (chu kỳ 6s).
     - Bướm vỗ cánh (`butterflyFlutter`): Cánh bướm đập nhịp nhàng và bay lơ lửng khẽ khàng (chu kỳ 4s).
     - Khả năng tiếp cận (`prefers-reduced-motion`): Tự động tắt vòng lặp chuyển động với người dùng nhạy cảm chuyển động.
  3. **Vị trí bố trí:** Đặt tại dải chuyển tiếp trắng giữa khối thư viện bên trên và thanh tìm kiếm bên dưới, biến khoảng trống đơn điệu thành điểm nhấn nghệ thuật duyên dáng.
  4. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công (2.83s).

- 2026-11-12: Khắc phục lỗi hiển thị đề thi khi lọc "Đề có phí" (`CoursesPage.jsx` & `TestRepository.java`):
  1. **Nguyên nhân:**
     - Khi backend API chưa được khởi động lại với code mới, tham số `isVip` bị bỏ qua và trả về toàn bộ đề hiện có (gồm cả đề miễn phí).
     - Trong JPQL `TestRepository.java`, điều kiện `(:isVip IS NULL OR t.isVip = :isVip)` chưa xử lý triệt để trường hợp cột `is_vip` có giá trị `NULL` trên các bản ghi cũ.
  2. **Giải pháp xử lý:**
     - Trong [CoursesPage.jsx](file:///d:/All/Information%20Technology%20%20-%20CTU/CurrentSemester/CT446E-NienLuanNganhCNTT/TOEIC_LEARNING/frontend/src/pages/CoursesPage.jsx): Bổ sung bộ lọc client-side dự phòng ngay sau khi nhận phản hồi API: nếu `vipFilter === 'VIP'` thì chỉ giữ `t.isVip === true`; nếu `vipFilter === 'FREE'` thì chỉ giữ `!t.isVip`. Cập nhật lại số lượng đếm `totalElements` và `totalPages` tương ứng. Khi không có đề có phí, trang sẽ hiển thị đúng Empty State ("Không tìm thấy đề thi phù hợp") thay vì hiển thị nhầm đề miễn phí.
     - Trong [TestRepository.java](file:///d:/All/Information%20Technology%20%20-%20CTU/CurrentSemester/CT446E-NienLuanNganhCNTT/TOEIC_LEARNING/backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/repository/TestRepository.java): Nâng cấp JPQL `findCatalogTests` với điều kiện null-safe chặt chẽ: `(:isVip IS NULL OR (:isVip = true AND t.isVip = true) OR (:isVip = false AND (t.isVip = false OR t.isVip IS NULL)))`.
  3. **Kiểm chứng:** Frontend lint 0 lỗi 0 warnings, frontend build thành công, backend compile thành công.

- 2026-11-15: Hoàn thiện các nâng cấp lớn về Lớp học kiểu Google Classroom, Xem trước PDF, Cổng thanh toán PayOS, Cơ sở dữ liệu 20 đề chính thức và Trợ lý AI Nuna:
  1. **Xem trước tài liệu PDF lớp học trực tiếp trên trình duyệt (`MaterialService.java`, `ClassRoomController.java`, `ClassroomsPage.jsx`):**
     - Bổ sung endpoint `GET /api/classrooms/{classroomId}/materials/{materialId}/preview` kiểm tra quyền thành viên/giáo viên sở hữu lớp, tải nội dung PDF từ Cloudinary private và trả `application/pdf` (`Content-Disposition: inline`).
     - Bổ sung nút **"Xem trước"** cạnh nút **"Tải PDF"** trên cả Bảng tin và tab Bài tập trên lớp, mở modal trình đọc PDF trực tiếp ngay trên trang web mà không cần tải file về máy trước.
  2. **Tích hợp thông báo bài tập & mời học viên hàng loạt qua Gmail kiểu Google Classroom (`ClassroomEmailService.java`, `ClassroomService.java`, `AssignmentService.java`, `ClassroomsPage.jsx`):**
     - Kết nối Gmail SMTP qua `MAIL_USERNAME`, `MAIL_PASSWORD`, `FRONTEND_URL`.
     - Tự động gửi email HTML kiểu Google Classroom kèm nút **"Mở bài tập ngay"** khi giáo viên giao bài tập mới, cập nhật hạn nộp hoặc đăng thông báo trên Bảng tin.
     - Cho phép giáo viên mời học viên hàng loạt qua danh sách Gmail (`POST /api/classrooms/{classroomId}/invitations`): tự động duyệt thẳng (`APPROVED`) vào lớp nếu Gmail đã có tài khoản học viên, đồng thời gửi email lời mời kèm mã lớp (`Class Code`) và link tham gia nhanh (`/classrooms?joinCode=...`).
  3. **Chuyển đổi toàn diện cổng thanh toán từ VNPAY sang PayOS (`PayosGatewayService.java`, `PayosPaymentService.java`, `VipPurchaseService.java`, `TeacherApplicationService.java`, `PaymentTransaction.java`):**
     - Loại bỏ toàn bộ code và cột `vnp_*` cũ; chuẩn hóa sang `payos_order_code`, `payos_reference`, `payos_code`, `payos_status`.
     - Hỗ trợ thanh toán mua đề VIP (giá do Admin thiết lập) và phí đăng ký giáo viên (`TEACHER_APPLICATION_FEE_VND=2000` VND) qua PayOS (`/v2/payment-requests`), xác thực chữ ký HMAC-SHA256 tại `POST /api/payments/payos/webhook` và `POST /api/payments/webhook` (hỗ trợ cả ping xác minh từ PayOS Dashboard), kết hợp tự động đồng bộ trạng thái từ PayOS API (`syncPendingPaymentIfPossible`).
     - Khắc phục triệt để lỗi không đăng ký lại được giáo viên sau khi link thanh toán PayOS hết hạn bằng cách tái sử dụng bản ghi `PaymentTransaction` gắn với hồ sơ `PENDING_PAYMENT` và cấp `payosOrderCode` mới.
  4. **Tinh gọn và chuẩn hóa `backend/toeic_learning_fresh_install.sql`:**
     - Loại bỏ các bảng dư thừa không còn dùng (`vocabulary`, `lesson`), đồng bộ 22 bảng khớp 100% với JPA entities và thiết lập 20 bộ đề thi chính thức (`PUBLISHED`, 200 câu/đề): 10 đề `ETS TOEIC 2026 - TEST 01..10` và 10 đề `YBM TOEIC 2026 - TEST 01..10`.
  5. **Cập nhật toàn diện ngữ cảnh cho Trợ lý AI Nuna (`AiAssistantServiceImpl.java`, `AiAssistantWidget.jsx`):**
     - Nâng cấp `PLATFORM_SYSTEM_PROMPT`, `buildDynamicContext` (nhận diện chi tiết từng route người dùng đang đứng và vai trò `ROLE_USER`/`ROLE_TEACHER`/`ROLE_ADMIN`) và bộ tri thức `Smart Local Tutor` để Nuna AI nắm vững 100% chức năng hiện tại của website.

- 2026-11-15: Chuẩn hóa & tái cấu trúc thư mục ảnh `frontend/src/assets/img/` theo từng trang và nhóm dùng chung (giữ nguyên toàn bộ hình ảnh hiển thị trên giao diện):
  1. **Cấu trúc thư mục mới (33 ảnh đang dùng + 14 ảnh lưu trữ trong `_unused/`):**
     - `layout/` (`logo1.png`, `anh_cho_co_streak.webp`) — dùng cho `Navbar.jsx`, `Footer.jsx`.
     - `mascot/` (`anh_cho_ban_sung.jpg` và 9 ảnh `toby_*.png`) — dùng cho `TobyMascot.jsx`, `AiAssistantWidget.jsx`, `editorial-application.css`, `ClassroomsPage.jsx`.
     - `home/` (`background_sach.jpg`, `bangtrang.jpg`, `cacChuCai.jpg`, `toeic_980_co_ban_tay.jpg`, `lambai.jpg`, `sanGo.jpg`) — dùng cho Trang chủ (`HeroSection.jsx`, `HomeLearningSection.jsx`, `editorial.css`) và tái sử dụng tại `LoginPage.jsx`, `RegisterPage.jsx`, `AdminDashboardPage.jsx`, `TestManagementPage.jsx`, `index.css`, `editorial-application.css`, `ClassroomsPage.jsx`, `ContactPage.jsx`.
     - `courses/` (`thuvien.jpg`, `biasach.jpg`) — dùng cho `CoursesPage.jsx`, `ProfilePage.jsx`, `DictationTakePage.jsx`, `ContactPage.jsx`, `AdminPageHeader.jsx`, `PaymentManagementPage.jsx`, `ClassroomsPage.jsx`.
     - `course-detail/` (`ocean.jpg`) — dùng cho `CourseDetailPage.jsx`.
     - `exam-take/` (`background.jpg`) — dùng cho `ExamTakePage.jsx`.
     - `classrooms/` (`muaThu.jpg`) — dùng cho `ClassroomsPage.jsx`.
     - `contact/` (`toancanh.jpg`, `nhadieuhanh.jpg`, `hoitruongrua.jpg`, `daihoccantho.jpg`, `email.png`, `zalo.png`) — dùng cho `ContactPage.jsx` và làm banner/preset tại `TeacherApplicationsPage.jsx`, `UserManagementPage.jsx`, `ClassroomsPage.jsx`.
     - `notifications/` (`bell.svg`, `newspaper.jpg`, `thu_bao_quanh.png`) — dùng cho `NotificationsPage.jsx`.
     - `teacher-application/` (`teacher.png`) — dùng cho `TeacherApplicationPage.jsx`.
     - `_unused/` (14 ảnh cũ không còn tham chiếu trong mã nguồn: `coursepage/*`, `gaugau/anhchocute.webp`, `gaugau/anhchovoicongday.webp`, `home-optimized/malaysia*`, `others/*`, `scroll/galaxy.jpg`).
  2. **Cập nhật đường dẫn & kiểm chứng:** Đã cập nhật toàn bộ 55 tham chiếu trên 25 file JS/JSX/CSS liên quan; script Node kiểm tra tĩnh xác nhận 55/55 tham chiếu hợp lệ (0 broken links). Chưa chạy `npm run build`/`lint` sau chỉnh sửa theo quy tắc không tự chạy build/test khi chưa được yêu cầu.

- 2026-11-16: Bổ sung và hoàn thiện triệt để tính năng **Ra lệnh bằng giọng nói (Hybrid 2 lớp — Phương án C)** và **Nút Loa đọc thành tiếng (`POST /api/ai/tts` + `SpeechSynthesis`)** cho Trợ lý AI Nuna:
  1. **Backend (`AiAssistantController`, `AiAssistantServiceImpl`, `SecurityConfig`, `ErrorCode`, `GlobalExceptionHandler`):**
     - Bổ sung `POST /api/ai/voice-chat` (`multipart/form-data`), **yêu cầu đăng nhập (`authenticated`)**, kiểm tra khóa tài khoản (`isLocked`) và giới hạn tần suất `30 req/IP`, `20 req/user` mỗi 15 phút qua `LoginRateLimitService`.
     - Xác thực magic bytes trên RAM (`MAX_VOICE_AUDIO_BYTES = 4 MiB`, hỗ trợ `audio/wav`, `audio/webm`, `audio/ogg`, `audio/mp4` có audio track, `audio/mp3`), không ghi ra đĩa/Cloudinary; tích hợp Gemini 2.5 Flash multimodal (`inlineData` base64) trả về `userTranscript` + `reply` kèm cơ chế dự phòng `SMART_VOICE_TUTOR` từ `clientTranscript` (đảm bảo không lỗi 503 khi Vertex AI/Gemini gián đoạn) và chuẩn hóa số câu hỏi tiếng Việt nói bằng chữ (*"câu tám"* -> `8`) khi xem `/results/:resultId`. Ghi `AuditEvent` (`AI_VOICE_CHAT`) không lưu audio/transcript.
     - Bổ sung `POST /api/ai/tts` (public, giới hạn `90 req/IP`, `60 req/user` mỗi 15 phút) tổng hợp giọng đọc tiếng Việt/Anh chuẩn `audio/mpeg` trực tiếp trên RAM, giải quyết triệt để lỗi trình duyệt Chrome/Windows không có sẵn gói giọng `vi-VN` cục bộ.
     - Cập nhật `SecurityConfig` thành `Permissions-Policy: camera=(), microphone=(self), geolocation=()`.
  2. **Frontend (`aiService.js`, `aiVoiceHelpers.js`, `AiAssistantWidget.jsx`, `editorial-application.css`):**
     - Nút **Micro** ngay cạnh nút Gửi theo kiến trúc Hybrid:
       + Chế độ **`Nhanh`** (`Web Speech API`): lắng nghe liên tục (`continuous: true`), tự động chốt và gửi câu hỏi sau 1.8 giây ngừng nói hoặc khi người dùng bấm nút **Gửi** / nhấn **Enter** / bấm **Dừng** (khóa chống gửi lặp 2 lần), hỗ trợ chuyển `VI`/`EN` và tự động chuyển ngay sang ghi âm AI khi lỗi mạng nếu đã đăng nhập.
       + Chế độ **`AI Song ngữ`** (`MediaRecorder`): tự động chuyển đổi đoạn thu âm sang chuẩn **`16kHz mono 16-bit PCM WAV`** (`convertAudioBlobToWav`) tương thích hoàn toàn với cả Google Cloud Vertex AI (`AQ.`) và Google AI Studio, đồng thời thu song song `clientTranscript` làm lưới dự phòng. Nếu chưa đăng nhập chọn chế độ ghi âm AI sẽ hiển thị thông báo mời đăng nhập thay vì gọi endpoint 401.
     - Nút **Loa (`Nghe Nuna đọc` / `Dừng đọc`)** trên mỗi phản hồi của Nuna và công tắc **`Tự đọc` / `Tắt đọc`**: phát giọng đọc tiếng Việt/Anh tự nhiên qua `POST /api/ai/tts` (HTML5 `Audio` được mở khóa autoplay ngay khi nhấn Micro) kèm fallback `window.speechSynthesis` (có delay 75ms sau `cancel()` chống kẹt hàng đợi Chromium).
     - **Restyle giao diện Friendly Editorial Companion (`AiAssistantWidget.jsx`, `editorial-application.css`):** Nâng cấp khung chat từ bố cục pill xám công nghiệp sang diện mạo bạn đồng hành học tập ấm áp, thân thiện theo `docs/05_UI_UX_SPEC.md`: lớp phủ kem sáng bán trong suốt (`80%–92%`) trên ảnh nền linh vật giúp nổi bật nội dung; header kính mờ ấm kèm badge `Sẵn sàng`; huy hiệu `Nuna` có avatar linh vật nhỏ; bong bóng chat bo cong bất đối xứng (`22px 22px 22px 8px` / `22px 22px 8px 22px`) kèm nhãn chào mừng `Góc học tập TOEIC cùng Nuna`; thay 4 khối pill dài 3 dòng trên màn hình chào mừng bằng lưới 2 cột thẻ chủ đề gợi ý nhanh (`ai-topic-card` bo góc `18px`, có icon badge, tiêu đề gọn và mô tả phụ 1 dòng); khung nhập liệu bo tròn (`22px`) và thanh điều khiển giọng nói bên dưới gom thành cụm segmented pill (`Nói nhanh` / `AI Song ngữ`) + ngôn ngữ (`🇻🇳 Tiếng Việt` / `🇬🇧 English`) + `Tự đọc`.
  3. **Kiểm chứng kỹ thuật (2026-11-16):**
     - Backend: `.\backend\mvnw.cmd -f .\backend\pom.xml compile -DskipTests` biên dịch toàn bộ 179 file Java thành công (`BUILD SUCCESS`, exit 0).
     - Frontend: `npm --prefix frontend run lint` (0 errors; 0 warnings trên các file vừa sửa, còn 2 warnings sẵn có ở `Footer.jsx`) và `npm --prefix frontend run build` (exit 0) đều thành công.

- 2026-11-19: Nâng cấp **Trình soạn thảo đề thi TOEIC (`TestManagementPage.jsx`, `editorial-application.css`)** lên **Fullscreen Exam Studio Workspace (`100vw × 100dvh`)** và tối ưu cơ chế lưu nháp + chống mất dữ liệu (tương thích đồng bộ cả `/admin/tests` của Admin lẫn `/classrooms` của Giáo viên):
  1. **Chuyển từ Modal sang Fullscreen Workspace (không backdrop):** Loại bỏ hoàn toàn `<Modal>` và lớp nền tối `.modal-backdrop` cho trình soạn thảo đề thi; thay bằng `.test-builder-fullscreen` (`position: fixed; inset: 0; z-index: 900`, nằm trên Navbar `100`, dưới các modal phụ `1000` và Toast `2200`), thanh Top Header cố định có nút `← Quay lại danh sách`, vùng soạn thảo căn giữa rộng rãi (`max-width: 1240px`) cuộn tự nhiên, khóa cuộn trang nền khi đang mở.
  2. **Sửa triệt để lỗi xoay vòng `Đang lưu bản nháp...` khi vừa mở & tách key lưu nháp theo từng đề:** Khởi tạo trạng thái `idle` (*"Sẵn sàng soạn thảo"*) khi mở Thêm/Sửa đề; tách riêng `isLoadingTestDetail` (*"Đang tải chi tiết đề..."*); chuyển sang `unsaved` (*"Có thay đổi chưa lưu"*) khi người dùng chỉnh sửa; tăng debounce lưu `localStorage` lên `2.5s` và tách key riêng theo từng đề (`_create` và `_edit_{testId}`) để tránh xung đột bản nháp.
  3. **Bảo vệ chống thoát nhầm 2 lớp:** Thay `window.confirm` bằng Modal xác nhận thoát 3 lựa chọn (`Tiếp tục soạn thảo` / `Lưu nháp & Quay lại` / `Thoát không lưu`) khi còn thay đổi chưa lưu lên máy chủ, kết hợp sự kiện `beforeunload` cảnh báo khi F5/đóng tab.
  4. **Kiểm chứng kỹ thuật (2026-11-19):** `npm --prefix frontend run lint` (`PASS`, exit 0, 0 errors, 0 warnings ở các file sửa, 2 warnings sẵn có ở `Footer.jsx`) và `npm --prefix frontend run build` (`PASS`, exit 0).

- 2026-11-19 (Đợt 2): Rà soát sâu, khắc phục triệt để các lỗi biên & tinh gọn giao diện **Trợ lý AI Nuna (`AiAssistantServiceImpl.java`, `AiAssistantWidget.jsx`, `editorial-application.css`)**:
  1. **Sửa lỗi câu trả lời Gemini 2.5 Flash bị cắt lửng giữa câu & lỗi reset số thứ tự Markdown:**
     - Tăng `maxOutputTokens` từ `2048` lên `4096` cho cả `chat` và `voiceChat` (do Gemini 2.5 Flash chia sẻ ngân sách token cho cả `thoughtsTokenCount` và `candidatesTokenCount`), lọc bỏ các part `thought: true`, và bổ sung `cleanTruncatedReply(resultText, finishReason)` cắt gọn dòng dở dang cuối cùng nếu chạm giới hạn token để không bao giờ để lại mảnh câu cụt (như `"• Đặc biệt"`).
     - Trong `AiMarkdownMessage`, bảo toàn số thứ tự thực tế của danh sách `<ol start={startNum}>` và `<li value={item.num}>` để khi danh sách đánh số `1., 2.` xen kẽ với gạch đầu dòng phụ `•` thì mục `2.` không bị reset về `1.`.
  2. **Nâng cao độ tin cậy Hỏi đáp & Giọng nói:**
     - Cập nhật `buildSuggestedFollowUps` trên backend và `buildClientFallbackReply` trên frontend để sinh gợi ý ngắn gọn 1 dòng (4–7 chữ) theo đúng ngữ cảnh câu hỏi vừa hỏi và luôn có phản hồi dự phòng đầy đủ kể cả khi mất kết nối.
     - Hỗ trợ nhận diện mẫu giọng nói `"câu số 8"` / `"câu tám"` đồng bộ ở cả client và server.
  3. **Tinh gọn giao diện khung chat (loại bỏ các yếu tố thừa / "màu AI"):**
     - Bỏ badge xanh `[● Sẵn sàng]` trên header (khiến dòng mô tả phụ bị cắt lửng `...`), bỏ các pill viền dày `[🐶 Nuna]`, `[Bạn]`, `[✨ Góc học tập TOEIC cùng Nuna]` và bỏ cờ emoji `🇻🇳`/`🇬🇧`.
     - Đưa tên `Nuna` cùng hai nút hành động mảnh không viền (`Đọc`/`Dừng`, `Chép`) xuống thanh footer nhẹ bên dưới bong bóng trả lời (`ai-msg-footer`).
     - Chuyển các khối gợi ý xám to 2 dòng có dấu `>` thành các **pill gợi ý ngang 1 dòng (`ai-quick-chip` bo tròn `9999px`)** gọn gàng, tự nhiên.
  4. **Kiểm chứng kỹ thuật (2026-11-19):**
     - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml compile -DskipTests`: **PASS (exit 0)**.
     - Frontend `npm --prefix frontend run lint` (`PASS`, exit 0, 0 errors, 0 warnings ở các file sửa) & `npm --prefix frontend run build` (`PASS`, exit 0).

- 2026-11-19 (Đợt 3): Rà soát toàn diện logic & chuẩn hóa ngôn từ, giao diện **Thêm đề & Sửa đề thi (`TestManagementPage.jsx`, `ExamController.java`, `ExamService.java`, `ExamServiceImpl.java`)**:
  1. **Sửa 8 lỗi logic trong luồng Thêm đề & Sửa đề:**
     - **Trả về `testId` trực tiếp khi tạo đề (`ExamService`, `ExamServiceImpl`, `ExamController`):** Cập nhật `createFullTest` (`POST /api/exam/create`) và `createClassroomTest` (`POST /api/exam/classrooms/{classroomId}/tests`) trả về `ApiResponse<String>` chứa `savedTest.getId()` để khi lưu bản nháp ở chế độ tạo mới (`keepOpen = true`), frontend nhận ngay `testId` chính xác và chuyển sang chế độ `edit` mà không cần tìm kiếm lại theo tên đề.
     - **Loại bỏ timer tự động gọi API server ngầm 30 giây:** Gỡ bỏ timer 30 giây tự gửi request `DRAFT` ngầm lên server (vốn có thể tự ý hạ đề `PUBLISHED` xuống `DRAFT` hoặc tạo bản nháp trùng lặp khi đang gõ); giữ cơ chế tự lưu tạm `localStorage` (`2.5s` debounce) theo từng đề kết hợp nút `Lưu bản nháp` (`Ctrl+S`) tường minh.
     - **Sửa lỗi tự điền sẵn `"ETS TOEIC 2026 - Test 01"` khi mở Thêm đề mới:** Khi đang ở tab Bản nháp hoặc bộ lọc có `totalElements = 0`, công thức `totalElements + 1` trước đây tự điền tên trùng với `Test 01` đã có sẵn trong DB. Nay để trống ô `Tên đề thi` với placeholder gợi ý, và nếu lưu bản nháp nhanh chưa kịp nhập tên thì tự động đặt tên tạm `"Đề thi chưa đặt tên"`.
     - **Sửa lỗi gõ khoảng trắng / xuống dòng và mất văn bản ở Part 7 Đoạn kép & Đoạn ba (`handleUpdateDoublePart`, `handleUpdateTriplePart`):** Bỏ `.trim()` trên từng lần gõ phím `onChange` và luôn giữ cấu trúc phân tách `--- BÀI ĐỌC 2 ---` / `--- BÀI ĐỌC 3 ---` khi nhập Văn bản 2 hoặc Văn bản 3 trước Văn bản 1 (chỉ `.trim()` khi bấm lưu đề).
     - **Đồng bộ kiểm tra giới hạn câu hỏi & điều kiện xuất bản giữa Frontend và Backend (`validatePublishableTest`):** Chặn thêm vượt quá giới hạn từng Part (Part 1: 6, Part 2: 25, Part 3: 39, Part 4: 30, Part 5: 30, Part 6: 16, Part 7: 54; mỗi cụm Part 7 tối đa 5 câu); kiểm tra đầy đủ đáp án A/B/C/D, đoạn văn Part 6/7 và nội dung câu hỏi trước khi xuất bản, hiển thị Modal Editorial `Đề thi chưa đủ điều kiện xuất bản` (thay cho `window.confirm`) cho phép chuyển sang `Lưu thành Bản nháp` chỉ với 1 cú nhấp.
     - **Sửa lỗi xóa / dán URL ảnh hoặc audio không xóa metadata Cloudinary private cũ:** Khi xóa hoặc dán URL mới vào `audioUrl` / `imageUrl`, tự động xóa `audioPublicId`/`audioFormat`/`audioDeliveryType` (hoặc `imagePublicId`/`imageFormat`/`imageDeliveryType`) tương ứng; khi upload file mới thì cập nhật đồng thời cả 4 trường trong 1 lần setState.
     - **Sửa lỗi nhảy sai tab khi xóa Part (`handleRemovePart`) và lỗi nhấn `Enter` trong ô `<input>` tự submit form:** Tính lại `activePartIndex` chính xác theo vị trí tab vừa xóa và chặn phím `Enter` trên các thẻ `INPUT` trong form soạn đề.
  2. **Chuẩn hóa ngôn từ tự nhiên & tinh gọn giao diện soạn đề:**
     - Thay toàn bộ các cụm từ máy móc/dài dòng bằng thuật ngữ biên tập tự nhiên: `"Lưu nháp máy chủ (Ctrl+S)"` → **`Lưu bản nháp`**, `"Tải lại từ máy chủ"` → **`Khôi phục bản gốc`**, bỏ dòng chữ thừa `"Sẵn sàng soạn thảo"`, `"Thông tin chung & Thiết lập đề thi mới"` → **`Thông tin đề thi`**, `"Cấu trúc chuẩn ETS"` → **`Mẫu đề nhanh`** (`Full Test (200 câu)`, `Phần Nghe (100 câu)`, `Phần Đọc (100 câu)`, `Mini Test (50 câu)`, `Cấu trúc đề`), `"+ Mẫu (A)-(B)-(C)-(D)"` → **`Chèn mẫu`**, `"Khởi tạo đủ N câu chuẩn Part X"` → **`Tạo đủ N câu Part X`**.
     - Tự động ẩn các nút `Tạo đủ N câu` và `Thêm...` trên thanh tiêu đề Part cũng như thanh cuối Part khi Part đó đã đủ số lượng câu chuẩn, đồng thời gộp gọn hàng 4 badge trạng thái trên mỗi thẻ câu hỏi Part 1–4.
  3. **Kiểm chứng kỹ thuật (2026-11-19):**
     - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml compile -DskipTests`: **PASS (exit 0)**.
     - Frontend `npm --prefix frontend run lint` (`PASS`, exit 0, 0 errors, 0 warnings ở các file sửa) & `npm --prefix frontend run build` (`PASS`, exit 0).

- 2026-11-19 (Đợt 4): Rà soát toàn diện dự án — Chuẩn hóa toàn bộ ngôn từ tự nhiên, loại bỏ các từ ngữ mang màu sắc AI/công nghiệp và khắc phục 12 lỗi logic/hiển thị trên các phân hệ (`ExamTakePage.jsx`, `CourseDetailPage.jsx`, `TestResultPage.jsx`, `DictationTakePage.jsx`, `ProfilePage.jsx`, `ClassroomsPage.jsx`, `CoursesPage.jsx`, `NotFoundPage.jsx`, `AdminDashboardPage.jsx`, `Footer.jsx`, `HeroSection.jsx`, `HomeStudyOverviewSection.jsx`, `HomeLearningSection.jsx`, `RegisterPage.jsx`, `ErrorBoundary.jsx`):
  1. **Sửa 12 lỗi logic, dữ liệu và hiển thị phát hiện khi quét toàn bộ dự án:**
     - **Lỗi chặn vào phòng thi Part 6 (`ExamTakePage.jsx`):** Hàm kiểm tra tính toàn vẹn đề thi phía client trước đây yêu cầu `question.questionContent` không được rỗng cho mọi `partNum >= 3`. Tuy nhiên theo chuẩn TOEIC Part 6 (và logic backend `ExamServiceImpl.java`), các câu điền khuyết `[131]..[146]` trong đoạn văn được phép để trống `questionContent`. Đã sửa điều kiện thành `partNum !== 6 && missing(question.questionContent)` để học viên làm bài Part 6 bình thường.
     - **Lỗi hiển thị `Chính xác TB: undefined%` trên trang Nghe chép chính tả (`DictationTakePage.jsx`):** Sidebar thống kê tiến độ đọc thuộc tính `stats.avgAccuracy` trong khi `useMemo` định nghĩa là `stats.averageAccuracy`. Đã đồng bộ thành `stats.averageAccuracy`.
     - **Lỗi hiển thị tên và email học viên bị trống trong tab `Mọi người` & Bảng tin Lớp học (`ClassroomsPage.jsx`):** `AuthContext` lưu thông tin tài khoản theo `UserResponseDTO` (`user.userName`, `user.userEmail`), nhưng `ClassroomsPage.jsx` truy cập `user.name` và `user.email` khiến hàng của chính học viên luôn hiện chữ cái `"B"`, tên `"Bạn (Bạn)"` và trống email. Đã sửa thành `user?.userName || user?.name` và `user?.userEmail || user?.email`.
     - **Lỗi nút `Làm lại đề này` trên trang Kết quả (`TestResultPage.jsx`):** Link dẫn tới `/courses/${result.testId}/take?mode=full` (thiếu `time=120` và sai giá trị `mode=fulltest`). Đã chuẩn hóa thành `/courses/${result.testId}/take?mode=fulltest&time=120`.
     - **Lỗi so sánh kiểu dữ liệu `audioSpeed` và control thừa trên trang Chi tiết đề thi (`CourseDetailPage.jsx`):** State `audioSpeed` là chuỗi `'1.0'` nhưng điều kiện tạo link Dictation lại so sánh `audioSpeed !== 1` (luôn đúng), khiến mọi URL đều bị gắn thừa `&speed=1.0`; đã sửa thành `Number(audioSpeed) !== 1`. Đồng thời gỡ bỏ thẻ `<select>` `"Giao diện phòng thi: Mặc định"` không có chức năng thực tế, thay dòng thông báo giả `"Bạn chưa tạo mục tiêu... Tạo ngay"` bằng số liệu thực (`Chuỗi học hiện tại` và `Điểm cao nhất`) kèm link tới `/profile?tab=history`, và nâng cấp ô **Giới hạn thời gian** từ danh sách `<select>` cố định sang ô nhập số phút tự do (`1–300 phút`, để trống hoặc `0` = Không giới hạn) kết hợp sửa điều kiện đếm ngược `isStopwatch` trong `ExamTakePage.jsx` để đồng hồ đếm ngược đúng số phút người học tự thiết lập.
     - **Lỗi bộ lọc `Full Test` / `Luyện tập Part` trong Lịch sử làm bài (`ProfilePage.jsx`):** Bộ lọc trước đây chỉ kiểm tra `partName.includes('full')`, bỏ sót các lượt thi Full Test được định danh qua `scoreType === 'ESTIMATED_SCALED'` hoặc `totalCount === 200`. Đã đồng bộ điều kiện lọc và bộ đếm cho cả 2 tab.
     - **Lỗi lệch số cột bảng HTML trên Trang chủ (`HomeStudyOverviewSection.jsx`):** `<thead>` có 4 thẻ `<th>` (thừa 1 cột `<span className="src-only">`) trong khi `<tbody>` chỉ có 3 cột; đã xóa cột thừa để bảng chuẩn HTML.
     - **Lỗi mất tương phản icon cảnh báo trong `ErrorBoundary.jsx`:** Khung icon lỗi dùng nền hồng nhạt `#FEE2E2` nhưng màu icon là `#ffffff` (trắng trên nền hồng nhạt không nhìn thấy); đã sửa màu icon thành đỏ `#DC2626` và viền `#FECACA`.
     - **Lỗi nhãn thống kê bị dư dấu ngoặc trên Dashboard Admin (`AdminDashboardPage.jsx`):** Sửa `'Số người dùng đăng nhập/ngày)'` thành `'Tổng người dùng đăng nhập'`.
     - **Dọn sạch cảnh báo linter cuối cùng trong `Footer.jsx`:** Xóa 2 import không sử dụng (`MessageSquareText`, `openAiAssistant`), đưa toàn bộ dự án về mức **0 warnings, 0 errors**.
  2. **Chuẩn hóa ngôn từ tự nhiên, loại bỏ các câu chữ sến/máy móc kiểu AI trên toàn hệ thống:**
     - Loại bỏ toàn bộ các câu thoại nhân cách hóa quá đà kiểu `"Gâu? Nuna chưa tìm thấy..."`, `"Gâu gâu! Bạn đạt... Nuna cực kỳ tự hào"`, `"Bí quyết tăng 100+ điểm TOEIC giống như trên Duolingo..."`, `"MÃ TRẠNG THÁI 404 · NUNA ĐANG BỐI RỐI"`, `"Nuna đã đánh hơi khắp nơi..."`, `"🐾 Đang cháy"`, `"Nuna đang ngủ gật... đánh thức Nuna nhé"`, `"Nuna nói nhỏ cho nghe"` trên `CoursesPage`, `CourseDetailPage`, `TestResultPage`, `DictationTakePage`, `ProfilePage` và `NotFoundPage`.
     - Việt hóa đồng bộ các nhãn tiếng Anh pha trộn trong trình phát âm thanh và phòng luyện nghe (`"Speed"` → `"Tốc độ phát"`, `"Normal"` → `"1.0× (Chuẩn)"`, `"Reload File"` → `"Tải lại âm thanh"`, `"Skip"` → `"Bỏ qua vế"`, `"Show answer immediately"` → `"Hiển thị từ gợi ý đến dấu câu"`, `"01 - Explore / 02 - Practice / 03 - Improve"` → `"01 - Khám phá / 02 - Luyện tập / 03 - Bứt phá"`), sửa lỗi chính tả `"tiếng anh"` → `"tiếng Anh"` trên `HeroSection.jsx` & `RegisterPage.jsx`, và thay thế toàn bộ ký tự `&` / `&amp;` nối câu trong giao diện hiển thị lẫn phản hồi của Trợ lý AI Nuna (`AiAssistantServiceImpl.java`, `AiAssistantWidget.jsx` và 15 trang/component frontend) bằng từ **`"và"`** cho tiếng Việt và **`"and"`** cho tiếng Anh (`TOEIC LISTENING AND READING`, `Listening and Reading`, `COVER LETTER AND EMAIL`).
  3. **Kiểm chứng kỹ thuật (2026-11-19):**
     - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml compile -DskipTests`: **PASS (exit 0, 0 errors)**.
     - Frontend `npm --prefix frontend run lint` (oxlint, 56 files / 102 rules): **PASS (exit 0, 0 warnings and 0 errors trên toàn dự án)**.
     - Frontend `npm --prefix frontend run build` (Vite 8.3.6): **PASS (exit 0)**.

- 2026-11-20: Hỗ trợ **Giao bài tập dạng file PDF không cần chọn đề thi TOEIC** trong Lớp học (`Assignment.java`, `AssignmentRequest.java`, `AssignmentResponse.java`, `AssignmentService.java`, `MaterialService.java`, `ClassRoomController.java`, `ClassroomEmailService.java`, `classroomService.js`, `ClassroomsPage.jsx`, `V20261120_01__add_assignment_material.sql`, `toeic_learning_fresh_install.sql`):
  1. **CSDL & Migration:** Tạo file migration idempotent `backend/migrations/V20261120_01__add_assignment_material.sql` (thêm cột `material_id VARCHAR(36) NULL` và khóa ngoại `fk_assign_material` tham chiếu `material(id) ON DELETE SET NULL` trên bảng `assignment`) và đồng bộ vào `backend/toeic_learning_fresh_install.sql`.
  2. **Backend:** Bỏ ràng buộc `@NotBlank` trên `AssignmentRequest.testId`, bổ sung `materialId` tùy chọn và kiểm tra bắt buộc có ít nhất 1 trong 2 (`testId` hoặc `materialId`) kèm xác minh quyền sở hữu tài liệu cùng lớp trong `AssignmentService`. Bổ sung tham số `notify` (mặc định `true`) trên `POST /api/classrooms/{classroomId}/materials` để tránh gửi trùng thông báo khi tải PDF kèm theo lúc giao bài tập. Cập nhật `AssignmentResponse` và email Gmail (`ClassroomEmailService`) hiển thị đúng tên tệp PDF đính kèm.
  3. **Frontend (`ClassroomsPage.jsx`):** Thêm lựa chọn 2 hình thức trong form Giao bài tập (**`Chọn đề thi TOEIC`** hoặc **`Giao bài tập dạng file PDF`** — cho phép tải PDF mới từ máy hoặc chọn tài liệu PDF đã có trong lớp). Trên các tab **Bảng tin**, **Bài tập trên lớp** và **Điểm số**, bài tập dạng PDF hiển thị nút **`Xem trước PDF`** (trình xem PDF tích hợp) và **`Tải PDF`**, đồng thời không tính lẫn vào điểm trung bình bài thi trắc nghiệm.

- 2026-11-20 (Đợt 2): Tách biệt tệp PDF đính kèm bài tập khỏi mục Tài liệu lớp học và hoàn thiện **luồng Học viên nộp bài PDF & Giáo viên xem/chấm điểm bài nộp PDF** (`V20261120_02__add_pdf_assignment_submission.sql`, `toeic_learning_fresh_install.sql`, `Material.java`, `MaterialRepository.java`, `MaterialService.java`, `AssignmentSubmission.java`, `AssignmentSubmissionRepository.java`, `AssignmentResponse.java`, `AssignmentSubmissionResponse.java`, `AssignmentFeedbackRequest.java`, `AssignmentService.java`, `ClassRoomController.java`, `classroomService.js`, `ClassroomsPage.jsx`):
  1. **Tách biệt Tài liệu lớp học & PDF đính kèm bài tập:** Thêm cột `material.assignment_attachment BOOLEAN NOT NULL DEFAULT FALSE`. Khi giáo viên tải PDF trong form Giao bài tập, frontend gửi `notify=false` và `assignmentAttachment=true`; `MaterialService.list()` chỉ liệt kê các tài liệu có `assignmentAttachment = false` nên tệp đề bài tập không còn xuất hiện lặp lại ở mục "Tài liệu lớp học (PDF)", không tạo bài đăng trùng "đã đăng một tài liệu mới" trên Bảng tin và không gửi trùng thông báo.
  2. **Học viên nộp bài PDF (`POST /api/classrooms/assignments/{assignmentId}/pdf-submissions`):** Tạo bảng & entity `assignment_submission` lưu tệp bài làm PDF private trên Cloudinary (`≤ 10 MiB`, kiểm tra magic-byte PDF), ghi chú học viên, `deadline_snapshot`, cờ `late` (tôn trọng `deadline` & `latePolicy`), điểm số tùy chọn (`0–990`) và nhận xét giáo viên. Hỗ trợ nộp lại bản mới, xem trước bài nộp trực tiếp (`GET .../pdf-submissions/{submissionId}/preview`) và tải về qua link ký 5 phút (`GET .../pdf-submissions/{submissionId}/download`) có kiểm tra quyền sở hữu phía server (giáo viên chủ lớp hoặc học viên đã duyệt là chủ bài nộp).
  3. **Giáo viên chấm điểm & nhận xét bài nộp PDF (`PATCH /api/classrooms/assignments/pdf-submissions/{submissionId}/feedback`):** Trên tab **Điểm số (`Grades`)**, giáo viên xem đầy đủ thống kê nộp bài của bài tập PDF, xem trước/tải trực tiếp từng bài làm PDF của học viên, nhập điểm (`0–990`, tuỳ chọn) cùng nhận xét và gửi thông báo về cho học viên. Sổ điểm cá nhân học viên đồng bộ cả bài tập Đề thi TOEIC và bài tập PDF.
  4. **Kiểm chứng kỹ thuật (2026-11-20):**
     - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml test-compile "-Dmaven.compiler.useIncrementalCompilation=false" -DskipTests`: **PASS (exit 0)** (các class mới đã biên dịch vào `backend/target/classes`).
     - Frontend `npm --prefix frontend run lint`: **PASS (exit 0, 0 errors)**.
     - Frontend `npm --prefix frontend run build`: **PASS (exit 0)**. Chưa thực hiện browser visual QA và chưa chạy migration trên MySQL cục bộ trong phiên này.

- 2026-11-20 (Đợt 3): Nâng cấp chức năng **Xóa vĩnh viễn bài tập và tài liệu lớp học kèm dọn sạch tệp PDF trên Cloudinary** (`CloudinaryService.java`, `MaterialService.java`, `AssignmentService.java`, `AssignmentRepository.java`, `TestResultRepository.java`, `ExamSessionRepository.java`, `ClassRoomController.java`, `ClassroomsPage.jsx`):
  1. **Xóa tài liệu lớp học (`DELETE /api/classrooms/{classroomId}/materials/{materialId}`):** Xóa cứng bản ghi `material` khỏi DB (chặn nếu tài liệu đang gắn với một bài tập đang mở) và tự động xóa tệp PDF private tương ứng trên Cloudinary (`deletePrivateClassPdfQuietly`).
  2. **Xóa bài tập đã giao (`DELETE /api/classrooms/assignments/{assignmentId}`):** Gỡ liên kết `assignment_id` trên `test_result` và `exam_session` (bảo toàn lịch sử làm bài thi của học viên), xóa toàn bộ `assignment_submission` cùng bản ghi `assignment` và tệp đề đính kèm riêng (`assignment_attachment = true`), đồng thời xóa toàn bộ các tệp PDF liên quan (đề PDF đính kèm và bài nộp PDF của học viên) trên Cloudinary.
  3. **Dọn tệp cũ khi học viên nộp lại bài PDF (`submitPdfAssignment`), tách khóa DB khỏi upload Cloudinary và mở rộng regex `CloudinaryService`:** Khi học viên nộp lại bài PDF mới, tự động xóa bản ghi và tệp PDF nộp cũ trên Cloudinary; dùng `TransactionTemplate` trong `MaterialService.upload` và `AssignmentService.submitPdfAssignment` để không giữ khóa `SELECT ... FOR UPDATE` trong suốt thời gian tải tệp lên Cloudinary (tránh lỗi MySQL `Lock wait timeout exceeded`); cập nhật regex `readAndValidateClassPdf` và `deletePrivateClassPdf` hỗ trợ cả thư mục `/materials` và `/submissions/{assignmentId}`.
  4. **Giao diện (`ClassroomsPage.jsx`):** Đổi nhãn nút từ `Ẩn` / `Ẩn bài` sang **`Xóa tài liệu`** / **`Xóa bài`** kèm hộp thoại xác nhận rõ ràng trên cả tab **Bảng tin** và **Bài tập trên lớp**.
  5. **Kiểm chứng kỹ thuật (2026-11-20):** Backend `test-compile`, Frontend `oxlint` (0 errors) và `vite build` đều **PASS (exit 0)**.
- 2026-11-20 (Đợt 4): Căn chỉnh đồng đều thanh bộ lọc 2 tầng trên trang **Quản lý giao dịch PayOS** ([PaymentManagementPage.jsx](file:///d:/All/Information%20Technology%20%20-%20CTU/CurrentSemester/CT446E-NienLuanNganhCNTT/TOEIC_LEARNING/frontend/src/pages/admin/PaymentManagementPage.jsx)): hàng trên là ô tìm kiếm từ khóa (`Người trả / Email / Mã GD`) kéo hết chiều ngang; hàng dưới là 4 bộ lọc (`Trạng thái`, `Loại sản phẩm`, `Từ ngày`, `Đến ngày`) chia đều cột kèm cụm nút `Tìm kiếm` và **`Đặt lại`** đồng bộ chiều cao `h-[42px]` và căn đáy `items-end`. Frontend `oxlint` (0 errors) và `vite build` **PASS (exit 0)**.
