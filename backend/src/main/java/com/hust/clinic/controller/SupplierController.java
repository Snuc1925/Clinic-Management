package com.hust.clinic.controller;

import com.hust.clinic.dto.SupplierRequest;
import com.hust.clinic.dto.SupplierResponse;
import com.hust.clinic.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/suppliers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createSupplier(@PathVariable Long clinicId,
                                           @Valid @RequestBody SupplierRequest request,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            request.setClinicId(clinicId);
            SupplierResponse supplier = supplierService.createSupplier(userId, request);
            return ResponseEntity.ok(supplier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getClinicSuppliers(@PathVariable Long clinicId,
                                               Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<SupplierResponse> suppliers = supplierService.getClinicSuppliers(userId, clinicId);
            return ResponseEntity.ok(suppliers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<?> getSupplier(@PathVariable Long clinicId,
                                        @PathVariable Long supplierId,
                                        Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            SupplierResponse supplier = supplierService.getSupplier(userId, clinicId, supplierId);
            return ResponseEntity.ok(supplier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long clinicId,
                                           @PathVariable Long supplierId,
                                           @Valid @RequestBody SupplierRequest request,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            request.setClinicId(clinicId);
            SupplierResponse supplier = supplierService.updateSupplier(userId, clinicId, supplierId, request);
            return ResponseEntity.ok(supplier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long clinicId,
                                           @PathVariable Long supplierId,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            supplierService.deleteSupplier(userId, clinicId, supplierId);
            return ResponseEntity.ok("{\"message\": \"Supplier deleted successfully\"}");
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
