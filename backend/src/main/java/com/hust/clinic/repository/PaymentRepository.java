package com.hust.clinic.repository;

import com.hust.clinic.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTreatmentId(Long treatmentId);
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
}
