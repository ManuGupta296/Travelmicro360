package com.example.bookingservice.controller;

import com.example.bookingservice.dto.request.ReservationRequest;
import com.example.bookingservice.dto.response.ReservationResponse;
import com.example.bookingservice.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservations")
@PreAuthorize("isAuthenticated()")
public class ReservationController {
    private final ReservationService service;
    public ReservationController(ReservationService service) { this.service = service; }

    @PostMapping public ResponseEntity<ReservationResponse> create(@Valid @RequestBody ReservationRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<ReservationResponse> update(@PathVariable Long id, @Valid @RequestBody ReservationRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @GetMapping("/{id}") public ResponseEntity<ReservationResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }
    @GetMapping public ResponseEntity<Page<ReservationResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
