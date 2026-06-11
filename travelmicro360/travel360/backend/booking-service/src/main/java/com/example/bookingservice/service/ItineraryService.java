package com.example.bookingservice.service;

import com.example.bookingservice.dto.request.ItineraryRequest;
import com.example.bookingservice.dto.response.ItineraryResponse;
import com.example.bookingservice.entity.Itinerary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ItineraryService {
    ItineraryResponse create(ItineraryRequest req);
    ItineraryResponse update(Long id, ItineraryRequest req);
    ItineraryResponse getById(Long id);
    Page<ItineraryResponse> getAll(Pageable pageable);
    void delete(Long id);
    Itinerary autoCreate(Long customerId, Long bookingId, LocalDate date);
}