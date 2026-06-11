package com.example.paymentservice.client;

import com.example.paymentservice.client.dto.BookingSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BookingClientFallback implements BookingClient {

    private static final Logger log = LoggerFactory.getLogger(BookingClientFallback.class);

    @Override
    public BookingSummary getBooking(Long id) {
        log.warn("Booking service unavailable - cannot fetch booking {} for settlement", id);
        return null;
    }
}
