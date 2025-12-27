package com.hust.clinic.service;

import com.hust.clinic.dto.TreatmentRequest;
import com.hust.clinic.dto.TreatmentResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.*;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TreatmentServiceTest {

    @Mock
    private TreatmentRepository treatmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private TreatmentService treatmentService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long patientId = 1L;
    private Long treatmentId = 1L;

    private ClinicMembership activeMembership;
    private Patient testPatient;
    private Treatment testTreatment;
    private User testDoctor;

    @BeforeEach
    void setUp() {
        activeMembership = new ClinicMembership();
        activeMembership.setClinicId(clinicId);
        activeMembership.setUserId(userId);
        activeMembership.setStatus("accepted");

        testPatient = new Patient();
        testPatient.setId(patientId);
        testPatient.setClinicId(clinicId);
        testPatient.setFullName("Test Patient");
        testPatient.setPhone("0123456789");

        testDoctor = new User();
        testDoctor.setId(userId);
        testDoctor.setFullName("Dr. Test");
        testDoctor.setPhone("0987654321");

        testTreatment = new Treatment();
        testTreatment.setId(treatmentId);
        testTreatment.setClinicId(clinicId);
        testTreatment.setPatientId(patientId);
        testTreatment.setDoctorId(userId);
        testTreatment.setDate(LocalDate.now());
        testTreatment.setDescription("Test treatment");
        testTreatment.setTotalPayment(new BigDecimal("1000000"));
        testTreatment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateTreatment_Success() {
        // Arrange
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(patientId);
        request.setDate(LocalDate.now());
        request.setDescription("Initial consultation");
        request.setTotalPayment(new BigDecimal("500000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(patientId, clinicId))
                .thenReturn(Optional.of(testPatient));
        when(treatmentRepository.save(any(Treatment.class)))
                .thenReturn(testTreatment);
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));
        when(paymentRepository.findByTreatmentId(treatmentId)).thenReturn(Collections.emptyList());

        // Act
        TreatmentResponse result = treatmentService.createTreatment(clinicId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(treatmentId, result.getId());
        assertEquals("Test Patient", result.getPatientName());
        assertEquals("Dr. Test", result.getDoctorName());
        assertEquals("unpaid", result.getPaymentStatus());
        verify(treatmentRepository, times(1)).save(any(Treatment.class));
    }

    @Test
    void testCreateTreatment_PatientNotInClinic() {
        // Arrange
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(999L);
        request.setDate(LocalDate.now());
        request.setDescription("Test");
        request.setTotalPayment(new BigDecimal("100000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(999L, clinicId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            treatmentService.createTreatment(clinicId, userId, request);
        });

        assertEquals("Patient not found in this clinic", exception.getMessage());
        verify(treatmentRepository, never()).save(any(Treatment.class));
    }

    @Test
    void testGetClinicTreatments_Success() {
        // Arrange
        Treatment treatment2 = new Treatment();
        treatment2.setId(2L);
        treatment2.setClinicId(clinicId);
        treatment2.setPatientId(patientId);
        treatment2.setDoctorId(userId);
        treatment2.setDate(LocalDate.now().minusDays(1));
        treatment2.setTotalPayment(new BigDecimal("750000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByClinicIdOrderByDateDesc(clinicId))
                .thenReturn(Arrays.asList(testTreatment, treatment2));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));
        when(paymentRepository.findByTreatmentId(any())).thenReturn(Collections.emptyList());

        // Act
        List<TreatmentResponse> result = treatmentService.getClinicTreatments(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(treatmentRepository, times(1)).findByClinicIdOrderByDateDesc(clinicId);
    }

    @Test
    void testGetTreatment_Success() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByIdAndClinicId(treatmentId, clinicId))
                .thenReturn(Optional.of(testTreatment));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));
        when(paymentRepository.findByTreatmentId(treatmentId)).thenReturn(Collections.emptyList());

        // Act
        TreatmentResponse result = treatmentService.getTreatment(clinicId, treatmentId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(treatmentId, result.getId());
        assertEquals(clinicId, result.getClinicId());
    }

    @Test
    void testGetTreatment_NotFound() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByIdAndClinicId(999L, clinicId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            treatmentService.getTreatment(clinicId, 999L, userId);
        });

        assertEquals("Treatment not found", exception.getMessage());
    }

    @Test
    void testCreateTreatment_WithoutMembership() {
        // Arrange
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(patientId);
        request.setDate(LocalDate.now());
        request.setDescription("Test");
        request.setTotalPayment(new BigDecimal("100000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            treatmentService.createTreatment(clinicId, 999L, request);
        });

        assertEquals("You are not a member of this clinic", exception.getMessage());
        verify(treatmentRepository, never()).save(any(Treatment.class));
    }
}
