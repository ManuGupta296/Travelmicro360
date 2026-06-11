package com.example.complianceservice.service;
import com.example.complianceservice.dto.request.KPIReportRequest;
import com.example.complianceservice.dto.response.KPIReportResponse;
import org.springframework.data.domain.*;
public interface KPIReportService { KPIReportResponse create(KPIReportRequest req); KPIReportResponse getById(Long id); Page<KPIReportResponse> getAll(Pageable p); void delete(Long id); }