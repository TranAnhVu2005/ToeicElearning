# 06. Đặc tả bảo mật TOEIC Learning

> Tài liệu yêu cầu bảo mật cho sản phẩm dự kiến. Đây không phải chứng nhận, kiểm thử xâm nhập hay bằng chứng rằng các kiểm soát đã được triển khai. Mọi trạng thái code dưới đây là quan sát có giới hạn tại 2026-10-29; phải xác minh lại trước mỗi thay đổi.

> Phạm vi bảo mật phải được đáp ứng trong kiến trúc hiện có: backend Spring Boot modular monolith + REST/JWT và frontend React/Vite SPA. Những lựa chọn như BFF/cookie hay tách service bên dưới không phải yêu cầu đổi kiến trúc; chỉ xem xét khi chủ dự án yêu cầu và duyệt tác động.

## 1. Phạm vi và nguyên tắc

Ứng dụng gồm React/Vite, Java/Spring Security, MySQL, JWT bearer, Cloudinary, nội dung đề/audio trả phí, VNPAY, hồ sơ giáo viên, lớp học, bài tập và dữ liệu học tập. Các rủi ro ưu tiên là chiếm tài khoản, lộ đáp án/đề VIP, truy cập chéo lớp hoặc bài làm, giả mạo thanh toán, upload độc hại, lạm dụng API và rò rỉ dữ liệu cá nhân.

- Mặc định từ chối; mỗi route phải được khai báo public có chủ đích hoặc yêu cầu xác thực và quyền server-side.
- Tin cậy thấp với mọi input, ID, file, header, redirect, callback và dữ liệu từ browser. Validate theo allowlist, mã hóa output theo ngữ cảnh, phân quyền trên tài nguyên cụ thể.
- Áp dụng least privilege, giảm thiểu dữ liệu và bảo vệ theo lớp; UI ẩn nút không phải kiểm soát truy cập.
- Không lưu, in log, gửi vào prompt hay commit secret/token/password/OTP/dữ liệu thẻ. Không đưa đáp án đúng xuống client trước thời điểm được phép.
- Khi yêu cầu sản phẩm xung đột với kiểm soát bảo mật, nêu rủi ro và phương án an toàn để chủ dự án quyết định; không âm thầm bỏ kiểm soát.
- Chọn phiên bản thư viện theo stack thực tế trong `pom.xml`/lockfile; tài liệu ngoài có thể mô tả phiên bản khác.

## 2. Mô hình tài sản và mối đe dọa

### Ràng buộc thanh toán đề VIP

- Giá bán là giá riêng từng đề, admin cấu hình trong dữ liệu đề; checkout chỉ dùng giá server đọc từ DB. Mọi amount từ client phải bị bỏ qua hoặc từ chối.
- Đề VIP mua một lần dùng vĩnh viễn; entitlement không có thời điểm hết hạn. Việc refund/thu hồi quyền cần policy admin đã duyệt và audit, không suy diễn từ callback trình duyệt.
- Khi tạo giao dịch, lưu snapshot amount và sản phẩm để IPN đối chiếu chính xác; callback phải kiểm tra transaction reference, user/sản phẩm, merchant, chữ ký, amount VND và trạng thái trước khi cấp entitlement.
- Sửa giá chỉ ảnh hưởng checkout tạo sau thời điểm cập nhật; không sửa amount giao dịch cũ. Endpoint admin sửa giá phải RBAC, validate số nguyên dương/mức trần, và ghi audit event.
- Giá riêng từng đề và quyền vĩnh viễn đã chốt. Code có checkout lấy giá DB, snapshot amount/product, IPN payment lock, entitlement unique user/test và access checks detail/part/submit. Chưa kiểm thử sandbox/replay/concurrency, migration production hoặc review bảo mật độc lập.

| Tài sản | Mối đe dọa trọng yếu | Yêu cầu kiểm soát |
|---|---|---|
| Tài khoản, JWT, hồ sơ | Brute force, credential stuffing, token theft, account takeover | Hash mật khẩu thích nghi, rate limit, thu hồi phiên, MFA cho admin |
| Đề, answer key, audio/transcript VIP | Scraping, truy cập khi chưa mua, lộ đáp án trước submit | Entitlement server-side, DTO theo trạng thái thi, rate limit, URL media có quyền/hạn |
| Bài thi, lịch sử, bài nộp, feedback | IDOR/BOLA, sửa điểm, submit lặp | Owner check theo user/lớp, chấm server-side, transaction/idempotency, audit |
| Lớp, học sinh, tài liệu, assignment | Truy cập chéo lớp, teacher giả mạo, link file bị chia sẻ | Kiểm tra teacher ownership/member status ở mọi thao tác và tải file |
| Giao dịch, quyền mua, hồ sơ giáo viên | Callback giả, replay, thanh toán lặp/nhầm người/số tiền | Xác minh chữ ký, đối chiếu order DB, xử lý IPN idempotent và transaction |
| PII, credentials, logs, backups | Lộ dữ liệu, log injection, truy cập nội bộ quá rộng | Tối thiểu hóa, mã hóa phù hợp, che log, phân quyền, backup và diễn tập khôi phục |

