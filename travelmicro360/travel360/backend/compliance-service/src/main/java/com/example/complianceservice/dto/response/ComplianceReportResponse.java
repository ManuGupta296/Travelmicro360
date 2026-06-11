package com.example.complianceservice.dto.response;
import java.time.LocalDate;
import java.time.LocalDateTime;
public class ComplianceReportResponse {
    private Long reportId;
    private String title;
    private String description;
    private String status;
    private LocalDate reportDate;
    private Long createdByUserId;
    private String scope;
    private String metrics;
    private LocalDate generatedDate;
    private LocalDateTime createdAt;
    public Long getReportId(){return reportId;} public void setReportId(Long v){this.reportId=v;}
    public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getDescription(){return description;} public void setDescription(String v){this.description=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
    public LocalDate getReportDate(){return reportDate;} public void setReportDate(LocalDate v){this.reportDate=v;}
    public Long getCreatedByUserId(){return createdByUserId;} public void setCreatedByUserId(Long v){this.createdByUserId=v;}
    public String getScope(){return scope;} public void setScope(String v){this.scope=v;}
    public String getMetrics(){return metrics;} public void setMetrics(String v){this.metrics=v;}
    public LocalDate getGeneratedDate(){return generatedDate;} public void setGeneratedDate(LocalDate v){this.generatedDate=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
}
