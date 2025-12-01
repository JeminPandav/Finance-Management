package com.example.finance.repository;

import com.example.finance.model.Account;
import com.example.finance.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByAccount(Account account);
}
