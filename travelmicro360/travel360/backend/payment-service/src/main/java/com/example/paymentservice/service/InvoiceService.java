package com.example.paymentservice.service;
import com.example.paymentservice.dto.request.InvoiceRequest;
import com.example.paymentservice.dto.response.InvoiceResponse;
import org.springframework.data.domain.*;
public interface InvoiceService {
    InvoiceResponse create(InvoiceRequest req);
    InvoiceResponse update(Long id, InvoiceRequest req);
    InvoiceResponse getById(Long id);
    Page<InvoiceResponse> getAll(Pageable p);
    void delete(Long id);
    InvoiceResponse markPaid(Long id, String method);
    void cancelByBookingId(Long bookingId);
}
