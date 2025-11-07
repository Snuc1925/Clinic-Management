package com.hust.clinic.service;

import com.hust.clinic.dto.SupplierRequest;
import com.hust.clinic.dto.SupplierResponse;
import com.hust.clinic.entity.Supplier;
import com.hust.clinic.repository.SupplierRepository;
import com.hust.clinic.repository.ClinicMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public SupplierResponse createSupplier(Long userId, SupplierRequest request) {
        validateUserAccess(userId, request.getClinicId());
        
        Supplier supplier = new Supplier(
            request.getClinicId(),
            request.getName(),
            request.getContactPerson(),
            request.getContactPhone(),
            request.getContactEmail(),
            request.getAddress(),
            request.getPaymentTerms(),
            request.getNotes()
        );
        
        supplier = supplierRepository.save(supplier);
        return mapToResponse(supplier);
    }

    public List<SupplierResponse> getClinicSuppliers(Long userId, Long clinicId) {
        validateUserAccess(userId, clinicId);
        return supplierRepository.findByClinicId(clinicId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public SupplierResponse getSupplier(Long userId, Long clinicId, Long supplierId) {
        validateUserAccess(userId, clinicId);
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Supplier does not belong to this clinic");
        }
        
        return mapToResponse(supplier);
    }

    public SupplierResponse updateSupplier(Long userId, Long clinicId, Long supplierId, SupplierRequest request) {
        validateUserAccess(userId, clinicId);
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Supplier does not belong to this clinic");
        }
        
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setContactPhone(request.getContactPhone());
        supplier.setContactEmail(request.getContactEmail());
        supplier.setAddress(request.getAddress());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setNotes(request.getNotes());
        
        supplier = supplierRepository.save(supplier);
        return mapToResponse(supplier);
    }

    public void deleteSupplier(Long userId, Long clinicId, Long supplierId) {
        validateUserAccess(userId, clinicId);
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Supplier does not belong to this clinic");
        }
        
        supplierRepository.delete(supplier);
    }

    private void validateUserAccess(Long userId, Long clinicId) {
        boolean isMember = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId).isPresent();
        if (!isMember) {
            throw new RuntimeException("User is not a member of this clinic");
        }
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return new SupplierResponse(
            supplier.getId(),
            supplier.getClinicId(),
            supplier.getName(),
            supplier.getContactPerson(),
            supplier.getContactPhone(),
            supplier.getContactEmail(),
            supplier.getAddress(),
            supplier.getPaymentTerms(),
            supplier.getNotes(),
            supplier.getCreatedAt(),
            supplier.getUpdatedAt()
        );
    }
}
