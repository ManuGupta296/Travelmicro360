package com.example.bookingservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import com.example.bookingservice.client.dto.InventorySummaryResponse;

@Component
public class InventoryClientFallback implements InventoryClient {

    private static final Logger log = LoggerFactory.getLogger(InventoryClientFallback.class);

    @Override
    public InventorySummaryResponse getById(Long id) {
        log.warn("Inventory service unavailable - getById skipped for inventoryId={}", id);
        return null;
    }

    @Override
    public void decrement(Long id) {
        log.warn("Inventory service unavailable - decrement skipped for inventoryId={}", id);
    }

    @Override
    public void increment(Long id) {
        log.warn("Inventory service unavailable - increment skipped for inventoryId={}", id);
    }
}
