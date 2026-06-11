package com.example.paymentservice.client;

import com.example.paymentservice.client.dto.BookingSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", fallback = BookingClientFallback.class)
public interface BookingClient {

    @GetMapping("/api/v1/bookings/{id}")
    BookingSummary getBooking(@PathVariable("id") Long id);
}
