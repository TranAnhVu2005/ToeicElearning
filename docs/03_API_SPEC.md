# 03. Đặc tả API

> Tách năng lực hiện có khỏi năng lực cần xây dựng. Trước implementation, xác minh controller, DTO, security config và frontend service.

> API mới tiếp tục nằm trong backend Spring Boot hiện tại và được gọi từ React SPA qua REST/Axios. Tái sử dụng controller/service/repository/DTO conventions hiện có; không chuyển sang BFF, GraphQL hoặc service riêng nếu chưa có yêu cầu rõ từ chủ dự án.

## 1. Quy ước chung

- Base URL local: `http://localhost:8080/api`.
- Response thành công thường là `ApiResponse<T>`: `code`, `message`, `data`, `timestamp`.
- Phân trang dùng `numberPage` (1-based, giới hạn 1–10.000), `sizeOfPage` (1–100, mặc định 10), `keyWord`, `sortBy` (chỉ nhận allowlist: `id`, `createdAt`, `updatedAt`, `userName`, `userEmail`, `isLocked`, `totalScore`, `currentStreak`, `highestStreak`, `titleTest`, `status`; ngoài danh sách tự động lùi về `createdAt`), `direction` (`ASC`/`DESC`); `GlobalExceptionHandler` đồng thời bắt `PropertyReferenceException` trả `400 VALIDATION_ERROR`.
- `PageResponse` trả `content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `isFirst` và `isLast`; giữ nguyên tên hai field boolean này để client khóa đúng nút phân trang.
- Auth hiện gửi `Authorization: Bearer <token>`.
- Không trả stack trace, credential, đáp án hoặc quyền VIP chưa được cấp.

## 2. Endpoint hiện có theo controller

| Module | Method + path | Quyền/ghi chú |
|---|---|---|
| Auth | `POST /auth/register` | Public; giới hạn theo IP (10 request) và cặp IP + email chuẩn hóa (5 request) trong 15 phút. |
| Auth | `POST /auth/login` | Public; phát JWT và giới hạn 20 lần thất bại/IP hoặc 8 lần thất bại trên cặp IP + định danh trong 15 phút. Nếu tài khoản đang bị khóa (`isLocked == true`), trả lỗi `403 USER_ACCOUNT_LOCKED` (code `2009`: *"Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên"*) thay vì báo sai mật khẩu, giúp người dùng biết rõ nguyên nhân để liên hệ quản trị viên; ghi nhận audit đăng nhập thất bại và tăng bộ đếm rate limit. |
| Auth | `POST /auth/google` | Public; giới hạn 30 request/IP/15 phút; backend xác minh chữ ký Google JWK, issuer, audience, hạn token và email đã xác minh; không đặt ID token vào URL. |
| Exam | `GET /exam/list` | Public, chỉ đề hệ thống PUBLISHED; view catalog không chứa context/question. Hỗ trợ `category=ALL|FULL|LISTENING|READING` để lọc toàn bộ đề 200 câu hoặc đề có Part thuộc nhóm tương ứng; giới hạn 120 request/IP/15 phút. |
| Exam | `GET /exam/{testID}/access` | Public metadata/access; classroom test chỉ phản hồi cho member APPROVED; giới hạn 120/IP và 60/user mỗi 15 phút. |
| Exam | `GET /exam/{testID}` | Authenticated; service kiểm tra publish, entitlement VIP và membership lớp trước khi trả câu/media; giới hạn 60/IP và 30/user mỗi 15 phút. |
| Exam | `GET /exam/{testID}/parts/{partID}` | Route public ở filter-chain nhưng service kiểm tra VIP/classroom entitlement trước khi trả part; giới hạn 60/IP và 30/user mỗi 15 phút. |
| Exam | `GET /exam/{testID}/dictation` | Authenticated; kiểm tra quyền đề trước khi trả transcript; giới hạn 60/IP và 30/user mỗi 15 phút. |
| Exam | `POST /exam/submit`, `POST /exam/sessions` | Authenticated; giới hạn 30/IP và 15/user mỗi 15 phút. `POST /exam/sessions` tạo mới hoặc khôi phục phiên `ACTIVE` (`restartActive: false` khi reload trang). |
| Exam | `PATCH /exam/sessions/{sessionId}/answers` | Authenticated; autosave giới hạn 600/IP và 600/user mỗi 15 phút để hỗ trợ thao tác làm bài liên tục. |
| Exam | `DELETE /exam/sessions/{sessionId}` | Authenticated; chủ sở hữu phiên hủy bỏ phiên làm bài (`CANCELLED`) và xóa dữ liệu nháp khi xác nhận thoát phòng thi không nộp. |
| Exam | `GET /exam/{testId}/comments`, `POST /exam/{testId}/comments` | `GET` public trả danh sách bình luận đề thi; `POST` authenticated tạo bình luận mới (1–2000 ký tự, kiểm tra tài khoản không bị khóa). |
| Exam | `PUT /exam/comments/{commentId}`, `DELETE /exam/comments/{commentId}` | Authenticated; chỉ tác giả được sửa/xóa bình luận của mình (`ROLE_ADMIN` có quyền xóa kiểm duyệt). |
| Exam | `POST /exam/create`, `PUT /exam/update/{testID}` | ADMIN quản lý đề hệ thống (từ chối đề thuộc lớp với `TEST_NOT_FOUND`); TEACHER dùng routes scope riêng dưới `/exam/classrooms/{id}/tests`. `POST /exam/create` và `POST /exam/classrooms/{id}/tests` trả về `ApiResponse<String>` chứa `testId` vừa tạo để trình soạn thảo chuyển ngay sang chế độ `edit` khi lưu bản nháp. Khi cập nhật đề (`PUT`), backend thực hiện `upsertTestDetailInPlace` cập nhật tại chỗ `ContextQuestion`/`Question` để giữ nguyên ID câu hỏi cho lịch sử `UserAnswer` và kiểm tra tính hợp lệ nội dung nếu `status = PUBLISHED` (Part 6 cho phép câu điền chỗ trống để trống `questionContent`). |
| Exam | `PATCH /exam/update/{testID}/metadata` | ADMIN; chỉ áp dụng cho đề hệ thống (`classroom == null`), cập nhật nhanh tên đề, ảnh bìa, trạng thái và cấu hình VIP mà không cần gửi lại 200 câu hỏi; khi chuyển sang PUBLISHED, backend kiểm tra quyền media và nội dung đề. Request allowlist `titleTest`, `coverImageUrl`, `clearCoverImage`, `status`, `isVip`, `vipPriceVnd`. |
| Exam | `PATCH /exam/{testID}/publish`, `/draft` | ADMIN quản lý đề hệ thống (`classroom == null`); TEACHER publish đề riêng qua route classroom. |
| Exam | `DELETE /exam/delete/{testID}` | ADMIN (chỉ đề hệ thống); nếu có lượt làm, giao dịch, assignment hoặc phiên thi đang active tham chiếu thì chuyển về DRAFT và trả `ARCHIVED`; nếu chưa có tham chiếu thì xóa các phiên hết hạn/hủy, xóa đề, nội dung và media/ảnh bìa không còn được đề khác dùng, trả `DELETED`. |
| User | `GET /user/me` | Authenticated; trả thông tin hồ sơ kèm `currentStreak`, `highestStreak`, `totalScore`, `lastActiveDate`, `hasLocalPassword`, `canSetLocalPassword`. |
| User | `PATCH /user/updateprofile` | Authenticated; khóa dòng user khi cập nhật, kiểm tra tài khoản không bị khóa, chuẩn hóa tên/email/số điện thoại, multipart avatar dùng cùng kiểm tra decode JPEG/PNG ≤5 MiB. |
| User | `POST /user/changepassword` | Authenticated; xác minh mật khẩu cũ, đổi hash, tăng `authVersion` để thu hồi JWT cũ; người dùng đăng nhập lại. Google-only account chưa đặt mật khẩu cục bộ cần dùng route bên dưới. |
| User | `POST /user/setpassword` | Authenticated; chỉ tài khoản có `google_sub` và chưa có mật khẩu cục bộ. Request gồm `googleIdToken` còn mới (iat không quá 5 phút) và `newUserPassword` 6–100 ký tự. Server xác minh chữ ký/audience/issuer/thời hạn, subject phải trùng tài khoản hiện tại; lưu BCrypt, tăng `authVersion` và yêu cầu đăng nhập lại. Không nhận email làm bằng chứng liên kết. |
| Admin | `GET /admin/users` | ADMIN; phân trang. |
| Admin | `PATCH /admin/changestatus` | ADMIN; khóa/mở khóa. |
| Media | `POST /media/upload` | ADMIN/TEACHER; multipart file/folder; JPEG/PNG decoded before upload (≤5 MiB), MP3/WAV/M4A signature checked (≤20 MiB), app namespace only; max 30 requests/IP and 20/user per 15 minutes. Cover ảnh công khai lưu tại `Resource/toeic-learning/exams/{slug}/covers`; private exam upload registers server-returned public ID/format/resource/delivery type with the uploader; TEACHER may attach only their own registered private media. Client cannot request deletion of an old URL. |
| Media | `DELETE /media/delete?url=...` | Disabled/removed: client-supplied URL cannot prove asset ownership. Server cleanup only accepts HTTPS assets on the configured Cloudinary account under the app namespace. |
| AI | `POST /ai/chat` | Public cho câu hỏi hướng dẫn sử dụng hệ thống và kiến thức TOEIC chung; yêu cầu đã xác thực và xác minh quyền sở hữu `TestResult` phía server khi đính kèm `resultId` để giải thích câu hỏi/bài làm đã hoàn thành. Giới hạn 60 request/IP và 45 request/user mỗi 15 phút. |
| AI Voice | `POST /ai/voice-chat` | **Authenticated bắt buộc** (`ROLE_USER`/`TEACHER`/`ADMIN`, không bị khóa); nhận `multipart/form-data` (`audio` ≤ 4 MiB ưu tiên chuẩn `16kHz mono PCM WAV`, `resultId`, `questionId`, `questionNumber`, `pageContext`, `historyJson`, `languageHint`, `clientTranscript`). Kiểm tra magic bytes (`audio/wav`, `audio/webm`, `audio/ogg`, `audio/mp4`, `audio/mp3`) trên RAM không lưu đĩa; gọi Gemini multimodal trích xuất `userTranscript` + `reply` kèm cơ chế dự phòng `SMART_VOICE_TUTOR` từ `clientTranscript` và chuẩn hóa số câu tiếng Việt bằng chữ (*"câu tám"* -> `8`), ghi `AuditEvent` không chứa audio/transcript. Giới hạn 30 request/IP và 20 request/user mỗi 15 phút. |
| AI TTS | `POST /ai/tts` | Public; nhận JSON `{ text, lang }` (`vi` hoặc `en`), làm sạch Markdown và tổng hợp âm thanh giọng đọc tiếng Việt/Anh chuẩn `audio/mpeg` (`Cache-Control: no-store`) phục vụ nút Loa đọc câu trả lời trên mọi trình duyệt (kèm fallback `speechSynthesis` ở client). Giới hạn 90 request/IP và 60 request/user mỗi 15 phút. |

`SecurityConfig` chỉ allowlist public các method/route cần thiết; mọi request không khớp route public đều cần xác thực. Endpoint mới phải được phân loại public/authenticated/role rõ ràng và thêm authorization ở controller/service khi cần; không mở rộng wildcard `permitAll`.

Auth endpoints trả `429 AUTH_RATE_LIMITED` khi vượt ngưỡng. Bucket định danh ghép IP với định danh đã chuẩn hóa để tránh một nguồn đơn lẻ khóa đăng nhập của cùng email/số điện thoại từ mạng khác. Bộ đếm được lưu trong MySQL và chỉ lưu hash bucket; IP lấy từ kết nối trực tiếp, không tin header forwarded theo mặc định.

## 3. Năng lực cần cho yêu cầu sản phẩm

Các route ghi rõ “đã có” được đối chiếu với controller hiện tại; các route còn lại là mục tiêu/đề xuất. Route presence và metrics hiện hành nằm ở mục Thông báo và thống kê.

### Đăng ký và duyệt giáo viên

- **Đã có** `POST /api/teacher-applications`: USER tạo hoặc tái tạo liên kết thanh toán PayOS; phí lấy từ cấu hình server (`TEACHER_APPLICATION_FEE_VND`, mặc định `2000` VND), response có `checkoutUrl` và mã đơn PayOS (`transactionReference` / `payosOrderCode`). Khi hồ sơ đang ở `PENDING_PAYMENT` mà liên kết cũ đã hết hạn, hệ thống đồng bộ trạng thái với PayOS trước rồi cấp mã đơn PayOS mới trên bản ghi giao dịch hiện có để người dùng tạo lại mã QR.
- **Đã có** `GET /api/teacher-applications/me`: USER xem hồ sơ mới nhất của mình (tự động đồng bộ trạng thái giao dịch PayOS nếu đang chờ).
- **Đã có** `GET /api/admin/teacher-applications?status=&page=&size=`: ADMIN lọc/phân trang.
- **Đã có** `PATCH /api/admin/teacher-applications/{id}/approve` và `/reject`: ADMIN duyệt/từ chối (reject cần lý do); chỉ approve mới cấp role TEACHER.
- **Đã có** `POST /api/payments/payos/webhook` và `POST /api/payments/webhook`: endpoint public nhận Webhook từ PayOS; xác minh chữ ký HMAC-SHA256 (`PAYOS_CHECKSUM_KEY`) trên đối tượng `data` sắp xếp theo thứ tự bảng chữ cái, kiểm tra `orderCode`, số tiền VND và trạng thái trước khi chuyển sang `SUCCESS`/`FAILED`. Khi PayOS Dashboard gửi ping kiểm tra kết nối với `orderCode` mẫu không tồn tại local, endpoint xác minh chữ ký và phản hồi `200 OK` (`error: 0`).
- **Đã có** `GET /api/payments/payos/return`: nhận redirect từ PayOS và chuyển hướng trình duyệt về trang kết quả frontend (`/payment/result?txnRef=...`), không tự ghi nhận thanh toán từ query string.
- **Đã có** `GET /api/payments/me/{transactionReference}`: chỉ chủ giao dịch đã đăng nhập đọc trạng thái (kèm tự động đồng bộ từ PayOS API `GET /v2/payment-requests/{orderCode}`).
- Phí giáo viên cấu hình qua `TEACHER_APPLICATION_FEE_VND` (mặc định `2000`); PayOS cấu hình qua `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PAYOS_API_BASE_URL` (mặc định `https://api-merchant.payos.vn`), `PAYOS_FRONTEND_RESULT_URL` (mặc định `${FRONTEND_URL}/payment/result`).

