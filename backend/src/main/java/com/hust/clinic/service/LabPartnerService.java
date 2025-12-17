package com.hust.clinic.service;

import com.hust.clinic.dto.LabPartnerRequest;
import com.hust.clinic.dto.LabPartnerResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.LabPartner;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.LabPartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabPartnerService {

    @Autowired
    private LabPartnerRepository labPartnerRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public LabPartnerResponse createLabPartner(Long clinicId, Long userId, LabPartnerRequest request) {
        verifyClinicMembership(clinicId, userId);

        LabPartner labPartner = new LabPartner();
        labPartner.setClinicId(clinicId);
        labPartner.setName(request.getName());
        labPartner.setPhone(request.getPhone());
        labPartner.setAddress(request.getAddress());

        LabPartner saved = labPartnerRepository.save(labPartner);
        return mapToResponse(saved);
    }

    public List<LabPartnerResponse> getClinicLabPartners(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return labPartnerRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LabPartnerResponse getLabPartner(Long clinicId, Long labPartnerId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        LabPartner labPartner = labPartnerRepository.findByIdAndClinicId(labPartnerId, clinicId)
                .orElseThrow(() -> new RuntimeException("Lab partner not found"));

        return mapToResponse(labPartner);
    }

    public LabPartnerResponse updateLabPartner(Long clinicId, Long labPartnerId, Long userId, LabPartnerRequest request) {
        verifyClinicMembership(clinicId, userId);

        LabPartner labPartner = labPartnerRepository.findByIdAndClinicId(labPartnerId, clinicId)
                .orElseThrow(() -> new RuntimeException("Lab partner not found"));

        labPartner.setName(request.getName());
        labPartner.setPhone(request.getPhone());
        labPartner.setAddress(request.getAddress());

        LabPartner updated = labPartnerRepository.save(labPartner);
        return mapToResponse(updated);
    }

    public void deleteLabPartner(Long clinicId, Long labPartnerId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        LabPartner labPartner = labPartnerRepository.findByIdAndClinicId(labPartnerId, clinicId)
                .orElseThrow(() -> new RuntimeException("Lab partner not found"));

        labPartnerRepository.delete(labPartner);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private LabPartnerResponse mapToResponse(LabPartner labPartner) {
        LabPartnerResponse response = new LabPartnerResponse();
        response.setId(labPartner.getId());
        response.setClinicId(labPartner.getClinicId());
        response.setName(labPartner.getName());
        response.setPhone(labPartner.getPhone());
        response.setAddress(labPartner.getAddress());
        response.setCreatedAt(labPartner.getCreatedAt());
        response.setUpdatedAt(labPartner.getUpdatedAt());
        return response;
    }
}
