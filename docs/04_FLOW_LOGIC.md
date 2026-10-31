# 04. Luồng nghiệp vụ và quy tắc TOEIC

> Đặc tả hành vi mục tiêu; xem `PROJECT_CONTEXT.md` để biết phần nào đã triển khai và đã được kiểm chứng.

> Các luồng mới cần ghép vào module và controller/service/page/service hiện có theo cấu trúc repository. Không cần thiết kế lại toàn hệ thống để thêm một luồng nghiệp vụ.

### Đổi mật khẩu và thu hồi JWT

1. Người dùng đã xác thực gửi mật khẩu hiện tại và mật khẩu mới; backend xác minh mật khẩu hiện tại, cập nhật hash và tăng `User.authVersion` trong cùng giao dịch.
2. JWT mang `authVersion` lúc phát hành. Filter đối chiếu claim với user được tải từ DB mỗi request; token cũ bị từ chối ngay khi version đổi.
3. UI xóa phiên hiện tại và yêu cầu đăng nhập lại bằng mật khẩu mới sau khi API đổi mật khẩu thành công.
4. Khóa hoặc mở khóa tài khoản cũng tăng version khi trạng thái thực sự đổi; khóa chặn tài khoản trong lúc khóa, và mở khóa không làm sống lại token cũ.

## 1. Catalog và quyền VIP

1. Tải catalog theo từ khóa, trang, trạng thái publish, nhóm cấu trúc đề (`ALL`, `FULL`, `LISTENING`, `READING`) và metadata free/VIP. Filter nhóm Part chạy phía server trước phân trang; `FULL` chỉ gồm đề có đúng 200 câu, Listening/Reading gồm đề có ít nhất một context thuộc Part tương ứng.
2. Backend chỉ trả nội dung đề mà user được quyền xem; draft chỉ dành cho staff có quyền.
3. Đề VIP chưa có entitlement chỉ hiển thị thông tin và giá VND do admin cấu hình, cùng CTA mua; không tải câu hỏi/media bị khóa. Đề đã gỡ khỏi catalog vẫn mở với người đã mua (entitlement vĩnh viễn), nhưng không lộ cho người khác.
4. Mỗi đề có giá riêng. Checkout nhận test ID, backend xác minh đề đang bán, đọc giá từ DB, snapshot amount/test vào payment; không dùng giá từ client. Nếu đã có quyền thì không thu tiền lần nữa.
5. Chỉ cấp entitlement sau IPN hợp lệ; retry/callback phải idempotent. Thay đổi giá sau này chỉ áp dụng checkout mới, không sửa giao dịch/biên nhận lịch sử.
6. Quyền mua là vĩnh viễn, không có `expiresAt`; refund/revoke không tự phát sinh cho tới khi có chính sách được duyệt.

**Trạng thái code:** admin form/entity có giá riêng; `/api/exam/{id}/access` trả metadata + access flag; checkout `/api/payments/vip/checkout`, IPN cấp `TestEntitlement`, notification, payment history `TEST_VIP`, và kiểm tra entitlement ở detail/part/submit đã nối. Pending URL hết hạn bị giữ để tránh thu trùng; đề có giao dịch không hard-delete. Chưa chạy sandbox/IPN, live migration hoặc end-to-end/visual QA.

### Gỡ hoặc xóa đề hệ thống (Admin)

1. Admin xác nhận thao tác gỡ đề khỏi catalog; UI giải thích đề có lịch sử sẽ được lưu dưới dạng nháp.
2. Backend kiểm tra có kết quả, giao dịch hoặc assignment tham chiếu đề hay không. Nếu có, đổi trạng thái sang `DRAFT`, giữ câu hỏi, media và tham chiếu assignment để lịch sử/quyền hiện có không bị mất, phản hồi `ARCHIVED`.
3. Nếu chưa có kết quả/giao dịch/assignment, backend xóa cứng đề. Trước đó, media đề private/public chỉ bị xóa khỏi Cloudinary khi không còn được context của đề khác tham chiếu; registry private được dọn cùng asset.
4. UI hiển thị kết quả thực tế từ backend, không khẳng định xóa vĩnh viễn cho trường hợp archive.