## 3. Xác thực, mật khẩu và phiên

### Mật khẩu và tài khoản

- Chỉ lưu hash mật khẩu thích nghi như BCrypt hiện dùng hoặc Argon2id nếu được đánh giá/migrate có kế hoạch; không dùng hash nhanh thuần hoặc mã hóa có thể giải ngược. Giữ tham số work factor có thể nâng cấp và kiểm tra hash cũ khi đăng nhập.
- Đặt policy độ dài hợp lý; không cắt mật khẩu âm thầm, không bắt đổi định kỳ nếu không có dấu hiệu lộ. Có thể kiểm tra mật khẩu phổ biến/đã lộ khi tích hợp nguồn đáng tin.
- Thông báo đăng nhập/quên mật khẩu chung chung, không tiết lộ email có tài khoản. Rate limit theo IP và định danh; tăng độ trễ/temporary lock có kiểm soát để tránh biến thành công cụ khóa tài khoản của kẻ khác.
- Xác minh email và đặt lại mật khẩu bằng token ngẫu nhiên đủ mạnh, lưu hash token, một lần dùng, thời hạn ngắn, thu hồi phiên cũ sau đổi mật khẩu. Không gửi token/password vào log.
- MFA bắt buộc cho admin trước production; khuyến nghị giáo viên. Có mã khôi phục an toàn và quy trình khôi phục tài khoản được audit.
- Google login phải xác minh ID token phía server bằng thư viện/endpoint chính thức, kiểm tra chữ ký, `aud` đúng client, `iss`, thời hạn và `email_verified`; không chỉ tin email/name do browser gửi.
- Thiết lập mật khẩu cục bộ cho Google-only account cần cả JWT đang xác thực user và Google ID token mới được phát hành tối đa 5 phút trước đó; kiểm tra chữ ký/audience/issuer rồi đối chiếu `sub` với `google_sub` của chính user. Chỉ cho phép khi chưa có password hash; khóa hàng user trong transaction, hash BCrypt và tăng `authVersion` để vô hiệu hóa JWT cũ. Không nhận email thay cho subject và không lưu token Google ở browser storage. Đây là bước xác minh lại danh tính trong phạm vi luồng hiện tại, không thay thế MFA hoặc quy trình phục hồi tài khoản.

### JWT/session

- Mục tiêu production là harden cơ chế JWT Bearer đang dùng trong React SPA và Spring Security: giảm TTL theo threat model, bổ sung refresh/revocation/logout khi được phê duyệt, vô hiệu hóa phiên khi đổi mật khẩu/khóa tài khoản/thu hồi quyền. Con số 5–15 phút chỉ là mục tiêu tham khảo, không phải cấu hình hiện tại.
- Code hiện đối chiếu claim `authVersion` của JWT với `User.authVersion` đọc từ DB ở mỗi request. Đổi mật khẩu và thay đổi trạng thái khóa/mở khóa tăng version, thu hồi ngay token cũ; UI đăng xuất phiên hiện tại và yêu cầu đăng nhập lại sau khi đổi mật khẩu. Đây không thay thế TTL phù hợp, refresh rotation hay thiết kế revoke-all/session riêng nếu sau này được phê duyệt.
- Frontend chỉ xóa phiên khi nhận 401 hoặc lỗi khóa tài khoản cụ thể (`403`, code `2009`); 403 do thiếu quyền role/tài nguyên không được đăng xuất người dùng.
- Token hiện nằm trong `localStorage`, đây là rủi ro cần cân nhắc. Mọi thay đổi nơi lưu token phải được thiết kế như một thay đổi auth có phạm vi, đánh giá tác động frontend/backend và được chủ dự án duyệt; không tự chuyển sang BFF/cookie hoặc thay auth architecture. Dù giữ nguyên kiến trúc, vẫn phòng XSS, đặt token TTL phù hợp và không ghi token vào log.
- Với JWT Bearer trong `Authorization` header như hiện tại, tiếp tục kiểm tra cách credential được gửi và CORS; CSRF token không thay thế XSS defenses. Chỉ khi có thay đổi dùng cookie tự gửi, cần thiết kế CSRF token/Origin trước khi phát hành thay đổi đó.
- JWT validator phải cố định thuật toán cho phép; xác minh signature, `exp`, `nbf`, `iat` khi có, `iss`/`aud` theo thiết kế. Không nhận `alg=none`, không tin role claim cũ cho quyết định dài hạn; dùng trạng thái tài khoản/quyền server-side.
- Secret ký phải entropy cao, ngoài source control, khác nhau giữa môi trường và có kế hoạch rotation/key ID. Không chép giá trị cấu hình hiện tại vào docs.
- Secret/runtime production config phải lấy từ environment/secret manager, không dùng giá trị dự phòng local/sandbox trong `application.properties`. Backend dùng `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAYMENT_URL`, `VNPAY_RETURN_URL`, `VNPAY_FRONTEND_RESULT_URL`, `TEACHER_APPLICATION_FEE_VND`; OAuth audience cấu hình bằng `GOOGLE_CLIENT_ID` và phải trùng với `VITE_GOOGLE_CLIENT_ID` phía frontend. `JWT_SECRET` phải là Base64 giải mã thành tối thiểu 32 byte và `JWT_EXPIRATION` phải dương; backend fail-fast khi cấu hình không hợp lệ. Profile `prod` yêu cầu các biến này, exact CORS origin và đặt Hibernate `validate`; chỉ kích hoạt sau khi đã apply/verify migration. Google client ID là định danh công khai, không phải secret. `.env` phải được ignore và không commit.

