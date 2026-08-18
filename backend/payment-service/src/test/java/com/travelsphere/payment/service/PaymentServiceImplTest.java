package com.travelsphere.payment.service;

import com.travelsphere.common.feign.*;
import com.travelsphere.payment.dto.*;
import com.travelsphere.payment.model.*;
import com.travelsphere.payment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private PromoCodeRepository promoCodeRepository;
    @Mock private RefundRepository refundRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock private FlightClient flightClient;
    @Mock private HotelClient hotelClient;
    @Mock private TransportClient transportClient;
    @Mock private CarRentalClient carRentalClient;
    @Mock private PackageClient packageClient;

    @InjectMocks private PaymentServiceImpl paymentService;

    private UUID userId;
    private UUID paymentId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
    }

    @Test
    void initiatePaymentSuccess() {
        PaymentInitRequest request = PaymentInitRequest.builder()
                .bookingRef("TS-FL-123").serviceType("FLIGHT")
                .amount(new BigDecimal("4500.00")).paymentMethod("CARD").build();

        when(paymentRepository.save(any())).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(paymentId);
            return p;
        });

        PaymentResponse response = paymentService.initiatePayment(request, userId.toString());

        assertNotNull(response);
        assertTrue(response.getPaymentRef().startsWith("TS-PAY-"));
        assertEquals("PENDING", response.getStatus());
        assertEquals(new BigDecimal("4500.00"), response.getFinalAmount());
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("TXN-"));
    }

    @Test
    void initiatePaymentWithValidPromoCode() {
        PromoCode promo = PromoCode.builder()
                .id(UUID.randomUUID()).code("SAVE10").discountPercent(10)
                .minOrderAmount(new BigDecimal("1000")).maxUsage(100).usageCount(0)
                .isActive(true).build();
        when(promoCodeRepository.findByCodeAndIsActiveTrue("SAVE10")).thenReturn(Optional.of(promo));
        when(promoCodeRepository.save(any())).thenReturn(promo);
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(paymentId);
            return p;
        });

        PaymentInitRequest request = PaymentInitRequest.builder()
                .bookingRef("TS-FL-123").serviceType("FLIGHT")
                .amount(new BigDecimal("4500.00")).paymentMethod("CARD")
                .promoCode("SAVE10").build();

        PaymentResponse response = paymentService.initiatePayment(request, userId.toString());

        assertEquals(new BigDecimal("450.00"), response.getDiscountAmount()); // 10% of 4500
        assertEquals(new BigDecimal("4050.00"), response.getFinalAmount());
    }

    @Test
    void initiatePaymentInvalidPromoCodeThrows() {
        when(promoCodeRepository.findByCodeAndIsActiveTrue("INVALID")).thenReturn(Optional.empty());

        PaymentInitRequest request = PaymentInitRequest.builder()
                .bookingRef("TS-FL-123").serviceType("FLIGHT")
                .amount(new BigDecimal("4500.00")).paymentMethod("CARD")
                .promoCode("INVALID").build();

        assertThrows(IllegalArgumentException.class,
                () -> paymentService.initiatePayment(request, userId.toString()));
    }

    @Test
    void confirmPaymentSuccess() {
        Payment payment = Payment.builder()
                .id(paymentId).paymentRef("TS-PAY-123").userId(userId)
                .status(Payment.PaymentStatus.PENDING).finalAmount(new BigDecimal("4500.00"))
                .paymentMethod("CARD").build();
        when(paymentRepository.findByPaymentRef("TS-PAY-123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);

        PaymentResponse response = paymentService.confirmPayment("TS-PAY-123");

        assertEquals("COMPLETED", response.getStatus());
        verify(kafkaTemplate).send(eq("ts.payments.processed"), eq("TS-PAY-123"), any());
    }

    @Test
    void confirmPaymentNotPendingThrows() {
        Payment payment = Payment.builder()
                .id(paymentId).paymentRef("TS-PAY-123")
                .status(Payment.PaymentStatus.COMPLETED).build();
        when(paymentRepository.findByPaymentRef("TS-PAY-123")).thenReturn(Optional.of(payment));

        assertThrows(IllegalStateException.class,
                () -> paymentService.confirmPayment("TS-PAY-123"));
    }

    @Test
    void confirmPaymentWithWalletDeductsBalance() {
        Wallet wallet = Wallet.builder().id(UUID.randomUUID()).userId(userId)
                .balance(new BigDecimal("10000.00")).currency("INR").isActive(true).build();
        Payment payment = Payment.builder()
                .id(paymentId).paymentRef("TS-PAY-123").userId(userId)
                .status(Payment.PaymentStatus.PENDING).finalAmount(new BigDecimal("4500.00"))
                .paymentMethod("WALLET").build();

        when(paymentRepository.findByPaymentRef("TS-PAY-123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);

        paymentService.confirmPayment("TS-PAY-123");

        assertEquals(new BigDecimal("5500.00"), wallet.getBalance());
    }

    @Test
    void processRefundSuccess() {
        Payment payment = Payment.builder()
                .id(paymentId).paymentRef("TS-PAY-123").userId(userId)
                .status(Payment.PaymentStatus.COMPLETED)
                .finalAmount(new BigDecimal("4500.00")).build();
        when(paymentRepository.findByPaymentRef("TS-PAY-123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any())).thenReturn(payment);
        when(refundRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RefundRequest request = RefundRequest.builder()
                .paymentRef("TS-PAY-123").reason("Change of plans").build();

        RefundResponse response = paymentService.processRefund(request);

        assertTrue(response.getRefundRef().startsWith("TS-REF-"));
        assertEquals("COMPLETED", response.getStatus());
        assertEquals(new BigDecimal("4500.00"), response.getAmount());
        assertEquals(Payment.PaymentStatus.REFUNDED, payment.getStatus());
    }

    @Test
    void processRefundNotCompletedPaymentThrows() {
        Payment payment = Payment.builder()
                .id(paymentId).paymentRef("TS-PAY-123")
                .status(Payment.PaymentStatus.PENDING).build();
        when(paymentRepository.findByPaymentRef("TS-PAY-123")).thenReturn(Optional.of(payment));

        RefundRequest request = RefundRequest.builder()
                .paymentRef("TS-PAY-123").reason("Test").build();

        assertThrows(IllegalStateException.class,
                () -> paymentService.processRefund(request));
    }

    @Test
    void topUpWalletCreatesNewWalletIfNotExists() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(walletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TopUpRequest request = TopUpRequest.builder()
                .amount(new BigDecimal("5000.00")).currency("INR").build();

        WalletResponse response = paymentService.topUpWallet(userId, request);

        assertEquals(new BigDecimal("5000.00"), response.getBalance());
        assertEquals("INR", response.getCurrency());
        verify(walletRepository).save(any());
    }

    @Test
    void topUpWalletAddsToExistingBalance() {
        Wallet wallet = Wallet.builder().id(UUID.randomUUID()).userId(userId)
                .balance(new BigDecimal("3000.00")).currency("INR").isActive(true).build();
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);

        TopUpRequest request = TopUpRequest.builder()
                .amount(new BigDecimal("2000.00")).build();

        WalletResponse response = paymentService.topUpWallet(userId, request);

        assertEquals(new BigDecimal("5000.00"), response.getBalance());
    }

    @Test
    void getWalletBalanceSuccess() {
        Wallet wallet = Wallet.builder().id(UUID.randomUUID()).userId(userId)
                .balance(new BigDecimal("7500.00")).currency("INR").isActive(true).build();
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        WalletResponse response = paymentService.getWalletBalance(userId);

        assertEquals(new BigDecimal("7500.00"), response.getBalance());
    }
}
