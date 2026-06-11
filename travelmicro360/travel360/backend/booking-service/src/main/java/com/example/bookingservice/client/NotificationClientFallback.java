package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.NotificationCreateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NotificationClientFallback implements NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClientFallback.class);

    @Override
    public void createNotification(NotificationCreateRequest req) {
        log.error("Notification service unavailable - skipping notification for user {} (type={}, title={})",
                req.getUserId(), req.getType(), req.getTitle());
    }
}
