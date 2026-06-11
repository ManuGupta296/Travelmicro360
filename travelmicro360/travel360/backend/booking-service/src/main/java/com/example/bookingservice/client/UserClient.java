package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.UserSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "auth-service", fallback = UserClientFallback.class)
public interface UserClient {

    @GetMapping("/api/v1/users/by-role-and-company")
    UserSummaryResponse findByRoleAndCompany(
            @RequestParam("role") String role,
            @RequestParam("companyName") String companyName);

    @GetMapping("/api/v1/users/{id}")
    UserSummaryResponse getById(@PathVariable("id") Long id);

    @GetMapping("/api/v1/users/by-email")
    UserSummaryResponse getByEmail(@RequestParam("email") String email);
}
