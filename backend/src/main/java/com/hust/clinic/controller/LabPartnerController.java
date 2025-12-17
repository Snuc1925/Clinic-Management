package com.hust.clinic.controller;

import com.hust.clinic.dto.LabPartnerRequest;
import com.hust.clinic.dto.LabPartnerResponse;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.service.LabPartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/lab-partners")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LabPartnerController {

    @Autowired
    private LabPartnerService labPartnerService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createLabPartner(@PathVariable Long clinicId,
                                              @Valid @RequestBody LabPartnerRequest request,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LabPartnerResponse labPartner = labPartnerService.createLabPartner(clinicId, userId, request);
            return ResponseEntity.ok(labPartner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getClinicLabPartners(@PathVariable Long clinicId,
                                                  Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<LabPartnerResponse> labPartners = labPartnerService.getClinicLabPartners(clinicId, userId);
            return ResponseEntity.ok(labPartners);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{labPartnerId}")
    public ResponseEntity<?> getLabPartner(@PathVariable Long clinicId,
                                           @PathVariable Long labPartnerId,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LabPartnerResponse labPartner = labPartnerService.getLabPartner(clinicId, labPartnerId, userId);
            return ResponseEntity.ok(labPartner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{labPartnerId}")
    public ResponseEntity<?> updateLabPartner(@PathVariable Long clinicId,
                                              @PathVariable Long labPartnerId,
                                              @Valid @RequestBody LabPartnerRequest request,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LabPartnerResponse labPartner = labPartnerService.updateLabPartner(clinicId, labPartnerId, userId, request);
            return ResponseEntity.ok(labPartner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{labPartnerId}")
    public ResponseEntity<?> deleteLabPartner(@PathVariable Long clinicId,
                                              @PathVariable Long labPartnerId,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            labPartnerService.deleteLabPartner(clinicId, labPartnerId, userId);
            return ResponseEntity.ok("{\"message\": \"Lab partner deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    private Long getUserIdFromAuth(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByPhone(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
