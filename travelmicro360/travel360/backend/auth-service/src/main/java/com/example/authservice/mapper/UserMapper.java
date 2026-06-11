package com.example.authservice.mapper;

import com.example.authservice.dto.response.UserResponse;
import com.example.authservice.entity.User;

public class UserMapper {
    public static UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setUserId(u.getUserId());
        r.setName(u.getName());
        r.setRole(u.getRole().name());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setCompanyName(u.getCompanyName());
        r.setManagerEmail(u.getManagerEmail());
        if (u.getCompany() != null) r.setCompanyId(u.getCompany().getCompanyId());
        r.setCreatedAt(u.getCreatedAt());
        r.setUpdatedAt(u.getUpdatedAt());
        return r;
    }
}