### Thanh toán/đề VIP (PayOS)

- Catalog JSON view không serialize `contextQuestions`; detail dùng view riêng và kiểm tra entitlement ở service trước khi trả nội dung. Không dựa vào JSON view để thay authorization.

- Yêu cầu đã chốt: mỗi đề VIP có giá riêng do admin cấu hình; mua một lần, entitlement vĩnh viễn. Endpoint quản trị tạo/sửa đề validate giá VND; endpoint checkout chỉ nhận định danh đề và khóa chống gửi lặp phù hợp, tự lấy user từ Principal cùng giá/trạng thái đề từ DB. Không nhận amount, owner hoặc product type có thẩm quyền từ client.
- `POST /api/payments/vip/checkout` (authenticated): body chỉ nhận `testId`; user lấy từ Principal, đề phải PUBLISHED/VIP, giá đọc từ DB. Tạo payment snapshot và gọi PayOS API `/v2/payment-requests` tạo link thanh toán QR; không nhận amount từ client.
- Checkout giới hạn 20 request/IP và 10/user mỗi 15 phút. Endpoint Webhook PayOS áp dụng ngưỡng bảo vệ cao 1.000 request/IP/15 phút để giảm lạm dụng mà không cản webhook retry thông thường.
- `GET /api/payments/me?page=1&size=10`: USER/TEACHER/ADMIN đã đăng nhập xem giao dịch thuộc chính tài khoản, mới nhất trước; page size tối đa 50. Response dùng DTO allowlist, không trả payload callback/provider secrets. `GET /api/payments/me/{transactionReference}` tiếp tục hỗ trợ tra cứu từng giao dịch owner-scoped.
- `GET /api/admin/payments`: ADMIN tìm kiếm giao dịch theo trạng thái, thời gian, payer/email/mã đơn PayOS (`payosOrderCode`) và `productType=TEACHER_APPLICATION|TEST_VIP`; response có payer, `productType`, amount, trạng thái, thời gian tạo và `paidAt`.
- `GET /api/admin/payments/{paymentId}`: ADMIN xem chi tiết giao dịch; ngoài các field lịch sử, response có `payosOrderCode`, `payosReference`, `payosCode`, `payosStatus` để tra cứu đối soát. Không trả signature, secret hoặc raw callback payload.
- `GET /tests/{id}/access` hoặc trường quyền trong catalog: báo user có quyền hay không, không trả nội dung đề bị khóa.
- Các trạng thái tối thiểu: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `EXPIRED`; ánh xạ trạng thái PayOS (`PAID`, `PENDING`, `CANCELLED`, `EXPIRED`).

