package com.example.complianceservice.service;
import com.example.complianceservice.dto.request.AuditLogRequest;
import com.example.complianceservice.dto.response.AuditLogResponse;
import org.springframework.data.domain.*;
public interface AuditLogService { AuditLogResponse create(AuditLogRequest req); AuditLogResponse getById(Long id); Page<AuditLogResponse> getAll(Pageable p); void delete(Long id); }