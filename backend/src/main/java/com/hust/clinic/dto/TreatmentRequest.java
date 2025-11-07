package com.hust.clinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TreatmentRequest {
    private Long patientId;
    private LocalDate date;
    private String description;
    private BigDecimal totalPayment;

    public TreatmentRequest() {
    }

    public TreatmentRequest(Long patientId, LocalDate date, String description, BigDecimal totalPayment) {
        this.patientId = patientId;
        this.date = date;
        this.description = description;
        this.totalPayment = totalPayment;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }
}
