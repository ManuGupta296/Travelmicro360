package com.example.bookingservice.service;

import com.example.bookingservice.dto.request.ReservationRequest;
import com.example.bookingservice.dto.response.ReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationService {
    ReservationResponse create(ReservationRequest req);
    ReservationResponse update(Long id, ReservationRequest req);
    ReservationResponse getById(Long id);
    Page<ReservationResponse> getAll(Pageable pageable);
    void delete(Long id);
}