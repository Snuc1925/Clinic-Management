package com.hust.clinic.controller;

import com.hust.clinic.dto.PatientRequest;
import com.hust.clinic.dto.PatientResponse;
import com.hust.clinic.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/patients")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createPatient(@PathVariable Long clinicId,
                                          @Valid @RequestBody PatientRequest request,
                                          Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            PatientResponse patient = patientService.createPatient(clinicId, userId, request);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getClinicPatients(@PathVariable Long clinicId,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<PatientResponse> patients = patientService.getClinicPatients(clinicId, userId);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<?> getPatient(@PathVariable Long clinicId,
                                       @PathVariable Long patientId,
                                       Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            PatientResponse patient = patientService.getPatient(clinicId, patientId, userId);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{patientId}")
    public ResponseEntity<?> updatePatient(@PathVariable Long clinicId,
                                          @PathVariable Long patientId,
                                          @Valid @RequestBody PatientRequest request,
                                          Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            PatientResponse patient = patientService.updatePatient(clinicId, patientId, userId, request);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<?> deletePatient(@PathVariable Long clinicId,
                                          @PathVariable Long patientId,
                                          Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            patientService.deletePatient(clinicId, patientId, userId);
            return ResponseEntity.ok("{\"message\": \"Patient deleted successfully\"}");
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
