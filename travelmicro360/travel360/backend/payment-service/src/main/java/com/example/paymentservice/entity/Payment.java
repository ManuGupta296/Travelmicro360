package com.example.paymentservice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="payments")
public class Payment extends AuditableEntity {
    public enum Status { PENDING, COMPLETED, FAILED, REFUNDED }
    public enum Method { CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long paymentId;
    @Column(nullable=false) private Long bookingId;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Method method;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    @Column(length=100) private String transactionRef;
    private LocalDateTime paidAt;
    public Payment(){}
    public Long getPaymentId(){return paymentId;} public void setPaymentId(Long v){this.paymentId=v;}
    public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;}
    public Method getMethod(){return method;} public void setMethod(Method v){this.method=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
    public String getTransactionRef(){return transactionRef;} public void setTransactionRef(String v){this.transactionRef=v;}
    public LocalDateTime getPaidAt(){return paidAt;} public void setPaidAt(LocalDateTime v){this.paidAt=v;}
}