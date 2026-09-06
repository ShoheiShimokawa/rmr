package com.rmr.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.rmr.backend.security.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // ログイン・新規登録は未認証で呼べる必要がある
                .requestMatchers(HttpMethod.POST, "/api/auth/google", "/api/account/register").permitAll()
                // 通知は本人専用のため認証必須
                .requestMatchers(HttpMethod.GET, "/api/notification").authenticated()
                // その他の参照系(プロフィール・投稿・読書記録など)は現状通り公開
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                // 上記以外の /api/** (更新・作成・削除系) は認証必須
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
