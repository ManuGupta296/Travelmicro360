package com.example.authservice.repository;

import com.example.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByDomain(String domain);
    Optional<Company> findByName(String name);
}
