package com.example.paymentservice.dto.request;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
public class InvoiceRequest { @NotNull private Long bookingId; @NotNull private BigDecimal amount; private LocalDate issuedDate; private LocalDate dueDate; public Long getBookingId(){return bookingId;} public void setBookingId(Long v){this.bookingId=v;} public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){this.amount=v;} public LocalDate getIssuedDate(){return issuedDate;} public void setIssuedDate(LocalDate v){this.issuedDate=v;} public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){this.dueDate=v;} }