### Kết quả thi

- Submit full test/part nhận `submissionKey` (UUID mới cho mỗi lượt làm), `testId`, `partId?`, `totalTime`, và `{questionId, selectedAnswer?}`.
- Backend xác nhận câu thuộc test/part, tự chấm từ DB, lưu `TestResult` + `UserAnswer`, trả summary. Retry cùng key của cùng user/test/assignment/source result trả lại đúng result đã tạo; key gắn với user và không thể dùng lại cho đối tượng khác. Lượt làm mới phải tạo key mới.
- Liệt kê lịch sử user hiện tại; đọc result detail chỉ khi là owner hoặc admin theo policy.
- Review trả lựa chọn user, đáp án đúng, đúng/sai, explanation và transcript cần thiết.

### Bình luận đề thi (Test Comments)

- `GET /api/exam/{testId}/comments`: Public (hoặc authenticated), trả danh sách bình luận mới nhất của đề thi kèm thông tin người đăng (tên, avatar, vai trò `ADMIN`/`TEACHER`/`USER`, thời điểm tạo và cập nhật).
- `POST /api/exam/{testId}/comments`: Authenticated, người dùng gửi nội dung thảo luận (1–2000 ký tự), server lưu vào `test_comment` và ghi nhận timestamp. Kiểm tra tài khoản không bị khóa (`USER_ACCOUNT_LOCKED`), áp dụng rate limiting.
- `PUT /api/exam/comments/{commentId}`: Authenticated, tác giả bình luận (hoặc admin) chỉnh sửa nội dung; cập nhật `content` và `updated_at`.
- `DELETE /api/exam/comments/{commentId}`: Authenticated, tác giả bình luận hoặc tài khoản `ROLE_ADMIN` có quyền xóa bình luận.

