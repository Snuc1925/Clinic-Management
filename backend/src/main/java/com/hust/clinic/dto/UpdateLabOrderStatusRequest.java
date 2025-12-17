package com.hust.clinic.dto;

import java.time.LocalDate;

public class UpdateLabOrderStatusRequest {
    private String status;
    private LocalDate deliveryDate;

    public UpdateLabOrderStatusRequest() {
    }

    public UpdateLabOrderStatusRequest(String status, LocalDate deliveryDate) {
        this.status = status;
        this.deliveryDate = deliveryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
}
