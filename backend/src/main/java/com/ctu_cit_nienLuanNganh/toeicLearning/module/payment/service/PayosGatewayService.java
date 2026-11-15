package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

@Service
@Slf4j
public class PayosGatewayService {
    private static final ZoneId GATEWAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Duration PAYMENT_TIMEOUT = Duration.ofMinutes(15);
    private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(15);

    @Value("${payos.client-id:}")
    private String clientId;

    @Value("${payos.api-key:}")
    private String apiKey;

    @Value("${payos.checksum-key:}")
    private String checksumKey;

    @Value("${payos.api-base-url:https://api-merchant.payos.vn}")
    private String apiBaseUrl;

    @Value("${payos.frontend-result-url:http://localhost:5173/payment/result}")
    private String frontendResultUrl;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String appFrontendUrl;

    @Value("${teacher.application.fee-vnd:2000}")
    private long teacherApplicationFee;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(HTTP_TIMEOUT)
            .build();

    public boolean isConfigured() {
        return !blank(clientId) && !blank(apiKey) && !blank(checksumKey);
    }

    public long configuredTeacherFee() {
        return teacherApplicationFee > 0 ? teacherApplicationFee : 2000L;
    }

    public String newOrderCode() {
        long timePart = System.currentTimeMillis() % 100_000_000_000L;
        int randomPart = 10 + SECURE_RANDOM.nextInt(90);
        long orderCode = timePart * 100L + randomPart;
        return String.valueOf(orderCode);
    }

