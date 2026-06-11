package com.example.bookingservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
public class Reservation extends AuditableEntity {
    public enum Status { HELD, CONFIRMED, CANCELLED, EXPIRED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long reservationId;
    @Column(nullable = false) private Long bookingId;
    @Column(nullable = false) private Long inventoryId;
    @Column(nullable = false) private LocalDate checkIn;
    @Column(nullable = false) private LocalDate checkOut;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    private Integer guestCount;

    public Reservation() {}
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long v) { this.reservationId = v; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long v) { this.bookingId = v; }
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long v) { this.inventoryId = v; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate v) { this.checkIn = v; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate v) { this.checkOut = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { this.status = v; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer v) { this.guestCount = v; }
}