### Đề VIP (đã nối code; cần kiểm chứng payment provider)

- Admin quản lý giá riêng từng đề VIP, bằng VND; validate số nguyên dương và mức trần cấu hình ở server. Field/entity/form đã có; catalog hiển thị nhãn VIP và giá nhưng chưa có end-to-end/visual QA.
- `GET /api/exam/{testId}/access` public trả metadata + `hasAccess`, không trả nội dung. Đề chưa publish chỉ hiển thị cho người đã có entitlement VIP; entitlement vĩnh viễn vẫn cho phép chủ sở hữu mở đề đã gỡ khỏi catalog. Detail, lấy part và submit kiểm tra entitlement server-side.
- `GET /api/exam/{testId}/dictation` authenticated trả metadata đề và context Listening cần cho dictation; chỉ gồm audio/ảnh/paragraph/transcript/translation/order/Part, không có câu hỏi, answer key hoặc explanation. Kiểm tra đề PUBLISHED, entitlement VIP và membership lớp APPROVED trước khi cấp dữ liệu/media.
- Return URL chỉ trình bày trạng thái; không cấp quyền chỉ theo query string.
- Webhook PayOS báo thành công (hoặc đồng bộ API PayOS `PAID`) cho `TEST_VIP` tạo entitlement unique và notification cùng transaction với đổi trạng thái payment. Checkout dùng PayOS gateway hiện có; entitlement vĩnh viễn.
- Upload đề private qua `POST /api/media/upload` gửi thêm `privateExamMedia=true`; server lưu Cloudinary `authenticated`, đăng ký metadata cùng user tải lên trong `ExamMediaAsset`, rồi trả URL preview ký hạn cùng `publicId`, `format`, `deliveryType`. Khi lưu đề, backend kiểm tra registry, resource/delivery type và uploader; teacher không thể tự khai public ID của người khác. Media private legacy đã gắn vào đề hiện hữu có thể giữ nguyên khi sửa nháp; để publish lại cần tải lên/đăng ký asset nếu chưa có record. Server từ chối publish đề VIP nếu media đang dùng thiếu định danh authenticated.
- Khi user đã có quyền lấy detail/part/review, server ký URL media authenticated có thời hạn 2 giờ; không dùng callback trình duyệt làm căn cứ quyền. Media đề cũ dùng URL public vẫn có thể truy cập trực tiếp; cần upload lại thành asset authenticated trước khi gắn vào đề VIP.
- Pending quá 15 phút bị chặn để đối soát và bảo toàn IPN muộn. Giá mới chỉ áp dụng giao dịch mới.
- Admin transaction listing/detail; đối soát/hoàn tiền chỉ thêm nếu được xác nhận.

