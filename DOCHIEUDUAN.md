# Đọc hiểu dự án TOEIC Learning

> Bản đồ để lần theo dự án từ lúc khởi động, mở trang, gọi API, xử lý nghiệp vụ ở backend đến đọc/ghi MySQL. Đây là hướng dẫn định vị source, không thay thế code và đặc tả chi tiết.

## 1. Mô hình tổng thể

TOEIC Learning có hai ứng dụng chạy riêng:

1. Frontend React/Vite SPA phục vụ trang web, điều hướng và tương tác người dùng.
2. Backend Spring Boot modular monolith cung cấp REST API, xác thực và xử lý nghiệp vụ.
3. MySQL lưu tài khoản, đề, câu hỏi, phiên thi, kết quả, lớp, thanh toán và dữ liệu liên quan.
4. Backend có thể gọi dịch vụ ngoài như Cloudinary, PayOS, Google, Gemini và email tùy luồng.

Luồng tổng quát:

```text
Người dùng → React page/component → frontend service → Axios/apiClient
 → REST Controller → Service/ServiceImpl → Repository → Entity/JPA → MySQL
 ← DTO/ApiResponse ← Controller ← Axios ← cập nhật state và giao diện
```

Backend là một ứng dụng duy nhất chia module, không phải microservices. Frontend là một SPA duy nhất dùng React Router.

## 2. Thứ tự đọc tài liệu dự án

1. [AGENTS.md](AGENTS.md): quy trình, kiến trúc, bảo mật, UI và quy ước thay đổi.
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): bản đồ công nghệ, routes, tính năng, dữ liệu và trạng thái gần nhất.
3. [docs/01_OVERVIEW.md](docs/01_OVERVIEW.md): mục tiêu, vai trò, phạm vi hệ thống.
4. [docs/02_DATABASE.md](docs/02_DATABASE.md): entity, bảng, quan hệ, mô hình câu hỏi.
5. [docs/03_API_SPEC.md](docs/03_API_SPEC.md): API và hợp đồng request/response.
6. [docs/04_FLOW_LOGIC.md](docs/04_FLOW_LOGIC.md): luồng nghiệp vụ đầu cuối.
7. [docs/05_UI_UX_SPEC.md](docs/05_UI_UX_SPEC.md): UI Editorial, component, accessibility, responsive.
8. [docs/06_SECURITY_SPEC.md](docs/06_SECURITY_SPEC.md): yêu cầu bảo mật; đây là đặc tả, không phải chứng nhận đã triển khai.
9. [docs/07_IMPLEMENTATION_STATUS.md](docs/07_IMPLEMENTATION_STATUS.md): nhật ký trạng thái triển khai và kiểm chứng; xem mục có ngày mới nhất và module liên quan.
10. [README.md](README.md), [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md): cách chạy/configure từng phần.

Khi docs khác source, xác nhận bằng code/schema hiện tại. Tài liệu API/flow có thể mô tả mục tiêu chưa triển khai; kiểm tra implementation status và source module.

## 3. Cấu trúc source cần biết

### Backend

Mã nguồn backend ở backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/.

| Đường dẫn | Vai trò |
|---|---|
| ToeicLearningApplication.java | Entry point Spring Boot, khởi tạo context và múi giờ. |
| module/auth, exam, user, admin, classroom, payment, teacher, media, notification, ai | Controller, nghiệp vụ, request/response theo module. |
| entity/ | Ánh xạ dữ liệu và quan hệ JPA. |
| repository/ | Truy vấn MySQL qua Spring Data JPA. |
| security/ | JWT service, filter, xử lý xác thực/truy cập. |
| config/ | Security, Jackson, Cloudinary và cấu hình ứng dụng. |
| common/ | ApiResponse, exception, error code, enum, phân trang, dịch vụ dùng chung. |
| src/main/resources/ | application config và tài nguyên backend. |
| migrations/ | SQL nâng cấp schema hiện hữu. |

Luồng thường gặp là Controller → Service → Repository → Entity, nhưng cần kiểm tra từng lớp vì module có thể khác nhau.