## 4. Phân quyền, API và dữ liệu

- Dùng deny-by-default ở route filter; chỉ allowlist public các endpoint cần thiết (ví dụ đăng nhập/đăng ký/callback được thiết kế public). Mỗi controller/service nhạy cảm vẫn kiểm tra authorization để chống gọi chéo qua API.
- Thực thi role và quyền đối tượng: học sinh chỉ xem attempt của mình; giáo viên chỉ quản lý lớp/assignment do mình sở hữu và học sinh còn quyền; tài liệu cần membership hợp lệ; admin endpoint chỉ admin. Kiểm tra quyền trên từng request, kể cả tải media và export.
- Cập nhật tên/mô tả classroom chỉ cho TEACHER sở hữu lớp; khóa hàng lớp khi cập nhật để phối hợp với rotate mã/join, validate độ dài server-side và ghi audit actor/target/action nhưng không ghi nội dung mô tả vào log.
- Chi tiết giao dịch chỉ trả qua `/api/admin/payments/{paymentId}` cho ADMIN; trả mã tham chiếu và trạng thái provider tối thiểu để đối soát, không trả signature, secret hoặc raw callback payload.
- Class join code chỉ trả cho teacher owner; endpoint xoay mã phải kiểm tra ownership phía server và cập nhật dưới row lock để mã cũ không thể tạo membership mới sau khi đổi. Các membership đã tồn tại không phụ thuộc mã mời.
- Đề riêng dùng bảng/entity `Test` hiện có, gắn `classroom_id` và `owner_teacher_id`; mọi CRUD/publish phải xác minh `ROLE_TEACHER` và classroom owner từ server principal/path. Không nhận owner/classroom scope từ payload, không để đề lớp lọt catalog hệ thống; access/detail/part/submit yêu cầu membership `APPROVED`. Từ chối xóa khi có result, assignment hoặc payment reference.
- Dùng request/response DTO allowlist; không bind request trực tiếp vào entity. Client không thể tự gán role, trạng thái khóa, owner, entitlement, score, answer key, payment status hoặc timestamps tin cậy.
- Dùng JPA parameter binding/criteria an toàn; không nối input thành query. Whitelist trường sort/filter; giới hạn page size, độ dài, body size và timeout; validate kiểu, range, format ở server.
- Danh sách notification phải paginate và giới hạn page size; thao tác read-all dùng bulk update theo recipient thay vì tải toàn bộ lịch sử vào RAM.
- Response tối thiểu theo mục đích. Tách đề thi, kết quả, review và admin DTO; ẩn answer key, lời giải, transcript hoặc nội dung VIP đến đúng thời điểm/quyền. Không trả password hash, token, secret hay PII không cần thiết.
- Dictation có thể nhận transcript trước khi nộp mock test chỉ qua endpoint luyện tập authenticated riêng; endpoint phải kiểm tra entitlement/membership, chỉ trả trường context cần thiết và tuyệt đối không kèm options, answer key hoặc explanation. UI reveal/hint không thay authorization và transcript không được đưa vào payload phòng thi.
- Catalog public chỉ serialize metadata; `contextQuestions` phải vắng khỏi JSON catalog. Detail/media endpoint phải kiểm tra quyền trước khi serialize nội dung VIP. JSON view chỉ lọc output, không thay authorization ở service.
- Chống replay/race ở submit, join class, thanh toán, cấp entitlement và thao tác có tính duy nhất bằng transaction, constraint và idempotency key khi phù hợp. Không tin điểm/thời gian từ client.
- Rate limit đăng nhập, đăng ký, reset/OTP, Google auth, lấy media/đề, submit, checkout/IPN và upload; giới hạn theo IP/user/endpoint với response không lộ thông tin. CAPTCHA/bot defense chỉ bật theo rủi ro và UX.
- Code hiện dùng bucket MySQL theo scope/IP/user cho catalog (120/IP), access (120/60), đề/Part/dictation (60/30), submit/session start (30/15), session autosave (600/600), VIP checkout (20/10) và IPN (1.000/IP) mỗi 15 phút. Đây là lớp giảm lạm dụng; cần điều chỉnh theo traffic và cấu hình proxy tin cậy trước production.
- CORS chỉ allowlist origin triển khai, không dùng wildcard cùng credentials. CORS không phải authorization. URL redirect frontend phải khớp origin allowlist; HTTPS bắt buộc ngoài localhost dev và không cho userinfo/fragment.

