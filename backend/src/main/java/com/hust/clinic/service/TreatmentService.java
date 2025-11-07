package com.hust.clinic.service;

import com.hust.clinic.dto.TreatmentRequest;
import com.hust.clinic.dto.TreatmentResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.entity.Payment;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TreatmentService {

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public TreatmentResponse createTreatment(Long clinicId, Long userId, TreatmentRequest request) {
        verifyClinicMembership(clinicId, userId);

        Patient patient = patientRepository.findByIdAndClinicId(request.getPatientId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Patient not found in this clinic"));

        Treatment treatment = new Treatment();
        treatment.setClinicId(clinicId);
        treatment.setPatientId(request.getPatientId());
        treatment.setDoctorId(userId);
        treatment.setDate(request.getDate());
        treatment.setDescription(request.getDescription());
        treatment.setTotalPayment(request.getTotalPayment());

        Treatment saved = treatmentRepository.save(treatment);
        return mapToResponse(saved);
    }

    public List<TreatmentResponse> getClinicTreatments(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return treatmentRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TreatmentResponse getTreatment(Long clinicId, Long treatmentId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Treatment treatment = treatmentRepository.findByIdAndClinicId(treatmentId, clinicId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        return mapToResponse(treatment);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private TreatmentResponse mapToResponse(Treatment treatment) {
        TreatmentResponse response = new TreatmentResponse();
        response.setId(treatment.getId());
        response.setClinicId(treatment.getClinicId());
        response.setPatientId(treatment.getPatientId());
        response.setDoctorId(treatment.getDoctorId());
        response.setDate(treatment.getDate());
        response.setDescription(treatment.getDescription());
        response.setTotalPayment(treatment.getTotalPayment());
        response.setCreatedAt(treatment.getCreatedAt());
        response.setUpdatedAt(treatment.getUpdatedAt());

        Patient patient = patientRepository.findById(treatment.getPatientId()).orElse(null);
        if (patient != null) {
            response.setPatientName(patient.getFullName());
        }

        User doctor = userRepository.findById(treatment.getDoctorId()).orElse(null);
        if (doctor != null) {
            response.setDoctorName(doctor.getFullName());
        }

        List<Payment> payments = paymentRepository.findByTreatmentId(treatment.getId());
        BigDecimal paidAmount = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setPaidAmount(paidAmount);
        response.setRemainingBalance(treatment.getTotalPayment().subtract(paidAmount));

        if (paidAmount.compareTo(treatment.getTotalPayment()) >= 0) {
            response.setPaymentStatus("paid");
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            response.setPaymentStatus("partial");
        } else {
            response.setPaymentStatus("unpaid");
        }

        return response;
    }
}
