package com.hust.clinic.dto;

import java.time.LocalDateTime;

public class AppointmentRequest {
    private Long patientId;
    private LocalDateTime appointmentDate;
    private String description;
    private String status;

    public AppointmentRequest() {
    }

    public AppointmentRequest(Long patientId, LocalDateTime appointmentDate, String description, String status) {
        this.patientId = patientId;
        this.appointmentDate = appointmentDate;
        this.description = description;
        this.status = status;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
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
}
