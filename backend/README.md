# 🏛️ KIẾN TRÚC MÃ NGUỒN BACKEND (CLEAN ARCHITECTURE)

Dự án **TOEIC Learning System** được thiết kế theo mô hình **Domain/Layered Clean Architecture**, tổ chức mã nguồn rõ ràng, phân tách trách nhiệm chặt chẽ, dễ bảo trì và sẵn sàng mở rộng theo tiêu chuẩn các dự án doanh nghiệp thực tế.

---

## 📁 1. CẤU TRÚC THƯ MỤC CHUẨN

```text
src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/
│
├── common/                               # CÁC THÀNH PHẦN DÙNG CHUNG TOÀN HỆ THỐNG
│   ├── constant/                         # Hằng số hệ thống (StatusMessage, ActionMessage, AppConstants)
│   ├── enums/                            # Danh mục Enum nghiệp vụ
│   │   ├── ErrorCode.java                # Danh mục mã lỗi chuẩn hoá kèm HTTP Status (1000 - 3999)
│   │   ├── RoleType.java                 # ROLE_USER, ROLE_ADMIN
│   │   ├── PartType.java                 # PART_1 -> PART_7, FULL_TEST
│   │   └── QuestionAnswer.java           # A, B, C, D
│   ├── dto/                              # DTO dùng chung cho Response & Pagination
│   │   ├── ApiResponse.java              # Format JSON chuẩn: code, message, data, timestamp
│   │   ├── PageResponse.java             # Format phân trang chuẩn: content, pageNumber, totalPages...
│   │   └── PageParams.java               # Nhận query params: numberPage, sizeOfPage, sortBy, direction, keyWord
│   └── exception/                        # Quản lý ngoại lệ tập trung
│       ├── AppException.java             # Base Custom Runtime Exception gắn liền với ErrorCode
│       ├── ResourceNotFoundException.java# Ngoại lệ không tìm thấy tài nguyên theo ID
│       └── GlobalExceptionHandler.java   # Bắt & chuyển đổi toàn bộ Exception sang ApiResponse
│
├── config/                               # CẤU HÌNH HỆ THỐNG SPRING BOOT
│   ├── SecurityConfig.java               # Cấu hình Spring Security, Stateless JWT, CORS, Method Security
│   ├── CorsConfig.java                   # Cấu hình CORS cho ứng dụng Web / Mobile
│   ├── AuditingConfig.java               # Cấu hình JPA Auditing
│   └── OpenApiConfig.java                # Cấu hình Swagger / OpenAPI tài liệu hóa API
│
├── security/                             # BỘ XỬ LÝ BẢO MẬT & JWT TOKEN
│   ├── JwtService.java                   # Tạo token, trích xuất userId/claims, kiểm tra token hết hạn
│   ├── JwtAuthenticationFilter.java      # Filter xác thực Bearer token trong Header & gán Role SecurityContext
│   ├── JwtAuthenticationEntryPoint.java  # Xử lý trả về JSON chuẩn khi bị lỗi 401 Unauthorized
│   └── JwtAccessDeniedHandler.java       # Xử lý trả về JSON chuẩn khi bị lỗi 403 Forbidden
│
├── entity/                               # TẦNG DATABASE DOMAIN MODELS (ENTITIES)
│   ├── base/                             # Kế thừa Base Entity linh hoạt theo schema CSDL
│   │   ├── BaseEntity.java               # Chỉ có id (UUID)
│   │   ├── BaseCreatedEntity.java        # id (UUID) + createdAt (@CreationTimestamp)
│   │   └── BaseCreatedUpdatedEntity.java # id (UUID) + createdAt + updatedAt (@UpdateTimestamp)
│   ├── Role.java                         # Bảng phân quyền (extends BaseCreatedUpdatedEntity)
│   ├── User.java                         # Bảng người dùng (extends BaseCreatedUpdatedEntity)
│   ├── Part.java                         # Bảng 7 Part trong đề thi TOEIC (extends BaseCreatedUpdatedEntity)
│   ├── Test.java                         # Bảng đề thi Full/Mini (extends BaseCreatedUpdatedEntity)
│   ├── ContextQuestion.java              # Nhóm câu hỏi, Audio, Image, Paragraph (extends BaseCreatedUpdatedEntity)
│   ├── Question.java                     # Bảng câu hỏi chi tiết & đáp án (extends BaseCreatedUpdatedEntity)
│   ├── TestResult.java                   # Lịch sử làm bài thi (extends BaseCreatedEntity)
│   └── UserAnswer.java                   # Chi tiết câu trả lời lúc nộp bài (extends BaseEntity)
│
├── repository/                           # TẦNG TRUY VẤN DỮ LIỆU (SPRING DATA JPA)
│   ├── base/
│   │   └── BaseRepository.java           # Interface Repository gốc (kế thừa JpaRepository, JpaSpecificationExecutor)
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── PartRepository.java
│   ├── TestRepository.java
│   ├── ContextQuestionRepository.java
│   ├── QuestionRepository.java
│   ├── TestResultRepository.java
│   └── UserAnswerRepository.java
│
└── module/                               # TẦNG NGHIỆP VỤ (FEATURE MODULES)
    ├── auth/                             # Nghiệp vụ Xác thực (Đăng ký, Đăng nhập, Refresh Token)
    │   ├── dto/                          # RegisterRequest, LoginRequest, AuthResponseDTO
    │   ├── mapper/                       # AuthMapper (Map Entity User -> AuthResponseDTO)
    │   ├── service/                      # AuthService (Interface) & AuthServiceImpl (Implementation)
    │   └── AuthController.java           # Endpoint: /api/auth/register, /api/auth/login
    │
    ├── user/                             # Nghiệp vụ Thông tin cá nhân, Đổi mật khẩu
    │   ├── dto/                          # UserUpdateProfileRequest, UserChangePasswordRequest, UserProfileResponse
    │   ├── mapper/                       # UserMapper (Map Entity User -> UserProfileResponse)
    │   ├── service/                      # UserService (Interface) & UserServiceImpl (Implementation)
    │   └── UserController.java           # Endpoint: /api/user/me, /api/user/updateprofile, /api/user/changepassword
    │
    ├── test/                             # Nghiệp vụ Luyện thi & Chấm điểm TOEIC (Triển khai tiếp theo)
    │   ├── dto/                          # SubmitTestRequest, TestDetailResponse, TestScoreResponse
    │   ├── mapper/                       # TestMapper
    │   ├── service/                      # TestService, ScoringService (Tính điểm ETS Listening & Reading)
    │   └── TestController.java           # Endpoint: /api/tests/** (Lấy danh sách đề, làm bài, nộp bài)
    │
    └── admin/                            # Nghiệp vụ Quản trị viên (Triển khai tiếp theo)
        ├── dto/                          # CreateTestRequest, UserManagementResponse, DashboardStatsResponse
        ├── service/                      # AdminTestService (Upload đề thi), AdminUserService (Khóa/Mở User)
        └── AdminController.java          # Endpoint: /api/admin/** (Phân quyền ROLE_ADMIN)
```

