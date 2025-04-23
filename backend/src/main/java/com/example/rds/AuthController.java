package com.example.rds;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
//AuthController.java
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
     
     // Validate the token by calling Google's TokenInfo API
     String url = GOOGLE_TOKEN_INFO_URL + token;
     Map<String, Object> userInfo = restTemplate.getForObject(url, Map.class);

     if (userInfo != null && userInfo.containsKey("sub")) {
         // Here, 'sub' is a unique identifier for the Google account
    	 //もし存在するならそのマスタのuserIdを返す
    	 //存在しないならマスタに登録する
    	 Optional<Account>account=service.get((String)userInfo.get("sub"));
    	 Account user;
    	 if(account.isPresent()) {
    		 user=account.get();
    	 }else {
    		 var kari=Account.builder().googleSub((String)userInfo.get("sub")).email((String)userInfo.get("email"))
    				 .name((String)userInfo.get("name")).picture((String)userInfo.get("picture")).build();
    		user=service.register(kari);
    	 }
         return ResponseEntity.ok(Map.of("user",user));
     } else {
         return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
     }
 }
}