## 5. Bảo vệ trình duyệt và truyền tải

- Production bắt buộc HTTPS/TLS cấu hình an toàn; bật HSTS sau khi toàn bộ hostname/subdomain phù hợp đã chạy HTTPS ổn định. Không bật `includeSubDomains`/`preload` trước khi xác minh miền.
- Cấu hình/kiểm tra headers phù hợp với Spring Security và frontend: CSP (triển khai report-only rồi siết dần), `frame-ancestors`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`; bỏ banner phiên bản server. Chỉ bật COOP/COEP/CORP nếu tương thích với media và tích hợp.
- React auto-escaping là baseline, không dùng `dangerouslySetInnerHTML`/HTML từ user trừ khi sanitize whitelist bằng thư viện duy trì tốt. CSP là lớp bổ sung, không thay cho output encoding.
- Không ghép URL/redirect không tin cậy. Link mở tab mới cần `rel="noopener noreferrer"`. SRI dùng khi tải asset cố định từ CDN bên thứ ba. Trusted Types chỉ cân nhắc nếu có DOM sink phù hợp, không phải yêu cầu mặc định.
- CSRF áp dụng theo cơ chế xác thực thực tế. Với JWT Bearer hiện tại, xác nhận API không dựa vào credential cookie tự gửi; nếu auth được chủ dự án đổi sang cookie, thiết kế CSRF trước khi phát hành. Không tự bật/tắt CSRF hoặc thay kiểu credential một cách biệt lập.

## 6. Upload, media và nội dung

- Định nghĩa allowlist theo mục đích: ảnh/avatar, audio đề, ảnh đề và tài liệu lớp. Kiểm tra phần mở rộng, MIME khai báo, magic bytes và khả năng decode; giới hạn byte, chiều/độ dài audio, kích thước request, số lượng và quota. Không tin filename/MIME client.
- Từ chối SVG/HTML/script nếu không có sanitization chuyên dụng. Đổi filename sang ID do server tạo. Với tài liệu, cân nhắc antivirus/quarantine; phục vụ an toàn với MIME đúng, `nosniff`, `Content-Disposition` phù hợp.
- Lưu ngoài web root hoặc object storage/provider đã cấu hình đúng. Tài nguyên VIP/tài liệu lớp phải private hoặc URL ký thời hạn ngắn và kiểm tra quyền trước khi cấp. Không coi URL khó đoán là quyền truy cập.
- Media đề VIP mới dùng Cloudinary `authenticated` cho cả audio và image. Backend chỉ cấp URL private-download sau entitlement check ở detail/part/review; media ký có thể chia sẻ đến khi hết hạn (hiện 2 giờ), do đó đây là giảm cửa sổ lộ nội dung chứ không ngăn sao chép. Không dùng URL ký làm định danh lưu lâu dài; lưu public ID/format/delivery type.
- Public ID/format/resource/delivery của media private được đăng ký trong `ExamMediaAsset` ngay sau upload và gắn với user uploader. Khi tạo/cập nhật đề, backend xác minh record này; TEACHER chỉ dùng asset của chính họ, ADMIN quản lý asset toàn hệ thống. Với media private đã gắn vào đề cũ, sửa nháp được giữ metadata không đổi; muốn publish đề legacy chưa có registry cần tải lên lại. Trước publish VIP, mọi audio/image tham chiếu phải là authenticated asset; URL public không được coi là bảo vệ. Kiểm tra Cloudinary plan/SDK và endpoint private-download ở môi trường triển khai.
- Tài liệu lớp hiện chỉ nhận PDF ≤10 MiB: kiểm tra `%PDF-` và marker `%%EOF`, upload `raw/private`; endpoint list không phát URL provider. Download re-checks teacher ownership hoặc student membership `APPROVED`, rồi cấp signed attachment URL TTL 5 phút. Đây là kiểm tra cấu trúc cơ bản, chưa phải antivirus/PDF sanitization; file cần mở bằng trình đọc PDF an toàn. Mọi dữ liệu material cũ chưa có `cloudinary_public_id` không được cấp link.
- Presence heartbeat chỉ gắn với user từ JWT; client không được chỉ định userId. Server giới hạn cập nhật mỗi user một lần/phút; admin chỉ nhận số aggregate trong cửa sổ 5 phút, không nhận danh tính hay lịch sử route/action.
- Admin metrics endpoints chỉ role ADMIN. Dữ liệu submit aggregate từ `test_result`, lượt bắt đầu aggregate từ `exam_session`; request date range được validate và giới hạn tối đa 367 ngày để tránh query tốn tài nguyên. Chỉ trả số liệu aggregate, không trả answer key, đáp án đã chọn hoặc PII qua dashboard.
- Xóa media phải parse URL và chấp nhận đúng hostname/asset namespace của provider; xác nhận asset thuộc ứng dụng và không còn tham chiếu trước khi xóa. Không dùng phép kiểm tra chuỗi con hostname.
- Khi server tải URL do người dùng cung cấp (nếu có), chống SSRF: allowlist host, chặn IP private/link-local/metadata, kiểm soát redirect và DNS rebinding. Không phát sinh fetch tùy ý từ URL avatar/media.
- Phải có quyền sử dụng thương mại đối với audio, ảnh, transcript, câu hỏi và lời giải; quản lý nguồn/quyền và gỡ bỏ nội dung khiếu nại hợp lệ.

## 7. Thanh toán VNPAY và entitlement

- Số tiền, order ID, sản phẩm, user và trạng thái khởi tạo do server lấy từ DB; browser không tự quyết giá hay kết quả.
- Chỉ chấp nhận kết quả callback/IPN sau khi xác minh checksum/chữ ký theo tài liệu VNPAY hiện hành, đối chiếu merchant, mã đơn, số tiền, trạng thái/order chưa xử lý và các trường bắt buộc. Không suy ra thành công chỉ từ trang return của browser.
- Xử lý callback trong transaction idempotent; chống replay và callback trùng; chỉ cấp entitlement một lần khi điều kiện xác minh đạt. Ghi nhận payload tối thiểu/đã che dữ liệu theo chính sách audit, lưu mã tham chiếu và trạng thái đối soát.
- Tách `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `EXPIRED`/trạng thái cần điều tra. Sai lệch số tiền/chữ ký hoặc callback lặp phải vào luồng audit/reconciliation, không tự sửa bằng client.
- Không lưu số thẻ/CVV/OTP; để nhà cung cấp thanh toán xử lý. Secret VNPAY chỉ ở secret manager/env; không in URL callback chứa token/secret ra log.
- Thanh toán hồ sơ giáo viên và admin approval là hai trạng thái tách biệt; thanh toán thành công chỉ chuyển sang chờ duyệt, không tự nâng role.

