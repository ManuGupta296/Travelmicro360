package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.CreateInvoiceRequest;
import com.example.bookingservice.client.dto.InvoiceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class InvoiceClientFallback implements InvoiceClient {

    private static final Logger log = LoggerFactory.getLogger(InvoiceClientFallback.class);

    @Override
    public InvoiceResponse createInvoice(CreateInvoiceRequest req) {
        log.error("Payment service unavailable - skipping invoice for booking {} (amount={})",
                req.getBookingId(), req.getAmount());
        return null;
    }

    @Override
    public InvoiceResponse settleInvoice(Long id, String method) {
        log.error("Payment service unavailable - skipping settle for invoice {} (method={})", id, method);
        return null;
    }

    @Override
    public void cancelByBookingId(Long bookingId) {
        log.warn("Payment service unavailable - invoice cancel skipped for booking {}", bookingId);
    }
}
