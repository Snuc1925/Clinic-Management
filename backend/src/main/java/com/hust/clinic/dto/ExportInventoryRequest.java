package com.hust.clinic.dto;

public class ExportInventoryRequest {
    private Long batchId;
    private Integer quantity;
    private String reason;

    public ExportInventoryRequest() {
    }

    public ExportInventoryRequest(Long batchId, Integer quantity, String reason) {
        this.batchId = batchId;
        this.quantity = quantity;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
