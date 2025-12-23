package com.hust.clinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class RevenueReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal profitLoss;
    private Map<LocalDate, BigDecimal> dailyRevenue;
    private Map<LocalDate, BigDecimal> dailyExpenses;

    public RevenueReportResponse() {
    }

    public RevenueReportResponse(LocalDate startDate, LocalDate endDate, BigDecimal totalRevenue, 
                                BigDecimal totalExpenses, BigDecimal profitLoss, 
                                Map<LocalDate, BigDecimal> dailyRevenue,
                                Map<LocalDate, BigDecimal> dailyExpenses) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalRevenue = totalRevenue;
        this.totalExpenses = totalExpenses;
        this.profitLoss = profitLoss;
        this.dailyRevenue = dailyRevenue;
        this.dailyExpenses = dailyExpenses;
    }

    // Getters and Setters
    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(BigDecimal profitLoss) {
        this.profitLoss = profitLoss;
    }

    public Map<LocalDate, BigDecimal> getDailyRevenue() {
        return dailyRevenue;
    }

    public void setDailyRevenue(Map<LocalDate, BigDecimal> dailyRevenue) {
        this.dailyRevenue = dailyRevenue;
    }

    public Map<LocalDate, BigDecimal> getDailyExpenses() {
        return dailyExpenses;
    }

    public void setDailyExpenses(Map<LocalDate, BigDecimal> dailyExpenses) {
        this.dailyExpenses = dailyExpenses;
    }
}
