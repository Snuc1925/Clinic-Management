package com.hust.clinic.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClinicMemberResponse {
    
    private Long id;
    private Long userId;
    private String phone;
    private String fullName;
    private String address;
    private LocalDate dateOfBirth;
    private String status;
    private String role;
    private LocalDateTime joinedAt;

    public ClinicMemberResponse() {
    }

    public ClinicMemberResponse(Long id, Long userId, String phone, String fullName, String address, LocalDate dateOfBirth, String status, String role, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.phone = phone;
        this.fullName = fullName;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.status = status;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
