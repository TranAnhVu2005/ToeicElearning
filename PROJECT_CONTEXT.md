# TOEIC Learning — Project Context
> Tóm tắt nhanh cho AI agent (giữ gọn ≤ 130 dòng theo `AGENTS.md`). Chi tiết nghiệp vụ, DB, API, luồng, UI/UX và bảo mật nằm tại `docs/01_OVERVIEW.md`–`docs/06_SECURITY_SPEC.md`. Mã nguồn và schema là nguồn xác nhận trạng thái thực tế.

## 1. Mục tiêu & Kiến trúc
- Website luyện thi TOEIC thương mại: **Admin** (quản lý đề thi, người dùng, giao dịch PayOS, duyệt giáo viên, dashboard metrics/audit), **Teacher** (quản lý lớp học kiểu Google Classroom, mời học viên hàng loạt qua Gmail, đăng thông báo bảng tin kèm Gmail, tài liệu PDF private có xem trước trực tiếp, đề riêng lớp, giao bài tập kèm thông báo Gmail & chấm nhận xét), **Student/User** (luyện Part, làm Full Test 200 câu, nghe chép chính tả Dictation, xem lại bài làm cùng Trợ lý AI Nuna, bình luận đề, tham gia lớp, mua đề VIP qua PayOS).
- **Ràng buộc kiến trúc**: Giữ nguyên một **Spring Boot modular monolith** (REST API + JWT Bearer) và một **React/Vite SPA**. Mở rộng trực tiếp trên module/page/service hiện có; không tự ý tách microservice/BFF hay đổi framework.

## 2. Công nghệ & Entry Points
- **Backend**: Java 17, Maven WAR, **Spring Boot 4.1.0**, Spring Data JPA (Hibernate 7.4, 22 JPA repositories), Spring Security, MySQL (`toeiclearning`), port `8080`. SQL logging mặc định tắt (`JPA_SHOW_SQL=false`).
  - Root package: `backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/`
  - Modules: `auth`, `exam`, `user`, `admin`, `media`, `classroom`, `payment`, `teacher`, `notification`, `ai`, cùng `common`, `config`, `security`.
- **Frontend**: React 19, Vite 8, React Router, Tailwind CSS, Axios; dev port `5173`/`5174`, gọi `VITE_API_BASE_URL` (mặc định `http://localhost:8080/api`).
  - Routes chính (`frontend/src/App.jsx`, tải qua `React.lazy`):
    - Public/Catalog: `/` (`HomePage`), `/courses` (`CoursesPage`, `/practice` tự động redirect về `/courses`), `/courses/:testId` (`CourseDetailPage` gồm 4 tab: Luyện tập từng phần, Làm Full Test, Chép chính tả, Thảo luận), `/courses/:testId/dictation` (`DictationTakePage`), `/contact`, `/login`, `/register`.
    - Học tập & Cá nhân (Authenticated): `/courses/:testId/take` (`ExamTakePage`), `/results/:resultId` (`TestResultPage`), `/profile` (`ProfilePage`, gồm Hồ sơ, Bảo mật, Lịch sử làm bài `?tab=history`, Lịch sử thanh toán `?tab=payments`), `/notifications`, `/classrooms` (`ClassroomsPage`, hỗ trợ `?joinCode=...`), `/teacher/application` (`TeacherApplicationPage`), `/payment/result` (`PaymentResultPage`).
    - Quản trị (`ROLE_ADMIN`): `/admin/dashboard`, `/admin/tests` (`TestManagementPage`), `/admin/users`, `/admin/payments`, `/admin/teacher-applications`.

## 3. Bản đồ dữ liệu & Nghiệp vụ cốt lõi
- **Mô hình đề thi TOEIC**: `Test -> ContextQuestion -> Question`, gắn `Part` (Part 1–7).
  - `ContextQuestion.orderIndex` là số thứ tự câu đầu của cụm; `Question.questionNumber` là số câu toàn bài (1–200). `ContextQuestion` xuất `@JsonProperty("partNumber")` để frontend builder ánh xạ chính xác từng Part.
  - Cấu trúc chuẩn 200 câu: Part 1 (1–6, 6 câu ảnh+audio), Part 2 (7–31, 25 câu audio, chỉ 3 lựa chọn A/B/C), Part 3 (32–70, 13 đoạn hội thoại × 3 câu), Part 4 (71–100, 10 bài nói × 3 câu), Part 5 (101–130, 30 câu đơn), Part 6 (131–146, 4 đoạn × 4 câu, cho phép câu điền chỗ trống để trống `questionContent`), Part 7 (147–200, 54 câu gồm 10 bài đơn 147–175, 2 bài đôi 176–185, 3 bài ba 186–200, tách đoạn bằng `--- BÀI ĐỌC 2 ---` / `--- BÀI ĐỌC 3 ---`).
