# 02. Mô hình dữ liệu và quy tắc lưu trữ

> Mô tả mục tiêu dữ liệu dựa trên dự án hiện có và yêu cầu sản phẩm. Kiểm tra entity/DDL đang chạy trước khi migration; hai script SQL không mặc nhiên đồng nhất.

## 1. Các miền dữ liệu

| Miền | Thực thể hiện có/định hướng | Ý nghĩa |
|---|---|---|
| Tài khoản | `Role`, `User` | Vai trò, hồ sơ, mật khẩu mã hóa, khóa tài khoản. |
| Đề thi | `Test`, `Part`, `ContextQuestion`, `Question` | Đề, phần thi, nhóm audio/đoạn đọc và câu hỏi. |
| Kết quả | `TestResult`, `UserAnswer` | Một lần làm và lựa chọn từng câu; backend submit/history chưa hoàn tất. |
| Thương mại | `PaymentTransaction` (hiện có), entitlement đề VIP (cần mô hình hóa) | Giao dịch và quyền truy cập đề. |
| Lớp học | `Classroom`, `ClassMember`, `Material`, `Assignment` | Entity/schema hiện có; luồng API/UI chưa hoàn chỉnh trong code hiện tại. |
| Khác | `Notification` | Có entity/schema; không tự mở rộng thành yêu cầu mới. |

## 1.1. Các thực thể thương mại/lớp học cần hoàn thiện

Các tên dưới đây là miền dữ liệu cần đáp ứng, không buộc giữ nguyên tên bảng. Mỗi entity cần ID, audit fields, khóa ngoại, unique/index, validation và trạng thái rõ.

- **TeacherApplication**: user, thông tin/hồ sơ gửi, loại khoản phí, payment reference, trạng thái `PENDING_PAYMENT` / `PENDING_REVIEW` / `APPROVED` / `REJECTED`, thời điểm gửi/duyệt, admin xử lý, lý do từ chối. Chỉ cấp role giáo viên sau khi duyệt.
- **Order/PaymentTransaction**: người trả, số tiền VND, loại sản phẩm, đề/gói hoặc hồ sơ giáo viên liên quan, mã merchant/transaction duy nhất, trạng thái provider, kết quả callback, thời gian và metadata đã lọc bí mật. Không gộp “đã tạo checkout” với “đã thanh toán”.
- **Entitlement/PurchasedTest**: user được quyền xem/làm test nào, nguồn cấp quyền (payment/admin), ngày hiệu lực/hết hạn nếu có. Cần unique constraint để callback lặp không nhân entitlement.
- **Classroom**: giáo viên owner, tên, mô tả, join code/invitation, trạng thái và timestamps.
- **ClassMember**: classroom + student, trạng thái `PENDING`, `APPROVED`, `BLOCKED` hoặc `REMOVED`, ngày xin vào/duyệt/chặn; unique (classroom, student), audit actor. Xóa nên là soft remove nếu cần giữ kết quả/lịch sử.
- **Material**: classroom, metadata/tệp, uploader, visibility, kích thước/MIME/URL, createdAt.
- **Assignment**: classroom, creator, title/instructions, nguồn đề (`CLASS_PRIVATE_TEST` hoặc `SYSTEM_TEST`), dueAt, late policy, availability/status, update history. Chỉnh hạn không nên xóa submission cũ.
- **AssignmentSubmission**: assignment + student, attempt/result reference, submittedAt, status `SUBMITTED`/`LATE`/`MISSING`/`GRADED`, score/comment, teacher reviewer. Unique theo policy (một lần hay nhiều lần) cần chốt.
- **Notification**: user recipient, loại/scope, tiêu đề/nội dung an toàn, link nội bộ, readAt, timestamps. Tạo khi assignment mới/đổi deadline/gia hạn/giáo viên nhận xét; thông báo phải gắn đúng học sinh thuộc lớp.
- **ActivityPresence** (nếu thật sự cần số online hiện tại): heartbeat/lastSeen hoặc cache TTL, không biến thành theo dõi thao tác chi tiết. Định nghĩa thời gian active và retention phải được chốt.
- **LearningGoal/DiagnosticAttempt** (đề xuất): user, target score/date, diagnostic test/version, raw performance theo Part, createdAt; sửa/xóa mục tiêu theo retention policy.
- **QuestionLearningState / ReviewQueue** (đề xuất): user + question, sai/bỏ trống gần nhất, độ thành thạo, lần ôn trước, `nextReviewAt`, số lần đúng liên tiếp. Cần chống duplicate và cho phép reset/ignore.
- **ExamSession** (đề xuất): user, test, mode/assignment, startedAt, expiresAt, status, lastSavedAt, answer snapshot/version. Tạo unique active session theo policy và không lưu answer key.
- **ContentIssue** (đề xuất): reporter, question/context/test version, loại lỗi, mô tả, status, admin resolution; giới hạn spam và không cho lộ thông tin người báo cáo.
- **NotificationPreference** (đề xuất): user, loại sự kiện, kênh, quiet hours, timezone, opt-in; không tắt thông báo giao dịch bắt buộc nếu policy yêu cầu.
- **TestVersion / PublishedSnapshot** (đề xuất): revision đề immutable sau khi có attempt, hoặc version cho từng lần publish. Kết quả cũ phải review theo đúng nội dung/answer key tại thời điểm làm.

