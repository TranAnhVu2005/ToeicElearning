# TOEIC Learning — Project Context

> Tóm tắt nhanh cho agent; giữ dưới 100 dòng. Chi tiết sản phẩm nằm trong `docs/01_OVERVIEW.md`–`docs/06_SECURITY_SPEC.md`. Mã nguồn/schema là nguồn xác nhận trạng thái thực tế.

## Mục tiêu
- Website luyện thi TOEIC thương mại: Admin (đề/user/payment/dashboard/duyệt teacher), Teacher (lớp/tài liệu/đề/assignment), Student (thi/luyện/review/lớp/notification), đề VIP/VNPAY.
- Chưa code tính năng theo đặc tả cho đến khi chủ dự án yêu cầu. Bộ docs là đặc tả đang được chủ dự án rà soát.

## Stack và entry points
- Backend: Java 17, Maven WAR, Spring Boot 4.1.0, Spring Data JPA, Spring Security, MySQL; port 8080.
- Frontend: React 19, Vite, React Router, Tailwind CSS, Axios; dev mặc định 5173; gọi `http://localhost:8080/api`.
- Backend root package: `backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/`.
- Frontend routes/layout: `frontend/src/App.jsx`; API client/auth: `frontend/src/api/apiClient.js`, `frontend/src/context/AuthContext.jsx`, `frontend/src/services/`.
- Thi: `frontend/src/pages/ExamTakePage.jsx`; soạn đề: `frontend/src/pages/admin/TestManagementPage.jsx` (file lớn, autosave/local recovery/server draft save).

## Bản đồ backend
- Modules hiện có: `auth`, `exam`, `user`, `admin`, `media`, `classroom`; `ClassRoomController` rỗng. Classroom/material/assignment entities có nhưng flow backend/frontend chưa hoàn chỉnh.
- Entities chính: `Role`, `User`, `Test`, `Part`, `ContextQuestion`, `Question`, `TestResult`, `UserAnswer`; thêm lớp học/tài liệu/bài tập, `PaymentTransaction`, `Notification`.
- Quan hệ đề: `Test -> ContextQuestion -> Question`; `orderIndex` là số câu bắt đầu của context, `questionNumber` là số global.
- Auth routes: POST `/api/auth/register`, `/login`, `/google`.
- Exam routes: GET `/api/exam/list`, `/{testID}`, `/{testID}/parts/{partID}`; create/update/publish/draft; delete giới hạn ADMIN.
- User routes: GET `/api/user/me`, PATCH `/api/user/updateprofile`, POST `/api/user/changepassword`.
- Admin routes: GET `/api/admin/users`, PATCH `/api/admin/changestatus`; media upload/delete cho ADMIN/TEACHER.
- Submit/history/review backend chưa xong: không có controller mapping; `submitExam` trả null, history trả list rỗng, detail trả null.
- UI hiện tự chấm và lưu lịch sử thi/dictation trong localStorage; không coi đây là lịch sử server-side.
- VIP/VNPAY: có entity/bảng `PaymentTransaction` cơ bản, chưa thấy module giao dịch/entitlement hoàn chỉnh. Teacher application/review, lớp, assignment, notification workflows còn cần xây dựng/đối chiếu.
- Dashboard active-user/test-daily và online presence chưa có API được xác nhận; cần định nghĩa metric/timezone/TTL.
- Diagnostic/study plan, spaced repetition, resumable exam, content issue queue, notification preferences và payment funnel là đề xuất trong docs, chưa phải tính năng đã có/đã duyệt.

## Dữ liệu đề và quy tắc cốt lõi
- Part 1: 6 câu, 1–6; mỗi câu ảnh + audio, lựa chọn chỉ A/B/C/D.
- Part 2: 25 câu, 7–31; mỗi câu audio, UI chỉ A/B/C.
- Part 3: 39 câu, 32–70; 13 nhóm × 3 câu, audio bắt buộc, ảnh tùy chọn.
- Part 4: TOEIC chuẩn có 30 câu, 71–100, 10 talks × 3 câu. Yêu cầu “30 bài nghe” mâu thuẫn; dùng chuẩn 10 talks trừ khi chủ dự án xác nhận khác.
- Part 5: 101–130 (30 câu); Part 6: 131–146 (16 câu); Part 7: 147–200 (54 câu).
- Nhóm passage Part 7: 147–175 (10 nhóm, mỗi nhóm 1 passage); 176–180 và 181–185 (2 passage); 186–190, 191–195, 196–200 (3 passage).
- Chi tiết field, constraints và flow theo Part nằm trong `docs/02_DATABASE.md`, `docs/04_FLOW_LOGIC.md`.

## Security và cấu hình
- JWT Bearer; filter nạp user/role từ DB và từ chối account locked. Roles theo `ROLE_ADMIN`, `ROLE_USER`, `ROLE_TEACHER`.
- Security filter chain bảo vệ `/api/admin/**`, `/api/user/**`; request khác permit ở filter-chain, một số controller dùng `@PreAuthorize`. Mọi API mới phải khai báo quyền rõ.
- CORS hiện chỉ localhost 5173/127.0.0.1:5173. Datasource env `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; JWT env `JWT_SECRET`, `JWT_EXPIRATION`.
- Không chép credential Cloudinary/JWT/VNPAY từ properties vào docs/log/frontend; dùng env cho cấu hình mới.
- Đọc `docs/06_SECURITY_SPEC.md` trước khi thay đổi auth/API/payment/upload/lớp/dữ liệu/deploy; đây là yêu cầu mục tiêu, không phải bảo đảm đã triển khai. Hiện trạng đáng rà soát: any-request permit, CSRF disable, token localStorage, JWT mặc định 24 giờ, upload validation và kiểm tra URL xóa Cloudinary.

## Chạy và dữ liệu
- Frontend: `cd frontend`, `npm run dev`; scripts có `build`, `lint`.
- Backend: `cd backend`, `mvnw.cmd spring-boot:run`; cần MySQL `toeiclearning`.
- SQL nguồn chính `backend/database_script.sql` có `DROP DATABASE toeiclearning`; không chạy nếu chưa xác nhận DB có thể phá hủy.
- `backend/database_script_20de.sql` và các seed script là nguồn dữ liệu khác; kiểm tra schema/ID trước khi chạy.
- `spring.jpa.hibernate.ddl-auto=update`; hiện chỉ thấy smoke test `contextLoads`.

## Tài liệu phải đọc trước khi làm
- `AGENTS.md` nêu quy trình và yêu cầu đọc đặc tả.
- Trước thay đổi dự án, đọc đủ `docs/01_OVERVIEW.md` đến `docs/06_SECURITY_SPEC.md`; bảo mật là phần bắt buộc của mọi API, luồng dữ liệu và UI nhạy cảm.
- `docs/05_UI_UX_SPEC.md` chuyển thể Neo-brutalism từ dự án ngoài; ảnh Explorer người dùng gửi không phải screenshot giao diện sản phẩm.
- Những chỗ “Cần xác nhận/chốt” không được agent tự quyết thành yêu cầu đã duyệt.
- Điểm ETS scaled 5–495/section dùng conversion theo từng form; nếu không có bảng hợp lệ, gọi là điểm ước tính. Giữ quyền phân phối nội dung đề/media.
