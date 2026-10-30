# 01. Tổng quan TOEIC Learning

> Đặc tả sản phẩm dự kiến, không phải xác nhận rằng các chức năng đã có trong mã. Xem trạng thái thực tế ở `PROJECT_CONTEXT.md`.

## 1. Mục tiêu

Website luyện thi TOEIC có quản trị nội dung bài thi, quản lý người dùng, bán quyền truy cập đề VIP qua VNPAY, hỗ trợ học viên làm full test/luyện Part và xem lại kết quả.

## 2. Vai trò

### Admin
- Thêm, sửa và xóa đề thi; quản lý đề miễn phí/VIP và trạng thái xuất bản.
- Xem danh sách người dùng, khóa và mở khóa tài khoản.
- Tra cứu lịch sử giao dịch: người thanh toán, số tiền, nội dung/đề mua, thời gian, mã giao dịch và trạng thái thành công/thất bại/đang xử lý.
- Theo dõi số người dùng đang hoạt động và số lượt làm bài hoàn tất theo ngày.
- Duyệt/từ chối hồ sơ đăng ký giáo viên sau bước thanh toán; xem lý do/trạng thái và lịch sử thao tác.

### Người dùng
- Đăng ký/đăng nhập theo các phương thức hệ thống hỗ trợ.
- Xem danh sách đề và quyền truy cập tương ứng; mua đề VIP nếu chưa có quyền.
- Chỉnh sửa thông tin cá nhân, đổi mật khẩu.
- Làm full test, luyện theo Part, xem lại lần làm đã hoàn thành.
- Theo dõi điểm/yếu theo Part, đặt mục tiêu điểm/ngày thi và nhận gợi ý ôn tập (đề xuất cần duyệt).
- Luyện lại câu sai theo danh sách cá nhân; nhận bài ôn theo khoảng cách thời gian (đề xuất cần duyệt).
- Tiếp tục phiên làm bài đã lưu sau khi mất mạng/đóng trình duyệt nếu phiên còn hiệu lực (đề xuất cần duyệt).

### Giáo viên
- Gửi hồ sơ đăng ký giáo viên và hoàn tất khoản phí theo phương thức hệ thống hỗ trợ; nhận thông báo khi thanh toán xác nhận, sau đó chờ admin phê duyệt.
- Tạo lớp, chia sẻ mã/lời mời, duyệt học sinh, xem danh sách thành viên, chặn hoặc xóa thành viên theo quyền.
- Đăng tài liệu trong lớp; tạo đề riêng tư cho lớp mình hoặc chọn đề công khai của hệ thống để giao.
- Tạo/sửa/xóa bài tập, đặt hoặc gia hạn hạn nộp; theo dõi trạng thái nộp, điểm và nhận xét.
- Theo dõi bài chưa nộp, trễ, chưa chấm và xu hướng kết quả; xuất bảng điểm khi cần (đề xuất cần duyệt).

### Học sinh
- Tham gia lớp bằng mã/lời mời, theo dõi tài liệu, bài tập, hạn nộp và thông báo của giáo viên.
- Làm bài tập lớp, nhận trạng thái đã nộp/trễ và xem nhận xét khi được công bố.
- Luyện lại câu sai, luyện nghe transcript/audio và chép chính tả từ nội dung có bản quyền sử dụng hợp lệ.

## 3. Nền tảng hiện tại
- Backend: Java 17, Spring Boot/Maven, Spring Data JPA, Spring Security, MySQL.
- Frontend: React/JSX, Vite, React Router, Tailwind CSS, Axios.
- JWT bearer auth; media bài thi lưu Cloudinary.
- Mô hình đề: `Test -> ContextQuestion -> Question`, với `Part` cho 7 phần TOEIC.
- Đọc `PROJECT_CONTEXT.md` (<100 dòng) để biết entry points, command, trạng thái thực thi và các giới hạn đang biết.

