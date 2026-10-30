# Hướng dẫn AI khi làm việc với TOEIC Learning

## Mục tiêu tài liệu

Đây là chỉ dẫn dành cho AI agent làm việc trong repository. Bắt đầu từ `PROJECT_CONTEXT.md` (tóm tắt dưới 100 dòng), rồi đọc bộ tài liệu chi tiết trong `docs/` theo tác vụ. Bộ `docs/01`–`06` là đặc tả sản phẩm hiện hành cần được chủ dự án duyệt. Khi tài liệu khác nhau, `AGENTS.md` quy định cách làm, docs mô tả ý định sản phẩm, mã nguồn/schema mô tả trạng thái thực tế.

Người dùng đang duyệt và chỉnh sửa bộ đặc tả trong `docs/`. **Không triển khai hoặc sửa code chỉ dựa trên docs cho đến khi người dùng yêu cầu rõ ràng.** Khi được yêu cầu code, hãy đọc bản docs mới nhất và xác minh lại trạng thái mã nguồn.

## Quy trình bắt đầu mỗi tác vụ

1. Đọc `AGENTS.md`, sau đó `PROJECT_CONTEXT.md`.
2. Trước mọi tác vụ làm thay đổi dự án, đọc đủ sáu tài liệu `docs/01_OVERVIEW.md` đến `docs/06_SECURITY_SPEC.md`; sau đó xác định phần áp dụng trực tiếp. Đây là yêu cầu bắt buộc để giữ nhất quán giữa nghiệp vụ, dữ liệu, API, luồng, UI và bảo mật.
3. Kiểm tra `git status`, rồi đọc controller/service/entity/request/response hoặc component liên quan trong mã nguồn.
4. Phân biệt trạng thái code, yêu cầu đã chốt, và đề xuất/câu hỏi mở. Không coi đề xuất là quyết định.
5. Nếu đặc tả mâu thuẫn hoặc thiếu chi tiết, tiếp tục phần độc lập; hỏi khi quyết định ảnh hưởng lớn tới dữ liệu/hành vi.
6. Chỉ sửa trong phạm vi tác vụ. Không chạy script SQL có `DROP DATABASE`, không thay đổi dữ liệu ngoài ý muốn.

## Công nghệ và quy ước dự án

- Backend Java 17, Spring Boot, Maven, Spring Data JPA, Spring Security, MySQL. Xem version thực trong `backend/pom.xml` (hiện 4.1.0); đừng dùng mô tả Spring Boot 3 trong tài liệu cũ như sự thật hiện hành.
- Frontend React, Vite, Tailwind CSS; dùng JavaScript/JSX hiện có, Axios và React Router. Đừng chuyển framework hoặc tạo ứng dụng thứ hai nếu không được yêu cầu.
- Tên bảng snake_case, field Java/JSON theo mapping hiện có; kiểm tra DTO và response thật trước khi tích hợp UI.
- Giữ các quy ước `ApiResponse<T>`, error handling, JWT và RBAC hiện tại trừ khi tác vụ yêu cầu thay đổi.
- Dữ liệu câu hỏi theo quan hệ `Test -> ContextQuestion -> Question`; `orderIndex` là số câu đầu của cụm, `questionNumber` là số thứ tự toàn bài.
- Không đưa bí mật trong `application.properties` vào tài liệu, output, log hoặc frontend. Cấu hình mới nên qua biến môi trường.

## Quy tắc bảo mật bắt buộc

- Trước khi sửa auth, API, dữ liệu, upload/media, payment, lớp học hoặc deploy, đọc `docs/06_SECURITY_SPEC.md` và xác minh trạng thái code hiện tại.
- Mặc định deny-by-default; mọi endpoint phải được phân loại public/authenticated/role và kiểm tra quyền đối tượng ở server. Không tin role, owner, score, answer key, payment status hoặc ID do client cung cấp.
- Validate input, dùng parameterized persistence, request DTO allowlist, response tối thiểu; không lộ answer key trước thời điểm được phép.
- Không lưu/log/commit secret, password, token, OTP hoặc dữ liệu thẻ. Không thêm dependency mà chưa xem xét nguồn gốc, bảo trì và lỗ hổng đã biết.
- Upload phải được giới hạn và kiểm tra nội dung thật; media trả phí/lớp phải kiểm tra quyền. Payment chỉ xác nhận bằng callback đã xác minh phía server và xử lý idempotent.
- Bảo vệ CSRF theo cơ chế credential: bearer header chủ động và cookie tự gửi có yêu cầu khác nhau. Không bật/tắt CSRF máy móc.
- Nêu rõ trong báo cáo điều gì đã xác minh, chưa kiểm thử hoặc còn là rủi ro; không tuyên bố bảo mật tuyệt đối hay nói docs đã được triển khai.

