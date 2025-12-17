package com.hust.clinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LabOrderRequest {
    private Long treatmentId;
    private Long labPartnerId;
    private BigDecimal price;
    private String description;
    private String status;
    private LocalDate deliveryDate;

    public LabOrderRequest() {
    }

    public LabOrderRequest(Long treatmentId, Long labPartnerId, BigDecimal price, String description) {
        this.treatmentId = treatmentId;
        this.labPartnerId = labPartnerId;
        this.price = price;
        this.description = description;
    }

    public Long getTreatmentId() {
        return treatmentId;
    }

    public void setTreatmentId(Long treatmentId) {
        this.treatmentId = treatmentId;
    }

    public Long getLabPartnerId() {
        return labPartnerId;
    }

    public void setLabPartnerId(Long labPartnerId) {
        this.labPartnerId = labPartnerId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