- **Cách tính điểm TOEIC (`ExamServiceImpl.java`)**:
  - **Full Test (đủ 200 câu)**: Tra cứu 2 bảng quy đổi độc lập 0–100 câu (`LISTENING_SCORE_TABLE`: `0->5`, `1..75->c*5+10`, `76..95->c*5+15`, `96..100->495`; `READING_SCORE_TABLE`: `0..2->5`, `3..100->(c-1)*5`), tổng điểm `10–990` gắn nhãn `ESTIMATED_TOEIC` (điểm ước tính luyện tập, không tuyên bố là điểm ETS chính thức).
  - **Luyện từng Part / < 200 câu**: Lưu số câu đúng thực tế (`RAW_COUNT`), không nhân tỷ lệ sang thang 990.
- **Lưu & Khôi phục phiên làm bài (`ExamSession`)**:
  - `POST /api/exam/sessions`: tạo mới hoặc tiếp tục phiên `ACTIVE` (`restartActive: false` khi vào trang hoặc F5/reload trình duyệt), khôi phục đáp án đã chọn, câu đánh dấu (`flaggedQuestions`), Part đang mở và thời gian từ server kết hợp `sessionStorage`.
  - `PATCH /api/exam/sessions/{sessionId}/answers`: tự động lưu đáp án qua hàng đợi tuần tự (coalescing queue).
  - `DELETE /api/exam/sessions/{sessionId}`: hủy phiên (`CANCELLED`) và xóa nháp chỉ khi người dùng chủ động nhấn thoát phòng thi và xác nhận "Rời khỏi bài thi" không nộp.
  - `POST /api/exam/submit`: chấm điểm server-side từ `sessionId` + `submissionKey` (idempotent theo `(user_id, submission_key)`), lưu `TestResult`/`UserAnswer`, cập nhật `currentStreak`, `highestStreak`, `lastActiveDate`, `totalScore`.
- **Quản lý Thêm / Sửa / Xóa đề thi (`TestManagementPage.jsx`, `ExamServiceImpl.java`)**:
  - Sửa đề (`PUT /api/exam/update/{id}`): cập nhật tại chỗ (`upsertTestDetailInPlace`) các `ContextQuestion` và `Question` theo ID/thứ tự, bảo toàn khóa ngoại của `UserAnswer` lịch sử mà không làm hỏng dữ liệu xem lại bài.
  - Cập nhật nhanh metadata (`PATCH /api/exam/update/{id}/metadata`): sửa tên đề, ảnh bìa (`coverImageUrl`/`clearCoverImage`), trạng thái (`PUBLISHED`/`DRAFT`) và cấu hình VIP (`isVip`, `vipPriceVnd`) không cần gửi lại 200 câu hỏi.
  - Xóa đề hệ thống (`DELETE /api/exam/delete/{id}`): nếu đã có lượt làm, giao dịch hoặc bài tập tham chiếu thì chuyển về `DRAFT` và trả `ARCHIVED`; nếu chưa có tham chiếu thì xóa cứng (`DELETED`) và dọn media không còn dùng.
- **Luyện nghe chép chính tả (`DictationTakePage.jsx`)**:
  - Endpoint `GET /api/exam/{testId}/dictation` kiểm tra quyền VIP/lớp học, chỉ trả context Listening + transcript/translation (không lộ answer key).
  - Hỗ trợ kiểm tra theo từng vế câu (`.`, `,`, `;`, `:`, `?`, `!`), che phần sau bằng `*****`; khi người dùng bấm/gõ tiếp vào ô nhập liệu, khung kết quả bên dưới tự ẩn đi và chỉ hiện lại khi nhấn `Enter` (`Ctrl + Enter`) hoặc bấm "Kiểm tra kết quả".
- **Bình luận đề thi (`TestComment`)**:
  - Lưu MySQL (`test_comment`): `GET /api/exam/{testId}/comments`, `POST /api/exam/{testId}/comments`, `PUT /api/exam/comments/{commentId}`, `DELETE /api/exam/comments/{commentId}` (tác giả sửa/xóa, ADMIN xóa kiểm duyệt).
