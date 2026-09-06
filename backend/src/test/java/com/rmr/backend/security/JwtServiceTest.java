package com.rmr.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.rmr.backend.security.JwtService.RegistrationClaims;

import io.jsonwebtoken.JwtException;

class JwtServiceTest {

	private static final String SECRET = "test-only-secret-key-with-at-least-32-bytes-of-length!!";

	private final JwtService jwtService = new JwtService(SECRET);

	@Test
	void sessionTokenRoundTripReturnsSameUserId() {
		String token = jwtService.createSessionToken(42);

		Integer userId = jwtService.parseSessionToken(token);

		assertEquals(42, userId);
	}

	@Test
	void registrationTokenRoundTripReturnsSameClaims() {
		String token = jwtService.createRegistrationToken("google-sub-123", "Taro", "https://example.com/pic.png");

		RegistrationClaims claims = jwtService.parseRegistrationToken(token);

		assertEquals("google-sub-123", claims.googleSub());
		assertEquals("Taro", claims.name());
		assertEquals("https://example.com/pic.png", claims.picture());
	}

	@Test
	void sessionTokenCannotBeUsedAsRegistrationToken() {
		String token = jwtService.createSessionToken(42);

		assertThrows(JwtException.class, () -> jwtService.parseRegistrationToken(token));
	}

	@Test
	void registrationTokenCannotBeUsedAsSessionToken() {
		String token = jwtService.createRegistrationToken("google-sub-123", "Taro", "https://example.com/pic.png");

		assertThrows(JwtException.class, () -> jwtService.parseSessionToken(token));
	}

	@Test
	void tokenSignedWithDifferentSecretIsRejected() {
		JwtService otherService = new JwtService("another-secret-key-with-at-least-32-bytes-length!!!!");
		String token = otherService.createSessionToken(1);

		assertThrows(JwtException.class, () -> jwtService.parseSessionToken(token));
	}
}
