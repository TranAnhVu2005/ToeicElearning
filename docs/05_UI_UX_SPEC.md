# 05. Đặc tả UI/UX — Editorial

> Editorial là hệ thiết kế bắt buộc cho toàn bộ TOEIC Learning: mọi route, layout, component dùng chung, trạng thái tải/lỗi/rỗng, màn hình học tập, lớp học và Admin. Đây là refactor visual; giữ nguyên nghiệp vụ, route, payload, API, quyền và kiến trúc React/Vite SPA.

## 1. Mục tiêu thị giác và nguyên tắc

Editorial tạo cảm giác như một ấn phẩm số hiện đại: typography giàu sắc thái, phân cấp nội dung rõ, khoảng trắng rộng, bề mặt trắng/xám sáng, divider mảnh và điểm nhấn xanh dương có tiết chế. Ảnh thật của dự án được phối hợp với các bề mặt này để giao diện bớt khô nhưng không làm giảm khả năng đọc.

1. Dùng nhất quán trên mọi route: công khai, auth, profile, phòng thi, review, dictation, lớp học, giáo viên, payment và toàn bộ Admin.
2. Ưu tiên nội dung và thứ tự đọc; tránh card lồng card, viền dày, hard shadow, gradient trang trí và màu bão hòa phủ diện rộng.
3. Dùng token ở mục 2 thay cho giá trị màu/khoảng cách rải rác. Trạng thái nghiệp vụ giữ màu ngữ nghĩa; màu sắc luôn đi cùng nhãn hoặc biểu tượng.
4. Giữ React/Vite, React Router, Tailwind, Axios, route, luồng quyền và convention component hiện tại. Class legacy chỉ là hook cấu trúc, không định nghĩa visual system.
5. Không chuyển nghiệp vụ hoặc nội dung tham khảo bên ngoài vào sản phẩm. Không dùng UI guard thay authorization backend.

## 2. Tokens

### 2.1 Palette

| Token | Hex | Sử dụng |
|---|---:|---|
| `editorial-primary` | `#111111` | Heading, nội dung chính, biểu tượng và thành phần chủ đạo |
| `editorial-secondary` | `#F1F1F1` | Nền phụ, vùng phân nhóm, hover nhẹ |
| `editorial-surface` | `#FFFFFF` | Trang, card, form, bảng và panel |
| `editorial-text` | `#111827` | Nội dung đọc |
| `editorial-accent` | `#1D4ED8` | CTA, link, tab đang chọn, focus và nhấn tương tác |
| `editorial-accent-soft` | `#EFF6FF` | Nền chọn/thông tin nhẹ |
| `editorial-muted` | `#5B6472` | Metadata và nội dung phụ |
| `editorial-line` | `#C9CDD3` | Divider và viền 1 px |
| `editorial-success` | `#16A34A` | Thành công |
| `editorial-warning` | `#D97706` | Cảnh báo |
| `editorial-danger` | `#DC2626` | Lỗi và hành động phá hủy |

Văn bản thường đạt tương phản tối thiểu 4.5:1; chữ lớn và thành phần điều khiển đạt 3:1 theo WCAG 2.2 AA. Primary button có thể dùng accent xanh theo mẫu tham khảo, chữ trắng và trạng thái hover/focus riêng.

### 2.2 Typography

- **Gelasio** là font nội dung và display chính, dùng cho tiếng Việt, tiêu đề, điều hướng, nhãn và control (`--editorial-font: 'EditorialNumerals', 'Gelasio', 'Times New Roman', Georgia, serif`). Để khắc phục việc phông fallback `Georgia` trên Windows hiển thị chữ số kiểu cũ (`oldstyle-nums` cao thấp không đều), hệ thống khai báo `@font-face` `'EditorialNumerals'` (`unicode-range: U+0030-0039`, lấy từ `Times New Roman` / `Cambria` / `Liberation Serif`) đứng đầu chuỗi `--editorial-font` kết hợp `font-variant-numeric: lining-nums tabular-nums` để mọi chữ số `0–9` luôn có chiều cao và độ rộng đều nhau trên cùng đường cơ sở.
- **Ubuntu Mono** chỉ dùng cho code, UUID, mã giao dịch và dữ liệu kỹ thuật cần căn đơn cách (`:where(code, kbd, .font-mono)`). Fallback: `ui-monospace`, monospace.
- Thang cỡ: `14 / 16 / 18 / 24 / 32 / 40 px`. Nội dung đọc/câu hỏi tối thiểu 16 px; metadata dense tối thiểu 14 px. Line-height nội dung tối thiểu 1.5.
- Dùng weight, kích thước và khoảng cách để tạo hierarchy; tránh ép chữ tiếng Việt vào font trang trí hoặc dùng ALL CAPS cho đoạn đọc.
- Số điểm/thời lượng dùng lining tabular figures (`lining-nums tabular-nums`); luôn gắn nhãn đơn vị/ngữ cảnh.

