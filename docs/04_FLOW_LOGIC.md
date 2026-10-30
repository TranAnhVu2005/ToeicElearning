# 04. Luồng nghiệp vụ và quy tắc TOEIC

> Đặc tả hành vi mục tiêu. API submit/history hiện chưa hoàn tất; xem `PROJECT_CONTEXT.md` để biết trạng thái code.

## 1. Catalog và quyền VIP

1. Tải catalog theo từ khóa, trang, trạng thái publish và loại miễn phí/VIP.
2. Backend chỉ trả nội dung đề mà user được quyền xem; draft chỉ dành cho staff có quyền.
3. Đề VIP chưa có entitlement chỉ hiển thị thông tin/CTA mua, không tải câu hỏi bị khóa.
4. Cấp quyền sau khi backend xác minh thanh toán thành công.

## 1.1. Đăng ký giáo viên, thanh toán và duyệt

1. Người dùng gửi hồ sơ đăng ký giáo viên; hồ sơ bắt đầu ở `PENDING_PAYMENT` hoặc trạng thái tương đương.
2. Backend tạo checkout/VNPAY request bằng giá phí lấy từ cấu hình/DB và mã tham chiếu duy nhất.
3. Chỉ callback/IPN hợp lệ mới đánh dấu thanh toán thành công. Kết quả redirect của trình duyệt không phải bằng chứng thanh toán.
4. Sau thành công, gửi thông báo “Đã nhận thanh toán, hồ sơ đang chờ quản trị viên duyệt”; trạng thái application là `PENDING_REVIEW`.
5. Admin duyệt hoặc từ chối kèm lý do. Chỉ khi approve mới cấp role TEACHER; lưu admin, thời gian và quyết định.
6. Trường hợp giao dịch thất bại/hết hạn cho phép retry theo policy; xử lý callback lặp không tạo nhiều hồ sơ/quyền.

Nếu chủ dự án định dùng chuyển khoản ngân hàng thủ công thay checkout VNPAY, phải xác nhận ai/nguồn nào xác nhận tiền trước bước 4.

## 2. Auth và tài khoản khóa

- AuthContext khôi phục session rồi đồng bộ profile với `/api/user/me`.
- User bị khóa không được gọi nghiệp vụ cần xác thực; token cũ không bỏ qua được backend check.
- Kiểm tra quyền ở từng API; UI guard chỉ phục vụ điều hướng.

## 3. Full test

1. Chỉ bắt đầu khi user có quyền; tải đủ Part/câu theo `questionNumber` tăng dần.
2. Thời lượng hiện tại 120 phút; hết giờ tự nộp theo hành vi UI. Thay đổi cần đồng bộ server/client.
3. Lưu lựa chọn theo question ID, cho phép bỏ trống; trạng thái điều hướng phải phản ánh state hiện tại.
4. Gửi đáp án + thời gian; backend xác minh câu và tự chấm.
5. Hiện summary và lưu kết quả server để xem lại trên thiết bị khác.
6. Có thể chọn “Luyện câu sai” để tạo practice set từ các câu sai/bỏ trống ở lần thi. Lần luyện lại là attempt mới, không sửa kết quả gốc.
7. Với bài tập lớp, submit gắn đúng assignment và member; áp dụng deadline/late policy theo mục 8.

