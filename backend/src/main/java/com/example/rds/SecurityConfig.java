package com.example.rds;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().and() // CORSの設定を有効化
            .csrf().disable() // CSRFを無効化（必要に応じて）
            .authorizeRequests()
            .requestMatchers("/api/**").permitAll() // APIへのアクセスを許可
            .anyRequest().authenticated(); // 他のエンドポイントは認証を要求

        return http.build();
    }
}

