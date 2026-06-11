package com.example.complianceservice.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="compliance_reports")
public class ComplianceReport extends AuditableEntity {
    public enum Status { DRAFT, SUBMITTED, APPROVED, REJECTED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long reportId;
    @Column(nullable=false,length=200) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    private LocalDate reportDate;
    private Long createdByUserId;
    @Column(length=20) private String scope;
    @Column(columnDefinition="TEXT") private String metrics;
    private LocalDate generatedDate;
    public ComplianceReport(){}
    public Long getReportId(){return reportId;} public void setReportId(Long v){this.reportId=v;}
    public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getDescription(){return description;} public void setDescription(String v){this.description=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
    public LocalDate getReportDate(){return reportDate;} public void setReportDate(LocalDate v){this.reportDate=v;}
    public Long getCreatedByUserId(){return createdByUserId;} public void setCreatedByUserId(Long v){this.createdByUserId=v;}
    public String getScope(){return scope;} public void setScope(String v){this.scope=v;}
    public String getMetrics(){return metrics;} public void setMetrics(String v){this.metrics=v;}
    public LocalDate getGeneratedDate(){return generatedDate;} public void setGeneratedDate(LocalDate v){this.generatedDate=v;}
}
