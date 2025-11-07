package com.hust.clinic.repository;

import com.hust.clinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByClinicId(Long clinicId);
    Optional<Patient> findByIdAndClinicId(Long id, Long clinicId);
}
