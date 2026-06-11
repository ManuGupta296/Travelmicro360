package com.example.complianceservice.entity;
import jakarta.persistence.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
@MappedSuperclass @EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity { @CreatedDate @Column(updatable=false) private LocalDateTime createdAt; @LastModifiedDate private LocalDateTime updatedAt; @CreatedBy @Column(updatable=false,length=150) private String createdBy; @LastModifiedBy @Column(length=150) private String updatedBy; public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;} public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;} public String getCreatedBy(){return createdBy;} public void setCreatedBy(String v){this.createdBy=v;} public String getUpdatedBy(){return updatedBy;} public void setUpdatedBy(String v){this.updatedBy=v;} }