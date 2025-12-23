package com.hust.clinic.service;

import com.hust.clinic.dto.ClientPaymentStatsResponse;
import com.hust.clinic.dto.PaymentRequest;
import com.hust.clinic.dto.PaymentResponse;
import com.hust.clinic.entity.Payment;
import com.hust.clinic.entity.Patient;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.repository.PaymentRepository;
import com.hust.clinic.repository.PatientRepository;
import com.hust.clinic.repository.TreatmentRepository;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.entity.ClinicMembership;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public PaymentResponse addPayment(Long treatmentId, Long userId, PaymentRequest request) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        verifyClinicMembership(treatment.getClinicId(), userId);

        Payment payment = new Payment();
        payment.setTreatmentId(treatmentId);
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setNotes(request.getNotes());

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    public List<PaymentResponse> getTreatmentPayments(Long treatmentId, Long userId) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        verifyClinicMembership(treatment.getClinicId(), userId);

        return paymentRepository.findByTreatmentId(treatmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setTreatmentId(payment.getTreatmentId());
        response.setAmount(payment.getAmount());
        response.setPaymentDate(payment.getPaymentDate());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setNotes(payment.getNotes());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }

    public List<ClientPaymentStatsResponse> getClientPaymentStats(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        // Get all patients for this clinic
        List<Patient> patients = patientRepository.findByClinicId(clinicId);
        
        // Get all treatments for this clinic
        List<Treatment> treatments = treatmentRepository.findByClinicId(clinicId);
        
        // Get treatment IDs for efficient payment lookup
        List<Long> treatmentIds = treatments.stream()
            .map(Treatment::getId)
            .collect(Collectors.toList());
        
        // Get all payments for treatments in this clinic (optimized query)
        List<Payment> payments = treatmentIds.isEmpty() ? 
            new ArrayList<>() : 
            paymentRepository.findByTreatmentIdIn(treatmentIds);
        
        // Create a map of treatmentId -> list of payments
        Map<Long, List<Payment>> treatmentPaymentsMap = new HashMap<>();
        for (Payment payment : payments) {
            treatmentPaymentsMap.computeIfAbsent(payment.getTreatmentId(), k -> new ArrayList<>()).add(payment);
        }
        
        // Calculate statistics for each patient
        List<ClientPaymentStatsResponse> stats = new ArrayList<>();
        for (Patient patient : patients) {
            BigDecimal totalPayment = BigDecimal.ZERO;
            BigDecimal totalPaid = BigDecimal.ZERO;
            
            // Get all treatments for this patient
            List<Treatment> patientTreatments = treatments.stream()
                .filter(t -> t.getPatientId().equals(patient.getId()))
                .collect(Collectors.toList());
            
            // Sum up all treatment totalPayment amounts
            for (Treatment treatment : patientTreatments) {
                totalPayment = totalPayment.add(treatment.getTotalPayment());
                
                // Sum up all actual payments made for this treatment
                List<Payment> paymentsForTreatment = treatmentPaymentsMap.getOrDefault(treatment.getId(), new ArrayList<>());
                for (Payment payment : paymentsForTreatment) {
                    totalPaid = totalPaid.add(payment.getAmount());
                }
            }
            
            BigDecimal totalDebt = totalPayment.subtract(totalPaid);
            
            ClientPaymentStatsResponse stat = new ClientPaymentStatsResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getPhone(),
                totalPayment,
                totalPaid,
                totalDebt
            );
            stats.add(stat);
        }
        
        return stats;
    }
}