### Bảo vệ endpoint

- ADMIN quản lý user, giao dịch và CRUD/xóa đề theo policy.
- USER sửa hồ sơ của mình, nộp bài, xem lịch sử của mình và mở đề đã mua.
- Không tin `userId`, score, correct answer hoặc giá do client gửi khi backend có thể suy ra từ Principal/DB.

### Lớp học và bài tập

- `POST /api/classrooms`: TEACHER tạo lớp với `className` bắt buộc (tối đa 120 ký tự) và `description` tùy chọn (tối đa 2.000 ký tự); server gắn owner và tạo class code. `PUT /api/classrooms/{classroomId}` cho phép TEACHER owner cập nhật tên/mô tả; `PATCH /api/classrooms/{classroomId}/appearance` cho phép TEACHER owner lưu màu chủ đề (`themeColor` trong 8 giá trị hợp lệ) và ảnh bìa (`bannerUrl` dạng `preset:*`, URL Cloudinary hoặc `/api/media/local/...`); server kiểm tra ownership dưới row lock và ghi audit event. `GET /api/classrooms/mine`: TEACHER lấy lớp mình sở hữu, USER lấy membership của mình (kèm `themeColor`, `bannerUrl`). `POST /api/classrooms/{classroomId}/join-code/rotate`: chỉ TEACHER owner; xoay mã dưới row lock, mã cũ mất hiệu lực và membership hiện có được giữ nguyên. Chưa có thao tác xóa lớp.
- `POST /api/classrooms/{classroomId}/announcements`: chỉ TEACHER owner; đăng thông báo lên Bảng tin lớp học, gửi thông báo in-app (`CLASSROOM_ANNOUNCEMENT`) và gửi email HTML kiểu Google Classroom tới tất cả học viên `APPROVED` trong lớp.
- `POST /api/classrooms/{classroomId}/invitations`: chỉ TEACHER owner; mời hàng loạt học viên qua danh sách Gmail (`emails`, tối đa 100 địa chỉ/lần, kèm `message` tùy chọn). Nếu Gmail đã có tài khoản học viên (`ROLE_USER`) trên hệ thống thì tự động thêm và duyệt thẳng (`APPROVED`) vào lớp, gửi thông báo `CLASSROOM_INVITED` và gửi email xác nhận; nếu chưa có tài khoản thì gửi email lời mời kèm mã lớp (`Class Code`) và liên kết `/classrooms?joinCode=...`.
- `POST /api/classrooms/join` nhận mã và tạo membership `PENDING`; `GET /api/classrooms/{classroomId}/members?status=` và `PATCH /api/classrooms/{classroomId}/members/{memberId}` chỉ cho TEACHER owner. PATCH nhận trạng thái `APPROVED`, `BLOCKED` hoặc `REMOVED`; học sinh chỉ truy cập nội dung lớp khi APPROVED.
- `GET /api/classrooms/{classroomId}/materials`: TEACHER owner hoặc USER có membership APPROVED; trả metadata allowlist, không trả file URL lưu trữ.
- `POST /api/classrooms/{classroomId}/materials` (multipart `title`, `file`): chỉ TEACHER owner; PDF tối đa 10 MiB, kiểm tra signature/EOF server-side, upload Cloudinary `raw/private`, giới hạn 30 request/IP và 10 request/teacher trong 15 phút. Từ chối với `CLASSROOM_STORAGE_QUOTA_EXCEEDED` khi vượt quota lớp (mặc định 512 MiB, cấu hình `CLASSROOM_STORAGE_QUOTA_BYTES`).
- `GET /api/classrooms/{classroomId}/materials/{materialId}/preview`: TEACHER owner hoặc USER APPROVED; kiểm tra quyền từng lần, tải nội dung PDF từ nguồn Cloudinary private hợp lệ và trả `application/pdf` với `Content-Disposition: inline` để frontend hiển thị xem trước trực tiếp trong modal trình duyệt.
- `GET /api/classrooms/{classroomId}/materials/{materialId}/download`: TEACHER owner hoặc USER APPROVED; kiểm tra quyền từng lần và cấp Cloudinary private-download URL hết hạn sau 5 phút (`attachment=true` mặc định).
- `DELETE /api/classrooms/{classroomId}/materials/{materialId}`: chỉ TEACHER owner; soft-hide khỏi lớp, không xóa asset/provider data.
- `GET /api/exam/classrooms/{id}/tests`: TEACHER owner liệt kê đề lớp; `GET /{testId}` trả chi tiết cho studio owner.
- `GET /api/exam/classrooms/{id}/tests/assignable`: TEACHER owner lấy đề hệ thống PUBLISHED không VIP và đề PUBLISHED của đúng lớp để giao; response chỉ metadata public, có `classroomId` nullable để phân loại nguồn.
- `POST/PUT /api/exam/classrooms/{id}/tests[/{testId}]`: TEACHER owner tạo/cập nhật theo cùng cấu trúc và validation TOEIC; server gắn lớp/owner từ path/principal. Đề lớp không VIP.
- `PATCH /api/exam/classrooms/{id}/tests/{testId}/publish`, `DELETE .../{testId}`: chỉ owner; publish kiểm tra nội dung, xóa bị từ chối nếu có result/assignment/payment reference.
- `GET /api/exam/{testId}/access`, detail/part và submit chỉ tiết lộ/cho làm đề lớp khi user có membership APPROVED. Không cho đề lớp vào catalog public/admin hệ thống.
- `POST /api/classrooms/{classroomId}/assignments` tạo assignment; `GET /api/classrooms/{classroomId}/assignments` liệt kê cho teacher owner hoặc học sinh APPROVED trong lớp.
- `PATCH/DELETE /api/classrooms/assignments/{assignmentId}` cập nhật hoặc archive; API hiện chưa có route deadline riêng, thay đổi hạn gửi qua `PATCH` cùng request assignment.
- Field `deadline` hiện là `LocalDateTime` không offset, hiểu theo `APP_BUSINESS_TIME_ZONE` (mặc định `Asia/Ho_Chi_Minh`); frontend gửi wall time HCM và format API response theo HCM. Đổi timezone backend cần migrate dữ liệu/đồng bộ client trước.
- `GET /api/classrooms/assignments/{assignmentId}/submissions?sortBy=name|score&direction=ASC|DESC`: roster APPROVED gồm đã nộp/chưa nộp, trạng thái trễ, điểm/nhận xét; chỉ teacher owner.
- `GET /api/classrooms/assignments/{assignmentId}/summary`: đếm học sinh đủ điều kiện, đã nộp, nộp trễ, chưa nộp, quá hạn và đã nhận xét; chỉ teacher owner. Trả `averageScore` và `averageScoreSubmissionCount`: trung bình các kết quả có nhận xét giáo viên và có điểm, gồm bài trễ đã nhận xét; bài thiếu/chưa nhận xét không vào mẫu số.
- Submit dùng `POST /api/exam/submit` với `assignmentId`; server chỉ resolve assignment đang active, xác minh test và membership APPROVED, rồi áp dụng deadline/late policy. Assignment không cấu hình Part riêng, nên request gắn assignment phải nộp toàn bộ đề được giao; server từ chối `partId`, `partIds` hoặc `partNumbers`. Bài đã archive không nhận submit mới.
- `PATCH /api/classrooms/assignments/submissions/{resultId}/feedback`: teacher owner thêm/cập nhật nhận xét cho kết quả assignment; request body chỉ nhận comment, không nhận điểm/owner từ client.
- Báo cáo lớp: thống kê nộp/thiếu/trễ, điểm trung bình trên submission đã nhận xét và có điểm (kèm số bài trong mẫu số), cùng danh sách sắp xếp theo điểm/tên.
- Luôn kiểm tra owner lớp/member approved cho từng route; không dựa trên ID khó đoán.

