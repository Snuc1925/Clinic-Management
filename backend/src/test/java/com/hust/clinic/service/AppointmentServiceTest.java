package com.hust.clinic.service;

import com.hust.clinic.dto.AppointmentRequest;
import com.hust.clinic.dto.AppointmentResponse;
import com.hust.clinic.dto.UpdateAppointmentStatusRequest;
import com.hust.clinic.entity.Appointment;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.AppointmentRepository;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.PatientRepository;
import com.hust.clinic.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long patientId = 1L;
    private Long appointmentId = 1L;

    private ClinicMembership activeMembership;
    private Patient testPatient;
    private Appointment testAppointment;
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

        testDoctor = new User();
        testDoctor.setId(userId);
        testDoctor.setFullName("Dr. Test");

        testAppointment = new Appointment();
        testAppointment.setId(appointmentId);
        testAppointment.setClinicId(clinicId);
        testAppointment.setPatientId(patientId);
        testAppointment.setDoctorId(userId);
        testAppointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        testAppointment.setDescription("Regular checkup");
        testAppointment.setStatus("scheduled");
    }

    @Test
    void testCreateAppointment_Success() {
        // Arrange
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patientId);
        request.setAppointmentDate(LocalDateTime.now().plusDays(2));
        request.setDescription("Follow-up visit");
        request.setStatus("scheduled");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(patientRepository.findByIdAndClinicId(patientId, clinicId))
                .thenReturn(Optional.of(testPatient));
        when(appointmentRepository.save(any(Appointment.class)))
                .thenReturn(testAppointment);
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        AppointmentResponse result = appointmentService.createAppointment(clinicId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(appointmentId, result.getId());
        assertEquals("Test Patient", result.getPatientName());
        assertEquals("Dr. Test", result.getDoctorName());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testGetClinicAppointments_Success() {
        // Arrange
        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setClinicId(clinicId);
        appointment2.setPatientId(patientId);
        appointment2.setDoctorId(userId);
        appointment2.setAppointmentDate(LocalDateTime.now().plusDays(3));
        appointment2.setStatus("confirmed");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(appointmentRepository.findByClinicIdOrderByAppointmentDateDesc(clinicId))
                .thenReturn(Arrays.asList(testAppointment, appointment2));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        List<AppointmentResponse> result = appointmentService.getClinicAppointments(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(appointmentRepository, times(1)).findByClinicIdOrderByAppointmentDateDesc(clinicId);
    }

    @Test
    void testUpdateAppointment_Success() {
        // Arrange
        AppointmentRequest request = new AppointmentRequest();
        request.setAppointmentDate(LocalDateTime.now().plusDays(5));
        request.setDescription("Updated description");
        request.setStatus("confirmed");

        when(appointmentRepository.findById(appointmentId))
                .thenReturn(Optional.of(testAppointment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(appointmentRepository.save(any(Appointment.class)))
                .thenReturn(testAppointment);
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        AppointmentResponse result = appointmentService.updateAppointment(appointmentId, userId, request);

        // Assert
        assertNotNull(result);
        verify(appointmentRepository, times(1)).save(testAppointment);
    }

    @Test
    void testUpdateAppointmentStatus_Success() {
        // Arrange
        UpdateAppointmentStatusRequest request = new UpdateAppointmentStatusRequest();
        request.setStatus("completed");

        when(appointmentRepository.findById(appointmentId))
                .thenReturn(Optional.of(testAppointment));
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(appointmentRepository.save(any(Appointment.class)))
                .thenReturn(testAppointment);
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        AppointmentResponse result = appointmentService.updateAppointmentStatus(appointmentId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("completed", testAppointment.getStatus());
        verify(appointmentRepository, times(1)).save(testAppointment);
    }

    @Test
    void testGetCalendarData_Success() {
        // Arrange
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = LocalDateTime.now().plusDays(7);

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(appointmentRepository.findByClinicIdAndAppointmentDateBetween(clinicId, start, end))
                .thenReturn(Arrays.asList(testAppointment));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        List<AppointmentResponse> result = appointmentService.getCalendarData(clinicId, userId, start, end);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(appointmentRepository, times(1))
                .findByClinicIdAndAppointmentDateBetween(clinicId, start, end);
    }
}
