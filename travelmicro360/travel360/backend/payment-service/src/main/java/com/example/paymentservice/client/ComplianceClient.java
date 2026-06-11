package com.example.paymentservice.client;

import com.example.paymentservice.client.dto.AuditLogCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "compliance-service", fallback = ComplianceClientFallback.class)
public interface ComplianceClient {

    @PostMapping("/api/v1/audit-logs")
    void logAudit(@RequestBody AuditLogCreateRequest req);
}