---

## 🗄️ 2. NGUYÊN TẮC KẾ THỪA BASE ENTITY THEO DATABASE

Để tối ưu hóa và khớp chính xác với CSDL thực tế:

| Base Entity Class | Các trường hỗ trợ | Bảng kế thừa tương ứng |
| :--- | :--- | :--- |
| `BaseCreatedUpdatedEntity` | `id`, `created_at`, `updated_at` | `user`, `role`, `part`, `test`, `context_question`, `question` |
| `BaseCreatedEntity` | `id`, `created_at` | `test_result` (chỉ ghi nhận thời gian nộp bài) |
| `BaseEntity` | `id` | `user_answer` (chỉ lưu vết đáp án lúc nộp) |

---

## 🚀 3. BẢNG MÃ LỖI CHUẨN HOÁ (ERROR CODES)

| Mã lỗi | Enum ErrorCode | HTTP Status | Ý nghĩa |
| :---: | :--- | :---: | :--- |
| **1001** | `INVALID_KEY` | `400 Bad Request` | Yêu cầu không hợp lệ |
| **1002** | `VALIDATION_ERROR` | `400 Bad Request` | Dữ liệu gửi lên không đúng định dạng (`@Valid`) |
| **1003** | `RESOURCE_NOT_FOUND` | `404 Not Found` | Không tìm thấy tài nguyên yêu cầu |
| **1004** | `DATA_INTEGRITY_VIOLATION` | `409 Conflict` | Vi phạm ràng buộc dữ liệu hoặc trùng lặp Database |
| **1005** | `REQUEST_BODY_MALFORMED` | `400 Bad Request` | Định dạng JSON gửi lên sai cú pháp |
| **2001** | `UNAUTHENTICATED` | `401 Unauthorized` | Chưa đăng nhập hoặc token hết hạn/không hợp lệ |
| **2002** | `UNAUTHORIZED` | `403 Forbidden` | Không đủ quyền truy cập tài nguyên |
| **2003** | `USER_NOT_EXISTED` | `404 Not Found` | Người dùng không tồn tại trong hệ thống |
| **2004** | `EMAIL_ALREADY_EXISTS` | `400 Bad Request` | Email đã được sử dụng |
| **2005** | `PHONE_ALREADY_EXISTS` | `400 Bad Request` | Số điện thoại đã được sử dụng |
| **2006** | `INVALID_CREDENTIALS` | `400 Bad Request` | Sai tài khoản hoặc mật khẩu |
| **2007** | `OLD_PASSWORD_INCORRECT` | `400 Bad Request` | Mật khẩu cũ không chính xác |
| **2008** | `NEW_PASSWORD_SAME_AS_OLD`| `400 Bad Request` | Mật khẩu mới không được trùng mật khẩu cũ |
| **2009** | `USER_ACCOUNT_LOCKED` | `403 Forbidden` | Tài khoản đã bị khóa bởi Quản trị viên |
| **3001** | `TEST_NOT_FOUND` | `404 Not Found` | Không tìm thấy bài thi yêu cầu |
| **3002** | `QUESTION_NOT_FOUND` | `404 Not Found` | Không tìm thấy câu hỏi yêu cầu |
| **9999** | `UNCATEGORIZED_EXCEPTION` | `500 Server Error`| Lỗi hệ thống chưa xác định |