### Frontend

Mã nguồn frontend ở frontend/src/.

| File/thư mục | Vai trò |
|---|---|
| main.jsx | Mount React. |
| App.jsx | Router, AuthProvider, layout chung, lazy routes. |
| pages/ | Màn hình theo route. |
| components/ | Layout và component dùng lại. |
| services/ | Hàm gọi API theo nghiệp vụ. |
| api/apiClient.js | Axios base URL, JWT header, xử lý lỗi và multipart. |
| context/AuthContext.jsx | User, token, đăng nhập/đăng xuất, role helper. |
| assets/ | Ảnh/icon dùng ở frontend. |
| index.css, editorial.css, editorial-application.css | Style và token Editorial. |

## 4. Cách chạy local

Yêu cầu Java 17, Node/npm, MySQL và biến môi trường cần thiết. Xem các README và file .env.example; không đưa secret vào Git hoặc tài liệu.

1. Khởi động MySQL và cấu hình DB_URL, DB_USERNAME, DB_PASSWORD.
2. Tại thư mục backend chạy:

```powershell
.\mvnw.cmd spring-boot:run
```

Spring khởi động từ ToeicLearningApplication.java, nạp cấu hình/Security/JPA và mở API mặc định ở cổng 8080.

3. Tại frontend chạy:

```powershell
npm install
npm run dev
```

Vite in ra địa chỉ thường là http://localhost:5173. Frontend mặc định gọi http://localhost:8080/api; đổi bằng VITE_API_BASE_URL.

### Cảnh báo SQL

Đã kiểm tra nội dung hiện tại của backend/toeic_learning_fresh_install.sql: file có lệnh DROP DATABASE IF EXISTS toeiclearning. Chạy file sẽ xóa database toeiclearning cũ rồi tạo lại. Chỉ chạy trên database mới/được phép xóa và đã backup. Điều này mâu thuẫn với mô tả trong một số README nói fresh install không có DROP. Luôn mở và rà SQL trước khi chạy; tuyệt đối không chạy với dữ liệu cần giữ.

## 5. Frontend khởi tạo và route

```text
main.jsx → App.jsx → BrowserRouter → AuthProvider
 → Navbar + main + ErrorBoundary/Suspense + Routes
 → Page theo URL → component và frontend service
App layout cũng chứa AiAssistantWidget và Footer
```

App.jsx khai báo route và lazy import page. ProtectedRoute.jsx điều hướng khi chưa đăng nhập/sai role; đây chỉ là bảo vệ giao diện, backend vẫn phải kiểm tra quyền.

| Route | Page tiêu biểu |
|---|---|
| /, /contact | HomePage, ContactPage |
| /courses, /courses/:testId | CoursesPage, CourseDetailPage |
| /courses/:testId/take, /results/:resultId | ExamTakePage, TestResultPage |
| /courses/:testId/dictation | DictationTakePage |
| /profile, /notifications | ProfilePage, NotificationsPage |
| /classrooms | ClassroomsPage |
| /teacher/application, /payment/result | TeacherApplicationPage, PaymentResultPage |
| /admin/dashboard, /admin/tests, /admin/users, /admin/payments, /admin/teacher-applications | Các trang trong pages/admin/ |

/practice chuyển hướng về /courses. Danh sách đầy đủ và trạng thái route xác nhận trong frontend/src/App.jsx.

## 6. Một request đi qua backend ra sao

1. Page gọi hàm trong frontend/src/services/.
2. Service gọi apiClient; apiClient dùng VITE_API_BASE_URL, đính Bearer token nếu có, bỏ JSON Content-Type cho FormData.
3. Spring Security/JWT filter xác minh token, user và quyền truy cập.
4. Controller ánh xạ HTTP method/path, validate request DTO, lấy principal, gọi service.
5. Service thực thi nghiệp vụ, xác minh quyền tài nguyên, gọi repository hoặc dịch vụ tích hợp.
6. Repository dùng JPA để đọc/ghi entity trong MySQL.
7. Controller trả ApiResponse<T> hoặc DTO; GlobalExceptionHandler chuyển exception thành lỗi API.
8. Frontend đọc response.data, cập nhật state và render lại.

