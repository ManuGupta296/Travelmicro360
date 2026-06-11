package com.example.complianceservice.service.impl;

import com.example.complianceservice.dto.request.AuditLogRequest;
import com.example.complianceservice.dto.response.AuditLogResponse;
import com.example.complianceservice.entity.AuditLog;
import com.example.complianceservice.exception.ResourceNotFoundException;
import com.example.complianceservice.repository.AuditLogRepository;
import com.example.complianceservice.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);
    private final AuditLogRepository repo;

    public AuditLogServiceImpl(AuditLogRepository repo) {
        this.repo = repo;
    }

    @Override
    public AuditLogResponse create(AuditLogRequest req) {
        log.info("Creating audit log: action={}, entityType={}, entityId={}", req.getAction(), req.getEntityType(), req.getEntityId());
        AuditLog a = new AuditLog();
        a.setAction(req.getAction());
        a.setEntityType(req.getEntityType());
        a.setEntityId(req.getEntityId());
        a.setPerformedBy(req.getPerformedBy());
        a.setDetails(req.getDetails());
        a.setTimestamp(LocalDateTime.now());
        return toRes(repo.save(a));
    }

    @Override
    public AuditLogResponse getById(Long id) {
        return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("AuditLog not found: " + id)));
    }

    @Override
    public Page<AuditLogResponse> getAll(Pageable p) {
        return repo.findAll(p).map(this::toRes);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("AuditLog not found: " + id);
        }
        repo.deleteById(id);
    }

    private AuditLogResponse toRes(AuditLog a) {
        AuditLogResponse r = new AuditLogResponse();
        r.setLogId(a.getLogId());
        r.setAction(a.getAction());
        r.setEntityType(a.getEntityType());
        r.setEntityId(a.getEntityId());
        r.setPerformedBy(a.getPerformedBy());
        r.setDetails(a.getDetails());
        r.setTimestamp(a.getTimestamp());
        return r;
    }
}
