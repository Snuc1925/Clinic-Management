package com.hust.clinic.repository;

import com.hust.clinic.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClinicId(Long clinicId);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByClinicIdAndAppointmentDateBetween(Long clinicId, LocalDateTime start, LocalDateTime end);
    List<Appointment> findByClinicIdOrderByAppointmentDateDesc(Long clinicId);
    Optional<Appointment> findByIdAndClinicId(Long id, Long clinicId);
}
