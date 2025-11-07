package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;

public class UpdateClinicRequest {
    
    @NotBlank(message = "Clinic name is required")
    private String name;

    public UpdateClinicRequest() {
    }

    public UpdateClinicRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
