# 02. Mô hình dữ liệu và quy tắc lưu trữ

> Mô tả dữ liệu hiện có và mục tiêu sản phẩm. Kiểm tra entity/DDL đang chạy trước khi migration; hai script SQL không mặc nhiên đồng nhất.

> Database tiếp tục được dùng bởi backend Spring Boot hiện tại qua Spring Data JPA/MySQL. Mô hình hóa phần mở rộng theo entity/repository và convention đang có; không đổi database, ORM hoặc data architecture nếu chưa được chủ dự án yêu cầu.

## 1. Các miền dữ liệu

| Miền | Thực thể hiện có/định hướng | Ý nghĩa |
|---|---|---|
| Tài khoản | `Role`, `User` | Vai trò, hồ sơ, mật khẩu mã hóa, khóa tài khoản và `authVersion` để thu hồi JWT; Google `sub` nullable và unique để nhận diện OIDC ổn định. |
| Đề thi | `Test`, `Part`, `ContextQuestion`, `Question` | Đề, phần thi, nhóm audio/đoạn đọc và câu hỏi. |
| Kết quả | `TestResult`, `UserAnswer` | Một lần làm và lựa chọn từng câu; lưu `submission_key` duy nhất để submit retry trả lại cùng kết quả, cùng `score_type` để review giữ đúng cách diễn giải điểm. |
| Thương mại | `PaymentTransaction`, `TeacherApplication`, `TestEntitlement` | VNPAY cho hồ sơ giáo viên và đề VIP; entitlement đề có entity. |
| Lớp học | `Classroom`, `ClassMember`, `Material`, `Assignment` | Luồng lớp, tài liệu PDF private, bài tập/feedback và đề riêng đã có. |
| Giới hạn request | `LoginAttemptBucket` (`auth_login_attempt`) | Lưu bộ đếm theo scope API và hash bucket IP/IP+định danh/actor cùng thời điểm cửa sổ; dùng cho auth và upload. Cleanup bản ghi quá hạn; không lưu IP, email hoặc user ID thô. |
| Khác | `Notification` | Có entity/schema; không tự mở rộng thành yêu cầu mới. |
| Vận hành | `AuditEvent` (`audit_event`) | Nhật ký thao tác nhạy cảm tối thiểu; UTC timestamp, actor/action/target/outcome. Hiện ghi đăng ký và login success/failure, password changes, user lock, teacher review, payment/entitlement, đề, classroom create/update/join-code rotation, membership, assignment, feedback và material; không lưu payload, join code, identifier hoặc credential. |

## 1.1. Thực thể hiện hành và các miền cần hoàn thiện

Các tên dưới đây là miền dữ liệu cần đáp ứng, không buộc giữ nguyên tên bảng. Mỗi entity cần ID, audit fields, khóa ngoại, unique/index, validation và trạng thái rõ.

