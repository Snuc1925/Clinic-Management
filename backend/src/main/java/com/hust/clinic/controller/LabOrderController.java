package com.hust.clinic.controller;

import com.hust.clinic.dto.LabOrderRequest;
import com.hust.clinic.dto.LabOrderResponse;
import com.hust.clinic.dto.UpdateLabOrderStatusRequest;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.service.LabOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LabOrderController {

    @Autowired
    private LabOrderService labOrderService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/clinics/{clinicId}/lab-orders")
    public ResponseEntity<?> createLabOrder(@PathVariable Long clinicId,
                                            @Valid @RequestBody LabOrderRequest request,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LabOrderResponse labOrder = labOrderService.createLabOrder(clinicId, userId, request);
            return ResponseEntity.ok(labOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/clinics/{clinicId}/lab-orders")
    public ResponseEntity<?> getClinicLabOrders(@PathVariable Long clinicId,
                                                Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<LabOrderResponse> labOrders = labOrderService.getClinicLabOrders(clinicId, userId);
            return ResponseEntity.ok(labOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/lab-orders/{labOrderId}")
    public ResponseEntity<?> getLabOrder(@PathVariable Long labOrderId) {
        try {
            LabOrderResponse labOrder = labOrderService.getLabOrder(labOrderId);
            return ResponseEntity.ok(labOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/treatments/{treatmentId}/lab-orders")
    public ResponseEntity<?> getTreatmentLabOrders(@PathVariable Long treatmentId) {
        try {
            List<LabOrderResponse> labOrders = labOrderService.getTreatmentLabOrders(treatmentId);
            return ResponseEntity.ok(labOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/lab-orders/{labOrderId}/status")
    public ResponseEntity<?> updateLabOrderStatus(@PathVariable Long labOrderId,
                                                   @Valid @RequestBody UpdateLabOrderStatusRequest request) {
        try {
            LabOrderResponse labOrder = labOrderService.updateLabOrderStatus(labOrderId, request);
            return ResponseEntity.ok(labOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/clinics/{clinicId}/lab-orders/{labOrderId}")
    public ResponseEntity<?> deleteLabOrder(@PathVariable Long clinicId,
                                            @PathVariable Long labOrderId,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            labOrderService.deleteLabOrder(clinicId, labOrderId, userId);
            return ResponseEntity.ok("{\"message\": \"Lab order deleted successfully\"}");
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
