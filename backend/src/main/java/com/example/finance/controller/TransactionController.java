package com.example.finance.controller;

import com.example.finance.dto.AccountDtos;
import com.example.finance.dto.TransactionDtos;
import com.example.finance.model.Account;
import com.example.finance.model.Transaction;
import com.example.finance.repository.AccountRepository;
import com.example.finance.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                 AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionDtos.CreateTransactionRequest request) {
        Optional<Account> accountOpt = accountRepository.findById(request.accountId);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Account not found");
        }
        Account account = accountOpt.get();

        if ("DEBIT".equalsIgnoreCase(request.type)) {
            if (account.getBalance().compareTo(request.amount) < 0) {
                return ResponseEntity.badRequest().body("Insufficient balance");
            }
            account.setBalance(account.getBalance().subtract(request.amount));
        } else if ("CREDIT".equalsIgnoreCase(request.type)) {
            account.setBalance(account.getBalance().add(request.amount));
        } else {
            return ResponseEntity.badRequest().body("Invalid transaction type");
        }

        Transaction tx = new Transaction(request.type.toUpperCase(),
                request.amount,
                request.description,
                account);

        accountRepository.save(account);
        transactionRepository.save(tx);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getTransactionsForAccount(@PathVariable Long accountId) {
        Optional<Account> accOpt = accountRepository.findById(accountId);
        if (accOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Account not found");
        }
        List<Transaction> list = transactionRepository.findByAccount(accOpt.get());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody AccountDtos.TransferRequest request) {
        Optional<Account> fromOpt = accountRepository.findById(request.fromAccountId);
        Optional<Account> toOpt = accountRepository.findById(request.toAccountId);

        if (fromOpt.isEmpty() || toOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("One or both accounts not found");
        }

        Account from = fromOpt.get();
        Account to = toOpt.get();

        if (from.getBalance().compareTo(request.amount) < 0) {
            return ResponseEntity.badRequest().body("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(request.amount));
        to.setBalance(to.getBalance().add(request.amount));

        Transaction debitTx = new Transaction("DEBIT", request.amount,
                "Transfer to account " + to.getAccountNumber() + " - " + request.description, from);
        Transaction creditTx = new Transaction("CREDIT", request.amount,
                "Transfer from account " + from.getAccountNumber() + " - " + request.description, to);

        accountRepository.save(from);
        accountRepository.save(to);
        transactionRepository.save(debitTx);
        transactionRepository.save(creditTx);

        return ResponseEntity.ok("Transfer successful");
    }
}
