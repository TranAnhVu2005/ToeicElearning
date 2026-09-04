# TOEIC LEARNING SYSTEM - NIÊN LUẬN NGÀNH CÔNG NGHỆ THÔNG TIN (CTU)

> Hệ thống luyện thi TOEIC trực tuyến (Full Test, Luyện theo Part 1-7, Luyện câu sai, Nghe chép chính tả, Streak học tập, Leo rank & Quản trị đề thi).

---

## 🏛️ 1. KIẾN TRÚC THƯ MỤC BACKEND CHUẨN (CLEAN ARCHITECTURE)

Toàn bộ mã nguồn backend được tổ chức theo mô hình **Domain/Layered Clean Architecture**, đảm bảo tính độc lập, dễ mở rộng và chuẩn chuyên nghiệp như các dự án Enterprise.

```text
backend/src/main/java/com/ctu_cit_nienLuanNganh/toeicLearning/
│
├── common/                               # CÁC THÀNH PHẦN DÙNG CHUNG TOÀN HỆ THỐNG
│   ├── constant/                         # Hằng số hệ thống
│   ├── enums/                            # Danh mục Enum nghiệp vụ
│   │   ├── ErrorCode.java                # Danh mục mã lỗi chuẩn hoá kèm HTTP Status (1000 - 3999)
│   │   ├── RoleType.java                 # ROLE_USER, ROLE_ADMIN
│   │   ├── PartType.java                 # PART_1 -> PART_7, FULL_TEST
│   │   └── QuestionAnswer.java           # A, B, C, D
│   ├── dto/                              # DTO dùng chung cho Response & Pagination
│   │   ├── ApiResponse.java              # Format JSON chuẩn: code, message, data, timestamp
│   │   ├── PageResponse.java             # Format phân trang chuẩn: content, pageNumber, totalPages...
│   │   └── PageParams.java               # Nhận query params: pageNumber, pageSize, sortBy, direction, keyword
│   └── exception/                        # Quản lý ngoại lệ tập trung
│       ├── AppException.java             # Base Custom Runtime Exception gắn liền với ErrorCode
│       └── GlobalExceptionHandler.java   # Bắt & chuyển đổi toàn bộ Exception sang ApiResponse
│
├── config/                               # CẤU HÌNH HỆ THỐNG SPRING BOOT
│   └── SecurityConfig.java               # Cấu hình Spring Security, Stateless JWT, CORS, Method Security
│
├── security/                             # BỘ XỬ LÝ BẢO MẬT & JWT TOKEN
│   ├── JwtService.java                   # Tạo token, trích xuất userId/claims, kiểm tra token hết hạn
│   ├── JwtAuthenticationFilter.java      # Filter chặn mọi request, xác thực Bearer token & gán Role
│   ├── JwtAuthenticationEntryPoint.java  # Xử lý trả về JSON chuẩn khi bị lỗi 401 (Chưa đăng nhập / Token sai)
│   └── JwtAccessDeniedHandler.java       # Xử lý trả về JSON chuẩn khi bị lỗi 403 (User truy cập tài nguyên Admin)
│
├── entity/                               # TOÀN BỘ ENTITY DATABASE TẬP TRUNG
│   ├── base/
│   │   └── BaseEntity.java               # Base entity: id (UUID), createdAt, updatedAt (JPA Auditing)
│   ├── Role.java                         # Bảng phân quyền (ROLE_USER, ROLE_ADMIN)
│   ├── User.java                         # Bảng người dùng (email, số điện thoại, mật khẩu, avatar, khóa tài khoản)
│   ├── Part.java                         # Bảng 7 Part trong đề thi TOEIC (Part 1 -> Part 7)
│   ├── Test.java                         # Bảng đề thi (Full Test hoặc Mini Test)
│   ├── ContextQuestion.java              # Nhóm câu hỏi (Audio URL, Image URL, Paragraph đọc, Transcript nghe)
│   ├── Question.java                     # Bảng câu hỏi chi tiết (Nội dung, 4 đáp án A-B-C-D, đáp án đúng, giải thích)
│   ├── TestResult.java                   # Lịch sử làm bài (Điểm Listening, Reading, Total theo barem ETS, số câu đúng)
│   └── UserAnswer.java                   # Chi tiết đáp án người dùng đã chọn cho từng câu (selected_answer, is_correct)
│
├── repository/                           # TẦNG TRUY VẤN DỮ LIỆU (SPRING DATA JPA)
│   ├── RoleRepository.java
│   ├── UserRepository.java
│   ├── PartRepository.java
│   ├── TestRepository.java
│   ├── ContextQuestionRepository.java
│   ├── QuestionRepository.java
│   ├── TestResultRepository.java
│   └── UserAnswerRepository.java
│
└── module/                               # TẦNG NGHIỆP VỤ (MODULES / FEATURES)
    ├── auth/                             # Nghiệp vụ Đăng ký, Đăng nhập, Token
    │   ├── dto/                          # LoginRequest, RegisterRequest, AuthResponseDTO
    │   ├── mapper/                       # AuthMapper (Map Entity User -> AuthResponseDTO)
    │   ├── service/                      # AuthService, AuthServiceImpl
    │   └── AuthController.java           # Endpoint: /api/auth/register, /api/auth/login
    │
    ├── user/                             # Nghiệp vụ Thông tin cá nhân, Đổi mật khẩu
    │   ├── dto/                          # UserResponseDTO, UserUpdateProfileRequest, UserChangePasswordRequest
    │   ├── mapper/                       # UserMapper (Map Entity User -> UserResponseDTO)
    │   ├── service/                      # UserService, UserServiceImpl
    │   └── UserController.java           # Endpoint: /api/user/me, /api/user/updateprofile, /api/user/changepassword
    │
    ├── test/                             # Nghiệp vụ Luyện thi & Chấm điểm TOEIC
    │   ├── dto/                          # SubmitTestRequest, TestDetailResponse, TestScoreResponse
    │   ├── mapper/                       # TestMapper
    │   ├── service/                      # TestService (Lấy đề, nộp bài, tính điểm ETS 0-990)
    │   └── TestController.java           # Endpoint: /api/tests/** (Lấy danh sách đề, làm full test, luyện part)
    │
    └── admin/                            # Nghiệp vụ Quản trị viên
        ├── dto/                          # CreateTestRequest, UserManagementResponse, DashboardStatsResponse
        ├── service/                      # AdminTestService (Upload đề thi), AdminUserService (Khóa/Mở User)
        └── AdminController.java          # Endpoint: /api/admin/** (Chỉ có quyền ROLE_ADMIN mới được truy cập)
```

