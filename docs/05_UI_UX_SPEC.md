# 05. Đặc tả UI/UX TOEIC Learning

> Hướng giao diện đề xuất. Tham khảo ngôn ngữ Neo-brutalism từ tài liệu UI một dự án thư viện khác; chỉ lấy phong cách, không lấy nghiệp vụ/route/framework. Chủ dự án có thể chỉnh trước implementation.

## 1. Ngôn ngữ thị giác

- Palette gợi ý: giấy ngà `#FFFDF2`, mực `#111111`, vàng `#FDC800` cho CTA, violet `#432DD7` làm nhấn phụ. Trạng thái có nhãn/icon, không chỉ đổi màu.
- Bề mặt phẳng; viền mực 2–3px; bóng cứng lệch ngắn 3–6px; góc vừa phải. Tránh gradient trang trí, glassmorphism, blur shadow, pill đồng loạt.
- Typography dễ đọc tiếng Việt; đề xuất Be Vietnam Pro nếu được chủ dự án duyệt và có nguồn tải phù hợp.
- Tái sử dụng token/component hiện hữu; không đổi toàn bộ giao diện nếu phạm vi chỉ là một màn.

## 2. Khung giao diện

- Header điều hướng đề, luyện tập, hồ sơ; admin/staff menu theo role.
- Nội dung có max-width nhất quán, nhịp khoảng cách 4/8/12/16/24/32px.
- Footer gọn, không lấn phòng thi.
- Responsive từ 320px, không tràn ngang trang; bảng/toolbar rộng cuộn hoặc xuống hàng trong container riêng.
- Có loading, empty, error, success; xác nhận hành động xóa/khóa/rời bài có dữ liệu chưa lưu.

## 3. Màn hình chính

### Catalog và chi tiết đề
- Thẻ đề thể hiện tên, free/VIP, metadata có thật và hành động phù hợp entitlement.
- Đề VIP bị khóa không tải nội dung câu hỏi; giá/điều kiện hiển thị sau khi chính sách được chốt.
- Draft chỉ xuất hiện ở khu quản trị.

### Auth và hồ sơ
- Form có label thường trực, validation theo trường và trạng thái đang gửi.
- Hồ sơ và đổi mật khẩu tách rõ; thông báo lỗi/thành công.

### Studio quản trị
- Soạn theo Test → Part → Context → Question; giữ autosave/recovery hiện có khi cải tiến.
- Hiển thị số câu global, số đầu context; cảnh báo thiếu media/nội dung bắt buộc trước publish.
- Cấu hình Part 1/2/3/4/7 phản ánh quy tắc trong `04_FLOW_LOGIC.md`.

### Phòng thi
- Ưu tiên nội dung, audio và chọn đáp án; timer, tiến độ, điều hướng/cờ không che câu hỏi.
- Full test 120 phút theo hành vi hiện tại; dialog nộp nêu câu bỏ trống.
- Part 1: ảnh, audio, bốn nút A/B/C/D.
- Part 2: audio, ba nút A/B/C; không lộ text câu hỏi/option.
- Part 3/4: media theo context, các câu con chung nhóm không lặp audio.
- Part 7: passage hiển thị một lần, ranh giới bài đọc đôi/ba và câu liên quan rõ ràng.

### Kết quả/review
- Tóm tắt điểm, số câu, thời lượng; Listening/Reading riêng cho full test.
- Điều hướng câu; phân biệt đáp án đã chọn/đáp án đúng/giải thích bằng nhãn, icon và màu.

### Admin user/payment
- Bảng tìm kiếm/phân trang; khóa/mở yêu cầu xác nhận.
- Giao dịch hiển thị mã, user, đề/gói, số tiền, trạng thái, thời gian khi API đã chốt; không giả định có hoàn tiền.
- Dashboard nêu metric, phạm vi ngày và thời điểm cập nhật: online (kèm định nghĩa TTL), số attempt bắt đầu/nộp mỗi ngày, không nhập nhằng với user active trong ngày.
- Bảng giao dịch có lọc theo trạng thái, ngày, người trả, loại sản phẩm; trạng thái pending/success/failed/cancelled/expired có nhãn text.
- Hộp xử lý hồ sơ giáo viên cho biết trạng thái phí riêng với trạng thái duyệt; admin duyệt/từ chối có xác nhận và lý do.

### Cổng giáo viên
- Trang lớp của tôi: tạo lớp, sửa tên/mô tả, quản lý mã mời và trạng thái.
- Trang thành viên: tab chờ duyệt/đã duyệt/bị chặn; xem roster, duyệt/từ chối, chặn/gỡ với xác nhận.
- Tài liệu lớp: danh sách file, tải lên, loại/kích thước, quyền xem và trạng thái tải.
- Studio đề lớp: phân biệt đề private với đề hệ thống; nhãn rõ nguồn và lớp sở hữu.
- Quản lý assignment: đề nguồn, hạn nộp và late policy, trạng thái, sửa/xóa/gia hạn.
- Báo cáo assignment: số học sinh, đã nộp/chưa nộp/trễ, điểm trung bình có mẫu số, bảng điểm sort cao-thấp/thấp-cao/tên A–Z/Z–A; chưa chấm phải hiển thị riêng.
- Feedback form: giáo viên chấm/nhận xét, học sinh nhận thông báo và link mở bài.

### Cổng học sinh/lớp học
- Danh sách lớp, trạng thái yêu cầu tham gia, tài liệu và bài tập chỉ của lớp đã duyệt.
- Assignment card hiển thị deadline theo giờ Việt Nam, thời gian còn lại/quá hạn, nguồn đề và trạng thái submission.
- Thông báo có trạng thái chưa đọc/đã đọc, thời gian và deep link; không biến notification thành quyền truy cập nếu membership đã bị thu hồi.
- Kết quả có CTA luyện câu sai; dictation có transcript reveal và so khớp từng từ.

