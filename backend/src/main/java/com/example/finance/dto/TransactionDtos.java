package com.example.finance.dto;

import java.math.BigDecimal;

public class TransactionDtos {

    public static class CreateTransactionRequest {
        public Long accountId;
        public String type;
        public BigDecimal amount;
        public String description;
    }
}
