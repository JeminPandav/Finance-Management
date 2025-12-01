package com.example.finance.config;

import com.example.finance.model.Account;
import com.example.finance.model.User;
import com.example.finance.repository.AccountRepository;
import com.example.finance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository,
                                      AccountRepository accountRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User("Demo User", "demo@financeapp.com", "password");
                userRepository.save(user);

                Account acc1 = new Account("AC-12345678", "SAVINGS", new BigDecimal("5000.00"), user);
                Account acc2 = new Account("AC-87654321", "WALLET", new BigDecimal("1500.00"), user);
                accountRepository.save(acc1);
                accountRepository.save(acc2);
            }
        };
    }
}
