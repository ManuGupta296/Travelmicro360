package com.example.authservice.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User extends AuditableEntity {
    public enum Role { TRAVELER, TRAVEL_AGENT, CORPORATE_MANAGER, FINANCE_OFFICER, COMPLIANCE_OFFICER, ADMIN }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    @Column(nullable = false, length = 100) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private Role role;
    @Column(nullable = false, unique = true, length = 150) private String email;
    @Column(length = 20) private String phone;
    @Column(length = 255) private String password;
    @Column(length = 100) private String companyName;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "company_id") private Company company;
    // Optional: a traveler's assigned reporting manager (CORPORATE_MANAGER email). Null => company-level fallback.
    @Column(length = 150) private String managerEmail;
    public User() {}
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
}