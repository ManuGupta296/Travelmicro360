package com.example.complianceservice.service.impl;

import com.example.complianceservice.dto.request.ComplianceReportRequest;
import com.example.complianceservice.dto.response.ComplianceReportResponse;
import com.example.complianceservice.entity.ComplianceReport;
import com.example.complianceservice.exception.ResourceNotFoundException;
import com.example.complianceservice.repository.ComplianceReportRepository;
import com.example.complianceservice.service.ComplianceReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ComplianceReportServiceImpl implements ComplianceReportService {

    private static final Logger log = LoggerFactory.getLogger(ComplianceReportServiceImpl.class);
    private final ComplianceReportRepository repo;

    public ComplianceReportServiceImpl(ComplianceReportRepository repo) {
        this.repo = repo;
    }

    @Override
    public ComplianceReportResponse create(ComplianceReportRequest req) {
        log.info("Creating compliance report: scope={}, title={}", req.getScope(), req.getTitle());
        ComplianceReport r = new ComplianceReport();
        LocalDate today = LocalDate.now();
        // Auto-derive title from scope when not provided (frontend sends scope+metrics, not title).
        String title = req.getTitle();
        if (title == null || title.isBlank()) {
            String scope = req.getScope() != null && !req.getScope().isBlank() ? req.getScope() : "AD_HOC";
            title = scope + " Report - " + today;
        }
        r.setTitle(title);
        r.setDescription(req.getDescription());
        r.setStatus(ComplianceReport.Status.DRAFT);
        r.setReportDate(req.getReportDate() != null ? req.getReportDate() : today);
        r.setCreatedByUserId(req.getCreatedByUserId());
        r.setScope(req.getScope());
        r.setMetrics(req.getMetrics());
        r.setGeneratedDate(today);
        return toRes(repo.save(r));
    }

    @Override
    public ComplianceReportResponse getById(Long id) {
        return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("ComplianceReport not found: " + id)));
    }

    @Override
    public Page<ComplianceReportResponse> getAll(Pageable p) {
        return repo.findAll(p).map(this::toRes);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("ComplianceReport not found: " + id);
        }
        repo.deleteById(id);
    }

    private ComplianceReportResponse toRes(ComplianceReport r) {
        ComplianceReportResponse res = new ComplianceReportResponse();
        res.setReportId(r.getReportId());
        res.setTitle(r.getTitle());
        res.setDescription(r.getDescription());
        res.setStatus(r.getStatus().name());
        res.setReportDate(r.getReportDate());
        res.setCreatedByUserId(r.getCreatedByUserId());
        res.setScope(r.getScope());
        res.setMetrics(r.getMetrics());
        res.setGeneratedDate(r.getGeneratedDate());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
