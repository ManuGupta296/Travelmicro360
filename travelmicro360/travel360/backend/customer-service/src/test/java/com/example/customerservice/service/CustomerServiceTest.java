package com.example.customerservice.service;

import com.example.customerservice.dto.request.CustomerRequest;
import com.example.customerservice.dto.response.CustomerResponse;
import com.example.customerservice.entity.Customer;
import com.example.customerservice.exception.ResourceNotFoundException;
import com.example.customerservice.repository.CustomerRepository;
import com.example.customerservice.service.impl.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private CustomerRepository repo;
    @InjectMocks private CustomerServiceImpl service;

    private Customer sample;

    @BeforeEach
    void setUp() {
        sample = new Customer();
        sample.setCustomerId(1L);
        sample.setName("Manu Gupta");
        sample.setEmail("manu@example.com");
        sample.setPhone("9876543210");
        sample.setAddress("Bengaluru, IN");
        sample.setUserId(101L);
    }

    @Test
    void shouldCreateCustomerSuccessfully() {
        CustomerRequest req = new CustomerRequest();
        req.setName("Manu Gupta");
        req.setEmail("manu@example.com");
        req.setPhone("9876543210");
        req.setAddress("Bengaluru, IN");
        req.setUserId(101L);
        when(repo.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setCustomerId(1L);
            return c;
        });

        CustomerResponse result = service.create(req);

        assertEquals("Manu Gupta", result.getName());
        assertEquals("manu@example.com", result.getEmail());
        assertEquals(101L, result.getUserId());
        verify(repo, times(1)).save(any(Customer.class));
    }

    @Test
    void shouldUpdateCustomerSuccessfully() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        when(repo.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        CustomerRequest req = new CustomerRequest();
        req.setName("Manu G.");
        req.setEmail("manu.g@example.com");
        req.setPhone("9999999999");
        req.setAddress("Hyderabad, IN");
        req.setUserId(101L);

        CustomerResponse result = service.update(1L, req);

        assertEquals("Manu G.", result.getName());
        assertEquals("manu.g@example.com", result.getEmail());
        verify(repo, times(1)).save(any(Customer.class));
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentCustomer() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(999L, new CustomerRequest()));
        verify(repo, never()).save(any());
    }

    @Test
    void shouldThrowWhenCustomerNotFound() {
        when(repo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById(999L));
    }

    @Test
    void shouldThrowWhenDeletingNonExistentCustomer() {
        when(repo.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.delete(999L));
        verify(repo, never()).deleteById(any(Long.class));
    }
}
