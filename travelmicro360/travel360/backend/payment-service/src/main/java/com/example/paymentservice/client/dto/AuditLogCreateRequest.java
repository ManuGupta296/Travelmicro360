package com.example.paymentservice.client.dto;

public class AuditLogCreateRequest {
    private String action;
    private String entityType;
    private Long entityId;
    private String performedBy;
    private String details;

    public AuditLogCreateRequest() {}
    public AuditLogCreateRequest(String action, String entityType, Long entityId, String performedBy, String details) {
        this.action = action; this.entityType = entityType; this.entityId = entityId;
        this.performedBy = performedBy; this.details = details;
    }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
