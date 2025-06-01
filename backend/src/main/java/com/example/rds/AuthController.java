package com.example.rds;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.rds.context.AccountRepository;
import com.example.rds.model.Account;
import com.example.rds.service.AccountService;

import lombok.AllArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
	private AccountService service;
	private AccountRepository rep;

	private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

	@PostMapping("/google")
 public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> requestBody) {
     String token = requestBody.get("token");
     RestTemplate restTemplate = new RestTemplate();
     
     String url = GOOGLE_TOKEN_INFO_URL + token;
     Map<String, Object> userInfo = restTemplate.getForObject(url, Map.class);
if (userInfo != null && userInfo.containsKey("sub")) {
        Optional<Account> account = service.get((String) userInfo.get("sub"));

        if (account.isPresent()) {
            return ResponseEntity.ok(Map.of("user", account.get()));
        } else {
            // 未登録 → 200で必要な情報だけ返す（e.g., name）
            return ResponseEntity.ok(Map.of(
                "registered", false,
                "name", userInfo.get("name"),
                "email", userInfo.get("email"),
                "picture", userInfo.get("picture"),
                "googleSub", userInfo.get("sub")
            ));
        }
    } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
    }
}
}
