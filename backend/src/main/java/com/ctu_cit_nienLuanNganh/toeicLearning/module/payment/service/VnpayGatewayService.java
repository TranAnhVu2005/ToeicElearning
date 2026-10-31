package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class VnpayGatewayService {
    private static final ZoneId GATEWAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter GATEWAY_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Pattern HEX_HASH = Pattern.compile("^[A-Fa-f0-9]{128}$");

    @Value("${vnpay.tmn-code:}") private String tmnCode;
    @Value("${vnpay.hash-secret:}") private String hashSecret;
    @Value("${vnpay.payment-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}") private String paymentUrl;
    @Value("${vnpay.return-url:}") private String returnUrl;
    @Value("${vnpay.frontend-result-url:http://localhost:5173/payment/result}") private String frontendResultUrl;
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}") private String allowedOrigins;

    public boolean isConfigured() {
        return !blank(tmnCode) && !blank(hashSecret) && validHttpsUrl(paymentUrl) && validHttpsUrl(returnUrl)
                && validFrontendResultUrl(frontendResultUrl);
    }

    public CheckoutLink createCheckout(PaymentTransaction transaction, String remoteAddress) {
        requireConfigured();
        LocalDateTime createdAt = transaction.getPaymentDate() == null
                ? LocalDateTime.now(GATEWAY_ZONE) : transaction.getPaymentDate();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);
        SortedMap<String, String> fields = new TreeMap<>();
        fields.put("vnp_Version", "2.1.0");
        fields.put("vnp_Command", "pay");
        fields.put("vnp_TmnCode", tmnCode.trim());
        fields.put("vnp_Amount", transaction.getAmount().multiply(BigDecimal.valueOf(100)).longValueExact() + "");
        fields.put("vnp_CreateDate", createdAt.format(GATEWAY_DATE));
        fields.put("vnp_CurrCode", "VND");
        fields.put("vnp_IpAddr", safeIpAddress(remoteAddress));
        fields.put("vnp_Locale", "vn");
        String orderPrefix = "TEST_VIP".equals(transaction.getProductType()) ? "Mua de TOEIC" : "Dang ky giao vien";
        fields.put("vnp_OrderInfo", orderPrefix + " " + transaction.getVnpTxnRef());
        fields.put("vnp_OrderType", "other");
        fields.put("vnp_ReturnUrl", returnUrl.trim());
        fields.put("vnp_TxnRef", transaction.getVnpTxnRef());
        fields.put("vnp_ExpireDate", expiresAt.format(GATEWAY_DATE));

        String secureHash = hmacSha512(canonicalData(fields), hashSecret.trim());
        String query = fields.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
        String url = paymentUrl.trim() + "?" + query + "&vnp_SecureHash=" + secureHash;
        return new CheckoutLink(url, expiresAt);
    }

    public boolean verify(MultiValueMap<String, String> query) {
        String receivedHash = first(query, "vnp_SecureHash");
        if (!HEX_HASH.matcher(receivedHash).matches() || blank(hashSecret)) return false;
        SortedMap<String, String> fields = normalizedFields(query);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        byte[] expected = HexFormat.of().parseHex(hmacSha512(canonicalData(fields), hashSecret.trim()));
        byte[] actual = HexFormat.of().parseHex(receivedHash);
        return MessageDigest.isEqual(expected, actual);
    }

    public String redirectAfterReturn(MultiValueMap<String, String> query) {
        String target = frontendResultUrl.trim();
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(target);
        boolean signatureValid;
        try {
            signatureValid = verify(query);
        } catch (RuntimeException exception) {
            signatureValid = false;
        }
        if (signatureValid) {
            String transactionReference = first(query, "vnp_TxnRef");
            if (transactionReference.matches("^[A-Fa-f0-9]{32}$")) {
                builder.queryParam("txnRef", transactionReference);
            } else {
                builder.queryParam("verification", "invalid");
            }
        } else {
            builder.queryParam("verification", "invalid");
        }
        return builder.build(true).toUriString();
    }

    public boolean isExpectedMerchant(String suppliedTmnCode) {
        return !blank(tmnCode) && tmnCode.trim().equals(suppliedTmnCode);
    }

    public long configuredTeacherFee() {
        return teacherApplicationFee;
    }

    @Value("${teacher.application.fee-vnd:0}")
    private long teacherApplicationFee;

    private SortedMap<String, String> normalizedFields(MultiValueMap<String, String> query) {
        if (query == null || query.size() > 50) throw new AppException(ErrorCode.VALIDATION_ERROR);
        SortedMap<String, String> fields = new TreeMap<>();
        query.forEach((key, values) -> {
            if (key != null && key.startsWith("vnp_")) {
                if (key.length() > 64 || values == null || values.size() != 1 || values.get(0) == null
                        || values.get(0).length() > 2048) {
                    throw new AppException(ErrorCode.VALIDATION_ERROR);
                }
                fields.put(key, values.get(0));
            }
        });
        return fields;
    }

    private String first(MultiValueMap<String, String> query, String key) {
        var values = query.get(key);
        return values == null || values.size() != 1 || values.get(0) == null ? "" : values.get(0);
    }

    private String canonicalData(SortedMap<String, String> fields) {
        return fields.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String hmacSha512(String data, String secret) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return HexFormat.of().formatHex(hmac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to calculate VNPAY signature");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String safeIpAddress(String remoteAddress) {
        return remoteAddress != null && remoteAddress.length() <= 45 && remoteAddress.matches("[0-9a-fA-F:.]+")
                ? remoteAddress : "127.0.0.1";
    }

    private boolean validHttpUrl(String value) {
        if (blank(value)) return false;
        try {
            URI uri = URI.create(value.trim());
            return ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null && uri.getUserInfo() == null;
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private boolean validHttpsUrl(String value) {
        if (!validHttpUrl(value)) return false;
        return "https".equalsIgnoreCase(URI.create(value.trim()).getScheme());
    }

    private boolean validFrontendResultUrl(String value) {
        if (blank(value)) return false;
        try {
            URI target = URI.create(value.trim());
            String scheme = target.getScheme();
            String host = target.getHost();
            if (host == null || target.getUserInfo() != null || target.getFragment() != null
                    || target.getPath() == null || target.getPath().isBlank()
                    || !target.getPath().startsWith("/") || target.getPath().startsWith("//")) {
                return false;
            }
            boolean localDevelopmentHost = "localhost".equalsIgnoreCase(host)
                    || "127.0.0.1".equals(host) || "::1".equals(host) || "[::1]".equalsIgnoreCase(host);
            if (!"https".equalsIgnoreCase(scheme)
                    && !(localDevelopmentHost && "http".equalsIgnoreCase(scheme))) {
                return false;
            }
            return Arrays.stream((allowedOrigins == null ? "" : allowedOrigins).split(","))
                    .map(String::trim)
                    .anyMatch(origin -> sameOrigin(target, origin));
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private boolean sameOrigin(URI target, String configuredOrigin) {
        if (configuredOrigin.isBlank()) return false;
        try {
            URI origin = URI.create(configuredOrigin);
            if (origin.getHost() == null || origin.getUserInfo() != null || origin.getQuery() != null
                    || origin.getFragment() != null
                    || (origin.getPath() != null && !origin.getPath().isEmpty() && !"/".equals(origin.getPath()))) {
                return false;
            }
            return target.getScheme().equalsIgnoreCase(origin.getScheme())
                    && target.getHost().equalsIgnoreCase(origin.getHost())
                    && effectivePort(target) == effectivePort(origin);
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private int effectivePort(URI uri) {
        if (uri.getPort() >= 0) return uri.getPort();
        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
    }

    private void requireConfigured() {
        if (!isConfigured()) throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }

    public record CheckoutLink(String url, LocalDateTime expiresAt) { }
}
