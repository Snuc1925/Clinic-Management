package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;

public class CreateClinicRequest {
    
    @NotBlank(message = "Clinic name is required")
    private String name;

    public CreateClinicRequest() {
    }

    public CreateClinicRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
