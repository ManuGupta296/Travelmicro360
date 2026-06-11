package com.example.complianceservice.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="kpi_reports")
public class KPIReport extends AuditableEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long kpiId;
    @Column(nullable=false,length=100) private String metricName;
    private Double metricValue;
    private LocalDate reportDate;
    @Column(length=50) private String period;
    public KPIReport(){}
    public Long getKpiId(){return kpiId;} public void setKpiId(Long v){this.kpiId=v;}
    public String getMetricName(){return metricName;} public void setMetricName(String v){this.metricName=v;}
    public Double getMetricValue(){return metricValue;} public void setMetricValue(Double v){this.metricValue=v;}
    public LocalDate getReportDate(){return reportDate;} public void setReportDate(LocalDate v){this.reportDate=v;}
    public String getPeriod(){return period;} public void setPeriod(String v){this.period=v;}
}