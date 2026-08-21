package com.travelsphere.auth.controller;

import com.travelsphere.auth.dto.AuthResponse;
import com.travelsphere.auth.dto.ChangePasswordRequest;
import com.travelsphere.auth.dto.ChangeEmailRequest;
import com.travelsphere.auth.dto.LoginRequest;
import com.travelsphere.auth.dto.RegisterRequest;
import com.travelsphere.auth.service.AuthService;
import com.travelsphere.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth API for registration, login, token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestHeader("Refresh-Token") String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate tokens")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.substring(7);
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile from JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> me(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Roles") String roles) {
        return ResponseEntity.ok(ApiResponse.success(
                AuthResponse.builder()
                        .userId(java.util.UUID.fromString(userId))
                        .email(email)
                        .roles(java.util.Set.of(roles.split(",")))
                        .build(),
                "Current user info"));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change the current user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully. Please log in again."));
    }

    @PutMapping("/change-email")
    @Operation(summary = "Change the current user's email address")
    public ResponseEntity<ApiResponse<Void>> changeEmail(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ChangeEmailRequest request) {
        authService.changeEmail(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Email changed successfully. Please verify your new email."));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete the current user's account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @RequestHeader("X-User-Id") String userId) {
        authService.deleteAccount(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully."));
    }
}