- **TeacherApplication (đã có)**: user, statement, trạng thái `PENDING_PAYMENT` / `PENDING_REVIEW` / `APPROVED` / `REJECTED`, admin/thời điểm duyệt và lý do. Chỉ cấp role giáo viên sau khi duyệt.
- **PaymentTransaction (đã mở rộng)**: user, amount VND, `productType`, teacher application tùy chọn, mã `vnpTxnRef`, trạng thái, mã phản hồi/giao dịch provider và `paidAt`. Checkout và xác nhận thanh toán là hai trạng thái riêng.
- **ExamMediaAsset (đã có)**: public ID duy nhất, format, Cloudinary resource/delivery type, người tải lên và thời điểm. Chỉ metadata do upload endpoint đăng ký mới được teacher gắn vào đề; teacher chỉ được dùng media mình tải lên. Admin giữ quyền quản trị nội dung toàn hệ thống.
- **TestEntitlement (đã có)**: user được quyền xem/làm test, nguồn `PAYMENT`, gắn payment transaction; unique (user,test), cấp một lần và không hết hạn.
- **Giá đề VIP (đã có)**: mỗi `Test` có `isVip` và giá VND riêng do admin cấu hình; backend kiểm tra số nguyên dương tối đa 99,999,999 VND. Payment lưu amount/tên sản phẩm snapshot và test ID.
- **Classroom**: giáo viên owner, tên, mô tả (`description`, nullable), join code/invitation, trạng thái và timestamps. Entity/bootstrap DDL đã có cột mô tả; database cũ cần áp dụng `backend/migrations/V20261031_01__add_classroom_description.sql` đúng một lần.
- **ClassMember**: classroom + student, trạng thái `PENDING`, `APPROVED`, `BLOCKED` hoặc `REMOVED`, ngày xin vào/duyệt/chặn; unique (classroom, student), audit actor. Xóa nên là soft remove nếu cần giữ kết quả/lịch sử.
- **Material**: classroom, title, tên file hiển thị đã sanitize, Cloudinary public ID/URL private, PDF format, MIME server đặt, kích thước byte, uploader, active/hidden, createdAt. Quota mặc định 512 MiB/lớp lấy từ `CLASSROOM_STORAGE_QUOTA_BYTES`; tính cả tài liệu hidden vì asset vẫn còn trên provider. Hàng classroom được khóa khi kiểm tra quota và upload để tuần tự hóa request cùng lớp. Bản ghi legacy thiếu `size_bytes` được tính 10 MiB (giới hạn file cũ) để tránh bỏ qua dung lượng. Chỉ lưu asset ID/URL private trong DB; API không trả URL storage trực tiếp. File cũ thiếu private asset ID phải được tải lại trước khi có quyền download.
- **Assignment**: classroom, creator, title/instructions, nguồn đề (`CLASS_PRIVATE_TEST` hoặc `SYSTEM_TEST`), dueAt, late policy, availability/status, update history. Chỉnh hạn không nên xóa submission cũ.
- **Đề riêng lớp**: dùng entity `Test` hiện có, liên kết `classroom_id` và `owner_teacher_id`; `classroom_id IS NULL` là đề hệ thống. Đề lớp không phải VIP, không xuất hiện trong catalog/admin list hệ thống, và chỉ teacher owner được CRUD/publish. Không xóa/sửa khi đã có result, assignment hoặc payment reference; không đổi sang bảng/cơ chế đề riêng thứ hai.
- **AssignmentSubmission**: hiện gắn qua `TestResult.assignment`, gồm student, kết quả, deadline snapshot và cờ `assignmentLate` được quyết định từ thời điểm server xử lý submit; dữ liệu cũ không có cờ thì fallback so sánh timestamp. Trạng thái `SUBMITTED`/`LATE`/`MISSING`/`GRADED`; unique theo policy (một lần hay nhiều lần) cần chốt.
- **Notification**: user recipient, loại/scope, tiêu đề/nội dung an toàn, link nội bộ, readAt, timestamps. Tạo khi assignment mới/đổi deadline/gia hạn/giáo viên nhận xét; thông báo phải gắn đúng học sinh thuộc lớp.
- **UserPresence** (đã triển khai): một dòng/user, `user_id` là PK/FK tới user và `last_seen_at` là thời điểm heartbeat gần nhất. Chỉ ghi tối đa mỗi phút/user; báo active khi heartbeat trong 5 phút và tài khoản chưa khóa. Đây là ước lượng người đang mở ứng dụng, không chứng minh họ đang đọc nội dung; không lưu URL/page/action.
- **LearningGoal/DiagnosticAttempt** (đề xuất): user, target score/date, diagnostic test/version, raw performance theo Part, createdAt; sửa/xóa mục tiêu theo retention policy.
- **QuestionLearningState / ReviewQueue** (đề xuất): user + question, sai/bỏ trống gần nhất, độ thành thạo, lần ôn trước, `nextReviewAt`, số lần đúng liên tiếp. Cần chống duplicate và cho phép reset/ignore.
- **ExamSession** (đã triển khai trong code, chưa xác minh migration DB): user, test, assignment/source result tùy chọn, scope key, fingerprint nội dung đề do server tính, startedAt/expiresAt, thời lượng giới hạn, status, danh sách target question IDs, đáp án nháp và lastSavedAt. Chỉ lưu lựa chọn A–D, tuyệt đối không lưu answer key. Backend tạo session theo phạm vi user/test/assignment/question set và khôi phục session active; submit liên kết một result.
- **ContentIssue** (đề xuất): reporter, question/context/test version, loại lỗi, mô tả, status, admin resolution; giới hạn spam và không cho lộ thông tin người báo cáo.
- **NotificationPreference** (đề xuất): user, loại sự kiện, kênh, quiet hours, timezone, opt-in; không tắt thông báo giao dịch bắt buộc nếu policy yêu cầu.
- **TestVersion / PublishedSnapshot** (đề xuất): revision đề immutable sau khi có attempt, hoặc version cho từng lần publish. Kết quả cũ phải review theo đúng nội dung/answer key tại thời điểm làm.

