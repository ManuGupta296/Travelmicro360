package com.example.authservice.service;

import com.example.authservice.dto.request.UserRequest;
import com.example.authservice.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse create(UserRequest req);
    UserResponse update(Long id, UserRequest req);
    UserResponse getById(Long id);
    Page<UserResponse> getAll(Pageable pageable);
    void delete(Long id);
    UserResponse findByRoleAndCompany(String role, String companyName);
    UserResponse findByEmail(String email);
}