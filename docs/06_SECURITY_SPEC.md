# 06. Đặc tả bảo mật TOEIC Learning

> Tài liệu yêu cầu bảo mật cho sản phẩm dự kiến. Đây không phải chứng nhận, kiểm thử xâm nhập hay bằng chứng rằng các kiểm soát đã được triển khai. Mọi trạng thái code dưới đây là quan sát có giới hạn tại 2026-10-29; phải xác minh lại trước mỗi thay đổi.

## 1. Phạm vi và nguyên tắc

Ứng dụng gồm React/Vite, Java/Spring Security, MySQL, JWT bearer, Cloudinary, nội dung đề/audio trả phí, VNPAY, hồ sơ giáo viên, lớp học, bài tập và dữ liệu học tập. Các rủi ro ưu tiên là chiếm tài khoản, lộ đáp án/đề VIP, truy cập chéo lớp hoặc bài làm, giả mạo thanh toán, upload độc hại, lạm dụng API và rò rỉ dữ liệu cá nhân.

- Mặc định từ chối; mỗi route phải được khai báo public có chủ đích hoặc yêu cầu xác thực và quyền server-side.
- Tin cậy thấp với mọi input, ID, file, header, redirect, callback và dữ liệu từ browser. Validate theo allowlist, mã hóa output theo ngữ cảnh, phân quyền trên tài nguyên cụ thể.
- Áp dụng least privilege, giảm thiểu dữ liệu và bảo vệ theo lớp; UI ẩn nút không phải kiểm soát truy cập.
- Không lưu, in log, gửi vào prompt hay commit secret/token/password/OTP/dữ liệu thẻ. Không đưa đáp án đúng xuống client trước thời điểm được phép.
- Khi yêu cầu sản phẩm xung đột với kiểm soát bảo mật, nêu rủi ro và phương án an toàn để chủ dự án quyết định; không âm thầm bỏ kiểm soát.
- Chọn phiên bản thư viện theo stack thực tế trong `pom.xml`/lockfile; tài liệu ngoài có thể mô tả phiên bản khác.

## 2. Mô hình tài sản và mối đe dọa

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

### JWT/session

- Mục tiêu production là access token ngắn hạn, refresh token có rotation/reuse detection/revocation, logout và vô hiệu hóa phiên khi đổi mật khẩu, khóa tài khoản hoặc thu hồi quyền. Chọn TTL theo threat model; con số 5–15 phút là mục tiêu thiết kế tham khảo, không phải giá trị đã cấu hình.
- Ưu tiên kiến trúc BFF/cookie `HttpOnly; Secure; SameSite` cho browser hoặc giữ bearer token trong bộ nhớ và thiết kế refresh an toàn. Không lưu access/refresh token trong `localStorage`; chuyển đổi cần xử lý tương thích và rủi ro XSS/CSRF.
- Nếu dùng cookie tự gửi theo request, bật CSRF token phù hợp và kiểm tra Origin/Fetch Metadata. Nếu chỉ dùng Authorization bearer do JS chủ động gửi, CSRF token không thay thế XSS defenses; xác nhận không có auth cookie ngoài dự kiến.
- JWT validator phải cố định thuật toán cho phép; xác minh signature, `exp`, `nbf`, `iat` khi có, `iss`/`aud` theo thiết kế. Không nhận `alg=none`, không tin role claim cũ cho quyết định dài hạn; dùng trạng thái tài khoản/quyền server-side.
- Secret ký phải entropy cao, ngoài source control, khác nhau giữa môi trường và có kế hoạch rotation/key ID. Không chép giá trị cấu hình hiện tại vào docs.

## 4. Phân quyền, API và dữ liệu

- Dùng deny-by-default ở route filter; chỉ allowlist public các endpoint cần thiết (ví dụ đăng nhập/đăng ký/callback được thiết kế public). Mỗi controller/service nhạy cảm vẫn kiểm tra authorization để chống gọi chéo qua API.
- Thực thi role và quyền đối tượng: học sinh chỉ xem attempt của mình; giáo viên chỉ quản lý lớp/assignment do mình sở hữu và học sinh còn quyền; tài liệu cần membership hợp lệ; admin endpoint chỉ admin. Kiểm tra quyền trên từng request, kể cả tải media và export.
- Dùng request/response DTO allowlist; không bind request trực tiếp vào entity. Client không thể tự gán role, trạng thái khóa, owner, entitlement, score, answer key, payment status hoặc timestamps tin cậy.
- Dùng JPA parameter binding/criteria an toàn; không nối input thành query. Whitelist trường sort/filter; giới hạn page size, độ dài, body size và timeout; validate kiểu, range, format ở server.
- Response tối thiểu theo mục đích. Tách đề thi, kết quả, review và admin DTO; ẩn answer key, lời giải, transcript hoặc nội dung VIP đến đúng thời điểm/quyền. Không trả password hash, token, secret hay PII không cần thiết.
- Chống replay/race ở submit, join class, thanh toán, cấp entitlement và thao tác có tính duy nhất bằng transaction, constraint và idempotency key khi phù hợp. Không tin điểm/thời gian từ client.
- Rate limit đăng nhập, đăng ký, reset/OTP, Google auth, lấy media/đề, submit, checkout/IPN và upload; giới hạn theo IP/user/endpoint với response không lộ thông tin. CAPTCHA/bot defense chỉ bật theo rủi ro và UX.
- CORS chỉ allowlist origin triển khai, không dùng wildcard cùng credentials. CORS không phải authorization. Quản lý redirect bằng allowlist đường dẫn/domain nội bộ.

