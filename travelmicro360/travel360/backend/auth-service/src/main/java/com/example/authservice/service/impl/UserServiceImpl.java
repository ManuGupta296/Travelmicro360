package com.example.authservice.service.impl;

import com.example.authservice.dto.request.UserRequest;
import com.example.authservice.dto.response.UserResponse;
import com.example.authservice.entity.User;
import com.example.authservice.exception.ResourceNotFoundException;
import com.example.authservice.mapper.UserMapper;
import com.example.authservice.repository.CompanyRepository;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final PasswordEncoder encoder;

    public UserServiceImpl(UserRepository userRepo, CompanyRepository companyRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo; this.companyRepo = companyRepo; this.encoder = encoder;
    }

    @Override
    public UserResponse create(UserRequest req) {
        log.info("Creating user: email={}, role={}", req.getEmail(), req.getRole());
        User u = new User();
        u.setName(req.getName()); u.setEmail(req.getEmail());
        if (req.getPassword() != null) u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(User.Role.valueOf(req.getRole()));
        u.setPhone(req.getPhone()); u.setCompanyName(req.getCompanyName());
        if (req.getCompanyId() != null) u.setCompany(companyRepo.findById(req.getCompanyId()).orElse(null));
        return UserMapper.toResponse(userRepo.save(u));
    }

    @Override
    public UserResponse update(Long id, UserRequest req) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        u.setName(req.getName()); u.setEmail(req.getEmail());
        if (req.getPassword() != null && !req.getPassword().isBlank()) u.setPassword(encoder.encode(req.getPassword()));
        if (req.getRole() != null) u.setRole(User.Role.valueOf(req.getRole()));
        u.setPhone(req.getPhone()); u.setCompanyName(req.getCompanyName());
        if (req.getCompanyId() != null) u.setCompany(companyRepo.findById(req.getCompanyId()).orElse(null));
        return UserMapper.toResponse(userRepo.save(u));
    }

    @Override
    public UserResponse getById(Long id) {
        return UserMapper.toResponse(userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    @Override
    public Page<UserResponse> getAll(Pageable pageable) {
        return userRepo.findAll(pageable).map(UserMapper::toResponse);
    }

    @Override
    public void delete(Long id) {
        log.warn("Deleting user with id={}", id);
        if (!userRepo.existsById(id)) throw new ResourceNotFoundException("User not found: " + id);
        userRepo.deleteById(id);
    }

    @Override
    public UserResponse findByEmail(String email) {
        return UserMapper.toResponse(userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user with email=" + email)));
    }

    @Override
    public UserResponse findByRoleAndCompany(String role, String companyName) {
        com.example.authservice.entity.User.Role enumRole;
        try { enumRole = com.example.authservice.entity.User.Role.valueOf(role); }
        catch (IllegalArgumentException ex) { throw new ResourceNotFoundException("Unknown role: " + role); }
        return UserMapper.toResponse(
                userRepo.findFirstByRoleAndCompanyName(enumRole, companyName)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No user with role=" + role + " for company=" + companyName))
        );
    }
}