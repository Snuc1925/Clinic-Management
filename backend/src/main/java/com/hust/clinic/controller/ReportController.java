package com.hust.clinic.controller;

import com.hust.clinic.dto.ClientPaymentStatsResponse;
import com.hust.clinic.dto.RevenueReportResponse;
import com.hust.clinic.dto.StaffPerformanceResponse;
import com.hust.clinic.service.PaymentService;
import com.hust.clinic.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clinics/{clinicId}/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.hust.clinic.repository.UserRepository userRepository;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(@PathVariable Long clinicId,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                             Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            RevenueReportResponse report = reportService.getRevenueReport(userId, clinicId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/revenue/week")
    public ResponseEntity<?> getWeeklyRevenue(@PathVariable Long clinicId,
                                             Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(7);
            RevenueReportResponse report = reportService.getRevenueReport(userId, clinicId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/revenue/month")
    public ResponseEntity<?> getMonthlyRevenue(@PathVariable Long clinicId,
                                              Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusMonths(1);
            RevenueReportResponse report = reportService.getRevenueReport(userId, clinicId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/revenue/year")
    public ResponseEntity<?> getYearlyRevenue(@PathVariable Long clinicId,
                                             Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusYears(1);
            RevenueReportResponse report = reportService.getRevenueReport(userId, clinicId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/staff-performance")
    public ResponseEntity<?> getStaffPerformance(@PathVariable Long clinicId,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<StaffPerformanceResponse> performance = reportService.getStaffPerformance(userId, clinicId, startDate, endDate);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/client-payment-stats")
    public ResponseEntity<?> getClientPaymentStats(@PathVariable Long clinicId,
                                                   Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            List<ClientPaymentStatsResponse> stats = paymentService.getClientPaymentStats(clinicId, userId);
            return ResponseEntity.ok(stats);
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
