package com.hust.clinic.dto;

public class UpdateAppointmentStatusRequest {
    private String status;

    public UpdateAppointmentStatusRequest() {
    }

    public UpdateAppointmentStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
