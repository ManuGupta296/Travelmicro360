package com.example.paymentservice.service.impl;
import com.example.paymentservice.dto.request.SettlementRequest;
import com.example.paymentservice.dto.response.SettlementResponse;
import com.example.paymentservice.entity.Settlement;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.exception.ResourceNotFoundException;
import com.example.paymentservice.repository.SettlementRepository;
import com.example.paymentservice.service.SettlementService;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.client.dto.AuditLogCreateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
@Service
public class SettlementServiceImpl implements SettlementService {
    private static final Logger log = LoggerFactory.getLogger(SettlementServiceImpl.class);
    private final SettlementRepository repo;
    private final ComplianceClient complianceClient;
    public SettlementServiceImpl(SettlementRepository repo, ComplianceClient complianceClient){this.repo=repo;this.complianceClient=complianceClient;}

    @Override public SettlementResponse create(SettlementRequest req){
        log.info("Creating settlement: partnerId={}, bookingId={}, gross={}, margin={}, net={}",
                req.getPartnerId(), req.getBookingId(), req.getGrossAmount(), req.getPlatformMargin(), req.getSettlementAmount());
        Settlement s=new Settlement();
        s.setPartnerId(req.getPartnerId());
        s.setStatus(Settlement.Status.PENDING);
        s.setSettlementDate(req.getSettlementDate()!=null?req.getSettlementDate():LocalDate.now());
        s.setBookingId(req.getBookingId());
        s.setGrossAmount(req.getGrossAmount());
        s.setPlatformMargin(req.getPlatformMargin());
        s.setSettlementAmount(req.getSettlementAmount());
        // amount column kept for backward compat — mirror settlementAmount when provided, else fall back to request.amount
        s.setAmount(req.getSettlementAmount() != null ? req.getSettlementAmount() : req.getAmount());
        return toRes(repo.save(s));
    }

    @Override public SettlementResponse update(Long id, SettlementRequest req){
        Settlement s=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Settlement not found: "+id));
        s.setPartnerId(req.getPartnerId());
        s.setAmount(req.getAmount());
        if(req.getSettlementDate()!=null) s.setSettlementDate(req.getSettlementDate());
        return toRes(repo.save(s));
    }

    @Override
    public SettlementResponse complete(Long id) {
        log.info("Completing settlement: {}", id);
        Settlement s = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Settlement not found: " + id));
        if (s.getStatus() == Settlement.Status.PROCESSED) {
            throw new BadRequestException("Settlement is already processed");
        }
        if (s.getStatus() != Settlement.Status.PENDING) {
            throw new BadRequestException("Cannot complete settlement in status: " + s.getStatus());
        }
        s.setStatus(Settlement.Status.PROCESSED);
        Settlement saved = repo.save(s);
        // Audit — mirror the other money-flow actions (MARK_PAID/PAYMENT_COMPLETED/REFUND/SETTLEMENT_REVERSED).
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "SETTLEMENT_PROCESSED", "Settlement", saved.getSettlementId(), currentUserEmail(),
                    "Settlement " + saved.getSettlementId() + " processed (partner payout completed) for booking " + saved.getBookingId()));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for settlement {} process: {}", saved.getSettlementId(), e.getMessage());
        }
        return toRes(saved);
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

    @Override
    public void reverseByBookingId(Long bookingId) {
        log.info("Reversing settlements for booking: {}", bookingId);
        List<Settlement> matches = repo.findByBookingId(bookingId);
        for (Settlement s : matches) {
            if (s.getStatus() == Settlement.Status.FAILED) {
                log.info("Settlement {} already FAILED — skip (idempotent)", s.getSettlementId());
                continue;
            }
            s.setStatus(Settlement.Status.FAILED);
            repo.save(s);
            log.info("Settlement {} marked FAILED (reversed due to refund on booking {})",
                    s.getSettlementId(), bookingId);
        }
    }

    @Override public SettlementResponse getById(Long id){ return toRes(repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Settlement not found: "+id))); }
    @Override public Page<SettlementResponse> getAll(Pageable p){ return repo.findAll(p).map(this::toRes); }
    @Override public void delete(Long id){ repo.deleteById(id); }

    private SettlementResponse toRes(Settlement s){
        SettlementResponse r=new SettlementResponse();
        r.setSettlementId(s.getSettlementId());
        r.setPartnerId(s.getPartnerId());
        r.setAmount(s.getAmount());
        r.setStatus(s.getStatus().name());
        r.setSettlementDate(s.getSettlementDate());
        r.setBookingId(s.getBookingId());
        r.setGrossAmount(s.getGrossAmount());
        r.setPlatformMargin(s.getPlatformMargin());
        r.setSettlementAmount(s.getSettlementAmount());
        r.setCreatedAt(s.getCreatedAt());
        r.setCreatedBy(s.getCreatedBy());
        return r;
    }
}
