package com.rmr.backend;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.rmr.backend.model.Account;
import com.rmr.backend.security.JwtService;
import com.rmr.backend.service.AccountService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private  final AccountService service;
	private final JwtService jwtService;
	private final RestTemplate restTemplate;

	@Value("${google.token.info.url}")
    private String googleTokenInfoUrl;


    public AuthController(AccountService service, JwtService jwtService, RestTemplate restTemplate) {
        this.service = service;
        this.jwtService = jwtService;
        this.restTemplate = restTemplate;
    }

	@PostMapping("/google")
 public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> requestBody) {
     String token = requestBody.get("token");

     String url = googleTokenInfoUrl + token;
     Map<String, Object> userInfo = restTemplate.getForObject(url, Map.class);
if (userInfo != null && userInfo.containsKey("sub")) {
        Optional<Account> account = service.get((String) userInfo.get("sub"));

        if (account.isPresent()) {
            String sessionToken = jwtService.createSessionToken(account.get().getUserId());
            return ResponseEntity.ok(Map.of("user", account.get(), "sessionToken", sessionToken));
        } else {
            // 未登録ユーザ: 生のgoogleSubは返さず、署名付きの短命トークンに封入して返す。
            // /api/account/register はこのトークンを検証してGoogle情報を復元する(なりすまし登録の防止)。
            String registrationToken = jwtService.createRegistrationToken(
                    (String) userInfo.get("sub"),
                    (String) userInfo.get("name"),
                    (String) userInfo.get("picture"));
            return ResponseEntity.ok(Map.of(
                "registered", false,
                "name", userInfo.get("name"),
                "picture", userInfo.get("picture"),
                "registrationToken", registrationToken
            ));
        }
    } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
    }
}
}