## 4. Định hướng kiến trúc sản phẩm
- Backend xác thực quyền ADMIN/USER, trạng thái giao dịch và quyền truy cập đề. Frontend guard chỉ hỗ trợ trải nghiệm điều hướng.
- Không để client quyết định thanh toán thành công, đáp án đúng, hay quyền mua đề.
- Phân biệt đề draft/published và free/VIP. Đề VIP chỉ mở khi backend xác nhận quyền hợp lệ.
- Lưu bài nộp/kết quả phía server là mục tiêu cần triển khai vì yêu cầu xem lại bài; trạng thái hiện tại ghi trong `PROJECT_CONTEXT.md`.
- Tách đăng ký/kiểm tra thanh toán giáo viên khỏi phê duyệt vai trò: thanh toán thành công chỉ chuyển hồ sơ sang “chờ duyệt”, không tự cấp role TEACHER.
- Mỗi lớp, thành viên, đề riêng, assignment, submission và notification phải được scope theo quyền sở hữu phía backend.
- Báo cáo dashboard cần định nghĩa metric rõ ràng, timezone, khoảng ngày và cách tính “đang hoạt động”.

## 5. Nguồn định dạng và giới hạn điểm thi

Yêu cầu Part 1–7 khớp cấu trúc TOEIC Listening & Reading 200 câu; ETS mô tả Listening 100 câu/45 phút, Reading 100 câu/75 phút và 7 Parts. Tuy nhiên điểm ETS dùng scaled score 5–495 mỗi section và conversion raw-to-scaled phụ thuộc từng test form/equating; bảng chuyển đổi chính thức không được công bố chung. Vì vậy không quảng bá điểm tự quy đổi là “điểm ETS chính xác” trừ khi hệ thống dùng conversion table được phép cho đúng form. Nếu không, ghi rõ “điểm ước tính theo mô hình luyện tập”.

