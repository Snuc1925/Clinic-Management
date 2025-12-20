package com.hust.clinic.controller;

import com.hust.clinic.dto.ExportInventoryRequest;
import com.hust.clinic.dto.ImportBatchesRequest;
import com.hust.clinic.dto.ItemBatchResponse;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.service.ItemBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemBatchController {

    @Autowired
    private ItemBatchService itemBatchService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/batches/import")
    public ResponseEntity<?> importBatches(@PathVariable Long clinicId,
                                           @Valid @RequestBody ImportBatchesRequest request,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemBatchResponse> batches = itemBatchService.importBatches(clinicId, userId, request);
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/items/{itemId}/batches")
    public ResponseEntity<?> getItemBatches(@PathVariable Long clinicId,
                                            @PathVariable Long itemId,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemBatchResponse> batches = itemBatchService.getItemBatches(clinicId, itemId, userId);
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/batches/expiring")
    public ResponseEntity<?> getExpiringBatches(@PathVariable Long clinicId,
                                                @RequestParam(defaultValue = "30") Integer daysAhead,
                                                Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemBatchResponse> batches = itemBatchService.getExpiringBatches(clinicId, userId, daysAhead);
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/batches/all")
    public ResponseEntity<?> getAllBatches(@PathVariable Long clinicId,
                                           Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemBatchResponse> batches = itemBatchService.getAllClinicBatches(clinicId, userId);
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/batches/export")
    public ResponseEntity<?> exportInventory(@PathVariable Long clinicId,
                                             @Valid @RequestBody ExportInventoryRequest request,
                                             Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            itemBatchService.exportInventory(clinicId, userId, request);
            return ResponseEntity.ok("{\"message\": \"Inventory exported successfully\"}");
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