Điểm trung bình assignment hiện tính từ các `TestResult` thuộc assignment có nhận xét giáo viên và có điểm, nhưng chỉ của học sinh đang `APPROVED` trong lớp; bài trễ đã nhận xét vẫn được tính, còn học sinh đã bị chặn/xóa, bài thiếu hoặc chưa nhận xét không vào mẫu số. Mẫu số đếm các bài nộp đã nhận xét (không phải số học sinh duy nhất) và được trả để người dùng diễn giải. Đây là mức đánh giá bằng điểm bài thi đã được giáo viên nhận xét, không phải một cột grade riêng.

## 2. Quan hệ đề thi

`Test` có nhiều `ContextQuestion`. Mỗi context gắn một `Part`, có thể chứa nhiều `Question`. Context lưu URL media public legacy hoặc `audioPublicId`/`imagePublicId`, định dạng và delivery type cho asset private, `paragraph`, `transcript`, `translation`, `orderIndex`; câu hỏi lưu nội dung, option A–D, `correctAnswer`, `explanation`, `questionNumber`. Với asset private, không lưu URL ký trong DB; server tạo link mới khi trả response.

- Catalog không cần cột phân loại đề mới: `FULL` suy ra từ tổng 200 `Question`; `LISTENING`/`READING` suy ra từ context gắn `Part 1–4`/`Part 5–7`. Các filter phải chạy ở truy vấn trước phân trang, không dựa trên tập đề của trang hiện tại.

- ID entity kế thừa `BaseEntity` là UUID dạng chuỗi 36 ký tự.
- `orderIndex` của context là số câu đầu tiên trong context; sắp context theo nó.
- `questionNumber` là số global của câu trong bài; sắp câu trong context theo nó.
- Ranh giới passage Part 7 phải được bảo toàn khi một cụm có 2 hoặc 3 bài đọc. Nếu schema chỉ có một `paragraph` cho context, cần thiết kế mở rộng/migration thay vì ghép mất cấu trúc.
- Không trả `correctAnswer` trong payload đề đang làm nếu chấm phía server. Mapper hiện có thể serialize entity chứa đáp án; cần DTO riêng và kiểm tra JSON khi triển khai.

## 3. Phân bố câu TOEIC

| Part | Số câu | Câu global | Đơn vị media/nội dung |
|---|---:|---:|---|
| 1 | 6 | 1–6 | Một ảnh và audio trên mỗi câu; option chỉ là nhãn A/B/C/D. |
| 2 | 25 | 7–31 | Một audio mỗi câu; không render nội dung option. |
| 3 | 39 | 32–70 | 13 context, mỗi context 3 câu, audio bắt buộc, ảnh tùy chọn. |
| 4 | 30 | 71–100 | TOEIC L&R chuẩn có 10 talks × 3 câu. Mô tả “30 bài nghe” của yêu cầu hiện tại mâu thuẫn với “mỗi bài 3 câu”; dùng 10 nhóm theo chuẩn, trừ khi chủ dự án xác nhận muốn dữ liệu khác chuẩn. |
| 5 | 30 | 101–130 | Chưa có mô tả riêng ngoài cấu trúc hiện hữu. |
| 6 | 16 | 131–146 | Chưa có mô tả riêng ngoài cấu trúc hiện hữu. |
| 7 | 54 | 147–200 | 10 passage đơn, 2 nhóm passage đôi, 3 nhóm passage ba. |

## 4. Nhóm passage Part 7

| Câu | Passage | Câu | Passage |
|---|---:|---|---:|
| 147–148 | 1 | 149–150 | 1 |
| 151–152 | 1 | 153–155 | 1 |
| 156–157 | 1 | 158–160 | 1 |
| 161–163 | 1 | 164–167 | 1 |
| 168–171 | 1 | 172–175 | 1 |
| 176–180 | 2 | 181–185 | 2 |
| 186–190 | 3 | 191–195 | 3 |
| 196–200 | 3 |  |  |

Một context có thể đại diện một tập câu hỏi trong UI, nhưng phải cho phép passage con tách biệt. Mỗi câu cần liên kết xác định tới passage tương ứng.

## 5. Thanh toán và quyền VIP

