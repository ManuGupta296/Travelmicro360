package com.example.complianceservice.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="audit_logs")
public class AuditLog extends AuditableEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long logId;
    @Column(nullable=false,length=50) private String action;
    @Column(length=100) private String entityType;
    private Long entityId;
    @Column(length=150) private String performedBy;
    @Column(columnDefinition="TEXT") private String details;
    private LocalDateTime timestamp;
    public AuditLog(){}
    public Long getLogId(){return logId;} public void setLogId(Long v){this.logId=v;}
    public String getAction(){return action;} public void setAction(String v){this.action=v;}
    public String getEntityType(){return entityType;} public void setEntityType(String v){this.entityType=v;}
    public Long getEntityId(){return entityId;} public void setEntityId(Long v){this.entityId=v;}
    public String getPerformedBy(){return performedBy;} public void setPerformedBy(String v){this.performedBy=v;}
    public String getDetails(){return details;} public void setDetails(String v){this.details=v;}
    public LocalDateTime getTimestamp(){return timestamp;} public void setTimestamp(LocalDateTime v){this.timestamp=v;}
}