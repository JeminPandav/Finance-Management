package com.example.finance.controller;

import com.example.finance.dto.AccountDtos;
import com.example.finance.model.Account;
import com.example.finance.model.User;
import com.example.finance.repository.AccountRepository;
import com.example.finance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountController(AccountRepository accountRepository,
                             UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody AccountDtos.CreateAccountRequest request) {
        Optional<User> userOpt = userRepository.findById(request.userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();

        String accNumber = "AC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal initial = request.initialBalance != null ? request.initialBalance : BigDecimal.ZERO;

        Account account = new Account(accNumber, request.accountType, initial, user);
        accountRepository.save(account);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAccountsForUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        List<Account> accounts = accountRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<?> getAccount(@PathVariable Long accountId) {
        Optional<Account> accOpt = accountRepository.findById(accountId);
        return accOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