## 5. Bảo vệ trình duyệt và truyền tải

- Production bắt buộc HTTPS/TLS cấu hình an toàn; bật HSTS sau khi toàn bộ hostname/subdomain phù hợp đã chạy HTTPS ổn định. Không bật `includeSubDomains`/`preload` trước khi xác minh miền.
- Cấu hình/kiểm tra headers phù hợp với Spring Security và frontend: CSP (triển khai report-only rồi siết dần), `frame-ancestors`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`; bỏ banner phiên bản server. Chỉ bật COOP/COEP/CORP nếu tương thích với media và tích hợp.
- React auto-escaping là baseline, không dùng `dangerouslySetInnerHTML`/HTML từ user trừ khi sanitize whitelist bằng thư viện duy trì tốt. CSP là lớp bổ sung, không thay cho output encoding.
- Không ghép URL/redirect không tin cậy. Link mở tab mới cần `rel="noopener noreferrer"`. SRI dùng khi tải asset cố định từ CDN bên thứ ba. Trusted Types chỉ cân nhắc nếu có DOM sink phù hợp, không phải yêu cầu mặc định.
- CSRF áp dụng theo cơ chế xác thực thực tế. Giữ `csrf.disable()` chỉ khi xác nhận API stateless và không nhận credential tự động từ browser cookie; thay đổi sang cookie phải thiết kế CSRF trước khi phát hành.

## 6. Upload, media và nội dung

- Định nghĩa allowlist theo mục đích: ảnh/avatar, audio đề, ảnh đề và tài liệu lớp. Kiểm tra phần mở rộng, MIME khai báo, magic bytes và khả năng decode; giới hạn byte, chiều/độ dài audio, kích thước request, số lượng và quota. Không tin filename/MIME client.
- Từ chối SVG/HTML/script nếu không có sanitization chuyên dụng. Đổi filename sang ID do server tạo. Với tài liệu, cân nhắc antivirus/quarantine; phục vụ an toàn với MIME đúng, `nosniff`, `Content-Disposition` phù hợp.
- Lưu ngoài web root hoặc object storage/provider đã cấu hình đúng. Tài nguyên VIP/tài liệu lớp phải private hoặc URL ký thời hạn ngắn và kiểm tra quyền trước khi cấp. Không coi URL khó đoán là quyền truy cập.
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

- `SecurityConfig` hiện disable CSRF, dùng stateless session và `.anyRequest().permitAll()` sau một số route matcher; cần deny-by-default và inventory route rõ. CSRF phụ thuộc có dùng cookie ambient hay không.
- Frontend lưu access token trong `localStorage`; JWT expiration mặc định cấu hình 86,400,000 ms (24 giờ). Refresh/revocation/session management cần được thiết kế và đánh giá.
- Đăng ký cho phép password tối thiểu 6 ký tự; cần xem lại policy và luồng reset/email/MFA.
- Google auth hiện gọi `tokeninfo` bằng cách nối id_token vào URL; cần kiểm tra audience/issuer/email verified và tránh lộ token trong URL/log theo giải pháp xác minh phù hợp.
- Cloudinary upload dùng `resource_type=auto`; validation loại/nội dung file cần rõ hơn. Xóa asset hiện kiểm tra URL bằng chuỗi `contains("cloudinary.com")`; cần kiểm tra hostname chính xác, namespace và ownership.
- Upload request có giới hạn cấu hình nhưng không thay kiểm tra magic bytes, quota hay quyền truy cập media.
- Một số controller có `@PreAuthorize`; cần rà toàn bộ route/method và kiểm thử quyền đối tượng cho mọi API.
- `application.properties` có cấu hình nhạy cảm/defaults cần xử lý theo quy trình secrets; không sao chép giá trị ra tài liệu hay output. Việc rà soát/rotate secret cần tác vụ riêng, không được giả định đã hoàn tất.

## 12. Ngoài phạm vi hiện tại / kích hoạt khi cần

- NoSQL/GraphQL/LDAP/XXE/SSTI, mobile certificate pinning, microphone permission, AI prompt injection chỉ cần khi stack/tính năng tương ứng được đưa vào phạm vi.
- Không bật CSP strict, HSTS preload, COEP hoặc CAPTCHA tùy tiện gây lỗi sản phẩm; triển khai theo môi trường, đo tương thích và có kiểm tra.
- Không tuyên bố “bảo mật tuyệt đối”. Mục tiêu là threat model, kiểm soát có thể kiểm chứng, vận hành liên tục và xử lý sự cố.

## 13. Tài liệu tham chiếu chính

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/): API authorization, cấu hình, tài nguyên và inventory.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
- [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html), [Security Headers](https://docs.spring.io/spring-security/reference/features/exploits/headers.html). Đối chiếu phiên bản dependency của dự án.
- [Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15](https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroup=) và [Nghị định 356/2025/NĐ-CP](https://vanban.chinhphu.vn/?classid=1&docid=216387&pageid=27160), đều hiệu lực 01-01-2026 theo Cổng văn bản Chính phủ.
- Quy trình tích hợp VNPAY phải dùng tài liệu merchant/integration chính thức được cấp cho dự án; không suy diễn tên trường/chữ ký từ bài viết bên thứ ba.
