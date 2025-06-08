package com.example.rds;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.rds.model.Account;
import com.example.rds.service.AccountService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private  final AccountService service;

	@Value("${google.token.info.url}")
    private String googleTokenInfoUrl;


    public AuthController(AccountService service) {
        this.service = service;
    }
    
	@PostMapping("/google")
 public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> requestBody) {
     String token = requestBody.get("token");
     RestTemplate restTemplate = new RestTemplate();
     
     String url = googleTokenInfoUrl + token;
     Map<String, Object> userInfo = restTemplate.getForObject(url, Map.class);
if (userInfo != null && userInfo.containsKey("sub")) {
        Optional<Account> account = service.get((String) userInfo.get("sub"));

        if (account.isPresent()) {
            return ResponseEntity.ok(Map.of("user", account.get()));
        } else {
            return ResponseEntity.ok(Map.of(
                "registered", false,
                "name", userInfo.get("name"),
                "picture", userInfo.get("picture"),
                "googleSub", userInfo.get("sub")
            ));
        }
    } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
    }
}
}
