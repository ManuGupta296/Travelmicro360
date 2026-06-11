package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.response.InventoryResponse;
import com.example.inventoryservice.entity.Inventory;
import com.example.inventoryservice.entity.Partner;
import com.example.inventoryservice.exception.BadRequestException;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.PartnerRepository;
import com.example.inventoryservice.service.impl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock private InventoryRepository repo;
    @Mock private PartnerRepository partnerRepo;

    @InjectMocks private InventoryServiceImpl inventoryService;

    private Inventory inventory;
    private Partner partner;

    @BeforeEach
    void setUp() {
        partner = new Partner();
        partner.setPartnerId(1L);
        partner.setName("Air India");
        partner.setType(Partner.Type.AIRLINE);
        partner.setStatus(Partner.Status.ACTIVE);

        inventory = new Inventory();
        inventory.setInventoryId(101L);
        inventory.setPartner(partner);
        inventory.setItemType("FLIGHT");
        inventory.setName("AI-101 Delhi to Mumbai");
        inventory.setPrice(new BigDecimal("5500.00"));
        inventory.setAvailability(5);
        inventory.setStatus(Inventory.Status.AVAILABLE);
    }

    @Test
    void testDecrement_Success() {
        when(repo.findById(101L)).thenReturn(Optional.of(inventory));
        when(repo.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        InventoryResponse result = inventoryService.decrement(101L);

        assertEquals(4, inventory.getAvailability());
        assertEquals("AVAILABLE", result.getStatus());
    }

    @Test
    void testDecrement_LastItem_MarksSoldOut() {
        inventory.setAvailability(1);
        when(repo.findById(101L)).thenReturn(Optional.of(inventory));
        when(repo.save(any(Inventory.class))).thenAnswer(inv -> inv.getArgument(0));

        InventoryResponse result = inventoryService.decrement(101L);

        assertEquals(0, inventory.getAvailability());
        assertEquals("SOLD_OUT", result.getStatus());
    }

    @Test
    void testDecrement_BelowZero_Throws() {
        inventory.setAvailability(0);
        when(repo.findById(101L)).thenReturn(Optional.of(inventory));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> inventoryService.decrement(101L));
        assertTrue(ex.getMessage().toLowerCase().contains("below zero"));
        verify(repo, never()).save(any());
    }
}
