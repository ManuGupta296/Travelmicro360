package com.example.authservice.service;

import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.entity.User;
import com.example.authservice.exception.ResourceNotFoundException;
import com.example.authservice.repository.CompanyRepository;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtUtil;
import com.example.authservice.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepo;
    @Mock private CompanyRepository companyRepo;
    @Mock private PasswordEncoder encoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authManager;

    @InjectMocks private AuthServiceImpl authService;

    private User demoUser;

    @BeforeEach
    void setUp() {
        demoUser = new User();
        demoUser.setUserId(1L);
        demoUser.setName("Demo Traveler");
        demoUser.setEmail("traveler@demo.com");
        demoUser.setRole(User.Role.TRAVELER);
        demoUser.setPassword("hashed");
    }

    @Test
    void testLogin_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("traveler@demo.com");
        req.setPassword("demo123");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepo.findByEmail("traveler@demo.com")).thenReturn(Optional.of(demoUser));
        when(jwtUtil.generateToken("traveler@demo.com", "TRAVELER", null)).thenReturn("jwt-token-abc");

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("jwt-token-abc", response.getToken());
        assertEquals("traveler@demo.com", response.getEmail());
        assertEquals("TRAVELER", response.getRole());
        verify(authManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void testLogin_WrongPassword_Throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("traveler@demo.com");
        req.setPassword("wrong-password");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
        verify(userRepo, never()).findByEmail(anyString());
    }

    @Test
    void testLogin_UserNotFoundAfterAuth_Throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("ghost@demo.com");
        req.setPassword("demo123");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepo.findByEmail("ghost@demo.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.login(req));
    }
}
