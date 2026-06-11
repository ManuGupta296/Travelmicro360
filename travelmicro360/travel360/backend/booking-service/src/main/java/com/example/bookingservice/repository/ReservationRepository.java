package com.example.bookingservice.repository;
import com.example.bookingservice.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ReservationRepository extends JpaRepository<Reservation, Long> {}