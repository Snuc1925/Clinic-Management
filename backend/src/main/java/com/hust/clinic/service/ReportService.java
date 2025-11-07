package com.hust.clinic.service;

import com.hust.clinic.dto.RevenueReportResponse;
import com.hust.clinic.dto.StaffPerformanceResponse;
import com.hust.clinic.entity.Treatment;
import com.hust.clinic.entity.Payment;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.TreatmentRepository;
import com.hust.clinic.repository.PaymentRepository;
import com.hust.clinic.repository.UserRepository;
import com.hust.clinic.repository.ClinicMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public RevenueReportResponse getRevenueReport(Long userId, Long clinicId, LocalDate startDate, LocalDate endDate) {
        validateUserAccess(userId, clinicId);
        
        // Get all payments in the date range
        List<Payment> payments = paymentRepository.findAll().stream()
            .filter(p -> {
                LocalDate paymentDate = p.getPaymentDate();
                return !paymentDate.isBefore(startDate) && !paymentDate.isAfter(endDate);
            })
            .collect(Collectors.toList());
        
        // Filter payments for treatments in this clinic
        List<Treatment> clinicTreatments = treatmentRepository.findByClinicId(clinicId);
        Set<Long> clinicTreatmentIds = clinicTreatments.stream()
            .map(Treatment::getId)
            .collect(Collectors.toSet());
        
        payments = payments.stream()
            .filter(p -> clinicTreatmentIds.contains(p.getTreatmentId()))
            .collect(Collectors.toList());
        
        // Calculate total revenue
        BigDecimal totalRevenue = payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Group by date for daily revenue
        Map<LocalDate, BigDecimal> dailyRevenue = payments.stream()
            .collect(Collectors.groupingBy(
                Payment::getPaymentDate,
                Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)
            ));
        
        // For now, expenses are 0 (can be extended with payroll and purchase orders)
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal profitLoss = totalRevenue.subtract(totalExpenses);
        
        return new RevenueReportResponse(startDate, endDate, totalRevenue, totalExpenses, profitLoss, dailyRevenue);
    }

    public List<StaffPerformanceResponse> getStaffPerformance(Long userId, Long clinicId, LocalDate startDate, LocalDate endDate) {
        validateUserAccess(userId, clinicId);
        
        // Get all treatments in the clinic within the date range
        List<Treatment> treatments = treatmentRepository.findByClinicId(clinicId).stream()
            .filter(t -> !t.getDate().isBefore(startDate) && !t.getDate().isAfter(endDate))
            .collect(Collectors.toList());
        
        // Group by doctor
        Map<Long, List<Treatment>> treatmentsByDoctor = treatments.stream()
            .collect(Collectors.groupingBy(Treatment::getDoctorId));
        
        // Calculate performance for each doctor
        List<StaffPerformanceResponse> performances = new ArrayList<>();
        for (Map.Entry<Long, List<Treatment>> entry : treatmentsByDoctor.entrySet()) {
            Long doctorId = entry.getKey();
            List<Treatment> doctorTreatments = entry.getValue();
            
            User doctor = userRepository.findById(doctorId).orElse(null);
            String doctorName = doctor != null ? doctor.getFullName() : "Unknown";
            
            Integer treatmentCount = doctorTreatments.size();
            BigDecimal totalRevenue = doctorTreatments.stream()
                .map(Treatment::getTotalPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal averageRevenue = treatmentCount > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(treatmentCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            
            performances.add(new StaffPerformanceResponse(
                doctorId, doctorName, treatmentCount, totalRevenue, averageRevenue
            ));
        }
        
        return performances;
    }

    private void validateUserAccess(Long userId, Long clinicId) {
        boolean isMember = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId).isPresent();
        if (!isMember) {
            throw new RuntimeException("User is not a member of this clinic");
        }
    }
}