- `PaymentTransaction` liên kết đề VIP và snapshot amount/tên sản phẩm; `TestEntitlement` cấp quyền sau IPN success. Đây là entity code-first/JPA update; cần kiểm tra schema môi trường trước rollout.
- Mỗi đề VIP được cấu hình giá riêng bởi admin. Catalog có thể hiển thị giá hiện tại, nhưng checkout phải tra lại trạng thái publish/VIP và giá hiện hành từ DB, rồi lưu snapshot vào giao dịch; tuyệt đối không tin amount từ request.
- Đã chốt: giá được phép sửa và chỉ áp dụng checkout mới; người mua một lần có quyền vĩnh viễn. Chính sách hoàn tiền/thu hồi quyền chưa chốt; hiện không có thao tác thu hồi.
- Mục tiêu là lưu tham chiếu giao dịch duy nhất, user, số tiền, trạng thái, thời gian và liên kết tới đề/gói mua.
- Callback phải xác thực chữ ký, xử lý lặp an toàn (idempotent), chỉ cấp quyền sau xác nhận thành công phía server.
- Admin cần xem giao dịch; lọc, đối soát, hoàn tiền, báo cáo là phạm vi cần chủ dự án chốt.
- Không lưu secret VNPAY trong repo/frontend. Dùng cấu hình môi trường và không ghi credential vào log.

### Đăng ký giáo viên

- Một hồ sơ có thể liên kết giao dịch phí đăng ký; callback VNPAY thành công cập nhật giao dịch và chuyển hồ sơ sang `PENDING_REVIEW` trong cùng quy trình idempotent.
- Khi admin duyệt, tạo/nâng role TEACHER và lưu người duyệt/thời điểm; khi từ chối, giữ lịch sử và lý do, định nghĩa chính sách hoàn phí trước khi triển khai.
- Nếu dùng chuyển khoản ngân hàng ngoài VNPAY thay vì VNPAY checkout, phải mô tả nguồn xác nhận giao dịch (webhook ngân hàng hay đối soát admin). Không thể phát thông báo “thành công tự động” an toàn chỉ từ ảnh/chuyển khoản người dùng tự khai.

## 5.1. Lớp và bài tập

- Giáo viên chỉ đọc/sửa lớp mình sở hữu. Học sinh chỉ thấy lớp sau khi được duyệt; thành viên bị chặn không thể tiếp tục nộp.
- Đề riêng của lớp thuộc quyền sở hữu/scope lớp và không xuất hiện catalog công khai/VIP nếu chưa publish công khai.
- Assignment hệ thống tham chiếu test hiện có; assignment tự thiết kế tham chiếu đề lớp. Ghi nguồn, owner, classroom rõ ràng.
- Mục tiêu dài hạn là lưu timestamp có timezone rõ (UTC ở DB/API, hiển thị Asia/Ho_Chi_Minh). Code hiện giữ `LocalDateTime` theo schema để tránh migration diện rộng; `APP_BUSINESS_TIME_ZONE` mặc định `Asia/Ho_Chi_Minh` đặt timezone JVM và Hibernate JDBC trước khi phục vụ request. Vì API LocalDateTime không mang offset, client phải gửi/hiển thị theo timezone nghiệp vụ; không đổi cấu hình timezone sau khi đã có dữ liệu mà chưa kiểm tra/migrate các mốc deadline và created_at. Lưu snapshot deadline tại lần nộp để audit nếu deadline được gia hạn sau đó.
- Soft delete assignment giữ submissions/results để thống kê và lịch sử; xóa cứng chỉ theo retention policy.
- Thiếu submission sau deadline được suy ra `MISSING` theo thời điểm truy vấn/job; không giả vờ có submission record nếu chưa nộp.

## 5.2. Thống kê và hoạt động

- “Đang hoạt động” hiện dùng heartbeat trong cửa sổ 5 phút; báo cáo số user duy nhất, loại tài khoản đã khóa và không trả ID/PII.
- Dashboard hiện đếm lượt nộp đã lưu ở `test_result` theo `created_at`, gồm full test, luyện Part, assignment và lượt luyện lại; đây là số lượt submit, không phải số user duy nhất.
- Múi giờ báo cáo mặc định `Asia/Ho_Chi_Minh`, cấu hình bằng `APP_REPORTING_TIME_ZONE`. Thống kê theo ngày tạo đủ ngày 0 trong chuỗi và giới hạn khoảng truy vấn tối đa 367 ngày.
- ExamSession ghi nhận attempt bắt đầu; dashboard đếm session theo `started_at`, nên resume không cộng lượt mới, còn session hủy/expire vẫn là lượt đã bắt đầu.
- Dashboard chỉ truy vấn aggregate; không trả PII hoặc nội dung bài làm.
- Funnel thương mại (catalog view → checkout → confirmed payment → exam start/completion) cần event tối thiểu, retention và consent rõ; không theo dõi nội dung câu trả lời cho analytics.

