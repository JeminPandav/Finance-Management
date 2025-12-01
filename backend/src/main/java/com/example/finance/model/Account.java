package com.example.finance.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountNumber;

    private String accountType; // SAVINGS, CURRENT, WALLET

    private BigDecimal balance = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Account() {}

    public Account(String accountNumber, String accountType, BigDecimal balance, User user) {
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.balance = balance;
        this.user = user;
    }

    public Long getId() { return id; }

    public String getAccountNumber() { return accountNumber; }

    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountType() { return accountType; }

    public void setAccountType(String accountType) { this.accountType = accountType; }

    public BigDecimal getBalance() { return balance; }

    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }
}
