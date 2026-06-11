package com.example.bookingservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking extends AuditableEntity {
    public enum Status { PENDING, CONFIRMED, CANCELLED, COMPLETED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long bookingId;
    @Column(nullable = false) private Long customerId;
    @Column(nullable = false) private Long partnerId;
    @Column(nullable = false, length = 50) private String itemType;
    @Column(nullable = false) private LocalDate date;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private BookingPurpose purpose;
    @Column(length = 100) private String bookingCompany;
    private Long agentCustomerId;
    @Column(length = 150) private String approverManagerEmail;
    @Column(columnDefinition = "TEXT") private String passengers;
    private Long inventoryId; // persisted so cancel can increment back the right row
    @Version private Long version;

    public Booking() {}
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long v) { this.bookingId = v; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long v) { this.customerId = v; }
    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long v) { this.partnerId = v; }
    public String getItemType() { return itemType; }
    public void setItemType(String v) { this.itemType = v; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate v) { this.date = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { this.status = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public BookingPurpose getPurpose() { return purpose; }
    public void setPurpose(BookingPurpose v) { this.purpose = v; }
    public String getBookingCompany() { return bookingCompany; }
    public void setBookingCompany(String v) { this.bookingCompany = v; }
    public Long getAgentCustomerId() { return agentCustomerId; }
    public void setAgentCustomerId(Long v) { this.agentCustomerId = v; }
    public String getApproverManagerEmail() { return approverManagerEmail; }
    public void setApproverManagerEmail(String v) { this.approverManagerEmail = v; }
    public String getPassengers() { return passengers; }
    public void setPassengers(String v) { this.passengers = v; }
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long v) { this.inventoryId = v; }
    public Long getVersion() { return version; }
    public void setVersion(Long v) { this.version = v; }
}