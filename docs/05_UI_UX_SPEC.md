# 05. Đặc tả UI/UX TOEIC Learning

> Đặc tả giao diện hiện hành: áp dụng Neo-brutalism khi thiết kế màn mới hoặc restyle theo yêu cầu. Tham khảo ngôn ngữ thị giác từ dự án ngoài; chỉ lấy phong cách, không lấy nghiệp vụ/route/framework.

> Giữ React/Vite SPA, React Router, Tailwind, Axios và cách chia page/component/context/service hiện có. Đây là đặc tả UI, không phải đề nghị đổi framework hoặc dựng frontend thứ hai.

## 1. Ngôn ngữ thị giác — Neo-brutalism (hướng bắt buộc khi thiết kế UI)

Ảnh tham khảo thể hiện một trang marketing Neo-brutalist: thanh điều hướng đen, nền giấy ngà, chữ đậm, các khối vàng nổi bằng viền đen và bóng lệch cứng. Hãy chuyển thể ngôn ngữ thị giác đó sang sản phẩm học TOEIC; không sao chép nội dung, cấu trúc nghiệp vụ hay asset của website tham khảo.

### Quy trình agent bắt buộc khi làm giao diện

1. Đọc mục này, design tokens, pattern màn hình liên quan và quy trình trong `AGENTS.md`; xem page/component/style hiện có trước khi chọn phạm vi sửa.
2. Xác định màn nào được yêu cầu thay đổi. Đồng bộ hierarchy và các vùng chính trong cùng hệ Neo-brutalist; không dừng ở thay màu, thêm icon hoặc đổi vài nút.
3. Dùng đúng cấu trúc/API sản phẩm. Ảnh TypeUI/Brutal Pages chỉ tham chiếu hình thức: không sao chép logo, nội dung, route hay flow của website mẫu.
4. Chọn mật độ theo nhiệm vụ: landing page có khoảng thở và hero mạnh; exam room ưu tiên câu hỏi/timer/điều hướng; admin/classroom ưu tiên bảng, lọc và hành động rõ. Đồng nhất palette, viền, typography, button/card/form và trạng thái tương tác.
5. Trước khi báo hoàn tất, rà responsive, keyboard focus, contrast, loading/empty/error/disabled states và anti-pattern ở mục 1.1–1.5. Báo viewport/trạng thái chưa quan sát; không tuyên bố visual QA nếu chưa thực hiện.

**Tiêu chí nhận diện:** màn hình cần thể hiện nền giấy sáng, khung/header tương phản đen, tiêu đề display đậm, vàng chanh làm điểm nhấn chính, hồng làm màu nhấn phụ và các khối viền đen với bóng cứng. Dùng nhất quán nhưng phục vụ nghiệp vụ TOEIC Learning, không bắt chước bố cục marketing của ảnh.

### 1.1 Nguyên tắc tạo hình

- Thiết kế phải có tương phản cao, mảng màu phẳng, đường viền rõ và phân cấp bằng kích thước/trọng lượng chữ. Neo-brutalism là mặc định cho mọi màn hình được thiết kế mới hoặc được người dùng yêu cầu restyle.
- Dùng nền giấy ngà `#FFFDF2`, mực đen `#111111`, vàng chanh chủ đạo `#FFE600` và hồng neo-brutalist phụ `#FF5B93`, bám bảng màu nhìn thấy trong ảnh tham khảo. Hồng là điểm nhấn đồ họa/nhãn, không thay màu trạng thái success/error/warning. Màu chữ trên nền vàng, hồng và trắng mặc định là đen; chỉ dùng chữ trắng trên nền đen nếu đạt tương phản.
- Viền cấu trúc thường `2px solid #111111`; viền `3px` dành cho khối nhấn, modal hoặc vùng trọng tâm. Không dùng viền mảnh xám làm mặc định.
- Bóng là bóng cứng, không blur: `4px 4px 0 #111111` hoặc `6px 6px 0 #111111`. Có thể bỏ bóng ở vùng nội dung dài/thi cử nếu bóng gây nhiễu; không thay bằng bóng mờ.
- Bề mặt phẳng, góc vuông hoặc bo nhẹ có kiểm soát (thường 0–12px). Không biến mọi thành phần thành pill; pill chỉ dành cho badge ngắn khi có lý do.
- Không dùng gradient trang trí, glassmorphism, nền trong suốt kiểu kính, blur, neumorphism hay bóng mềm. Ảnh/illustration được dùng như nội dung riêng, không làm nền để che khuất bố cục.
- Tạo điểm nhấn bằng khối vàng/hồng, nhãn chữ in hoa ngắn, sticker/shape đơn giản và bố cục lệch có kiểm soát. Vàng là màu CTA/khối nổi bật; hồng dùng tiết chế cho chi tiết phụ. Không rải màu và bóng lên mọi vùng khiến trang thành nhiễu.

