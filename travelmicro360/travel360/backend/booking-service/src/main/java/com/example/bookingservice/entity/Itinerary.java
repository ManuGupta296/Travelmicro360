package com.example.bookingservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "itineraries")
public class Itinerary extends AuditableEntity {
    public enum Status { DRAFT, CONFIRMED, CANCELLED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long itineraryId;
    @Column(nullable = false) private Long customerId;
    @Column(nullable = false, length = 100) private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    @Column(columnDefinition = "TEXT") private String notes;
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.CONFIRMED;
    @Column(length = 500) private String bookings;

    public Itinerary() {}
    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long v) { this.itineraryId = v; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long v) { this.customerId = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate v) { this.startDate = v; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate v) { this.endDate = v; }
    public String getNotes() { return notes; }
    public void setNotes(String v) { this.notes = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { this.status = v; }
    public String getBookings() { return bookings; }
    public void setBookings(String v) { this.bookings = v; }
}