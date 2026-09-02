package com.rmr.backend.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** JWTの発行・検証を行います。 */
@Service
public class JwtService {

    private static final String CLAIM_PURPOSE = "purpose";
    private static final String PURPOSE_SESSION = "session";
    private static final String PURPOSE_REGISTRATION = "pending_registration";

    private static final long SESSION_TTL_SECONDS = 60L * 60 * 24 * 30; // 30日
    private static final long REGISTRATION_TTL_SECONDS = 60L * 15; // 15分

    private final SecretKey signingKey;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** ログイン済みユーザ用のセッショントークンを発行します。 */
    public String createSessionToken(Integer userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(CLAIM_PURPOSE, PURPOSE_SESSION)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(SESSION_TTL_SECONDS)))
                .signWith(signingKey)
                .compact();
    }

    /** セッショントークンを検証し、userIdを返します。不正・期限切れの場合はJwtExceptionを投げます。 */
    public Integer parseSessionToken(String token) {
        Claims claims = parseClaims(token);
        if (!PURPOSE_SESSION.equals(claims.get(CLAIM_PURPOSE, String.class))) {
            throw new JwtException("Unexpected token purpose");
        }
        return Integer.valueOf(claims.getSubject());
    }

    /** Google認証済みだが未登録のユーザ向けに、登録専用の短命トークンを発行します。 */
    public String createRegistrationToken(String googleSub, String name, String picture) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claim(CLAIM_PURPOSE, PURPOSE_REGISTRATION)
                .claim("googleSub", googleSub)
                .claim("name", name)
                .claim("picture", picture)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(REGISTRATION_TTL_SECONDS)))
                .signWith(signingKey)
                .compact();
    }

    /** 登録用トークンを検証し、Google情報を返します。不正・期限切れの場合はJwtExceptionを投げます。 */
    public RegistrationClaims parseRegistrationToken(String token) {
        Claims claims = parseClaims(token);
        if (!PURPOSE_REGISTRATION.equals(claims.get(CLAIM_PURPOSE, String.class))) {
            throw new JwtException("Unexpected token purpose");
        }
        return new RegistrationClaims(
                claims.get("googleSub", String.class),
                claims.get("name", String.class),
                claims.get("picture", String.class));
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public record RegistrationClaims(String googleSub, String name, String picture) {
    }
}
