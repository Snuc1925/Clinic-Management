package com.hust.clinic.repository;

import com.hust.clinic.entity.ClinicMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicMembershipRepository extends JpaRepository<ClinicMembership, Long> {
    List<ClinicMembership> findByUserId(Long userId);
    List<ClinicMembership> findByClinicId(Long clinicId);
    Optional<ClinicMembership> findByClinicIdAndUserId(Long clinicId, Long userId);
    boolean existsByClinicIdAndUserId(Long clinicId, Long userId);
}
