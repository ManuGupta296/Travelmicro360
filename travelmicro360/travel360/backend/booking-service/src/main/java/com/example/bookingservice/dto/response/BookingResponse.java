package com.example.bookingservice.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {
    private Long bookingId;
    private Long customerId;
    private Long partnerId;
    private String itemType;
    private LocalDate date;
    private String status;
    private BigDecimal amount;
    private String purpose;
    private String bookingCompany;
    private String approverManagerEmail;
    private String passengers;
    private String createdBy;
    private LocalDateTime createdAt;
    private Long inventoryId;
    private String inventoryName;
    private String route;
    public Long getBookingId() { return bookingId; } public void setBookingId(Long v) { this.bookingId = v; }
    public Long getCustomerId() { return customerId; } public void setCustomerId(Long v) { this.customerId = v; }
    public Long getPartnerId() { return partnerId; } public void setPartnerId(Long v) { this.partnerId = v; }
    public String getItemType() { return itemType; } public void setItemType(String v) { this.itemType = v; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate v) { this.date = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { this.amount = v; }
    public String getPurpose() { return purpose; } public void setPurpose(String v) { this.purpose = v; }
    public String getBookingCompany() { return bookingCompany; } public void setBookingCompany(String v) { this.bookingCompany = v; }
    public String getApproverManagerEmail() { return approverManagerEmail; } public void setApproverManagerEmail(String v) { this.approverManagerEmail = v; }
    public String getPassengers() { return passengers; } public void setPassengers(String v) { this.passengers = v; }
    public String getCreatedBy() { return createdBy; } public void setCreatedBy(String v) { this.createdBy = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public Long getInventoryId() { return inventoryId; } public void setInventoryId(Long v) { this.inventoryId = v; }
    public String getInventoryName() { return inventoryName; } public void setInventoryName(String v) { this.inventoryName = v; }
    public String getRoute() { return route; } public void setRoute(String v) { this.route = v; }
}