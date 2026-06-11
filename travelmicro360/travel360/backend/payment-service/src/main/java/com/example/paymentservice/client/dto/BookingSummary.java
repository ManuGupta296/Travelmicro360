package com.example.paymentservice.client.dto;

import java.math.BigDecimal;

public class BookingSummary {
    private Long bookingId;
    private Long customerId;
    private Long partnerId;
    private BigDecimal amount;

    public BookingSummary() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
