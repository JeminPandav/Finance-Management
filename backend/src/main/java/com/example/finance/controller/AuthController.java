package com.example.finance.controller;

import com.example.finance.dto.AuthDtos;
import com.example.finance.model.OtpCode;
import com.example.finance.model.User;
import com.example.finance.repository.OtpCodeRepository;
import com.example.finance.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final Random random = new Random();

    public AuthController(UserRepository userRepository,
                          OtpCodeRepository otpCodeRepository) {
        this.userRepository = userRepository;
        this.otpCodeRepository = otpCodeRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        Optional<User> existing = userRepository.findByEmail(request.email);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User(request.fullName, request.email, request.password);
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest request) {
        Optional<User> existing = userRepository.findByEmail(request.email);
        if (existing.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        User user = existing.get();
        if (!user.getPassword().equals(request.password)) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        AuthDtos.LoginResponse response =
                new AuthDtos.LoginResponse(user.getId(), user.getFullName(), user.getEmail(), "Login successful");
        return ResponseEntity.ok(response);
    }

    // ==================== OTP LOGIN ====================

    public static class OtpSendRequest {
        public String email;
    }

    public static class OtpVerifyRequest {
        public String email;
        public String code;
    }

    public static class OtpSendResponse {
        public String message;
        public String demoOtp; // For demo only

        public OtpSendResponse(String message, String demoOtp) {
            this.message = message;
            this.demoOtp = demoOtp;
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpSendRequest request) {
        if (request.email == null || request.email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No user found with this email. Please register first.");
        }

        String otp = String.format("%06d", random.nextInt(999999));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        OtpCode otpCode = new OtpCode(request.email, otp, expiresAt);
        otpCodeRepository.save(otpCode);

        // In real app: send OTP via email/SMS. Here we return it for demo.
        return ResponseEntity.ok(new OtpSendResponse("OTP generated (valid for 5 minutes)", otp));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyRequest request) {
        if (request.email == null || request.email.isBlank() ||
                request.code == null || request.code.isBlank()) {
            return ResponseEntity.badRequest().body("Email and OTP code are required");
        }

        Optional<OtpCode> otpOpt = otpCodeRepository.findTopByEmailOrderByCreatedAtDesc(request.email);
        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No OTP generated for this email");
        }

        OtpCode otpCode = otpOpt.get();

        if (otpCode.isUsed()) {
            return ResponseEntity.badRequest().body("OTP already used. Please request a new one.");
        }

        if (LocalDateTime.now().isAfter(otpCode.getExpiresAt())) {
            return ResponseEntity.badRequest().body("OTP expired. Please request a new one.");
        }

        if (!otpCode.getCode().equals(request.code)) {
            return ResponseEntity.status(401).body("Invalid OTP");
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();
        AuthDtos.LoginResponse response =
                new AuthDtos.LoginResponse(user.getId(), user.getFullName(), user.getEmail(), "OTP login successful");
        return ResponseEntity.ok(response);
    }
}
