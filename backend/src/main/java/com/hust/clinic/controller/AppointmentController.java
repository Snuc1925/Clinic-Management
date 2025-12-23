package com.hust.clinic.controller;

import com.hust.clinic.dto.AppointmentRequest;
import com.hust.clinic.dto.AppointmentResponse;
import com.hust.clinic.dto.UpdateAppointmentStatusRequest;
import com.hust.clinic.service.AppointmentService;
import com.hust.clinic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @PostMapping("/api/clinics/{clinicId}/appointments")
    public ResponseEntity<?> createAppointment(@PathVariable Long clinicId,
                                              @Valid @RequestBody AppointmentRequest request,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            AppointmentResponse appointment = appointmentService.createAppointment(clinicId, userId, request);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/api/clinics/{clinicId}/appointments")
    public ResponseEntity<?> getClinicAppointments(@PathVariable Long clinicId,
                                                  Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<AppointmentResponse> appointments = appointmentService.getClinicAppointments(clinicId, userId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/api/clinics/{clinicId}/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointment(@PathVariable Long clinicId,
                                            @PathVariable Long appointmentId,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            AppointmentResponse appointment = appointmentService.getAppointment(appointmentId, userId);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/api/clinics/{clinicId}/appointments/{appointmentId}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long clinicId,
                                               @PathVariable Long appointmentId,
                                               @Valid @RequestBody AppointmentRequest request,
                                               Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            AppointmentResponse appointment = appointmentService.updateAppointment(appointmentId, userId, request);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/api/clinics/{clinicId}/calendar")
    public ResponseEntity<?> getCalendarData(@PathVariable Long clinicId,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
                                            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<AppointmentResponse> appointments = appointmentService.getCalendarData(clinicId, userId, start, end);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // API Cập nhật trạng thái nhanh (Status only)
    @PutMapping("/api/appointments/{appointmentId}")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long appointmentId,
                                                     @Valid @RequestBody UpdateAppointmentStatusRequest request,
                                                     Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            AppointmentResponse appointment = appointmentService.updateAppointmentStatus(appointmentId, userId, request);
            return ResponseEntity.ok(appointment);
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