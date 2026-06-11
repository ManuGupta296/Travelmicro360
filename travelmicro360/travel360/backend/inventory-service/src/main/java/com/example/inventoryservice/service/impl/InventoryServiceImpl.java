package com.example.inventoryservice.service.impl;
import com.example.inventoryservice.dto.request.InventoryRequest;
import com.example.inventoryservice.dto.response.InventoryResponse;
import com.example.inventoryservice.entity.Inventory;
import com.example.inventoryservice.entity.Partner;
import com.example.inventoryservice.exception.BadRequestException;
import com.example.inventoryservice.exception.ResourceNotFoundException;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.PartnerRepository;
import com.example.inventoryservice.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class InventoryServiceImpl implements InventoryService {
    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);
    private final InventoryRepository repo;
    private final PartnerRepository partnerRepo;

    public InventoryServiceImpl(InventoryRepository repo, PartnerRepository partnerRepo){
        this.repo = repo;
        this.partnerRepo = partnerRepo;
    }

    @Override public InventoryResponse create(InventoryRequest req){
        log.info("Creating inventory: partnerId={}, name={}", req.getPartnerId(), req.getName());
        Partner p = partnerRepo.findById(req.getPartnerId()).orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        Inventory i = new Inventory();
        i.setPartner(p); i.setItemType(req.getItemType()); i.setName(req.getName());
        i.setPrice(req.getPrice()); i.setAvailability(req.getAvailability());
        i.setStatus(Inventory.Status.valueOf(req.getStatus() != null ? req.getStatus() : "AVAILABLE"));
        i.setDetails(req.getDetails());
        return toRes(repo.save(i));
    }

    @Override public InventoryResponse update(Long id, InventoryRequest req){
        Inventory i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));
        if (req.getPartnerId() != null) i.setPartner(partnerRepo.findById(req.getPartnerId()).orElseThrow(() -> new ResourceNotFoundException("Partner not found")));
        i.setItemType(req.getItemType()); i.setName(req.getName());
        i.setPrice(req.getPrice()); i.setAvailability(req.getAvailability());
        if (req.getStatus() != null) i.setStatus(Inventory.Status.valueOf(req.getStatus()));
        i.setDetails(req.getDetails());
        return toRes(repo.save(i));
    }

    @Override public InventoryResponse getById(Long id){ return toRes(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id))); }
    @Override public Page<InventoryResponse> getAll(Pageable p){ return repo.findAll(p).map(this::toRes); }
    @Override public void delete(Long id){ repo.deleteById(id); }

    @Override
    public InventoryResponse decrement(Long id) {
        log.info("Decrementing inventory: {}", id);
        Inventory i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));
        if (i.getAvailability() == null || i.getAvailability() <= 0) {
            throw new BadRequestException("Inventory unavailable: cannot decrement below zero");
        }
        i.setAvailability(i.getAvailability() - 1);
        if (i.getAvailability() == 0) {
            i.setStatus(Inventory.Status.SOLD_OUT);
        }
        return toRes(repo.save(i));
    }

    @Override
    public InventoryResponse increment(Long id) {
        log.info("Incrementing inventory: {}", id);
        Inventory i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));
        int current = i.getAvailability() == null ? 0 : i.getAvailability();
        i.setAvailability(current + 1);
        if (i.getStatus() == Inventory.Status.SOLD_OUT) {
            i.setStatus(Inventory.Status.AVAILABLE);
        }
        return toRes(repo.save(i));
    }

    private InventoryResponse toRes(Inventory i){
        InventoryResponse r = new InventoryResponse();
        r.setInventoryId(i.getInventoryId());
        r.setPartnerId(i.getPartner().getPartnerId());
        r.setPartnerName(i.getPartner().getName());
        r.setItemType(i.getItemType()); r.setName(i.getName());
        r.setPrice(i.getPrice()); r.setAvailability(i.getAvailability());
        r.setStatus(i.getStatus().name()); r.setDetails(i.getDetails());
        r.setCreatedAt(i.getCreatedAt());
        return r;
    }
}
