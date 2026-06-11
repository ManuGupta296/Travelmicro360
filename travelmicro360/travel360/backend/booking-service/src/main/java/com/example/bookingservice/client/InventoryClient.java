package com.example.bookingservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import com.example.bookingservice.client.dto.InventorySummaryResponse;

@FeignClient(name = "inventory-service", fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @GetMapping("/api/v1/inventories/{id}")
    InventorySummaryResponse getById(@PathVariable("id") Long id);

    @PutMapping("/api/v1/inventories/{id}/decrement")
    void decrement(@PathVariable("id") Long id);

    @PutMapping("/api/v1/inventories/{id}/increment")
    void increment(@PathVariable("id") Long id);
}
