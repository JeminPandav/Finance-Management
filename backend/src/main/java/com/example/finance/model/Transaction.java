package com.example.finance.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // CREDIT / DEBIT

    private BigDecimal amount;

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    public Transaction() {}

    public Transaction(String type, BigDecimal amount, String description, Account account) {
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.account = account;
    }

    public Long getId() { return id; }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }

    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Account getAccount() { return account; }

    public void setAccount(Account account) { this.account = account; }
}
