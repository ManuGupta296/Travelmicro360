package com.example.bookingservice.controller;

import com.example.bookingservice.dto.request.ItineraryRequest;
import com.example.bookingservice.dto.response.ItineraryResponse;
import com.example.bookingservice.service.ItineraryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/itineraries")
@PreAuthorize("isAuthenticated()")
public class ItineraryController {
    private final ItineraryService service;
    public ItineraryController(ItineraryService service) { this.service = service; }

    @PostMapping public ResponseEntity<ItineraryResponse> create(@Valid @RequestBody ItineraryRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<ItineraryResponse> update(@PathVariable Long id, @Valid @RequestBody ItineraryRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @GetMapping("/{id}") public ResponseEntity<ItineraryResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }
    @GetMapping public ResponseEntity<Page<ItineraryResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