### 1.2 Design tokens

| Token | Giá trị gợi ý | Công dụng |
|---|---|---|
| `color-paper` | `#FFFDF2` | Nền trang và bề mặt sáng |
| `color-ink` | `#111111` | Chữ chính, viền, shadow |
| `color-primary` | `#FFE600` | CTA chính, highlight, khối thống kê |
| `color-secondary` | `#FF5B93` | Nhãn/chi tiết đồ họa phụ, khối nhấn |
| `color-surface` | `#FFFFFF` | Thẻ hoặc form cần tách khỏi nền |
| `color-muted` | `#F1EEDF` | Bề mặt phụ; chữ vẫn phải đủ tương phản |
| `color-success` | `#167344` | Thành công, luôn kèm nhãn/icon |
| `color-danger` | `#B42318` | Lỗi/nguy hiểm, luôn kèm nhãn/icon |
| `border-width` | `2px`; nhấn `3px` | Viền mực |
| `shadow-hard` | `4px 4px 0 #111111` | Bóng mặc định |
| `shadow-hard-lg` | `6px 6px 0 #111111` | Khối hero/modal cần nhấn |
| `radius` | `0–12px` | Góc khối; chỉ dùng lớn hơn khi có lý do |
| `space` | `4, 8, 12, 16, 24, 32, 48, 64px` | Khoảng cách theo bội số 4 |

Token có thể ánh xạ vào CSS variables/Tailwind hiện có. Không tạo hệ thống styling/framework mới hoặc đổi kiến trúc frontend chỉ để áp dụng phong cách.

### 1.3 Typography

- Ưu tiên font sans-serif hình học, rõ tiếng Việt; Inter là lựa chọn theo tham khảo, Be Vietnam Pro là lựa chọn phù hợp tiếng Việt. Chỉ tải font từ nguồn đáng tin cậy, có fallback hệ thống và không phụ thuộc mạng để nội dung vẫn đọc được.
- Tiêu đề lớn dùng weight 700–900, line-height chặt nhưng không cắt dấu tiếng Việt. Nội dung dài dùng cỡ dễ đọc và line-height thoáng.
- Thang cỡ tham khảo: `13 / 15 / 17 / 21 / 27 / 35 / 48 / 64px`; được điều chỉnh theo responsive và ngữ cảnh thi.
- JetBrains Mono chỉ dùng cho mã, timer hoặc số liệu dạng kỹ thuật khi tăng khả năng quét; không dùng cho đoạn văn thông thường.
- Tránh viết hoa toàn bộ nội dung dài. Uppercase chỉ dành cho nhãn ngắn.

### 1.4 Quy tắc theo phạm vi

- Khi người dùng yêu cầu thiết kế/restyle một màn, áp dụng đầy đủ ngôn ngữ Neo-brutalist cho màn đó và các component liên quan, đồng bộ với phần còn lại ở mức cần thiết.
- Khi xây màn mới, dùng tokens và component patterns tại mục này từ đầu; không mặc định copy style cũ nếu nó trái với đặc tả.
- Không tự ý redesign ngoài phạm vi tác vụ. Nếu chỉ sửa lỗi chức năng, giữ layout hiện có trừ khi người dùng yêu cầu thay đổi trực quan.
- Không thay React/Vite SPA, React Router, Tailwind, Axios, cấu trúc page/component/context/service hiện có. Kiểm tra code thực trước khi chọn nơi đặt style và tái sử dụng convention gần nhất.