Điểm trung bình lớp nên tính từ kết quả assignment đã chấm, có quy tắc mẫu số và cách xử lý bài trễ/thiếu đã xác định; không lưu một aggregate dễ lỗi nếu có thể tính hoặc rebuild từ submission.

## 2. Quan hệ đề thi

`Test` có nhiều `ContextQuestion`. Mỗi context gắn một `Part`, có thể chứa nhiều `Question`. Context lưu `audioUrl`, `imageUrl`, `paragraph`, `transcript`, `translation`, `orderIndex`; câu hỏi lưu nội dung, option A–D, `correctAnswer`, `explanation`, `questionNumber`.

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

- Entity/bảng `PaymentTransaction` cơ bản hiện có; chưa thấy sản phẩm/order hay entitlement đề hoàn chỉnh.
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
- Deadline lưu thời điểm có timezone nhất quán (khuyến nghị UTC ở DB/API, hiển thị Asia/Ho_Chi_Minh). Lưu snapshot deadline tại lần nộp để audit nếu deadline được gia hạn sau đó.
- Soft delete assignment giữ submissions/results để thống kê và lịch sử; xóa cứng chỉ theo retention policy.
- Thiếu submission sau deadline được suy ra `MISSING` theo thời điểm truy vấn/job; không giả vờ có submission record nếu chưa nộp.

## 5.2. Thống kê và hoạt động

- “Đang hoạt động” cần định nghĩa ngưỡng last-seen, ví dụ heartbeat trong 5 phút; đây là đề xuất, cần chốt. Báo cáo là số ước lượng session/người dùng duy nhất, không phải bằng chứng họ đang đọc màn hình.
- “Số bài test mỗi ngày” nên tách số attempt bắt đầu và số bài nộp hoàn tất; mặc định KPI chính là số lần nộp hợp lệ theo ngày local timezone, lọc loại full/part/lớp nếu cần.
- Dashboard cần truy vấn aggregate được phân trang/ngày; không trả PII ngoài nhu cầu admin.
- Funnel thương mại (catalog view → checkout → confirmed payment → exam start/completion) cần event tối thiểu, retention và consent rõ; không theo dõi nội dung câu trả lời cho analytics.

## 5.3. Đề xuất dữ liệu học tập cá nhân

- Study plan nên có phiên bản/mốc ngày; việc thay mục tiêu không được ghi đè lịch sử diagnostic.
- Sổ câu sai tham chiếu question version để khi đề được cập nhật, câu cũ không lặng lẽ đổi đáp án.
- Spaced repetition là gợi ý luyện, không phải điểm chính thức; lưu trạng thái tối thiểu để chạy scheduler và hỗ trợ xóa tài khoản theo chính sách.
- Phiên thi có thể tự lưu đáp án nhưng phải có TTL, giới hạn số session đồng thời và chống submit nhiều lần. Dữ liệu đáp án đang thi không đưa vào wrong-answer queue trước khi nộp.
- Content issue liên kết đúng version đề, tránh báo cáo sau này trỏ nhầm câu đã sửa.

## 6. SQL và migration

- `backend/database_script.sql` có `DROP DATABASE toeiclearning`; tuyệt đối không dùng lên DB có dữ liệu cần giữ.
- `backend/database_script_20de.sql` và các file seed là biến thể/bổ sung; kiểm tra ID, schema, quan hệ và thứ tự trước khi chạy.
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

