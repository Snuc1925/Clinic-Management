package com.hust.clinic.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class SupplierRequest {

    @NotNull(message = "Clinic ID is required")
    private Long clinicId;

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private String paymentTerms;
    private String notes;

    public SupplierRequest() {
    }

    // Getters and Setters
    public Long getClinicId() {
        return clinicId;
    }

    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
