package com.travelsphere.user.service;

import com.travelsphere.user.dto.*;
import com.travelsphere.user.model.LoyaltyTransaction;
import com.travelsphere.user.model.Referral;
import com.travelsphere.user.model.UserProfile;
import com.travelsphere.user.repository.LoyaltyTransactionRepository;
import com.travelsphere.user.repository.ReferralRepository;
import com.travelsphere.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserProfileRepository profileRepository;
    private final LoyaltyTransactionRepository loyaltyRepository;
    private final ReferralRepository referralRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public UserProfileResponse getProfile(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));
        return toProfileResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());

        profile = profileRepository.save(profile);
        return toProfileResponse(profile);
    }

    @Override
    public List<LoyaltyTransactionResponse> getLoyaltyHistory(UUID userId) {
        return loyaltyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toLoyaltyResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReferralResponse createReferral(UUID userId, ReferralRequest request) {
        String code = "TS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Referral referral = Referral.builder()
                .referrerUserId(userId)
                .referredEmail(request.getReferredEmail())
                .referralCode(code)
                .status(Referral.ReferralStatus.PENDING)
                .bonusPointsAwarded(500)
                .build();

        referral = referralRepository.save(referral);
        return toReferralResponse(referral);
    }

    @Override
    public List<ReferralResponse> getMyReferrals(UUID userId) {
        return referralRepository.findByReferrerUserId(userId).stream()
                .map(this::toReferralResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserDataExportResponse exportUserData(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));

        UserDataExportResponse.ProfileData profileData = UserDataExportResponse.ProfileData.builder()
                .fullName(profile.getFullName())
                .email(null) // Email is in auth-service, not user-service
                .phone(profile.getPhone())
                .role("USER")
                .emailVerified(false)
                .createdAt(profile.getCreatedAt())
                .build();

        List<LoyaltyTransactionResponse> loyaltyHistory = getLoyaltyHistory(userId);
        List<ReferralResponse> referrals = getMyReferrals(userId);

        return UserDataExportResponse.builder()
                .profile(profileData)
                .loyaltyHistory(loyaltyHistory)
                .referrals(referrals)
                .exportedAt(java.time.LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    @KafkaListener(topics = "ts.users.registered", groupId = "user-service-group")
    public void processUserRegistered(String userId) {
        log.info("Processing user registered event for userId: {}", userId);
        UUID uid = UUID.fromString(userId);

        if (!profileRepository.existsByUserId(uid)) {
            UserProfile profile = UserProfile.builder()
                    .userId(uid)
                    .fullName("New User")
                    .loyaltyPoints(100)
                    .loyaltyTier(UserProfile.LoyaltyTier.SILVER)
                    .totalTrips(0)
                    .totalSpent(0.0)
                    .build();
            profileRepository.save(profile);

            LoyaltyTransaction transaction = LoyaltyTransaction.builder()
                    .userId(uid)
                    .points(100)
                    .type(LoyaltyTransaction.TransactionType.BONUS)
                    .description("Welcome bonus for joining TravelSphere")
                    .build();
            loyaltyRepository.save(transaction);
        }
    }

    private UserProfileResponse toProfileResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .city(profile.getCity())
                .country(profile.getCountry())
                .profileImageS3Key(profile.getProfileImageS3Key())
                .loyaltyPoints(profile.getLoyaltyPoints())
                .loyaltyTier(profile.getLoyaltyTier().name())
                .totalTrips(profile.getTotalTrips())
                .totalSpent(profile.getTotalSpent())
                .createdAt(profile.getCreatedAt())
                .build();
    }

    private LoyaltyTransactionResponse toLoyaltyResponse(LoyaltyTransaction tx) {
        return LoyaltyTransactionResponse.builder()
                .id(tx.getId())
                .points(tx.getPoints())
                .type(tx.getType().name())
                .description(tx.getDescription())
                .referenceId(tx.getReferenceId())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private ReferralResponse toReferralResponse(Referral referral) {
        return ReferralResponse.builder()
                .id(referral.getId())
                .referredEmail(referral.getReferredEmail())
                .referralCode(referral.getReferralCode())
                .status(referral.getStatus().name())
                .bonusPointsAwarded(referral.getBonusPointsAwarded())
                .createdAt(referral.getCreatedAt())
                .completedAt(referral.getCompletedAt())
                .build();
    }
}
