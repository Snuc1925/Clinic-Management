package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class JoinClinicRequest {
    
    @NotBlank(message = "Clinic code is required")
    @Size(min = 6, max = 6, message = "Clinic code must be 6 characters")
    private String code;

    public JoinClinicRequest() {
    }

    public JoinClinicRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
