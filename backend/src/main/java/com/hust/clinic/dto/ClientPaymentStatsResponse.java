package com.hust.clinic.dto;

import java.math.BigDecimal;

public class ClientPaymentStatsResponse {
    private Long patientId;
    private String patientName;
    private String phone;
    private BigDecimal totalPayment;  // Sum of all treatment totalPayment for this patient
    private BigDecimal totalPaid;     // Sum of all actual payments made
    private BigDecimal totalDebt;     // totalPayment - totalPaid

    public ClientPaymentStatsResponse() {
    }

    public ClientPaymentStatsResponse(Long patientId, String patientName, String phone, 
                                      BigDecimal totalPayment, BigDecimal totalPaid, BigDecimal totalDebt) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.phone = phone;
        this.totalPayment = totalPayment;
        this.totalPaid = totalPaid;
        this.totalDebt = totalDebt;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getTotalDebt() {
        return totalDebt;
    }

    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }
}
