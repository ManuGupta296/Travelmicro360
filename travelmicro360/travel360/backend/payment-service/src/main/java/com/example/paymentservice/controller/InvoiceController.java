package com.example.paymentservice.controller;

import com.example.paymentservice.dto.request.InvoiceRequest;
import com.example.paymentservice.dto.response.InvoiceResponse;
import com.example.paymentservice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {
    private final InvoiceService service;
    public InvoiceController(InvoiceService service) { this.service = service; }

    // Loosened from FINANCE_OFFICER/ADMIN so booking-service's Feign auto-invoice on approval
    // works regardless of the originating user's role. Finance authority remains enforced on mark-paid.
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody InvoiceRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
    public ResponseEntity<InvoiceResponse> update(@PathVariable Long id, @Valid @RequestBody InvoiceRequest req) { return ResponseEntity.ok(service.update(id, req)); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN','TRAVELER','TRAVEL_AGENT')")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN','TRAVELER','TRAVEL_AGENT')")
    public ResponseEntity<Page<InvoiceResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','ADMIN')")
    public InvoiceResponse markPaid(@PathVariable Long id) {
        return service.markPaid(id, null); // Finance "mark paid" defaults to WALLET
    }

    // Internal Feign call from booking-service: auto-pay a personal booking's invoice at checkout
    // with the traveler's chosen method. isAuthenticated mirrors the create() loosening above.
    @PutMapping("/{id}/settle")
    @PreAuthorize("isAuthenticated()")
    public InvoiceResponse settle(@PathVariable Long id, @RequestParam(required = false) String method) {
        return service.markPaid(id, method);
    }

    // Internal Feign call from booking-service on booking cancel.
    @PutMapping("/by-booking/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelByBookingId(@PathVariable Long bookingId) {
        service.cancelByBookingId(bookingId);
        return ResponseEntity.noContent().build();
    }
}
