package com.example.authservice.service.impl;

import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.request.RegisterRequest;
import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.dto.response.UserResponse;
import com.example.authservice.entity.Company;
import com.example.authservice.entity.User;
import com.example.authservice.exception.BadRequestException;
import com.example.authservice.exception.ResourceNotFoundException;
import com.example.authservice.mapper.UserMapper;
import com.example.authservice.repository.CompanyRepository;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtUtil;
import com.example.authservice.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthServiceImpl(UserRepository userRepo, CompanyRepository companyRepo,
                           PasswordEncoder encoder, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.userRepo = userRepo; this.companyRepo = companyRepo;
        this.encoder = encoder; this.jwtUtil = jwtUtil; this.authManager = authManager;
    }

    @Override
    public AuthResponse register(RegisterRequest req) {
        log.info("Registering new user: email={}, role={}", req.getEmail(), req.getRole());
        if (userRepo.existsByEmail(req.getEmail())) throw new BadRequestException("Email already exists");
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(User.Role.valueOf(req.getRole()));
        user.setPhone(req.getPhone());
        user.setCompanyName(req.getCompanyName());
        user.setManagerEmail(req.getManagerEmail());
        if (req.getCompanyId() != null) {
            Company company = companyRepo.findById(req.getCompanyId()).orElse(null);
            if (company != null) {
                user.setCompany(company);
                user.setCompanyName(company.getName());
            }
        }
        if (user.getCompany() == null) {
            assignCompanyFromEmail(user);
        }
        user = userRepo.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getCompanyName());
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getUserId(), user.getName(), user.getPhone());
    }

    private void assignCompanyFromEmail(User user) {
        String email = user.getEmail();
        int at = email == null ? -1 : email.indexOf('@');
        Company match = null;
        if (at > 0 && at < email.length() - 1) {
            String domain = email.substring(at + 1).toLowerCase();
            match = companyRepo.findByDomain(domain).orElse(null);
        }
        if (match == null) {
            match = companyRepo.findByName("Independent").orElse(null);
        }
        if (match != null) {
            user.setCompany(match);
            user.setCompanyName(match.getName());
        }
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        log.info("Login attempt for email: {}", req.getEmail());
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getCompanyName());
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getUserId(), user.getName(), user.getPhone());
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserMapper.toResponse(user);
    }

    @Override
    public java.util.List<UserResponse> listManagers(String companyName) {
        if (companyName == null || companyName.isBlank()) return java.util.Collections.emptyList();
        return userRepo.findByRoleAndCompanyName(User.Role.CORPORATE_MANAGER, companyName)
                .stream().map(UserMapper::toResponse).toList();
    }
}