Không phải mọi endpoint đều public hoặc authenticated như nhau. Xem mapping controller và SecurityConfig; không suy ra từ UI.

## 7. Luồng đăng nhập chi tiết

### Mật khẩu

```text
LoginPage.jsx → AuthContext.login(credentials)
 → authService.login → apiClient.post('/auth/login')
 → POST /api/auth/login: AuthController
 → LoginRateLimitService → AuthServiceImpl.login
 → UserRepository tìm email/điện thoại + role
 → PasswordEncoder so hash, kiểm tra tài khoản khóa
 → JwtService tạo JWT; AuthMapper dựng AuthResponseDTO
 → ApiResponse về frontend
 → AuthContext lưu accessToken/currentUser và React state
```

File để lần theo:

- Giao diện: frontend/src/pages/LoginPage.jsx.
- Context: frontend/src/context/AuthContext.jsx.
- API client wrapper: frontend/src/services/authService.js.
- Axios/JWT: frontend/src/api/apiClient.js.
- Controller: backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/module/auth/AuthController.java.
- Nghiệp vụ: module/auth/service/AuthServiceImpl.java.
- Request/response/map: module/auth/request/LoginRequest.java, dto/AuthResponseDTO.java, mapper/AuthMapper.java.
- DB/token: repository/UserRepository.java và security/JwtService.java.

Khi reload, AuthContext đọc phiên localStorage và nếu có token gọi userService.getProfile() để đồng bộ hồ sơ. Request sau đó được apiClient gắn Authorization Bearer. 401 hoặc lỗi khóa tài khoản cụ thể xóa phiên; 403 thiếu quyền tài nguyên thông thường không tự đăng xuất.

### Đăng ký và Google

- Đăng ký: RegisterPage → AuthContext.register → authService.register → AuthController.register → AuthServiceImpl.register → UserRepository/RoleRepository lưu User → tạo welcome notification → JWT/DTO → lưu phiên frontend.
- Google: trang auth → AuthContext.loginWithGoogle → authService.loginWithGoogle → AuthController.loginWithGoogle → AuthServiceImpl.loginWithGoogle → GoogleIdTokenVerifier xác minh token → UserRepository/RoleRepository → JWT/DTO.

## 8. Luồng kho đề và bài thi

### Kho đề

```text
CoursesPage.jsx → examService.getTests
 → GET /api/exam/list → ExamController.getFullTest
 → ExamService/ExamServiceImpl.getFullTest
 → TestRepository → ApiResponse<PageResponse<Test>> → render catalog
```

Khi mở đề, CourseDetailPage gọi endpoint detail/access/part phù hợp. Quyền VIP và quyền đề lớp được backend kiểm tra; frontend không phải nguồn quyết định entitlement.

### Cấu trúc dữ liệu câu hỏi

```text
Test → ContextQuestion → Question
                    ↘ Part
```

ContextQuestion chứa ngữ cảnh dùng chung như đoạn hội thoại/bài đọc/audio/hình; có thể có nhiều Question. questionNumber đánh thứ tự câu toàn bài, orderIndex xác định vị trí cụm theo quy ước. Xem entity trong backend/.../entity/ và chi tiết docs/02_DATABASE.md.

### Tạo phiên, autosave, nộp

```text
ExamTakePage.jsx → examService lấy access/part
 → POST /api/exam/sessions → ExamController
 → ExamServiceImpl tạo hoặc tiếp tục ExamSession
 → ExamSessionRepository/MySQL

Chọn đáp án → ExamTakePage state/hàng đợi lưu
 → PATCH /api/exam/sessions/{id}/answers
 → ExamController → ExamServiceImpl xác minh owner/trạng thái và lưu nháp

Nộp bài → examService.submitExam
 → POST /api/exam/submit → ExamController
 → ExamServiceImpl chấm từ dữ liệu server
 → TestResult + UserAnswer + tiến độ qua repositories
 → response resultId → /results/{resultId}
```