## Nguyên tắc sản phẩm

### Vai trò

- Admin: thêm/sửa/xóa bài thi; khóa/mở khóa tài khoản; quản lý giao dịch VNPAY và quyền mua đề VIP.
- Người dùng: cập nhật hồ sơ, đổi mật khẩu, làm full test, luyện theo từng Part và xem lại bài thi đã làm.
- Backend phải là nơi thực thi quyền, trạng thái thanh toán và quyền truy cập đề. UI guard chỉ hỗ trợ điều hướng.
- Với hệ lớp học, mọi thao tác kiểm tra teacher ownership, classroom membership, trạng thái member và quyền assignment ở server; không tin classId/userId client.
- Phân biệt đã nộp, nộp trễ, chưa nộp, chưa chấm; không tự áp một late policy hoặc quy tắc điểm trung bình khi docs đánh dấu cần chốt.
- Không khẳng định scaled score là điểm ETS chính xác nếu không có raw-to-scaled conversion được phép cho đúng test form; xem `docs/01_OVERVIEW.md`.
- Sản phẩm thương mại phải có quyền phân phối đối với bộ câu hỏi, audio, ảnh, transcript và lời giải.
- Diagnostic/study plan, spaced repetition, resumable sessions, content-issue queue, notification preferences và conversion funnel là đề xuất được ghi nhãn trong docs; chỉ triển khai khi chủ dự án chọn/phê duyệt scope.

### Mô hình thi TOEIC cần bảo toàn

- Quy tắc chi tiết Part 1–7 và các câu hỏi mở nằm trong `docs/02_DATABASE.md` và `docs/04_FLOW_LOGIC.md`; không nhân đôi tại đây.

## Thiết kế UI

- Quy chuẩn UI đề xuất và nguồn tham khảo được ghi ở `docs/05_UI_UX_SPEC.md`; chỉ kế thừa visual style, không chép nghiệp vụ thư viện.

## Kiểm chứng và báo cáo

- Không tự thêm/chạy test trừ khi người dùng yêu cầu kiểm thử hoặc xác minh. Nếu không chạy, ghi rõ.
- Khi được yêu cầu chạy, chọn kiểm tra phù hợp vùng đổi (frontend build/lint, backend compile/test); báo nguyên văn lỗi môi trường quan trọng.
- Kết thúc tác vụ implementation bằng danh sách file và thay đổi chính, kiểm chứng đã chạy/chưa chạy, và các giới hạn còn lại.
- Khi tác vụ chỉ yêu cầu viết/duyệt tài liệu, không sửa code.

## Bản đồ tài liệu đặc tả

- `docs/01_OVERVIEW.md`: mục tiêu, vai trò, hệ thống và thứ tự đọc.
- `docs/02_DATABASE.md`: entity, quan hệ, câu TOEIC, payment, lớp, bài tập, dữ liệu học tập, quyền và migration.
- `docs/03_API_SPEC.md`: API hiện có/mục tiêu cho thi, VNPAY, teacher onboarding, lớp, học tập cá nhân, metrics, thông báo.
- `docs/04_FLOW_LOGIC.md`: luồng catalog, thi/review, lớp/assignment, diagnostic, ôn tập, resume và vận hành.
- `docs/05_UI_UX_SPEC.md`: visual system và màn hình user/teacher/admin, cá nhân hóa, quality queue, responsive/accessibility.
- `docs/06_SECURITY_SPEC.md`: threat model, auth/session, authorization, API, upload, VNPAY, privacy, vận hành và security acceptance checklist.

