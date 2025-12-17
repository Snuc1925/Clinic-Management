package com.hust.clinic.controller;

import com.hust.clinic.dto.InventoryTransactionResponse;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.service.InventoryTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryTransactionController {

    @Autowired
    private InventoryTransactionService inventoryTransactionService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/clinics/{clinicId}/inventory/transactions")
    public ResponseEntity<?> getClinicTransactions(@PathVariable Long clinicId,
                                                   Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<InventoryTransactionResponse> transactions = inventoryTransactionService.getClinicTransactions(clinicId, userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/treatments/{treatmentId}/inventory/transactions")
    public ResponseEntity<?> getTreatmentTransactions(@PathVariable Long treatmentId) {
        try {
            List<InventoryTransactionResponse> transactions = inventoryTransactionService.getTreatmentTransactions(treatmentId);
            return ResponseEntity.ok(transactions);
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
