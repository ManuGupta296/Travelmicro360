package com.example.customerservice.service;
import com.example.customerservice.dto.request.CustomerRequest;
import com.example.customerservice.dto.response.CustomerResponse;
import org.springframework.data.domain.*;
public interface CustomerService { CustomerResponse create(CustomerRequest req); CustomerResponse update(Long id,CustomerRequest req); CustomerResponse getById(Long id); Page<CustomerResponse> getAll(Pageable p); void delete(Long id); }