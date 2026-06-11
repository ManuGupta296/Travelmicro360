package com.example.inventoryservice.service;
import com.example.inventoryservice.dto.request.PartnerRequest;
import com.example.inventoryservice.dto.response.PartnerResponse;
import org.springframework.data.domain.*;
public interface PartnerService { PartnerResponse create(PartnerRequest req); PartnerResponse update(Long id,PartnerRequest req); PartnerResponse getById(Long id); Page<PartnerResponse> getAll(Pageable p); void delete(Long id); }