### Học tập cá nhân nâng cao (đề xuất)
- Dashboard học viên có mục tiêu điểm/ngày thi, diagnostic gần nhất và gợi ý “buổi luyện tiếp theo”; cho phép bỏ qua/chỉnh mục tiêu.
- Biểu đồ thể hiện accuracy/thời gian theo Part và xu hướng, có khoảng thời gian/lượt attempt rõ; phân biệt điểm ước tính với điểm chính thức.
- Sổ câu sai có bộ lọc Part/loại câu/ngày, lý do sai nếu có, nút luyện ngay và trạng thái ôn kế tiếp.
- Resume card cho phiên đang làm: test, mode, thời điểm hết hạn, số câu đã trả lời; nút tiếp tục/hủy/submit có xác nhận.
- Player nghe khi luyện có tốc độ, tua lùi ngắn, transcript reveal và dictation; chế độ thi không cung cấp transcript/hint nếu đó là điều kiện mô phỏng.

### Quy trình chất lượng nội dung (đề xuất)
- Nút “Báo lỗi câu hỏi” ở review/luyện, modal chọn loại lỗi và nhập ghi chú ngắn.
- Admin content-issues queue có trạng thái, mức ưu tiên, dữ liệu câu/version và hành động ghi nhận kết quả xử lý.
- Nếu đề có revision mới, giao diện history cũ ghi nhận phiên bản đã làm; không âm thầm thay câu/đáp án trong review cũ.

## 4. Accessibility và tương tác

- Dùng được bằng bàn phím; `:focus-visible`, label, semantic HTML và ARIA khi cần.
- Hỗ trợ `prefers-reduced-motion`; vùng bấm phù hợp mobile.
- Dialog giới hạn chiều cao và cuộn riêng; media lỗi có fallback.
- Audio có điều khiển; không tự phát ngoài hành vi có chủ đích.
- Thông báo deadline không chỉ dựa vào màu/đếm ngược; luôn có ngày giờ tuyệt đối để tránh nhầm múi giờ.
- Trạng thái payment/teacher application, member và assignment có nhãn text/icon để không phải phân biệt bằng màu đơn thuần.
- Biểu đồ cần legend, nhãn trục, bảng thay thế hoặc mô tả dữ liệu; không chỉ dùng màu để so sánh kỹ năng.
- Session resume và đồng bộ phải cho biết đang lưu/đã lưu/lỗi đồng bộ; tránh hiển thị “đã lưu” nếu API chưa xác nhận.
- Notification preferences có control bật/tắt rõ và ghi nhận kênh chưa hỗ trợ là unavailable, không giả vờ đã bật.

## 5. Quy tắc bảo mật ở UI

- UI chỉ hỗ trợ điều hướng; backend quyết định role, ownership, entitlement, điểm và payment. Khi API từ chối, làm mới trạng thái phù hợp, không suy đoán thành công.
- Không render token/secret hoặc answer key trước submit. `currentUser` cache không được dùng để cấp quyền; không lưu access/refresh token trong `localStorage` theo mục tiêu bảo mật.
- Nội dung user-generated/feedback phải render theo cơ chế text an toàn; không dùng HTML thô từ API. Liên kết ngoài mở tab mới cần `rel="noopener noreferrer"`.
- Hiển thị lỗi auth/payment chung, không tiết lộ tài khoản tồn tại, chi tiết chữ ký/callback hoặc stack trace. Trạng thái giao dịch “đang xác minh” khác “thành công”; không cấp quyền dựa trên màn return.
- Form nêu loại/kích thước file được phép và lỗi validation, nhưng server mới quyết định. Không xem URL media riêng lâu hạn là cơ chế phân quyền.
- Nếu session hết hạn/refresh thất bại, giữ an toàn bản nháp theo policy, thông báo rõ và tránh submit ngầm lặp lại. Thay đổi auth cookie phải hỗ trợ CSRF đúng thiết kế.
- Không để lộ PII trong thông báo, danh sách lớp, analytics hoặc dashboard cho người không có quyền. Deep link phải kiểm tra membership/entitlement khi mở.
- Headers, CORS, cookie attributes và HTTPS là cấu hình server/deployment; tham chiếu `docs/06_SECURITY_SPEC.md`.

## 6. Nguồn tham khảo

Tài liệu tham khảo bên ngoài mô tả Neo-brutalism cho hệ thống thư viện. Ảnh kèm yêu cầu hiện tại là ảnh Explorer liệt kê file Markdown, không phải screenshot giao diện TOEIC; palette/shape ở đây là chuyển thể bằng văn bản để chủ dự án duyệt.

Các pattern tham khảo gồm diagnostic/gợi ý bài luyện, giải thích, câu sai ôn lại, nghe/transcript/dictation, lịch sử/tiến bộ, notification và analytics lớp. Đây là benchmark chứ chưa phải phạm vi đã duyệt; không sao chép nội dung có bản quyền. Nguồn: [ETS OLPC diagnostic và gợi ý cá nhân](https://www.etsglobal.org/mf/en/content/toeic-official-learning-and-preparation-course), [HOCTOEIC listening/dictation/transcript](https://hoctoeic.vn/huong-dan-su-dung), [ứng dụng TOEIC của ETS Global](https://www.etsglobal.org/fx/en/content/toeic-test-application), [Google Classroom analytics](https://support.google.com/edu/classroom/answer/17231999?hl=en-eu), [TOEIC Test spaced repetition](https://play.google.com/store/apps/details?hl=en_US&id=com.tvt.toeictest.newformat2019).

