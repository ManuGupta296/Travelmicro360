package com.example.paymentservice.service.impl;
import com.example.paymentservice.client.BookingClient;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.client.NotificationClient;
import com.example.paymentservice.client.dto.AuditLogCreateRequest;
import com.example.paymentservice.client.dto.BookingSummary;
import com.example.paymentservice.client.dto.NotificationCreateRequest;
import com.example.paymentservice.dto.request.PaymentRequest;
import com.example.paymentservice.dto.request.SettlementRequest;
import com.example.paymentservice.dto.response.PaymentResponse;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.exception.ResourceNotFoundException;
import com.example.paymentservice.repository.PaymentRepository;
import com.example.paymentservice.service.PaymentService;
import com.example.paymentservice.service.SettlementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private static final BigDecimal MARGIN_RATE = new BigDecimal("0.10");
    private final PaymentRepository repo;
    private final NotificationClient notificationClient;
    private final BookingClient bookingClient;
    private final SettlementService settlementService;
    private final ComplianceClient complianceClient;

    public PaymentServiceImpl(PaymentRepository repo, NotificationClient notificationClient,
                              BookingClient bookingClient, SettlementService settlementService,
                              ComplianceClient complianceClient) {
        this.repo = repo;
        this.notificationClient = notificationClient;
        this.bookingClient = bookingClient;
        this.settlementService = settlementService;
        this.complianceClient = complianceClient;
    }

    private String currentUserEmail() {
        try {
            Authentication a = SecurityContextHolder.getContext().getAuthentication();
            if (a != null && a.isAuthenticated() && a.getName() != null && !"anonymousUser".equals(a.getName())) {
                return a.getName();
            }
        } catch (Exception ignored) {}
        return "system";
    }

    @Override public PaymentResponse create(PaymentRequest req){
        log.info("Creating payment: bookingId={}, amount={}", req.getBookingId(), req.getAmount());
        Payment p=new Payment();
        p.setBookingId(req.getBookingId()); p.setAmount(req.getAmount());
        p.setMethod(Payment.Method.valueOf(req.getMethod()!=null?req.getMethod():"UPI"));
        p.setStatus(Payment.Status.COMPLETED);
        p.setTransactionRef(req.getTransactionRef());
        p.setPaidAt(LocalDateTime.now());
        Payment saved = repo.save(p);

        // Auto-create Settlement (10% platform margin / 90% partner). Failure must NOT fail the payment.
        // Also capture the booking's customer so the payment notification reaches the right user.
        Long notifyUserId = null;
        try {
            BookingSummary booking = bookingClient.getBooking(saved.getBookingId());
            if (booking != null) notifyUserId = booking.getCustomerId();
            if (booking != null && booking.getPartnerId() != null) {
                BigDecimal gross = saved.getAmount();
                BigDecimal margin = gross.multiply(MARGIN_RATE).setScale(2, RoundingMode.HALF_UP);
                BigDecimal net = gross.subtract(margin).setScale(2, RoundingMode.HALF_UP);
                SettlementRequest sr = new SettlementRequest();
                sr.setPartnerId(booking.getPartnerId());
                sr.setBookingId(saved.getBookingId());
                sr.setGrossAmount(gross);
                sr.setPlatformMargin(margin);
                sr.setSettlementAmount(net);
                sr.setAmount(net); // legacy column = net partner amount
                sr.setSettlementDate(LocalDate.now());
                settlementService.create(sr);
            } else {
                log.warn("Settlement skipped for booking {} — BookingClient returned null/no partnerId (fallback fired)", saved.getBookingId());
            }
        } catch (Exception e) {
            log.warn("Settlement auto-create failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        try {
            if (notifyUserId != null) {
                notificationClient.createNotification(new NotificationCreateRequest(
                        notifyUserId, "PAYMENT_RECEIVED", "Payment received",
                        "Payment of " + saved.getAmount() + " received for booking " + saved.getBookingId()));
            } else {
                log.warn("Payment notification skipped for booking {} — customer unknown", saved.getBookingId());
            }
        } catch (Exception e) {
            log.warn("Payment notification failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        // Audit — single PAYMENT_COMPLETED event covers the payment+settlement transition.
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "PAYMENT_COMPLETED", "Payment", saved.getPaymentId(), currentUserEmail(),
                    "Payment " + saved.getPaymentId() + " completed for booking " + saved.getBookingId()));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for payment {} create: {}", saved.getPaymentId(), e.getMessage());
        }

        return toRes(saved);
    }

    @Override public PaymentResponse update(Long id, PaymentRequest req){
        Payment p=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Payment not found: "+id));
        p.setBookingId(req.getBookingId()); p.setAmount(req.getAmount());
        if(req.getMethod()!=null) p.setMethod(Payment.Method.valueOf(req.getMethod()));
        if(req.getTransactionRef()!=null) p.setTransactionRef(req.getTransactionRef());
        return toRes(repo.save(p));
    }

    @Override public PaymentResponse getById(Long id){ return toRes(repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Payment not found: "+id))); }
    @Override public Page<PaymentResponse> getAll(Pageable p){ return repo.findAll(p).map(this::toRes); }
    @Override public void delete(Long id){ repo.deleteById(id); }

    @Override
    public PaymentResponse refund(Long id) {
        log.info("Refunding payment: {}", id);
        Payment p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        if (p.getStatus() == Payment.Status.FAILED) {
            throw new BadRequestException("Cannot refund a failed payment");
        }
        if (p.getStatus() == Payment.Status.REFUNDED) {
            throw new BadRequestException("Payment already refunded");
        }
        p.setStatus(Payment.Status.REFUNDED);
        Payment saved = repo.save(p);

        // Reverse linked settlement(s). Failure must NOT roll back the refund.
        try {
            settlementService.reverseByBookingId(saved.getBookingId());
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "SETTLEMENT_REVERSED", "Settlement", saved.getBookingId(), currentUserEmail(),
                    "Settlements for booking " + saved.getBookingId() + " reversed due to refund of payment " + saved.getPaymentId()));
        } catch (Exception e) {
            log.warn("Settlement reversal failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        try {
            BookingSummary booking = bookingClient.getBooking(saved.getBookingId());
            Long notifyUserId = booking != null ? booking.getCustomerId() : null;
            if (notifyUserId != null) {
                notificationClient.createNotification(new NotificationCreateRequest(
                        notifyUserId, "BOOKING_CANCELLED", "Refund processed",
                        "Your payment of " + saved.getAmount() + " has been refunded."));
            } else {
                log.warn("Refund notification skipped for booking {} — customer unknown", saved.getBookingId());
            }
        } catch (Exception e) {
            log.warn("Refund notification failed for payment {}: {}", saved.getPaymentId(), e.getMessage());
        }

        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "REFUND", "Payment", saved.getPaymentId(), currentUserEmail(),
                    "Payment " + saved.getPaymentId() + " refunded"));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for payment {} refund: {}", saved.getPaymentId(), e.getMessage());
        }

        return toRes(saved);
    }

    private PaymentResponse toRes(Payment p){
        PaymentResponse r=new PaymentResponse();
        r.setPaymentId(p.getPaymentId()); r.setBookingId(p.getBookingId()); r.setAmount(p.getAmount());
        r.setMethod(p.getMethod().name()); r.setStatus(p.getStatus().name());
        r.setTransactionRef(p.getTransactionRef()); r.setPaidAt(p.getPaidAt()); r.setCreatedAt(p.getCreatedAt()); r.setCreatedBy(p.getCreatedBy());
        return r;
    }
}
