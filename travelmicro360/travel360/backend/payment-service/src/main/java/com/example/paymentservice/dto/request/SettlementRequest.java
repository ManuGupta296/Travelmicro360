package com.example.paymentservice.dto.request;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
public class SettlementRequest {
    @NotNull private Long partnerId;
    @NotNull private BigDecimal amount;
    private LocalDate settlementDate;
    private Long bookingId;
    private BigDecimal grossAmount;
    private BigDecimal platformMargin;
    private BigDecimal settlementAmount;
    public Long getPartnerId(){return partnerId;} public void setPartnerId(Long v){this.partnerId=v;}
    public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;}
    public LocalDate getSettlementDate(){return settlementDate;} public void setSettlementDate(LocalDate v){this.settlementDate=v;}
    public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;}
    public BigDecimal getGrossAmount(){return grossAmount;} public void setGrossAmount(BigDecimal v){this.grossAmount=v;}
    public BigDecimal getPlatformMargin(){return platformMargin;} public void setPlatformMargin(BigDecimal v){this.platformMargin=v;}
    public BigDecimal getSettlementAmount(){return settlementAmount;} public void setSettlementAmount(BigDecimal v){this.settlementAmount=v;}
}
