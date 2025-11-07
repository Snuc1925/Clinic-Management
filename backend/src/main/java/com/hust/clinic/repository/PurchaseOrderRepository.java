package com.hust.clinic.repository;

import com.hust.clinic.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByClinicId(Long clinicId);
    List<PurchaseOrder> findByClinicIdAndStatus(Long clinicId, String status);
}