### 2.3 Spacing, shape và motion

- Theo baseline 8pt: `8 / 16 / 24 / 32 / 40 / 48 / 64 px`. Có thể dùng 4 px cho căn chỉnh vi mô, không tạo thang spacing riêng.
- Container nội dung tối đa khoảng 1200 px; đoạn văn dài tối đa khoảng 720 px. Dùng whitespace để chia nhóm trước khi thêm card.
- Viền mặc định 1 px xám; corner 0–4 px cho panel/card/control, pill chỉ dành cho badge hoặc avatar phù hợp. Không dùng hard shadow; overlay nổi dùng divider và shadow mờ nhẹ.
- Chuyển trạng thái 120–200 ms, ưu tiên color/opacity. Slideshow hero có thể crossfade chậm và zoom ảnh rất nhẹ; không dùng parallax hoặc chuyển động làm dịch bố cục. Cung cấp điều khiển dừng/chạy và chọn slide.
- Bắt buộc xử lý `prefers-reduced-motion`; tắt tự chuyển và hiệu ứng chuyển động, mọi nội dung chính vẫn hiển thị.

## 3. Component và trạng thái

- **Buttons/links/tabs:** primary accent xanh, secondary trắng/viền mảnh, link xanh; có hover, active, focus-visible, disabled và loading rõ. Touch target chính tối thiểu 44×44 px.
- **Forms:** label tường minh, nền trắng, viền 1 px; focus ring xanh đủ tương phản. Lỗi gần field, có liên kết accessible khi cần; checkbox/radio giữ semantics và trạng thái checked phân biệt được không chỉ bằng màu.
- **Cards/lists/panels:** hierarchy tiêu đề → mô tả → metadata → action; tránh lồng card. Empty/loading/error/success là trạng thái được thiết kế đầy đủ, có hành động tiếp theo/retry khi thích hợp.
- **Tables/data:** header phân biệt bằng nền xám rất nhạt và divider; monospace chỉ cho cột code/số liệu dense. Mobile cho cuộn ngang có chủ đích hoặc trình bày record theo nhóm, không cắt action.
- **Modal/drawer/toast:** heading và nút đóng có accessible name; keyboard focus, Escape và khôi phục focus; nội dung dài cuộn riêng; thông báo lỗi quan trọng không chỉ hiển thị dạng toast thoáng qua.
- **Navigation:** nền trắng, divider 1 px, active route dùng xanh/underline; menu có `aria-expanded`, keyboard operation và giữ đúng route theo role.
- **Feedback/status:** dùng nhãn và icon cùng màu trạng thái; không suy ra thành công từ response thiếu hoặc trạng thái URL.

## 4. Ảnh và trang chủ

