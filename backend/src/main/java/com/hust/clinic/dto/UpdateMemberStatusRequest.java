package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;

public class UpdateMemberStatusRequest {
    
    @NotBlank(message = "Status is required")
    private String status;

    public UpdateMemberStatusRequest() {
    }

    public UpdateMemberStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
