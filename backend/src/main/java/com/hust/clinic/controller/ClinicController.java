package com.hust.clinic.controller;

import com.hust.clinic.dto.*;
import com.hust.clinic.service.ClinicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClinicController {

    @Autowired
    private ClinicService clinicService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createClinic(@Valid @RequestBody CreateClinicRequest request,
                                         Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ClinicResponse clinic = clinicService.createClinic(request.getName(), userId);
            return ResponseEntity.ok(clinic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<List<ClinicResponse>> getUserClinics(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(clinicService.getUserClinics(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClinicById(@PathVariable Long id) {
        try {
            ClinicDetailResponse clinic = clinicService.getClinicById(id);
            return ResponseEntity.ok(clinic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<?> joinClinic(@PathVariable String code,
                                       Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ClinicResponse clinic = clinicService.joinClinic(code, userId);
            return ResponseEntity.ok(clinic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClinic(@PathVariable Long id,
                                         @Valid @RequestBody UpdateClinicRequest request,
                                         Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ClinicResponse clinic = clinicService.updateClinic(id, request.getName(), userId);
            return ResponseEntity.ok(clinic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getClinicMembers(@PathVariable Long id,
                                             Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ClinicMemberResponse> members = clinicService.getClinicMembers(id, userId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> updateMemberStatus(@PathVariable Long id,
                                               @PathVariable Long memberId,
                                               @Valid @RequestBody UpdateMemberStatusRequest request,
                                               Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            clinicService.updateMemberStatus(id, memberId, request.getStatus(), userId);
            return ResponseEntity.ok("{\"message\": \"Member status updated successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id,
                                         @PathVariable Long memberId,
                                         Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            clinicService.removeMember(id, memberId, userId);
            return ResponseEntity.ok("{\"message\": \"Member removed successfully\"}");
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