### 1.5 Công thức chuyển thể từ ảnh tham khảo

Ảnh TypeUI/Brutal Pages là chuẩn tham chiếu thị giác của dự án. Giữ các dấu hiệu nhận diện sau khi thiết kế màn mới hoặc restyle; palette vàng/hồng/đen/ngà trong ảnh được ưu tiên hơn màu tím từng dùng trong bản nháp đặc tả:

- **Khung trang:** thanh điều hướng đen hoặc một dải header có tương phản mạnh; vùng nội dung nền ngà; đường phân cách đen đủ dày để tách các dải chức năng. Có thể dùng thêm thanh điều hướng phụ sáng màu với icon/nhãn ngắn.
- **Phân cấp:** tiêu đề display lớn, đậm, ít dòng; một từ/cụm từ có thể được nhấn bằng màu vàng/hồng, gạch chân hoặc nhãn ngắn. Nội dung giải thích bên dưới dùng cỡ chữ dễ đọc, không ép thành uppercase.
- **Khối điểm nhấn:** dùng card/thumbnail/metric nền vàng hoặc màu phẳng, viền đen và bóng cứng lệch để tạo cảm giác vật thể nổi trên giấy. Cho phép bố cục lệch hoặc chồng lớp nhẹ ở hero/marketing; không dùng chồng lớp làm khó thao tác trong dashboard, phòng thi hay bảng dữ liệu.
- **Icon và nhãn:** icon đơn giản, nét rõ, nằm trong ô vuông màu có viền; nhãn ngắn đặt cạnh/dưới icon khi cần. Mỗi vùng màu phải có mục đích phân cấp hoặc trạng thái, không dùng như trang trí ngẫu nhiên.
- **Mật độ:** marketing có khoảng thở lớn và một điểm nhấn chính; ứng dụng học tập/quản trị ưu tiên mật độ thông tin vừa phải, căn lề nhất quán, nhóm thao tác rõ. Cùng một palette và ngôn ngữ hình khối, nhưng không ép mọi màn thành landing page.
- **Chuyển động:** tương tác có phản hồi ngắn, trực tiếp (dịch 1–2px hoặc thay đổi bóng cứng); không dùng hiệu ứng nổi liên tục, parallax hoặc chuyển động gây phân tâm khi thi.

Trước khi coi một màn hình là hoàn tất, đối chiếu: (1) nền giấy/mực/vàng và màu phụ đúng vai trò; (2) typography có phân cấp rõ; (3) card/điều khiển có viền và bóng cứng nhất quán; (4) không xuất hiện gradient, blur, glass hoặc shadow mềm ngoài asset nội dung; (5) trạng thái focus, lỗi, disabled, loading và responsive vẫn rõ. Đây là checklist thị giác, không thay thế kiểm tra chức năng hay accessibility.

## 2. Khung giao diện

- Header điều hướng đề, luyện tập, hồ sơ; admin/staff menu theo role.
- Nội dung có max-width nhất quán, nhịp khoảng cách 4/8/12/16/24/32px.
- Footer gọn, không lấn phòng thi.
- Responsive từ 320px, không tràn ngang trang; bảng/toolbar rộng cuộn hoặc xuống hàng trong container riêng.
- Có loading, empty, error, success; xác nhận hành động xóa/khóa/rời bài có dữ liệu chưa lưu.

### 2.1 Component patterns Neo-brutalist