## 8. Dữ liệu cá nhân, secret và hạ tầng

- Thu thập tối thiểu; xác định mục đích, thông báo/đồng ý phù hợp, thời hạn lưu, quyền truy cập/sửa/xóa/xuất và quy trình phản hồi sự cố. Có thể áp dụng dữ liệu cá nhân theo Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP có hiệu lực 01-01-2026; nghĩa vụ cụ thể phải được đối chiếu pháp lý theo mô hình vận hành, không dùng tài liệu này thay tư vấn pháp lý.
- Phân loại dữ liệu: công khai, nội bộ, PII, xác thực/bí mật và giao dịch. Mã hóa TLS khi truyền; bảo vệ at-rest bằng cấu hình DB/storage/KMS phù hợp. Không mã hóa bừa mọi cột nếu chưa thiết kế tra cứu, backup và rotation khóa.
- Không log password, OTP, Authorization header, JWT, reset token, secret, dữ liệu thẻ, toàn bộ callback nhạy cảm hoặc nội dung bài làm nếu không cần. Che/giảm PII trong log; hạn chế quyền đọc, thời hạn lưu và chống log injection.
- Secret/config qua env hoặc Secret Manager; `.env` và private key không commit/đóng gói vào image. Quét secret trước merge; nếu secret đã bị lộ, rotate/revoke và xử lý lịch sử Git theo incident plan.
- Database dùng account ứng dụng có quyền tối thiểu, không public port, backup mã hóa và kiểm tra restore định kỳ. Tách dev/staging/prod; không đưa dữ liệu thật vào dev nếu chưa khử định danh.
- Runtime/container chạy non-root nếu container hóa, image tối giản, patch framework/OS, firewall/private network và quản lý quyền Cloudinary/VNPAY theo least privilege.
- Kiểm kê dependency và lockfile; quét CVE/SCA và secret trong CI; cập nhật có review. Dùng SAST/DAST và SBOM theo mức độ trưởng thành; action CI/token bên thứ ba chỉ cấp quyền tối thiểu.

