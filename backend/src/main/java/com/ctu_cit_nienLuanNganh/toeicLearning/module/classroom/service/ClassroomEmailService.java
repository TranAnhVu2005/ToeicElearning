package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class ClassroomEmailService {
    private static final DateTimeFormatter DEADLINE_FMT = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    @Value("${app.mail.host:smtp.gmail.com}")
    private String smtpHost;

    @Value("${app.mail.port:465}")
    private int smtpPort;

    @Value("${app.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.password:}")
    private String mailPassword;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public boolean isConfigured() {
        return mailUsername != null && !mailUsername.trim().isEmpty()
                && mailPassword != null && !mailPassword.trim().isEmpty();
    }

    public String getEffectiveFrontendUrl() {
        String base = (frontendUrl == null || frontendUrl.isBlank())
                ? "http://localhost:5173"
                : frontendUrl.trim();
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

    public void sendNewAssignmentEmails(Classroom classroom, Assignment assignment, User teacher, List<User> students) {
        if (!isConfigured() || students == null || students.isEmpty()) {
            return;
        }
        String className = safe(classroom.getClassName());
        String teacherName = safe(teacher.getUserName());
        String assignmentTitle = safe(assignment.getTitle());
        String attachmentLabel = assignment.getTest() != null ? "Đề thi đính kèm" : "Tệp bài tập PDF đính kèm";
        String attachmentTitle = assignment.getTest() != null
                ? safe(assignment.getTest().getTitleTest())
                : (assignment.getMaterial() != null
                        ? safe(assignment.getMaterial().getOriginalFileName() != null
                                ? assignment.getMaterial().getOriginalFileName()
                                : assignment.getMaterial().getTitle())
                        : "Bài tập PDF");
        String instructions = assignment.getInstructions() != null && !assignment.getInstructions().isBlank()
                ? safe(assignment.getInstructions())
                : "Giáo viên không đính kèm hướng dẫn bổ sung. Hãy hoàn thành bài tập đúng hạn.";
        String deadlineText = assignment.getDeadline() != null
                ? assignment.getDeadline().format(DEADLINE_FMT)
                : "Không giới hạn";
        String baseUrl = getEffectiveFrontendUrl();
        String actionUrl = assignment.getTest() != null
                ? baseUrl + "/courses/" + assignment.getTest().getId() + "/take?assignmentId=" + assignment.getId()
                : baseUrl + "/classrooms";
        String classroomUrl = baseUrl + "/classrooms";

        String subject = "Bài tập mới: \"" + assignment.getTitle() + "\" - " + classroom.getClassName();

        for (User student : students) {
            if (student == null || student.getUserEmail() == null || student.getUserEmail().isBlank()) {
                continue;
            }
            String recipientEmail = student.getUserEmail().trim();
            String studentName = safe(student.getUserName() != null ? student.getUserName() : recipientEmail);
            String html = buildGoogleClassroomEmailTemplate(
                    className,
                    "BÀI TẬP MỚI TRÊN LỚP",
                    teacherName + " đã đăng một bài tập mới trong lớp " + className,
                    assignmentTitle,
                    "<p style=\"margin:0 0 10px;color:#3c4043;font-size:14px;line-height:1.6;\">Xin chào <strong>" + studentName + "</strong>,</p>"
                            + "<p style=\"margin:0 0 12px;color:#3c4043;font-size:14px;line-height:1.6;\">" + instructions + "</p>"
                            + "<div style=\"background:#f8f9fa;border-left:4px solid #1967d2;padding:12px 14px;margin:14px 0;\">"
                            + "<div style=\"font-size:12px;color:#5f6368;text-transform:uppercase;letter-spacing:0.06em;\">" + attachmentLabel + "</div>"
                            + "<div style=\"font-size:14px;font-weight:700;color:#202124;margin-top:2px;\">" + attachmentTitle + "</div>"
                            + "<div style=\"font-size:13px;color:#d93025;font-weight:600;margin-top:6px;\">⏰ Hạn nộp: " + deadlineText + "</div>"
                            + "</div>",
                    assignment.getTest() != null ? "Mở bài tập ngay" : "Mở lớp học xem file PDF",
                    actionUrl,
                    "Hoặc truy cập bảng tin lớp học tại: " + classroomUrl
            );
            sendEmailAsync(recipientEmail, subject, html);
        }
    }

    public void sendDeadlineUpdatedEmails(Classroom classroom, Assignment assignment, User teacher, List<User> students) {
        if (!isConfigured() || students == null || students.isEmpty()) {
            return;
        }
        String className = safe(classroom.getClassName());
        String teacherName = safe(teacher.getUserName());
        String assignmentTitle = safe(assignment.getTitle());
        String deadlineText = assignment.getDeadline() != null
                ? assignment.getDeadline().format(DEADLINE_FMT)
                : "Không giới hạn";
        String baseUrl = getEffectiveFrontendUrl();
        String actionUrl = assignment.getTest() != null
                ? baseUrl + "/courses/" + assignment.getTest().getId() + "/take?assignmentId=" + assignment.getId()
                : baseUrl + "/classrooms";

        String subject = "Cập nhật hạn nộp: \"" + assignment.getTitle() + "\" - " + classroom.getClassName();

        for (User student : students) {
            if (student == null || student.getUserEmail() == null || student.getUserEmail().isBlank()) {
                continue;
            }
            String recipientEmail = student.getUserEmail().trim();
            String studentName = safe(student.getUserName() != null ? student.getUserName() : recipientEmail);
            String html = buildGoogleClassroomEmailTemplate(
                    className,
                    "CẬP NHẬT HẠN NỘP BÀI TẬP",
                    teacherName + " đã cập nhật thời hạn nộp bài tập",
                    assignmentTitle,
                    "<p style=\"margin:0 0 10px;color:#3c4043;font-size:14px;line-height:1.6;\">Xin chào <strong>" + studentName + "</strong>,</p>"
                            + "<p style=\"margin:0 0 12px;color:#3c4043;font-size:14px;line-height:1.6;\">Thời hạn nộp mới của bài tập đã được giáo viên điều chỉnh:</p>"
                            + "<div style=\"background:#fef7e0;border-left:4px solid #f29900;padding:12px 14px;margin:14px 0;\">"
                            + "<div style=\"font-size:13px;color:#b06000;font-weight:700;\">⏰ Hạn nộp mới: " + deadlineText + "</div>"
                            + "</div>",
                    "Xem bài tập",
                    actionUrl,
                    "TOEIC E-Learning Classroom · " + className
            );
            sendEmailAsync(recipientEmail, subject, html);
        }
    }

    public void sendAnnouncementEmails(Classroom classroom, String title, String content, User teacher, List<User> students) {
        if (!isConfigured() || students == null || students.isEmpty()) {
            return;
        }
        String className = safe(classroom.getClassName());
        String teacherName = safe(teacher.getUserName());
        String announcementTitle = (title == null || title.isBlank())
                ? "Thông báo mới trên bảng tin lớp " + className
                : safe(title);
        String bodyContent = safe(content).replace("\n", "<br/>");
        String classroomUrl = getEffectiveFrontendUrl() + "/classrooms";
        String subject = "Thông báo mới từ lớp " + classroom.getClassName();

        for (User student : students) {
            if (student == null || student.getUserEmail() == null || student.getUserEmail().isBlank()) {
                continue;
            }
            String recipientEmail = student.getUserEmail().trim();
            String html = buildGoogleClassroomEmailTemplate(
                    className,
                    "THÔNG BÁO BẢNG TIN LỚP HỌC",
                    teacherName + " đã đăng một thông báo mới",
                    announcementTitle,
                    "<div style=\"color:#202124;font-size:14px;line-height:1.7;background:#f8f9fa;padding:14px 16px;border-left:4px solid #1967d2;\">"
                            + bodyContent + "</div>",
                    "Mở Bảng tin lớp học",
                    classroomUrl,
                    "TOEIC E-Learning Classroom · " + className
            );
            sendEmailAsync(recipientEmail, subject, html);
        }
    }

    public void sendClassroomInvitationEmail(
            Classroom classroom,
            User teacher,
            String recipientEmail,
            String customMessage,
            boolean autoApproved
    ) {
        if (!isConfigured() || recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }
        String className = safe(classroom.getClassName());
        String teacherName = safe(teacher.getUserName());
        String teacherEmail = safe(teacher.getUserEmail());
        String classCode = safe(classroom.getClassCode());
        String baseUrl = getEffectiveFrontendUrl();
        String inviteUrl = autoApproved
                ? baseUrl + "/classrooms"
                : baseUrl + "/classrooms?joinCode=" + classCode;

        String noteBlock = (customMessage != null && !customMessage.isBlank())
                ? "<div style=\"background:#f8f9fa;border-left:4px solid #1967d2;padding:12px 14px;margin:14px 0;font-size:14px;color:#3c4043;\">"
                + "<strong>Lời nhắn từ giáo viên:</strong><br/>" + safe(customMessage).replace("\n", "<br/>") + "</div>"
                : "";

        String statusExplanation = autoApproved
                ? "<p style=\"margin:0 0 12px;color:#137333;font-weight:600;font-size:14px;\">✅ Tài khoản của bạn đã được giáo viên thêm trực tiếp vào danh sách lớp. Bạn có thể vào học và làm bài tập ngay!</p>"
                : "<p style=\"margin:0 0 12px;color:#3c4043;font-size:14px;line-height:1.6;\">Hãy nhấn nút <strong>Tham gia lớp học</strong> bên dưới hoặc nhập mã lớp <strong>" + classCode + "</strong> sau khi đăng nhập bằng Gmail trên hệ thống TOEIC E-Learning.</p>";

        String codeCard = "<div style=\"background:#e8f0fe;border:1px dashed #1967d2;padding:14px 16px;margin:16px 0;text-align:center;\">"
                + "<div style=\"font-size:11px;color:#1967d2;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;\">Mã tham gia lớp học (Class Code)</div>"
                + "<div style=\"font-family:monospace;font-size:26px;font-weight:700;letter-spacing:0.18em;color:#174ea6;margin-top:4px;\">" + classCode + "</div>"
                + "</div>";

        String subject = "Lời mời tham gia lớp học: \"" + classroom.getClassName() + "\" từ GV " + teacher.getUserName();

        String html = buildGoogleClassroomEmailTemplate(
                className,
                "LỜI MỜI THAM GIA LỚP HỌC",
                teacherName + " (" + teacherEmail + ") đã mời bạn tham gia lớp học",
                className,
                statusExplanation + noteBlock + codeCard,
                autoApproved ? "Vào lớp học ngay" : "Tham gia lớp học",
                inviteUrl,
                "Liên kết trực tiếp: " + inviteUrl
        );

        sendEmailAsync(recipientEmail.trim(), subject, html);
    }

    private void sendEmailAsync(String toEmail, String subject, String htmlBody) {
        CompletableFuture.runAsync(() -> {
            try {
                sendEmailViaSmtp(toEmail, subject, htmlBody);
            } catch (Exception ex) {
                log.warn("Không thể gửi email thông báo tới {}: {}", toEmail, ex.getMessage());
            }
        });
    }

    private void sendEmailViaSmtp(String toEmail, String subject, String htmlBody) throws IOException {
        String host = (smtpHost == null || smtpHost.isBlank()) ? "smtp.gmail.com" : smtpHost.trim();
        int port = smtpPort > 0 ? smtpPort : 465;
        String username = mailUsername.trim();
        String password = mailPassword.replaceAll("\\s+", "");

        if (port == 465) {
            try {
                sendOverImplicitSsl(host, 465, username, password, toEmail, subject, htmlBody);
                return;
            } catch (IOException sslEx) {
                log.debug("SMTP SSL 465 thất bại ({}), thử STARTTLS 587...", sslEx.getMessage());
                sendOverStartTls(host, 587, username, password, toEmail, subject, htmlBody);
                return;
            }
        }
        sendOverStartTls(host, port, username, password, toEmail, subject, htmlBody);
    }

    private void sendOverImplicitSsl(
            String host,
            int port,
            String username,
            String password,
            String toEmail,
            String subject,
            String htmlBody
    ) throws IOException {
        SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
        try (Socket rawSocket = new Socket()) {
            rawSocket.connect(new InetSocketAddress(host, port), 12_000);
            rawSocket.setSoTimeout(15_000);
            try (SSLSocket sslSocket = (SSLSocket) factory.createSocket(rawSocket, host, port, true);
                 BufferedReader reader = new BufferedReader(new InputStreamReader(sslSocket.getInputStream(), StandardCharsets.UTF_8));
                 BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(sslSocket.getOutputStream(), StandardCharsets.UTF_8))) {
                sslSocket.startHandshake();
                expectCode(reader, 220);
                sendCommand(writer, reader, "EHLO toeic-learning.local", 250);
                authenticateAndTransmit(writer, reader, username, password, toEmail, subject, htmlBody);
            }
        }
    }

    private void sendOverStartTls(
            String host,
            int port,
            String username,
            String password,
            String toEmail,
            String subject,
            String htmlBody
    ) throws IOException {
        SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 12_000);
            socket.setSoTimeout(15_000);
            BufferedReader plainReader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter plainWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));
            expectCode(plainReader, 220);
            sendCommand(plainWriter, plainReader, "EHLO toeic-learning.local", 250);
            sendCommand(plainWriter, plainReader, "STARTTLS", 220);

            try (SSLSocket sslSocket = (SSLSocket) factory.createSocket(socket, host, port, true);
                 BufferedReader tlsReader = new BufferedReader(new InputStreamReader(sslSocket.getInputStream(), StandardCharsets.UTF_8));
                 BufferedWriter tlsWriter = new BufferedWriter(new OutputStreamWriter(sslSocket.getOutputStream(), StandardCharsets.UTF_8))) {
                sslSocket.startHandshake();
                sendCommand(tlsWriter, tlsReader, "EHLO toeic-learning.local", 250);
                authenticateAndTransmit(tlsWriter, tlsReader, username, password, toEmail, subject, htmlBody);
            }
        }
    }

    private void authenticateAndTransmit(
            BufferedWriter writer,
            BufferedReader reader,
            String username,
            String password,
            String toEmail,
            String subject,
            String htmlBody
    ) throws IOException {
        sendCommand(writer, reader, "AUTH LOGIN", 334);
        sendCommand(writer, reader, Base64.getEncoder().encodeToString(username.getBytes(StandardCharsets.UTF_8)), 334);
        sendCommand(writer, reader, Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8)), 235);

        sendCommand(writer, reader, "MAIL FROM:<" + username + ">", 250);
        sendCommand(writer, reader, "RCPT TO:<" + toEmail + ">", 250);
        sendCommand(writer, reader, "DATA", 354);

        String encodedDisplayName = encodeHeaderUtf8("TOEIC Classroom");
        String encodedSubject = encodeHeaderUtf8(subject);
        String encodedBody = Base64.getMimeEncoder(76, "\r\n".getBytes(StandardCharsets.US_ASCII))
                .encodeToString(htmlBody.getBytes(StandardCharsets.UTF_8));
        String rfcDate = DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now());

        StringBuilder message = new StringBuilder();
        message.append("From: ").append(encodedDisplayName).append(" <").append(username).append(">\r\n");
        message.append("To: <").append(toEmail).append(">\r\n");
        message.append("Subject: ").append(encodedSubject).append("\r\n");
        message.append("Date: ").append(rfcDate).append("\r\n");
        message.append("Message-ID: <").append(UUID.randomUUID()).append("@toeic-learning.local>\r\n");
        message.append("MIME-Version: 1.0\r\n");
        message.append("Content-Type: text/html; charset=UTF-8\r\n");
        message.append("Content-Transfer-Encoding: base64\r\n");
        message.append("\r\n");
        message.append(encodedBody).append("\r\n");
        message.append(".");

        sendCommand(writer, reader, message.toString(), 250);
        try {
            sendCommand(writer, reader, "QUIT", 221);
        } catch (IOException ignored) {
            // Ignore QUIT close warnings
        }
        log.info("Đã gửi email thông báo lớp học thành công tới {}", toEmail);
    }

    private void sendCommand(BufferedWriter writer, BufferedReader reader, String command, int expectedCode) throws IOException {
        writer.write(command + "\r\n");
        writer.flush();
        expectCode(reader, expectedCode);
    }

    private void expectCode(BufferedReader reader, int expectedCode) throws IOException {
        String line;
        String lastLine = "";
        while ((line = reader.readLine()) != null) {
            lastLine = line;
            if (line.length() < 4 || line.charAt(3) != '-') {
                break;
            }
        }
        if (lastLine.length() < 3) {
            throw new IOException("Phản hồi SMTP rỗng (mong đợi " + expectedCode + ")");
        }
        int code;
        try {
            code = Integer.parseInt(lastLine.substring(0, 3));
        } catch (NumberFormatException ex) {
            throw new IOException("Mã phản hồi SMTP không hợp lệ: " + lastLine);
        }
        if (code != expectedCode) {
            throw new IOException("SMTP trả về mã " + code + " thay vì " + expectedCode + ": " + lastLine);
        }
    }

    private String encodeHeaderUtf8(String text) {
        return "=?UTF-8?B?" + Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8)) + "?=";
    }

    private String buildGoogleClassroomEmailTemplate(
            String className,
            String badgeLabel,
            String subtitle,
            String cardTitle,
            String cardHtmlContent,
            String buttonLabel,
            String buttonUrl,
            String footerText
    ) {
        return "<!DOCTYPE html>"
                + "<html lang=\"vi\"><head><meta charset=\"UTF-8\"/></head>"
                + "<body style=\"margin:0;padding:24px 12px;background:#f1f3f4;font-family:'Google Sans',Roboto,Arial,sans-serif;\">"
                + "<div style=\"max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dadce0;overflow:hidden;\">"
                + "  <div style=\"background:#1967d2;padding:22px 24px;color:#ffffff;\">"
                + "    <div style=\"font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;\">TOEIC ELEARNING</div>"
                + "    <div style=\"font-size:22px;font-weight:700;margin-top:6px;\">" + className + "</div>"
                + "  </div>"
                + "  <div style=\"padding:24px;\">"
                + "    <div style=\"font-size:11px;font-weight:700;color:#1967d2;letter-spacing:0.08em;text-transform:uppercase;\">" + badgeLabel + "</div>"
                + "    <div style=\"font-size:14px;color:#5f6368;margin-top:4px;\">" + subtitle + "</div>"
                + "    <div style=\"border:1px solid #dadce0;padding:18px 20px;margin-top:16px;background:#ffffff;\">"
                + "      <div style=\"font-size:18px;font-weight:700;color:#202124;margin-bottom:12px;\">" + cardTitle + "</div>"
                +        cardHtmlContent
                + "      <div style=\"margin-top:20px;\">"
                + "        <a href=\"" + buttonUrl + "\" style=\"display:inline-block;background:#1967d2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:11px 22px;\">"
                +            buttonLabel
                + "        </a>"
                + "      </div>"
                + "    </div>"
                + "    <div style=\"margin-top:18px;padding-top:14px;border-top:1px solid #eceff1;font-size:12px;color:#5f6368;line-height:1.5;\">"
                +        safe(footerText)
                + "    </div>"
                + "  </div>"
                + "</div>"
                + "</body></html>";
    }

    private String safe(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
