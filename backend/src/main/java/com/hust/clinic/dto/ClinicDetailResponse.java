package com.hust.clinic.dto;

import java.time.LocalDateTime;

public class ClinicDetailResponse {
    private Long id;
    private String name;
    private String code;
    private LocalDateTime createdAt;

    public ClinicDetailResponse() {
    }

    public ClinicDetailResponse(Long id, String name, String code, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.createdAt = createdAt;
    }

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
