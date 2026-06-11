package com.example.bookingservice.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItineraryResponse {
    private Long itineraryId;
    private Long customerId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private String status;
    private String bookings;
    private LocalDateTime createdAt;
    private String createdBy;
    public Long getItineraryId() { return itineraryId; } public void setItineraryId(Long v) { this.itineraryId = v; }
    public Long getCustomerId() { return customerId; } public void setCustomerId(Long v) { this.customerId = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate v) { this.startDate = v; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate v) { this.endDate = v; }
    public String getNotes() { return notes; } public void setNotes(String v) { this.notes = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getBookings() { return bookings; } public void setBookings(String v) { this.bookings = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public String getCreatedBy() { return createdBy; } public void setCreatedBy(String v) { this.createdBy = v; }
}