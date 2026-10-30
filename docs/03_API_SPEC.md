# 03. Đặc tả API

> Tách năng lực hiện có khỏi năng lực cần xây dựng. Trước implementation, xác minh controller, DTO, security config và frontend service.

## 1. Quy ước chung

- Base URL local: `http://localhost:8080/api`.
- Response thành công thường là `ApiResponse<T>`: `code`, `message`, `data`, `timestamp`.
- Phân trang dùng `numberPage` (1-based), `sizeOfPage`, `keyWord`, `sortBy`, `direction`; xem `PageParams` để biết giới hạn.
- Auth hiện gửi `Authorization: Bearer <token>`.
- Không trả stack trace, credential, đáp án hoặc quyền VIP chưa được cấp.

## 2. Endpoint hiện có theo controller

| Module | Method + path | Quyền/ghi chú |
|---|---|---|
| Auth | `POST /auth/register` | Public. |
| Auth | `POST /auth/login` | Public; phát JWT. |
| Auth | `POST /auth/google` | Public; backend xử lý Google ID token. |
| Exam | `GET /exam/list` | Public ở filter-chain; mặc định PUBLISHED nếu không truyền status. |
| Exam | `GET /exam/{testID}` | Lấy test; cần kiểm tra VIP access khi thêm. |
| Exam | `GET /exam/{testID}/parts/{partID}` | Lấy part; audit để tránh lộ đáp án. |
| Exam | `POST /exam/create` | ADMIN/TEACHER qua method security. |
| Exam | `PUT /exam/update/{testID}` | ADMIN/TEACHER. |
| Exam | `PATCH /exam/{testID}/publish`, `/draft` | ADMIN/TEACHER. |
| Exam | `DELETE /exam/delete/{testID}` | ADMIN. |
| User | `GET /user/me` | Authenticated. |
| User | `PATCH /user/updateprofile` | Authenticated; form model/multipart. |
| User | `POST /user/changepassword` | Authenticated. |
| Admin | `GET /admin/users` | ADMIN; phân trang. |
| Admin | `PATCH /admin/changestatus` | ADMIN; khóa/mở khóa. |
| Media | `POST /media/upload` | ADMIN/TEACHER; multipart file/folder/oldUrl. |
| Media | `DELETE /media/delete?url=...` | ADMIN/TEACHER. |

`SecurityConfig` permit request còn lại ở filter chain; endpoint mới phải có method/security rule rõ ràng. Không mặc định `permitAll` là policy an toàn.

## 3. Năng lực cần cho yêu cầu sản phẩm

Các route sau là đề xuất, chưa tồn tại cho tới khi được triển khai. Chốt tên/DTO trước khi code.

### Đăng ký và duyệt giáo viên

- `POST /teacher-applications`: USER gửi hồ sơ; backend tạo yêu cầu/checkout phí đăng ký.
- `GET /teacher-applications/me`: USER xem tình trạng hồ sơ và thanh toán của mình.
- `GET /admin/teacher-applications`: ADMIN lọc/phân trang hồ sơ cần xử lý.
- `POST /admin/teacher-applications/{id}/approve` hoặc `/reject`: ADMIN duyệt/từ chối, ghi actor/thời gian/lý do; duyệt mới cấp role TEACHER.
- Callback thanh toán VNPAY là server-to-server endpoint public có xác minh chữ ký; không xác nhận tiền qua endpoint client-authenticated.

### Thanh toán/đề VIP

- `POST /payments/checkout`: USER tạo giao dịch mua đề/gói; giá lấy từ DB.
- `GET /payments/me`: USER xem giao dịch của mình.
- `GET /admin/payments`: ADMIN tra cứu theo người trả, khoảng ngày, loại sản phẩm và trạng thái; `GET /admin/payments/{id}` xem chi tiết đã lọc dữ liệu nhạy cảm.
- `GET /tests/{id}/access` hoặc trường quyền trong catalog: báo user có quyền hay không, không trả nội dung đề bị khóa.
- Các trạng thái tối thiểu: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `EXPIRED`; ánh xạ mã trạng thái VNPAY phải theo tài liệu merchant đang dùng.

