package com.example.authservice.service;

import com.example.authservice.dto.request.CompanyRequest;
import com.example.authservice.dto.response.CompanyResponse;
import java.util.List;

public interface CompanyService {
    List<CompanyResponse> list();
    CompanyResponse getById(Long id);
    CompanyResponse create(CompanyRequest req);
    CompanyResponse update(Long id, CompanyRequest req);
    void delete(Long id);
}