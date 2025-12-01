package com.example.finance.dto;

import java.math.BigDecimal;

public class AccountDtos {

    public static class CreateAccountRequest {
        public Long userId;
        public String accountType;
        public BigDecimal initialBalance;
    }

    public static class TransferRequest {
        public Long fromAccountId;
        public Long toAccountId;
        public BigDecimal amount;
        public String description;
    }
}
