package com.example.bookingservice.service;

import com.example.bookingservice.client.ComplianceClient;
import com.example.bookingservice.client.InventoryClient;
import com.example.bookingservice.client.InvoiceClient;
import com.example.bookingservice.client.NotificationClient;
import com.example.bookingservice.client.UserClient;
import com.example.bookingservice.dto.response.BookingResponse;
import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.entity.BookingPurpose;
import com.example.bookingservice.exception.BadRequestException;
import com.example.bookingservice.exception.ResourceNotFoundException;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.service.impl.BookingServiceImpl;
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
class BookingServiceTest {

    @Mock private BookingRepository repo;
    @Mock private NotificationClient notificationClient;
    @Mock private ComplianceClient complianceClient;
    @Mock private InvoiceClient invoiceClient;
    @Mock private UserClient userClient;
    @Mock private InventoryClient inventoryClient;
    @Mock private com.example.bookingservice.service.ItineraryService itineraryService;

    @InjectMocks private BookingServiceImpl bookingService;

    private Booking pendingBooking;

    @BeforeEach
    void setUp() {
        pendingBooking = new Booking();
        pendingBooking.setBookingId(42L);
        pendingBooking.setCustomerId(1L);
        pendingBooking.setPartnerId(2L);
        pendingBooking.setItemType("FLIGHT");
        pendingBooking.setDate(LocalDate.now());
        pendingBooking.setAmount(new BigDecimal("5500.00"));
        pendingBooking.setStatus(Booking.Status.PENDING);
        pendingBooking.setPurpose(BookingPurpose.PERSONAL);
    }

    @Test
    void testApprove_Success() {
        when(repo.findById(42L)).thenReturn(Optional.of(pendingBooking));
        when(repo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse result = bookingService.approve(42L);

        assertEquals("CONFIRMED", result.getStatus());
        assertEquals(Booking.Status.CONFIRMED, pendingBooking.getStatus());
        verify(repo, times(1)).save(any(Booking.class));
    }

    @Test
    void testApprove_AlreadyConfirmed_ThrowsBadRequest() {
        pendingBooking.setStatus(Booking.Status.CONFIRMED);
        when(repo.findById(42L)).thenReturn(Optional.of(pendingBooking));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> bookingService.approve(42L));
        assertTrue(ex.getMessage().contains("CONFIRMED"));
        verify(repo, never()).save(any());
    }

    @Test
    void testApprove_NotFound_Throws() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookingService.approve(99L));
    }

    @Test
    void testCancel_Success() {
        when(repo.findById(42L)).thenReturn(Optional.of(pendingBooking));
        when(repo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse result = bookingService.cancel(42L);

        assertEquals("CANCELLED", result.getStatus());
        assertEquals(Booking.Status.CANCELLED, pendingBooking.getStatus());
    }

    @Test
    void testCancel_AlreadyCancelled_Throws() {
        pendingBooking.setStatus(Booking.Status.CANCELLED);
        when(repo.findById(42L)).thenReturn(Optional.of(pendingBooking));

        assertThrows(BadRequestException.class, () -> bookingService.cancel(42L));
        verify(repo, never()).save(any());
    }
}
