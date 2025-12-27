package com.hust.clinic.service;

import com.hust.clinic.dto.PatientRequest;
import com.hust.clinic.dto.PatientResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private PatientService patientService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long patientId = 1L;

    private ClinicMembership activeMembership;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        activeMembership = new ClinicMembership();
        activeMembership.setClinicId(clinicId);
        activeMembership.setUserId(userId);
        activeMembership.setStatus("accepted");

        testPatient = new Patient();
        testPatient.setId(patientId);
        testPatient.setClinicId(clinicId);
        testPatient.setPhone("0123456789");
        testPatient.setFullName("Test Patient");
        testPatient.setAddress("123 Test St");
        testPatient.setDateOfBirth(LocalDate.of(1980, 5, 15));
        testPatient.setNote("Regular patient");
        testPatient.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreatePatient_Success() {
        // Arrange
        PatientRequest request = new PatientRequest();
        request.setPhone("0987654321");
        request.setFullName("New Patient");
        request.setAddress("456 New St");
        request.setDateOfBirth(LocalDate.of(1990, 8, 20));
        request.setNote("First visit");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.save(any(Patient.class)))
                .thenReturn(testPatient);

        // Act
        PatientResponse result = patientService.createPatient(clinicId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(patientId, result.getId());
        assertEquals(clinicId, result.getClinicId());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testGetClinicPatients_Success() {
        // Arrange
        Patient patient2 = new Patient();
        patient2.setId(2L);
        patient2.setClinicId(clinicId);
        patient2.setFullName("Patient Two");
        patient2.setPhone("0111111111");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByClinicId(clinicId))
                .thenReturn(Arrays.asList(testPatient, patient2));

        // Act
        List<PatientResponse> result = patientService.getClinicPatients(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test Patient", result.get(0).getFullName());
        assertEquals("Patient Two", result.get(1).getFullName());
        verify(patientRepository, times(1)).findByClinicId(clinicId);
    }

    @Test
    void testUpdatePatient_Success() {
        // Arrange
        PatientRequest request = new PatientRequest();
        request.setPhone("0999999999");
        request.setFullName("Updated Patient");
        request.setAddress("789 Updated St");
        request.setDateOfBirth(LocalDate.of(1985, 3, 10));
        request.setNote("Updated note");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(patientId, clinicId))
                .thenReturn(Optional.of(testPatient));
        when(patientRepository.save(any(Patient.class)))
                .thenReturn(testPatient);

        // Act
        PatientResponse result = patientService.updatePatient(clinicId, patientId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Patient", testPatient.getFullName());
        assertEquals("0999999999", testPatient.getPhone());
        verify(patientRepository, times(1)).save(testPatient);
    }

    @Test
    void testDeletePatient_Success() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(patientId, clinicId))
                .thenReturn(Optional.of(testPatient));
        doNothing().when(patientRepository).delete(testPatient);

        // Act
        patientService.deletePatient(clinicId, patientId, userId);

        // Assert
        verify(patientRepository, times(1)).findByIdAndClinicId(patientId, clinicId);
        verify(patientRepository, times(1)).delete(testPatient);
    }

    @Test
    void testCreatePatient_WithoutMembership() {
        // Arrange
        PatientRequest request = new PatientRequest();
        request.setPhone("0123456789");
        request.setFullName("Test");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.createPatient(clinicId, 999L, request);
        });

        assertEquals("You are not a member of this clinic", exception.getMessage());
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void testGetPatient_Success() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(patientId, clinicId))
                .thenReturn(Optional.of(testPatient));

        // Act
        PatientResponse result = patientService.getPatient(clinicId, patientId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(patientId, result.getId());
        assertEquals("Test Patient", result.getFullName());
    }

    @Test
    void testGetPatient_NotFound() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(999L, clinicId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.getPatient(clinicId, 999L, userId);
        });

        assertEquals("Patient not found", exception.getMessage());
    }
}
