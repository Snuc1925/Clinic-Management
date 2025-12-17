package com.hust.clinic.repository;

import com.hust.clinic.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByClinicId(Long clinicId);
    Optional<Item> findByIdAndClinicId(Long id, Long clinicId);
    
    @Query("SELECT i FROM Item i WHERE i.clinicId = :clinicId AND " +
           "(SELECT COALESCE(SUM(b.quantityRemaining), 0) FROM ItemBatch b WHERE b.itemId = i.id) < i.minStockLevel")
    List<Item> findLowStockItems(Long clinicId);
}
