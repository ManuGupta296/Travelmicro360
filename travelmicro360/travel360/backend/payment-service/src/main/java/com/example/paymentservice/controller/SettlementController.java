package com.example.paymentservice.controller;

import com.example.paymentservice.dto.request.SettlementRequest;
import com.example.paymentservice.dto.response.SettlementResponse;
import com.example.paymentservice.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlements")
@PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
public class SettlementController {
    private final SettlementService service;
    public SettlementController(SettlementService service) { this.service = service; }

    @PostMapping public ResponseEntity<SettlementResponse> create(@Valid @RequestBody SettlementRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<SettlementResponse> update(@PathVariable Long id, @Valid @RequestBody SettlementRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
    public ResponseEntity<SettlementResponse> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.complete(id));
    }
    @GetMapping("/{id}") public ResponseEntity<SettlementResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }
    @GetMapping public ResponseEntity<Page<SettlementResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
