package com.example.paymentservice.service.impl;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.client.dto.AuditLogCreateRequest;
import com.example.paymentservice.dto.request.InvoiceRequest;
import com.example.paymentservice.dto.request.PaymentRequest;
import com.example.paymentservice.dto.response.InvoiceResponse;
import com.example.paymentservice.entity.Invoice;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.exception.ResourceNotFoundException;
import com.example.paymentservice.repository.InvoiceRepository;
import com.example.paymentservice.service.InvoiceService;
import com.example.paymentservice.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class InvoiceServiceImpl implements InvoiceService {
    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);
    private final InvoiceRepository repo;
    private final PaymentService paymentService;
    private final ComplianceClient complianceClient;
    public InvoiceServiceImpl(InvoiceRepository repo, PaymentService paymentService, ComplianceClient complianceClient){
        this.repo=repo;
        this.paymentService=paymentService;
        this.complianceClient=complianceClient;
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

    @Override public InvoiceResponse create(InvoiceRequest req){
        log.info("Creating invoice: bookingId={}, amount={}", req.getBookingId(), req.getAmount());
        Invoice i=new Invoice(); i.setBookingId(req.getBookingId()); i.setAmount(req.getAmount());
        i.setStatus(Invoice.Status.SENT);
        i.setIssuedDate(req.getIssuedDate()!=null?req.getIssuedDate():LocalDate.now());
        i.setDueDate(req.getDueDate()!=null?req.getDueDate():LocalDate.now().plusDays(30));
        return toRes(repo.save(i));
    }

    @Override public InvoiceResponse update(Long id, InvoiceRequest req){
        Invoice i=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Invoice not found: "+id));
        i.setBookingId(req.getBookingId()); i.setAmount(req.getAmount());
        if(req.getIssuedDate()!=null) i.setIssuedDate(req.getIssuedDate());
        if(req.getDueDate()!=null) i.setDueDate(req.getDueDate());
        return toRes(repo.save(i));
    }

    @Override public InvoiceResponse getById(Long id){ return toRes(repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Invoice not found: "+id))); }
    @Override public Page<InvoiceResponse> getAll(Pageable p){ return repo.findAll(p).map(this::toRes); }
    @Override public void delete(Long id){ repo.deleteById(id); }

    @Override
    public InvoiceResponse markPaid(Long id, String method) {
        log.info("Marking invoice paid: {}", id);
        Invoice i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));
        if (i.getStatus() == Invoice.Status.PAID) {
            throw new BadRequestException("Invoice is already paid");
        }
        if (i.getStatus() == Invoice.Status.CANCELLED) {
            throw new BadRequestException("Cannot pay a cancelled invoice");
        }
        i.setStatus(Invoice.Status.PAID);
        Invoice saved = repo.save(i);

        // Auto-create the matching Payment row. Failure must NOT roll back the PAID status.
        try {
            PaymentRequest pr = new PaymentRequest();
            pr.setBookingId(saved.getBookingId());
            pr.setAmount(saved.getAmount());
            pr.setMethod(method != null && !method.isBlank() ? method : "WALLET");
            pr.setTransactionRef(UUID.randomUUID().toString());
            paymentService.create(pr);
        } catch (Exception e) {
            log.warn("Payment auto-create failed for invoice {}: {}", saved.getInvoiceId(), e.getMessage());
        }

        // Audit. Failure must NOT roll back the PAID status.
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "MARK_PAID", "Invoice", saved.getInvoiceId(), currentUserEmail(),
                    "Invoice " + saved.getInvoiceId() + " marked paid"));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for invoice {} mark-paid: {}", saved.getInvoiceId(), e.getMessage());
        }

        return toRes(saved);
    }

    @Override
    public void cancelByBookingId(Long bookingId) {
        log.info("Cancelling invoice for booking: {}", bookingId);
        repo.findByBookingId(bookingId).ifPresent(inv -> {
            if (inv.getStatus() == Invoice.Status.PAID) {
                log.warn("Skipping cancel — invoice {} for booking {} already PAID", inv.getInvoiceId(), bookingId);
                return;
            }
            if (inv.getStatus() == Invoice.Status.CANCELLED) return; // idempotent
            inv.setStatus(Invoice.Status.CANCELLED);
            Invoice saved = repo.save(inv);
            try {
                complianceClient.logAudit(new AuditLogCreateRequest(
                        "INVOICE_CANCELLED", "Invoice", saved.getInvoiceId(), currentUserEmail(),
                        "Invoice " + saved.getInvoiceId() + " cancelled due to booking " + bookingId + " cancellation"));
            } catch (Exception e) {
                log.warn("Audit dispatch failed for invoice {} cancel: {}", saved.getInvoiceId(), e.getMessage());
            }
        });
    }

    private InvoiceResponse toRes(Invoice i){
        InvoiceResponse r=new InvoiceResponse();
        r.setInvoiceId(i.getInvoiceId()); r.setBookingId(i.getBookingId()); r.setAmount(i.getAmount());
        r.setStatus(i.getStatus().name()); r.setIssuedDate(i.getIssuedDate()); r.setDueDate(i.getDueDate());
        r.setCreatedAt(i.getCreatedAt()); r.setCreatedBy(i.getCreatedBy());
        return r;
    }
}
