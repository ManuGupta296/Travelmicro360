package com.example.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CompanyRequest {
    @NotBlank private String name;
    private String address;
    private String contactEmail;
    private String contactPhone;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}