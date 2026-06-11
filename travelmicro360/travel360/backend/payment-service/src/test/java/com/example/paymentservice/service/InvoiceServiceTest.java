package com.example.paymentservice.service;

import com.example.paymentservice.dto.response.InvoiceResponse;
import com.example.paymentservice.entity.Invoice;
import com.example.paymentservice.exception.BadRequestException;
import com.example.paymentservice.exception.ResourceNotFoundException;
import com.example.paymentservice.client.ComplianceClient;
import com.example.paymentservice.repository.InvoiceRepository;
import com.example.paymentservice.service.PaymentService;
import com.example.paymentservice.service.impl.InvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock private InvoiceRepository repo;
    @Mock private PaymentService paymentService;
    @Mock private ComplianceClient complianceClient;
    @InjectMocks private InvoiceServiceImpl invoiceService;

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = new Invoice();
        invoice.setInvoiceId(7L);
        invoice.setBookingId(42L);
        invoice.setAmount(new BigDecimal("5500.00"));
        invoice.setStatus(Invoice.Status.SENT);
        invoice.setIssuedDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
    }

    @Test
    void testMarkPaid_Success() {
        when(repo.findById(7L)).thenReturn(Optional.of(invoice));
        when(repo.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        InvoiceResponse result = invoiceService.markPaid(7L, null);

        assertEquals("PAID", result.getStatus());
        assertEquals(Invoice.Status.PAID, invoice.getStatus());
    }

    @Test
    void testMarkPaid_AlreadyPaid_Throws() {
        invoice.setStatus(Invoice.Status.PAID);
        when(repo.findById(7L)).thenReturn(Optional.of(invoice));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> invoiceService.markPaid(7L, null));
        assertTrue(ex.getMessage().toLowerCase().contains("already paid"));
        verify(repo, never()).save(any());
    }

    @Test
    void testMarkPaid_NotFound_Throws() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.markPaid(99L, null));
    }
}
