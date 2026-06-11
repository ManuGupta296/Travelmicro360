package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.AuditLogCreateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ComplianceClientFallback implements ComplianceClient {

    private static final Logger log = LoggerFactory.getLogger(ComplianceClientFallback.class);

    @Override
    public void logAudit(AuditLogCreateRequest req) {
        log.error("Compliance service unavailable - audit log dropped (action={}, entityType={}, entityId={})",
                req.getAction(), req.getEntityType(), req.getEntityId());
    }
}
