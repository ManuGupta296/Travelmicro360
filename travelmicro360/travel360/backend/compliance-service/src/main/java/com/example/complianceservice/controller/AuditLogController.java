package com.example.complianceservice.controller;

import com.example.complianceservice.dto.request.AuditLogRequest;
import com.example.complianceservice.dto.response.AuditLogResponse;
import com.example.complianceservice.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    // Writes are system-recorded (called by other services on behalf of the acting user).
    // Any authenticated principal may write; reads remain restricted to compliance/admin.
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuditLogResponse> create(@Valid @RequestBody AuditLogRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    public ResponseEntity<AuditLogResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    public ResponseEntity<Page<AuditLogResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
