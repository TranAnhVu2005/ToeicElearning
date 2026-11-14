# TOEIC Learning — Project Context
> Tóm tắt nhanh cho AI agent (giữ gọn ≤ 130 dòng theo `AGENTS.md`). Chi tiết nghiệp vụ, DB, API, luồng, UI/UX và bảo mật nằm tại `docs/01_OVERVIEW.md`–`docs/06_SECURITY_SPEC.md`. Mã nguồn và schema là nguồn xác nhận trạng thái thực tế.

## 1. Mục tiêu & Kiến trúc
- Website luyện thi TOEIC thương mại: **Admin** (quản lý đề thi, người dùng, giao dịch VNPAY, duyệt giáo viên, dashboard metrics/audit), **Teacher** (quản lý lớp học, thành viên, tài liệu PDF private, đề riêng lớp, giao bài tập & nhận xét), **Student/User** (luyện Part, làm Full Test 200 câu, nghe chép chính tả Dictation, xem lại bài làm, bình luận đề, tham gia lớp, mua đề VIP qua VNPAY).
- **Ràng buộc kiến trúc**: Giữ nguyên một **Spring Boot modular monolith** (REST API + JWT Bearer) và một **React/Vite SPA**. Mở rộng trực tiếp trên module/page/service hiện có; không tự ý tách microservice/BFF hay đổi framework.

## 2. Công nghệ & Entry Points
- **Backend**: Java 17, Maven WAR, **Spring Boot 4.1.0**, Spring Data JPA (Hibernate 7.4), Spring Security, MySQL (`toeiclearning`), port `8080`. SQL logging mặc định tắt (`JPA_SHOW_SQL=false`).
  - Root package: `backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/`
  - Modules: `auth`, `exam`, `user`, `admin`, `media`, `classroom`, `notification`, cùng `common`, `config`, `security`.
- **Frontend**: React 19, Vite 8, React Router, Tailwind CSS, Axios; dev port `5173`/`5174`, gọi `VITE_API_BASE_URL` (mặc định `http://localhost:8080/api`).
  - Routes chính (`frontend/src/App.jsx`, tải qua `React.lazy`):
    - Public/Catalog: `/` (`HomePage`), `/courses` (`CoursesPage`, `/practice` tự động redirect về `/courses`), `/courses/:testId` (`CourseDetailPage` gồm 4 tab: Luyện tập từng phần, Làm Full Test, Chép chính tả, Thảo luận), `/about`, `/contact`, `/login`, `/register`.
    - Học tập & Cá nhân (Authenticated): `/exam/:testId` (`ExamTakePage`), `/dictation/:testId` (`DictationTakePage`), `/results/:resultId` (`TestResultPage`), `/profile` (`ProfilePage`, gồm tab Lịch sử làm bài `?tab=history`), `/notifications`, `/classrooms`, `/teacher-application`, `/payments/vnpay/result`.
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
  - Autosave trình duyệt (`localStorage`) chỉ ghi khi `isDirtyRef.current === true`, tự xóa khi lưu máy chủ thành công và chỉ hiện thanh khôi phục nháp khi dữ liệu local thực sự khác dữ liệu máy chủ.
- **Luyện nghe chép chính tả (`DictationTakePage.jsx`)**:
  - Endpoint `GET /api/exam/{testId}/dictation` kiểm tra quyền VIP/lớp học, chỉ trả context Listening + transcript/translation (không lộ answer key).
  - Hỗ trợ kiểm tra theo từng vế câu (`.`, `,`, `;`, `:`, `?`, `!`), che phần sau bằng `*****`; khi người dùng bấm/gõ tiếp vào ô nhập liệu, khung kết quả bên dưới tự ẩn đi và chỉ hiện lại khi nhấn `Enter` (`Ctrl + Enter`) hoặc bấm "Kiểm tra kết quả".
- **Bình luận đề thi (`TestComment`)**:
  - Lưu MySQL (`test_comment`): `GET /api/exam/{testId}/comments`, `POST /api/exam/{testId}/comments`, `PUT /api/exam/comments/{commentId}`, `DELETE /api/exam/comments/{commentId}` (tác giả sửa/xóa, ADMIN xóa kiểm duyệt).
