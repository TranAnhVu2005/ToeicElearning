# Hướng dẫn AI khi làm việc với TOEIC Learning

## Mục tiêu tài liệu & Nguyên tắc bàn giao ngữ cảnh giữa các Agents

Đây là chỉ dẫn tối cao dành cho mọi AI agent làm việc trong repository này. Hệ thống tài liệu `.md` (`AGENTS.md` → `PROJECT_CONTEXT.md` → `docs/01_OVERVIEW.md`..`07_IMPLEMENTATION_STATUS.md`) được thiết kế làm **bộ nhớ ngữ cảnh chuẩn xác của toàn dự án** để khi chủ dự án chuyển đổi giữa các AI Agents hoặc mở phiên chat mới, Agent mới chỉ cần đọc bộ tài liệu `.md` này là nắm trọn vẹn dự án mà **không cần phải đọc lại toàn bộ mã nguồn**.

Khi tài liệu khác nhau: `AGENTS.md` quy định quy trình và nguyên tắc làm việc, `PROJECT_CONTEXT.md` tóm tắt trạng thái thực tế toàn hệ thống, `docs/01`–`07` mô tả chi tiết đặc tả & trạng thái triển khai từng phân hệ, và mã nguồn/schema là nơi đối chiếu trực tiếp khi sửa file.

## Quy trình bắt buộc trước và sau mỗi tác vụ

1. **Bước 1 — Đọc `AGENTS.md` đầu tiên (Bắt buộc)**: Mọi phiên chat hoặc tác vụ mới bắt buộc phải đọc `AGENTS.md` trước tiên để nắm quy trình, ràng buộc kiến trúc, thiết kế UI và bảo mật.
2. **Bước 2 — Đọc `PROJECT_CONTEXT.md` tiếp theo (Bắt buộc)**: Đọc `PROJECT_CONTEXT.md` (tóm tắt gọn ≤ 130 dòng) ngay sau `AGENTS.md` để nắm toàn cảnh dự án hiện hành (công nghệ, routes, modules, cấu trúc DB, các chức năng đã hoàn thiện, trạng thái kiểm chứng) mà không phải quét lại toàn bộ dự án.
3. **Bước 3 — Xem qua bộ tài liệu `docs/` trước khi thực hiện bất kỳ chức năng nào (Bắt buộc)**: Trước khi bắt đầu thiết kế, code hoặc chỉnh sửa bất kỳ chức năng nào, phải xem qua bộ tài liệu trong `docs/` (`docs/01_OVERVIEW.md` đến `docs/06_SECURITY_SPEC.md`, kèm `docs/07_IMPLEMENTATION_STATUS.md`) và đọc kỹ tài liệu thuộc phân hệ liên quan để giữ nhất quán tuyệt đối giữa nghiệp vụ, dữ liệu, API, luồng, UI/UX và bảo mật.
4. **Bước 4 — Kiểm tra mã nguồn mục tiêu**: Dựa trên định vị từ `PROJECT_CONTEXT.md` và `docs/`, kiểm tra `git status` và chỉ đọc các controller/service/entity/request/response hoặc component/CSS trực tiếp liên quan đến tác vụ đang thực hiện.
5. **Bước 5 — Phân biệt yêu cầu đã chốt và đề xuất**: Không tự ý triển khai các mục đang gắn nhãn đề xuất/câu hỏi mở trong docs cho đến khi người dùng yêu cầu rõ ràng. Nếu đặc tả thiếu chi tiết hoặc ảnh hưởng lớn tới dữ liệu/hành vi, hỏi lại người dùng trước khi quyết định. Chỉ sửa trong phạm vi tác vụ; tuyệt đối không chạy script SQL có `DROP DATABASE`.
6. **Bước 6 — Cập nhật đồng bộ các file `.md` sau khi thực hiện (Bắt buộc)**:
   - Mỗi khi thêm mới, thay đổi hoặc hoàn thiện bất kỳ chức năng, API, bảng/cột DB, luồng nghiệp vụ hoặc giao diện UI/UX nào, AI agent **bắt buộc phải cập nhật ngay vào `PROJECT_CONTEXT.md` và các file tương ứng trong `docs/` (`01`–`07`, cùng `AGENTS.md` nếu có quy ước mới)** ngay trong cùng tác vụ.
   - Đảm bảo các file `.md` luôn phản ánh **đúng 100% trạng thái thực tế của dự án tại mọi thời điểm**, giúp bất kỳ AI Agent kế tiếp nào đọc vào cũng hiểu đúng hệ thống ngay lập tức mà không cần đọc lại toàn bộ source code.

