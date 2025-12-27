package com.hust.clinic.service;

import com.hust.clinic.dto.ClinicMemberResponse;
import com.hust.clinic.dto.ClinicResponse;
import com.hust.clinic.entity.Clinic;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.User;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.ClinicRepository;
import com.hust.clinic.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClinicMembershipServiceTest {

    @Mock
    private ClinicRepository clinicRepository;

    @Mock
    private ClinicMembershipRepository membershipRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClinicService clinicService;

    private Clinic testClinic;
    private User testUser;
    private ClinicMembership testMembership;

    @BeforeEach
    void setUp() {
        testClinic = new Clinic();
        testClinic.setId(1L);
        testClinic.setName("Test Clinic");
        testClinic.setCode("ABC123");
        testClinic.setOwnerId(1L);
        testClinic.setCreatedAt(LocalDateTime.now());

        testUser = new User();
        testUser.setId(1L);
        testUser.setPhone("0123456789");
        testUser.setFullName("Test User");
        testUser.setAddress("123 Test St");
        testUser.setDateOfBirth(LocalDate.of(1990, 1, 1));

        testMembership = new ClinicMembership();
        testMembership.setId(1L);
        testMembership.setClinicId(1L);
        testMembership.setUserId(1L);
        testMembership.setStatus("accepted");
        testMembership.setRole("owner");
        testMembership.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testJoinClinic_Success() {
        // Arrange
        User newUser = new User();
        newUser.setId(2L);
        newUser.setPhone("0987654321");

        when(clinicRepository.findByCode("ABC123")).thenReturn(Optional.of(testClinic));
        when(membershipRepository.existsByClinicIdAndUserId(1L, 2L)).thenReturn(false);
        when(membershipRepository.save(any(ClinicMembership.class))).thenAnswer(invocation -> {
            ClinicMembership saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        // Act
        ClinicResponse result = clinicService.joinClinic("ABC123", 2L);

        // Assert
        assertNotNull(result);
        assertEquals("Test Clinic", result.getName());
        assertEquals("pending", result.getStatus());
        assertEquals("member", result.getRole());
        verify(clinicRepository, times(1)).findByCode("ABC123");
        verify(membershipRepository, times(1)).save(any(ClinicMembership.class));
    }

    @Test
    void testJoinClinic_AlreadyMember() {
        // Arrange
        when(clinicRepository.findByCode("ABC123")).thenReturn(Optional.of(testClinic));
        when(membershipRepository.existsByClinicIdAndUserId(1L, 2L)).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            clinicService.joinClinic("ABC123", 2L);
        });

        assertEquals("User already has a membership request for this clinic", exception.getMessage());
        verify(membershipRepository, never()).save(any(ClinicMembership.class));
    }

    @Test
    void testJoinClinic_ClinicNotFound() {
        // Arrange
        when(clinicRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            clinicService.joinClinic("INVALID", 2L);
        });

        assertEquals("Clinic not found", exception.getMessage());
        verify(membershipRepository, never()).save(any(ClinicMembership.class));
    }

    @Test
    void testGetClinicMembers_Success() {
        // Arrange
        User member2 = new User();
        member2.setId(2L);
        member2.setPhone("0987654321");
        member2.setFullName("Member Two");
        member2.setAddress("456 Test Ave");
        member2.setDateOfBirth(LocalDate.of(1992, 5, 10));

        ClinicMembership membership2 = new ClinicMembership();
        membership2.setId(2L);
        membership2.setClinicId(1L);
        membership2.setUserId(2L);
        membership2.setStatus("pending");
        membership2.setRole("member");
        membership2.setCreatedAt(LocalDateTime.now());

        when(clinicRepository.findById(1L)).thenReturn(Optional.of(testClinic));
        when(membershipRepository.findByClinicIdAndUserId(1L, 1L)).thenReturn(Optional.of(testMembership));
        when(membershipRepository.findByClinicId(1L)).thenReturn(Arrays.asList(testMembership, membership2));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(member2));

        // Act
        List<ClinicMemberResponse> result = clinicService.getClinicMembers(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test User", result.get(0).getFullName());
        assertEquals("owner", result.get(0).getRole());
        assertEquals("Member Two", result.get(1).getFullName());
        assertEquals("pending", result.get(1).getStatus());
    }

    @Test
    void testUpdateMemberStatus_Success() {
        // Arrange
        ClinicMembership pendingMembership = new ClinicMembership();
        pendingMembership.setId(2L);
        pendingMembership.setClinicId(1L);
        pendingMembership.setUserId(2L);
        pendingMembership.setStatus("pending");
        pendingMembership.setRole("member");

        when(clinicRepository.findById(1L)).thenReturn(Optional.of(testClinic));
        when(membershipRepository.findById(2L)).thenReturn(Optional.of(pendingMembership));
        when(membershipRepository.save(any(ClinicMembership.class))).thenReturn(pendingMembership);

        // Act
        clinicService.updateMemberStatus(1L, 2L, "accepted", 1L);

        // Assert
        assertEquals("accepted", pendingMembership.getStatus());
        verify(membershipRepository, times(1)).save(pendingMembership);
    }

    @Test
    void testUpdateMemberStatus_OnlyOwnerCanUpdate() {
        // Arrange
        Clinic clinic = new Clinic();
        clinic.setId(1L);
        clinic.setOwnerId(1L);

        when(clinicRepository.findById(1L)).thenReturn(Optional.of(clinic));

        // Act & Assert - Non-owner tries to update
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            clinicService.updateMemberStatus(1L, 2L, "accepted", 999L);
        });

        assertEquals("Only the clinic owner can update member status", exception.getMessage());
        verify(membershipRepository, never()).save(any(ClinicMembership.class));
    }
}
