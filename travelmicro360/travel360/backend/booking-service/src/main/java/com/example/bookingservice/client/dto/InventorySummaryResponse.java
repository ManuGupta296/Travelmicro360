package com.example.bookingservice.client.dto;

/**
 * Minimal view of an inventory item, fetched by booking-service to enrich
 * BookingResponse with a human-readable name and route. Only the fields we
 * actually use are declared; unknown fields in the inventory response are
 * ignored by the configured Jackson deserializer.
 */
public class InventorySummaryResponse {
    private Long inventoryId;
    private String name;
    private String itemType;
    private String details;

    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long v) { this.inventoryId = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getItemType() { return itemType; }
    public void setItemType(String v) { this.itemType = v; }
    public String getDetails() { return details; }
    public void setDetails(String v) { this.details = v; }
}