## 9. Audit, giám sát và ứng phó

- Audit đăng nhập thành công/thất bại, reset/đổi mật khẩu, khóa tài khoản, thay role, thao tác quản trị đề, payment transition, cấp/thu hồi entitlement, teacher approval và hành động lớp nhạy cảm.
- Hiện code có `audit_event` với UTC timestamp và API ADMIN phân trang; đã ghi đăng ký local, local/Google login success/failure, đổi/đặt mật khẩu, khóa/mở user, teacher review, chuyển trạng thái payment/cấp entitlement từ IPN đã xác minh, thao tác đề, membership, assignment, feedback và tài liệu lớp. Coverage vẫn một phần cho các thao tác/vận hành khác. Event auth không lưu identifier; event payment không lưu payload/chữ ký; không lưu lý do từ chối, join code, nội dung feedback hoặc secret/credential.
- Sự kiện có timestamp UTC, actor, action, đối tượng và kết quả; không chứa bí mật. Chỉ role vận hành phù hợp đọc log; giới hạn sửa/xóa và đặt retention.
- Cảnh báo thất bại đăng nhập bất thường, tăng đột biến API/upload, sai chữ ký payment, truy cập chéo bị từ chối lặp lại và lỗi dependency nghiêm trọng.
- Có playbook phát hiện → cô lập → thu hồi credential/token → khôi phục → đánh giá tác động/thông báo theo nghĩa vụ → rút kinh nghiệm. Có contact nhận báo cáo bảo mật; chỉ tạo `security.txt` khi thông tin liên hệ và quy trình thực sự vận hành.
- WAF/CDN/DDoS protection là lớp triển khai theo môi trường và ngân sách, không thay authorization, secure coding hay rate limiting trong ứng dụng.

## 10. Kiểm chứng và tiêu chí trước production

Các kiểm tra dưới đây là yêu cầu cho release/review bảo mật; không tự chạy nếu người dùng chỉ yêu cầu chỉnh tài liệu. Trước production cần có ít nhất:

- Kiểm tra route matrix: endpoint public/authenticated/admin/teacher/student; thử anonymous, role sai, locked user và gọi trực tiếp API.
- Kiểm tra BOLA cho attempt, question/media VIP, lớp, member, assignment, submission, feedback và tài liệu bằng ID của người khác/lớp khác.
- Kiểm tra mass assignment, SQL injection, XSS, CORS, CSRF theo auth mode, redirect, upload file giả MIME/quá cỡ, rate-limit và response không lộ answer key.
- Kiểm tra JWT hết hạn/sai chữ ký, logout/revoke, đổi role/khóa tài khoản và refresh rotation nếu đã có.
- Kiểm tra VNPAY signature sai, amount/order mismatch, callback lặp/replay, thứ tự callback khác nhau, timeout và transaction rollback.
- CI/pre-release: compile/test theo yêu cầu tác vụ, dependency/secret scan; DAST trên staging có cho phép; review thủ công/penetration test trước thương mại hóa theo mức rủi ro.
- Kiểm tra HTTPS/headers/CSP/CORS ở môi trường triển khai, restore backup và cảnh báo vận hành.

## 11. Hiện trạng quan sát trong repository

Đây là danh sách dấu hiệu cần đánh giá tiếp, không phải audit đầy đủ hoặc kết luận khai thác được. Đọc lại source trước khi sửa:

