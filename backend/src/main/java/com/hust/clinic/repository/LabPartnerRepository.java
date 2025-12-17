package com.hust.clinic.repository;

import com.hust.clinic.entity.LabPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabPartnerRepository extends JpaRepository<LabPartner, Long> {
    List<LabPartner> findByClinicId(Long clinicId);
    Optional<LabPartner> findByIdAndClinicId(Long id, Long clinicId);
}
