package com.example.bookingservice.client.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateInvoiceRequest {
    private Long bookingId;
    private BigDecimal amount;
    private LocalDate issuedDate;
    private LocalDate dueDate;

    public CreateInvoiceRequest() {}
    public CreateInvoiceRequest(Long bookingId, BigDecimal amount, LocalDate issuedDate, LocalDate dueDate) {
        this.bookingId = bookingId; this.amount = amount;
        this.issuedDate = issuedDate; this.dueDate = dueDate;
    }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
