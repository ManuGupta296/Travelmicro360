package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.UserSummaryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class UserClientFallback implements UserClient {

    private static final Logger log = LoggerFactory.getLogger(UserClientFallback.class);

    @Override
    public UserSummaryResponse findByRoleAndCompany(String role, String companyName) {
        log.warn("Auth service unavailable - user lookup failed for role={}, company={}", role, companyName);
        return null;
    }

    @Override
    public UserSummaryResponse getById(Long id) {
        log.warn("Auth service unavailable - user lookup by id failed for id={}", id);
        return null;
    }

    @Override
    public UserSummaryResponse getByEmail(String email) {
        log.warn("Auth service unavailable - user lookup by email failed for email={}", email);
        return null;
    }
}