File chính: frontend/src/pages/ExamTakePage.jsx, frontend/src/services/examService.js, backend/.../module/exam/ExamController.java, module/exam/service/ExamServiceImpl.java, entity/ExamSession.java, TestResult.java, UserAnswer.java và repositories tương ứng.

Đáp án và điểm được tính ở backend. Session phục vụ khôi phục nháp; submission key giúp tránh ghi trùng theo cơ chế hiện tại. Xem docs/04_FLOW_LOGIC.md và PROJECT_CONTEXT.md để biết các giới hạn/chi tiết.

### Xem lại kết quả

TestResultPage.jsx → examService.getTestResultDetail → GET /api/exam/results/{resultId} → ExamController → ExamServiceImpl kiểm tra quyền sở hữu → TestResultRepository/UserAnswerRepository và dữ liệu câu hỏi → TestResultDetailResponseDTO → render kết quả.

Full Test có điểm quy đổi ước tính, không được mô tả là điểm ETS chính thức nếu không có conversion được cấp phép đúng form.

## 9. Lớp học và bài tập

```text
ClassroomsPage.jsx → classroomService.js
 → ClassRoomController
 → ClassroomService / AssignmentService / MaterialService
 → ClassroomRepository / ClassMemberRepository / AssignmentRepository / MaterialRepository
 → MySQL entities → DTO/ApiResponse → UI
```

- Tạo lớp, join code, thành viên: ClassRoomController → ClassroomService.
- Thông báo/mời Gmail: service lớp có thể gọi ClassroomEmailService và NotificationService.
- Upload PDF: frontend FormData → MediaController hoặc endpoint materials → MaterialService kiểm tra file/quota/quyền → metadata và media.
- Giao bài: classroomService.createAssignment → ClassRoomController → AssignmentService; có thể liên hệ đề thi và tài liệu.
- Nộp PDF/chấm: classroomService submit/grade → controller → AssignmentService → AssignmentSubmissionRepository.

Source backend tiêu biểu: module/classroom/ClassRoomController.java, service/ClassroomService.java, AssignmentService.java, MaterialService.java, ClassroomEmailService.java; frontend là ClassroomsPage.jsx và classroomService.js. Preview/download phải đi qua kiểm tra quyền server.

## 10. PayOS và đăng ký giáo viên

```text
Frontend purchase/application service
 → PaymentController hoặc TeacherApplicationController
 → VipPurchaseService/PayosPaymentService/PayosGatewayService
    hoặc TeacherApplicationService
 → PaymentTransactionRepository / TeacherApplicationRepository
 → PayOS tạo giao dịch → webhook/IPN về backend
 → backend xác minh chữ ký và đối chiếu DB
 → cập nhật trạng thái, cấp TestEntitlement nếu giao dịch hợp lệ
 → frontend hỏi trạng thái và hiển thị kết quả
```

Redirect trên trình duyệt không phải bằng chứng thanh toán. Backend dùng giá/trạng thái đã kiểm tra phía server. Thanh toán hồ sơ giáo viên và việc admin duyệt cấp role là hai bước riêng.

File chính: module/payment/PaymentController.java, các service payment, module/teacher/TeacherApplicationController.java và TeacherApplicationService.java; entity PaymentTransaction, TestEntitlement, TeacherApplication.

## 11. Media, thông báo và Nuna

- Media: frontend upload service → MediaController → kiểm tra nội dung/kích thước/quyền → CloudinaryService hoặc provider/cơ chế cấu hình → response. Tài nguyên private cần cấp quyền qua backend.
- Thông báo: notificationService.js → NotificationController → NotificationService → NotificationRepository/Notification → NotificationsPage.jsx.
- AI Nuna: AiAssistantWidget.jsx → aiService.js → AiAssistantController → AiAssistantServiceImpl → Gemini hoặc fallback theo implementation. Khi dùng ngữ cảnh kết quả thi, backend phải xác minh quyền xem result.

Kiểm tra code hiện tại trước khi giả định provider/fallback đang hoạt động trong môi trường của bạn.

