package com.travelsphere.user.service;

import com.travelsphere.user.dto.*;
import com.travelsphere.user.model.LoyaltyTransaction;
import com.travelsphere.user.model.Referral;
import com.travelsphere.user.model.UserProfile;
import com.travelsphere.user.repository.LoyaltyTransactionRepository;
import com.travelsphere.user.repository.ReferralRepository;
import com.travelsphere.user.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserProfileRepository profileRepository;
    @Mock private LoyaltyTransactionRepository loyaltyRepository;
    @Mock private ReferralRepository referralRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @InjectMocks private UserServiceImpl userService;

    private UUID userId;
    private UserProfile profile;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        profile = UserProfile.builder()
                .id(UUID.randomUUID()).userId(userId).fullName("John Doe")
                .phone("+91-9876543210").address("123 Main St").city("Mumbai").country("India")
                .loyaltyPoints(500).loyaltyTier(UserProfile.LoyaltyTier.GOLD)
                .totalTrips(5).totalSpent(50000.0).createdAt(LocalDateTime.now()).build();
    }

    @Test
    void getProfileSuccess() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        UserProfileResponse response = userService.getProfile(userId);

        assertEquals("John Doe", response.getFullName());
        assertEquals(500, response.getLoyaltyPoints());
        assertEquals("GOLD", response.getLoyaltyTier());
    }

    @Test
    void getProfileNotFoundThrows() {
        when(profileRepository.findByUserId(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.getProfile(userId));
    }

    @Test
    void updateProfileSuccess() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any())).thenReturn(profile);

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .fullName("Jane Doe").city("Delhi").build();

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertEquals("Jane Doe", response.getFullName());
        verify(profileRepository).save(any());
    }

    @Test
    void getLoyaltyHistoryReturnsTransactions() {
        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .id(UUID.randomUUID()).userId(userId).points(100)
                .type(LoyaltyTransaction.TransactionType.BONUS)
                .description("Welcome bonus").createdAt(LocalDateTime.now()).build();
        when(loyaltyRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(tx));

        List<LoyaltyTransactionResponse> history = userService.getLoyaltyHistory(userId);

        assertEquals(1, history.size());
        assertEquals(100, history.get(0).getPoints());
        assertEquals("BONUS", history.get(0).getType());
    }

    @Test
    void createReferralSuccess() {
        when(referralRepository.save(any())).thenAnswer(inv -> {
            Referral r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });

        ReferralRequest request = ReferralRequest.builder()
                .referredEmail("friend@email.com").build();

        ReferralResponse response = userService.createReferral(userId, request);

        assertNotNull(response);
        assertTrue(response.getReferralCode().startsWith("TS-"));
        assertEquals("PENDING", response.getStatus());
        assertEquals(500, response.getBonusPointsAwarded());
        verify(referralRepository).save(any());
    }

    @Test
    void getMyReferralsReturnsList() {
        Referral referral = Referral.builder()
                .id(UUID.randomUUID()).referrerUserId(userId)
                .referredEmail("friend@email.com").referralCode("TS-ABC123")
                .status(Referral.ReferralStatus.PENDING).bonusPointsAwarded(500)
                .createdAt(LocalDateTime.now()).build();
        when(referralRepository.findByReferrerUserId(userId)).thenReturn(List.of(referral));

        List<ReferralResponse> referrals = userService.getMyReferrals(userId);

        assertEquals(1, referrals.size());
        assertEquals("TS-ABC123", referrals.get(0).getReferralCode());
    }

    @Test
    void processUserRegisteredCreatesProfileAndLoyalty() {
        when(profileRepository.existsByUserId(userId)).thenReturn(false);
        when(profileRepository.save(any())).thenReturn(profile);
        when(loyaltyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        userService.processUserRegistered(userId.toString());

        verify(profileRepository).save(any());
        verify(loyaltyRepository).save(any());
    }

    @Test
    void processUserRegisteredSkipsIfProfileExists() {
        when(profileRepository.existsByUserId(userId)).thenReturn(true);

        userService.processUserRegistered(userId.toString());

        verify(profileRepository, never()).save(any());
    }

    // ── Export User Data Tests ─────────────────────────────

    @Test
    void exportUserDataSuccess() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .id(UUID.randomUUID()).userId(userId).points(100)
                .type(LoyaltyTransaction.TransactionType.BONUS)
                .description("Welcome bonus").createdAt(LocalDateTime.now()).build();
        when(loyaltyRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(tx));

        Referral referral = Referral.builder()
                .id(UUID.randomUUID()).referrerUserId(userId)
                .referredEmail("friend@email.com").referralCode("TS-ABC123")
                .status(Referral.ReferralStatus.PENDING).bonusPointsAwarded(500)
                .createdAt(LocalDateTime.now()).build();
        when(referralRepository.findByReferrerUserId(userId)).thenReturn(List.of(referral));

        UserDataExportResponse response = userService.exportUserData(userId);

        assertNotNull(response);
        assertNotNull(response.getProfile());
        assertEquals("John Doe", response.getProfile().getFullName());
        assertEquals("+91-9876543210", response.getProfile().getPhone());
        assertEquals("USER", response.getProfile().getRole());
        assertNotNull(response.getLoyaltyHistory());
        assertEquals(1, response.getLoyaltyHistory().size());
        assertEquals(100, response.getLoyaltyHistory().get(0).getPoints());
        assertNotNull(response.getReferrals());
        assertEquals(1, response.getReferrals().size());
        assertEquals("TS-ABC123", response.getReferrals().get(0).getReferralCode());
        assertNotNull(response.getExportedAt());
    }

    @Test
    void exportUserDataProfileNotFoundThrows() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> userService.exportUserData(userId));
    }

    @Test
    void exportUserDataWithEmptyHistoryAndReferrals() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(loyaltyRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());
        when(referralRepository.findByReferrerUserId(userId)).thenReturn(List.of());

        UserDataExportResponse response = userService.exportUserData(userId);

        assertNotNull(response);
        assertNotNull(response.getProfile());
        assertTrue(response.getLoyaltyHistory().isEmpty());
        assertTrue(response.getReferrals().isEmpty());
    }
}
