package com.hust.clinic.integration;

import com.hust.clinic.dto.TreatmentRequest;
import com.hust.clinic.dto.TreatmentResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.repository.*;
import com.hust.clinic.service.TreatmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Tests for Treatment Service
 * Kiểm thử tích hợp cho dịch vụ quản lý điều trị
 * Tests the integration between Service and Repository layers
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class TreatmentServiceIntegrationTest {

    @Autowired
    private TreatmentService treatmentService;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ClinicMembershipRepository membershipRepository;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Patient testPatient;
    private ClinicMembership membership;

    @BeforeEach
    void setUp() {
        treatmentRepository.deleteAll();
        patientRepository.deleteAll();
        membershipRepository.deleteAll();

        // Create active membership
        membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("accepted");
        membership.setRole("DOCTOR");
        membership = membershipRepository.save(membership);

        // Create test patient
        testPatient = new Patient();
        testPatient.setClinicId(clinicId);
        testPatient.setFullName("Benh nhan Test");
        testPatient.setPhone("0123456789");
        testPatient.setAddress("123 Test St");
        testPatient.setDateOfBirth(LocalDate.of(1990, 5, 15));
        testPatient = patientRepository.save(testPatient);
    }

    @Test
    void testCreateAndRetrieveTreatment_Integration() {
        // Create a treatment
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(testPatient.getId());
        request.setDate(LocalDate.now());
        request.setDescription("Kham va dieu tri cam cum");
        request.setTotalPayment(new BigDecimal("500000"));

        TreatmentResponse created = treatmentService.createTreatment(clinicId, userId, request);

        // Verify treatment was created
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Kham va dieu tri cam cum", created.getDescription());

        // Retrieve treatment from database
        Treatment savedTreatment = treatmentRepository.findById(created.getId()).orElse(null);
        assertNotNull(savedTreatment);
        assertEquals("Kham va dieu tri cam cum", savedTreatment.getDescription());
        assertEquals(new BigDecimal("500000"), savedTreatment.getTotalPayment());
    }

    @Test
    void testCreateMultipleTreatmentsForPatient_Integration() {
        // Create multiple treatments
        for (int i = 1; i <= 3; i++) {
            TreatmentRequest request = new TreatmentRequest();
            request.setPatientId(testPatient.getId());
            request.setDate(LocalDate.now().minusDays(i));
            request.setDescription("Dieu tri lan thu " + i);
            request.setTotalPayment(new BigDecimal(String.valueOf(200000 * i)));

            treatmentService.createTreatment(clinicId, userId, request);
        }

        // List all treatments
        List<TreatmentResponse> treatments = treatmentService.getClinicTreatments(clinicId, userId);

        // Verify
        assertEquals(3, treatments.size());
    }

    @Test
    void testGetTreatmentById_Integration() {
        // Create a treatment
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(testPatient.getId());
        request.setDate(LocalDate.now());
        request.setDescription("Kham tong quat");
        request.setTotalPayment(new BigDecimal("800000"));

        TreatmentResponse created = treatmentService.createTreatment(clinicId, userId, request);

        // Retrieve by ID
        TreatmentResponse retrieved = treatmentService.getTreatment(clinicId, created.getId(), userId);

        // Verify
        assertNotNull(retrieved);
        assertEquals(created.getId(), retrieved.getId());
        assertEquals("Kham tong quat", retrieved.getDescription());
        assertEquals(new BigDecimal("800000"), retrieved.getTotalPayment());
    }

    @Test
    void testCreateTreatmentWithInvalidPatient_ThrowsException() {
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(99999L); // Non-existent patient
        request.setDate(LocalDate.now());
        request.setDescription("Test treatment");
        request.setTotalPayment(new BigDecimal("100000"));

        // Should throw exception when patient doesn't exist
        assertThrows(RuntimeException.class, () -> {
            treatmentService.createTreatment(clinicId, userId, request);
        });
    }

    @Test
    void testCreateTreatmentWithoutMembership_ThrowsException() {
        // Delete membership
        membershipRepository.deleteAll();

        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(testPatient.getId());
        request.setDate(LocalDate.now());
        request.setDescription("Test treatment");
        request.setTotalPayment(new BigDecimal("100000"));

        // Should throw exception when user is not a member
        assertThrows(RuntimeException.class, () -> {
            treatmentService.createTreatment(clinicId, userId, request);
        });
    }
}