- **Header/navigation:** có thể dùng thanh đen hoặc nền giấy ngà, chữ tương phản, đường phân cách đen rõ. Logo và menu giữ gọn; trạng thái active dùng underline/khối màu/viền thay vì blur hoặc pill xanh mờ. Trên mobile chuyển thành menu dễ thao tác, không ép menu tràn ngang.
- **Button:** viền đen 2px, nền phẳng. CTA chính nền vàng chữ đen; CTA phụ nền hồng chữ đen hoặc nền giấy ngà chữ đen. Nút phải có default/hover/active/focus-visible/disabled/loading rõ ràng. Hover có thể dịch nhẹ hoặc tăng/giảm bóng; active nén về vị trí nền; không dùng animation dài.
- **Card/panel:** nền giấy/trắng/vàng/hồng có chủ ý, viền đen 2px và bóng cứng khi cần phân lớp. Dùng shadow nhất quán, không lồng nhiều card-shadow. Thông tin chính đứng trước decoration.
- **Input/select/textarea:** label thường trực, nền sáng, viền đen tối thiểu 2px, vùng nhập đủ cao; focus-visible có outline rõ và không chỉ đổi màu. Lỗi có biểu tượng/nhãn và mô tả gắn với trường.
- **Badge/status:** nhãn ngắn, có text hoặc icon và màu phẳng; trạng thái success/warning/error/pending không chỉ phân biệt bằng màu. Không dùng badge để thay mô tả cần thiết.
- **Table/list:** đường phân cách rõ, header dễ nhận biết, hàng hover/focus có phản hồi nhẹ. Bảng rộng cuộn trong container riêng trên mobile; không làm toàn trang tràn ngang.
- **Tabs/segmented control:** chọn hiện tại bằng nền tương phản, viền/underline rõ và trạng thái ngữ nghĩa; tránh nhóm pill mờ đồng loạt.
- **Modal/drawer:** nền đặc, viền đen 2–3px, bóng cứng; giới hạn chiều cao và cuộn nội dung riêng. Có tiêu đề, nút đóng có accessible name, focus được quản lý đúng.
- **Toast/alert:** bề mặt phẳng, viền rõ, icon và thông điệp cụ thể; không chỉ dựa vào màu hoặc tự biến mất quá nhanh với lỗi quan trọng.
- **Loading/empty/error:** skeleton có tương phản vừa phải và không nhấp nháy; empty state hướng dẫn hành động tiếp theo; lỗi chỉ rõ cách thử lại nếu phù hợp.
- **Chart/progress:** khung viền mực, màu vàng/hồng có legend/nhãn; có bảng hoặc mô tả thay thế. Trong phòng thi, progress/timer phải hữu ích nhưng không gây áp lực thị giác quá mức.

### 2.2 Trạng thái tương tác

- **Default:** viền, nền và phân cấp chữ nhất quán với tokens.
- **Hover:** chỉ dành cho thiết bị hỗ trợ hover; thay đổi rõ nhưng ngắn (màu phẳng, vị trí 1–2px hoặc shadow). Không để thông tin quan trọng chỉ xuất hiện khi hover.
- **Active/pressed:** tạo cảm giác khối được nhấn (giảm offset shadow hoặc dịch phần tử về phía shadow); tránh làm layout nhảy.
- **Focus-visible:** outline mực tương phản, dày ít nhất 3px hoặc tương đương; không xóa outline mặc định nếu không thay thế bằng chỉ báo rõ hơn.
- **Disabled:** giảm độ nổi một cách dễ hiểu nhưng vẫn đọc được; dùng thuộc tính disabled/aria-disabled đúng và không giả dạng nút khả dụng.
- **Loading:** khóa hành động gửi lặp khi cần, giữ ngữ cảnh nút và cho biết đang xử lý; không giả báo thành công.
- **Error/success:** kết hợp nhãn, icon, nội dung và màu; thông báo gắn với đúng hành động/trường.
- **Reduced motion:** tắt/giảm dịch chuyển và transition khi `prefers-reduced-motion: reduce`.

## 3. Màn hình chính

