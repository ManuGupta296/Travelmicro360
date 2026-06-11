package com.example.complianceservice.controller;

import com.example.complianceservice.dto.request.ComplianceReportRequest;
import com.example.complianceservice.dto.response.ComplianceReportResponse;
import com.example.complianceservice.service.ComplianceReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/compliance-reports")
public class ComplianceReportController {

    private final ComplianceReportService service;

    public ComplianceReportController(ComplianceReportService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    public ResponseEntity<ComplianceReportResponse> create(@Valid @RequestBody ComplianceReportRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    public ResponseEntity<ComplianceReportResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN')")
    public ResponseEntity<Page<ComplianceReportResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
