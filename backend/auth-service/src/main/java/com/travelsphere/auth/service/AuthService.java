package com.travelsphere.auth.service;

import com.travelsphere.auth.dto.AuthResponse;
import com.travelsphere.auth.dto.LoginRequest;
import com.travelsphere.auth.dto.RegisterRequest;
import com.travelsphere.auth.dto.ChangePasswordRequest;
import com.travelsphere.auth.dto.ChangeEmailRequest;
import java.util.UUID;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String accessToken);
    void changePassword(UUID userId, ChangePasswordRequest request);
    void changeEmail(UUID userId, ChangeEmailRequest request);
    void deleteAccount(UUID userId);
}
