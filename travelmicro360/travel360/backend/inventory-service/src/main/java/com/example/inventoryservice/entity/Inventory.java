package com.example.inventoryservice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="inventories")
public class Inventory extends AuditableEntity {
    public enum Status { AVAILABLE, SOLD_OUT, DISCONTINUED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long inventoryId;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="partner_id",nullable=false) private Partner partner;
    @Column(nullable=false,length=50) private String itemType;
    @Column(nullable=false,length=200) private String name;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal price;
    private Integer availability;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    @Column(columnDefinition="TEXT") private String details;
    public Inventory(){}
    public Long getInventoryId(){return inventoryId;} public void setInventoryId(Long v){this.inventoryId=v;}
    public Partner getPartner(){return partner;} public void setPartner(Partner v){this.partner=v;}
    public String getItemType(){return itemType;} public void setItemType(String v){this.itemType=v;}
    public String getName(){return name;} public void setName(String v){this.name=v;}
    public BigDecimal getPrice(){return price;} public void setPrice(BigDecimal v){this.price=v;}
    public Integer getAvailability(){return availability;} public void setAvailability(Integer v){this.availability=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){this.status=v;}
    public String getDetails(){return details;} public void setDetails(String v){this.details=v;}
}