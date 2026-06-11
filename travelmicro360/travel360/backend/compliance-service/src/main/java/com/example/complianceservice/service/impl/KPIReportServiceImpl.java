package com.example.complianceservice.service.impl;

import com.example.complianceservice.dto.request.KPIReportRequest;
import com.example.complianceservice.dto.response.KPIReportResponse;
import com.example.complianceservice.entity.KPIReport;
import com.example.complianceservice.exception.ResourceNotFoundException;
import com.example.complianceservice.repository.KPIReportRepository;
import com.example.complianceservice.service.KPIReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class KPIReportServiceImpl implements KPIReportService {

    private static final Logger log = LoggerFactory.getLogger(KPIReportServiceImpl.class);
    private final KPIReportRepository repo;

    public KPIReportServiceImpl(KPIReportRepository repo) {
        this.repo = repo;
    }

    @Override
    public KPIReportResponse create(KPIReportRequest req) {
        log.info("Creating KPI report: metric={}, value={}", req.getMetricName(), req.getMetricValue());
        KPIReport k = new KPIReport();
        k.setMetricName(req.getMetricName());
        k.setMetricValue(req.getMetricValue());
        k.setReportDate(req.getReportDate() != null ? req.getReportDate() : LocalDate.now());
        k.setPeriod(req.getPeriod());
        return toRes(repo.save(k));
    }

    @Override
    public KPIReportResponse getById(Long id) {
        return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("KPIReport not found: " + id)));
    }

    @Override
    public Page<KPIReportResponse> getAll(Pageable p) {
        return repo.findAll(p).map(this::toRes);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("KPIReport not found: " + id);
        }
        repo.deleteById(id);
    }

    private KPIReportResponse toRes(KPIReport k) {
        KPIReportResponse r = new KPIReportResponse();
        r.setKpiId(k.getKpiId());
        r.setMetricName(k.getMetricName());
        r.setMetricValue(k.getMetricValue());
        r.setReportDate(k.getReportDate());
        r.setPeriod(k.getPeriod());
        r.setCreatedAt(k.getCreatedAt());
        return r;
    }
}
