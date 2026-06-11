package com.example.paymentservice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="invoices")
public class Invoice extends AuditableEntity {
    public enum Status { DRAFT, SENT, PAID, OVERDUE, CANCELLED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long invoiceId;
    @Column(nullable=false) private Long bookingId;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    public Invoice(){}
    public Long getInvoiceId(){return invoiceId;} public void setInvoiceId(Long v){this.invoiceId=v;}
    public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
    public LocalDate getIssuedDate(){return issuedDate;} public void setIssuedDate(LocalDate v){this.issuedDate=v;}
    public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){this.dueDate=v;}
}