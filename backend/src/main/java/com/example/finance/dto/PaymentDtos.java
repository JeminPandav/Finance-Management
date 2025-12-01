package com.example.finance.dto;

import java.math.BigDecimal;

public class PaymentDtos {

    public static class CreatePaymentRequest {
        public Long accountId;
        public BigDecimal amount;
        public String description;
        public String method;
    }
}