## Công nghệ và quy ước dự án

- Backend Java 17, Spring Boot, Maven, Spring Data JPA, Spring Security, MySQL. Xem version thực trong `backend/pom.xml` (hiện 4.1.0); đừng dùng mô tả Spring Boot 3 trong tài liệu cũ như sự thật hiện hành.
- Frontend React, Vite, Tailwind CSS; dùng JavaScript/JSX hiện có, Axios và React Router. Đừng chuyển framework hoặc tạo ứng dụng thứ hai nếu không được yêu cầu.
- Tên bảng snake_case, field Java/JSON theo mapping hiện có; kiểm tra DTO và response thật trước khi tích hợp UI.
- **Quy ước cập nhật SQL / Schema DB**: Khi thêm mới hoặc thay đổi bảng/cột DB cho một chức năng, agent có thể tạo file migration SQL chạy riêng trong `backend/migrations/` (viết kiểu idempotent, không `DROP DATABASE`) để chủ dự án chạy bổ sung từng phần trên DB đang có; **đồng thời bắt buộc phải cập nhật đồng bộ ngay vào `backend/toeic_learning_fresh_install.sql`** để khi cần cài lại hoặc chạy toàn bộ script thì DB vẫn khớp 100% với backend.
- Giữ các quy ước `ApiResponse<T>`, error handling, JWT và RBAC hiện tại trừ khi tác vụ yêu cầu thay đổi.
- Dữ liệu câu hỏi theo quan hệ `Test -> ContextQuestion -> Question`; `orderIndex` là số câu đầu của cụm, `questionNumber` là số thứ tự toàn bài.
- Không đưa bí mật trong `application.properties` vào tài liệu, output, log hoặc frontend. Cấu hình mới nên qua biến môi trường.

## Giữ nguyên kiến trúc hiện tại

- Đây là ràng buộc dự án: phát triển tiếp trên kiến trúc hiện có để chủ dự án dễ đọc, hiểu và bảo trì code. Không tự ý chuyển framework, thay kiến trúc, hoặc tái cấu trúc diện rộng.
- Backend hiện là một ứng dụng Spring Boot duy nhất, chia module nghiệp vụ như `auth`, `exam`, `user`, `admin`, `media`, `classroom`; bên trong dùng Controller, Service/ServiceImpl, Repository, Entity, DTO/Request/Response/Mapper và `common`/`config`/`security` tại nơi đã có. Không giả định mọi module đã hoàn chỉnh hoặc đồng nhất.
- Frontend hiện là một React/Vite SPA: giữ các route/page/component, `context`, `services` và `api/apiClient.js` đang có; tiếp tục gọi REST API backend. Tái sử dụng cấu trúc và quy ước hiện tại.
- Khi thêm chức năng, ưu tiên mở rộng module, service, DTO, repository, controller/page/service phù hợp gần nhất. Chỉ tạo file/thành phần mới nếu chức năng cần; đặt theo convention đang có trong khu vực đó.
- Không tạo microservices, BFF, GraphQL, CQRS/event-driven platform, framework mới, tầng abstraction chung, hoặc di chuyển hàng loạt package chỉ vì tài liệu có nhắc đến như một lựa chọn. Chỉ đổi khi chủ dự án yêu cầu rõ.
- Nếu yêu cầu bảo mật cần thay đổi đáng kể auth/session hoặc cách tổ chức hệ thống, trước tiên mô tả lựa chọn, ảnh hưởng tới code đã có và cách chuyển từng bước; không tự thực hiện đổi kiến trúc.
- Trước khi thiết kế giải pháp, kiểm tra code của module đang sửa. Code/schema hiện tại là nguồn xác nhận cấu trúc thật; docs mô tả mục tiêu nghiệp vụ và không phải lý do để viết lại phần đã hoạt động.

## Quy tắc bảo mật bắt buộc