## 1.1. Đăng ký giáo viên, thanh toán và duyệt

1. Người dùng gửi hồ sơ đăng ký giáo viên; hồ sơ bắt đầu ở `PENDING_PAYMENT` hoặc trạng thái tương đương.
2. Backend tạo checkout/VNPAY request bằng giá phí lấy từ cấu hình/DB và mã tham chiếu duy nhất.
3. Chỉ callback/IPN hợp lệ mới đánh dấu thanh toán thành công. Kết quả redirect của trình duyệt không phải bằng chứng thanh toán.
4. Sau thành công, gửi thông báo “Đã nhận thanh toán, hồ sơ đang chờ quản trị viên duyệt”; trạng thái application là `PENDING_REVIEW`.
5. Admin duyệt hoặc từ chối kèm lý do. Chỉ khi approve mới cấp role TEACHER; lưu admin, thời gian và quyết định.
6. Mục tiêu retry phải tránh thu tiền trùng và bảo toàn khả năng xử lý IPN đến muộn; chính sách hết hạn/mở checkout lại cần giữ mã đơn ổn định hoặc đối soát trước khi tạo giao dịch mới.

**Trạng thái code hiện tại:** các route hồ sơ giáo viên/IPN/return/status đã có. Phí lấy từ `TEACHER_APPLICATION_FEE_VND`; giao dịch pending được dùng lại khi URL còn hạn. Khi URL đã hết hạn nhưng chưa có kết quả provider, giao dịch được giữ ở trạng thái chưa xác định và checkout mới bị chặn để tránh thu tiền trùng; kể cả bản ghi `EXPIRED` cũ cũng cần đối soát trước khi retry. IPN hợp lệ đến muộn vẫn có thể xử lý khi đơn còn `PENDING`. Return chỉ redirect, status UI được poll từ endpoint owner-scoped. Đối soát cần thao tác hỗ trợ/admin; merchant sandbox và IPN public HTTPS chưa được tích hợp end-to-end.

Nếu chủ dự án định dùng chuyển khoản ngân hàng thủ công thay checkout VNPAY, phải xác nhận ai/nguồn nào xác nhận tiền trước bước 4.

## 2. Auth và tài khoản khóa

- AuthContext khôi phục session rồi đồng bộ profile với `/api/user/me`.
- User bị khóa không được gọi nghiệp vụ cần xác thực; token cũ không bỏ qua được backend check.
- Kiểm tra quyền ở từng API; UI guard chỉ phục vụ điều hướng.

## 3. Full test

1. Chỉ bắt đầu khi user có quyền; tải đủ Part/câu theo `questionNumber` tăng dần.
2. Thời lượng hiện tại 120 phút; hết giờ tự nộp theo hành vi UI. Thay đổi cần đồng bộ server/client.
3. Lưu lựa chọn theo question ID, cho phép bỏ trống; trạng thái điều hướng phải phản ánh state hiện tại.
4. Gửi `submissionKey` UUID ổn định cho lượt hiện tại, đáp án + thời gian; backend xác minh câu và tự chấm. Retry cùng key trả về result hiện có; bắt đầu lượt mới dùng key mới.
5. Hiện summary và lưu kết quả server để xem lại trên thiết bị khác.
6. Có thể chọn “Luyện câu sai” để tạo practice set từ các câu sai/bỏ trống ở lần thi. Lần luyện lại là attempt mới, không sửa kết quả gốc.
7. Với bài tập lớp, submit gắn đúng assignment và member; áp dụng deadline/late policy theo mục 8.

> Trạng thái hiện tại: UI gửi bài lên backend; server chấm từ answer key, lưu `TestResult`/`UserAnswer`, và history/review đọc dữ liệu server theo quyền sở hữu. ExamSession cũng tự lưu/khôi phục lựa chọn theo phạm vi và thời hạn nêu tại mục 12; cần xác minh migration/runtime MySQL trước khi coi luồng này sẵn sàng production.