## 5.3. Đề xuất dữ liệu học tập cá nhân

- Study plan nên có phiên bản/mốc ngày; việc thay mục tiêu không được ghi đè lịch sử diagnostic.
- Sổ câu sai tham chiếu question version để khi đề được cập nhật, câu cũ không lặng lẽ đổi đáp án.
- Spaced repetition là gợi ý luyện, không phải điểm chính thức; lưu trạng thái tối thiểu để chạy scheduler và hỗ trợ xóa tài khoản theo chính sách.
- Session tự lưu đáp án JSON có TTL: full test dùng 120 phút và thêm tối đa 2 phút để gửi submission; assignment theo deadline/late policy (policy nhận trễ cho phép gửi trong 24 giờ sau deadline); luyện Part/wrong-answer không giới hạn dùng stopwatch và giữ nháp 24 giờ. Mỗi scope resume session active hoặc user chọn hủy session cũ và bắt đầu mới. Submit dùng idempotency hiện có. Cleanup job mỗi 5 phút đánh dấu session active hết TTL là EXPIRED và xóa target/answer draft; submit/hủy phiên xóa draft ngay. Dữ liệu đáp án đang thi không đưa vào wrong-answer queue trước khi nộp. Giới hạn số session khác scope và immutable TestVersion chưa có.
- Content issue liên kết đúng version đề, tránh báo cáo sau này trỏ nhầm câu đã sửa.

## 6. SQL và migration

- `backend/database_script.sql` có `DROP DATABASE toeiclearning`; tuyệt đối không dùng lên DB có dữ liệu cần giữ.
- `backend/database_script_20de.sql` và các file seed là biến thể/bổ sung; kiểm tra ID, schema, quan hệ và thứ tự trước khi chạy.
- Hai script khởi tạo hiện có cùng phần DDL trước seed. DDL đã gồm các cột VIP/lớp của `Test`, metadata Cloudinary trong `ContextQuestion`, liên kết đề và snapshot tên sản phẩm trong `PaymentTransaction`, cùng bảng `TestEntitlement`; đây chỉ là đồng bộ script, chưa xác minh bằng chạy MySQL hoặc migration trên DB hiện có.
- Bổ sung lớp học: database mới tạo `classroom.description` từ hai bootstrap script. Với database đã tồn tại, áp dụng một lần `backend/migrations/V20261031_01__add_classroom_description.sql`; không chạy bootstrap script để nâng cấp vì chúng drop database.
- Hiện `spring.jpa.hibernate.ddl-auto=update`; thay đổi schema dài hạn cần migration có version, tương thích dữ liệu seed và rollback.
- Seed test cần giữ thứ tự câu và toàn vẹn khóa ngoại.
- Kiểm tra quyền sử dụng thương mại cho ngân hàng câu hỏi/media/transcript/explanation trước khi seed hoặc phát hành đề.

## 7. Bảo vệ dữ liệu và quyền truy cập

- Không lưu mật khẩu thuần, access/refresh token, OTP hay dữ liệu thẻ. Reset token chỉ lưu hash có thời hạn và dùng một lần; password hash dùng thuật toán thích nghi.
- Tách PII khỏi dữ liệu học tập khi khả thi; mỗi trường cần mục đích, quyền đọc/ghi và retention. Không thêm dữ liệu nhạy cảm ngoài yêu cầu sản phẩm.
- Answer key cần quyền đọc hạn chế và không được xuất trong response attempt trước submit; review cần snapshot/version phù hợp để không làm thay đổi kết quả cũ.
- Payment cần mã đơn, user, số tiền, trạng thái, mã tham chiếu và thời điểm cần cho đối soát; không lưu PAN/CVV/OTP. Lưu callback tối thiểu/đã che nếu cần audit.
- Với entity có owner/lớp, truy vấn đọc/sửa phải scope theo actor có quyền; chỉ có ID không đủ để cấp quyền. Dùng unique constraint/transaction chống callback payment, entitlement, submit và membership trùng.
- Audit log không thay dữ liệu nghiệp vụ; không lưu secret hoặc bản sao đầy đủ nội dung nhạy cảm vào bảng event mặc định.
- Chốt retention, xóa/ẩn danh, export và backup cho account, payment/audit, attempt, notification trước thương mại hóa. Xóa account không được phá tính toàn vẹn đối soát theo nghĩa vụ lưu trữ áp dụng.
- DB account cần least privilege; credentials ngoài tài liệu/seed; backup được bảo vệ và có kiểm tra restore. Xem `docs/06_SECURITY_SPEC.md`.

