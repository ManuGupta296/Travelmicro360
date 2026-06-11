package com.example.notificationservice.service;
import com.example.notificationservice.dto.request.NotificationRequest;
import com.example.notificationservice.dto.response.NotificationResponse;
import org.springframework.data.domain.*;
public interface NotificationService { NotificationResponse create(NotificationRequest req); NotificationResponse getById(Long id); Page<NotificationResponse> getAll(Pageable p); NotificationResponse markAsRead(Long id); void delete(Long id); }