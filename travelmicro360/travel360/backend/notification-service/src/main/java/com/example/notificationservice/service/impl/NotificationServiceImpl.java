package com.example.notificationservice.service.impl;

import com.example.notificationservice.dto.request.NotificationRequest;
import com.example.notificationservice.dto.response.NotificationResponse;
import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.exception.ResourceNotFoundException;
import com.example.notificationservice.repository.NotificationRepository;
import com.example.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final NotificationRepository repo;

    public NotificationServiceImpl(NotificationRepository repo) {
        this.repo = repo;
    }

    @Override
    public NotificationResponse create(NotificationRequest req) {
        log.info("Creating notification: userId={}, type={}, title={}", req.getUserId(), req.getType(), req.getTitle());
        Notification n = new Notification();
        n.setUserId(req.getUserId());
        n.setType(Notification.Type.valueOf(req.getType()));
        n.setTitle(req.getTitle());
        n.setMessage(req.getMessage());
        n.setSentAt(LocalDateTime.now());
        return toRes(repo.save(n));
    }

    @Override
    public NotificationResponse getById(Long id) {
        return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id)));
    }

    @Override
    public Page<NotificationResponse> getAll(Pageable p) {
        return repo.findAll(p).map(this::toRes);
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        n.setIsRead(true);
        log.info("Marking notification as read: id={}, userId={}", id, n.getUserId());
        return toRes(repo.save(n));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }
        repo.deleteById(id);
    }

    private NotificationResponse toRes(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setNotificationId(n.getNotificationId());
        r.setUserId(n.getUserId());
        r.setType(n.getType().name());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setIsRead(n.getIsRead());
        r.setSentAt(n.getSentAt());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
