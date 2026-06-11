package com.example.bookingservice.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReservationRequest {
    @NotNull private Long bookingId;
    @NotNull private Long inventoryId;
    @NotNull private LocalDate checkIn;
    @NotNull private LocalDate checkOut;
    private Integer guestCount;
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long v) { this.bookingId = v; }
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long v) { this.inventoryId = v; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate v) { this.checkIn = v; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate v) { this.checkOut = v; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer v) { this.guestCount = v; }
}