---

## 🚀 2. BẢNG MÃ LỖI CHUẨN HOÁ (ERROR CODE SYSTEM)

| Mã lỗi | Enum ErrorCode | HTTP Status | Ý nghĩa |
| :---: | :--- | :---: | :--- |
| **1000** | `SUCCESS` | `200 OK` | Thao tác thành công mặc định |
| **1001** | `INVALID_KEY` | `400 Bad Request` | Yêu cầu không hợp lệ |
| **1002** | `VALIDATION_ERROR` | `400 Bad Request` | Dữ liệu gửi lên không đúng định dạng (`@Valid`) |
| **1003** | `RESOURCE_NOT_FOUND` | `404 Not Found` | Không tìm thấy tài nguyên (URL hoặc dữ liệu) |
| **1004** | `DATA_INTEGRITY_VIOLATION` | `409 Conflict` | Vi phạm ràng buộc dữ liệu hoặc trùng lặp Database |
| **1005** | `REQUEST_BODY_MALFORMED` | `400 Bad Request` | Định dạng JSON gửi lên sai cú pháp |
| **2001** | `UNAUTHENTICATED` | `401 Unauthorized` | Chưa đăng nhập hoặc token hết hạn/không hợp lệ |
| **2002** | `UNAUTHORIZED` | `403 Forbidden` | Không đủ quyền truy cập (User thường gọi API Admin) |
| **2003** | `USER_NOT_EXISTED` | `404 Not Found` | Người dùng không tồn tại trong hệ thống |
| **2004** | `EMAIL_ALREADY_EXISTS` | `400 Bad Request` | Email đã được sử dụng |
| **2005** | `PHONE_ALREADY_EXISTS` | `400 Bad Request` | Số điện thoại đã được sử dụng |
| **2006** | `INVALID_CREDENTIALS` | `400 Bad Request` | Sai tài khoản hoặc mật khẩu |
| **2007** | `OLD_PASSWORD_INCORRECT` | `400 Bad Request` | Mật khẩu cũ không chính xác |
| **2008** | `NEW_PASSWORD_SAME_AS_OLD`| `400 Bad Request` | Mật khẩu mới không được trùng mật khẩu cũ |
| **2009** | `USER_ACCOUNT_LOCKED` | `403 Forbidden` | Tài khoản đã bị khóa bởi Admin |
| **3001** | `TEST_NOT_FOUND` | `404 Not Found` | Không tìm thấy bài thi yêu cầu |
| **3002** | `QUESTION_NOT_FOUND` | `404 Not Found` | Không tìm thấy câu hỏi yêu cầu |
| **9999** | `UNCATEGORIZED_EXCEPTION` | `500 Server Error`| Lỗi hệ thống chưa xác định |