### Catalog và chi tiết đề
- Thẻ đề thể hiện tên, free/VIP, metadata có thật và hành động phù hợp entitlement.
- Trang chi tiết lấy số câu, Part có sẵn và thời lượng từ nội dung đề; không hiển thị mặc định 200 câu/7 Part cho đề chưa hoàn chỉnh. Chỉ bật full test khi đủ 200 câu liên tục thuộc đủ 7 Part; chọn luyện Part chỉ liệt kê Part có câu hỏi.
- Lịch sử chỉ hiện lượt làm thuộc tài khoản hiện tại; khi API lỗi phải có trạng thái lỗi và nút thử lại, không trình bày lỗi như lịch sử trống. Khi đổi đề, không hiển thị tạm lịch sử của đề vừa xem.
- Trang `/practice` tải danh sách đề đã xuất bản từ API, cho tìm và chọn đề trước khi luyện. CTA của từng Part đưa người học đến trang chi tiết đề với Part tương ứng được chọn sẵn; tại đó người học xác nhận bắt đầu và backend vẫn kiểm tra quyền truy cập đề VIP. Màn này cần có loading, lỗi có thể thử lại, danh sách rỗng và bộ lọc tìm kiếm không có kết quả.
- Đề VIP hiển thị giá riêng VND; quyền mua một lần dùng vĩnh viễn. Đề chưa mua chỉ hiển thị metadata/CTA mua, không tải nội dung câu hỏi/media; trạng thái mở khóa chỉ lấy từ API server.
- Khi admin gỡ đề, xác nhận phải nói rõ đề có kết quả/giao dịch/bài tập tham chiếu sẽ chuyển về bản nháp để giữ lịch sử; chỉ đề chưa được sử dụng mới xóa cứng.
- Draft chỉ xuất hiện ở khu quản trị.

### Auth và hồ sơ
- Form có label thường trực, validation theo trường và trạng thái đang gửi.
- Hồ sơ và đổi mật khẩu tách rõ; thông báo lỗi/thành công. Tài khoản Google chưa có mật khẩu hiển thị form đặt mật khẩu và nút xác minh lại Google; tài khoản đã có mật khẩu yêu cầu mật khẩu hiện tại. Không lưu credential Google hoặc mật khẩu ở browser storage.

### Studio quản trị
- Soạn theo Test → Part → Context → Question; giữ autosave/recovery hiện có khi cải tiến.
- Hiển thị số câu global, số đầu context; cảnh báo thiếu media/nội dung bắt buộc trước publish.
- Mỗi đề có lựa chọn Miễn phí/VIP; khi chọn VIP, bắt buộc nhập giá nguyên VND riêng cho đề. Cho xem rõ trạng thái và giá ở bước xác nhận lưu/xuất bản.
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
- Review Part 1 vẫn hiển thị nhãn A/B/C/D; Part 2 hiển thị A/B/C dù các lựa chọn không có nội dung văn bản.
- Khi kết quả/media lỗi tải hoặc URL ký hết hạn, có thao tác thử lại; tải lại review để backend cấp URL media mới sau khi kiểm tra quyền.

### Admin user/payment
- Dashboard `/admin/dashboard` có thẻ user hiện diện gần đây, lượt session bắt đầu và lượt submit hôm nay; biểu đồ so sánh bắt đầu/nộp theo ngày và cho phép lọc khoảng thời gian. Ngày mặc định, giới hạn chọn ngày và nhãn ngày phải cùng dùng timezone báo cáo (mặc định `Asia/Ho_Chi_Minh`), độc lập timezone thiết bị. Khi API lỗi, hiển thị lỗi riêng thay vì thông báo không có dữ liệu; phân biệt loading/error/empty. Ghi rõ cửa sổ active 5 phút, session resume không tính là lần bắt đầu mới, và lượt submit gồm full/part/lớp/review lại.
- Bảng tìm kiếm/phân trang; khóa/mở yêu cầu xác nhận.
- Giao dịch hiển thị mã, user, loại sản phẩm, số tiền, trạng thái, thời điểm tạo và thanh toán; loại sản phẩm thiếu ở dữ liệu cũ phải ghi “chưa xác định”. Không giả định có hoàn tiền.
- Mỗi dòng giao dịch có disclosure “Chi tiết” tải dữ liệu ADMIN-scoped theo ID; hiển thị ID nội bộ, provider transaction number, response code và transaction status nếu có. Disclosure bàn phím truy cập được, báo loading/error, không hiển thị signature/payload callback.
- Dashboard nêu metric, phạm vi ngày và thời điểm cập nhật: online (kèm định nghĩa TTL), số attempt bắt đầu/nộp mỗi ngày, không nhập nhằng với user active trong ngày.
- Bảng giao dịch có lọc theo trạng thái, ngày, người trả, loại sản phẩm; trạng thái pending/success/failed/cancelled/expired có nhãn text.
- Hộp xử lý hồ sơ giáo viên cho biết trạng thái phí riêng với trạng thái duyệt; admin duyệt/từ chối có xác nhận và lý do.
- Dashboard admin có bảng nhật ký thao tác nhạy cảm, phân trang, hiển thị thời điểm, action, loại/ID đối tượng, actor và thay đổi trạng thái; có loading/empty/error và ghi rõ coverage hiện tại còn một phần.

