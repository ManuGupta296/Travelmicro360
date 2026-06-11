package com.example.paymentservice.service;
import com.example.paymentservice.dto.request.SettlementRequest;
import com.example.paymentservice.dto.response.SettlementResponse;
import org.springframework.data.domain.*;
public interface SettlementService {
    SettlementResponse create(SettlementRequest req);
    SettlementResponse update(Long id, SettlementRequest req);
    SettlementResponse getById(Long id);
    Page<SettlementResponse> getAll(Pageable p);
    void delete(Long id);
    SettlementResponse complete(Long id);
    void reverseByBookingId(Long bookingId);
}
