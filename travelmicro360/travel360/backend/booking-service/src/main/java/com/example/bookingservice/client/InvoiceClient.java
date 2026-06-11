package com.example.bookingservice.client;

import com.example.bookingservice.client.dto.CreateInvoiceRequest;
import com.example.bookingservice.client.dto.InvoiceResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "payment-service", fallback = InvoiceClientFallback.class)
public interface InvoiceClient {

    @PostMapping("/api/v1/invoices")
    InvoiceResponse createInvoice(@RequestBody CreateInvoiceRequest req);

    // Settle (pay) an invoice with the chosen method — creates the Payment + Settlement and marks the invoice PAID.
    @PutMapping("/api/v1/invoices/{id}/settle")
    InvoiceResponse settleInvoice(@PathVariable("id") Long id, @RequestParam("method") String method);

    @PutMapping("/api/v1/invoices/by-booking/{bookingId}/cancel")
    void cancelByBookingId(@PathVariable("bookingId") Long bookingId);
}
