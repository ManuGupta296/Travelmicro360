package com.example.authservice.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "companies")
public class Company extends AuditableEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyId;
    @Column(nullable = false, unique = true, length = 150) private String name;
    @Column(unique = true, length = 100) private String domain;
    @Column(length = 255) private String address;
    @Column(length = 100) private String contactEmail;
    @Column(length = 20) private String contactPhone;
    public Company() {}
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}