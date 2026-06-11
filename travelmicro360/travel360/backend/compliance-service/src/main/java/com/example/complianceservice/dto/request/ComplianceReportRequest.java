package com.example.complianceservice.dto.request;
import java.time.LocalDate;
public class ComplianceReportRequest {
    private String title;
    private String description;
    private LocalDate reportDate;
    private Long createdByUserId;
    private String scope;
    private String metrics;
    public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getDescription(){return description;} public void setDescription(String v){this.description=v;}
    public LocalDate getReportDate(){return reportDate;} public void setReportDate(LocalDate v){this.reportDate=v;}
    public Long getCreatedByUserId(){return createdByUserId;} public void setCreatedByUserId(Long v){this.createdByUserId=v;}
    public String getScope(){return scope;} public void setScope(String v){this.scope=v;}
    public String getMetrics(){return metrics;} public void setMetrics(String v){this.metrics=v;}
}
