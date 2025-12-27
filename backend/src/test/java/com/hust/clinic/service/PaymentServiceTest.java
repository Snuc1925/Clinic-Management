package com.hust.clinic.service;

import com.hust.clinic.dto.PaymentRequest;
import com.hust.clinic.dto.PaymentResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Payment;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.PaymentRepository;
import com.hust.clinic.repository.PatientRepository;
import com.hust.clinic.repository.TreatmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TreatmentRepository treatmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long treatmentId = 1L;
    private Long paymentId = 1L;

    private ClinicMembership activeMembership;
    private Treatment testTreatment;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        activeMembership = new ClinicMembership();
        activeMembership.setClinicId(clinicId);
        activeMembership.setUserId(userId);
        activeMembership.setStatus("accepted");

        testTreatment = new Treatment();
        testTreatment.setId(treatmentId);
        testTreatment.setClinicId(clinicId);
        testTreatment.setPatientId(1L);
        testTreatment.setDoctorId(userId);
        testTreatment.setTotalPayment(new BigDecimal("1000000"));
        testTreatment.setDate(LocalDate.now());

        testPayment = new Payment();
        testPayment.setId(paymentId);
        testPayment.setTreatmentId(treatmentId);
        testPayment.setAmount(new BigDecimal("500000"));
        testPayment.setPaymentDate(LocalDate.now());
        testPayment.setPaymentMethod("cash");
        testPayment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testAddPayment_Success() {
        // Arrange
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("300000"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod("credit_card");
        request.setNotes("Partial payment");

        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(paymentRepository.save(any(Payment.class)))
                .thenReturn(testPayment);

        // Act
        PaymentResponse result = paymentService.addPayment(treatmentId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(paymentId, result.getId());
        assertEquals(treatmentId, result.getTreatmentId());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testAddPayment_TreatmentNotFound() {
        // Arrange
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100000"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod("cash");

        when(treatmentRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.addPayment(999L, userId, request);
        });

        assertEquals("Treatment not found", exception.getMessage());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void testGetTreatmentPayments_Success() {
        // Arrange
        Payment payment2 = new Payment();
        payment2.setId(2L);
        payment2.setTreatmentId(treatmentId);
        payment2.setAmount(new BigDecimal("200000"));
        payment2.setPaymentDate(LocalDate.now().minusDays(1));
        payment2.setPaymentMethod("bank_transfer");

        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(paymentRepository.findByTreatmentId(treatmentId))
                .thenReturn(Arrays.asList(testPayment, payment2));

        // Act
        List<PaymentResponse> result = paymentService.getTreatmentPayments(treatmentId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(paymentRepository, times(1)).findByTreatmentId(treatmentId);
    }

    @Test
    void testAddPayment_WithoutMembership() {
        // Arrange
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100000"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod("cash");

        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.addPayment(treatmentId, 999L, request);
        });

        assertEquals("You are not a member of this clinic", exception.getMessage());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void testAddPayment_ReducesDebt() {
        // Arrange
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("500000"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod("cash");
        request.setNotes("Payment reduces debt");

        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(paymentRepository.save(any(Payment.class)))
                .thenAnswer(invocation -> {
                    Payment saved = invocation.getArgument(0);
                    saved.setId(paymentId);
                    return saved;
                });

        // Act
        PaymentResponse result = paymentService.addPayment(treatmentId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("500000"), result.getAmount());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testGetTreatmentPayments_WithoutMembership() {
        // Arrange
        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.getTreatmentPayments(treatmentId, 999L);
        });

        assertEquals("You are not a member of this clinic", exception.getMessage());
    }
}
