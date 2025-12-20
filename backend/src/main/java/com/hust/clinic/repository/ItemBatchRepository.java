package com.hust.clinic.repository;

import com.hust.clinic.entity.ItemBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemBatchRepository extends JpaRepository<ItemBatch, Long> {
    List<ItemBatch> findByItemId(Long itemId);
    List<ItemBatch> findByItemIdAndQuantityRemainingGreaterThan(Long itemId, Integer quantity);
    
    @Query("SELECT b FROM ItemBatch b WHERE b.itemId IN (SELECT i.id FROM Item i WHERE i.clinicId = :clinicId) " +
           "AND b.expiryDate IS NOT NULL AND b.expiryDate BETWEEN :startDate AND :endDate " +
           "AND b.quantityRemaining > 0 ORDER BY b.expiryDate ASC")
    List<ItemBatch> findExpiringBatches(Long clinicId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT b FROM ItemBatch b JOIN Item i ON b.itemId = i.id " +
            "WHERE i.clinicId = :clinicId AND b.quantityRemaining > 0 " +
            "ORDER BY b.expiryDate ASC NULLS LAST")
    List<ItemBatch> findAllClinicBatches( Long clinicId);


}
