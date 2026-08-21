package com.travelsphere.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDataExportResponse {
    private ProfileData profile;
    private List<LoyaltyTransactionResponse> loyaltyHistory;
    private List<ReferralResponse> referrals;
    private LocalDateTime exportedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileData {
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private boolean emailVerified;
        private LocalDateTime createdAt;
    }
}
