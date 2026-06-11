package com.example.bookingservice.service;

import com.example.bookingservice.dto.request.BookingRequest;
import com.example.bookingservice.dto.response.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
    BookingResponse create(BookingRequest req);
    BookingResponse update(Long id, BookingRequest req);
    BookingResponse getById(Long id);
    Page<BookingResponse> getAll(Pageable pageable);
    void delete(Long id);
    BookingResponse approve(Long id);
    BookingResponse reject(Long id);
    BookingResponse cancel(Long id);
}
