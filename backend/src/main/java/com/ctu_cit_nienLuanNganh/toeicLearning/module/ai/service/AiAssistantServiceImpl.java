package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Part;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Question;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.UserAnswer;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto.AiChatResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request.AiChatRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestResultRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserAnswerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAssistantServiceImpl implements AiAssistantService {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Pattern QUESTION_NUMBER_PATTERN = Pattern.compile(
            "(?:câu|cau|question|q|#)\\s*(\\d{1,3})\\b",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    private static final Pattern PART_NUMBER_PATTERN = Pattern.compile(
            "part\\s*([1-7])\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern RESULT_PATH_PATTERN = Pattern.compile(
            "/results/([^/?#\\s]+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final String PLATFORM_SYSTEM_PROMPT = """
            Bạn là **Trợ lý AI TOEIC Learning** — cố vấn học tập TOEIC và hướng dẫn viên chính thức của nền tảng luyện thi TOEIC trực tuyến **TOEIC Learning**.
            
            NGUYÊN TẮC PHẢN HỒI:
            1. Luôn trả lời trực tiếp, đúng trọng tâm câu hỏi của người dùng bằng tiếng Việt rõ ràng, thân thiện, mang tính sư phạm cao, trình bày bằng Markdown (dùng tiêu đề ngắn, gạch đầu dòng, in đậm từ khóa quan trọng).
            2. Khi người dùng đang ở trang Xem lại bài thi và hỏi về câu hỏi hoặc đề thi:
               - Trả lời chính xác theo yêu cầu của người dùng (ví dụ: nếu hỏi nội dung/lời thoại/dịch nghĩa thì cung cấp đầy đủ nội dung câu hỏi, phương án A/B/C/D, lời thoại Transcript, bản dịch và giải thích; nếu hỏi tại sao chọn đáp án thì phân tích ngữ pháp/từ khóa và loại trừ các đáp án sai; nếu hỏi từ vựng thì trích lọc từ vựng & collocations trong câu).
               - Luôn đối chiếu **Đáp án đúng** với **Lựa chọn của học viên**.
            3. Khi người dùng hỏi kiến thức TOEIC chung (ví dụ: bài thi TOEIC có bao nhiêu câu, cấu trúc 7 Parts, thang điểm 990, ngữ pháp, từ vựng, mẹo làm bài):
               - Trả lời đầy đủ, chính xác theo chuẩn TOEIC Listening & Reading quốc tế (ETS / IIG): 200 câu hỏi trong 120 phút (Listening 100 câu / 45 phút gồm Part 1: 6 câu mô tả tranh, Part 2: 25 câu hỏi-đáp 3 lựa chọn A/B/C, Part 3: 39 câu hội thoại ngắn, Part 4: 30 câu bài nói ngắn; Reading 100 câu / 75 phút gồm Part 5: 30 câu hoàn thành câu, Part 6: 16 câu hoàn thành đoạn văn, Part 7: 54 câu đọc hiểu đơn/đôi/ba đoạn văn), tổng điểm 10–990.
            4. Khi người dùng hỏi về thông tin trang web hoặc cách sử dụng hệ thống **TOEIC Learning**, hướng dẫn chính xác theo tính năng thực tế:
               - **Kho đề thi (`/courses`)**: Lọc theo `Tất cả`, `Full Test 200 câu`, `Listening Part 1–4`, `Reading Part 5–7`, đề `Miễn phí` và `Đề VIP`.
               - **Chi tiết đề thi (`/courses/:testId`)** gồm 4 tab: *Luyện tập từng phần*, *Làm Full Test (200 câu / 120 phút)*, *Nghe chép chính tả Dictation*, và *Thảo luận*.
               - **Phòng thi tự động lưu phiên (`Resumable Exam Session`)**: Tự động lưu đáp án nháp theo thời gian thực; khi lỡ F5 hoặc rớt mạng sẽ tự khôi phục đúng thời gian và câu đã chọn.
               - **Xem lại bài thi (`/results/:resultId`)**: Xem lại đáp án, Transcript, bản dịch, lời giải, bấm **"Luyện lại câu sai / bỏ trống"** và hỏi Trợ lý AI từng câu.
               - **Hồ sơ cá nhân (`/profile`)**: Theo dõi **Streak**, **Kỷ lục chuỗi ngày học**, **Điểm tích lũy cao nhất (`/ 990`)**, lịch sử làm bài, đổi mật khẩu và lịch sử thanh toán VNPAY.
               - **Đề thi VIP & Lớp học (`/classrooms`)**: Mua đề VIP 1 lần qua VNPAY dùng vĩnh viễn; tham gia Lớp học bằng mã `Join Code` để tải PDF và làm bài tập Giảng viên giao.
            5. Không bao giờ tiết lộ khóa cấu hình, API key hay thông tin nhạy cảm của máy chủ.
            """;

    private final TestResultRepository testResultRepository;
    private final UserAnswerRepository userAnswerRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String geminiApiUrl;

    @Override
    @Transactional(readOnly = true)
    public AiChatResponseDTO chat(User currentUser, AiChatRequest request) {
        String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        if (userMessage.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (userMessage.length() > 2500) {
            userMessage = userMessage.substring(0, 2500);
        }

        // Resolve resultId either from request.resultId or automatically from pageContext (/results/:resultId)
        String resolvedResultId = cleanId(request.getResultId());
        if (resolvedResultId == null && request.getPageContext() != null) {
            Matcher pathMatcher = RESULT_PATH_PATTERN.matcher(request.getPageContext());
            if (pathMatcher.find()) {
                resolvedResultId = cleanId(pathMatcher.group(1));
            }
        }

        TestResult verifiedResult = null;
        List<UserAnswer> resultAnswers = List.of();
        UserAnswer focusedAnswer = null;
        List<UserAnswer> mentionedAnswers = new ArrayList<>();
        String contextMode = "PLATFORM_GUIDE";

        if (resolvedResultId != null && currentUser != null && !Boolean.TRUE.equals(currentUser.getIsLocked())) {
            verifiedResult = loadAuthorizedTestResultSafely(currentUser, resolvedResultId);
            if (verifiedResult != null) {
                resultAnswers = userAnswerRepository.findByTestResultIdWithDetails(verifiedResult.getId());
                mentionedAnswers = resolveMentionedAnswers(resultAnswers, userMessage);
                focusedAnswer = resolveFocusedAnswer(
                        resultAnswers,
                        cleanId(request.getQuestionId()),
                        request.getQuestionNumber(),
                        mentionedAnswers
                );
                contextMode = focusedAnswer != null ? "QUESTION_REVIEW" : "RESULT_OVERVIEW";
            }
        }

        String dynamicContext = buildDynamicContext(
                currentUser,
                verifiedResult,
                resultAnswers,
                focusedAnswer,
                mentionedAnswers,
                request.getPageContext()
        );
        Integer referencedQuestionNum = focusedAnswer != null && focusedAnswer.getQuestion() != null
                ? focusedAnswer.getQuestion().getQuestionNumber()
                : null;

        String aiReply = callGeminiWithFallback(dynamicContext, request.getHistory(), userMessage);
        String source = "GEMINI_AI";

        if (aiReply == null || aiReply.isBlank()) {
            aiReply = buildSmartLocalFallback(userMessage, verifiedResult, resultAnswers, focusedAnswer, mentionedAnswers);
            source = "SMART_TUTOR";
        }

        List<String> followUps = buildSuggestedFollowUps(contextMode, focusedAnswer, verifiedResult);

        return AiChatResponseDTO.builder()
                .reply(aiReply)
                .contextMode(contextMode)
                .referencedQuestionNumber(referencedQuestionNum)
                .suggestedFollowUps(followUps)
                .source(source)
                .build();
    }

    private String cleanId(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || trimmed.length() > 128) return null;
        return trimmed;
    }

    private TestResult loadAuthorizedTestResultSafely(User currentUser, String resultId) {
        Optional<TestResult> opt = testResultRepository.findById(resultId);
        if (opt.isEmpty()) {
            return null;
        }
        TestResult result = opt.get();
        String roleName = currentUser.getRole() != null ? currentUser.getRole().getRoleName() : "ROLE_USER";
        boolean isOwner = result.getUser() != null && currentUser.getId().equals(result.getUser().getId());
        boolean isAdmin = "ROLE_ADMIN".equals(roleName);
        boolean isClassroomTeacher = false;

        Assignment assignment = result.getAssignment();
        if ("ROLE_TEACHER".equals(roleName)
                && assignment != null
                && assignment.getClassroom() != null
                && assignment.getClassroom().getTeacher() != null
                && currentUser.getId().equals(assignment.getClassroom().getTeacher().getId())) {
            isClassroomTeacher = true;
        }

        if (!isOwner && !isAdmin && !isClassroomTeacher) {
            return null;
        }
        return result;
    }

    private List<UserAnswer> resolveMentionedAnswers(List<UserAnswer> answers, String userMessage) {
        if (answers == null || answers.isEmpty() || userMessage == null) {
            return List.of();
        }
        Set<Integer> numbers = new LinkedHashSet<>();
        Matcher matcher = QUESTION_NUMBER_PATTERN.matcher(userMessage);
        while (matcher.find()) {
            try {
                numbers.add(Integer.parseInt(matcher.group(1)));
            } catch (NumberFormatException ignored) {
            }
        }
        if (numbers.isEmpty()) {
            return List.of();
        }
        List<UserAnswer> matched = new ArrayList<>();
        for (Integer num : numbers) {
            for (UserAnswer ua : answers) {
                if (ua.getQuestion() != null
                        && ua.getQuestion().getQuestionNumber() != null
                        && ua.getQuestion().getQuestionNumber().equals(num)) {
                    matched.add(ua);
                    break;
                }
            }
        }
        return matched;
    }

    private UserAnswer resolveFocusedAnswer(
            List<UserAnswer> answers,
            String questionId,
            Integer questionNumber,
            List<UserAnswer> mentionedAnswers
    ) {
        if (answers == null || answers.isEmpty()) {
            return null;
        }
        // If user explicitly mentioned a question number in their text (e.g. "câu 15"), prioritize it!
        if (mentionedAnswers != null && !mentionedAnswers.isEmpty()) {
            return mentionedAnswers.get(0);
        }
        if (questionId != null) {
            for (UserAnswer ua : answers) {
                if (ua.getQuestion() != null && questionId.equals(ua.getQuestion().getId())) {
                    return ua;
                }
            }
        }
        if (questionNumber != null) {
            for (UserAnswer ua : answers) {
                if (ua.getQuestion() != null
                        && ua.getQuestion().getQuestionNumber() != null
                        && ua.getQuestion().getQuestionNumber().equals(questionNumber)) {
                    return ua;
                }
            }
        }
        return null;
    }

    private String buildDynamicContext(
            User currentUser,
            TestResult result,
            List<UserAnswer> answers,
            UserAnswer focusedAnswer,
            List<UserAnswer> mentionedAnswers,
            String pageContext
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("THÔNG TIN NGỮ CẢNH HIỆN TẠI:\n");
        if (currentUser != null) {
            sb.append("- Người dùng đang đăng nhập: ").append(safe(currentUser.getUserName()))
                    .append(" (Streak hiện tại: ").append(currentUser.getCurrentStreak() == null ? 0 : currentUser.getCurrentStreak())
                    .append(" ngày, Kỷ lục Streak: ").append(currentUser.getHighestStreak() == null ? 0 : currentUser.getHighestStreak())
                    .append(" ngày, Điểm cao nhất: ").append(currentUser.getTotalScore() == null ? 0 : currentUser.getTotalScore())
                    .append("/990)\n");
        } else {
            sb.append("- Người dùng: Khách truy cập\n");
        }
        if (pageContext != null && !pageContext.isBlank()) {
            sb.append("- Trang đang mở: ").append(pageContext.trim()).append("\n");
        }

        if (result != null) {
            Test test = result.getTest();
            int correct = result.getCorrectCount() == null ? 0 : result.getCorrectCount();
            int total = result.getTotalCount() == null ? answers.size() : result.getTotalCount();
            int accuracy = total > 0 ? Math.round((correct * 100.0f) / total) : 0;

            sb.append("\n=== DỮ LIỆU BÀI THI ĐÃ HOÀN THÀNH (ĐANG XEM LẠI) ===\n");
            sb.append("- Tên đề thi: ").append(test != null ? safe(test.getTitleTest()) : "Đề thi TOEIC").append("\n");
            sb.append("- Kết quả đúng: ").append(correct).append("/").append(total)
                    .append(" câu (").append(accuracy).append("%)\n");
            if (result.getTotalScore() != null && total == 200) {
                sb.append("- Điểm quy đổi ước tính Full Test: ").append(result.getTotalScore()).append("/990")
                        .append(" (Listening: ").append(result.getListeningScore() == null ? 0 : result.getListeningScore())
                        .append("/495, Reading: ").append(result.getReadingScore() == null ? 0 : result.getReadingScore())
                        .append("/495)\n");
            }
            if (result.getTotalTime() != null) {
                int mins = result.getTotalTime() / 60;
                int secs = result.getTotalTime() % 60;
                sb.append("- Thời gian hoàn thành: ").append(mins).append(" phút ").append(secs).append(" giây\n");
            }
            if (result.getTeacherComment() != null && !result.getTeacherComment().isBlank()) {
                sb.append("- Nhận xét của Giảng viên: ").append(result.getTeacherComment().trim()).append("\n");
            }

            Map<Integer, int[]> partStats = new LinkedHashMap<>();
            List<Integer> wrongNumbers = new ArrayList<>();
            List<Integer> skippedNumbers = new ArrayList<>();

            for (UserAnswer ua : answers) {
                Question q = ua.getQuestion();
                if (q == null) continue;
                int pNum = extractPartNumber(q);
                partStats.computeIfAbsent(pNum, k -> new int[]{0, 0});
                partStats.get(pNum)[1]++;
                if (Boolean.TRUE.equals(ua.getIsCorrect())) {
                    partStats.get(pNum)[0]++;
                } else if (ua.getSelectedAnswer() == null) {
                    if (q.getQuestionNumber() != null) skippedNumbers.add(q.getQuestionNumber());
                } else {
                    if (q.getQuestionNumber() != null) wrongNumbers.add(q.getQuestionNumber());
                }
            }

            if (!partStats.isEmpty()) {
                String partSummary = partStats.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(e -> "Part " + e.getKey() + ": " + e.getValue()[0] + "/" + e.getValue()[1] + " đúng")
                        .collect(Collectors.joining(" | "));
                sb.append("- Thống kê theo từng Part: ").append(partSummary).append("\n");
            }
            if (!wrongNumbers.isEmpty()) {
                sb.append("- Các câu chọn sai (").append(wrongNumbers.size()).append(" câu): ")
                        .append(wrongNumbers.stream().limit(40).map(String::valueOf).collect(Collectors.joining(", ")))
                        .append(wrongNumbers.size() > 40 ? "..." : "").append("\n");
            }
            if (!skippedNumbers.isEmpty()) {
                sb.append("- Các câu bỏ trống (").append(skippedNumbers.size()).append(" câu): ")
                        .append(skippedNumbers.stream().limit(40).map(String::valueOf).collect(Collectors.joining(", ")))
                        .append(skippedNumbers.size() > 40 ? "..." : "").append("\n");
            }
        }

        // Collect all questions to include in detail (focusedAnswer + any additional mentioned questions)
        Set<UserAnswer> detailedTargets = new LinkedHashSet<>();
        if (focusedAnswer != null) {
            detailedTargets.add(focusedAnswer);
        }
        if (mentionedAnswers != null) {
            detailedTargets.addAll(mentionedAnswers);
        }

        for (UserAnswer ua : detailedTargets) {
            appendQuestionDetailContext(sb, ua);
        }

        return sb.toString();
    }

    private void appendQuestionDetailContext(StringBuilder sb, UserAnswer focusedAnswer) {
        if (focusedAnswer == null || focusedAnswer.getQuestion() == null) return;
        Question q = focusedAnswer.getQuestion();
        ContextQuestion ctx = q.getContextQuestion();
        int partNum = extractPartNumber(q);
        Part part = ctx != null ? ctx.getPart() : null;

        sb.append("\n=== CHI TIẾT CÂU HỎI #").append(q.getQuestionNumber()).append(" ===\n");
        sb.append("- Câu số: #").append(q.getQuestionNumber())
                .append(" (Part ").append(partNum)
                .append(part != null && part.getNamePart() != null ? " - " + part.getNamePart() : "")
                .append(")\n");
        String status = Boolean.TRUE.equals(focusedAnswer.getIsCorrect())
                ? "Học viên trả lời ĐÚNG"
                : (focusedAnswer.getSelectedAnswer() == null ? "Học viên BỎ TRỐNG chưa chọn" : "Học viên trả lời CHƯA ĐÚNG");
        sb.append("- Trạng thái làm bài: ").append(status).append("\n");
        sb.append("- Đáp án học viên đã chọn: ")
                .append(focusedAnswer.getSelectedAnswer() != null ? focusedAnswer.getSelectedAnswer() : "(Bỏ trống)")
                .append("\n");
        sb.append("- ĐÁP ÁN ĐÚNG CỦA HỆ THỐNG: ")
                .append(q.getCorrectAnswer() != '\0' ? q.getCorrectAnswer() : "N/A")
                .append("\n");

        if (ctx != null) {
            if (ctx.getParagraph() != null && !ctx.getParagraph().isBlank()) {
                sb.append("- Đoạn văn đọc hiểu (Passage / Paragraph):\n\"\"\"\n")
                        .append(ctx.getParagraph().trim()).append("\n\"\"\"\n");
            }
            if (ctx.getTranscript() != null && !ctx.getTranscript().isBlank()) {
                sb.append("- Lời thoại âm thanh (Audio Transcript):\n\"\"\"\n")
                        .append(ctx.getTranscript().trim()).append("\n\"\"\"\n");
            }
            if (ctx.getTranslation() != null && !ctx.getTranslation().isBlank()) {
                sb.append("- Bản dịch tiếng Việt của đoạn/bài:\n\"\"\"\n")
                        .append(ctx.getTranslation().trim()).append("\n\"\"\"\n");
            }
        }

        if (q.getQuestionContent() != null && !q.getQuestionContent().isBlank()) {
            sb.append("- Nội dung câu hỏi (Question Stem): ").append(q.getQuestionContent().trim()).append("\n");
        } else if (partNum == 6) {
            sb.append("- Nội dung câu hỏi: Điền vào chỗ trống số (").append(q.getQuestionNumber()).append(") trong đoạn văn Part 6 ở trên.\n");
        } else if (partNum == 1) {
            sb.append("- Nội dung câu hỏi: Câu mô tả tranh (Part 1) — nghe 4 đáp án A, B, C, D và chọn câu mô tả đúng nhất bức hình.\n");
        } else if (partNum == 2) {
            sb.append("- Nội dung câu hỏi: Câu hỏi - Đáp (Part 2) — nghe câu hỏi/câu nói trong Audio và chọn lời hồi đáp tự nhiên, chính xác nhất trong 3 lựa chọn A, B, C.\n");
        }

        sb.append("- Các phương án lựa chọn:\n");
        sb.append("  + A: ").append(safeOption(q.getOptionA(), "A")).append("\n");
        sb.append("  + B: ").append(safeOption(q.getOptionB(), "B")).append("\n");
        sb.append("  + C: ").append(safeOption(q.getOptionC(), "C")).append("\n");
        if (partNum != 2 || (q.getOptionD() != null && !q.getOptionD().isBlank())) {
            sb.append("  + D: ").append(safeOption(q.getOptionD(), "D")).append("\n");
        }

        if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
            sb.append("- Lời giải thích gốc trong ngân hàng đề:\n\"\"\"\n")
                    .append(q.getExplanation().trim()).append("\n\"\"\"\n");
        }
    }

    private String callGeminiWithFallback(
            String dynamicContext,
            List<AiChatRequest.HistoryMessage> history,
            String userMessage
    ) {
        String effectiveKey = resolveEffectiveGeminiKey();
        String effectiveUrl = resolveEffectiveGeminiUrl();
        if (effectiveKey == null || effectiveKey.isBlank() || effectiveUrl == null || effectiveUrl.isBlank()) {
            return null;
        }

        String trimmedKey = effectiveKey.trim();
        String primaryUrl = effectiveUrl.trim();
        List<String> candidateUrls = new ArrayList<>();

        // Keys starting with "AQ." are Google Cloud Vertex AI Express Mode keys
        if (trimmedKey.startsWith("AQ.")) {
            candidateUrls.add("https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent");
            candidateUrls.add("https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.0-flash:generateContent");
            candidateUrls.add(primaryUrl);
        } else {
            candidateUrls.add(primaryUrl);
            if (primaryUrl.contains("gemini-2.5-flash")) {
                candidateUrls.add(primaryUrl.replace("gemini-2.5-flash", "gemini-2.0-flash"));
            }
            candidateUrls.add("https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent");
        }

        for (String endpointUrl : candidateUrls) {
            try {
                String responseText = invokeGeminiEndpoint(endpointUrl, trimmedKey, dynamicContext, history, userMessage);
                if (responseText != null && !responseText.isBlank()) {
                    return responseText.trim();
                }
            } catch (Exception ex) {
                log.debug("Gemini endpoint {} skipped: {}", sanitizeUrl(endpointUrl), ex.getMessage());
            }
        }
        return null;
    }

    private String resolveEffectiveGeminiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            return geminiApiKey.trim();
        }
        return readDotEnvValue("GEMINI_API_KEY");
    }

    private String resolveEffectiveGeminiUrl() {
        String fromDotEnv = readDotEnvValue("GEMINI_API_URL");
        if (fromDotEnv != null && !fromDotEnv.isBlank()) {
            return fromDotEnv.trim();
        }
        if (geminiApiUrl != null && !geminiApiUrl.isBlank()) {
            return geminiApiUrl.trim();
        }
        return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    private String readDotEnvValue(String targetKey) {
        java.nio.file.Path[] candidates = new java.nio.file.Path[]{
                java.nio.file.Paths.get(".env"),
                java.nio.file.Paths.get("backend", ".env")
        };
        for (java.nio.file.Path path : candidates) {
            try {
                if (java.nio.file.Files.isRegularFile(path)) {
                    for (String rawLine : java.nio.file.Files.readAllLines(path, StandardCharsets.UTF_8)) {
                        String line = rawLine.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx <= 0) {
                            continue;
                        }
                        String k = line.substring(0, eqIdx).trim();
                        if (targetKey.equals(k)) {
                            String v = line.substring(eqIdx + 1).trim();
                            if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
                                v = v.substring(1, v.length() - 1).trim();
                            }
                            if (!v.isEmpty()) {
                                return v;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                // Ignore file read errors and try next candidate
            }
        }
        return null;
    }

    private String invokeGeminiEndpoint(
            String endpointUrl,
            String apiKey,
            String dynamicContext,
            List<AiChatRequest.HistoryMessage> history,
            String userMessage
    ) throws Exception {
        ObjectNode root = JSON.createObjectNode();

        // Use camelCase systemInstruction with role="system", supported by both Vertex AI and Google AI Studio
        ObjectNode systemInstruction = root.putObject("systemInstruction");
        systemInstruction.put("role", "system");
        ArrayNode sysParts = systemInstruction.putArray("parts");
        sysParts.addObject().put("text", PLATFORM_SYSTEM_PROMPT + "\n\n" + dynamicContext);

        // contents (conversation history + current user message)
        ArrayNode contents = root.putArray("contents");
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                AiChatRequest.HistoryMessage item = history.get(i);
                if (item == null || item.getContent() == null || item.getContent().isBlank()) {
                    continue;
                }
                String contentText = item.getContent().trim();
                if (contentText.length() > 2000) {
                    contentText = contentText.substring(0, 2000);
                }
                String role = "assistant".equalsIgnoreCase(item.getRole()) || "model".equalsIgnoreCase(item.getRole())
                        ? "model"
                        : "user";
                ObjectNode msgNode = contents.addObject();
                msgNode.put("role", role);
                msgNode.putArray("parts").addObject().put("text", contentText);
            }
        }

        ObjectNode currentMsg = contents.addObject();
        currentMsg.put("role", "user");
        currentMsg.putArray("parts").addObject().put("text", userMessage);

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("temperature", 0.35);
        generationConfig.put("maxOutputTokens", 2048);

        String requestBody = JSON.writeValueAsString(root);

        String fullUrl = endpointUrl.contains("key=")
                ? endpointUrl
                : endpointUrl + (endpointUrl.contains("?") ? "&" : "?")
                  + "key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                .uri(URI.create(fullUrl))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json; charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8));

        if (!apiKey.startsWith("AQ.")) {
            reqBuilder.header("x-goog-api-key", apiKey);
        }

        HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            return null;
        }

        JsonNode respJson = JSON.readTree(response.body());
        JsonNode candidates = respJson.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                StringBuilder replyBuilder = new StringBuilder();
                for (JsonNode part : parts) {
                    String text = part.path("text").asText("");
                    if (!text.isEmpty()) {
                        replyBuilder.append(text);
                    }
                }
                return replyBuilder.toString();
            }
        }
        return null;
    }

    /**
     * Comprehensive, intelligent local tutor engine that answers any question about:
     * 1) Specific questions in the completed exam (content, transcript, translation, why correct, vocabulary, grammar, tips)
     * 2) Overall exam performance, Part-by-Part breakdown, and wrong answers in any Part
     * 3) General TOEIC knowledge (exam format, 200 questions, 7 Parts, scoring 10-990, grammar/vocab tips)
     * 4) Website features and usage instructions
     */
    private String buildSmartLocalFallback(
            String userMessage,
            TestResult result,
            List<UserAnswer> answers,
            UserAnswer focusedAnswer,
            List<UserAnswer> mentionedAnswers
    ) {
        String lower = userMessage.toLowerCase(Locale.ROOT);

        // 1. If the user is asking about a specific question (or multiple questions) in the completed exam
        if (focusedAnswer != null && focusedAnswer.getQuestion() != null) {
            if (mentionedAnswers != null && mentionedAnswers.size() > 1) {
                StringBuilder multiSb = new StringBuilder();
                for (UserAnswer ua : mentionedAnswers) {
                    multiSb.append(buildDetailedQuestionResponse(ua, lower)).append("\n\n---\n\n");
                }
                return multiSb.toString().trim();
            }
            return buildDetailedQuestionResponse(focusedAnswer, lower);
        }

        // 2. If the user is on the exam result page and asks about a specific Part (e.g. "Part 2", "câu sai Part 5")
        if (result != null && !answers.isEmpty()) {
            Matcher partMatcher = PART_NUMBER_PATTERN.matcher(userMessage);
            if (partMatcher.find()) {
                int targetPart = Integer.parseInt(partMatcher.group(1));
                List<UserAnswer> partAnswers = answers.stream()
                        .filter(ua -> ua.getQuestion() != null && extractPartNumber(ua.getQuestion()) == targetPart)
                        .toList();
                if (!partAnswers.isEmpty()) {
                    return buildPartReviewSummary(targetPart, partAnswers);
                }
            }

            // If user asks "nội dung câu này", "giải thích câu này", "tại sao sai" without selecting a question yet
            if (lower.contains("câu này") || lower.contains("cau nay") || lower.contains("giải thích câu")
                    || lower.contains("đáp án câu") || lower.contains("dịch câu")) {
                UserAnswer firstWrongOrFirst = answers.stream()
                        .filter(ua -> !Boolean.TRUE.equals(ua.getIsCorrect()))
                        .findFirst()
                        .orElse(answers.get(0));
                return buildDetailedQuestionResponse(firstWrongOrFirst, lower)
                        + "\n\n> *Mẹo: Bạn có thể chọn bất kỳ câu hỏi nào ở thanh **\"Ngữ cảnh đang hỏi\"** phía trên hoặc gõ trực tiếp số câu (ví dụ: **\"Giải thích câu 8\"**, **\"Nội dung câu 15\"**) để mình giải thích ngay câu đó nhé!*";
            }

            // If asking about the exam result / score / wrong questions / overview
            if (lower.contains("kết quả") || lower.contains("điểm") || lower.contains("nhận xét")
                    || lower.contains("phân tích") || lower.contains("yếu") || lower.contains("cải thiện")
                    || lower.contains("sai") || lower.contains("bài thi này") || lower.contains("đề này")
                    || lower.contains("tóm tắt") || lower.contains("lộ trình")) {
                return buildExamOverviewResponse(result, answers);
            }
        }

        // 3. General TOEIC knowledge questions (e.g. "bài thi toeic bao nhiêu câu hỏi nhỉ", "cấu trúc đề toeic", "thang điểm")
        if ((lower.contains("toeic") || lower.contains("bài thi") || lower.contains("đề thi") || lower.contains("part"))
                && (lower.contains("bao nhiêu câu") || lower.contains("mấy câu") || lower.contains("cấu trúc")
                || lower.contains("thời gian") || lower.contains("bao lâu") || lower.contains("mấy phần")
                || lower.contains("mấy part") || lower.contains("format"))) {
            return """
                    ### Cấu trúc Bài thi TOEIC Listening & Reading Chuẩn Quốc tế (ETS / IIG)
                    
                    Bài thi **TOEIC 2 kỹ năng (Listening & Reading)** gồm tổng cộng **200 câu hỏi trắc nghiệm**, làm trong **120 phút** (2 giờ), chia thành **2 phần lớn (7 Parts)**:
                    
                    #### 1. Phần Nghe hiểu — Listening (100 câu · 45 phút)
                    - **Part 1 — Mô tả tranh (Photographs):** **6 câu** (Câu 1–6). Nghe 4 câu mô tả A, B, C, D cho mỗi bức ảnh và chọn câu đúng nhất.
                    - **Part 2 — Hỏi - Đáp (Question - Response):** **25 câu** (Câu 7–31). Nghe 1 câu hỏi/câu nói và chọn câu trả lời phù hợp nhất trong **3 phương án A, B, C**.
                    - **Part 3 — Hội thoại ngắn (Conversations):** **39 câu** (Câu 32–70, gồm 13 đoạn hội thoại × 3 câu hỏi).
                    - **Part 4 — Bài nói ngắn (Talks):** **30 câu** (Câu 71–100, gồm 10 bài nói độc thoại × 3 câu hỏi).
                    
                    #### 2. Phần Đọc hiểu — Reading (100 câu · 75 phút)
                    - **Part 5 — Hoàn thành câu (Incomplete Sentences):** **30 câu** (Câu 101–130). Chọn từ/cụm từ điền vào chỗ trống (ngữ pháp & từ vựng).
                    - **Part 6 — Hoàn thành đoạn văn (Text Completion):** **16 câu** (Câu 131–146, gồm 4 đoạn văn × 4 câu hỏi).
                    - **Part 7 — Đọc hiểu đoạn văn (Reading Comprehension):** **54 câu** (Câu 147–200), gồm:
                      + *Đoạn đơn (Single Passages):* 29 câu (Câu 147–175, 10 bài đọc).
                      + *Đoạn đôi (Double Passages):* 10 câu (Câu 176–185, 2 cụm bài đọc).
                      + *Đoạn ba (Triple Passages):* 15 câu (Câu 186–200, 3 cụm bài đọc).
                    
                    #### 3. Thang điểm TOEIC
                    - **Listening:** `5 – 495` điểm.
                    - **Reading:** `5 – 495` điểm.
                    - **Tổng điểm toàn bài:** **`10 – 990` điểm**.
                    """;
        }

        if (lower.contains("tính điểm") || lower.contains("thang điểm") || lower.contains("quy đổi") || lower.contains("990")) {
            return """
                    ### Cách tính điểm TOEIC trên hệ thống TOEIC Learning
                    
                    - **Khi làm Full Test (đủ 200 câu):**
                      + Hệ thống chấm số câu đúng riêng cho **Listening (100 câu, Part 1–4)** và **Reading (100 câu, Part 5–7)**.
                      + Điểm mỗi kỹ năng được quy đổi sang thang **`5 – 495` điểm**, cộng lại thành **Tổng điểm ước tính `10 – 990` điểm** (`ESTIMATED_TOEIC`).
                      + *Lưu ý:* Đây là điểm quy đổi ước tính phục vụ tham khảo luyện tập, giúp bạn theo dõi sát năng lực hiện tại.
                    - **Khi luyện tập từng Part (dưới 200 câu):**
                      + Hệ thống hiển thị trực tiếp **số câu trả lời đúng thực tế (`RAW_COUNT`)** trên tổng số câu đã làm cùng tỷ lệ chính xác `%`.
                    - **Điểm tích lũy cao nhất & Chuỗi ngày học (Streak):**
                      + Mốc điểm Full Test cao nhất bạn đạt được sẽ được lưu làm **Điểm tích lũy cao nhất (`/ 990`)** trên trang **Hồ sơ cá nhân (`/profile`)**.
                    """;
        }

        if (lower.contains("dictation") || lower.contains("chép chính tả")) {
            return """
                    ### Hướng dẫn Luyện nghe Chép chính tả (Dictation)
                    
                    Tính năng **Chép chính tả (`/courses/:testId/dictation`)** giúp bạn luyện nghe sâu từng câu/đoạn thuộc phần **Listening (Part 1–4)**:
                    - **Cách sử dụng:** Vào trang Chi tiết đề thi (`/courses/:testId`) -> Chọn tab **Chép chính tả** -> Chọn Part muốn luyện.
                    - **Kiểm tra theo từng vế câu:** Hệ thống tự động tách lời thoại theo dấu câu (`.`, `,`, `;`, `?`, `!`) và che các từ phía sau bằng `*****` để bạn tập trung nghe từng cụm.
                    - **Phím tắt tiện lợi:**
                      + Nhấn **`Enter`** (hoặc **`Ctrl + Enter`**) hoặc bấm **"Kiểm tra kết quả"** để đối chiếu những từ vừa gõ.
                      + Khi bạn gõ tiếp vào ô nhập liệu, khung kết quả tự động ẩn đi để bạn liền mạch hoàn thiện câu.
                    - **Điều khiển âm thanh:** Hỗ trợ chỉnh tốc độ phát từ **`0.5x` đến `2.0x`**, nghe lại từng câu và xem lời thoại (`Transcript`) + bản dịch (`Translation`).
                    """;
        }

        if (lower.contains("vip") || lower.contains("vnpay") || lower.contains("thanh toán") || lower.contains("mua đề")) {
            return """
                    ### Đề thi VIP & Thanh toán trực tuyến VNPAY
                    
                    - **Quyền lợi Đề VIP:** Các bộ đề gắn nhãn **VIP** là đề tuyển chọn chất lượng cao kèm đầy đủ âm thanh, hình ảnh, lời thoại (`Transcript`), bản dịch và giải thích chi tiết.
                    - **Mua 1 lần — Sở hữu vĩnh viễn:** Mỗi đề VIP có mức giá VND riêng. Bạn chỉ cần thanh toán **1 lần duy nhất** qua cổng **VNPAY** để mở khóa vĩnh viễn mọi chế độ của đề đó (Full Test, Luyện từng Part, Chép chính tả Dictation, Xem lại lời giải).
                    - **Tra cứu giao dịch:** Bạn có thể xem lại toàn bộ biên nhận và trạng thái giao dịch tại mục **Hồ sơ cá nhân (`/profile?tab=payments`)**.
                    """;
        }

        if (lower.contains("lớp học") || lower.contains("classroom") || lower.contains("join code") || lower.contains("mã tham gia") || lower.contains("giáo viên") || lower.contains("teacher")) {
            return """
                    ### Hệ thống Lớp học (`Classrooms`) & Đăng ký Giáo viên
                    
                    - **Dành cho Học viên (`/classrooms`):**
                      + Nhập **Mã tham gia lớp (Join Code)** do Giảng viên cung cấp để gửi yêu cầu vào lớp.
                      + Sau khi Giảng viên duyệt (`APPROVED`), bạn có thể tải **tài liệu PDF bài giảng** riêng của lớp, làm các **Bài tập (`Assignments`)** theo hạn nộp và xem **nhận xét chấm bài** trực tiếp từ Giảng viên.
                    - **Đăng ký trở thành Giáo viên (`/teacher/application`):**
                      + Vào trang **Đăng ký Giáo viên**, điền thông tin năng lực/chứng chỉ và hoàn tất lệ phí xét duyệt qua **VNPAY**.
                      + Sau khi thanh toán xác nhận, hồ sơ chuyển sang trạng thái chờ **Quản trị viên (`Admin`)** phê duyệt để được cấp quyền **Giáo viên TOEIC** (tạo lớp học, tải tài liệu PDF, tạo đề riêng và giao bài tập).
                    """;
        }

        if (lower.contains("streak") || lower.contains("chuỗi ngày") || lower.contains("kỷ lục") || lower.contains("hồ sơ") || lower.contains("mật khẩu")) {
            return """
                    ### Chuỗi ngày học (Streak), Kỷ lục & Quản lý Hồ sơ (`/profile`)
                    
                    - **Chuỗi ngày học (`Streak`):** Tăng thêm `+1 ngày` mỗi khi bạn hoàn thành ít nhất một bài thi hoặc bài luyện tập trong ngày tiếp theo liên tiếp. Nếu nghỉ quá 1 ngày không làm bài, chuỗi sẽ bắt đầu lại từ `1` khi bạn quay lại học.
                    - **Kỷ lục cá nhân (`Highest Streak`):** Lưu giữ mốc chuỗi ngày học liên tiếp dài nhất bạn từng đạt được.
                    - **Quản lý tài khoản (`/profile`):**
                      + Cập nhật họ tên, số điện thoại, email và tải ảnh đại diện (PNG/JPEG tối đa 5 MB).
                      + Đổi mật khẩu bảo mật (hoặc thiết lập mật khẩu cục bộ nếu bạn đăng nhập bằng Google).
                      + Xem lại toàn bộ **Lịch sử làm bài** (`?tab=history`) và **Lịch sử thanh toán** (`?tab=payments`).
                    """;
        }

        // If user is currently on a result page and asks anything else, give them a contextual result guide + overview
        if (result != null && !answers.isEmpty()) {
            return buildExamOverviewResponse(result, answers);
        }

        return """
                ### Chào bạn! Mình là Trợ lý AI TOEIC Learning
                
                Mình có thể giải đáp trực tiếp cho bạn các nội dung sau:
                
                1. **Khi xem lại kết quả bài thi (`/results/:resultId`):**
                   - Giải thích chi tiết **bất kỳ câu hỏi nào từ Câu #1 đến #200** (nội dung câu hỏi, lời thoại `Transcript`, bản dịch, phân tích ngữ pháp, từ vựng và lý do chọn/loại trừ đáp án).
                   - Phân tích điểm mạnh/yếu theo từng **Part 1 – Part 7** và gợi ý lộ trình ôn tập.
                2. **Kiến thức luyện thi TOEIC:**
                   - Cấu trúc đề thi TOEIC 200 câu (120 phút), cách quy đổi điểm `10–990`, mẹo làm bài và tránh bẫy ETS cho từng Part.
                3. **Hướng dẫn sử dụng trang web TOEIC Learning:**
                   - Cách làm **Full Test**, **Luyện từng Part**, **Luyện lại câu sai**, **Nghe chép chính tả (`Dictation`)**, mua **Đề VIP qua VNPAY**, tham gia **Lớp học (`Classrooms`)**, đăng ký **Giáo viên** và duy trì **Streak**.
                
                *Bạn hãy nhập câu hỏi cụ thể hoặc chọn một chủ đề gợi ý bên dưới để mình hỗ trợ ngay nhé!*
                """;
    }

    private String buildDetailedQuestionResponse(UserAnswer ua, String lowerQuery) {
        Question q = ua.getQuestion();
        ContextQuestion ctx = q.getContextQuestion();
        int partNum = extractPartNumber(q);
        char correctKey = q.getCorrectAnswer() != '\0' ? Character.toUpperCase(q.getCorrectAnswer()) : '?';
        Character selectedKey = ua.getSelectedAnswer() != null
                ? Character.toUpperCase(ua.getSelectedAnswer())
                : null;

        boolean askingVocabOrGrammar = lowerQuery.contains("từ vựng") || lowerQuery.contains("vocab")
                || lowerQuery.contains("ngữ pháp") || lowerQuery.contains("cấu trúc") || lowerQuery.contains("collocation");
        boolean askingTrapOrTip = lowerQuery.contains("bẫy") || lowerQuery.contains("mẹo") || lowerQuery.contains("tip")
                || lowerQuery.contains("cách làm");

        StringBuilder sb = new StringBuilder();
        sb.append("### Giải đáp Câu #").append(q.getQuestionNumber()).append(" · Part ").append(partNum).append("\n\n");

        // 1. Status & Answer comparison
        if (Boolean.TRUE.equals(ua.getIsCorrect())) {
            sb.append("- **Trạng thái làm bài:** Bạn đã trả lời **ĐÚNG** (Chọn **").append(correctKey).append("**).\n");
        } else if (selectedKey == null) {
            sb.append("- **Trạng thái làm bài:** Bạn đang **BỎ TRỐNG** câu này · **Đáp án đúng là: ").append(correctKey).append("**.\n");
        } else {
            sb.append("- **Trạng thái làm bài:** Bạn đã chọn **").append(selectedKey)
                    .append("** (Chưa đúng) · **Đáp án đúng là: ").append(correctKey).append("**.\n");
        }

        // 2. Question content / Transcript / Passage & Options
        sb.append("\n#### 1. Nội dung câu hỏi & Các phương án\n");
        if (q.getQuestionContent() != null && !q.getQuestionContent().isBlank()) {
            sb.append("- **Câu hỏi (Question):** ").append(q.getQuestionContent().trim()).append("\n");
        } else if (partNum == 2) {
            sb.append("- **Dạng câu hỏi:** Nghe câu hỏi/phát biểu trong băng (Part 2 — Question-Response) và chọn lời hồi đáp đúng nhất trong 3 phương án A, B, C.\n");
        } else if (partNum == 1) {
            sb.append("- **Dạng câu hỏi:** Nghe 4 câu mô tả A, B, C, D (Part 1 — Photographs) và chọn câu mô tả đúng nhất bức tranh.\n");
        } else if (partNum == 6) {
            sb.append("- **Dạng câu hỏi:** Chọn từ/câu điền vào vị trí trống **(").append(q.getQuestionNumber()).append(")** trong đoạn văn Part 6.\n");
        }

        if (ctx != null && ctx.getTranscript() != null && !ctx.getTranscript().isBlank()) {
            sb.append("- **Lời thoại âm thanh (Transcript):**\n> ")
                    .append(ctx.getTranscript().trim().replace("\n", "\n> ")).append("\n");
        }
        if (ctx != null && ctx.getParagraph() != null && !ctx.getParagraph().isBlank()) {
            String passagePreview = ctx.getParagraph().trim();
            if (passagePreview.length() > 700) {
                passagePreview = passagePreview.substring(0, 700) + "...";
            }
            sb.append("- **Đoạn văn (Passage):**\n> ")
                    .append(passagePreview.replace("\n", "\n> ")).append("\n");
        }

        boolean hasRealOptionText = hasNonPlaceholderOptions(q);
        if (hasRealOptionText) {
            sb.append("- **Các lựa chọn:**\n");
            sb.append("  + **A.** ").append(safeOption(q.getOptionA(), "A"))
                    .append(correctKey == 'A' ? " *(Đáp án đúng)*" : (selectedKey != null && selectedKey == 'A' ? " *(Bạn chọn)*" : "")).append("\n");
            sb.append("  + **B.** ").append(safeOption(q.getOptionB(), "B"))
                    .append(correctKey == 'B' ? " *(Đáp án đúng)*" : (selectedKey != null && selectedKey == 'B' ? " *(Bạn chọn)*" : "")).append("\n");
            sb.append("  + **C.** ").append(safeOption(q.getOptionC(), "C"))
                    .append(correctKey == 'C' ? " *(Đáp án đúng)*" : (selectedKey != null && selectedKey == 'C' ? " *(Bạn chọn)*" : "")).append("\n");
            if (partNum != 2 || (q.getOptionD() != null && !q.getOptionD().isBlank())) {
                sb.append("  + **D.** ").append(safeOption(q.getOptionD(), "D"))
                        .append(correctKey == 'D' ? " *(Đáp án đúng)*" : (selectedKey != null && selectedKey == 'D' ? " *(Bạn chọn)*" : "")).append("\n");
            }
        }

        // 3. Detailed Explanation & Translation
        sb.append("\n#### 2. Giải thích chi tiết & Dịch nghĩa\n");
        if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
            sb.append(q.getExplanation().trim()).append("\n");
        } else {
            sb.append("Phương án **").append(correctKey).append("** là đáp án chính xác nhất vì phản hồi đúng trọng tâm ngữ cảnh và cấu trúc của **Part ").append(partNum).append("**. Các phương án còn lại bị loại do sai ngữ nghĩa hoặc rơi vào bẫy từ đồng âm/lạc chủ đề.\n");
        }

        if (ctx != null && ctx.getTranslation() != null && !ctx.getTranslation().isBlank()) {
            sb.append("\n- **Bản dịch tiếng Việt:**\n> ")
                    .append(ctx.getTranslation().trim().replace("\n", "\n> ")).append("\n");
        }

        // 4. Grammar / Vocabulary or Exam Traps tailored to what user clicked
        if (askingVocabOrGrammar) {
            sb.append("\n#### 3. Điểm Ngữ pháp & Từ vựng trọng tâm (Part ").append(partNum).append(")\n");
            sb.append(getPartGrammarAndVocabGuide(partNum, q, ctx));
        } else if (askingTrapOrTip) {
            sb.append("\n#### 3. Các bẫy ETS thường gặp & Mẹo giải nhanh (Part ").append(partNum).append(")\n");
            sb.append("- **Mẹo cốt lõi:** ").append(getPartTip(partNum)).append("\n");
            sb.append(getPartTrapGuide(partNum));
        } else {
            sb.append("\n#### 3. Mẹo làm bài nhanh Part ").append(partNum).append("\n");
            sb.append("- ").append(getPartTip(partNum));
        }

        return sb.toString();
    }

    private String buildPartReviewSummary(int partNum, List<UserAnswer> partAnswers) {
        long correctCount = partAnswers.stream().filter(ua -> Boolean.TRUE.equals(ua.getIsCorrect())).count();
        int total = partAnswers.size();
        int pct = total > 0 ? Math.round((correctCount * 100.0f) / total) : 0;
        List<UserAnswer> wrongInPart = partAnswers.stream()
                .filter(ua -> !Boolean.TRUE.equals(ua.getIsCorrect()))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("### Phân tích Kết quả Part ").append(partNum).append("\n\n");
        sb.append("- **Tỷ lệ chính xác Part ").append(partNum).append(":** **")
                .append(correctCount).append(" / ").append(total).append(" câu đúng (").append(pct).append("%)**\n");

        if (wrongInPart.isEmpty()) {
            sb.append("- **Đánh giá:** Xuất sắc! Bạn đã trả lời đúng tuyệt đối toàn bộ các câu trong **Part ").append(partNum).append("**.\n");
        } else {
            String wrongNums = wrongInPart.stream()
                    .map(ua -> "#" + ua.getQuestion().getQuestionNumber()
                            + " (Đúng: " + ua.getQuestion().getCorrectAnswer()
                            + ", Bạn chọn: " + (ua.getSelectedAnswer() == null ? "Bỏ trống" : ua.getSelectedAnswer()) + ")")
                    .limit(12)
                    .collect(Collectors.joining("; "));
            sb.append("- **Các câu chưa đúng trong Part ").append(partNum).append(" (").append(wrongInPart.size()).append(" câu):** ")
                    .append(wrongNums).append(wrongInPart.size() > 12 ? "..." : "").append("\n");

            UserAnswer sampleWrong = wrongInPart.get(0);
            sb.append("\n#### Xem nhanh câu cần lưu ý đầu tiên trong Part ").append(partNum).append("\n");
            sb.append(buildDetailedQuestionResponse(sampleWrong, ""));
        }
        return sb.toString();
    }

    private String buildExamOverviewResponse(TestResult result, List<UserAnswer> answers) {
        int correct = result.getCorrectCount() == null ? 0 : result.getCorrectCount();
        int total = result.getTotalCount() == null ? answers.size() : result.getTotalCount();
        int accuracy = total > 0 ? Math.round((correct * 100.0f) / total) : 0;

        StringBuilder sb = new StringBuilder();
        sb.append("### Phân tích Tổng quan Kết quả Bài làm\n\n");
        sb.append("- **Đề thi:** ").append(result.getTest() != null ? safe(result.getTest().getTitleTest()) : "Đề thi TOEIC").append("\n");
        sb.append("- **Số câu đúng:** **").append(correct).append(" / ").append(total)
                .append(" câu** (Độ chính xác: **").append(accuracy).append("%**)\n");
        if (result.getTotalScore() != null && total == 200) {
            sb.append("- **Điểm quy đổi ước tính:** **").append(result.getTotalScore()).append(" / 990** ")
                    .append("(Listening: **").append(result.getListeningScore()).append("**, Reading: **").append(result.getReadingScore()).append("**)\n");
        }

        Map<Integer, int[]> partStats = new LinkedHashMap<>();
        List<Integer> wrongList = new ArrayList<>();
        for (UserAnswer ua : answers) {
            if (ua.getQuestion() == null) continue;
            int pNum = extractPartNumber(ua.getQuestion());
            partStats.computeIfAbsent(pNum, k -> new int[]{0, 0});
            partStats.get(pNum)[1]++;
            if (Boolean.TRUE.equals(ua.getIsCorrect())) {
                partStats.get(pNum)[0]++;
            } else if (ua.getQuestion().getQuestionNumber() != null) {
                wrongList.add(ua.getQuestion().getQuestionNumber());
            }
        }

        if (!partStats.isEmpty()) {
            sb.append("\n#### Thống kê theo từng Part\n");
            Optional<Map.Entry<Integer, int[]>> weakestPart = partStats.entrySet().stream()
                    .filter(e -> e.getValue()[1] > 0)
                    .min(Comparator.comparingDouble(e -> (double) e.getValue()[0] / e.getValue()[1]));

            for (Map.Entry<Integer, int[]> entry : partStats.entrySet()) {
                int p = entry.getKey();
                int c = entry.getValue()[0];
                int t = entry.getValue()[1];
                int pct = t > 0 ? Math.round((c * 100.0f) / t) : 0;
                sb.append("- **Part ").append(p).append(":** ").append(c).append("/").append(t)
                        .append(" câu đúng (**").append(pct).append("%**)\n");
            }

            if (!wrongList.isEmpty()) {
                sb.append("\n- **Danh sách câu sai / bỏ trống (").append(wrongList.size()).append(" câu):** ")
                        .append(wrongList.stream().limit(25).map(n -> "Câu #" + n).collect(Collectors.joining(", ")))
                        .append(wrongList.size() > 25 ? "..." : "").append("\n");
            }

            if (weakestPart.isPresent()) {
                int wp = weakestPart.get().getKey();
                sb.append("\n#### Lộ trình cải thiện đề xuất\n");
                sb.append("1. **Trọng tâm ôn tập Part ").append(wp).append(":** ").append(getPartTip(wp)).append("\n");
                sb.append("2. **Hỏi chi tiết từng câu trong đề này:** Bạn có thể chọn bất kỳ câu nào ở thanh **\"Ngữ cảnh đang hỏi\"** phía trên hoặc gõ trực tiếp số câu (ví dụ: *\"Giải thích câu ")
                        .append(wrongList.isEmpty() ? 1 : wrongList.get(0))
                        .append("\"* hay *\"Nội dung câu ").append(wrongList.isEmpty() ? 2 : wrongList.get(0)).append("\"*) để mình phân tích sâu câu đó ngay lập tức!");
            }
        }
        return sb.toString();
    }

    private boolean hasNonPlaceholderOptions(Question q) {
        for (String opt : new String[]{q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()}) {
            if (opt != null && !opt.isBlank()) {
                String t = opt.trim();
                if (!t.matches("^\\(?[A-Da-d]\\)?\\.?$")) {
                    return true;
                }
            }
        }
        return false;
    }

    private String getPartGrammarAndVocabGuide(int partNumber, Question q, ContextQuestion ctx) {
        StringBuilder sb = new StringBuilder();
        if (ctx != null && ctx.getTranscript() != null && !ctx.getTranscript().isBlank()) {
            sb.append("- **Cấu trúc lời thoại cần chú ý:**\n  `").append(ctx.getTranscript().trim().replace("\n", " / ")).append("`\n");
        }
        if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
            sb.append("- **Dẫn chứng từ vựng & nghĩa các phương án:**\n  ").append(q.getExplanation().trim().replace("\n", "\n  ")).append("\n");
        }
        sb.append("- **Trọng tâm ngôn ngữ Part ").append(partNumber).append(":** ");
        switch (partNumber) {
            case 1 -> sb.append("Chú ý phân biệt các thì hiện tại tiếp diễn chủ động (`is/are + V-ing` — hành động đang diễn ra) với hiện tại tiếp diễn bị động (`is/are being + V3/ed` — vật đang bị tác động bởi người) và hiện tại hoàn thành bị động (`has/have been + V3/ed` — trạng thái đã hoàn tất).");
            case 2 -> sb.append("Xác định từ để hỏi (`When` -> thời gian/giới từ `until, by, at, on`; `Where` -> địa điểm/phòng ban; `Who` -> tên người/chức danh; `Why` -> `because, due to, to + V0`) và các câu trả lời gián tiếp như *\"I'm not sure\"*, *\"Not until...\"*, *\"Let me check\"*.");
            case 3, 4 -> sb.append("Chú ý kỹ năng **Paraphrasing** (từ đồng nghĩa giữa âm thanh trong bài nghe và chữ viết trên đáp án, ví dụ: *postpone = reschedule = put off*, *annually = once a year*, *purchase = buy*).");
            case 5, 6 -> sb.append("Kiểm tra 4 nhóm ngữ pháp cốt lõi: (1) **Từ loại (Word family)**: đứng sau mạo từ `a/an/the` hoặc tính từ sở hữu là cụm danh từ (`Adv + Adj + Noun`); (2) **Thì và thể chủ động/bị động của động từ**; (3) **Liên từ (`although, because, while`) vs Giới từ (`despite, due to, during`)**; (4) **Từ vựng theo ngữ cảnh (Collocations)**.");
            default -> sb.append("Tập trung vào các từ khóa định vị thông tin (tên riêng, thời gian, điều kiện giảm giá/bảo hành) và các cặp từ đồng nghĩa giữa đoạn văn với câu hỏi.");
        }
        return sb.toString();
    }

    private String getPartTrapGuide(int partNumber) {
        return switch (partNumber) {
            case 1 -> "- **Bẫy phổ biến:** Đáp án nhắc đến vật có thật trong tranh nhưng sai hành động (ví dụ tranh không có người nhưng dùng `being + V3/ed`).\n- **Cách tránh:** Nghe kỹ động từ chính ngay sau trợ động từ `is/are`.";
            case 2 -> "- **Bẫy phổ biến:** (1) Lặp lại đúng từ xuất hiện trong câu hỏi hoặc dùng từ phát âm gần giống (*homophones*, ví dụ: *copy / coffee*, *train / rain*, *week / weak*); (2) Dùng `Yes/No` cho câu hỏi có từ để hỏi `Wh-`.\n- **Cách tránh:** Loại ngay đáp án lặp nguyên từ khóa của câu hỏi nếu ngữ cảnh không khớp.";
            case 3, 4 -> "- **Bẫy phổ biến:** Thông tin được nhắc đến đầu tiên thường là phương án bị từ chối hoặc thay đổi kế hoạch ở câu tiếp theo (*\"Actually...\", \"However...\", \"Wait, let's...\"*).\n- **Cách tránh:** Nghe hết ý sau các từ chuyển hướng trước khi chốt đáp án.";
            case 5, 6 -> "- **Bẫy phổ biến:** Đáp án có các từ cùng gốc từ loại hoặc động từ rút gọn mệnh đề quan hệ (`V-ing` chủ động vs `V3/ed` bị động).\n- **Cách tránh:** Xác định động từ chính của câu đã có chưa trước khi chọn động từ chia thì hay phân từ.";
            default -> "- **Bẫy phổ biến:** Đáp án chứa các từ tuyệt đối (`all, always, never, every`) nhưng bài đọc chỉ nói một phần (`most, some, selected`).\n- **Cách tránh:** Đối chiếu kỹ phạm vi thông tin giữa bài đọc và câu hỏi.";
        };
    }

    private List<String> buildSuggestedFollowUps(String contextMode, UserAnswer focusedAnswer, TestResult result) {
        if ("QUESTION_REVIEW".equals(contextMode) && focusedAnswer != null && focusedAnswer.getQuestion() != null) {
            int qNum = focusedAnswer.getQuestion().getQuestionNumber() == null ? 1 : focusedAnswer.getQuestion().getQuestionNumber();
            int partNum = extractPartNumber(focusedAnswer.getQuestion());
            return List.of(
                    "Giải thích chi tiết đáp án và dịch nghĩa câu " + qNum,
                    "Từ vựng và cấu trúc ngữ pháp quan trọng trong câu " + qNum,
                    "Bẫy ETS thường gặp và mẹo làm nhanh dạng Part " + partNum + " ở câu " + qNum
            );
        }

        if ("RESULT_OVERVIEW".equals(contextMode) && result != null) {
            return List.of(
                    "Phân tích điểm mạnh, điểm yếu của tôi trong bài thi này",
                    "Giải thích cho tôi câu làm sai đầu tiên trong đề này",
                    "Tôi nên ưu tiên ôn tập Part nào trước để tăng điểm nhanh nhất?"
            );
        }

        return List.of(
                "Bài thi TOEIC chuẩn có bao nhiêu câu hỏi và cấu trúc thế nào?",
                "Hướng dẫn cách làm Full Test và cách tính điểm 990 trên web",
                "Làm sao để luyện nghe chép chính tả (Dictation) và tham gia Lớp học?"
        );
    }

    private int extractPartNumber(Question question) {
        if (question == null || question.getContextQuestion() == null || question.getContextQuestion().getPart() == null) {
            if (question != null && question.getQuestionNumber() != null) {
                int qn = question.getQuestionNumber();
                if (qn <= 6) return 1;
                if (qn <= 31) return 2;
                if (qn <= 70) return 3;
                if (qn <= 100) return 4;
                if (qn <= 130) return 5;
                if (qn <= 146) return 6;
                return 7;
            }
            return 0;
        }
        String name = question.getContextQuestion().getPart().getNamePart();
        if (name == null) return 0;
        try {
            return Integer.parseInt(name.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private String getPartTip(int partNumber) {
        return switch (partNumber) {
            case 1 -> "Quan sát kỹ chủ thể (người/vật), hành động (động từ V-ing) và vị trí trong tranh trước khi nghe; cẩn thận bẫy bị động `is being + V3/ed` khi tranh không có người.";
            case 2 -> "Tập trung nghe từ để hỏi đầu câu (`Who`, `When`, `Where`, `Why`, `How`, hoặc câu Yes/No) và loại ngay các đáp án lặp lại từ đồng âm.";
            case 3 -> "Đọc trước 3 câu hỏi và từ khóa trước khi đoạn hội thoại phát; chú ý câu chốt kế hoạch ở cuối cuộc hội thoại.";
            case 4 -> "Xác định bối cảnh bài nói (thông báo sân bay, tin nhắn thoại, quảng cáo, giới thiệu sự kiện) ngay từ 2 câu đầu tiên.";
            case 5 -> "Nhìn khoảng trống và các từ đứng ngay trước/sau để nhận diện câu hỏi từ loại (N/V/Adj/Adv) trong 5 giây trước khi dịch nghĩa.";
            case 6 -> "Với câu điền cả câu vào đoạn văn, hãy đọc câu liền trước và liền sau chỗ trống để bắt mạch đại từ chỉ định (`this`, `these`, `such`) và liên từ.";
            case 7 -> "Đọc câu hỏi trước để xác định từ khóa (tên riêng, ngày tháng, con số), scan nhanh trong bài đọc và chú ý kỹ câu hỏi suy luận (`NOT true`, `suggested`).";
            default -> "Kết hợp luyện giải đề với ghi chép từ vựng và làm lại các câu sai sau mỗi lượt thi.";
        };
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "—" : value.trim();
    }

    private String safeOption(String optionText, String label) {
        return optionText == null || optionText.isBlank() ? "(" + label + ")" : optionText.trim();
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "";
        return url.replaceAll("([?&]key=)[^&]+", "$1REDACTED");
    }
}