---

## 📦 3. ĐỊNH DẠNG API RESPONSE CHUẨN HOÁ

Mọi phản hồi từ Backend (cho cả thành công và thất bại) đều trả về 1 format JSON duy nhất:

### Thành công:
```json
{
  "code": 1000,
  "message": "Đăng nhập thành công",
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "userName": "Trần Anh Vũ",
    "userEmail": "vub2014798@student.ctu.edu.vn",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-08-30 11:30:00"
}
```

### Thất bại (Nghiệp vụ hoặc Validation):
```json
{
  "code": 1002,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "data": {
    "userEmail": "Email không đúng định dạng",
    "userPassword": "Password must at least 6 characters"
  },
  "timestamp": "2026-08-30 11:30:00"
}
```

---

## 🗺️ 4. LỘ TRÌNH TRIỂN KHAI CÁC TÍNH NĂNG TIẾP THEO

1. **Giai đoạn 3 (Entity & Repositories)**: Hoàn thiện toàn bộ các Entity (`Part`, `Test`, `ContextQuestion`, `Question`, `TestResult`, `UserAnswer`) kế thừa `BaseEntity` và tạo các JPA Repositories tương ứng.
2. **Giai đoạn 4 (Module Luyện thi cho User)**:
   - API lấy danh sách đề thi (phân trang).
   - API lấy chi tiết đề thi làm bài (ẩn đáp án đúng).
   - API nộp bài thi + Thuật toán chấm điểm theo barem ETS (Listening 5-495, Reading 5-495, Tổng điểm 10-990).
   - API xem lại chi tiết bài làm kèm lời giải thích & transcript câu nghe.
   - API luyện tập riêng từng Part hoặc luyện tập lại những câu làm sai.
3. **Giai đoạn 5 (Module Quản trị viên - Admin)**:
   - Upload đề thi hoàn chỉnh (ghép audio, hình ảnh, câu hỏi).
   - Quản lý danh sách người dùng (khóa/mở khóa tài khoản, phân quyền Admin/User).
   - Báo cáo thống kê (số lượng bài thi đã làm mỗi ngày, số thành viên hoạt động).
4. **Giai đoạn 6 (Mở rộng nâng cao)**:
   - Tính năng Nghe chép chính tả (Dictation).
   - Tính năng Streak học tập liên tục (thông báo nhắc nhở qua Email).
   - Bảng xếp hạng Leo rank (Leaderboard dựa trên điểm số và độ chuyên cần).