**Màn hiện có:** `/teacher/application` cho USER gửi statement và bắt đầu checkout; `/payment/result` poll trạng thái server-side và trình bày trạng thái chờ/xác nhận/thất bại; `/admin/teacher-applications` cho ADMIN lọc, duyệt hoặc từ chối hồ sơ đã thanh toán. Return query không được dùng để tô trạng thái thành công.

### Cổng giáo viên
- Trang lớp của tôi: tạo lớp, sửa tên/mô tả, sao chép và xoay mã mời; xác nhận rằng mã cũ sẽ mất hiệu lực, nhưng thành viên/yêu cầu hiện tại vẫn được giữ.
- Trang thành viên: tab chờ duyệt/đã duyệt/bị chặn; xem roster, duyệt/từ chối, chặn/gỡ với xác nhận. Roster phải gắn với lớp và trạng thái lọc đang chọn; khi tải phải ẩn danh sách cũ, phân biệt loading/error/empty và cho thử lại nếu API lỗi.
- Tài liệu lớp: danh sách metadata file, trạng thái tải và quyền xem; mốc hiện tại hỗ trợ PDF tối đa 10 MiB. Danh sách phải scope theo lớp hiện tại, ẩn metadata lớp trước khi request mới hoàn tất và phân biệt loading/error/empty, có retry. Giáo viên owner tải lên/ẩn tài liệu; thành viên APPROVED tải qua link private có thời hạn. UI không lưu hoặc hiển thị URL lưu trữ lâu hạn.
- Studio đề lớp: tái sử dụng `TestManagementPage` trong scope lớp được chọn; tạo/sửa/publish/xóa đề riêng và nhãn rõ lớp sở hữu. Bộ chọn bài tập nhóm đề hệ thống và đề riêng lớp; không hiện chức năng định giá VIP cho đề lớp.
- Quản lý assignment: đề nguồn, hạn nộp và late policy, trạng thái, sửa/xóa/gia hạn. Trường datetime phải ghi rõ dùng giờ `Asia/Ho_Chi_Minh`, chuyển đổi giữa timezone thiết bị và múi giờ nghiệp vụ khi nạp/lưu. Assignment list phải scope theo lớp hiện tại và phân biệt loading/error/empty; khi đổi lớp, xác nhận trước khi bỏ form sửa/giao chưa lưu và xóa selection/form thuộc lớp trước.
- Báo cáo assignment: số học sinh, đã nộp/chưa nộp/trễ, điểm trung bình có mẫu số, bảng điểm sort cao-thấp/thấp-cao/tên A–Z/Z–A; chưa chấm phải hiển thị riêng. Khi đổi assignment hoặc sort, ẩn submissions/summary cũ trong lúc tải; có empty/error/retry riêng để không hiểu lỗi tải là lớp chưa có bài nộp.
- Feedback form: giáo viên chấm/nhận xét, học sinh nhận thông báo và link mở bài.

