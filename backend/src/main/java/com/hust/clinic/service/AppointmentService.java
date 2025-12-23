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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public AppointmentResponse createAppointment(Long clinicId, Long userId, AppointmentRequest request) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = patientRepository.findByIdAndClinicId(request.getPatientId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Patient not found in this clinic"));

        Appointment appointment = new Appointment();
        appointment.setClinicId(clinicId);
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(userId);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setDescription(request.getDescription());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : "scheduled");

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getClinicAppointments(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return appointmentRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        verifyClinicMembership(appointment.getClinicId(), userId);

        return mapToResponse(appointment);
    }

    public AppointmentResponse updateAppointment(Long appointmentId, Long userId, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        verifyClinicMembership(appointment.getClinicId(), userId);

        if (request.getAppointmentDate() != null) {
            appointment.setAppointmentDate(request.getAppointmentDate());
        }
        
        if (request.getDescription() != null) {
            appointment.setDescription(request.getDescription());
        }
        
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }

        if (request.getPatientId() != null && !request.getPatientId().equals(appointment.getPatientId())) {
             patientRepository.findByIdAndClinicId(request.getPatientId(), appointment.getClinicId())
                .orElseThrow(() -> new RuntimeException("Patient not found in this clinic"));
             appointment.setPatientId(request.getPatientId());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }


    public List<AppointmentResponse> getCalendarData(Long clinicId, Long userId, LocalDateTime start, LocalDateTime end) {
        verifyClinicMembership(clinicId, userId);

        return appointmentRepository.findByClinicIdAndAppointmentDateBetween(clinicId, start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateAppointmentStatus(Long appointmentId, Long userId, UpdateAppointmentStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        verifyClinicMembership(appointment.getClinicId(), userId);

        appointment.setStatus(request.getStatus());
        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setClinicId(appointment.getClinicId());
        response.setPatientId(appointment.getPatientId());
        response.setDoctorId(appointment.getDoctorId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setDescription(appointment.getDescription());
        response.setStatus(appointment.getStatus());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());

        if (appointment.getPatientId() != null) {
            patientRepository.findById(appointment.getPatientId())
                .ifPresent(patient -> response.setPatientName(patient.getFullName()));
        }

        if (appointment.getDoctorId() != null) {
            userRepository.findById(appointment.getDoctorId())
                .ifPresent(doctor -> response.setDoctorName(doctor.getFullName()));
        }

        return response;
    }
}