- Trước khi sửa auth, API, dữ liệu, upload/media, payment, lớp học hoặc deploy, đọc `docs/06_SECURITY_SPEC.md` và xác minh trạng thái code hiện tại.
- Mặc định deny-by-default; mọi endpoint phải được phân loại public/authenticated/role và kiểm tra quyền đối tượng ở server. Không tin role, owner, score, answer key, payment status hoặc ID do client cung cấp.
- Validate input, dùng parameterized persistence, request DTO allowlist, response tối thiểu; không lộ answer key trước thời điểm được phép.
- Không lưu/log/commit secret, password, token, OTP hoặc dữ liệu thẻ. Không thêm dependency mà chưa xem xét nguồn gốc, bảo trì và lỗ hổng đã biết.
- Upload phải được giới hạn và kiểm tra nội dung thật; media trả phí/lớp phải kiểm tra quyền. Payment chỉ xác nhận bằng callback đã xác minh phía server và xử lý idempotent.
- Bảo vệ CSRF theo cơ chế credential: bearer header chủ động và cookie tự gửi có yêu cầu khác nhau. Không bật/tắt CSRF máy móc.
- Nêu rõ trong báo cáo điều gì đã xác minh, chưa kiểm thử hoặc còn là rủi ro; không tuyên bố bảo mật tuyệt đối hay nói docs đã được triển khai.

## Nguyên tắc sản phẩm

### Vai trò

- Admin: thêm/sửa/xóa bài thi; khóa/mở khóa tài khoản; duyệt hồ sơ đăng ký giáo viên; quản lý giao dịch PayOS và quyền mua đề VIP.
- Giáo viên: tạo và quản lý lớp học, mời học viên qua mã lớp hoặc danh sách Gmail, đăng thông báo bảng tin (kèm gửi Gmail), tải tài liệu PDF private (hỗ trợ xem trước trực tiếp và tải về), tạo đề riêng cho lớp, giao bài tập (kèm thông báo Gmail) và chấm nhận xét bài làm.
- Người dùng: cập nhật hồ sơ, đổi mật khẩu, làm full test, luyện theo từng Part, luyện nghe chép chính tả Dictation, xem lại bài thi đã làm, hỏi Trợ lý AI Nuna, tham gia lớp học và mua đề VIP qua PayOS.
- Backend phải là nơi thực thi quyền, trạng thái thanh toán và quyền truy cập đề. UI guard chỉ hỗ trợ điều hướng.
- Với hệ lớp học, mọi thao tác kiểm tra teacher ownership, classroom membership, trạng thái member và quyền assignment ở server; không tin classId/userId client.
- Phân biệt đã nộp, nộp trễ, chưa nộp, chưa chấm; không tự áp một late policy hoặc quy tắc điểm trung bình khi docs đánh dấu cần chốt.
- Không khẳng định scaled score là điểm ETS chính xác nếu không có raw-to-scaled conversion được phép cho đúng test form; xem `docs/01_OVERVIEW.md`.
- Sản phẩm thương mại phải có quyền phân phối đối với bộ câu hỏi, audio, ảnh, transcript và lời giải.
- Diagnostic/study plan, spaced repetition, content-issue queue, notification preferences và conversion funnel là đề xuất được ghi nhãn trong docs; chỉ triển khai khi chủ dự án chọn/phê duyệt scope. Resumable exam session đã được chủ dự án chọn; implementation và giới hạn hiện trạng được ghi ở `PROJECT_CONTEXT.md` và docs.

### Mô hình thi TOEIC cần bảo toàn

- Quy tắc chi tiết Part 1–7 và các câu hỏi mở nằm trong `docs/02_DATABASE.md` và `docs/04_FLOW_LOGIC.md`; không nhân đôi tại đây.

## Thiết kế UI