### Kết quả thi

- Submit full test/part nhận `testId`, `partId?`, `totalTime`, và `{questionId, selectedAnswer?}`.
- Backend xác nhận câu thuộc test/part, tự chấm từ DB, lưu `TestResult` + `UserAnswer`, trả summary.
- Liệt kê lịch sử user hiện tại; đọc result detail chỉ khi là owner hoặc admin theo policy.
- Review trả lựa chọn user, đáp án đúng, đúng/sai, explanation và transcript cần thiết.

### VIP/VNPAY

- Tạo checkout request ở server từ user và giá/sản phẩm trong DB.
- Return URL chỉ trình bày trạng thái; không cấp quyền chỉ theo query string.
- IPN/callback xác minh chữ ký/trạng thái và xử lý idempotent.
- API đề kiểm tra entitlement của user.
- Admin transaction listing/detail; đối soát/hoàn tiền chỉ thêm nếu được xác nhận.

### Bảo vệ endpoint

- ADMIN quản lý user, giao dịch và CRUD/xóa đề theo policy.
- USER sửa hồ sơ của mình, nộp bài, xem lịch sử của mình và mở đề đã mua.
- Không tin `userId`, score, correct answer hoặc giá do client gửi khi backend có thể suy ra từ Principal/DB.

### Lớp học và bài tập

- `POST/GET /teacher/classrooms`, `GET/PATCH/DELETE /teacher/classrooms/{classId}`: TEACHER chỉ trên lớp mình sở hữu; tạo mã tham gia có thể revoke/rotate.
- `POST /classrooms/join` nhận mã; `GET /classrooms/{id}/members`; TEACHER duyệt, chặn, gỡ thành viên. USER chỉ xem lớp đã approved.
- `POST/GET/PATCH/DELETE /classrooms/{id}/materials`: upload/list/ẩn-xóa tài liệu, validate loại/kích thước và quyền truy cập.
- `POST /classrooms/{id}/tests`: TEACHER tạo đề private cho lớp. Đề này cần cùng validation/cấu trúc câu như đề hệ thống nhưng khác visibility/owner.
- `POST/GET /classrooms/{id}/assignments`; `PATCH/DELETE /assignments/{id}`; `PATCH /assignments/{id}/deadline` hoặc cập nhật trường deadline.
- `GET /assignments/{id}/submissions`: danh sách nộp/chưa nộp, trạng thái trễ, điểm/nhận xét; cho phép sort score/name theo allowlist server-side.
- `POST /assignments/{id}/submissions`: USER thuộc lớp submit; backend đóng/mở theo dueAt và late policy.
- `PATCH /submissions/{id}/feedback`: TEACHER của lớp thêm/cập nhật điểm và nhận xét.
- Báo cáo lớp: thống kê nộp/thiếu/trễ, điểm trung bình trên submission đã chấm và danh sách sắp xếp theo điểm/tên.
- Luôn kiểm tra owner lớp/member approved cho từng route; không dựa trên ID khó đoán.

### Thông báo và thống kê

- `GET /notifications/me?unreadOnly=...`; `PATCH /notifications/{id}/read`; `PATCH /notifications/read-all` chỉ cho recipient.
- Sự kiện tối thiểu: bài tập mới/gia hạn hoặc đổi deadline, giáo viên nhận xét submission, thanh toán giáo viên xác nhận, hồ sơ giáo viên được duyệt/từ chối.
- `GET /admin/metrics/overview` và `/admin/metrics/tests?from=&to=&granularity=day`: ADMIN; online count, lượt làm bắt đầu/nộp, series theo ngày. Metric/timezone và cửa sổ online phải được định nghĩa; aggregate tránh trả danh tính user không cần thiết.
- Với dashboard online, ưu tiên heartbeat/cache TTL; không tạo một request polling quá dày hoặc lưu hành vi nhạy cảm không cần thiết.