Nguồn chính thức: [ETS TOEIC Listening & Reading format](https://www.ets.org/content/ets-org/language-master/in/home/toeic/test-takers/about/listening-reading.html), [ETS Examinee Handbook và raw-to-scaled conversion](https://www.ets.org/content/dam/ets-org/fr/pdfs/toeic/toeic-listening-reading-test-examinee-handbook.pdf).

ETS cũng nêu rõ kết quả ứng dụng luyện tập của họ không được công nhận là kết quả thi TOEIC chính thức và chỉ dành cho mục đích chuẩn bị. Sản phẩm cần thể hiện giới hạn tương tự với mock score. [ETS TOEIC Test app](https://www.etsglobal.org/fx/en/content/toeic-test-application).

## 6. Lộ trình sản phẩm đề xuất

Để giảm rủi ro mà vẫn tiến tới sản phẩm có thể thu phí, triển khai theo các mốc có thể nghiệm thu:

1. **Nền tảng đáng tin cậy:** auth/RBAC, quản trị đề, catalog/free-VIP, phòng thi, backend submit/history/review, an toàn answer key.
2. **Lớp học:** teacher application/approval, classroom membership/material, đề private, assignment/deadline/submission/report/feedback.
3. **Thương mại:** VNPAY checkout/IPN, entitlement, màn admin transaction, đối soát và chính sách hoàn/đơn lỗi.
4. **Cải thiện học tập:** đánh giá đầu vào, mục tiêu/kế hoạch học, sổ câu sai, ôn tập ngắt quãng, tiến bộ theo Part, tiếp tục phiên thi, audio tools.
5. **Giữ chân và vận hành:** notification preferences, metrics/dashboard, report nội dung lỗi, vận hành/backup/audit.

Thứ tự là đề xuất quản trị scope, chủ dự án có thể thay đổi. Không bắt đầu triển khai cho đến khi người dùng yêu cầu.

## 6.1. Đề xuất tính năng bổ sung cần chủ dự án duyệt

- **Diagnostic + study plan:** bài đánh giá ngắn, mục tiêu điểm/ngày thi và gợi ý nội dung luyện từ phần yếu. Đây là chức năng định hướng học, không được tuyên bố đảm bảo tăng điểm.
- **Wrong-answer notebook + spaced repetition:** gom câu sai/bỏ trống và nhắc ôn lại; người học có thể loại câu khỏi danh sách hoặc đánh dấu đã nắm.
- **Resumable exam session:** tự lưu câu trả lời và trạng thái phiên; khi quay lại xác thực phiên còn hạn, tránh tạo submit lặp. Xác định rõ thời hạn/thiết bị/đồng hồ server.
- **Content quality workflow:** báo lỗi câu/audio/ảnh/đáp án; Admin xem hàng đợi, ghi quyết định và version đề để tránh sửa âm thầm kết quả cũ.
- **Listening controls:** tốc độ phát, tua lùi ngắn, transcript hiện sau lượt luyện hoặc theo quyền cài đặt; không làm lộ transcript/answer trong chế độ mock exam.
- **Operational reporting:** phân biệt attempt bắt đầu/nộp, funnel xem đề → checkout → thanh toán → hoàn thành; chỉ lưu metric cần thiết.
- **Notification preferences:** chọn loại/kênh/thời gian yên lặng; thông báo deadline vẫn có ngày giờ tuyệt đối và chống gửi trùng.
- **Commercial readiness:** chính sách gói/giá, quyền truy cập, hóa đơn/biên nhận, hoàn/đơn lỗi, liên hệ hỗ trợ, điều khoản và quyền nội dung trước mở bán.

Các mục này là benchmark/đề xuất, chưa được coi là yêu cầu đã duyệt. Tham khảo: [ETS OLPC](https://www.etsglobal.org/mf/en/content/toeic-official-learning-and-preparation-course), [HOCTOEIC practice guide](https://hoctoeic.vn/huong-dan-su-dung), [Google Classroom analytics](https://support.google.com/edu/classroom/answer/17231999?hl=en-eu), [TOEIC Test app by ETS Global](https://www.etsglobal.org/fx/en/content/toeic-test-application).

## 7. Yêu cầu vận hành cho bản thương mại

- Có audit actor/time cho thao tác nhạy cảm: duyệt teacher, khóa user, sửa/publish/xóa đề, member action, đổi deadline/feedback và cập nhật transaction.
- Giới hạn quyền theo owner/class membership; kiểm soát upload MIME/kích thước/quyền truy cập và URL media.
- Có sao lưu/khôi phục DB, giám sát lỗi thanh toán/callback, log có correlation ID nhưng không ghi token/secret/PII không cần thiết.
- Công khai điều khoản dịch vụ, chính sách dữ liệu cá nhân, điều kiện mua/hoàn phí và quyền sở hữu nội dung trước khi thương mại hóa; chi tiết pháp lý cần được người vận hành xác nhận theo thị trường triển khai.

## 8. Cách dùng tài liệu

- `PROJECT_CONTEXT.md` là bản tóm tắt gọn dưới 100 dòng; `AGENTS.md` quy định thứ tự đọc và cách làm việc.
- Trước implementation, đọc đặc tả liên quan; tác vụ có ảnh hưởng bảo mật phải đọc `docs/06_SECURITY_SPEC.md` và xác minh code.
- Các tài liệu mô tả yêu cầu/đề xuất; trạng thái code phải xác nhận từ repository.

## 9. Tiêu chí bảo mật

- Bảo mật là tiêu chí nền tảng của mọi mốc phát triển: deny-by-default, authorization theo role và quyền sở hữu, không lộ answer key, xác minh payment server-side, bảo vệ upload, secret, PII và audit.
- Trước production cần threat model, kiểm tra quyền chéo tài khoản/lớp, review HTTPS/headers, rate limit, backup/restore, quy trình incident và đánh giá bảo mật phù hợp rủi ro.
- Bảo vệ dữ liệu cá nhân cần được thiết kế theo quy định hiện hành và mô hình vận hành cụ thể; xem `docs/06_SECURITY_SPEC.md`, không coi tài liệu này là tư vấn pháp lý.
- `docs/06_SECURITY_SPEC.md` mô tả yêu cầu và dấu hiệu hiện trạng cần xác minh. Tài liệu không đồng nghĩa chức năng đã được code hoặc kiểm chứng.
1. Đọc `AGENTS.md` trước mọi tác vụ.
2. Đọc `PROJECT_CONTEXT.md` để định vị nhanh repo và trạng thái hiện tại.
3. Đọc tài liệu trong `docs/` liên quan trực tiếp: `02_DATABASE.md`, `03_API_SPEC.md`, `04_FLOW_LOGIC.md`, `05_UI_UX_SPEC.md`.
4. Mở mã nguồn tương ứng trước khi lập kế hoạch thay đổi; đặc tả không chứng minh tính năng đã được code.
5. Nếu nội dung đánh dấu “Cần chốt”, không tự biến nó thành quy tắc nghiệp vụ.
6. Bảo đảm quyền sử dụng đề, audio, ảnh, transcript và lời giải trước khi đưa nội dung lên một dịch vụ thương mại; không mặc định tài liệu ETS/của bên thứ ba được phép phân phối lại.

