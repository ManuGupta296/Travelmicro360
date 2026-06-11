package com.example.bookingservice.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationResponse {
    private Long reservationId;
    private Long bookingId;
    private Long inventoryId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String status;
    private Integer guestCount;
    private LocalDateTime createdAt;
    private String createdBy;
    public Long getReservationId() { return reservationId; } public void setReservationId(Long v) { this.reservationId = v; }
    public Long getBookingId() { return bookingId; } public void setBookingId(Long v) { this.bookingId = v; }
    public Long getInventoryId() { return inventoryId; } public void setInventoryId(Long v) { this.inventoryId = v; }
    public LocalDate getCheckIn() { return checkIn; } public void setCheckIn(LocalDate v) { this.checkIn = v; }
    public LocalDate getCheckOut() { return checkOut; } public void setCheckOut(LocalDate v) { this.checkOut = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public Integer getGuestCount() { return guestCount; } public void setGuestCount(Integer v) { this.guestCount = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public String getCreatedBy() { return createdBy; } public void setCreatedBy(String v) { this.createdBy = v; }
}