package com.example.bookingservice.client.dto;

// Minimal view of the invoice returned by payment-service on create — we only need the id to settle it.
public class InvoiceResponse {
    private Long invoiceId;
    private Long bookingId;
    private String status;

    public InvoiceResponse() {}
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