### Tính năng học tập bổ sung (đề xuất)

- Diagnostic/goal: `POST /learning/diagnostics`, `GET/POST/PATCH /learning/goals/me`; kết quả theo Part, mục tiêu điểm/ngày thi và study plan versioned. Không phát sinh scaled score nếu không có conversion phù hợp.
- Sổ câu sai: `GET /learning/review-queue`, `POST /learning/review-queue/{questionId}/reviewed`, `DELETE /learning/review-queue/{questionId}`; derive từ attempt đã nộp, không nhận answer key từ client.
- Ôn tập theo lịch: `GET /learning/reviews/due`; sau khi hoàn thành gửi mức tự đánh giá hoặc câu trả lời để update `nextReviewAt` theo thuật toán được chốt.
- Resume session: `POST /exam-sessions`, `PATCH /exam-sessions/{id}/answers`, `GET /exam-sessions/active`, `POST /exam-sessions/{id}/submit`; server xác thực owner, expiration, test version, assignment deadline và idempotency.
- Báo lỗi nội dung: `POST /content-issues`; Admin `GET/PATCH /admin/content-issues` theo trạng thái/priority. Không cho người dùng sửa answer key.
- Notification preference: `GET/PATCH /notifications/preferences/me`; kênh/email/push và quiet-hours chỉ triển khai khi có hạ tầng gửi phù hợp.
- Nội dung endpoint trên chỉ là phác thảo capability, không ràng buộc URL cuối.

### Báo cáo mở rộng (đề xuất)

- Lớp: hỗ trợ export CSV/XLSX theo permission, cùng bộ lọc/sắp xếp với gradebook; xuất đúng scope classroom và audit người tải.
- Admin: funnel catalog → checkout → payment success → exam started → submitted; chỉ ghi event aggregate cần thiết và tách event có PII.
- Content quality: API version/revision để báo lỗi và kết quả cũ tham chiếu đúng đề tại thời điểm làm.

## 4. Đồng bộ frontend/backend

- JS service cần khớp URL, method, content type, query, JSON property và response envelope.
- Giữ lỗi phân biệt cho 401, 403, 404, validation 400 và lỗi thanh toán.
- Không dùng payload test chứa `correctAnswer` cho UI thi; tạo DTO public riêng.
- `apiClient.js` hiện hardcode localhost; chuyển base URL sang env khi có yêu cầu cấu hình môi trường.

## 5. Kiểm soát bảo mật xuyên API

- Duy trì route authorization matrix; deny-by-default và chỉ allowlist endpoint public có chủ đích. Mỗi endpoint kiểm tra quyền đối tượng/ownership, không chỉ role hay ID.
- Dùng DTO allowlist cho request/response; không bind entity trực tiếp, không nhận role/owner/score/payment status/answer key từ client như sự thật.
- Rate limit auth/reset/OTP, catalog/media, submit, upload, checkout và endpoint tốn tài nguyên; giới hạn pagination/filter/body và whitelist sort field.
- Phân biệt response catalog, attempt và review. Answer key/explanation chỉ trả sau khi quyền và trạng thái attempt cho phép; content VIP cần entitlement phía server.
- Idempotency/transaction bắt buộc cho callback payment/cấp entitlement và submit có thể được retry. Không ghi credentials/callback secret vào log.
- Nếu auth dùng cookie, thiết kế CSRF và Origin policy; nếu bearer-only, không để trình duyệt tự gửi cookie xác thực. CORS chỉ allowlist origin, không cấp quyền.
- Trước khi thêm/sửa route, ghi rõ authentication, role, owner/member constraint, dữ liệu trả về, input/rate/body limit và tính idempotent. Kiểm tra quyền chéo cho attempt/history/review, đề/media VIP, lớp/member/material, assignment/submission/feedback và payment/admin.
- Tham chiếu checklist và hiện trạng có giới hạn tại `docs/06_SECURITY_SPEC.md`; route trong tài liệu không chứng minh rằng route đã tồn tại hoặc được bảo vệ đúng.

