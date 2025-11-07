package com.hust.clinic.controller;

import com.hust.clinic.dto.PaymentRequest;
import com.hust.clinic.dto.PaymentResponse;
import com.hust.clinic.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/treatments/{treatmentId}/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addPayment(@PathVariable Long treatmentId,
                                       @Valid @RequestBody PaymentRequest request,
                                       Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            PaymentResponse payment = paymentService.addPayment(treatmentId, userId, request);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getTreatmentPayments(@PathVariable Long treatmentId,
                                                  Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<PaymentResponse> payments = paymentService.getTreatmentPayments(treatmentId, userId);
            return ResponseEntity.ok(payments);
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
