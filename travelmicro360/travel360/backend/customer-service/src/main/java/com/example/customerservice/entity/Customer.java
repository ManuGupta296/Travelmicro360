package com.example.customerservice.entity;
import jakarta.persistence.*;
@Entity @Table(name="customers")
public class Customer extends AuditableEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long customerId;
    @Column(nullable=false,length=100) private String name;
    @Column(nullable=false,unique=true,length=150) private String email;
    @Column(length=20) private String phone;
    @Column(length=255) private String address;
    private Long userId;
    public Customer(){}
    public Long getCustomerId(){return customerId;} public void setCustomerId(Long v){this.customerId=v;}
    public String getName(){return name;} public void setName(String v){this.name=v;}
    public String getEmail(){return email;} public void setEmail(String v){this.email=v;}
    public String getPhone(){return phone;} public void setPhone(String v){this.phone=v;}
    public String getAddress(){return address;} public void setAddress(String v){this.address=v;}
    public Long getUserId(){return userId;} public void setUserId(Long v){this.userId=v;}
}