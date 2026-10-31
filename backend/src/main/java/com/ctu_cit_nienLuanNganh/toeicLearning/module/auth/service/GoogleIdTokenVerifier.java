package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Signature;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class GoogleIdTokenVerifier {
    private static final URI GOOGLE_JWKS_URI = URI.create("https://www.googleapis.com/oauth2/v3/certs");
    private static final int MAX_TOKEN_LENGTH = 20_000;
    private static final int MAX_JWKS_BYTES = 64 * 1024;
    private static final long DEFAULT_CACHE_SECONDS = 300;
    private static final ObjectMapper JSON = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Value("${google.client-id:}")
    private String clientId;

    private volatile CachedKeys cachedKeys;
    private volatile Instant lastForcedRefresh = Instant.EPOCH;

    public VerifiedGoogleIdentity verify(String idToken) {
        try {
            if (clientId == null || clientId.isBlank() || idToken == null || idToken.length() > MAX_TOKEN_LENGTH) {
                throw new IllegalArgumentException("Google token verification is not configured");
            }
            String[] sections = idToken.split("\\.", -1);
            if (sections.length != 3 || sections[0].isBlank() || sections[1].isBlank() || sections[2].isBlank()) {
                throw new IllegalArgumentException("Malformed JWT");
            }

            JsonNode header = JSON.readTree(decode(sections[0]));
            if (!"RS256".equals(text(header, "alg"))) throw new IllegalArgumentException("Unexpected JWT algorithm");
            String keyId = text(header, "kid");
            if (keyId == null || keyId.length() > 128) throw new IllegalArgumentException("Missing JWT key id");

            RSAPublicKey publicKey = findKey(keyId, false);
            if (publicKey == null) publicKey = findKey(keyId, true);
            if (publicKey == null) throw new IllegalArgumentException("Unknown Google signing key");

            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update((sections[0] + "." + sections[1]).getBytes(StandardCharsets.US_ASCII));
            if (!signature.verify(Base64.getUrlDecoder().decode(sections[2]))) {
                throw new IllegalArgumentException("Invalid Google token signature");
            }

            JsonNode claims = JSON.readTree(decode(sections[1]));
            String issuer = text(claims, "iss");
            if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
                throw new IllegalArgumentException("Invalid Google token issuer");
            }
            validateAudience(claims);
            long now = Instant.now().getEpochSecond();
            long expiresAt = claims.path("exp").asLong(0);
            long issuedAt = claims.path("iat").asLong(0);
            if (expiresAt <= now || issuedAt <= 0 || issuedAt > now + 60) {
                throw new IllegalArgumentException("Expired or invalid Google token timestamps");
            }

            String subject = text(claims, "sub");
            String email = text(claims, "email");
            if (subject == null || subject.length() > 255 || email == null || email.isBlank() || email.length() > 255
                    || !claims.path("email_verified").asBoolean(false)) {
                throw new IllegalArgumentException("Google identity is incomplete or unverified");
            }
            String name = text(claims, "name");
            String picture = text(claims, "picture");
            return new VerifiedGoogleIdentity(subject, email.trim().toLowerCase(Locale.ROOT),
                    name == null || name.isBlank() ? "Google User" : name.substring(0, Math.min(name.length(), 255)),
                    isGoogleHostedPicture(picture) ? picture : null, issuedAt);
        } catch (AppException exception) {
            throw exception;
        } catch (Exception exception) {
            // Do not log token, claims, or upstream response: all can contain personal/authentication data.
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    public VerifiedGoogleIdentity verifyRecent(String idToken) {
        VerifiedGoogleIdentity identity = verify(idToken);
        long now = Instant.now().getEpochSecond();
        if (identity.issuedAtEpochSeconds() < now - 300 || identity.issuedAtEpochSeconds() > now + 60) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return identity;
    }

    private void validateAudience(JsonNode claims) {
        JsonNode audience = claims.path("aud");
        boolean matches = audience.isTextual() && clientId.equals(audience.asText());
        if (audience.isArray()) {
            for (JsonNode candidate : audience) matches |= candidate.isTextual() && clientId.equals(candidate.asText());
            if (audience.size() > 1 && !clientId.equals(text(claims, "azp"))) matches = false;
        }
        if (!matches) throw new IllegalArgumentException("Google token was issued for another client");
    }

    private RSAPublicKey findKey(String keyId, boolean refresh) throws Exception {
        CachedKeys keys = getKeys(refresh);
        return keys.keys().get(keyId);
    }

    private CachedKeys getKeys(boolean refresh) throws Exception {
        CachedKeys current = cachedKeys;
        if (!refresh && current != null && Instant.now().isBefore(current.expiresAt())) return current;
        synchronized (this) {
            current = cachedKeys;
            Instant now = Instant.now();
            if (current != null && now.isBefore(current.expiresAt())) {
                if (!refresh || now.isBefore(lastForcedRefresh.plusSeconds(60))) return current;
            }
            HttpRequest request = HttpRequest.newBuilder(GOOGLE_JWKS_URI)
                    .timeout(Duration.ofSeconds(5))
                    .header("Accept", "application/json")
                    .GET().build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            byte[] body = response.body();
            if (response.statusCode() != 200 || body == null || body.length == 0 || body.length > MAX_JWKS_BYTES) {
                throw new IllegalArgumentException("Could not load Google signing keys");
            }
            JsonNode root = JSON.readTree(body);
            Map<String, RSAPublicKey> keys = new HashMap<>();
            for (JsonNode key : root.path("keys")) {
                if (!"RSA".equals(text(key, "kty")) || !"sig".equals(text(key, "use"))
                        || !"RS256".equals(text(key, "alg"))) continue;
                String kid = text(key, "kid");
                String modulus = text(key, "n");
                String exponent = text(key, "e");
                if (kid == null || modulus == null || exponent == null) continue;
                BigInteger n = new BigInteger(1, Base64.getUrlDecoder().decode(modulus));
                BigInteger e = new BigInteger(1, Base64.getUrlDecoder().decode(exponent));
                RSAPublicKey publicKey = (RSAPublicKey) java.security.KeyFactory.getInstance("RSA")
                        .generatePublic(new RSAPublicKeySpec(n, e));
                keys.put(kid, publicKey);
            }
            if (keys.isEmpty()) throw new IllegalArgumentException("Google signing key set is empty");
            long maxAge = response.headers().firstValue("Cache-Control")
                    .map(GoogleIdTokenVerifier::maxAgeSeconds).orElse(DEFAULT_CACHE_SECONDS);
            current = new CachedKeys(Map.copyOf(keys), Instant.now().plusSeconds(maxAge));
            cachedKeys = current;
            if (refresh) lastForcedRefresh = Instant.now();
            return current;
        }
    }

    private static long maxAgeSeconds(String cacheControl) {
        for (String directive : cacheControl.split(",")) {
            String trimmed = directive.trim().toLowerCase();
            if (trimmed.startsWith("max-age=")) {
                try {
                    long seconds = Long.parseLong(trimmed.substring("max-age=".length()));
                    return Math.max(60, Math.min(seconds, 86_400));
                } catch (NumberFormatException ignored) {
                    return DEFAULT_CACHE_SECONDS;
                }
            }
        }
        return DEFAULT_CACHE_SECONDS;
    }

    private static byte[] decode(String base64Url) {
        return Base64.getUrlDecoder().decode(base64Url);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        return value != null && value.isTextual() ? value.asText() : null;
    }

    private static boolean isGoogleHostedPicture(String value) {
        if (value == null || value.length() > 2048) return false;
        try {
            URI uri = URI.create(value);
            String host = uri.getHost();
            return "https".equalsIgnoreCase(uri.getScheme()) && host != null
                    && ("googleusercontent.com".equalsIgnoreCase(host)
                    || host.toLowerCase().endsWith(".googleusercontent.com"));
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    private record CachedKeys(Map<String, RSAPublicKey> keys, Instant expiresAt) { }

    public record VerifiedGoogleIdentity(String subject, String email, String name, String picture,
                                         long issuedAtEpochSeconds) { }
}
