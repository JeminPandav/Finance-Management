package com.example.finance.dto;

public class AuthDtos {

    public static class RegisterRequest {
        public String fullName;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class LoginResponse {
        public Long userId;
        public String fullName;
        public String email;
        public String message;

        public LoginResponse(Long userId, String fullName, String email, String message) {
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.message = message;
        }
    }
}
