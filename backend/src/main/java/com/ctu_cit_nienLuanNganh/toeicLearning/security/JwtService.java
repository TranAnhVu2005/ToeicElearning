package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import jakarta.annotation.PostConstruct;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    @PostConstruct
    void validateConfiguration() {
        if (EXPIRATION_TIME <= 0) {
            throw new IllegalStateException("JWT_EXPIRATION must be a positive duration in milliseconds");
        }
        try {
            getSignInKey();
        } catch (RuntimeException exception) {
            throw new IllegalStateException("JWT_SECRET must be Base64 and decode to at least 32 bytes");
        }
    }

    public String generateToken(User user)
    {
        return Jwts.builder()
                .setSubject(user.getId())
                .claim("authVersion", user.getAuthVersion() == null ? 0 : user.getAuthVersion())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    private Key getSignInKey(){
        byte[] keyBytes = Base64.getDecoder().decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) //Tham số đặc biệt, đưa Claims, trả về T, dùng sau này trong extractUserId bên dưới
    {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUserId(String token){
        return extractClaim(token, claims -> claims.getSubject());
    }

    public Date extractExpiration(String token)
    {
        return extractClaim(token, claims -> claims.getExpiration());
    }

    public String extractRole(String token)
    {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenExpired(String token)
    {
        return extractExpiration(token).before(new Date());
    }

    public boolean isTokenValid(String token, User user)
    {
        final String userId = extractUserId(token);
        Integer tokenVersion = extractClaim(token, claims -> claims.get("authVersion", Integer.class));
        int currentVersion = user.getAuthVersion() == null ? 0 : user.getAuthVersion();
        return userId.equals(user.getId()) && !isTokenExpired(token)
                && (tokenVersion == null ? currentVersion == 0 : tokenVersion == currentVersion);
    }
}
