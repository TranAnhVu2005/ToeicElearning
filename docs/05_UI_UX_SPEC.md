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

- **Gelasio** là font nội dung và display chính, dùng cho tiếng Việt, tiêu đề, điều hướng, nhãn và control. Fallback: Georgia, serif. Có thể dùng các mức weight 100–900 theo hierarchy; trình duyệt tổng hợp weight nếu font file không cung cấp biến thể tương ứng.
- **Ubuntu Mono** chỉ dùng cho code, UUID, mã giao dịch, timer và dữ liệu kỹ thuật cần căn đơn cách. Fallback: `ui-monospace`, monospace.
- Thang cỡ: `14 / 16 / 18 / 24 / 32 / 40 px`. Nội dung đọc/câu hỏi tối thiểu 16 px; metadata dense tối thiểu 14 px. Line-height nội dung tối thiểu 1.5.
- Dùng weight, kích thước và khoảng cách để tạo hierarchy; tránh ép chữ tiếng Việt vào font trang trí hoặc dùng ALL CAPS cho đoạn đọc.
- Số điểm/thời lượng dùng tabular figures; luôn gắn nhãn đơn vị/ngữ cảnh.

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
- Khối thống kê TOEIC trình bày như ticker chạy ngang trên ảnh sách `hero/background_sach.jpg` để hòa với tông ảnh hero; ảnh nền được làm trầm/desaturate, không thêm trang trí galaxy. Giữ chiều cao dạng dải thông tin gọn, số liệu phân cấp vừa phải và tương phản chữ AA. Có điều khiển tạm dừng/tiếp tục; ở mobile bố cục và tốc độ cần thích ứng, còn `prefers-reduced-motion` hiển thị số liệu tĩnh, không cắt nội dung. `galaxy.jpg` vẫn được giữ trong assets, không dùng làm ticker hiện tại.
- Các ảnh còn lại tiếp tục rải theo ngữ cảnh ở số liệu TOEIC, thẻ đề, Listening/Reading và phần tính năng. Không gom thành gallery riêng.
- Ảnh có ý nghĩa dùng alt/caption chính xác; ảnh trang trí dùng `alt=""`. Hero tải eager; ảnh dưới fold lazy-load.
- Khung ảnh có crop ổn định, divider mảnh và caption đọc được trên vùng chuyển sắc. Reveal/hover nhẹ, không làm nhảy layout.

## 5. Quy tắc theo nhóm route

- **Home/catalog/practice:** headline phân cấp rõ, CTA và lọc dễ tìm; danh sách đề/card lấy đúng dữ liệu và trạng thái quyền từ API; hình ảnh hỗ trợ nội dung.
- **Course detail/about/contact:** ưu tiên mục tiêu, thông tin đề, quyền truy cập, disclaimer và liên hệ hợp lệ; không thêm claims marketing thiếu căn cứ.
- **Login/register/profile/teacher/payment/notifications:** cùng typography/form system; thể hiện loading, validation, error, pending/success/failure và bước kế tiếp đúng với server.
- **Exam/dictation/results:** giữ nền phẳng, hạn chế ảnh trang trí/chuyển động, vùng câu hỏi dễ đọc và thao tác ổn định; media theo sát context. Answer key/transcript vẫn theo authorization hiện tại.
- **Classrooms/assignments:** hiển thị role, lớp đang chọn, membership, deadline và trạng thái nộp minh bạch; không đổi scope action hay policy.
- **Admin/studio:** ưu tiên hierarchy và dữ liệu dễ quét; bảng/form/editor/autosave/modal có đủ loading/error/empty/disabled và giữ nguyên quyền/nghiệp vụ.
- **Shell/system:** Navbar, Footer, Modal, Toast, Pagination, ProtectedRoute, Suspense, ErrorBoundary và 404 theo cùng token/hierarchy.

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
