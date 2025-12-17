package com.hust.clinic.repository;

import com.hust.clinic.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByTreatmentId(Long treatmentId);
    List<LabOrder> findByLabPartnerId(Long labPartnerId);
    List<LabOrder> findByDoctorId(Long doctorId);
    
    @Query("SELECT l FROM LabOrder l WHERE l.treatmentId IN " +
           "(SELECT t.id FROM Treatment t WHERE t.clinicId = :clinicId) " +
           "ORDER BY l.createdAt DESC")
    List<LabOrder> findByClinicId(Long clinicId);
}
