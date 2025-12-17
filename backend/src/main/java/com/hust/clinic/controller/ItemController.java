package com.hust.clinic.controller;

import com.hust.clinic.dto.ItemRequest;
import com.hust.clinic.dto.ItemResponse;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createItem(@PathVariable Long clinicId,
                                        @Valid @RequestBody ItemRequest request,
                                        Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ItemResponse item = itemService.createItem(clinicId, userId, request);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> getClinicItems(@PathVariable Long clinicId,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemResponse> items = itemService.getClinicItems(clinicId, userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<?> getItem(@PathVariable Long clinicId,
                                     @PathVariable Long itemId,
                                     Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ItemResponse item = itemService.getItem(clinicId, itemId, userId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long clinicId,
                                        @PathVariable Long itemId,
                                        @Valid @RequestBody ItemRequest request,
                                        Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            ItemResponse item = itemService.updateItem(clinicId, itemId, userId, request);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long clinicId,
                                        @PathVariable Long itemId,
                                        Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            itemService.deleteItem(clinicId, itemId, userId);
            return ResponseEntity.ok("{\"message\": \"Item deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockItems(@PathVariable Long clinicId,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ItemResponse> items = itemService.getLowStockItems(clinicId, userId);
            return ResponseEntity.ok(items);
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
