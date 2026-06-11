package com.example.paymentservice.service;

import com.example.paymentservice.client.BookingClient;
import com.example.paymentservice.client.dto.BookingSummary;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.client.NotificationClient;
import com.example.paymentservice.dto.response.PaymentResponse;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.repository.PaymentRepository;
import com.example.paymentservice.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository repo;
    @Mock private NotificationClient notificationClient;
    @Mock private BookingClient bookingClient;
    @Mock private SettlementService settlementService;
    @Mock private ComplianceClient complianceClient;

    @InjectMocks private PaymentServiceImpl paymentService;

    private Payment completedPayment;

    @BeforeEach
    void setUp() {
        completedPayment = new Payment();
        completedPayment.setPaymentId(11L);
        completedPayment.setBookingId(42L);
        completedPayment.setAmount(new BigDecimal("5500.00"));
        completedPayment.setMethod(Payment.Method.UPI);
        completedPayment.setStatus(Payment.Status.COMPLETED);
        completedPayment.setPaidAt(LocalDateTime.now());
    }

    @Test
    void testRefund_Success() {
        when(repo.findById(11L)).thenReturn(Optional.of(completedPayment));
        when(repo.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        BookingSummary booking = new BookingSummary();
        booking.setCustomerId(7L);
        when(bookingClient.getBooking(42L)).thenReturn(booking);

        PaymentResponse result = paymentService.refund(11L);

        assertEquals("REFUNDED", result.getStatus());
        assertEquals(Payment.Status.REFUNDED, completedPayment.getStatus());
        verify(notificationClient, times(1)).createNotification(any());
    }

    @Test
    void testRefund_OnFailed_Throws() {
        completedPayment.setStatus(Payment.Status.FAILED);
        when(repo.findById(11L)).thenReturn(Optional.of(completedPayment));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> paymentService.refund(11L));
        assertTrue(ex.getMessage().toLowerCase().contains("failed"));
        verify(repo, never()).save(any());
    }

    @Test
    void testRefund_AlreadyRefunded_Throws() {
        completedPayment.setStatus(Payment.Status.REFUNDED);
        when(repo.findById(11L)).thenReturn(Optional.of(completedPayment));

        assertThrows(BadRequestException.class, () -> paymentService.refund(11L));
    }
}