### Thông báo và thống kê

- `GET /notifications/me?unreadOnly=false&category=ALL&page=1&size=15` chỉ trả thông báo của current user, hỗ trợ lọc theo danh mục (`ALL`, `EXAM`, `ASSIGNMENT`, `CLASSROOM`, `PAYMENT`, `SYSTEM`) và trạng thái chưa đọc (`unreadOnly`), phân trang (`page` 1–10.000, `size` 1–50); kết quả dùng `PageResponse<NotificationResponse>`.
- `GET /notifications/me/unread-count` trả `unreadCount` và `totalCount` của current user.
- `PATCH /notifications/{id}/read` và `PATCH /notifications/read-all` chỉ cho recipient; read-all cập nhật bulk theo userId, không tải toàn bộ notification vào bộ nhớ.
- `DELETE /notifications/{id}` xóa một thông báo thuộc sở hữu của current user; `DELETE /notifications/read` xóa bulk toàn bộ thông báo đã đọc của current user.
- Các sự kiện phát sinh thông báo tự động trên hệ thống: đăng ký tài khoản mới (`WELCOME`), đổi/thiết lập mật khẩu (`ACCOUNT_SECURITY`), hoàn thành bài thi/luyện tập (`EXAM_RESULT`), học viên nộp bài tập lớp cho giáo viên (`ASSIGNMENT_SUBMITTED`), bài tập mới (`ASSIGNMENT_CREATED`), đổi hạn nộp (`ASSIGNMENT_DEADLINE_CHANGED`), giáo viên nhận xét bài làm (`ASSIGNMENT_FEEDBACK`), học viên gửi yêu cầu vào lớp (`CLASSROOM_JOIN_REQUEST`), giáo viên duyệt/cập nhật trạng thái thành viên lớp (`CLASSROOM_MEMBER_APPROVED` / `CLASSROOM_MEMBER_STATUS`), giáo viên đăng tài liệu PDF mới (`CLASSROOM_MATERIAL`), mở khóa đề VIP (`TEST_VIP_PURCHASE`), thanh toán phí giáo viên xác nhận cho ứng viên & Admin (`TEACHER_APPLICATION_PAYMENT` / `TEACHER_APPLICATION_SUBMITTED`), hồ sơ giáo viên được duyệt/từ chối (`TEACHER_APPLICATION`), và Admin kiểm duyệt gỡ bình luận (`COMMENT_MODERATED`).
- `POST /user/presence`: authenticated; ghi heartbeat cho chính user lấy từ JWT. Client chỉ gửi request rỗng; server giới hạn ghi tối đa một lần/phút/user.
- `POST /user/setpassword`: authenticated; dành cho Google-only account chưa có password hash. Client yêu cầu xác minh Google trực tiếp qua GIS và gửi ID token cùng mật khẩu mới; token chỉ được dùng trong request, không lưu browser. Backend đối chiếu `sub` và yêu cầu token được phát hành trong 5 phút gần nhất; user row được khóa, tài khoản khóa/đã có password bị từ chối, sau đó tăng `authVersion` để thu hồi mọi JWT hiện hành.
- `GET /admin/metrics/overview`: ADMIN; trả số user có heartbeat trong 5 phút, số người/lượt đăng nhập thành công hôm nay và trong tháng, số session mới bắt đầu và số lượt submit lưu hôm nay và trong tháng, ngày/múi giờ báo cáo và thời điểm tổng hợp; không có danh sách user.
- `GET /admin/metrics/tests?from=YYYY-MM-DD&to=YYYY-MM-DD`: ADMIN; chuỗi số lượt bắt đầu và submit theo ngày, gồm ngày 0, khoảng tối đa 367 ngày. Mặc định múi giờ `Asia/Ho_Chi_Minh`, cấu hình qua `APP_REPORTING_TIME_ZONE`.
- `GET /admin/metrics/activity?from=YYYY-MM-DD&to=YYYY-MM-DD`: ADMIN; chuỗi tổng hợp theo ngày gồm `uniqueLoginUsers`, `loginCount`, `startedAttempts`, `submittedAttempts` (múi giờ báo cáo, tối đa 367 ngày, không trả PII).
- `GET /admin/metrics/activity/monthly?months=6`: ADMIN; chuỗi tổng hợp theo tháng (`YYYY-MM`, hỗ trợ `1..24` tháng gần nhất) gồm `uniqueLoginUsers`, `loginCount`, `startedAttempts`, `submittedAttempts` (không trả PII).
- Lượt submit lấy từ `test_result`, bao gồm full/part/assignment/review lại; lượt bắt đầu lấy từ session mới trong `exam_session.started_at`. Khôi phục session hiện có không tạo thêm lượt bắt đầu; hủy/expire session vẫn là một lần đã bắt đầu.
- Heartbeat chỉ gửi khi tab nhìn thấy và client polling 60 giây; server vẫn enforce khoảng ghi tối thiểu. Không lưu hành vi trang/câu hỏi hoặc gửi dữ liệu user vào metric.

