package com.example.bookingservice.repository;

import com.example.bookingservice.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByCustomerIdAndEndDateAfterAndStartDateBefore(
            Long customerId, LocalDate endDateAfter, LocalDate startDateBefore);
}