- Không xóa, thay hoặc bỏ qua ảnh nội bộ đã đưa vào trang chủ. Giữ nguyên nguồn ảnh và các bản tối ưu trong `frontend/src/assets/img/`.
- Hero dùng slideshow nền bốn ảnh trong `frontend/src/assets/img/hero/`, theo thứ tự `background_sach.jpg`, `bangtrang.jpg`, `cacChuCai.jpg`, `toeic_980_co_ban_tay.jpg`. Giữ cố định câu “To have another language is to possess a second soul.” trên mọi slide. Không thay/xóa ảnh; giữ lớp paper/white gradient đủ tương phản và điều chỉnh focal point ở mobile.
- Slideshow crossfade mượt, tự chuyển khi tab đang hiển thị; có nút ảnh trước/sau, chấm chọn slide và tạm dừng/tiếp tục. Tôn trọng `prefers-reduced-motion` bằng cách giữ slide đầu và không tự chuyển/chạy hiệu ứng.
- Trang chủ hiện không chèn ticker thống kê giữa hero và nội dung; sau hero đi thẳng tới các khóa học nổi bật. Không thêm lại khối thống kê này nếu chưa có yêu cầu mới.
- Không dùng ảnh du lịch/đường phố như ảnh minh họa riêng cho đề thi, kỹ năng TOEIC hoặc tính năng học. Trang chủ dùng ảnh mùa thu `frontend/src/assets/img/homepage/muaThu.jpg` làm nền trang trí chung bên dưới nội dung, với lớp phủ sáng và bề mặt card bán trong. Khối giới thiệu dùng ảnh học tập `home-optimized/lambai.jpg`; ảnh phải liên quan trực tiếp đến nội dung.
- Bố cục trang chủ sau hero theo nhịp editorial: headline căn giữa; một khối ảnh–nội dung giới thiệu lộ trình luyện TOEIC; danh sách đề thật từ catalog; một bảng tổng quan gộp cấu trúc Listening/Reading và luồng ôn tập. Không thêm claim, số liệu thành tích hoặc tính năng chưa có.
- Catalog đề trên Home dùng masthead “NEWS” có điểm nhấn vàng/đen tiết chế và tối đa hai thẻ đề gọn theo mẫu course tile; tiêu đề/trạng thái/ngày/CTA lấy từ dữ liệu thật. Chỉ hiển thị cover khi API có ảnh thật; nếu thiếu, hiện trạng thái “Chưa có ảnh”, không dựng bìa thay thế.
- Chuyển tiếp từ hero sang nền mùa thu bằng lớp phủ sáng chuyển dần và overlap nhẹ của khối đầu; không để ranh ngang sắc giữa hai ảnh. Giữ nội dung section trong flow và ưu tiên đọc rõ trên mobile.
- Bảng 7 Parts trên Home được chia thành Listening và Reading; mỗi hàng chỉ giữ mã Part, dạng bài, số câu và action luyện tập. Trên viewport hẹp cho phép cuộn ngang có chủ đích, không kéo dài bằng mô tả lặp lại.
- Ảnh có ý nghĩa dùng alt/caption chính xác; ảnh trang trí dùng `alt=""`. Hero tải eager; ảnh dưới fold lazy-load.
- Khung ảnh có crop ổn định, divider mảnh và caption đọc được trên vùng chuyển sắc. Reveal/hover nhẹ, không làm nhảy layout.

## 5. Quy tắc theo nhóm route

- **Home/catalog/practice:** headline phân cấp rõ, CTA và lọc dễ tìm; route `/practice` tự động chuyển hướng về `/courses` (`CoursesPage.jsx`, phân trang 10 đề/trang, thẻ đề ngang nhỏ gọn đồng bộ mục NEWS trang chủ). Danh sách đề/card lấy đúng dữ liệu và trạng thái quyền từ API; hình ảnh hỗ trợ nội dung.
- **Course detail/about/contact:** trang Chi tiết đề thi (`/courses/:testId`, `CourseDetailPage.jsx`) tập trung toàn bộ tùy chọn làm bài trên 4 tab (`Luyện tập từng phần`, `Làm full test`, `Chép chính tả`, `Thảo luận`), bảng lịch sử làm bài hiển thị đồng nhất cỡ chữ số (`15px` cho số chính, `13px` cho dòng phụ kèm điểm `Nghe`/`Đọc`) và khu vực bình luận đề thi (`TestComment`) hỗ trợ thêm/sửa inline/xóa qua modal xác nhận. Ưu tiên mục tiêu, thông tin đề, quyền truy cập, disclaimer và liên hệ hợp lệ; không thêm claims marketing thiếu căn cứ.
- **Login/register/profile/teacher/payment/notifications:** cùng typography/form system; thể hiện loading, validation, error, pending/success/failure và bước kế tiếp đúng với server. Trang Hồ sơ (`/profile?tab=history`) tích hợp tab Lịch sử làm bài có bộ lọc và liên kết xem lại chi tiết. Trang Thông báo (`/notifications`, `NotificationsPage.jsx`) dùng bố cục Editorial 2 cột (`lg:grid-cols-[270px_minmax(0,1fr)]`) với phần đầu thống kê nhanh (`Tổng cộng`, `Chưa đọc`, `Đã đọc`), thanh bên trái (`sticky`) chứa bộ lọc 6 nhóm chức năng (`Tất cả`, `Kết quả thi`, `Bài tập lớp`, `Lớp học & Tài liệu`, `Thanh toán & VIP`, `Hồ sơ & Hệ thống`) cùng các nút lọc chưa đọc, đánh dấu đã đọc, xóa thông báo đã đọc, và cột phải hiển thị danh sách thông báo đồng bộ tức thời số lượng chưa đọc với `Navbar`.
- **Exam/dictation/results:** giữ nền phẳng tại vùng đọc/làm bài, hạn chế ảnh trang trí/chuyển động dưới câu hỏi, vùng câu hỏi dễ đọc và thao tác ổn định; media theo sát context và hỗ trợ popover cài đặt tốc độ phát (`0.5×`–`2×` & `Reload File`). Trang Xem lại bài thi (`/results/:resultId`, `TestResultPage.jsx`) dùng bố cục 2 cột (`grid-cols-[1fr_320px]`) với bảng điều hướng câu hỏi cố định bên phải (`sticky`), hỗ trợ hover viền xanh `#1D4ED8` trên các ô số câu (`1..200`) và khi bấm vào số câu sẽ cuộn mượt kèm hiệu ứng highlight khung câu hỏi trong 1.8 giây giống phòng thi. Answer key/transcript vẫn theo authorization hiện tại.
- **Classrooms/assignments:** hiển thị role, lớp đang chọn, membership, deadline và trạng thái nộp minh bạch; không đổi scope action hay policy.
- **Admin/studio (`/admin/tests`, `TestManagementPage.jsx`):** ưu tiên hierarchy và dữ liệu dễ quét; toàn bộ Modal Thêm/Sửa đề thi dùng bề mặt phẳng sạch `#FFFFFF` / `#F8FAFC` (không đặt ảnh nền trang trí dưới vùng form soạn thảo), viền mảnh `1px solid #D1D5DB`, góc `2px`, phông chữ `--editorial-font` (`EditorialNumerals` + `Gelasio`) và bảng màu đơn sắc `#111111`/`#4B5563` kết hợp điểm nhấn xanh dương `#1D4ED8`/`#EFF6FF` (không dùng các dải màu cầu vồng xanh lá/vàng/tím/hồng nặng tính AI). Thanh điều hướng Part được gộp gọn thành một hàng tab duy nhất (`Part 1 · 6/6 câu` ... `Part 7 · 54/54 câu`, nhãn số câu `white-space: nowrap` không bị rớt dòng).
- **Admin suite (`/admin/dashboard`, `/admin/users`, `/admin/payments`, `/admin/teacher-applications`, `/admin/tests`):** dùng chung `AdminPageHeader` với ảnh nền thư viện (`thuvien.jpg`) phủ gradient sáng chuyển mượt xuống nền trang `#F8FAFC`, điều hướng qua `AdminNavTabs`, toàn bộ số liệu KPI/ngày giờ/số tiền/email hiển thị bằng `--editorial-font` (`lining-nums tabular-nums`) định dạng `vi-VN` (`Asia/Ho_Chi_Minh`), và chỉ dùng monospace (`admin-tech-code`) cho mã tham chiếu/ID kỹ thuật (`vnpTxnRef`, `targetId`, `actorUserId`).
- **Shell/system:** Navbar, Footer, Modal, Toast (4 trạng thái `success`, `error`, `warning`, `info`, neo tại `top: 88px; right: 24px` dưới Navbar), Pagination, ProtectedRoute, Suspense, ErrorBoundary và 404 theo cùng token/hierarchy.