### Tính năng học tập bổ sung (đề xuất)

- Diagnostic/goal: `POST /learning/diagnostics`, `GET/POST/PATCH /learning/goals/me`; kết quả theo Part, mục tiêu điểm/ngày thi và study plan versioned. Không phát sinh scaled score nếu không có conversion phù hợp.
- Sổ câu sai: `GET /learning/review-queue`, `POST /learning/review-queue/{questionId}/reviewed`, `DELETE /learning/review-queue/{questionId}`; derive từ attempt đã nộp, không nhận answer key từ client.
- Ôn tập theo lịch: `GET /learning/reviews/due`; sau khi hoàn thành gửi mức tự đánh giá hoặc câu trả lời để update `nextReviewAt` theo thuật toán được chốt.
  - Session làm bài đã được nối trong module exam: `POST /exam/sessions` tạo/khôi phục theo test + assignment/source result + loại timer + phạm vi câu (`restartActive: false` khi reload trang để giữ nguyên phiên `ACTIVE`); `PATCH /exam/sessions/{id}/answers` autosave bản nháp; `DELETE /exam/sessions/{id}` hủy phiên (`CANCELLED`) và xóa nháp khi người dùng xác nhận thoát phòng thi không nộp. Tất cả yêu cầu đăng nhập và backend kiểm tra owner, access, fingerprint nội dung đề, TTL, assignment membership/deadline và giới hạn tập câu hỏi. `POST /exam/submit` yêu cầu `sessionId`; server lấy thời gian từ session, chấm theo đáp án lưu và giữ idempotency key hiện có. Response trả serverNow, remaining/elapsed seconds, trạng thái và các lựa chọn đã lưu; không trả answer key.
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
- `frontend/src/api/apiClient.js` đọc `VITE_API_BASE_URL`; mặc định dùng `http://localhost:8080/api`. Giá trị môi trường phải gồm cả base path `/api` như mô tả trong `frontend/README.md`.

