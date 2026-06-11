package com.example.complianceservice.service;
import com.example.complianceservice.dto.request.ComplianceReportRequest;
import com.example.complianceservice.dto.response.ComplianceReportResponse;
import org.springframework.data.domain.*;
public interface ComplianceReportService { ComplianceReportResponse create(ComplianceReportRequest req); ComplianceReportResponse getById(Long id); Page<ComplianceReportResponse> getAll(Pageable p); void delete(Long id); }