package com.example.paymentservice.service;
import com.example.paymentservice.dto.request.PaymentRequest;
import com.example.paymentservice.dto.response.PaymentResponse;
import org.springframework.data.domain.*;
public interface PaymentService {
    PaymentResponse create(PaymentRequest req);
    PaymentResponse update(Long id, PaymentRequest req);
    PaymentResponse getById(Long id);
    Page<PaymentResponse> getAll(Pageable p);
    void delete(Long id);
    PaymentResponse refund(Long id);
}
