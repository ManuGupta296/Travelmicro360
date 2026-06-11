package com.example.authservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is handled by the API Gateway — do NOT add CORS here to avoid duplicate headers
@Configuration
public class WebConfig implements WebMvcConfigurer {
}