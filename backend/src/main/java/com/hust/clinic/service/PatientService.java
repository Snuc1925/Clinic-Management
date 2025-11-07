package com.hust.clinic.service;

import com.hust.clinic.dto.PatientRequest;
import com.hust.clinic.dto.PatientResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public PatientResponse createPatient(Long clinicId, Long userId, PatientRequest request) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = new Patient();
        patient.setClinicId(clinicId);
        patient.setPhone(request.getPhone());
        patient.setFullName(request.getFullName());
        patient.setAddress(request.getAddress());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setNote(request.getNote());

        Patient saved = patientRepository.save(patient);
        return mapToResponse(saved);
    }

    public List<PatientResponse> getClinicPatients(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return patientRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PatientResponse getPatient(Long clinicId, Long patientId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return mapToResponse(patient);
    }

    public PatientResponse updatePatient(Long clinicId, Long patientId, Long userId, PatientRequest request) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setPhone(request.getPhone());
        patient.setFullName(request.getFullName());
        patient.setAddress(request.getAddress());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setNote(request.getNote());

        Patient updated = patientRepository.save(patient);
        return mapToResponse(updated);
    }

    public void deletePatient(Long clinicId, Long patientId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patientRepository.delete(patient);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"active".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private PatientResponse mapToResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setClinicId(patient.getClinicId());
        response.setPhone(patient.getPhone());
        response.setFullName(patient.getFullName());
        response.setAddress(patient.getAddress());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setNote(patient.getNote());
        response.setCreatedAt(patient.getCreatedAt());
        response.setUpdatedAt(patient.getUpdatedAt());
        return response;
    }
}
