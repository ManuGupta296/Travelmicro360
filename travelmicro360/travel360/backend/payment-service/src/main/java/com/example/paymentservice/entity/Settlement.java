package com.example.paymentservice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="settlements", indexes = { @Index(name="idx_settlement_booking_id", columnList="bookingId") })
public class Settlement extends AuditableEntity {
    public enum Status { PENDING, PROCESSED, FAILED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long settlementId;
    @Column(nullable=false) private Long partnerId;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    private LocalDate settlementDate;
    private Long bookingId;
    @Column(precision=12,scale=2) private BigDecimal grossAmount;
    @Column(precision=12,scale=2) private BigDecimal platformMargin;
    @Column(precision=12,scale=2) private BigDecimal settlementAmount;
    public Settlement(){}
    public Long getSettlementId(){return settlementId;} public void setSettlementId(Long v){this.settlementId=v;}
    public Long getPartnerId(){return partnerId;} public void setPartnerId(Long v){this.partnerId=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
    public LocalDate getSettlementDate(){return settlementDate;} public void setSettlementDate(LocalDate v){this.settlementDate=v;}
    public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;}
    public BigDecimal getGrossAmount(){return grossAmount;} public void setGrossAmount(BigDecimal v){this.grossAmount=v;}
    public BigDecimal getPlatformMargin(){return platformMargin;} public void setPlatformMargin(BigDecimal v){this.platformMargin=v;}
    public BigDecimal getSettlementAmount(){return settlementAmount;} public void setSettlementAmount(BigDecimal v){this.settlementAmount=v;}
}
