package com.rmr.backend;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    /**
     * 書籍検索系(Google Books/NDLサーチ/openBD)が共有するRestTemplate。
     * 外部APIの応答遅延でリクエストが無期限に待たされないよう、
     * 接続・読み取りタイムアウトを明示的に設定する。
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(8))
                .build();
    }
}
