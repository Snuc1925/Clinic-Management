package com.hust.clinic.repository;

import com.hust.clinic.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByBatchId(Long batchId);
    
    @Query("SELECT t FROM InventoryTransaction t WHERE t.batchId IN " +
           "(SELECT b.id FROM ItemBatch b WHERE b.itemId IN " +
           "(SELECT i.id FROM Item i WHERE i.clinicId = :clinicId)) " +
           "ORDER BY t.timestamp DESC")
    List<InventoryTransaction> findByClinicId(Long clinicId);
}
