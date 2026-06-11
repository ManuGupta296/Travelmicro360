package com.example.bookingservice.controller;

import com.example.bookingservice.dto.request.BookingRequest;
import com.example.bookingservice.dto.response.BookingResponse;
import com.example.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service = service; }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRAVELER','TRAVEL_AGENT','ADMIN')")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('TRAVELER','TRAVEL_AGENT','ADMIN')")
    public ResponseEntity<BookingResponse> checkout(@Valid @RequestBody BookingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CORPORATE_MANAGER','TRAVEL_AGENT')")
    public ResponseEntity<BookingResponse> update(@PathVariable Long id, @Valid @RequestBody BookingRequest req) { return ResponseEntity.ok(service.update(id, req)); }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BookingResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAVELER','TRAVEL_AGENT','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('CORPORATE_MANAGER','ADMIN')")
    public BookingResponse approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('CORPORATE_MANAGER','ADMIN')")
    public BookingResponse reject(@PathVariable Long id) {
        return service.reject(id);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('TRAVELER','TRAVEL_AGENT','CORPORATE_MANAGER','ADMIN')")
    public BookingResponse cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}
