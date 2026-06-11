package com.example.paymentservice.controller;

import com.example.paymentservice.dto.request.PaymentRequest;
import com.example.paymentservice.dto.response.PaymentResponse;
import com.example.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) { this.service = service; }

    @PostMapping public ResponseEntity<PaymentResponse> create(@Valid @RequestBody PaymentRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<PaymentResponse> update(@PathVariable Long id, @Valid @RequestBody PaymentRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @GetMapping("/{id}") public ResponseEntity<PaymentResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }
    @GetMapping public ResponseEntity<Page<PaymentResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
    public PaymentResponse refund(@PathVariable Long id) {
        return service.refund(id);
    }
}
