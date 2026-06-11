package com.example.inventoryservice.entity;
import jakarta.persistence.*;
@Entity @Table(name="partners")
public class Partner extends AuditableEntity {
    public enum Type { AIRLINE, HOTEL, TRANSPORT }
    public enum Status { ACTIVE, INACTIVE, SUSPENDED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long partnerId;
    @Column(nullable=false,length=100) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Type type;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    public Partner(){}
    public Long getPartnerId(){return partnerId;} public void setPartnerId(Long v){this.partnerId=v;}
    public String getName(){return name;} public void setName(String v){this.name=v;}
    public Type getType(){return type;} public void setType(Type v){this.type=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
}