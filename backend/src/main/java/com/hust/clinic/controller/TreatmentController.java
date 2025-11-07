package com.hust.clinic.controller;

import com.hust.clinic.dto.TreatmentRequest;
import com.hust.clinic.dto.TreatmentResponse;
import com.hust.clinic.service.TreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/treatments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TreatmentController {

    @Autowired
    private TreatmentService treatmentService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createTreatment(@PathVariable Long clinicId,
                                            @Valid @RequestBody TreatmentRequest request,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            TreatmentResponse treatment = treatmentService.createTreatment(clinicId, userId, request);
            return ResponseEntity.ok(treatment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getClinicTreatments(@PathVariable Long clinicId,
                                                Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<TreatmentResponse> treatments = treatmentService.getClinicTreatments(clinicId, userId);
            return ResponseEntity.ok(treatments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{treatmentId}")
    public ResponseEntity<?> getTreatment(@PathVariable Long clinicId,
                                         @PathVariable Long treatmentId,
                                         Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            TreatmentResponse treatment = treatmentService.getTreatment(clinicId, treatmentId, userId);
            return ResponseEntity.ok(treatment);
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
