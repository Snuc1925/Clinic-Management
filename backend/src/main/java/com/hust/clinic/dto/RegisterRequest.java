package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;

public class RegisterRequest {

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String address;

    private LocalDate dateOfBirth;

    @NotBlank(message = "Password is required")
    private String password;

    public RegisterRequest() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