- `SecurityConfig` disable CSRF theo mô hình JWT Bearer header, dùng stateless session; chỉ ba `POST` `/api/auth/register`, `/api/auth/login`, `/api/auth/google` và một số GET catalog/part/callback được public; mọi route không khớp allowlist cần xác thực, `/api/admin/**` cần ADMIN. CORS dùng allowlist exact origins từ `APP_CORS_ALLOWED_ORIGINS`, mặc định chỉ hai origin localhost dev; wildcard bị từ chối khi khởi tạo config. Frontend API base lấy từ `VITE_API_BASE_URL`. Production phải cấu hình domain HTTPS thật cho cả hai biến. Đây là default authenticated, nhưng vẫn cần route matrix và kiểm tra authorization theo đối tượng; không coi cấu hình filter là audit hoàn chỉnh.
- Spring Security hiện đặt `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` (default writer), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` giới hạn camera/microphone/geolocation; HSTS chỉ đi theo HTTPS response và không bật `includeSubDomains`. Servlet error response không include stack trace/message/binding details. Chưa có CSP ở host frontend hoặc kiểm tra header trên môi trường deploy; không coi local config là xác minh production.
- Frontend lưu access token trong `localStorage`; JWT expiration mặc định cấu hình 86,400,000 ms (24 giờ). Refresh/revocation/session management cần được thiết kế và đánh giá.
- Đăng ký hiện cho password dài 6–100 ký tự; cần xem lại policy và luồng reset/email/MFA.
- Local login trả cùng `INVALID_CREDENTIALS` cho định danh không tồn tại, password sai và tài khoản bị khóa để không tiết lộ trạng thái tài khoản. Endpoint kiểm tra bộ đếm thất bại bền vững trong MySQL: tối đa 20 lần/IP và 8 lần trên cặp IP + định danh trong cửa sổ 15 phút; khóa lưu SHA-256 thay vì IP/định danh thô, bản ghi cũ hơn một ngày được dọn định kỳ. Khi vượt ngưỡng trả `429 AUTH_RATE_LIMITED`, không khóa hay sửa trạng thái tài khoản. Ghép IP với định danh tránh một nguồn đơn lẻ khóa đăng nhập của người dùng từ mạng khác. IP lấy từ kết nối trực tiếp; nếu production chạy sau reverse proxy, chỉ bật forwarded-header handling khi proxy tin cậy đã xóa header client gửi và tự ghi header chuẩn. Chưa có CAPTCHA/bot defense, distributed stress test hoặc kiểm chứng cấu hình proxy production.
- Đăng ký giới hạn 10 request/IP và 5 request trên cặp IP + email chuẩn hóa; Google login giới hạn 30 request/IP, cùng cửa sổ 15 phút. Bucket tách theo endpoint. Chưa có endpoint reset/OTP hoặc CAPTCHA/bot defense.
- Google auth hiện xác minh ID token cục bộ bằng RSA JWK từ Google, kiểm tra `RS256`, chữ ký, issuer, audience, `azp` nếu có nhiều audience, `exp`/`iat` và `email_verified`; JWK được cache theo `Cache-Control`, refresh khi gặp `kid` lạ có giới hạn tần suất. `sub` lưu trong cột unique `google_sub`; không tự liên kết tài khoản local chỉ dựa trên email. Cần cấu hình `GOOGLE_CLIENT_ID` cùng client ID frontend và xác minh luồng này trên môi trường tích hợp.
- Cloudinary upload hiện chọn resource type theo folder; ảnh JPEG/PNG được decode/giới hạn kích thước, audio MP3/WAV/M4A được kiểm tra nội dung/giới hạn byte. Tài liệu lớp PDF private được giới hạn 10 MiB, kiểm tra chữ ký đầu/cuối cơ bản và ký link tải 5 phút. Đây chưa phải antivirus/sanitization. Cleanup kiểm tra HTTPS host/account và namespace; quota request hiện giới hạn theo IP + user: media 30/IP, 20/user; PDF lớp 30/IP, 10/teacher trong 15 phút; bộ đếm lưu hash trong MySQL và dọn định kỳ. Dung lượng tài liệu mặc định tối đa 512 MiB/lớp, cấu hình qua `CLASSROOM_STORAGE_QUOTA_BYTES`; hidden file vẫn tính vì asset chưa bị xóa. Chưa có quota tổng Cloudinary account/băng thông hoặc integration test.
- Upload request có giới hạn cấu hình và rate limit; các biện pháp này không thay thế antivirus/sanitization, quota lưu trữ hoặc quyền truy cập media.
- Một số controller có `@PreAuthorize`; cần rà toàn bộ route/method và kiểm thử quyền đối tượng cho mọi API.
- Exam session: `POST /api/exam/sessions` và `PATCH /api/exam/sessions/{id}/answers` yêu cầu authenticated user; server scope theo owner và test/assignment/source/timer/question set, khóa row session khi ghi, chỉ chấp nhận lựa chọn A–D trong danh sách câu session, kiểm tra lại VIP/classroom membership/assignment/deadline và fingerprint nội dung đề. Với assignment, autosave/submit khóa hàng membership APPROVED; thao tác đổi trạng thái membership cũng khóa cùng hàng để tránh race giữa thu hồi quyền và ghi bài. Khi submit, assignment row cũng được khóa và refresh trước khi áp deadline/late policy; cập nhật policy hoặc archive khóa cùng hàng để kết quả nộp được tuần tự hóa với thay đổi của giáo viên. Session chỉ lưu đáp án đã chọn, không lưu answer key. Đáp án snapshot được dùng làm nguồn chấm khi timer hết; trước hạn, final snapshot được validate trong transaction.
- Draft answers và target question IDs được xóa khi submit/hủy và sau khi active session hết TTL; scheduler 5 phút chỉ log số lượng, không log user/session IDs hay đáp án. Giá trị chu kỳ mặc định 300000 ms, cấu hình `APP_EXAM_SESSION_CLEANUP_DELAY_MS`.
- Submit exam nhận UUID `submissionKey`; backend khóa hàng user trong transaction, giới hạn replay theo user/test/assignment/source result và lưu unique `(user_id, submission_key)` trong `test_result`. Submit mới cần sessionId thuộc user và khớp scope; elapsed time lấy từ server `startedAt`, không tin `totalTime` client. Frontend giữ key đến khi nhận kết quả. Compile/build chưa thay thế concurrency/DB integration validation.
- `POST /api/user/setpassword` chỉ hoạt động cho tài khoản hiện tại có Google `sub`, chưa có local password và chưa bị khóa; xác thực lại ID token Google có `iat` trong 5 phút, subject khớp, sau đó BCrypt + tăng `authVersion`. UI không lưu ID token; người dùng phải đăng nhập lại. Chưa kiểm thử bằng tài khoản Google thật/tích hợp.
- `application.properties` lấy DB/JWT/Cloudinary/VNPAY secrets từ environment; `google.client-id` là định danh OAuth công khai, không phải secret. Trước triển khai vẫn phải xác minh environment/secret manager thực tế và rotate mọi secret từng bị lộ; không sao chép giá trị vào tài liệu hay output.
- Hibernate SQL logging tắt theo mặc định qua `spring.jpa.show-sql=${JPA_SHOW_SQL:false}`; chỉ bật tạm thời trong môi trường debug được kiểm soát, không bật production hoặc ghi dữ liệu/PII vào log.

## 12. Ngoài phạm vi hiện tại / kích hoạt khi cần

- NoSQL/GraphQL/LDAP/XXE/SSTI, mobile certificate pinning, microphone permission, AI prompt injection chỉ cần khi stack/tính năng tương ứng được đưa vào phạm vi.
- Không bật CSP strict, HSTS preload, COEP hoặc CAPTCHA tùy tiện gây lỗi sản phẩm; triển khai theo môi trường, đo tương thích và có kiểm tra.
- Không tuyên bố “bảo mật tuyệt đối”. Mục tiêu là threat model, kiểm soát có thể kiểm chứng, vận hành liên tục và xử lý sự cố.

## 13. Tài liệu tham chiếu chính

### Ghi nhận triển khai VNPAY hiện tại

- Endpoint IPN public xác minh HMAC-SHA512, merchant, mã giao dịch, VND amount và trạng thái trước khi ghi kết quả; truy vấn giao dịch có khóa hàng để chống callback song song. Khi callback báo thành công, backend kiểm tra thêm loại sản phẩm và liên kết user/application/test trong DB; giao dịch sai liên kết không được đánh dấu SUCCESS để tránh thu tiền nhưng bỏ qua bước cấp entitlement/chuyển hồ sơ. Chỉ IPN chuyển payment sang SUCCESS/FAILED.
- Return URL chỉ kiểm tra chữ ký và redirect; đích frontend phải cùng origin với một origin CORS được cấu hình, chỉ HTTP trên localhost dev, không userinfo/fragment. UI đọc trạng thái qua API cần đăng nhập, scope theo user sở hữu giao dịch. Không chứa hash/secret trong frontend hoặc log.
- Checkout URL dùng cùng transaction reference khi retry giao dịch pending còn hạn. Khi URL hết hạn mà chưa có kết quả cuối, code giữ đơn pending và chặn tạo order mới; bản ghi `EXPIRED` cũ cũng chặn retry cho tới khi đối soát để IPN trễ còn được ghi nhận mà không tạo nguy cơ thu trùng. Quy trình admin/provider reconciliation vẫn chưa có UI/API chuyên dụng nên người dùng có thể phải chờ hỗ trợ. Đây là tích hợp code/config, chưa chứng minh qua sandbox, merchant production, IPN public HTTPS, replay/concurrency test hoặc review bảo mật độc lập.
- Cấu hình cần qua `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAYMENT_URL`, `VNPAY_RETURN_URL`, `VNPAY_FRONTEND_RESULT_URL`; không commit giá trị bí mật. `VNPAY_RETURN_URL` cần endpoint HTTPS reachable và cấu hình đúng tại merchant.

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/): API authorization, cấu hình, tài nguyên và inventory.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
- [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html), [Security Headers](https://docs.spring.io/spring-security/reference/features/exploits/headers.html). Đối chiếu phiên bản dependency của dự án.
- [Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15](https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroup=) và [Nghị định 356/2025/NĐ-CP](https://vanban.chinhphu.vn/?classid=1&docid=216387&pageid=27160), đều hiệu lực 01-01-2026 theo Cổng văn bản Chính phủ.
- Quy trình tích hợp VNPAY phải dùng tài liệu merchant/integration chính thức được cấp cho dự án; không suy diễn tên trường/chữ ký từ bài viết bên thứ ba.