- Với mọi tác vụ tạo mới hoặc restyle giao diện, trước khi sửa hãy đọc `docs/05_UI_UX_SPEC.md`, đặc biệt mục 1–2 và phần màn hình tương ứng; kiểm tra component/page hiện có để giữ đúng kiến trúc và convention.
- Áp dụng Editorial theo `docs/05_UI_UX_SPEC.md` trên mọi route, component dùng chung, trạng thái và màn hình: Gelasio cho nội dung/heading, Ubuntu Mono cho mã và số liệu kỹ thuật; palette đen, trắng, xám sáng với xanh dương làm accent; nhịp 8pt và divider mảnh. Token docs05 là nguồn chuẩn; không để Neo-brutalism, Retro hoặc class legacy quyết định giao diện.
- Chuyển thể Editorial cho học tập, quản trị, lớp học và phòng thi; chỉ kế thừa visual language, không sao chép nghiệp vụ/route/asset thương mại của ảnh tham khảo. Giữ nội dung dễ đọc, cỡ chữ và trạng thái tương tác/accessibility đầy đủ; ảnh nền cần phối hợp với lớp phủ đảm bảo tương phản và không đặt trang trí dưới vùng thi/đọc.
- Khi restyle, đồng bộ hierarchy, bố cục, typography, component, trạng thái hover/active/focus/disabled/loading và responsive; không dừng ở đổi màu/font. Không redesign ngoài phạm vi task.
- Trước khi kết thúc UI task, rà trạng thái loading/empty/error/success/disabled, keyboard focus, contrast, reduced motion và responsive; nêu rõ viewport/trạng thái nào chưa quan sát. Không báo visual QA nếu chưa thực hiện.
- Giữ nguyên React/Vite SPA, React Router, Tailwind, Axios và cấu trúc page/component/context/service hiện có.

## Kiểm chứng, cập nhật tài liệu và báo cáo

- Không tự thêm/chạy test trừ khi người dùng yêu cầu kiểm thử hoặc xác minh. Nếu không chạy, ghi rõ.
- Khi được yêu cầu chạy, chọn kiểm tra phù hợp vùng đổi (frontend build/lint, backend compile/test); báo nguyên văn lỗi môi trường quan trọng.
- **Trước khi kết thúc bất kỳ tác vụ thay đổi code/UI/DB/API nào**: bắt buộc rà soát và cập nhật `PROJECT_CONTEXT.md` cùng các file đặc tả trong `docs/` liên quan để tài liệu `.md` luôn khớp 100% với dự án thực tế, phục vụ bàn giao ngữ cảnh liền mạch khi chuyển sang AI Agent khác.
- Kết thúc tác vụ implementation bằng danh sách file (bao gồm cả file code và file `.md` đã đồng bộ), các thay đổi chính, kiểm chứng đã chạy/chưa chạy, và các giới hạn còn lại.
- Khi tác vụ chỉ yêu cầu viết/duyệt tài liệu, không sửa code.

## Bản đồ tài liệu đặc tả (Thứ tự đọc: `AGENTS.md` → `PROJECT_CONTEXT.md` → `docs/01`..`07`)

- `PROJECT_CONTEXT.md`: bản tóm tắt toàn cảnh dự án (kiến trúc, công nghệ, routes, modules, DB, tính năng cốt lõi, UI/UX, trạng thái kiểm chứng).
- `docs/01_OVERVIEW.md`: mục tiêu, vai trò, hệ thống và thứ tự đọc.
- `docs/02_DATABASE.md`: entity, quan hệ, câu TOEIC, payment PayOS, lớp, bài tập, dữ liệu học tập, quyền và migration.
- `docs/03_API_SPEC.md`: API hiện có/mục tiêu cho thi, PayOS, teacher onboarding, lớp, Gmail notification/invitation, xem trước PDF, trợ lý AI, học tập cá nhân, metrics, thông báo.
- `docs/04_FLOW_LOGIC.md`: luồng catalog, thi/review, lớp/assignment/Gmail, xem trước PDF, PayOS, diagnostic, ôn tập, resume và vận hành.
- `docs/05_UI_UX_SPEC.md`: visual system và màn hình user/teacher/admin, Trợ lý AI Nuna, cá nhân hóa, quality queue, responsive/accessibility.
- `docs/06_SECURITY_SPEC.md`: threat model, auth/session, authorization, API, upload, PayOS, privacy, vận hành và security acceptance checklist.
- `docs/07_IMPLEMENTATION_STATUS.md`: bảng tổng hợp trạng thái hoàn thiện thực tế của từng phân hệ, migrations và kết quả build/lint gần nhất.

Khi áp dụng mọi tài liệu trên, phải tuân thủ mục “Giữ nguyên kiến trúc hiện tại”; đặc tả tính năng/bảo mật không tự cho phép thay framework, auth architecture hay cấu trúc ứng dụng.

