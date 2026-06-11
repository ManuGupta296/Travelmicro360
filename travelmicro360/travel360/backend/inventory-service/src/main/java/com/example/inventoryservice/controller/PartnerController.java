package com.example.inventoryservice.controller;
import com.example.inventoryservice.dto.request.PartnerRequest;
import com.example.inventoryservice.dto.response.PartnerResponse;
import com.example.inventoryservice.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/partners")
public class PartnerController {
    private final PartnerService service;
    public PartnerController(PartnerService service){this.service=service;}

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartnerResponse> create(@Valid @RequestBody PartnerRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));}

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartnerResponse> update(@PathVariable Long id,@Valid @RequestBody PartnerRequest req){return ResponseEntity.ok(service.update(id,req));}

    @GetMapping("/{id}") @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PartnerResponse> getById(@PathVariable Long id){return ResponseEntity.ok(service.getById(id));}

    @GetMapping @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PartnerResponse>> getAll(Pageable pageable){return ResponseEntity.ok(service.getAll(pageable));}

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