### Cổng học sinh/lớp học
- Danh sách lớp, trạng thái yêu cầu tham gia, tài liệu và bài tập chỉ của lớp đã duyệt.
- Assignment card hiển thị deadline theo giờ Việt Nam, thời gian còn lại/quá hạn, nguồn đề và trạng thái submission.
- Thông báo có trạng thái chưa đọc/đã đọc, thời gian và deep link; không biến notification thành quyền truy cập nếu membership đã bị thu hồi.
- Kết quả có CTA luyện câu sai; dictation có transcript reveal và so khớp từng từ.
- Dictation đồng bộ bộ lọc Part từ query URL để thao tác Back/Forward giữ đúng trạng thái. Tiến độ lưu cục bộ là tùy chọn: nếu browser chặn storage, vẫn cho luyện trong phiên hiện tại; lỗi tải nội dung có nút thử lại.

### Học tập cá nhân nâng cao (đề xuất)
- Dashboard học viên có mục tiêu điểm/ngày thi, diagnostic gần nhất và gợi ý “buổi luyện tiếp theo”; cho phép bỏ qua/chỉnh mục tiêu.
- Biểu đồ thể hiện accuracy/thời gian theo Part và xu hướng, có khoảng thời gian/lượt attempt rõ; phân biệt điểm ước tính với điểm chính thức.
- Sổ câu sai có bộ lọc Part/loại câu/ngày, lý do sai nếu có, nút luyện ngay và trạng thái ôn kế tiếp.
- Resume card cho phiên đang làm: test, mode, thời điểm hết hạn, số câu đã trả lời; nút tiếp tục/hủy/submit có xác nhận.
- Player nghe khi luyện có tốc độ, tua lùi ngắn, âm lượng/tắt tiếng, transcript reveal và dictation; chế độ thi không cung cấp transcript/hint nếu đó là điều kiện mô phỏng.

### Quy trình chất lượng nội dung (đề xuất)
- Nút “Báo lỗi câu hỏi” ở review/luyện, modal chọn loại lỗi và nhập ghi chú ngắn.
- Admin content-issues queue có trạng thái, mức ưu tiên, dữ liệu câu/version và hành động ghi nhận kết quả xử lý.
- Nếu đề có revision mới, giao diện history cũ ghi nhận phiên bản đã làm; không âm thầm thay câu/đáp án trong review cũ.

## 4. Accessibility và tương tác

- Dùng được bằng bàn phím; `:focus-visible`, label, semantic HTML và ARIA khi cần. Neo-brutalist styling không được làm mất outline hoặc che trạng thái focus.
- Hỗ trợ `prefers-reduced-motion`; vùng bấm phù hợp mobile (mục tiêu tối thiểu 44×44 CSS px cho điều khiển chính).
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

Tài liệu tham khảo bên ngoài mô tả Neo-brutalism cho hệ thống thư viện. Ảnh TypeUI/Brutal Pages người dùng gửi là tham chiếu thị giác cho trang marketing: header tối, nền ngà, chữ display đậm, khối vàng viền đen và bóng lệch cứng. Tài liệu này chuyển thể các đặc điểm đó cho TOEIC Learning, không sao chép nội dung hay nghiệp vụ.

Các pattern tham khảo gồm diagnostic/gợi ý bài luyện, giải thích, câu sai ôn lại, nghe/transcript/dictation, lịch sử/tiến bộ, notification và analytics lớp. Đây là benchmark chứ chưa phải phạm vi đã duyệt; không sao chép nội dung có bản quyền. Nguồn: [ETS OLPC diagnostic và gợi ý cá nhân](https://www.etsglobal.org/mf/en/content/toeic-official-learning-and-preparation-course), [HOCTOEIC listening/dictation/transcript](https://hoctoeic.vn/huong-dan-su-dung), [ứng dụng TOEIC của ETS Global](https://www.etsglobal.org/fx/en/content/toeic-test-application), [Google Classroom analytics](https://support.google.com/edu/classroom/answer/17231999?hl=en-eu), [TOEIC Test spaced repetition](https://play.google.com/store/apps/details?hl=en_US&id=com.tvt.toeictest.newformat2019).

