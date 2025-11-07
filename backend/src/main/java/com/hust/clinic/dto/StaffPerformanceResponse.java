package com.hust.clinic.dto;

import java.math.BigDecimal;

public class StaffPerformanceResponse {

    private Long staffId;
    private String staffName;
    private Integer treatmentCount;
    private BigDecimal totalRevenue;
    private BigDecimal averageRevenuePerTreatment;

    public StaffPerformanceResponse() {
    }

    public StaffPerformanceResponse(Long staffId, String staffName, Integer treatmentCount, 
                                   BigDecimal totalRevenue, BigDecimal averageRevenuePerTreatment) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.treatmentCount = treatmentCount;
        this.totalRevenue = totalRevenue;
        this.averageRevenuePerTreatment = averageRevenuePerTreatment;
    }

    // Getters and Setters
    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public Integer getTreatmentCount() {
        return treatmentCount;
    }

    public void setTreatmentCount(Integer treatmentCount) {
        this.treatmentCount = treatmentCount;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getAverageRevenuePerTreatment() {
        return averageRevenuePerTreatment;
    }

    public void setAverageRevenuePerTreatment(BigDecimal averageRevenuePerTreatment) {
        this.averageRevenuePerTreatment = averageRevenuePerTreatment;
    }
}
