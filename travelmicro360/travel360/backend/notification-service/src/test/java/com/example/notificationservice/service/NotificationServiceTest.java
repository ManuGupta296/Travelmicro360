package com.example.notificationservice.service;

import com.example.notificationservice.dto.request.NotificationRequest;
import com.example.notificationservice.dto.response.NotificationResponse;
import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.exception.ResourceNotFoundException;
import com.example.notificationservice.repository.NotificationRepository;
import com.example.notificationservice.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository repo;
    @InjectMocks private NotificationServiceImpl service;

    private Notification sample;

    @BeforeEach
    void setUp() {
        sample = new Notification();
        sample.setNotificationId(10L);
        sample.setUserId(1L);
        sample.setType(Notification.Type.BOOKING_CONFIRMED);
        sample.setTitle("Booking Confirmed");
        sample.setMessage("Your flight is booked.");
        sample.setIsRead(false);
        sample.setSentAt(LocalDateTime.now());
    }

    @Test
    void shouldCreateNotificationSuccessfully() {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(1L);
        req.setType("BOOKING_CONFIRMED");
        req.setTitle("Booking Confirmed");
        req.setMessage("Your flight is booked.");
        when(repo.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setNotificationId(10L);
            return n;
        });

        NotificationResponse result = service.create(req);

        assertEquals("BOOKING_CONFIRMED", result.getType());
        assertEquals("Booking Confirmed", result.getTitle());
        assertEquals(1L, result.getUserId());
        verify(repo, times(1)).save(any(Notification.class));
    }

    @Test
    void shouldReturnNotificationById() {
        when(repo.findById(10L)).thenReturn(Optional.of(sample));

        NotificationResponse result = service.getById(10L);

        assertEquals(10L, result.getNotificationId());
        assertEquals("BOOKING_CONFIRMED", result.getType());
    }

    @Test
    void shouldThrowWhenNotificationNotFound() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById(999L));
    }

    @Test
    void shouldThrowWhenDeletingNonExistentNotification() {
        when(repo.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.delete(999L));
        verify(repo, never()).deleteById(any(Long.class));
    }

    @Test
    void shouldMarkNotificationAsRead() {
        when(repo.findById(10L)).thenReturn(Optional.of(sample));
        when(repo.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse result = service.markAsRead(10L);

        assertTrue(result.getIsRead());
        verify(repo, times(1)).save(sample);
    }

    @Test
    void shouldThrowWhenMarkingNonExistentAsRead() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.markAsRead(999L));
        verify(repo, never()).save(any(Notification.class));
    }
}
