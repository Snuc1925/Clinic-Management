package com.hust.clinic.dto;

import java.time.LocalDate;

public class UserResponse {

    private Long id;
    private String phone;
    private String fullName;
    private String address;
    private LocalDate dateOfBirth;

    public UserResponse() {
    }

    public UserResponse(Long id, String phone, String fullName, String address, LocalDate dateOfBirth) {
        this.id = id;
        this.phone = phone;
        this.fullName = fullName;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
