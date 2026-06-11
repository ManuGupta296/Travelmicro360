package com.example.bookingservice.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingRequest {
    @NotNull private Long customerId;
    @NotNull private Long partnerId;
    @NotNull private String itemType;
    @NotNull private LocalDate date;
    @NotNull private BigDecimal amount;
    private String purpose;
    private String bookingCompany;
    private Long agentCustomerId;
    private String approverManagerEmail;
    private Long inventoryId; // optional — when provided, booking-service decrements inventory on create
    private String passengers; // optional — JSON-stringified array of passenger details
    private String paymentMethod; // optional — UPI / CREDIT_CARD / NET_BANKING / WALLET; used to auto-pay personal bookings
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long v) { this.customerId = v; }
    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long v) { this.partnerId = v; }
    public String getItemType() { return itemType; }
    public void setItemType(String v) { this.itemType = v; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate v) { this.date = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String v) { this.purpose = v; }
    public String getBookingCompany() { return bookingCompany; }
    public void setBookingCompany(String v) { this.bookingCompany = v; }
    public Long getAgentCustomerId() { return agentCustomerId; }
    public void setAgentCustomerId(Long v) { this.agentCustomerId = v; }
    public String getApproverManagerEmail() { return approverManagerEmail; }
    public void setApproverManagerEmail(String v) { this.approverManagerEmail = v; }
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long v) { this.inventoryId = v; }
    public String getPassengers() { return passengers; }
    public void setPassengers(String v) { this.passengers = v; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }
}