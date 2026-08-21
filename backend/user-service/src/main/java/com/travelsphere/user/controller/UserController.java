package com.travelsphere.user.controller;

import com.travelsphere.common.dto.ApiResponse;
import com.travelsphere.user.dto.*;
import com.travelsphere.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profiles, loyalty, and referrals")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestHeader("X-User-Id") String userId) {
        UserProfileResponse profile = userService.getProfile(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userService.updateProfile(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @GetMapping("/loyalty")
    @Operation(summary = "Get loyalty points history")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponse>>> getLoyaltyHistory(
            @RequestHeader("X-User-Id") String userId) {
        List<LoyaltyTransactionResponse> history = userService.getLoyaltyHistory(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/referrals")
    @Operation(summary = "Create a referral")
    public ResponseEntity<ApiResponse<ReferralResponse>> createReferral(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ReferralRequest request) {
        ReferralResponse referral = userService.createReferral(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success(referral, "Referral created successfully"));
    }

    @GetMapping("/referrals")
    @Operation(summary = "Get my referrals")
    public ResponseEntity<ApiResponse<List<ReferralResponse>>> getMyReferrals(
            @RequestHeader("X-User-Id") String userId) {
        List<ReferralResponse> referrals = userService.getMyReferrals(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(referrals));
    }

    @GetMapping("/me/export")
    @Operation(summary = "Export all user data for GDPR compliance")
    public ResponseEntity<ApiResponse<UserDataExportResponse>> exportUserData(
            @RequestHeader("X-User-Id") String userId) {
        UserDataExportResponse data = userService.exportUserData(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
