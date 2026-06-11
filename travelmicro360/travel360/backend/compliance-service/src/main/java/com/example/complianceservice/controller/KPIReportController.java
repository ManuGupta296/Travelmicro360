package com.example.complianceservice.controller;

import com.example.complianceservice.dto.request.KPIReportRequest;
import com.example.complianceservice.dto.response.KPIReportResponse;
import com.example.complianceservice.service.KPIReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kpi-reports")
@PreAuthorize("hasAnyRole('COMPLIANCE_OFFICER','ADMIN','FINANCE_OFFICER')")
public class KPIReportController {

    private final KPIReportService service;

    public KPIReportController(KPIReportService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<KPIReportResponse> create(@Valid @RequestBody KPIReportRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KPIReportResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<KPIReportResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