> UI hiện chấm local và lưu `test_history_{testId}` trong localStorage; đây chưa phải lịch sử server-side.

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
- Quy tắc chống submit lặp cần chốt khi thiết kế API.
- ETS quy định điểm scaled 5–495 cho mỗi section; raw-to-scaled conversion được xây dựng theo từng test form qua equating. Nếu không có bảng chuyển đổi được phép cho đúng form, điểm web phải gắn nhãn **ước tính**, không gọi “điểm ETS chính xác”. Nguồn: [ETS format](https://www.ets.org/content/ets-org/language-master/in/home/toeic/test-takers/about/listening-reading.html), [ETS Examinee Handbook](https://www.ets.org/content/dam/ets-org/fr/pdfs/toeic/toeic-listening-reading-test-examinee-handbook.pdf).

## 7. Giáo viên và lớp học

### Tạo lớp và tham gia

1. TEACHER tạo lớp; server cấp mã mời đủ khó đoán, có thể thu hồi/đổi.
2. USER gửi yêu cầu vào lớp bằng mã; membership `PENDING`.
3. Giáo viên duyệt => `APPROVED`, từ chối/gỡ => không còn quyền xem nội dung lớp; chặn => `BLOCKED` và từ chối truy cập/nộp.
4. Giáo viên xem roster theo trạng thái, tìm kiếm; mọi member action chỉ áp dụng trong lớp do giáo viên đó sở hữu.
5. Tài liệu lớp chỉ truy cập cho giáo viên owner và học sinh được duyệt; validate tệp, quyền và URL.

### Đề và bài tập

- Giáo viên có thể soạn đề riêng gắn lớp hoặc chọn đề chung đã publish. Đề private không tự public/VIP.
- Assignment gồm tiêu đề, hướng dẫn, test nguồn, thời điểm mở nếu có, deadline, late policy, số lần làm tối đa và trạng thái. Các chính sách chưa có trong mô tả cần cấu hình/chốt.
- Giáo viên có thể sửa nội dung/deadline hoặc gia hạn; giữ lịch sử và submission hiện có. Xóa nên ẩn/soft-delete để bảo toàn điểm.
- Học sinh chỉ xem assignment nếu membership còn APPROVED và assignment thuộc lớp đó.

### Deadline và submission

- Mọi so sánh deadline dùng timestamp có timezone rõ; frontend hiển thị Asia/Ho_Chi_Minh.
- Hai chế độ late policy: `REJECT_AFTER_DEADLINE` (không nhận submit) hoặc `ACCEPT_AND_MARK_LATE` (nhận nhưng gắn LATE, lưu submittedAt). Chủ dự án cần chọn mặc định; không triển khai một chế độ ngầm.
- So sánh thời điểm server nhận request, không tin đồng hồ client. Ghi nhận lần cuối/nộp thay thế theo attempt policy.
- Trạng thái roster/report có thể là `NOT_SUBMITTED`, `SUBMITTED`, `LATE`, `GRADED`; bài hết hạn mà chưa nộp hiển thị `MISSING` tính từ assignment/member, không phải một kết quả giả.
- Báo cáo lớp hiển thị danh sách đã nộp/chưa nộp/trễ; sort theo điểm tăng/giảm hoặc tên A–Z/Z–A. Định nghĩa xử lý điểm chưa chấm/null khi sort.
- Điểm trung bình mặc định tính từ submission đã chấm trong assignment, chỉ trên học sinh đủ điều kiện trong lớp; hiển thị số bài được tính và quy tắc loại bài thiếu/trễ. Cần chủ dự án xác nhận có tính bài trễ không.

## 8. Thông báo và thống kê

- Tạo in-app notification khi: học sinh được giao assignment mới; deadline được đổi/gia hạn; giáo viên gửi feedback; thanh toán/hồ sơ teacher đổi trạng thái.
- Notification chỉ tới thành viên APPROVED tại thời điểm sự kiện; thông báo có deep link nội bộ, unread/read, thời gian và không lộ thông tin lớp cho người ngoài.
- Thống kê admin phân biệt users online (presence heartbeat trong cửa sổ TTL cấu hình) với tài khoản đang hoạt động theo ngày (đã login/action). Không dùng hai metric như nhau.
- Số bài test mỗi ngày phân biệt `startedAttempts` và `submittedAttempts`; KPI chính đề xuất là số submit hợp lệ, group theo timezone hiển thị. Báo cáo cần chọn khoảng ngày.
- Presence là số ước lượng; chọn TTL và retention, không ghi lại thao tác chi tiết không cần thiết.

## 9. Luyện nghe chép chính tả

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

## 12. Tiếp tục phiên thi (đề xuất)

1. Backend tạo session gắn user, test version, mode và optional assignment; lưu answer snapshot định kỳ.
2. Mỗi lần lưu kiểm tra owner, session TTL, quyền VIP, assignment membership/deadline và phiên bản test.
3. Khi quay lại, hỏi tiếp tục phiên hiện tại hay nộp/hủy theo policy; đồng hồ lấy từ thời điểm server, không cộng bù theo đồng hồ client.
4. Submit idempotent; phiên đã nộp không tạo kết quả thứ hai khi retry do mạng.
5. Giới hạn session đồng thời và thời gian giữ bản nháp; không lưu answer key trong session.

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
- Hồ sơ chỉ cập nhật user hiện tại; đổi mật khẩu xác minh mật khẩu cũ và lưu BCrypt. Không lưu password trong localStorage.

## 16. Bất biến bảo mật xuyên luồng

- Mỗi request kiểm tra trạng thái locked/quyền và scope dữ liệu theo actor; không dựa vào menu, form, `userId` hoặc `classId` từ browser.
- Exam session/submit dùng thời gian và answer key server-side; không trả đáp án trước submit, không chấp nhận score tự khai, không tạo kết quả trùng khi retry.
- Catalog chỉ trả metadata public. Trước tải nội dung/media VIP, server kiểm tra entitlement còn hiệu lực; lớp học kiểm tra membership/ownership mỗi lần truy cập.
- VNPAY return trên browser chỉ phục vụ trải nghiệm. Chỉ callback/IPN được xác minh và đối chiếu với đơn trong DB mới cập nhật trạng thái/cấp quyền; callback xử lý lặp phải an toàn.
- Upload kiểm tra type/content/size/quota và quyền; xóa media cần xác nhận asset thuộc provider namespace, ownership và không còn tham chiếu.
- Login, password reset, payment, thay đổi role/status, duyệt giáo viên và thao tác đề/lớp quan trọng tạo audit event tối thiểu nhưng không log secret/credential.
- Nếu đổi JWT bearer sang cookie hoặc thêm refresh token, cập nhật threat model CSRF/XSS/session và API/UI cùng lúc trước khi release.
- Chi tiết threat model/checklist: `docs/06_SECURITY_SPEC.md`.

