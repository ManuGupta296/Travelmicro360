package com.example.authservice.controller;

import com.example.authservice.dto.request.UserRequest;
import com.example.authservice.dto.response.UserResponse;
import com.example.authservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRAVEL_AGENT','CORPORATE_MANAGER','COMPLIANCE_OFFICER','FINANCE_OFFICER')")
    public ResponseEntity<Page<UserResponse>> getAll(Pageable pageable) { return ResponseEntity.ok(service.getAll(pageable)); }

    @GetMapping("/by-role-and-company")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> findByRoleAndCompany(
            @RequestParam String role, @RequestParam String companyName) {
        return ResponseEntity.ok(service.findByRoleAndCompany(role, companyName));
    }

    @GetMapping("/by-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> findByEmail(@RequestParam String email) {
        return ResponseEntity.ok(service.findByEmail(email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
