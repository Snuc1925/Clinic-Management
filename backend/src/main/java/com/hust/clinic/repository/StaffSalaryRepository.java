package com.hust.clinic.repository;

import com.hust.clinic.entity.StaffSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffSalaryRepository extends JpaRepository<StaffSalary, Long> {
    List<StaffSalary> findByClinicId(Long clinicId);
    Optional<StaffSalary> findByClinicIdAndStaffId(Long clinicId, Long staffId);
}
