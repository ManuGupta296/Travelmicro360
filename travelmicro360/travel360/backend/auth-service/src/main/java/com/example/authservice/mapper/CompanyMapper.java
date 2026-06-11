package com.example.authservice.mapper;

import com.example.authservice.dto.response.CompanyResponse;
import com.example.authservice.entity.Company;

public class CompanyMapper {
    public static CompanyResponse toResponse(Company c) {
        CompanyResponse r = new CompanyResponse();
        r.setCompanyId(c.getCompanyId());
        r.setName(c.getName());
        r.setAddress(c.getAddress());
        r.setContactEmail(c.getContactEmail());
        r.setContactPhone(c.getContactPhone());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}