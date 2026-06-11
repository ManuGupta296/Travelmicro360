package com.example.authservice.service.impl;

import com.example.authservice.dto.request.CompanyRequest;
import com.example.authservice.dto.response.CompanyResponse;
import com.example.authservice.entity.Company;
import com.example.authservice.exception.ResourceNotFoundException;
import com.example.authservice.mapper.CompanyMapper;
import com.example.authservice.repository.CompanyRepository;
import com.example.authservice.service.CompanyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {
    private static final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);
    private final CompanyRepository repo;
    public CompanyServiceImpl(CompanyRepository repo) { this.repo = repo; }

    @Override public List<CompanyResponse> list() { return repo.findAll().stream().map(CompanyMapper::toResponse).collect(Collectors.toList()); }
    @Override public CompanyResponse getById(Long id) { return CompanyMapper.toResponse(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id))); }
    @Override public CompanyResponse create(CompanyRequest req) {
        log.info("Creating company: {}", req.getName());
        Company c = new Company(); c.setName(req.getName()); c.setAddress(req.getAddress());
        c.setContactEmail(req.getContactEmail()); c.setContactPhone(req.getContactPhone());
        return CompanyMapper.toResponse(repo.save(c));
    }
    @Override public CompanyResponse update(Long id, CompanyRequest req) {
        Company c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        c.setName(req.getName()); c.setAddress(req.getAddress());
        c.setContactEmail(req.getContactEmail()); c.setContactPhone(req.getContactPhone());
        return CompanyMapper.toResponse(repo.save(c));
    }
    @Override public void delete(Long id) { repo.deleteById(id); }
}