- **Thương mại VIP & Đăng ký giáo viên (PayOS)**:
  - Tích hợp cổng thanh toán **PayOS** (`PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, cột DB `payos_order_code`, `payos_reference`, `payos_code`, `payos_status`).
  - Đề VIP có `isVip` và `vipPriceVnd` riêng từng đề; mua một lần cấp `TestEntitlement` vĩnh viễn sau khi xác minh chữ ký HMAC-SHA256 tại `POST /api/payments/payos/webhook` (hoặc `/api/payments/webhook`) hay đồng bộ trạng thái từ PayOS API (`syncPendingPaymentIfPossible`).
  - Hồ sơ giáo viên (`TeacherApplication`, phí mặc định `TEACHER_APPLICATION_FEE_VND=2000` VND) tách biệt bước thanh toán (`PENDING_REVIEW`) và bước Admin duyệt (`APPROVED` mới cấp `ROLE_TEACHER`). Khi link thanh toán cũ hết hạn, người dùng có thể bấm tạo lại mã QR PayOS mới ngay trên hồ sơ `PENDING_PAYMENT` hiện có.
- **Trợ lý AI Nuna (`module/ai`, `AiAssistantWidget.jsx`, `aiVoiceHelpers.js`, `TobyMascot.jsx`)**:
  - Nhân vật đồng hành **Nuna** tích hợp tại `POST /api/ai/chat` (kết nối Gemini API `GEMINI_API_KEY`, `GEMINI_API_URL` kèm cơ chế Smart Local Tutor dự phòng), `POST /api/ai/voice-chat` (authenticated `multipart/form-data`, chỉ tài khoản đã đăng nhập mới được gửi audio) và `POST /api/ai/tts` (tổng hợp giọng đọc tiếng Việt/Anh `audio/mpeg` tự nhiên qua máy chủ kèm fallback `speechSynthesis`).
  - Hỗ trợ **ra lệnh bằng giọng nói (Hybrid 2 lớp — Phương án C)**: mặc định nhận diện liên tục theo thời gian thực qua Web Speech API (`VI`/`EN`, tự gửi sau 1.8s ngừng nói hoặc bấm Gửi/Dừng, tự chuyển sang Ghi âm AI khi lỗi mạng), kết hợp chế độ **AI Song ngữ** thu âm qua `MediaRecorder` và tự động chuyển sang chuẩn `16kHz mono PCM WAV` (`≤ 4 MiB` / 45 giây, kèm `clientTranscript` dự phòng `SMART_VOICE_TUTOR` và kiểm tra magic-byte trong RAM không lưu đĩa) gửi Gemini 2.5 Flash nghe hiểu đa ngôn ngữ. Có nút **Loa (`Đọc` / `Dừng đọc`)** trên mỗi phản hồi và tự động đọc (`Tự đọc: Bật/Tắt`) sau khi hỏi qua micro.
  - Tự động nhận diện trang đang mở (`pageContext`) và khi xem lại bài thi (`/results/:resultId`), server xác minh quyền sở hữu `TestResult` rồi trích xuất chi tiết bài làm, đoạn văn, lời thoại (`transcript`), bản dịch (`translation`), đáp án đúng/đã chọn và giải thích câu hỏi từ MySQL (hỗ trợ cả chọn câu trên thanh ngữ cảnh, gõ số câu trực tiếp hoặc nói bằng giọng nói như *"Giải thích câu 8"* / *"câu tám"*). Tự động ẩn và dừng thu/đọc trên phòng thi đang làm (`/courses/:testId/take`).
- **Lớp học kiểu Google Classroom (`Classroom`, `ClassMember`, `Material`, `Assignment`, `ClassroomEmailService`) & Thông báo (`Notification`)**:
  - Giao diện `/classrooms` gồm 4 tab: **Bảng tin (`Stream`)**, **Bài tập trên lớp (`Classwork`)**, **Mọi người (`People`)**, **Điểm số (`Grades`)**.
  - **Tuỳ chỉnh giao diện lớp học (`PATCH /api/classrooms/{classroomId}/appearance`)**: Giáo viên có thể mở hộp thoại **Tuỳ chỉnh giao diện** kiểu Google Classroom để chọn 1 trong 8 màu chủ đề (`themeColor`), chọn ảnh bìa mẫu (`Chọn ảnh`) hoặc tải ảnh bìa riêng lên Cloudinary/local (`Tải ảnh lên` qua `/api/media/upload`); lưu xuống DB (`classroom.theme_color`, `classroom.banner_url`) để hiển thị đồng bộ cho cả giáo viên và học viên.
  - **Tài liệu PDF lớp học (`Material`)**: Giáo viên tải PDF private (≤ 10 MiB, quota 512 MiB/lớp); hỗ trợ **Xem trước PDF trực tiếp trên trình duyệt** (`GET /api/classrooms/{classroomId}/materials/{materialId}/preview`) và tải về qua link ký hạn 5 phút (`GET .../download`).
  - **Tích hợp Gmail (`ClassroomEmailService`, cấu hình `MAIL_USERNAME`, `MAIL_PASSWORD`, `FRONTEND_URL`)**:
    - Giáo viên mời học viên hàng loạt qua danh sách Gmail (`POST /api/classrooms/{classroomId}/invitations`): tự động duyệt thẳng (`APPROVED`) nếu Gmail đã có tài khoản học viên, đồng thời gửi email lời mời HTML chuẩn Google Classroom kèm mã lớp và nút tham gia nhanh (`/classrooms?joinCode=...`).
    - Khi giáo viên giao bài tập mới, cập nhật hạn nộp hoặc đăng thông báo bảng tin (`POST /api/classrooms/{classroomId}/announcements`), hệ thống tự động gửi cả thông báo in-app lẫn email thông báo tới Gmail của toàn bộ học viên trong lớp.
  - **Hệ thống Thông báo (`/api/notifications/**`, `NotificationsPage.jsx`)**: Phát thông báo tự động theo 6 danh mục (`ALL`, `EXAM`, `ASSIGNMENT`, `CLASSROOM`, `PAYMENT`, `SYSTEM`), hỗ trợ lọc chưa đọc, đánh dấu đã đọc và xóa dọn hộp thư.

## 4. Hệ thiết kế UI/UX Editorial (`docs/05_UI_UX_SPEC.md`)
- **Phông chữ & Chữ số**: Toàn bộ ứng dụng dùng `--editorial-font: 'EditorialNumerals', 'Gelasio', 'Times New Roman', Georgia, serif` với `@font-face EditorialNumerals` (`unicode-range: U+0030-0039`) và `font-variant-numeric: lining-nums tabular-nums`; `Ubuntu Mono` dùng cho code/mã giao dịch kỹ thuật.
- **Màu sắc & Bề mặt**: Nền trắng `#FFFFFF` / xám sáng `#F8FAFC`, chữ chính `#111111` / `#111827`, viền mảnh `1px solid #D1D5DB`, góc `2px`, điểm nhấn xanh dương `#1D4ED8` / nền nhẹ `#EFF6FF`. Riêng khung chat **Trợ lý AI Nuna** thiết kế theo phong cách **Editorial Companion** tinh gọn (`26px`), dùng ảnh nền `mascot/anh_cho_ban_sung.jpg` phủ lớp kem sáng bán trong suốt (`84%–94%`), header kính mờ sạch sẽ, bong bóng chat bo cong bất đối xứng (`22px`) tích hợp thanh footer nhẹ (`Nuna`, `Đọc`/`Dừng`, `Chép`), các gợi ý nhanh dạng pill ngang 1 dòng (`ai-quick-chip` bo tròn `9999px`), khung nhập liệu nổi (`22px`) và thanh điều khiển giọng nói tối giản (`Nhanh` / `AI Song ngữ`, `Tiếng Việt` / `Tiếng Anh`, `Tự đọc`) trong `editorial-application.css`.
- **Tổ chức ảnh nội bộ (`frontend/src/assets/img/`)**: Chia theo trang và nhóm dùng chung (`layout/`, `mascot/`, `home/`, `courses/`, `course-detail/`, `exam-take/`, `classrooms/`, `contact/`, `notifications/`, `teacher-application/`); các ảnh cũ chưa dùng giữ riêng trong `_unused/`.

## 5. Bảo mật, Cơ sở dữ liệu & Kiểm chứng
- **Bảo mật (`docs/06_SECURITY_SPEC.md`)**: Deny-by-default; JWT kèm `authVersion`; tài khoản bị khóa trả `403 USER_ACCOUNT_LOCKED` (code 2009); Google OIDC RS256/JWK; khóa bi quan dùng native `SELECT ... FOR UPDATE`; rate limit lưu hash bucket trong `auth_login_attempt`; audit lưu `audit_event`.
- **SQL & Migration**: Cài mới dùng `backend/toeic_learning_fresh_install.sql` (đồng bộ 22 bảng, tích hợp PayOS và 20 bộ đề `PUBLISHED`: `ETS TOEIC 2026 - TEST 01..10` & `YBM TOEIC 2026 - TEST 01..10`); nâng cấp DB hiện có dùng `backend/migrations/`. Không chạy `database_script.sql` / `database_script_20de.sql` vì chứa `DROP DATABASE`.
- **Trạng thái kiểm chứng gần nhất (2026-11-19)**:
  - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml compile -DskipTests` (toàn bộ 179 file Java): **PASS (exit 0, 0 warnings/errors)**.
  - Frontend `npm --prefix frontend run lint` (oxlint, 56 files / 102 rules): **PASS (exit 0, 0 errors; 0 warnings ở các file sửa, 2 warnings sẵn có ở `Footer.jsx`)**.
  - Frontend `npm --prefix frontend run build` (Vite 8.3.6): **PASS (exit 0)**.