## 6. Accessibility và responsive

- Semantic HTML trước ARIA; heading order, accessible names, labels, keyboard-only và focus-visible rõ.
- Hỗ trợ zoom 200%, text wrapping, forced/high contrast, reduced motion và touch target 44 px.
- Rà viewport 360, 768, 1280 px và wide desktop khi layout cần. Không có horizontal overflow ngoài bảng/vùng có chủ đích.
- Ảnh nội dung có alt; ảnh trang trí alt rỗng. Player/media control có tên truy cập.
- Trạng thái deadline/payment/assignment không dựa riêng màu. Error có thông báo và retry/action phù hợp.

## 7. Quy trình và nghiệm thu

1. Trước khi sửa, đọc docs05 và phần nghiệp vụ liên quan; kiểm tra component/API/state đang có.
2. Đối chiếu route inventory với `frontend/src/App.jsx`; không bỏ trang, role, modal hoặc trạng thái hiện hữu.
3. Refactor từ token và shared component tới từng nhóm route; CSS legacy không được âm thầm tái áp font, màu, viền dày hoặc shadow cũ.
4. Chạy `npm run build`. Kiểm tra riêng desktop/mobile, loading/empty/error/success/disabled, keyboard focus, contrast, reduced motion và responsive; chỉ báo visual QA nếu thật sự quan sát browser/screenshot.
5. Giữ ảnh và mọi nghiệp vụ/API/auth/payment/data access nguyên trạng trong tác vụ restyle.

## 8. Tham chiếu

Nguồn chuẩn là mô tả Editorial và ảnh tham khảo do chủ dự án cung cấp ngày 2026-11-10. Văn bản cung cấp tokens/typography/accessibility; ảnh gợi ý bố cục biên tập có khoảng trắng, ảnh lớn, divider mảnh và CTA xanh. Chuyển thể cho TOEIC Learning, không sao chép thương hiệu, route hoặc nội dung từ ảnh.