- Khi xuất bản đề, backend kiểm tra nội dung bắt buộc theo Part và tính liên tục/duy nhất của `questionNumber` trong đúng dải global của Part (1–6, 7–31, 32–70, 71–100, 101–130, 131–146, 147–200), đồng thời kiểm tra `orderIndex` khớp câu đầu context. Part 7 phải giữ đúng ranh giới 15 nhóm và số passage đơn/đôi/ba theo `02_DATABASE.md`; passage ghép trong paragraph dùng delimiter `--- BÀI ĐỌC 2 ---` và `--- BÀI ĐỌC 3 ---`, bắt buộc có nội dung ở mỗi đoạn. Có thể publish bộ luyện một phần, nhưng không được dồn câu sang dải Part khác hoặc cắt ngang một nhóm Part 7; áp dụng cả create/update PUBLISHED và publish trực tiếp. Bản nháp vẫn được lưu khi còn thiếu nội dung.

## 4. Luyện theo Part

- Tải câu thuộc Part đã chọn; giữ global question number đúng.
- Part 1/2 có cách hiển thị chuyên biệt như tài liệu `05_UI_UX_SPEC.md`.
- Thời gian, xem giải thích ngay hay sau submit chưa được chủ dự án chốt; giữ hành vi hiện có cho đến khi có quyết định.

## 5. Quy tắc theo Part

- Part 1: mỗi câu có ảnh/audio; hướng dẫn chung “Chọn hình phù hợp nhất”; không lặp prompt hay text option. Bốn nút A/B/C/D.
- Part 2: một audio/câu chứa câu hỏi và response; chỉ hiện A/B/C, không render text option kể cả dữ liệu legacy có giá trị.
- Part 3: 13 contexts × 3 câu = 39; audio bắt buộc, ảnh tùy chọn; câu hỏi và bốn option có text.
- Part 4: 30 câu / 3 câu mỗi audio = 10 audio contexts. Audio bắt buộc, ảnh tùy chọn; câu hỏi và options có text. Đây cũng là cấu trúc ETS công bố; chỉ đổi nếu chủ dự án chủ ý muốn bộ đề phi chuẩn.
- Part 5: câu 101–130; Part 6: 131–146. Giữ cấu trúc hiện hành đến khi có mô tả riêng.
- Part 7: mỗi passage hiển thị một lần; câu hỏi gắn đúng passage. Nhóm passage đôi/ba theo bảng trong `02_DATABASE.md`.

## 6. Submit, history và review

