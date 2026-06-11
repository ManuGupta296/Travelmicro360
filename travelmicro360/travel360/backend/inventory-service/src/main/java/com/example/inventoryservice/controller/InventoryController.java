package com.example.inventoryservice.controller;
import com.example.inventoryservice.dto.request.InventoryRequest;
import com.example.inventoryservice.dto.response.InventoryResponse;
import com.example.inventoryservice.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/inventories")
public class InventoryController {
    private final InventoryService service;
    public InventoryController(InventoryService service){this.service=service;}

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> create(@Valid @RequestBody InventoryRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));}

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> update(@PathVariable Long id,@Valid @RequestBody InventoryRequest req){return ResponseEntity.ok(service.update(id,req));}

    @GetMapping("/{id}") @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InventoryResponse> getById(@PathVariable Long id){return ResponseEntity.ok(service.getById(id));}

    @GetMapping @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InventoryResponse>> getAll(Pageable pageable){return ResponseEntity.ok(service.getAll(pageable));}

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}

    @PutMapping("/{id}/decrement")
    @PreAuthorize("isAuthenticated()")
    public InventoryResponse decrement(@PathVariable Long id) {
        return service.decrement(id);
    }

    @PutMapping("/{id}/increment")
    @PreAuthorize("isAuthenticated()")
    public InventoryResponse increment(@PathVariable Long id) {
        return service.increment(id);
    }
}
