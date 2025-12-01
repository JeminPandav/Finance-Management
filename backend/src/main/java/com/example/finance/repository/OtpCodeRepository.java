package com.example.finance.repository;

import com.example.finance.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findTopByEmailOrderByCreatedAtDesc(String email);
}