- Server chấm từ answer key DB, không tin score client.
- Mỗi lần làm lưu user, test, optional part, thời lượng, tổng câu, số đúng/điểm và timestamp.
- User chỉ xem history/review của mình; quyền admin cần policy riêng.
- Review cho thấy lựa chọn đã chọn, đáp án đúng, đúng/sai, explanation và transcript/translation nếu phù hợp.
- Điểm luyện part không được trình bày như điểm TOEIC 10–990 của full test.
- Chống tạo result trùng khi retry: frontend giữ key trong `sessionStorage` đến khi nhận xác nhận thành công; backend khóa hàng user trong transaction khi xử lý submit và `test_result.submission_key` có unique constraint. Key trùng chỉ replay kết quả của cùng user/test/assignment/source result; ngữ cảnh khác bị từ chối. Lượt làm lại chủ động là attempt mới với UUID mới. Cơ chế idempotency hoạt động cùng ExamSession, không thay thế session lưu nháp.
- ETS quy định điểm scaled 5–495 cho mỗi section; raw-to-scaled conversion được xây dựng theo từng test form qua equating. Nếu không có bảng chuyển đổi được phép cho đúng form, điểm web phải gắn nhãn **ước tính**, không gọi “điểm ETS chính xác”. Nguồn: [ETS format](https://www.ets.org/content/ets-org/language-master/in/home/toeic/test-takers/about/listening-reading.html), [ETS Examinee Handbook](https://www.ets.org/content/dam/ets-org/fr/pdfs/toeic/toeic-listening-reading-test-examinee-handbook.pdf).

## 7. Giáo viên và lớp học

### Tạo lớp và tham gia

1. TEACHER tạo lớp với tên và mô tả tùy chọn; server cấp mã mời đủ khó đoán. Chủ lớp có thể sửa tên/mô tả trong phạm vi lớp sở hữu hoặc xoay mã; thao tác xoay vô hiệu hóa mã cũ nhưng không thay đổi thành viên/yêu cầu tham gia đã ghi nhận. Thay đổi thông tin lớp được audit nhưng không ghi nội dung mô tả vào log.
2. USER gửi yêu cầu vào lớp bằng mã; membership `PENDING`.
3. Giáo viên duyệt => `APPROVED`, từ chối/gỡ => không còn quyền xem nội dung lớp; chặn => `BLOCKED` và từ chối truy cập/nộp.
4. Giáo viên xem roster theo trạng thái, tìm kiếm; mọi member action chỉ áp dụng trong lớp do giáo viên đó sở hữu.
5. Tài liệu lớp: giáo viên owner tải PDF tối đa 10 MiB; backend kiểm tra chữ ký PDF và marker kết thúc, quota 512 MiB/lớp (cấu hình `CLASSROOM_STORAGE_QUOTA_BYTES`), khóa hàng classroom khi kiểm tra quota/upload và gửi file Cloudinary raw/private. Hidden file vẫn tính quota do asset chưa bị xóa. Teacher owner và student có membership APPROVED mới xem danh sách/tải. Mỗi thao tác download kiểm tra lại quyền rồi cấp URL signed attachment 5 phút; không trả storage URL trong metadata. File legacy thiếu private asset ID không cấp link tải; giáo viên cần tải lại.

### Đề và bài tập

- Giáo viên tạo, sửa, xóa và publish đề riêng trong studio được scope theo lớp do mình sở hữu; đề được lưu trong `Test` cùng `classroom_id`/`owner_teacher_id`, không tạo mô hình đề thứ hai. Đề lớp không thể VIP và không lọt catalog chung. Học sinh chỉ xem/làm khi membership APPROVED; assignment có thể dùng đề hệ thống PUBLISHED không VIP hoặc đề PUBLISHED của chính lớp đó.
- Assignment gồm tiêu đề, hướng dẫn, test nguồn, thời điểm mở nếu có, deadline, late policy, số lần làm tối đa và trạng thái. Các chính sách chưa có trong mô tả cần cấu hình/chốt.
- Giáo viên có thể sửa nội dung/deadline hoặc gia hạn; giữ lịch sử và submission hiện có. Xóa nên ẩn/soft-delete để bảo toàn điểm.
- Submission mới phải resolve assignment còn active; assignment đã ẩn giữ lịch sử nhưng không tiếp nhận lượt làm mới.
- Assignment hiện giao toàn bộ Test, không có cấu hình Part; backend từ chối submit assignment nếu client gửi filter `partId`/`partIds`/`partNumbers`. Luyện Part cá nhân không gắn assignment vẫn giữ nguyên.
- Học sinh chỉ xem assignment nếu membership còn APPROVED và assignment thuộc lớp đó.

### Deadline và submission

- Mọi so sánh deadline phải thống nhất timezone nghiệp vụ; frontend hiển thị Asia/Ho_Chi_Minh. Hiện tại API/schema dùng `LocalDateTime` không offset để tương thích; backend đặt JVM timezone qua `APP_BUSINESS_TIME_ZONE` (mặc định `Asia/Ho_Chi_Minh`) và Hibernate JDBC dùng cùng giá trị. Không đổi timezone giữa môi trường có cùng dữ liệu; chuyển sang timestamp có offset/UTC cần migration và xác minh dữ liệu hiện có.
- Hai chế độ late policy: `REJECT_AFTER_DEADLINE` (không nhận submit) hoặc `ACCEPT_AND_MARK_LATE` (nhận nhưng gắn LATE, lưu submittedAt). Chủ dự án cần chọn mặc định; không triển khai một chế độ ngầm.
- So sánh thời điểm server nhận request, không tin đồng hồ client. Ghi nhận lần cuối/nộp thay thế theo attempt policy.
- Khi nhận submission, tính và lưu cờ trễ cùng deadline snapshot trên `TestResult`; báo cáo dùng cờ này thay vì suy diễn từ `created_at` có thể có precision khác.
- Cập nhật deadline/late policy, lưu trữ assignment và ghi nhận submission khóa cùng hàng assignment trong transaction; submit refresh dữ liệu sau khi lấy khóa rồi mới áp late policy và lưu deadline snapshot. Nhờ vậy mỗi lượt nộp được quyết định theo một phiên bản policy đã commit, không theo entity cũ đang nằm trong persistence context.
- Trạng thái roster/report có thể là `NOT_SUBMITTED`, `SUBMITTED`, `LATE`, `GRADED`; bài hết hạn mà chưa nộp hiển thị `MISSING` tính từ assignment/member, không phải một kết quả giả.
- Báo cáo lớp hiển thị danh sách đã nộp/chưa nộp/trễ; sort theo điểm tăng/giảm hoặc tên A–Z/Z–A. Định nghĩa xử lý điểm chưa chấm/null khi sort.
- Mốc đã triển khai: summary tính trung bình từ kết quả có nhận xét giáo viên và có score; bài trễ đã nhận xét vẫn tính, bài thiếu/chưa nhận xét không tính. Response kèm số lượng trong mẫu số; do hiện chưa có grade field riêng, đây là trung bình điểm bài thi của các lượt đã nhận xét.

## 8. Thông báo và thống kê

- Tạo in-app notification khi: học sinh được giao assignment mới; deadline được đổi/gia hạn; giáo viên gửi feedback; thanh toán/hồ sơ teacher đổi trạng thái.
- Notification chỉ tới thành viên APPROVED tại thời điểm sự kiện; thông báo có deep link nội bộ, unread/read, thời gian và không lộ thông tin lớp cho người ngoài.
- Tab hiển thị gửi heartbeat khi đang authenticated và document visible; client nhịp 60 giây, server chỉ ghi tối đa một lần/phút/user. Không gửi route/action/question.
- Admin overview đếm user duy nhất có `last_seen_at` trong 5 phút và chưa khóa; đây là presence ước lượng, không đồng nghĩa với user active trong ngày.
- Lượt submit mỗi ngày lấy từ `test_result.created_at`, gồm full/part/assignment/review lại; lượt bắt đầu lấy từ `exam_session.started_at`. Resume session không tạo lượt bắt đầu mới; hủy/expire vẫn là lần bắt đầu. Nhóm ngày theo `APP_REPORTING_TIME_ZONE` (mặc định `Asia/Ho_Chi_Minh`) và trả cả ngày không có lượt.
- Màn dashboard cho chọn ngày bắt đầu/kết thúc; API chặn khoảng sai, ngày tương lai và khoảng dài hơn 367 ngày. Aggregate không trả PII.

## 9. Luyện nghe chép chính tả

- Tải riêng context Listening qua API dictation đã xác thực; API chỉ trả transcript cần cho bài luyện, không trả options, answer key hoặc explanation. VIP/classroom access vẫn được xác minh tại server.
- Chọn audio/context hợp lệ, nghe theo câu/đoạn, nhập nội dung nghe được, cho phép phát lại theo giới hạn cài đặt.
- So sánh văn bản sau chuẩn hóa dấu câu/khoảng trắng nhưng vẫn hiển thị bản gốc; khác biệt từ thiếu/thừa/sai cần dễ nhận biết.
- Có thể hiện transcript/translation sau khi kiểm tra hoặc khi người học bật reveal; không mặc định tiết lộ transcript trước lượt nghe đầu nếu mục tiêu là dictation.
- Lưu tiến trình/độ chính xác nếu người dùng đăng nhập; nếu không, cần nêu chính sách local storage và quyền riêng tư.
- Chỉ sử dụng audio/transcript mà hệ thống có quyền lưu trữ/phân phối.

## 10. Đánh giá đầu vào và lộ trình học (đề xuất)

1. Học viên khai báo mục tiêu điểm và ngày dự thi (tùy chọn), rồi làm bài diagnostic được gắn nhãn rõ đây không phải điểm thi chính thức.
2. Hệ thống tổng hợp độ chính xác/thời gian theo Part và loại câu từ kết quả hợp lệ; diagnostic không làm thay đổi lịch sử mock test.
3. Study plan đề xuất các buổi luyện dựa trên phần yếu, thời gian còn lại và khối lượng học viên chọn; học viên có thể sửa/bỏ mục tiêu.
4. Mỗi gợi ý phải giải thích lý do (“Part 3 accuracy thấp”), không tuyên bố đảm bảo đạt điểm.

## 11. Sổ câu sai và ôn tập ngắt quãng (đề xuất)

- Sau khi bài được nộp/chấm, thêm câu sai/bỏ trống vào danh sách ôn theo question version.
- Câu đã nắm có thể đánh dấu/ẩn; câu đang lỗi hoặc đã thay version cần báo trạng thái, không đưa đáp án lỗi tiếp tục luyện.
- Scheduler tăng dần khoảng cách khi trả lời đúng và rút ngắn khi sai; thuật toán/lịch cụ thể là cấu hình sản phẩm cần duyệt.
- Lượt ôn là practice activity riêng, không ghi đè score/history của lần thi gốc.

## 12. Tiếp tục phiên thi (đã nối code; cần xác minh tích hợp DB)

1. Backend tạo session gắn user, test snapshot, assignment/source result tùy chọn và câu hỏi được xác định từ dữ liệu server; lưu lựa chọn định kỳ qua autosave.
2. Mỗi lần lưu kiểm tra owner, session TTL, quyền VIP, assignment membership/deadline/late policy và fingerprint nội dung đề. Với assignment, backend khóa hàng membership APPROVED trong giao dịch khi autosave/nộp; thao tác giáo viên đổi trạng thái cùng membership cũng lấy khóa đó để không thể commit hai quyết định trái nhau đồng thời. Không chấp nhận câu hỏi ngoài session hoặc giá trị ngoài A–D.
3. Khi quay lại cùng phạm vi, hỏi tiếp tục hay hủy session cũ để tạo lượt mới; câu trả lời được khôi phục và đồng hồ căn theo server `startedAt`/remainingSeconds.
4. Full test và assignment dùng đồng hồ đếm ngược tối đa 120 phút; assignment `REJECT_AFTER_DEADLINE` dừng đồng hồ trước deadline 2 giây để gửi request trong hạn. Với `ACCEPT_AND_MARK_LATE`, autosave và submit được phép đến khi session hết TTL (tối đa 24 giờ sau deadline), timer không vượt quá TTL còn lại và backend đánh dấu lần nộp trễ; với policy từ chối, backend không cho autosave/submit sau deadline. Luyện Part/wrong-answer dùng stopwatch và giữ nháp 24 giờ.
5. Nộp bài truyền sessionId; backend dùng elapsed time server và snapshot đáp án khi đã hết giờ. Trước hết giờ, snapshot cuối cùng được validate/lưu atomically cùng submit. Submit idempotent; session lưu status/result để chặn làm lặp sai phạm vi.
6. Dữ liệu session không chứa answer key. Cleanup job chạy mỗi 5 phút, expire session active hết TTL và xóa answer/target drafts; submit hoặc hủy lượt cũng xóa draft ngay. Giới hạn tổng session khác phạm vi chưa có.

## 13. Báo lỗi nội dung và quản lý phiên bản (đề xuất)

- Học viên có thể báo lỗi loại câu/đáp án, audio, ảnh, transcript hoặc explanation; gửi question ID/version và ghi chú ngắn.
- Admin xem queue, đánh dấu đang xem/đã sửa/không phải lỗi, lưu reviewer và resolution.
- Khi đề có attempt, chỉnh sửa nội dung/answer key phải tạo revision mới hoặc có snapshot; review cũ vẫn hiển thị đúng nội dung và đáp án tại thời điểm thi.
- Giới hạn tần suất báo lỗi và không cho người báo trực tiếp sửa đề.

## 14. Nhắc học và báo cáo thương mại (đề xuất)

- Học viên tự bật/tắt nhắc ôn/nhắc deadline theo loại/kênh có hỗ trợ; quiet hours theo timezone user. Transaction status và thông báo bảo mật tuân policy bắt buộc.
- Hạn chế notification trùng: khi gia hạn bài, cập nhật cùng assignment event hoặc tạo một thông báo mới có nội dung rõ; không gửi nhắc cũ với deadline sai.
- Funnel quản trị dùng event tổng hợp: catalog view → checkout tạo → thanh toán confirmed → bắt đầu đề → submit. Phân biệt số người dùng duy nhất với số event.
- Chọn retention/consent; không cần lưu từng đáp án hoặc nội dung bài học để tính conversion.

## 15. Quản trị và hồ sơ

- Admin soạn draft, kiểm tra, publish; xóa theo policy. Update/delete phải giữ media còn tham chiếu và chỉ dọn media bỏ dùng.
- Admin khóa/mở tài khoản; backend kiểm tra trạng thái khóa trên mọi thao tác cần auth.
- Payment chỉ đổi sang thành công sau xác minh server; entitlement cập nhật cùng giao dịch an toàn.
- Hồ sơ chỉ cập nhật user hiện tại; đổi mật khẩu local xác minh mật khẩu cũ và lưu BCrypt. Google-only account chưa có mật khẩu được đặt mật khẩu một lần sau khi xác minh lại bằng Google ID token còn mới tối đa 5 phút, subject trùng `google_sub`; lưu BCrypt và tăng `authVersion`, nên phải đăng nhập lại. Không lưu password hoặc Google ID token trong localStorage/sessionStorage.

## 16. Bất biến bảo mật xuyên luồng

- Mỗi request kiểm tra trạng thái locked/quyền và scope dữ liệu theo actor; không dựa vào menu, form, `userId` hoặc `classId` từ browser.
- Exam session/submit dùng thời gian và answer key server-side; không trả đáp án trước submit, không chấp nhận score tự khai, không tạo kết quả trùng khi retry.
- Catalog chỉ trả metadata public. Trước tải nội dung/media VIP, server kiểm tra entitlement vĩnh viễn đã cấp cho user; lớp học kiểm tra membership/ownership mỗi lần truy cập.
- VNPAY return trên browser chỉ phục vụ trải nghiệm. Chỉ callback/IPN được xác minh và đối chiếu với đơn trong DB mới cập nhật trạng thái/cấp quyền; callback xử lý lặp phải an toàn.
- Upload kiểm tra type/content/size/quota và quyền; xóa media cần xác nhận asset thuộc provider namespace, ownership và không còn tham chiếu.
- Registration/login/password, payment/entitlement, thay đổi role/status, duyệt giáo viên và thao tác đề/lớp quan trọng cần tạo audit event tối thiểu nhưng không log secret/credential. Code ghi nhận registration/login success/failure, đổi/đặt mật khẩu, payment/entitlement IPN, user lock/unlock, teacher review, đề, membership, assignment, feedback và tài liệu; auth event không lưu identifier.
- Nếu đổi JWT bearer sang cookie hoặc thêm refresh token, cập nhật threat model CSRF/XSS/session và API/UI cùng lúc trước khi release.
- Chi tiết threat model/checklist: `docs/06_SECURITY_SPEC.md`.

