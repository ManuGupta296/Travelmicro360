package com.example.inventoryservice.service.impl;
import com.example.inventoryservice.dto.request.PartnerRequest;
import com.example.inventoryservice.dto.response.PartnerResponse;
import com.example.inventoryservice.entity.Partner;
import com.example.inventoryservice.exception.ResourceNotFoundException;
import com.example.inventoryservice.repository.PartnerRepository;
import com.example.inventoryservice.service.PartnerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
@Service
public class PartnerServiceImpl implements PartnerService {
    private static final Logger log = LoggerFactory.getLogger(PartnerServiceImpl.class);
    private final PartnerRepository repo;
    public PartnerServiceImpl(PartnerRepository repo){this.repo=repo;}
    @Override public PartnerResponse create(PartnerRequest req){ log.info("Creating partner: name={}, type={}", req.getName(), req.getType()); Partner p=new Partner(); p.setName(req.getName()); p.setType(Partner.Type.valueOf(req.getType())); p.setStatus(Partner.Status.valueOf(req.getStatus()!=null?req.getStatus():"ACTIVE")); return toRes(repo.save(p)); }
    @Override public PartnerResponse update(Long id,PartnerRequest req){ Partner p=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Partner not found: "+id)); p.setName(req.getName()); if(req.getType()!=null) p.setType(Partner.Type.valueOf(req.getType())); if(req.getStatus()!=null) p.setStatus(Partner.Status.valueOf(req.getStatus())); return toRes(repo.save(p)); }
    @Override public PartnerResponse getById(Long id){ return toRes(repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Partner not found: "+id))); }
    @Override public Page<PartnerResponse> getAll(Pageable p){ return repo.findAll(p).map(this::toRes); }
    @Override public void delete(Long id){ repo.deleteById(id); }
    private PartnerResponse toRes(Partner p){ PartnerResponse r=new PartnerResponse(); r.setPartnerId(p.getPartnerId()); r.setName(p.getName()); r.setType(p.getType().name()); r.setStatus(p.getStatus().name()); r.setCreatedAt(p.getCreatedAt()); return r; }
}