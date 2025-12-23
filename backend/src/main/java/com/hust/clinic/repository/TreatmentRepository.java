package com.hust.clinic.repository;

import com.hust.clinic.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
    List<Treatment> findByClinicId(Long clinicId);
    List<Treatment> findByPatientId(Long patientId);
    Optional<Treatment> findByIdAndClinicId(Long id, Long clinicId);
    List<Treatment> findByClinicIdOrderByDateDesc(Long clinicId);
}
