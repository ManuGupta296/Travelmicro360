package com.example.complianceservice.service;

import com.example.complianceservice.dto.request.AuditLogRequest;
import com.example.complianceservice.dto.response.AuditLogResponse;
import com.example.complianceservice.entity.AuditLog;
import com.example.complianceservice.repository.AuditLogRepository;
import com.example.complianceservice.service.impl.AuditLogServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock private AuditLogRepository repo;
    @InjectMocks private AuditLogServiceImpl auditLogService;

    @Test
    void testLog_CreatesEntry() {
        AuditLogRequest req = new AuditLogRequest();
        req.setAction("CREATE");
        req.setEntityType("Booking");
        req.setEntityId(42L);
        req.setPerformedBy("system");
        req.setDetails("Booking created");

        when(repo.save(any(AuditLog.class))).thenAnswer(inv -> {
            AuditLog a = inv.getArgument(0);
            a.setLogId(1L);
            return a;
        });

        AuditLogResponse response = auditLogService.create(req);

        assertNotNull(response);
        assertEquals(1L, response.getLogId());
        assertEquals("CREATE", response.getAction());
        assertEquals("Booking", response.getEntityType());
        assertEquals(42L, response.getEntityId());
        assertNotNull(response.getTimestamp());
        verify(repo, times(1)).save(any(AuditLog.class));
    }
}