    public CheckoutLink createCheckout(PaymentTransaction transaction, String remoteAddress) {
        requireConfigured();
        LocalDateTime createdAt = transaction.getPaymentDate() == null
                ? LocalDateTime.now(GATEWAY_ZONE)
                : transaction.getPaymentDate();
        LocalDateTime expiresAt = createdAt.plusMinutes(15);
        long expiredAtEpochSeconds = Instant.now().plus(PAYMENT_TIMEOUT).getEpochSecond();

        long amount = toVndAmount(transaction.getAmount());
        long orderCode = parseOrderCode(transaction.getPayosOrderCode());
        String description = buildPayosDescription(transaction, orderCode);
        String returnUrl = buildFrontendResultUrl(String.valueOf(orderCode), null);
        String cancelUrl = buildFrontendResultUrl(String.valueOf(orderCode), null);

        String signatureData = "amount=" + amount
                + "&cancelUrl=" + cancelUrl
                + "&description=" + description
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;
        String signature = hmacSha256(signatureData, checksumKey.trim());

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("orderCode", orderCode);
        requestBody.put("amount", amount);
        requestBody.put("description", description);
        requestBody.put("cancelUrl", cancelUrl);
        requestBody.put("returnUrl", returnUrl);
        requestBody.put("expiredAt", expiredAtEpochSeconds);
        requestBody.put("signature", signature);

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizeBaseUrl(apiBaseUrl) + "/v2/payment-requests"))
                    .timeout(HTTP_TIMEOUT)
                    .header("Content-Type", "application/json")
                    .header("x-client-id", clientId.trim())
                    .header("x-api-key", apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            Map<String, Object> parsed = objectMapper.readValue(response.body(), new TypeReference<>() {});
            String code = parsed != null && parsed.get("code") != null ? String.valueOf(parsed.get("code")) : null;
            if (response.statusCode() >= 400 || !"00".equals(code)) {
                log.warn("PayOS create payment link failed: httpStatus={}, code={}, desc={}",
                        response.statusCode(),
                        code,
                        parsed != null ? parsed.get("desc") : "unknown");
                throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> data = parsed.get("data") instanceof Map<?, ?> map
                    ? (Map<String, Object>) map
                    : null;
            String checkoutUrl = data != null && data.get("checkoutUrl") != null
                    ? String.valueOf(data.get("checkoutUrl")).trim()
                    : null;
            if (blank(checkoutUrl)) {
                throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
            }
            return new CheckoutLink(checkoutUrl, expiresAt);
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("PayOS create payment link error: {}", ex.getMessage());
            throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
        }
    }

    public PayosLinkStatus fetchPaymentLinkInfo(String orderCodeOrTxnRef) {
        if (!isConfigured() || blank(orderCodeOrTxnRef) || !orderCodeOrTxnRef.trim().matches("^\\d{1,16}$")) {
            return null;
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizeBaseUrl(apiBaseUrl) + "/v2/payment-requests/" + orderCodeOrTxnRef.trim()))
                    .timeout(HTTP_TIMEOUT)
                    .header("Accept", "application/json")
                    .header("x-client-id", clientId.trim())
                    .header("x-api-key", apiKey.trim())
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 400) {
                return null;
            }
            Map<String, Object> parsed = objectMapper.readValue(response.body(), new TypeReference<>() {});
            String code = parsed != null && parsed.get("code") != null ? String.valueOf(parsed.get("code")) : null;
            if (!"00".equals(code) || !(parsed.get("data") instanceof Map<?, ?> rawData)) {
                return null;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) rawData;
            String status = data.get("status") != null ? String.valueOf(data.get("status")).trim().toUpperCase(Locale.ROOT) : null;
            long amount = data.get("amount") instanceof Number num ? num.longValue() : 0L;
            long amountPaid = data.get("amountPaid") instanceof Number num ? num.longValue() : 0L;
            String paymentLinkId = data.get("paymentLinkId") != null ? String.valueOf(data.get("paymentLinkId")) : null;
            String reference = paymentLinkId;
            if (data.get("transactions") instanceof List<?> txList && !txList.isEmpty() && txList.get(0) instanceof Map<?, ?> firstTx) {
                if (firstTx.get("reference") != null && !String.valueOf(firstTx.get("reference")).isBlank()) {
                    reference = String.valueOf(firstTx.get("reference"));
                }
            }
            return new PayosLinkStatus(status, amount, amountPaid, paymentLinkId, reference);
        } catch (Exception ex) {
            log.debug("Unable to query PayOS link status for {}: {}", orderCodeOrTxnRef, ex.getMessage());
            return null;
        }
    }

    public boolean verifyWebhookSignature(Map<String, Object> data, String signature) {
        if (!isConfigured() || data == null || blank(signature)) {
            return false;
        }
        String queryStr = convertDataToSignatureString(data);
        String expected = hmacSha256(queryStr, checksumKey.trim());
        return MessageDigest.isEqual(
                expected.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8),
                signature.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8)
        );
    }

    public String redirectAfterReturn(MultiValueMap<String, String> query) {
        String txnRef = first(query, "txnRef");
        if (blank(txnRef)) {
            txnRef = first(query, "orderCode");
        }
        String cancel = first(query, "cancel");
        if (!blank(txnRef) && txnRef.matches("^([A-Fa-f0-9]{32}|\\d{1,16})$")) {
            return buildFrontendResultUrl(txnRef, "true".equalsIgnoreCase(cancel) ? "cancelled" : null);
        }
        return buildFrontendResultUrl(null, "invalid");
    }

    public String buildFrontendResultUrl(String transactionReference, String verificationStatus) {
        String baseUrl = frontendResultUrl;
        if (blank(baseUrl) || baseUrl.contains("your-frontend-domain.example")) {
            String fallbackFrontend = blank(appFrontendUrl) || appFrontendUrl.contains("your-frontend-domain.example")
                    ? "http://localhost:5173"
                    : appFrontendUrl.trim();
            if (fallbackFrontend.endsWith("/")) {
                fallbackFrontend = fallbackFrontend.substring(0, fallbackFrontend.length() - 1);
            }
            baseUrl = fallbackFrontend + "/payment/result";
        }
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl.trim());
        if (!blank(transactionReference)) {
            builder.queryParam("txnRef", transactionReference.trim());
        }
        if (!blank(verificationStatus)) {
            builder.queryParam("verification", verificationStatus.trim());
        }
        return builder.build().encode().toUriString();
    }

    private String convertDataToSignatureString(Map<String, Object> data) {
        TreeMap<String, Object> sorted = new TreeMap<>(data);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Object> entry : sorted.entrySet()) {
            if (sb.length() > 0) {
                sb.append('&');
            }
            String key = entry.getKey();
            Object rawVal = entry.getValue();
            String valStr;
            if (rawVal == null) {
                valStr = "";
            } else if (rawVal instanceof Map<?, ?> || rawVal instanceof List<?>) {
                try {
                    valStr = objectMapper.writeValueAsString(rawVal);
                } catch (Exception e) {
                    valStr = String.valueOf(rawVal);
                }
            } else {
                valStr = String.valueOf(rawVal);
                if ("null".equalsIgnoreCase(valStr) || "undefined".equalsIgnoreCase(valStr)) {
                    valStr = "";
                }
            }
            sb.append(key).append('=').append(valStr);
        }
        return sb.toString();
    }

    private String buildPayosDescription(PaymentTransaction transaction, long orderCode) {
        String codeSuffix = String.valueOf(orderCode);
        if (codeSuffix.length() > 9) {
            codeSuffix = codeSuffix.substring(codeSuffix.length() - 9);
        }
        String prefix = "TEACHER_APPLICATION".equalsIgnoreCase(transaction.getProductType())
                ? "DK Giao Vien "
                : "TOEIC VIP ";
        String raw = (prefix + codeSuffix).trim();
        return raw.length() > 25 ? raw.substring(0, 25) : raw;
    }

    private long parseOrderCode(String txnRef) {
        if (!blank(txnRef) && txnRef.trim().matches("^\\d{1,16}$")) {
            long parsed = Long.parseLong(txnRef.trim());
            if (parsed > 0) {
                return parsed;
            }
        }
        return Long.parseLong(newOrderCode());
    }

    private long toVndAmount(BigDecimal amount) {
        if (amount == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        BigDecimal normalized = amount.setScale(0, RoundingMode.HALF_UP);
        if (normalized.compareTo(BigDecimal.ONE) < 0 || normalized.compareTo(new BigDecimal("999999999")) > 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        return normalized.longValueExact();
    }

    private String normalizeBaseUrl(String url) {
        String trimmed = blank(url) ? "https://api-merchant.payos.vn" : url.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private String first(MultiValueMap<String, String> query, String key) {
        if (query == null) return "";
        var values = query.get(key);
        return values == null || values.isEmpty() || values.get(0) == null ? "" : values.get(0);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(hmac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to calculate PayOS signature");
        }
    }

    private void requireConfigured() {
        if (!isConfigured()) throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public record CheckoutLink(String url, LocalDateTime expiresAt) {
    }

    public record PayosLinkStatus(
            String status,
            long amount,
            long amountPaid,
            String paymentLinkId,
            String reference
    ) {
    }
}
