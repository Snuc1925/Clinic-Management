package com.hust.clinic.integration;

import com.hust.clinic.dto.PatientRequest;
import com.hust.clinic.dto.PatientResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.PatientRepository;
import com.hust.clinic.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Tests for Patient Service
 * Kiểm thử tích hợp cho dịch vụ quản lý bệnh nhân
 * Tests the integration between Service and Repository layers
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class PatientServiceIntegrationTest {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ClinicMembershipRepository membershipRepository;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private ClinicMembership membership;

    @BeforeEach
    void setUp() {
        patientRepository.deleteAll();
        membershipRepository.deleteAll();

        // Create active membership
        membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("accepted");
        membership.setRole("DOCTOR");
        membership = membershipRepository.save(membership);
    }

    @Test
    void testCreateAndRetrievePatient_Integration() {
        // Create a patient
        PatientRequest request = new PatientRequest();
        request.setPhone("0123456789");
        request.setFullName("Nguyen Van A");
        request.setAddress("123 Nguyen Trai, Ha Noi");
        request.setDateOfBirth(LocalDate.of(1990, 5, 15));
        request.setNote("Benh nhan lan dau");

        PatientResponse created = patientService.createPatient(clinicId, userId, request);

        // Verify patient was created
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Nguyen Van A", created.getFullName());

        // Retrieve patient from database
        Patient savedPatient = patientRepository.findById(created.getId()).orElse(null);
        assertNotNull(savedPatient);
        assertEquals("Nguyen Van A", savedPatient.getFullName());
        assertEquals("0123456789", savedPatient.getPhone());
    }

    @Test
    void testCreateMultiplePatientsAndList_Integration() {
        // Create multiple patients
        for (int i = 1; i <= 3; i++) {
            PatientRequest request = new PatientRequest();
            request.setPhone("012345678" + i);
            request.setFullName("Benh nhan " + i);
            request.setAddress("Dia chi " + i);
            request.setDateOfBirth(LocalDate.of(1990, i, 10));
            request.setNote("Ghi chu " + i);

            patientService.createPatient(clinicId, userId, request);
        }

        // List all patients
        List<PatientResponse> patients = patientService.getClinicPatients(clinicId, userId);

        // Verify
        assertEquals(3, patients.size());
        assertEquals("Benh nhan 1", patients.get(0).getFullName());
        assertEquals("Benh nhan 2", patients.get(1).getFullName());
        assertEquals("Benh nhan 3", patients.get(2).getFullName());
    }

    @Test
    void testUpdatePatient_Integration() {
        // Create a patient
        PatientRequest createRequest = new PatientRequest();
        createRequest.setPhone("0111222333");
        createRequest.setFullName("Tran Van B");
        createRequest.setAddress("456 Cau Giay");
        createRequest.setDateOfBirth(LocalDate.of(1985, 3, 20));

        PatientResponse created = patientService.createPatient(clinicId, userId, createRequest);

        // Update patient
        PatientRequest updateRequest = new PatientRequest();
        updateRequest.setPhone("0999888777");
        updateRequest.setFullName("Tran Van B - Cap nhat");
        updateRequest.setAddress("789 Dia chi moi");
        updateRequest.setDateOfBirth(LocalDate.of(1985, 3, 20));

        PatientResponse updated = patientService.updatePatient(clinicId, created.getId(), userId, updateRequest);

        // Verify
        assertEquals("Tran Van B - Cap nhat", updated.getFullName());
        assertEquals("0999888777", updated.getPhone());

        // Verify in database
        Patient savedPatient = patientRepository.findById(created.getId()).orElse(null);
        assertNotNull(savedPatient);
        assertEquals("Tran Van B - Cap nhat", savedPatient.getFullName());
    }

    @Test
    void testDeletePatient_Integration() {
        // Create a patient
        PatientRequest request = new PatientRequest();
        request.setPhone("0444555666");
        request.setFullName("Le Thi C");
        request.setAddress("321 Ba Dinh");
        request.setDateOfBirth(LocalDate.of(1992, 7, 10));

        PatientResponse created = patientService.createPatient(clinicId, userId, request);
        Long patientId = created.getId();

        // Verify patient exists
        assertTrue(patientRepository.findById(patientId).isPresent());

        // Delete patient
        patientService.deletePatient(clinicId, patientId, userId);

        // Verify patient was deleted
        assertFalse(patientRepository.findById(patientId).isPresent());
    }

    @Test
    void testCreatePatientWithoutMembership_ThrowsException() {
        // Delete membership
        membershipRepository.deleteAll();

        PatientRequest request = new PatientRequest();
        request.setPhone("0123456789");
        request.setFullName("Test Patient");
        request.setAddress("Test Address");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));

        // Should throw exception when user is not a member
        assertThrows(RuntimeException.class, () -> {
            patientService.createPatient(clinicId, userId, request);
        });
    }
}
