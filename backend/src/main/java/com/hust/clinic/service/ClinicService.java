package com.hust.clinic.service;

import com.hust.clinic.dto.ClinicMemberResponse;
import com.hust.clinic.dto.ClinicResponse;
import com.hust.clinic.entity.Clinic;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.ClinicRepository;
import com.hust.clinic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ClinicService {

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private ClinicMembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    @Transactional
    public ClinicResponse createClinic(String name, Long ownerId) {
        // Verify user exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate unique code
        String code = generateUniqueCode();

        // Create clinic
        Clinic clinic = new Clinic(name, code, ownerId);
        clinic = clinicRepository.save(clinic);

        // Create owner membership
        ClinicMembership membership = new ClinicMembership(
                clinic.getId(),
                ownerId,
                "accepted",
                "owner"
        );
        membershipRepository.save(membership);

        return new ClinicResponse(
                clinic.getId(),
                clinic.getName(),
                clinic.getCode(),
                clinic.getOwnerId(),
                "owner",
                "accepted",
                clinic.getCreatedAt(),
                clinic.getUpdatedAt()
        );
    }

    public List<ClinicResponse> getUserClinics(Long userId) {
        // Find all memberships for the user
        List<ClinicMembership> memberships = membershipRepository.findByUserId(userId);

        // Get clinic details for each membership
        List<ClinicResponse> clinics = new ArrayList<>();
        for (ClinicMembership membership : memberships) {
            Clinic clinic = clinicRepository.findById(membership.getClinicId())
                    .orElse(null);
            if (clinic != null) {
                clinics.add(new ClinicResponse(
                        clinic.getId(),
                        clinic.getName(),
                        clinic.getCode(),
                        clinic.getOwnerId(),
                        membership.getRole(),
                        membership.getStatus(),
                        clinic.getCreatedAt(),
                        clinic.getUpdatedAt()
                ));
            }
        }
        return clinics;
    }

    @Transactional
    public ClinicResponse joinClinic(String code, Long userId) {
        // Find clinic by code
        Clinic clinic = clinicRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        // Check if user already has a membership
        if (membershipRepository.existsByClinicIdAndUserId(clinic.getId(), userId)) {
            throw new RuntimeException("User already has a membership request for this clinic");
        }

        // Create pending membership
        ClinicMembership membership = new ClinicMembership(
                clinic.getId(),
                userId,
                "pending",
                "member"
        );
        membershipRepository.save(membership);

        return new ClinicResponse(
                clinic.getId(),
                clinic.getName(),
                clinic.getCode(),
                clinic.getOwnerId(),
                "member",
                "pending",
                clinic.getCreatedAt(),
                clinic.getUpdatedAt()
        );
    }

    @Transactional
    public ClinicResponse updateClinic(Long clinicId, String name, Long userId) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        // Verify user is the owner
        if (!clinic.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only the clinic owner can update clinic information");
        }

        clinic.setName(name);
        clinic = clinicRepository.save(clinic);

        return new ClinicResponse(
                clinic.getId(),
                clinic.getName(),
                clinic.getCode(),
                clinic.getOwnerId(),
                "owner",
                "accepted",
                clinic.getCreatedAt(),
                clinic.getUpdatedAt()
        );
    }

    public List<ClinicMemberResponse> getClinicMembers(Long clinicId, Long userId) {
        // Verify clinic exists
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        // Verify user is a member or owner
        ClinicMembership userMembership = membershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));

        // Get all memberships for the clinic
        List<ClinicMembership> memberships = membershipRepository.findByClinicId(clinicId);

        // Build response with user details
        return memberships.stream()
                .map(membership -> {
                    User user = userRepository.findById(membership.getUserId()).orElse(null);
                    if (user != null) {
                        return new ClinicMemberResponse(
                                membership.getId(),
                                user.getId(),
                                user.getPhone(),
                                user.getFullName(),
                                user.getAddress(),
                                user.getDateOfBirth(),
                                membership.getStatus(),
                                membership.getRole(),
                                membership.getCreatedAt()
                        );
                    }
                    return null;
                })
                .filter(member -> member != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateMemberStatus(Long clinicId, Long memberId, String status, Long userId) {
        // Verify clinic exists and user is owner
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        if (!clinic.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only the clinic owner can update member status");
        }

        // Get membership
        ClinicMembership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        // Verify membership belongs to this clinic
        if (!membership.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Membership does not belong to this clinic");
        }

        // Don't allow changing owner status
        if (membership.getRole().equals("owner")) {
            throw new RuntimeException("Cannot change owner status");
        }

        // Update status
        membership.setStatus(status);
        membershipRepository.save(membership);
    }

    @Transactional
    public void removeMember(Long clinicId, Long memberId, Long userId) {
        // Verify clinic exists and user is owner
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        if (!clinic.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only the clinic owner can remove members");
        }

        // Get membership
        ClinicMembership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        // Verify membership belongs to this clinic
        if (!membership.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Membership does not belong to this clinic");
        }

        // Don't allow removing owner
        if (membership.getRole().equals("owner")) {
            throw new RuntimeException("Cannot remove clinic owner");
        }

        // Remove membership
        membershipRepository.delete(membership);
    }

    private String generateUniqueCode() {
        String code;
        Random random = new Random();
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
            }
            code = sb.toString();
        } while (clinicRepository.existsByCode(code));
        return code;
    }
}
