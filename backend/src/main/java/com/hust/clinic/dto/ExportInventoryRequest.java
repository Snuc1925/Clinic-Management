package com.hust.clinic.dto;

public class ExportInventoryRequest {
    private Long batchId;
    private Integer quantity;
    private String referenceType; // TREATMENT, LAB, MANUAL
    private Long referenceId;
    private String reason;

    public ExportInventoryRequest() {
    }

    public ExportInventoryRequest(Long batchId, Integer quantity, String referenceType, Long referenceId, String reason) {
        this.batchId = batchId;
        this.quantity = quantity;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.reason = reason;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
