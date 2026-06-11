package com.example.inventoryservice.service;
import com.example.inventoryservice.dto.request.InventoryRequest;
import com.example.inventoryservice.dto.response.InventoryResponse;
import org.springframework.data.domain.*;
public interface InventoryService {
    InventoryResponse create(InventoryRequest req);
    InventoryResponse update(Long id,InventoryRequest req);
    InventoryResponse getById(Long id);
    Page<InventoryResponse> getAll(Pageable p);
    void delete(Long id);
    InventoryResponse decrement(Long id);
    InventoryResponse increment(Long id);
}
