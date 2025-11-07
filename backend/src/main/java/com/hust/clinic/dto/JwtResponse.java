package com.hust.clinic.dto;

public class JwtResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String phone;
    private String fullName;

    public JwtResponse(String token, Long id, String phone, String fullName) {
        this.token = token;
        this.id = id;
        this.phone = phone;
        this.fullName = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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
}
