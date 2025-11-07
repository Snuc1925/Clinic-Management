package com.hust.clinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentRequest {
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String notes;

    public PaymentRequest() {
    }

    public PaymentRequest(BigDecimal amount, LocalDate paymentDate, String paymentMethod, String notes) {
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
