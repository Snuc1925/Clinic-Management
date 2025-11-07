package com.hust.clinic.repository;

import com.hust.clinic.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    Optional<Clinic> findByCode(String code);
    boolean existsByCode(String code);
    
    @Query("SELECT c FROM Clinic c WHERE c.ownerId = :userId")
    List<Clinic> findByOwnerId(@Param("userId") Long userId);
}
