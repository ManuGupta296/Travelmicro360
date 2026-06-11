package com.example.paymentservice.repository;
import com.example.paymentservice.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByBookingId(Long bookingId);
}
