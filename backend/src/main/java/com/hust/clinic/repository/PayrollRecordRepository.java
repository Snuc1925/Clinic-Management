package com.hust.clinic.repository;

import com.hust.clinic.entity.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByClinicId(Long clinicId);
    List<PayrollRecord> findByClinicIdAndStaffId(Long clinicId, Long staffId);
    List<PayrollRecord> findByClinicIdAndPeriodStartBetween(Long clinicId, LocalDate start, LocalDate end);
}