## 5. Kiểm soát bảo mật xuyên API

- `GET /api/admin/audit-events?page=1&size=25` chỉ ADMIN; trả audit mới nhất phân trang (size tối đa 100). Coverage hiện tại gồm registration/login/password, khóa/mở user, teacher review, payment/entitlement, thao tác đề, membership, assignment, feedback và tài liệu lớp.

- Duy trì route authorization matrix; deny-by-default và chỉ allowlist endpoint public có chủ đích. Mỗi endpoint kiểm tra quyền đối tượng/ownership, không chỉ role hay ID.
- Dùng DTO allowlist cho request/response; không bind entity trực tiếp, không nhận role/owner/score/payment status/answer key từ client như sự thật.
- Rate limit auth/reset/OTP, catalog/media, submit, upload, checkout và endpoint tốn tài nguyên; giới hạn pagination/filter/body và whitelist sort field.
- Phân biệt response catalog, attempt và review. Answer key/explanation chỉ trả sau khi quyền và trạng thái attempt cho phép; content VIP cần entitlement phía server.
- Idempotency/transaction bắt buộc cho callback payment/cấp entitlement và submit có thể được retry. Không ghi credentials/callback secret vào log.
- Nếu auth dùng cookie, thiết kế CSRF và Origin policy; nếu bearer-only, không để trình duyệt tự gửi cookie xác thực. CORS chỉ allowlist origin, không cấp quyền.
- Trước khi thêm/sửa route, ghi rõ authentication, role, owner/member constraint, dữ liệu trả về, input/rate/body limit và tính idempotent. Kiểm tra quyền chéo cho attempt/history/review, đề/media VIP, lớp/member/material, assignment/submission/feedback và payment/admin.
- Tham chiếu checklist và hiện trạng có giới hạn tại `docs/06_SECURITY_SPEC.md`; route trong tài liệu không chứng minh rằng route đã tồn tại hoặc được bảo vệ đúng.

