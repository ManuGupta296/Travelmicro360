package com.example.bookingservice.service.impl;

import com.example.bookingservice.client.ComplianceClient;
import com.example.bookingservice.client.InventoryClient;
import com.example.bookingservice.client.InvoiceClient;
import com.example.bookingservice.client.NotificationClient;
import com.example.bookingservice.client.UserClient;
import com.example.bookingservice.client.dto.AuditLogCreateRequest;
import com.example.bookingservice.client.dto.CreateInvoiceRequest;
import com.example.bookingservice.client.dto.InvoiceResponse;
import com.example.bookingservice.client.dto.NotificationCreateRequest;
import com.example.bookingservice.client.dto.InventorySummaryResponse;
import com.example.bookingservice.client.dto.UserSummaryResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.bookingservice.dto.request.BookingRequest;
import com.example.bookingservice.dto.response.BookingResponse;
import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.entity.BookingPurpose;
import com.example.bookingservice.exception.BadRequestException;
import com.example.bookingservice.exception.ResourceNotFoundException;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.service.BookingService;
import com.example.bookingservice.service.ItineraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class BookingServiceImpl implements BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final BookingRepository repo;
    private final NotificationClient notificationClient;
    private final ComplianceClient complianceClient;
    private final InvoiceClient invoiceClient;
    private final UserClient userClient;
    private final InventoryClient inventoryClient;
    private final ItineraryService itineraryService;

    public BookingServiceImpl(BookingRepository repo, NotificationClient notificationClient,
                              ComplianceClient complianceClient, InvoiceClient invoiceClient,
                              UserClient userClient, InventoryClient inventoryClient,
                              ItineraryService itineraryService) {
        this.repo = repo;
        this.notificationClient = notificationClient;
        this.complianceClient = complianceClient;
        this.invoiceClient = invoiceClient;
        this.userClient = userClient;
        this.inventoryClient = inventoryClient;
        this.itineraryService = itineraryService;
    }

    private void triggerInvoice(Booking saved) {
        try {
            LocalDate today = LocalDate.now();
            invoiceClient.createInvoice(new CreateInvoiceRequest(
                    saved.getBookingId(), saved.getAmount(), today, today.plusDays(7)));
        } catch (Exception e) {
            log.warn("Invoice auto-create failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }
    }

    @Override
    public BookingResponse create(BookingRequest req) {
        log.info("Creating booking: customerId={}, partnerId={}, amount={}", req.getCustomerId(), req.getPartnerId(), req.getAmount());
        String companyName = currentRequestCompanyName();
        BookingPurpose purpose = req.getPurpose() != null ? BookingPurpose.valueOf(req.getPurpose()) : BookingPurpose.PERSONAL;
        Booking b = new Booking();
        b.setCustomerId(req.getCustomerId()); b.setPartnerId(req.getPartnerId());
        b.setItemType(req.getItemType()); b.setDate(req.getDate());
        b.setAmount(req.getAmount());
        // PERSONAL bookings auto-confirm; BUSINESS bookings wait for manager approval.
        b.setStatus(purpose == BookingPurpose.BUSINESS ? Booking.Status.PENDING : Booking.Status.CONFIRMED);
        b.setPurpose(purpose);
        b.setBookingCompany(req.getBookingCompany());
        b.setAgentCustomerId(req.getAgentCustomerId());
        b.setApproverManagerEmail(req.getApproverManagerEmail());
        b.setPassengers(req.getPassengers());
        b.setInventoryId(req.getInventoryId());
        if (purpose == BookingPurpose.BUSINESS) {
            if (b.getBookingCompany() == null || b.getBookingCompany().isBlank()) {
                b.setBookingCompany(companyName);
            }
            if (b.getApproverManagerEmail() == null || b.getApproverManagerEmail().isBlank()) {
                b.setApproverManagerEmail(resolveManagerEmail(req.getCustomerId(), companyName));
            }
        }
        Booking saved = repo.save(b);

        // Decrement inventory availability — only when the request carries an inventoryId
        // (older callers without it skip cleanly). Failure must NOT fail the booking.
        if (req.getInventoryId() != null) {
            try {
                inventoryClient.decrement(req.getInventoryId());
            } catch (Exception e) {
                log.warn("Inventory decrement failed for booking {} (inventoryId={}): {}",
                        saved.getBookingId(), req.getInventoryId(), e.getMessage());
            }
        }

        // Auto-attach this booking to an itinerary (group within ±3 days, else create new).
        // Itinerary failure must NOT fail the booking.
        try {
            itineraryService.autoCreate(saved.getCustomerId(), saved.getBookingId(), saved.getDate());
        } catch (Exception e) {
            log.warn("Itinerary auto-create failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        // PERSONAL bookings confirm immediately: generate the invoice AND pay it with the traveler's chosen
        // method (creates Payment + Settlement and marks the invoice PAID). Failure must NOT fail the booking.
        // BUSINESS bookings get a SENT invoice on approval and are settled later by Finance (see approve()).
        if (saved.getStatus() == Booking.Status.CONFIRMED) {
            try {
                LocalDate today = LocalDate.now();
                InvoiceResponse inv = invoiceClient.createInvoice(new CreateInvoiceRequest(
                        saved.getBookingId(), saved.getAmount(), today, today.plusDays(7)));
                if (inv != null && inv.getInvoiceId() != null) {
                    String method = req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank()
                            ? req.getPaymentMethod() : "WALLET";
                    invoiceClient.settleInvoice(inv.getInvoiceId(), method);
                }
            } catch (Exception e) {
                log.warn("Invoice auto-pay failed for booking {}: {}", saved.getBookingId(), e.getMessage());
            }
        }

        // Fire-and-forget side effects via Feign (swallow failures so booking still succeeds)
        try {
            notificationClient.createNotification(new NotificationCreateRequest(
                    saved.getCustomerId(), "BOOKING_CONFIRMED", "Booking placed",
                    "Your " + saved.getItemType() + " booking #" + saved.getBookingId() + " (" + saved.getDate() + ") has been created."));
        } catch (Exception e) {
            log.warn("Notification dispatch failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }
        // BUSINESS bookings await manager approval — also notify the approving manager.
        if (saved.getPurpose() == BookingPurpose.BUSINESS
                && saved.getApproverManagerEmail() != null && !saved.getApproverManagerEmail().isBlank()) {
            try {
                UserSummaryResponse manager = userClient.getByEmail(saved.getApproverManagerEmail());
                if (manager != null && manager.getUserId() != null) {
                    String travelerName = "customer #" + saved.getCustomerId();
                    try {
                        UserSummaryResponse traveler = userClient.getById(saved.getCustomerId());
                        if (traveler != null && traveler.getName() != null) travelerName = traveler.getName();
                    } catch (Exception ignore) { /* name is best-effort */ }
                    notificationClient.createNotification(new NotificationCreateRequest(
                            manager.getUserId(), "REMINDER", "Approval needed",
                            "Booking #" + saved.getBookingId() + " by " + travelerName + " needs your approval."));
                }
            } catch (Exception e) {
                log.warn("Manager approval notification failed for booking {}: {}", saved.getBookingId(), e.getMessage());
            }
        }
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "CREATE", "Booking", saved.getBookingId(), currentUserEmail(),
                    "Booking created for customer " + saved.getCustomerId()));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        return toResponse(saved);
    }

    @Override
    public BookingResponse update(Long id, BookingRequest req) {
        Booking b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        b.setCustomerId(req.getCustomerId()); b.setPartnerId(req.getPartnerId());
        b.setItemType(req.getItemType()); b.setDate(req.getDate()); b.setAmount(req.getAmount());
        if (req.getPurpose() != null) b.setPurpose(BookingPurpose.valueOf(req.getPurpose()));
        b.setBookingCompany(req.getBookingCompany());
        return toResponse(repo.save(b));
    }

    @Override public BookingResponse getById(Long id) { return toResponse(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id))); }
    @Override public Page<BookingResponse> getAll(Pageable p) {
        Map<Long, InventorySummaryResponse> cache = new HashMap<>();
        return repo.findAll(p).map(b -> toResponse(b, cache));
    }
    @Override public void delete(Long id) { repo.deleteById(id); }

    @Override
    public BookingResponse approve(Long id) {
        log.info("Approving booking: {}", id);
        Booking b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (b.getStatus() != Booking.Status.PENDING) {
            throw new BadRequestException("Cannot approve booking in status: " + b.getStatus());
        }
        b.setStatus(Booking.Status.CONFIRMED);
        Booking saved = repo.save(b);
        // Auto-generate invoice on approval. Invoice failure must NOT fail the approval.
        triggerInvoice(saved);
        // Audit. Failure must NOT fail the approval.
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "APPROVE", "Booking", saved.getBookingId(), currentUserEmail(),
                    "Booking " + saved.getBookingId() + " approved"));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for booking {} approval: {}", saved.getBookingId(), e.getMessage());
        }
        // Notify the traveler that their booking was approved.
        try {
            notificationClient.createNotification(new NotificationCreateRequest(
                    saved.getCustomerId(), "BOOKING_CONFIRMED", "Booking approved",
                    "Your " + saved.getItemType() + " booking #" + saved.getBookingId() + " (" + saved.getDate() + ") was approved by your manager."));
        } catch (Exception e) {
            log.warn("Notification dispatch failed for booking {} approve: {}", saved.getBookingId(), e.getMessage());
        }
        return toResponse(saved);
    }

    @Override
    public BookingResponse reject(Long id) {
        log.info("Rejecting booking: {}", id);
        Booking b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (b.getStatus() != Booking.Status.PENDING) {
            throw new BadRequestException("Cannot reject booking in status: " + b.getStatus());
        }
        b.setStatus(Booking.Status.CANCELLED);
        Booking saved = repo.save(b);
        // Audit. Failure must NOT fail the reject.
        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "REJECT", "Booking", saved.getBookingId(), currentUserEmail(),
                    "Booking " + saved.getBookingId() + " rejected by manager"));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for booking {} reject: {}", saved.getBookingId(), e.getMessage());
        }
        // Notify the traveler. Failure must NOT fail the reject.
        // Use BOOKING_CANCELLED (in-enum) — reject transitions the booking to CANCELLED status.
        // Title/message text preserves the "rejected" wording so the traveler sees the actual action.
        try {
            notificationClient.createNotification(new NotificationCreateRequest(
                    saved.getCustomerId(), "BOOKING_CANCELLED", "Booking rejected",
                    "Your " + saved.getItemType() + " booking #" + saved.getBookingId() + " (" + saved.getDate() + ") was rejected by your manager."));
        } catch (Exception e) {
            log.warn("Notification dispatch failed for booking {} reject: {}", saved.getBookingId(), e.getMessage());
        }
        return toResponse(saved);
    }

    @Override
    public BookingResponse cancel(Long id) {
        log.info("Cancelling booking: {}", id);
        Booking b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (b.getStatus() == Booking.Status.CANCELLED) {
            throw new BadRequestException("Booking already cancelled");
        }
        if (b.getStatus() == Booking.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }
        b.setStatus(Booking.Status.CANCELLED);
        Booking saved = repo.save(b);

        // Restore inventory if this booking decremented one. Failure must NOT fail the cancel.
        if (saved.getInventoryId() != null) {
            try {
                inventoryClient.increment(saved.getInventoryId());
                log.info("Inventory {} incremented after cancel of booking {}",
                        saved.getInventoryId(), saved.getBookingId());
            } catch (Exception e) {
                log.warn("Inventory increment failed for booking {} cancel (inventoryId={}): {}",
                        saved.getBookingId(), saved.getInventoryId(), e.getMessage());
            }
        }

        // Void the linked invoice (skipped silently if already PAID). Failure must NOT fail the cancel.
        try {
            invoiceClient.cancelByBookingId(saved.getBookingId());
        } catch (Exception e) {
            log.warn("Invoice cancel failed for booking {}: {}", saved.getBookingId(), e.getMessage());
        }

        try {
            complianceClient.logAudit(new AuditLogCreateRequest(
                    "CANCEL", "Booking", saved.getBookingId(), currentUserEmail(),
                    "Booking " + saved.getBookingId() + " cancelled"));
        } catch (Exception e) {
            log.warn("Audit log dispatch failed for booking {} cancel: {}", saved.getBookingId(), e.getMessage());
        }
        // Notify the traveler that their booking was cancelled.
        try {
            notificationClient.createNotification(new NotificationCreateRequest(
                    saved.getCustomerId(), "BOOKING_CANCELLED", "Booking cancelled",
                    "Your " + saved.getItemType() + " booking #" + saved.getBookingId() + " (" + saved.getDate() + ") has been cancelled."));
        } catch (Exception e) {
            log.warn("Notification dispatch failed for booking {} cancel: {}", saved.getBookingId(), e.getMessage());
        }
        return toResponse(saved);
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

    private String currentRequestCompanyName() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            Object v = attrs.getRequest().getAttribute("X_USER_COMPANY_NAME");
            return v != null ? v.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String resolveManagerEmail(Long customerId, String companyName) {
        // 1) Prefer the traveler's assigned reporting manager, if they have one.
        if (customerId != null) {
            try {
                UserSummaryResponse traveler = userClient.getById(customerId);
                if (traveler != null && traveler.getManagerEmail() != null && !traveler.getManagerEmail().isBlank()) {
                    return traveler.getManagerEmail();
                }
            } catch (Exception e) {
                log.warn("Failed to lookup assigned manager for customer {}: {}", customerId, e.getMessage());
            }
        }
        // 2) Fallback: the company's CORPORATE_MANAGER (existing behavior — keeps multi-tenancy/E2E intact).
        if (companyName == null || companyName.isBlank()) return null;
        try {
            UserSummaryResponse manager = userClient.findByRoleAndCompany("CORPORATE_MANAGER", companyName);
            if (manager != null && manager.getEmail() != null) {
                return manager.getEmail();
            }
        } catch (Exception e) {
            log.warn("Failed to lookup CORPORATE_MANAGER for company {}: {}", companyName, e.getMessage());
        }
        return null;
    }

    private BookingResponse toResponse(Booking b) {
        return toResponse(b, new HashMap<>());
    }

    private BookingResponse toResponse(Booking b, Map<Long, InventorySummaryResponse> inventoryCache) {
        BookingResponse r = new BookingResponse();
        r.setBookingId(b.getBookingId()); r.setCustomerId(b.getCustomerId()); r.setPartnerId(b.getPartnerId());
        r.setItemType(b.getItemType()); r.setDate(b.getDate()); r.setStatus(b.getStatus().name());
        r.setAmount(b.getAmount()); r.setPurpose(b.getPurpose().name()); r.setBookingCompany(b.getBookingCompany());
        r.setApproverManagerEmail(b.getApproverManagerEmail());
        r.setPassengers(b.getPassengers());
        r.setCreatedBy(b.getCreatedBy());
        r.setCreatedAt(b.getCreatedAt());
        // Display-only enrichment: inventory name + route. Failures must NEVER break the response.
        Long invId = b.getInventoryId();
        r.setInventoryId(invId);
        if (invId != null) {
            InventorySummaryResponse inv = resolveInventory(invId, inventoryCache);
            if (inv != null) {
                r.setInventoryName(inv.getName());
                r.setRoute(parseRoute(inv.getDetails()));
            }
        }
        return r;
    }

    /** Fetch an inventory item once per request; cache (including null misses) to avoid N+1 calls in list endpoints. */
    private InventorySummaryResponse resolveInventory(Long inventoryId, Map<Long, InventorySummaryResponse> cache) {
        if (cache.containsKey(inventoryId)) return cache.get(inventoryId);
        InventorySummaryResponse inv = null;
        try {
            inv = inventoryClient.getById(inventoryId);
        } catch (Exception e) {
            log.warn("Inventory lookup failed for inventoryId={} (booking enrichment): {}", inventoryId, e.getMessage());
        }
        cache.put(inventoryId, inv);
        return inv;
    }

    /** Build "FROM→TO" route from the inventory details JSON; gracefully degrade when parts are missing. */
    private String parseRoute(String details) {
        if (details == null || details.isBlank()) return null;
        try {
            JsonNode node = MAPPER.readTree(details);
            String from = textOrNull(node, "from");
            String to = textOrNull(node, "to");
            if (from != null && to != null) return from + "→" + to;
            if (from != null) return from;
            if (to != null) return to;
        } catch (Exception e) {
            log.debug("Could not parse inventory details for route: {}", e.getMessage());
        }
        return null;
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText();
        return s.isBlank() ? null : s;
    }
}
