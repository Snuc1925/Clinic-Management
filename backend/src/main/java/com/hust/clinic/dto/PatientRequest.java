package com.hust.clinic.dto;

import java.time.LocalDate;

public class PatientRequest {
    private String phone;
    private String fullName;
    private String address;
    private LocalDate dateOfBirth;
    private String note;

    public PatientRequest() {
    }

    public PatientRequest(String phone, String fullName, String address, LocalDate dateOfBirth, String note) {
        this.phone = phone;
        this.fullName = fullName;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.note = note;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