## 12. Entity, Repository, DTO và SQL

- Entity biểu diễn dữ liệu/quan hệ JPA.
- Repository chứa truy vấn.
- Request DTO giới hạn dữ liệu đầu vào; Response DTO/Mapper dựng dữ liệu trả ra. Một số endpoint hiện dùng entity với JsonView, nên xem controller cụ thể.
- Schema cài mới ở backend/toeic_learning_fresh_install.sql; nâng cấp ở backend/migrations/.
- Chi tiết bảng ở docs/02_DATABASE.md; đối chiếu entity, migration, SQL và database thật trước khi đổi schema.

## 13. Cách debug chức năng lỗi

1. Xác nhận URL và route trong App.jsx, ProtectedRoute.
2. DevTools Network: method, URL, payload, status, response body; không chia sẻ Authorization/token.
3. Tìm event handler/state lỗi trong page/component.
4. Xác nhận service gọi đúng endpoint, method và body.
5. Kiểm tra apiClient base URL, token, multipart header, CORS/interceptor.
6. Tìm mapping Controller và validation/principal/role.
7. Lần vào ServiceImpl để tìm nhánh nghiệp vụ/exception.
8. Xem repository/entity và schema/migration thực tế.
9. Đọc log backend từ exception gốc và các dòng Caused by.
10. Nếu dùng provider ngoài, kiểm tra cấu hình và response, che secret.

HTTP 400 thường là input/nghiệp vụ không hợp lệ; 401 xác thực; 403 quyền hoặc tài khoản khóa; 404 không tìm thấy; 409 xung đột; 500 lỗi server. Status chỉ định hướng, cần đọc response và log.

## 14. Bản đồ nhanh

| Muốn tìm | Mở đầu tiên | Lần tiếp |
|---|---|---|
| Route frontend | frontend/src/App.jsx | pages/, ProtectedRoute.jsx |
| Đăng nhập | LoginPage.jsx, AuthContext.jsx | authService → apiClient → AuthController → AuthServiceImpl → UserRepository/JwtService |
| Kho đề | CoursesPage.jsx | examService → ExamController → ExamServiceImpl → TestRepository |
| Phòng thi | ExamTakePage.jsx | examService → ExamController → ExamServiceImpl → session/result repositories |
| Kết quả | TestResultPage.jsx | examService → ExamController → ExamServiceImpl → result repositories |
| Lớp | ClassroomsPage.jsx | classroomService → ClassRoomController → classroom services/repositories |
| Thanh toán | vipPurchaseService.js | PaymentController → payment services → repositories |
| AI Nuna | AiAssistantWidget.jsx, aiService.js | AiAssistantController → AiAssistantServiceImpl |
| Database | docs/02_DATABASE.md | entity/ → repository/ → migrations/SQL |
| Nghiệp vụ | docs/04_FLOW_LOGIC.md | controller và service module |
| Trạng thái code | docs/07_IMPLEMENTATION_STATUS.md | mục ngày gần nhất rồi xác nhận source |

## 15. Lưu ý khi bảo trì

- UI guard không thay kiểm tra quyền phía server.
- Đặc tả bảo mật không tự chứng minh code đã đáp ứng.
- Feature trong docs chưa chắc đã triển khai; xác nhận status và source.
- Không lưu secret trong source, log hoặc tài liệu.
- Đọc SQL trước khi chạy; backup trước mọi thao tác phá hủy.
- Khi thay đổi nghiệp vụ/API/DB/UI, làm theo AGENTS.md và cập nhật docs tương ứng.

## 16. Phạm vi đối chiếu

Hướng dẫn này được lập từ AGENTS.md, PROJECT_CONTEXT.md, docs/01–07, README gốc và README backend/frontend; đã đối chiếu các entry point và source đại diện gồm App.jsx, apiClient/AuthContext/authService, AuthController/AuthServiceImpl, ExamController/examService/ExamTakePage, controller/service các module lớp học/thanh toán/AI. Đây là bản đồ đọc hiểu, không phải kiểm thử toàn bộ API.
