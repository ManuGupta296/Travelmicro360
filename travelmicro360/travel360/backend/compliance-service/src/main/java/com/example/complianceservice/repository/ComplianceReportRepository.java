package com.example.complianceservice.repository;
import com.example.complianceservice.entity.ComplianceReport;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ComplianceReportRepository extends JpaRepository<ComplianceReport, Long> {}