package com.example.paymentservice.dto.response;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
public class SettlementResponse {
    private Long settlementId;
    private Long partnerId;
    private BigDecimal amount;
    private String status;
    private LocalDate settlementDate;
    private Long bookingId;
    private BigDecimal grossAmount;
    private BigDecimal platformMargin;
    private BigDecimal settlementAmount;
    private LocalDateTime createdAt;
    private String createdBy;
    public Long getSettlementId(){return settlementId;} public void setSettlementId(Long v){this.settlementId=v;}
    public Long getPartnerId(){return partnerId;} public void setPartnerId(Long v){this.partnerId=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
    public LocalDate getSettlementDate(){return settlementDate;} public void setSettlementDate(LocalDate v){this.settlementDate=v;}
    public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;}
    public BigDecimal getGrossAmount(){return grossAmount;} public void setGrossAmount(BigDecimal v){this.grossAmount=v;}
    public BigDecimal getPlatformMargin(){return platformMargin;} public void setPlatformMargin(BigDecimal v){this.platformMargin=v;}
    public BigDecimal getSettlementAmount(){return settlementAmount;} public void setSettlementAmount(BigDecimal v){this.settlementAmount=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
    public String getCreatedBy(){return createdBy;} public void setCreatedBy(String v){this.createdBy=v;}
}
