package com.example.customerservice.service.impl;

import com.example.customerservice.dto.request.CustomerRequest;
import com.example.customerservice.dto.response.CustomerResponse;
import com.example.customerservice.entity.Customer;
import com.example.customerservice.exception.ResourceNotFoundException;
import com.example.customerservice.repository.CustomerRepository;
import com.example.customerservice.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceImpl implements CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);
    private final CustomerRepository repo;

    public CustomerServiceImpl(CustomerRepository repo) {
        this.repo = repo;
    }

    @Override
    public CustomerResponse create(CustomerRequest req) {
        log.info("Creating customer: name={}, email={}", req.getName(), req.getEmail());
        Customer c = new Customer();
        c.setName(req.getName());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setAddress(req.getAddress());
        c.setUserId(req.getUserId());
        return toRes(repo.save(c));
    }

    @Override
    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        c.setName(req.getName());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setAddress(req.getAddress());
        c.setUserId(req.getUserId());
        return toRes(repo.save(c));
    }

    @Override
    public CustomerResponse getById(Long id) {
        return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id)));
    }

    @Override
    public Page<CustomerResponse> getAll(Pageable p) {
        return repo.findAll(p).map(this::toRes);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found: " + id);
        }
        repo.deleteById(id);
    }

    private CustomerResponse toRes(Customer c) {
        CustomerResponse r = new CustomerResponse();
        r.setCustomerId(c.getCustomerId());
        r.setName(c.getName());
        r.setEmail(c.getEmail());
        r.setPhone(c.getPhone());
        r.setAddress(c.getAddress());
        r.setUserId(c.getUserId());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
