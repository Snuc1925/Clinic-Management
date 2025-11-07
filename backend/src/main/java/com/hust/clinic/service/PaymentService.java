package com.hust.clinic.service;

import com.hust.clinic.dto.PaymentRequest;
import com.hust.clinic.dto.PaymentResponse;
import com.hust.clinic.entity.Payment;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.repository.PaymentRepository;
import com.hust.clinic.repository.TreatmentRepository;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.entity.ClinicMembership;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

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
}