- **Thương mại VIP & Đăng ký giáo viên (VNPAY)**:
  - Đề VIP có `isVip` và `vipPriceVnd` riêng từng đề; mua một lần cấp `TestEntitlement` vĩnh viễn sau khi xác minh chữ ký/số tiền tại `GET /api/payments/vnpay/ipn`.
  - Hồ sơ giáo viên (`TeacherApplication`) tách biệt bước thanh toán phí (`PENDING_REVIEW`) và bước Admin duyệt (`APPROVED` mới cấp `ROLE_TEACHER`).
- **Lớp học (`Classroom`, `ClassMember`, `Material`, `Assignment`)**:
  - Giáo viên tạo lớp, xoay mã tham gia (`join-code/rotate`), duyệt/chặn học sinh, tải tài liệu PDF private (≤ 10 MiB, quota 512 MiB/lớp, link tải ký hạn 5 phút), tạo đề riêng lớp và giao bài tập có `deadline` + `latePolicy` (`REJECT_AFTER_DEADLINE` / `ACCEPT_AND_MARK_LATE`).

## 4. Hệ thiết kế UI/UX Editorial (`docs/05_UI_UX_SPEC.md`)
- **Phông chữ & Chữ số**: Toàn bộ ứng dụng dùng `--editorial-font: 'EditorialNumerals', 'Gelasio', 'Times New Roman', Georgia, serif` với `@font-face EditorialNumerals` (`unicode-range: U+0030-0039`) và `font-variant-numeric: lining-nums tabular-nums` để chữ số `0–9` luôn cao đều nhau trên một đường cơ sở; `Ubuntu Mono` chỉ dùng cho code/mã giao dịch kỹ thuật.
- **Màu sắc & Bề mặt**: Nền trắng `#FFFFFF` / xám sáng `#F8FAFC`, chữ chính `#111111` / `#111827`, chữ phụ `#4B5563` / `#6B7280`, viền mảnh `1px solid #D1D5DB`, góc vuông vức `2px`, điểm nhấn xanh dương `#1D4ED8` / nền nhẹ `#EFF6FF`. Không dùng màu cầu vồng loè loẹt hay bóng đổ lệch Neo-brutalism.
- **Studio Thêm/Sửa đề (`TestManagementPage.jsx`)**: Bề mặt phẳng sạch `#FFFFFF`/`#F8FAFC` (không đặt ảnh nền trang trí dưới vùng soạn thảo), thanh chọn một hàng Part duy nhất (`Part 1 · 6/6 câu` ... `Part 7 · 54/54 câu`), hiển thị rõ tiến độ và điều hướng câu hỏi nhanh.
- **Trang Xem lại bài thi (`TestResultPage.jsx`)**: Bố cục 2 cột `grid-cols-[1fr_320px]` với bảng số câu bên phải (`sticky`), hover viền xanh `#1D4ED8` và khi bấm số câu sẽ cuộn mượt + phát sáng khung câu hỏi trong 1.8 giây tương tự phòng thi.

## 5. Bảo mật, Cơ sở dữ liệu & Kiểm chứng
- **Bảo mật (`docs/06_SECURITY_SPEC.md`)**: Deny-by-default; JWT kèm `authVersion` (tăng khi đổi/đặt mật khẩu hoặc khóa/mở khóa tài khoản); Google OIDC xác minh chữ ký RS256/JWK và liên kết theo `google_sub`; khóa bi quan dùng native `SELECT ... FOR UPDATE` tương thích MySQL/MariaDB; rate limit lưu hash bucket trong `auth_login_attempt`; nhật ký thao tác nhạy cảm lưu `audit_event`.
- **SQL & Migration**: Cài mới dùng `backend/toeic_learning_fresh_install.sql`; nâng cấp DB hiện có dùng các script trong `backend/migrations/`. Không chạy `database_script.sql` / `database_script_20de.sql` vì chứa `DROP DATABASE`.
- **Trạng thái kiểm chứng gần nhất (2026-11-14)**:
  - Backend `.\backend\mvnw.cmd -f .\backend\pom.xml -q -DskipTests compile`: **PASS (exit 0)**.
  - Frontend `npm --prefix frontend run lint` (oxlint): **PASS (0 warnings, 0 errors)**.
  - Frontend `npm --prefix frontend run build` (Vite 8): **PASS (exit 0)**.