---

## 📦 4. ĐỊNH DẠNG API RESPONSE CHUẨN HOÁ

Mọi phản hồi từ hệ thống đều được bọc trong lớp `ApiResponse<T>`:

### Phản hồi Thành công:
```json
{
  "code": 1000,
  "message": "Đăng nhập thành công",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userName": "Nguyễn Văn A",
    "userEmail": "vana@student.ctu.edu.vn",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-09-01 12:00:00"
}
```

### Phản hồi Thất bại (Lỗi Validation):
```json
{
  "code": 1002,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "data": {
    "userEmail": "Email không đúng định dạng",
    "userPassword": "Mật khẩu phải có ít nhất 6 ký tự"
  },
  "timestamp": "2026-09-01 12:00:00"
}
```

---

## 🧭 5. LỘ TRÌNH PHÁT TRIỂN TIẾP THEO

1. **Giai đoạn 3 (Hoàn thiện Entity & Repository)**: Tạo các entity `Part`, `Test`, `ContextQuestion`, `Question`, `TestResult`, `UserAnswer` và JPA Repositories tương ứng.
2. **Giai đoạn 4 (Module Luyện thi TOEIC - `module/test`)**:
   - API lấy danh sách đề thi (phân trang bằng `PageParams` & `PageResponse`).
   - API lấy đề thi làm bài (ẩn đáp án đúng & lời giải).
   - API nộp bài thi + Thuật toán chấm điểm theo barem ETS (Listening: 5-495, Reading: 5-495, Tổng: 10-990).
   - API xem chi tiết kết quả làm bài kèm đáp án đúng, transcript và lời giải.
3. **Giai đoạn 5 (Module Quản trị - `module/admin`)**:
   - API tạo/upload đề thi hoàn chỉnh.
   - API quản lý người dùng (khóa/mở tài khoản, phân quyền Role).
   - API thống kê kết quả làm bài thi của người dùng.
