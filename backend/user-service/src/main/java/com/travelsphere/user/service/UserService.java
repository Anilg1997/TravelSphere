package com.travelsphere.user.service;

import com.travelsphere.user.dto.*;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserProfileResponse getProfile(UUID userId);
    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
    List<LoyaltyTransactionResponse> getLoyaltyHistory(UUID userId);
    ReferralResponse createReferral(UUID userId, ReferralRequest request);
    List<ReferralResponse> getMyReferrals(UUID userId);
    void processUserRegistered(String userId);
    UserDataExportResponse exportUserData(UUID userId);
}
