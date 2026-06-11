package com.example.paymentservice.service;

import com.example.paymentservice.dto.request.SettlementRequest;
import com.example.paymentservice.dto.response.SettlementResponse;
import com.example.paymentservice.entity.Settlement;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.exception.ResourceNotFoundException;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.repository.SettlementRepository;
import com.example.paymentservice.service.impl.SettlementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SettlementServiceTest {

    @Mock private SettlementRepository repo;
    @Mock private ComplianceClient complianceClient;
    @InjectMocks private SettlementServiceImpl service;

    private Settlement pending;

    @BeforeEach
    void setUp() {
        pending = new Settlement();
        pending.setSettlementId(1L);
        pending.setPartnerId(2L);
        pending.setStatus(Settlement.Status.PENDING);
        pending.setAmount(new BigDecimal("3150.00"));
        pending.setGrossAmount(new BigDecimal("3500.00"));
        pending.setPlatformMargin(new BigDecimal("350.00"));
        pending.setSettlementAmount(new BigDecimal("3150.00"));
        pending.setSettlementDate(LocalDate.now());
        pending.setBookingId(13L);
    }

    @Test
    void shouldCreateSettlementSuccessfully() {
        SettlementRequest req = new SettlementRequest();
        req.setPartnerId(2L);
        req.setBookingId(13L);
        req.setGrossAmount(new BigDecimal("3500.00"));
        req.setPlatformMargin(new BigDecimal("350.00"));
        req.setSettlementAmount(new BigDecimal("3150.00"));
        when(repo.save(any(Settlement.class))).thenAnswer(inv -> {
            Settlement s = inv.getArgument(0);
            s.setSettlementId(99L);
            return s;
        });

        SettlementResponse result = service.create(req);

        assertEquals("PENDING", result.getStatus());
        assertEquals(new BigDecimal("3150.00"), result.getSettlementAmount());
        assertEquals(2L, result.getPartnerId());
        verify(repo, times(1)).save(any(Settlement.class));
    }

    @Test
    void shouldCompleteSettlementSuccessfully() {
        when(repo.findById(1L)).thenReturn(Optional.of(pending));
        when(repo.save(any(Settlement.class))).thenAnswer(inv -> inv.getArgument(0));

        SettlementResponse result = service.complete(1L);

        assertEquals("PROCESSED", result.getStatus());
        assertEquals(Settlement.Status.PROCESSED, pending.getStatus());
        verify(repo, times(1)).save(any(Settlement.class));
    }

    @Test
    void shouldThrowWhenSettlementAlreadyProcessed() {
        pending.setStatus(Settlement.Status.PROCESSED);
        when(repo.findById(1L)).thenReturn(Optional.of(pending));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.complete(1L));
        assertTrue(ex.getMessage().contains("already processed"));
        verify(repo, never()).save(any());
    }

    @Test
    void shouldThrowWhenCompletingNonExistentSettlement() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.complete(999L));
        verify(repo, never()).save(any());
    }

    @Test
    void shouldReturnSettlementById() {
        when(repo.findById(1L)).thenReturn(Optional.of(pending));

        SettlementResponse result = service.getById(1L);

        assertEquals(1L, result.getSettlementId());
        assertEquals("PENDING", result.getStatus());
    }
}
