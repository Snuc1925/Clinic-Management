package com.hust.clinic.service;

import com.hust.clinic.dto.LabOrderRequest;
import com.hust.clinic.dto.LabOrderResponse;
import com.hust.clinic.dto.UpdateLabOrderStatusRequest;
import com.hust.clinic.entity.*;
import com.hust.clinic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabOrderService {

    @Autowired
    private LabOrderRepository labOrderRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private LabPartnerRepository labPartnerRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public LabOrderResponse createLabOrder(Long clinicId, Long userId, LabOrderRequest request) {
        verifyClinicMembership(clinicId, userId);

        Treatment treatment = treatmentRepository.findByIdAndClinicId(request.getTreatmentId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        LabPartner labPartner = labPartnerRepository.findByIdAndClinicId(request.getLabPartnerId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Lab partner not found"));

        LabOrder labOrder = new LabOrder();
        labOrder.setTreatmentId(request.getTreatmentId());
        labOrder.setLabPartnerId(request.getLabPartnerId());
        labOrder.setDoctorId(treatment.getDoctorId());
        labOrder.setStatus("ORDERED");
        labOrder.setPrice(request.getPrice());
        labOrder.setDescription(request.getDescription());

        LabOrder saved = labOrderRepository.save(labOrder);
        return mapToResponse(saved);
    }

    public List<LabOrderResponse> getClinicLabOrders(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return labOrderRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LabOrderResponse getLabOrder(Long labOrderId) {
        LabOrder labOrder = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new RuntimeException("Lab order not found"));

        return mapToResponse(labOrder);
    }

    public List<LabOrderResponse> getTreatmentLabOrders(Long treatmentId) {
        return labOrderRepository.findByTreatmentId(treatmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LabOrderResponse updateLabOrderStatus(Long labOrderId, UpdateLabOrderStatusRequest request) {
        LabOrder labOrder = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new RuntimeException("Lab order not found"));

        labOrder.setStatus(request.getStatus());
        if (request.getDeliveryDate() != null) {
            labOrder.setDeliveryDate(request.getDeliveryDate());
        }

        LabOrder updated = labOrderRepository.save(labOrder);
        return mapToResponse(updated);
    }

    public LabOrderResponse updateLabOrder(Long clinicId, Long labOrderId, Long userId, LabOrderRequest request) {
        verifyClinicMembership(clinicId, userId);

        LabOrder labOrder = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new RuntimeException("Lab order not found"));

        // Verify treatment belongs to clinic
        Treatment treatment = treatmentRepository.findByIdAndClinicId(request.getTreatmentId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        // Verify lab partner belongs to clinic
        labPartnerRepository.findByIdAndClinicId(request.getLabPartnerId(), clinicId)
                .orElseThrow(() -> new RuntimeException("Lab partner not found"));

        labOrder.setTreatmentId(request.getTreatmentId());
        labOrder.setLabPartnerId(request.getLabPartnerId());
        labOrder.setPrice(request.getPrice());
        labOrder.setDescription(request.getDescription());
        
        // Update status and delivery date if provided
        if (request.getStatus() != null) {
            labOrder.setStatus(request.getStatus());
        }
        if (request.getDeliveryDate() != null) {
            labOrder.setDeliveryDate(request.getDeliveryDate());
        }

        LabOrder updated = labOrderRepository.save(labOrder);
        return mapToResponse(updated);
    }

    public void deleteLabOrder(Long clinicId, Long labOrderId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        LabOrder labOrder = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new RuntimeException("Lab order not found"));

        Treatment treatment = treatmentRepository.findById(labOrder.getTreatmentId())
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        if (!treatment.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Lab order does not belong to this clinic");
        }

        labOrderRepository.delete(labOrder);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private LabOrderResponse mapToResponse(LabOrder labOrder) {
        LabOrderResponse response = new LabOrderResponse();
        response.setId(labOrder.getId());
        response.setTreatmentId(labOrder.getTreatmentId());
        response.setLabPartnerId(labOrder.getLabPartnerId());
        response.setDoctorId(labOrder.getDoctorId());
        response.setStatus(labOrder.getStatus());
        response.setPrice(labOrder.getPrice());
        response.setDescription(labOrder.getDescription());
        response.setDeliveryDate(labOrder.getDeliveryDate());
        response.setCreatedAt(labOrder.getCreatedAt());
        response.setUpdatedAt(labOrder.getUpdatedAt());

        Treatment treatment = treatmentRepository.findById(labOrder.getTreatmentId()).orElse(null);
        if (treatment != null) {
            Patient patient = patientRepository.findById(treatment.getPatientId()).orElse(null);
            if (patient != null) {
                response.setPatientName(patient.getFullName());
            }
        }

        LabPartner labPartner = labPartnerRepository.findById(labOrder.getLabPartnerId()).orElse(null);
        if (labPartner != null) {
            response.setLabPartnerName(labPartner.getName());
        }

        User doctor = userRepository.findById(labOrder.getDoctorId()).orElse(null);
        if (doctor != null) {
            response.setDoctorName(doctor.getFullName());
        }

        return response;
    }
}
