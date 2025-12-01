package com.example.finance.controller;

import com.example.finance.dto.PaymentDtos;
import com.example.finance.model.Account;
import com.example.finance.model.Payment;
import com.example.finance.model.Transaction;
import com.example.finance.repository.AccountRepository;
import com.example.finance.repository.PaymentRepository;
import com.example.finance.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public PaymentController(PaymentRepository paymentRepository,
                             AccountRepository accountRepository,
                             TransactionRepository transactionRepository) {
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody PaymentDtos.CreatePaymentRequest request) {
        if (request.amount == null || request.amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Amount must be greater than zero");
        }

        Optional<Account> accOpt = accountRepository.findById(request.accountId);
        if (accOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Account not found");
        }

        Account account = accOpt.get();

        if (account.getBalance().compareTo(request.amount) < 0) {
            return ResponseEntity.badRequest().body("Insufficient balance");
        }

        // Deduct from balance
        account.setBalance(account.getBalance().subtract(request.amount));

        // Create payment and transaction record
        Payment payment = new Payment(
                request.amount,
                request.description,
                request.method != null ? request.method : "UPI",
                "SUCCESS",
                account
        );

        Transaction tx = new Transaction(
                "DEBIT",
                request.amount,
                "Payment: " + request.description,
                account
        );

        accountRepository.save(account);
        paymentRepository.save(payment);
        transactionRepository.save(tx);

        return ResponseEntity.ok(payment);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getPaymentsForAccount(@PathVariable Long accountId) {
        Optional<Account> accOpt = accountRepository.findById(accountId);
        if (accOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Account not found");
        }
        List<Payment> list = paymentRepository.findByAccount(accOpt.get());
        return ResponseEntity.ok(list);
    }
}
